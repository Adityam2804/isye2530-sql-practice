import {
  day21RegressionStarter,
  day21TreeStarter,
} from "../data/day21.js";
import { Day21Runner } from "../python/day21Runner.js";
import { getSetting, setSetting } from "../storage/browserStorage.js";
import { handlePythonIndentation } from "./pythonEditorKeys.js";
import { renderDay21Visual } from "./day21Visuals.js";
import "../styles/day21.css";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

function handlePythonCommentToggle(event, editor) {
  const slashKey = event.key === "/" || event.code === "Slash";
  if (
    event.isComposing ||
    !(event.ctrlKey || event.metaKey) ||
    event.altKey ||
    !slashKey
  ) {
    return false;
  }

  event.preventDefault();

  const text = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart =
    start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd =
    end > start && text[end - 1] === "\n" ? end - 1 : end;
  const nextNewline = text.indexOf("\n", effectiveEnd);
  const blockEnd = nextNewline === -1 ? text.length : nextNewline;
  const lines = text.slice(lineStart, blockEnd).split("\n");
  const nonBlank = lines.filter((line) => line.trim().length > 0);
  const shouldUncomment =
    nonBlank.length > 0 && nonBlank.every((line) => /^\s*#/.test(line));

  const updated = lines
    .map((line) => {
      if (!line.trim()) return line;
      return shouldUncomment
        ? line.replace(/^(\s*)# ?/, "$1")
        : line.replace(/^(\s*)/, "$1# ");
    })
    .join("\n");

  editor.setRangeText(updated, lineStart, blockEnd, "select");
  return true;
}

function regressionPreview() {
  const rows = [
    [30, 0.4, 0, 73, 170],
    [14, 1.2, 1, 37, 247],
    [52, 6.3, 0, 28, 313],
    [5, 7.6, 1, 25, 464],
  ];

  return `
    <div class="day21-table-wrap">
      <table class="day21-table">
        <thead>
          <tr>
            <th>week</th>
            <th>flu</th>
            <th>school</th>
            <th>temp</th>
            <th>visits</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row.map((value) => `<td>${esc(value)}</td>`).join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function mountDay21Lab(root, dayOptions, onDay) {
  let mode = getSetting("day21:mode", "tree");
  if (!["tree", "regression"].includes(mode)) mode = "tree";

  let runner = null;
  let ready = false;
  let busy = false;
  let disposed = false;
  let generation = 0;
  let visuals = { tree: null, regression: null };
  let output = { tree: "", regression: "" };

  const starter = () =>
    mode === "tree" ? day21TreeStarter : day21RegressionStarter;

  const codeKey = () => `day21:v3:${mode}:code`;
  const code = () => getSetting(codeKey(), starter());

  function saveCode(value) {
    setSetting(codeKey(), value);
  }

  function setStatus(message, error = false) {
    const node = root.querySelector("#day21Status");
    if (!node) return;
    node.textContent = message;
    node.className = `status ${error ? "error" : "neutral"}`;
  }

  function setControls() {
    root.querySelectorAll("[data-day21-run]").forEach((button) => {
      button.disabled = busy || !ready;
    });
    root.querySelectorAll("[data-day21-reset-runtime]").forEach((button) => {
      button.disabled = busy;
    });
  }

  async function initialize() {
    const ticket = ++generation;
    runner?.stop();
    runner = new Day21Runner();
    ready = false;
    busy = true;
    setControls();
    setStatus("Compiler: Loading…");

    try {
      const result = await runner.request({ type: "init" });
      if (disposed || ticket !== generation) return;
      if (result.error) throw new Error(result.error);
      ready = true;
      setStatus("Compiler: Ready");
    } catch (error) {
      if (!disposed && ticket === generation) {
        setStatus("Compiler: Error", true);
      }
    } finally {
      if (!disposed && ticket === generation) {
        busy = false;
        setControls();
      }
    }
  }

  async function runCurrent() {
    if (busy || !ready) return;

    const editor = root.querySelector("#day21Editor");
    const terminal = root.querySelector("#day21Output");
    if (!editor || !terminal) return;

    const program = editor.value;
    saveCode(program);
    busy = true;
    setControls();
    setStatus("Compiler: Running…");

    try {
      const result = await runner.request({
        type: "run",
        code: program,
        filename: mode === "tree" ? "tree.py" : "regression.py",
        mode,
      });

      if (disposed) return;

      const text = (
        (result.output || "") +
        (result.error ? `\n${result.error}` : "")
      ).trim();

      output[mode] = text;
      terminal.textContent = output[mode];
      visuals[mode] = result.error ? null : result.visual || null;
      renderDay21Visual(root, mode, visuals[mode]);
      setStatus(result.error ? "Compiler: Error" : "Compiler: Ready", !!result.error);
    } catch (error) {
      if (!disposed) {
        output[mode] = error.message || String(error);
        terminal.textContent = output[mode];
        ready = false;
        setStatus("Compiler: Error", true);
      }
    } finally {
      if (!disposed) {
        busy = false;
        setControls();
      }
    }
  }

  function resetCode() {
    saveCode(starter());
    visuals[mode] = null;
    output[mode] = "";
    render();
  }

  function switchMode(nextMode) {
    if (!["tree", "regression"].includes(nextMode) || nextMode === mode) return;

    const editor = root.querySelector("#day21Editor");
    if (editor) saveCode(editor.value);

    mode = nextMode;
    setSetting("day21:mode", mode);
    render();
  }

  function wire() {
    root.querySelectorAll("[data-lab-day]").forEach((button) => {
      button.addEventListener("click", () => onDay(button.dataset.labDay));
    });

    root.querySelectorAll("[data-day21-mode]").forEach((button) => {
      button.addEventListener("click", () =>
        switchMode(button.dataset.day21Mode),
      );
    });

    root.querySelector("[data-day21-run]")?.addEventListener("click", runCurrent);
    root
      .querySelector("[data-day21-reset-code]")
      ?.addEventListener("click", resetCode);
    root
      .querySelector("[data-day21-reset-runtime]")
      ?.addEventListener("click", initialize);

    const editor = root.querySelector("#day21Editor");
    if (editor) {
      editor.addEventListener("input", () => saveCode(editor.value));
      editor.addEventListener("keydown", (event) => {
        if (handlePythonCommentToggle(event, editor)) return;
        handlePythonIndentation(event, editor);
      });
    }

    setControls();
  }

  function render() {
    const isTree = mode === "tree";

    root.innerHTML = `
      <header class="app-header">
        <div class="brand">
          <img src="/assets/rpi_logo.svg" alt="Rensselaer Polytechnic Institute" class="rpi-logo">
          <div class="brand-copy">
            <div class="brand-course">ISYE 2530</div>
            <div class="brand-title">Decision Systems Practice</div>
          </div>
        </div>
        <div class="day-pill">Day 21 · Decision Trees + Regression</div>
      </header>

      <main class="shell day21-lab">
        <section class="toolbar">
          <div class="day-tabs" aria-label="Choose course day">
            ${dayOptions
              .map(
                (day) => `
                  <button data-lab-day="${esc(day.key)}" class="${day.key === "day21" ? "active" : ""}">
                    ${esc(day.label)}
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="day21-mode-tabs" aria-label="Day 21 activity">
          <button data-day21-mode="tree" class="${isTree ? "active" : ""}">
            Decision Tree
          </button>
          <button data-day21-mode="regression" class="${!isTree ? "active" : ""}">
            Multiple Regression
          </button>
        </section>

        <section class="day21-grid">
          <article class="card day21-instructions">
            <h2>${isTree ? "Storm Decision" : "Clinic Visit Forecast"}</h2>

            ${
              isTree
                ? `
                  <ol>
                    <li>At <code>p_close = 0.30</code>, what is the expected cost of waiting?</li>
                    <li>Which decision should Reyes choose?</li>
                    <li>How does the decision change when <code>p_close = 0.10</code>?</li>
                    <li>At what probability does the preferred decision switch?</li>
                  </ol>
                `
                : `
                  ${regressionPreview()}
                  <ol>
                    <li>What are the fitted coefficients for the intercept, <code>flu</code>, and <code>school</code>?</li>
                    <li>How would you interpret the <code>flu</code> and <code>school</code> coefficients?</li>
                    <li>What does the model's R-squared indicate?</li>
                    <li>What visits are forecast for the next two weeks, and how many nurses are needed?</li>
                    <li>How does the held-out regression error compare with the average-week baseline?</li>
                  </ol>
                `
            }
          </article>

          <article class="card day21-code-card">
            <div class="day21-code-toolbar">
              <div>
                <span class="eyebrow">${isTree ? "tree.py" : "regression.py"}</span>
                <h2>Python Editor</h2>
              </div>
              <div class="day21-actions">
                <button class="secondary" data-day21-reset-code>Reset</button>
                <button class="primary" data-day21-run>Run</button>
              </div>
            </div>

            <textarea
              id="day21Editor"
              class="day21-editor"
              spellcheck="false"
              aria-label="Day 21 Python editor"
            >${esc(code())}</textarea>

            <div id="day21Status" class="status neutral" aria-live="polite">${ready ? "Compiler: Ready" : "Compiler: Loading…"}</div>

            <div class="day21-terminal-heading">
              <strong>Output</strong>
              <button class="link-button" data-day21-reset-runtime>Reload</button>
            </div>
            <pre id="day21Output" class="day21-terminal">${esc(output[mode])}</pre>
          </article>

          <article class="card day21-visual-card">
            <div class="day21-visual-heading">
              <div>
                <h2>${isTree ? "Decision Tree" : "Regression Fit"}</h2>
              </div>
            </div>
            <div id="day21VisualSummary"></div>
            <div id="day21ModelPlot" class="day21-model-plot">
              <div class="day21-visual-empty">No results yet.</div>
            </div>
          </article>
        </section>

        <details class="card day21-research">
          <summary>
            <strong>Research Question</strong>
            <span aria-hidden="true">＋</span>
          </summary>
          <div class="day21-research-body">
            <p><strong>Can a regression forecast demand for a nonprofit resource-sharing episode well enough to improve a reserve-now versus wait decision?</strong></p>
            <p>What data would be needed to answer this question?</p>
            <p>How would you test whether the forecast changes the decision or its breakeven?</p>
          </div>
        </details>
      </main>
    `;

    wire();
    renderDay21Visual(root, mode, visuals[mode]);
  }

  render();
  initialize();

  return () => {
    disposed = true;
    generation += 1;
    runner?.stop();
  };
}
