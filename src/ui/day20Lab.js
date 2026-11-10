import {
  defaultTruckLimits,
  pulpReference,
  truckLoads,
  truckStages,
} from "../data/day20.js";
import { getSetting, setSetting } from "../storage/browserStorage.js";
import { handlePythonIndentation } from "./pythonEditorKeys.js";
import "../styles/day20.css";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

function numberSetting(key, fallback) {
  const value = Number(getSetting(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function lectureCode(stageId) {
  let code = pulpReference;

  if (stageId === "volume" || stageId === "need") {
    code = code
      .replace(/^# volume =/m, "volume =")
      .replace(/^#           \"Food Packs\"/m, '            "Food Packs"')
      .replace(/^# model \+= lpSum\(volume\[n\]/m, "model += lpSum(volume[n]");
  }

  if (stageId === "need") {
    code = code.replace(
      /^# model \+= take\[\"Blankets\"\] \+ take\[\"Food Packs\"\] >= 1/m,
      'model += take["Blankets"] + take["Food Packs"] >= 1',
    );
  }

  return code;
}

function activeLine(code, fragment) {
  return code
    .split("\n")
    .some((line) => !line.trimStart().startsWith("#") && line.includes(fragment));
}

function extractLimit(code, fragment, fallback) {
  const line = code
    .split("\n")
    .find((item) => !item.trimStart().startsWith("#") && item.includes(fragment));
  if (!line) return null;
  const match = line.match(/<=\s*([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : fallback;
}

function parseLectureCode(code) {
  const weightLimit = extractLimit(code, "loads[n][0] * take[n]", null);
  if (weightLimit === null) {
    return { error: "Keep the truck weight constraint active in this classroom example." };
  }

  const volumeFirstLine = activeLine(code, "volume = {");
  const volumeSecondLine = activeLine(code, '"Food Packs": 3, "Water": 4}');
  const volumeConstraint = activeLine(code, "lpSum(volume[n] * take[n]");
  const needConstraint = activeLine(
    code,
    'take["Blankets"] + take["Food Packs"] >= 1',
  );

  if (volumeConstraint && !(volumeFirstLine && volumeSecondLine)) {
    return {
      error:
        "NameError: volume is not defined. Uncomment all three volume lines, not only the constraint line.",
    };
  }

  if (needConstraint && !volumeConstraint) {
    return {
      error: "For the lecture sequence, add the volume constraint before the shelter/food need constraint.",
    };
  }

  const volumeLimit = volumeConstraint
    ? extractLimit(code, "lpSum(volume[n] * take[n]", defaultTruckLimits.volume)
    : defaultTruckLimits.volume;

  return {
    stageId: needConstraint ? "need" : volumeConstraint ? "volume" : "weight",
    weight: weightLimit,
    volume: volumeLimit,
  };
}

function handlePythonCommentToggle(event, editor) {
  const slashKey = event.key === "/" || event.code === "Slash";
  if (event.isComposing || !(event.ctrlKey || event.metaKey) || event.altKey || !slashKey) {
    return false;
  }

  event.preventDefault();

  const text = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && text[end - 1] === "\n" ? end - 1 : end;
  const nextNewline = text.indexOf("\n", effectiveEnd);
  const blockEnd = nextNewline === -1 ? text.length : nextNewline;
  const lines = text.slice(lineStart, blockEnd).split("\n");
  const nonBlank = lines.filter((line) => line.trim().length > 0);
  const shouldUncomment =
    nonBlank.length > 0 && nonBlank.every((line) => /^\s*#/.test(line));

  const updatedLines = lines.map((line) => {
    if (!line.trim()) return line;
    return shouldUncomment
      ? line.replace(/^(\s*)# ?/, "$1")
      : line.replace(/^(\s*)/, "$1# ");
  });

  const updated = updatedLines.join("\n");
  editor.setRangeText(updated, lineStart, blockEnd, "select");

  if (start === end) {
    const oldLine = lines[0] ?? "";
    const newLine = updatedLines[0] ?? "";
    const indent = (oldLine.match(/^\s*/) ?? [""])[0].length;
    const markerLength = (oldLine.slice(indent).match(/^# ?/) ?? [""])[0].length;
    let caret = start;

    if (shouldUncomment && caret > lineStart + indent) {
      caret = Math.max(lineStart + indent, caret - markerLength);
    } else if (!shouldUncomment && caret >= lineStart + indent) {
      caret += newLine.length - oldLine.length;
    }

    editor.setSelectionRange(caret, caret);
  }

  return true;
}

function pythonList(items) {
  return `[${items.map((item) => `'${item.name}'`).join(", ")}]`;
}

function updateConstraintLimit(code, fragment, value) {
  return code
    .split("\n")
    .map((line) => {
      if (!line.includes(fragment)) return line;
      return line.replace(/<=\s*[0-9]+(?:\.[0-9]+)?/, `<= ${value}`);
    })
    .join("\n");
}

function solveTruck({ weight, volume, useVolume, requireNeed }) {
  let best = null;
  const feasible = [];
  const totalCombinations = 2 ** truckLoads.length;

  for (let mask = 0; mask < totalCombinations; mask += 1) {
    const chosen = truckLoads.filter((_, index) => mask & (1 << index));
    const usedWeight = chosen.reduce((sum, item) => sum + item.kg, 0);
    const usedVolume = chosen.reduce((sum, item) => sum + item.m3, 0);
    const points = chosen.reduce((sum, item) => sum + item.points, 0);
    const meetsNeed = chosen.some(
      (item) => item.name === "Blankets" || item.name === "Food Packs",
    );

    if (usedWeight > weight) continue;
    if (useVolume && usedVolume > volume) continue;
    if (requireNeed && !meetsNeed) continue;

    const candidate = { chosen, usedWeight, usedVolume, points, meetsNeed };
    feasible.push(candidate);

    if (
      !best ||
      candidate.points > best.points ||
      (candidate.points === best.points && candidate.usedWeight < best.usedWeight) ||
      (candidate.points === best.points &&
        candidate.usedWeight === best.usedWeight &&
        candidate.usedVolume < best.usedVolume)
    ) {
      best = candidate;
    }
  }

  return {
    best: best ?? {
      chosen: [],
      usedWeight: 0,
      usedVolume: 0,
      points: 0,
      meetsNeed: false,
    },
    feasibleCount: feasible.length,
    totalCombinations,
  };
}

function selectedLoadHtml(result) {
  if (!result.chosen.length) {
    return '<p class="day20-empty">No feasible load under the current limits.</p>';
  }

  return `
    <div class="day20-load-chips">
      ${result.chosen
        .map(
          (item) => `
            <span class="day20-load-chip">
              <strong>${esc(item.name)}</strong>
              <small>${item.kg} kg · ${item.m3} m³ · ${item.points} pts</small>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function loadTableHtml(result) {
  const chosen = new Set(result.chosen.map((item) => item.name));

  return `
    <div class="day20-table-wrap">
      <table class="day20-load-table">
        <thead>
          <tr>
            <th>Take?</th>
            <th>Load</th>
            <th>Weight</th>
            <th>Volume</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${truckLoads
            .map(
              (item) => `
                <tr class="${chosen.has(item.name) ? "selected" : ""}">
                  <td>${chosen.has(item.name) ? "✓" : "—"}</td>
                  <td><strong>${esc(item.name)}</strong></td>
                  <td>${item.kg} kg</td>
                  <td>${item.m3} m³</td>
                  <td>${item.points}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function constraintHtml(stage, limits, result) {
  const rows = [
    {
      active: true,
      name: "Weight",
      expression: `used ${result.usedWeight} kg ≤ ${limits.weight} kg`,
    },
    {
      active: stage.useVolume,
      name: "Volume",
      expression: stage.useVolume
        ? `used ${result.usedVolume} m³ ≤ ${limits.volume} m³`
        : "not active in Stage 1",
    },
    {
      active: stage.requireNeed,
      name: "Shelter / food need",
      expression: stage.requireNeed
        ? `Blankets + Food Packs ≥ 1 · ${result.meetsNeed ? "satisfied" : "not satisfied"}`
        : "not active until Stage 3",
    },
  ];

  return rows
    .map(
      (row) => `
        <li class="${row.active ? "active" : "inactive"}">
          <span class="day20-constraint-dot" aria-hidden="true"></span>
          <div>
            <strong>${esc(row.name)}</strong>
            <span>${esc(row.expression)}</span>
          </div>
        </li>
      `,
    )
    .join("");
}

export function mountDay20Lab(root, dayOptions, onDay) {
  let stageId = getSetting("day20:stage", "weight");
  let weight = numberSetting("day20:weight", defaultTruckLimits.weight);
  let volume = numberSetting("day20:volume", defaultTruckLimits.volume);
  let codeText = getSetting("day20:code", lectureCode(stageId));
  let codeOutput = getSetting("day20:output", "Ready. Run the base model to reproduce the lecture result.");
  let codeError = "";

  if (!truckStages.some((stage) => stage.id === stageId)) stageId = "weight";

  const stage = () => truckStages.find((item) => item.id === stageId) ?? truckStages[0];

  function save() {
    setSetting("day20:stage", stageId);
    setSetting("day20:weight", weight);
    setSetting("day20:volume", volume);
    setSetting("day20:code", codeText);
    setSetting("day20:output", codeOutput);
  }

  function reset() {
    stageId = "weight";
    weight = defaultTruckLimits.weight;
    volume = defaultTruckLimits.volume;
    codeText = lectureCode("weight");
    codeOutput = "Ready. Run the base model to reproduce the lecture result.";
    codeError = "";
    save();
    render();
  }

  function runLiveCode() {
    const parsed = parseLectureCode(codeText);

    if (parsed.error) {
      codeError = parsed.error;
      codeOutput = "Model did not run.";
      save();
      render();
      return;
    }

    codeError = "";
    stageId = parsed.stageId;
    weight = parsed.weight;
    volume = parsed.volume;

    const activeStage = truckStages.find((item) => item.id === stageId) ?? truckStages[0];
    const solved = solveTruck({
      weight,
      volume,
      useVolume: activeStage.useVolume,
      requireNeed: activeStage.requireNeed,
    });

    codeOutput = `Optimal ${pythonList(solved.best.chosen)} ${solved.best.points.toFixed(1)}`;
    save();
    render();
  }

  function render() {
    const activeStage = stage();
    const solved = solveTruck({
      weight,
      volume,
      useVolume: activeStage.useVolume,
      requireNeed: activeStage.requireNeed,
    });
    const result = solved.best;
    const isLectureDefault =
      weight === defaultTruckLimits.weight &&
      volume === defaultTruckLimits.volume;
    const matchesExpected = result.points === activeStage.expected;

    root.innerHTML = `
      <header class="app-header">
        <div class="brand">
          <img src="/assets/rpi_logo.svg" alt="Rensselaer Polytechnic Institute" class="rpi-logo">
          <div class="brand-copy">
            <div class="brand-course">ISYE 2530</div>
            <div class="brand-title">Decision Systems Practice</div>
          </div>
        </div>
        <div class="day-pill">Day 20 · Binary Optimization</div>
      </header>

      <main class="shell day20-lab">
        <section class="toolbar">
          <div class="day-tabs" aria-label="Choose course day">
            ${dayOptions
              .map(
                (day) => `
                  <button data-lab-day="${esc(day.key)}" class="${day.key === "day20" ? "active" : ""}">
                    ${esc(day.label)}
                  </button>
                `,
              )
              .join("")}
          </div>
          <span class="database-note">Live decision-model demonstration · Ellis's truck</span>
        </section>

        <section class="card day20-intro">
          <div>
            <span class="eyebrow">One model, three stages</span>
            <h1>Which relief supplies should Ellis load?</h1>
            <p>
              Choose a lecture stage, then change the limits. The objective is to maximize points while
              respecting the active constraints.
            </p>
          </div>
          <button id="day20Reset" class="outline">Reset lecture defaults</button>
        </section>

        <section class="card day20-live-code">
          <div class="card-header">
            <div>
              <strong>Live coding: truck.py</strong>
              <span>Delete the # comments exactly as Prof. Trapp does in class, then run the model</span>
            </div>
            <div class="day20-code-actions">
              <button id="day20RunCode" class="primary">▶ Run Model</button>
              <button id="day20ResetCode" class="outline">Reset code</button>
            </div>
          </div>

          <div class="day20-live-grid">
            <div class="day20-editor-wrap">
              <textarea id="day20Editor" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Editable truck.py code">${esc(codeText)}</textarea>
              <p class="day20-editor-note">
                <strong>Shortcuts:</strong> Ctrl+/ comment/uncomment · Tab indent · Shift+Tab outdent.
                Select multiple lines to apply the shortcut to the whole selection.
              </p>
            </div>

            <aside class="day20-terminal">
              <div class="day20-terminal-title">Terminal output</div>
              <pre>${esc(codeError || codeOutput)}</pre>
              <ol>
                <li><strong>Base model:</strong> run as written → 160</li>
                <li><strong>Stage 2:</strong> uncomment all three volume lines → 150</li>
                <li><strong>Stage 3:</strong> uncomment the need line → 140</li>
              </ol>
              ${codeError ? `<p class="day20-code-error">${esc(codeError)}</p>` : ""}
            </aside>
          </div>
        </section>

        <section class="day20-stage-grid" aria-label="Lecture stages">
          ${truckStages
            .map(
              (item) => `
                <button
                  class="day20-stage ${item.id === stageId ? "active" : ""}"
                  data-day20-stage="${item.id}"
                  aria-pressed="${item.id === stageId}"
                >
                  <span class="day20-stage-number">${item.number}</span>
                  <span>
                    <strong>${esc(item.label)}</strong>
                    <small>${esc(item.description)}</small>
                  </span>
                  <b>${item.expected} pts</b>
                </button>
              `,
            )
            .join("")}
        </section>

        <section class="day20-grid">
          <section class="card day20-controls">
            <div class="card-header">
              <strong>What-if controls</strong>
              <span>Change a limit and the model resolves immediately</span>
            </div>

            <div class="day20-control-body">
              <label for="day20Weight">
                <span><strong>Weight limit</strong><output id="day20WeightValue">${weight} kg</output></span>
                <input id="day20Weight" type="range" min="600" max="1300" step="50" value="${weight}">
              </label>

              <label for="day20Volume" class="${activeStage.useVolume ? "" : "disabled"}">
                <span><strong>Volume limit</strong><output id="day20VolumeValue">${volume} m³</output></span>
                <input
                  id="day20Volume"
                  type="range"
                  min="6"
                  max="13"
                  step="1"
                  value="${volume}"
                  ${activeStage.useVolume ? "" : "disabled"}
                >
              </label>

              <div class="day20-stage-note">
                <strong>${esc(activeStage.short)}</strong>
                <span>${esc(activeStage.description)}</span>
              </div>
            </div>
          </section>

          <section class="card day20-answer">
            <div class="card-header">
              <strong>Optimal decision</strong>
              <span>${solved.feasibleCount} of ${solved.totalCombinations} possible loads are feasible</span>
            </div>
            <div class="day20-answer-body">
              <div class="day20-metric">
                <span>Total points</span>
                <strong>${result.points}</strong>
                ${
                  isLectureDefault
                    ? `<small class="${matchesExpected ? "match" : ""}">Lecture value: ${activeStage.expected}</small>`
                    : "<small>What-if result</small>"
                }
              </div>
              <div class="day20-chosen">
                <h2>Take</h2>
                ${selectedLoadHtml(result)}
              </div>
            </div>
          </section>
        </section>

        <section class="day20-grid day20-evidence-grid">
          <section class="card">
            <div class="card-header">
              <strong>Active constraints</strong>
              <span>Why this load is feasible</span>
            </div>
            <ul class="day20-constraints">
              ${constraintHtml(activeStage, { weight, volume }, result)}
            </ul>
          </section>

          <section class="card">
            <div class="card-header">
              <strong>Evidence: all load options</strong>
              <span>Selected rows are highlighted</span>
            </div>
            ${loadTableHtml(result)}
          </section>
        </section>

        <section class="card day20-progression">
          <div class="card-header">
            <strong>Lecture progression at the default limits</strong>
            <span>Same three outcomes as the PuLP/CBC script</span>
          </div>
          <div class="day20-progress-row">
            <div><b>1</b><span>Weight only</span><strong>160</strong></div>
            <i>→</i>
            <div><b>2</b><span>+ Volume ≤ 10 m³</span><strong>150</strong></div>
            <i>→</i>
            <div><b>3</b><span>+ Blankets or Food Packs</span><strong>140</strong></div>
          </div>
        </section>

        <details class="card day20-code">
          <summary>Show the equivalent PuLP model from the lecture</summary>
          <p>
            The classroom script solves this formulation with PuLP/CBC. The website uses the same five binary
            choices and checks all 32 possible loads in the browser, so no solver installation is required here.
          </p>
          <pre><code>${esc(pulpReference)}</code></pre>
        </details>

        <p class="python-note">
          Decision-system idea: inputs and constraints define the feasible choices; the optimization rule chooses
          the feasible load with the highest points. The points are Ellis's judgment and the model plans one trip.
        </p>
      </main>

      <footer>Day 20 · Inputs → Constraints → Optimize → Explain the decision</footer>
    `;

    root.querySelectorAll("[data-lab-day]").forEach((button) => {
      button.onclick = () => onDay(button.dataset.labDay);
    });

    root.querySelectorAll("[data-day20-stage]").forEach((button) => {
      button.onclick = () => {
        stageId = button.dataset.day20Stage;
        weight = defaultTruckLimits.weight;
        volume = defaultTruckLimits.volume;
        codeText = lectureCode(stageId);
        codeOutput = `Loaded Stage ${truckStages.find((item) => item.id === stageId)?.number ?? 1}. Click Run Model.`;
        codeError = "";
        save();
        render();
      };
    });

    root.querySelector("#day20Reset").onclick = reset;

    root.querySelector("#day20RunCode").onclick = () => {
      codeText = root.querySelector("#day20Editor").value;
      runLiveCode();
    };

    root.querySelector("#day20ResetCode").onclick = () => {
      codeText = lectureCode("weight");
      stageId = "weight";
      weight = defaultTruckLimits.weight;
      volume = defaultTruckLimits.volume;
      codeOutput = "Ready. Run the base model to reproduce the lecture result.";
      codeError = "";
      save();
      render();
    };

    const day20Editor = root.querySelector("#day20Editor");

    day20Editor.onkeydown = (event) => {
      const handled =
        handlePythonCommentToggle(event, day20Editor) ||
        handlePythonIndentation(event, day20Editor);

      if (handled) {
        codeText = day20Editor.value;
        setSetting("day20:code", codeText);
      }
    };

    day20Editor.oninput = (event) => {
      codeText = event.target.value;
      setSetting("day20:code", codeText);
    };

    root.querySelector("#day20Weight").oninput = (event) => {
      weight = Number(event.target.value);
      codeText = updateConstraintLimit(codeText, "loads[n][0] * take[n]", weight);
      codeOutput = "What-if limit changed. Click Run Model to refresh terminal output.";
      save();
      render();
    };

    const volumeInput = root.querySelector("#day20Volume");
    if (volumeInput) {
      volumeInput.oninput = (event) => {
        volume = Number(event.target.value);
        codeText = updateConstraintLimit(codeText, "lpSum(volume[n] * take[n]", volume);
        codeOutput = "What-if limit changed. Click Run Model to refresh terminal output.";
        save();
        render();
      };
    }
  }

  render();
  return () => {};
}
