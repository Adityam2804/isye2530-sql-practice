import { renderSyntaxModal } from "./syntaxModal.js";

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[ch],
  );
}

function renderQuestionBody(question) {
  let html = `<p class="question-prompt">${esc(question.prompt)}</p>`;

  if (question.details) {
    html += `
      <div class="definition-grid">
        ${question.details
          .map(
            ([name, type, rule]) => `
          <div><code>${esc(name)}</code><span>${esc(type)}</span><strong>${esc(rule)}</strong></div>
        `,
          )
          .join("")}
      </div>`;
  }

  if (question.examples) {
    html += `<div class="examples">${question.examples.map((x) => `<code>${esc(x)}</code>`).join("")}</div>`;
  }

  return html;
}

function renderResults(results) {
  if (!results?.length) return "";

  return results
    .map(
      (result, i) => `
    <div class="result-block">
      ${results.length > 1 ? `<div class="result-label">Result ${i + 1}</div>` : ""}
      <div class="table-wrap">
        <table>
          <thead><tr>${result.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>
            ${
              result.values.length
                ? result.values
                    .map(
                      (row) =>
                        `<tr>${row.map((v) => `<td>${v === null ? "<em>NULL</em>" : esc(v)}</td>`).join("")}</tr>`,
                    )
                    .join("")
                : `<tr><td colspan="${Math.max(1, result.columns.length)}">0 rows</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderDatabasePanel(tables, columnsByTable, activeTable) {
  return `
    <div class="db-summary">
      <strong>${tables.length}</strong>
      <span>tables in current database</span>
    </div>
    <div class="table-list">
      ${tables
        .map(
          (table) => `
        <button class="table-card ${activeTable === table ? "active" : ""}" data-table="${esc(table)}">
          <div class="table-name">${esc(table)}</div>
          <div class="column-list">
            ${(columnsByTable[table] ?? [])
              .map(
                (col) =>
                  `<span>${esc(col.name)} <small>${esc(col.type)}${col.pk ? " · PK" : ""}</small></span>`,
              )
              .join("")}
          </div>
          <div class="preview-text">Preview rows →</div>
        </button>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderDayTabs(dayOptions, dayKey) {
  if (dayOptions.length <= 1) return "";

  return `
    <div class="day-tabs" aria-label="Choose course day">
      ${dayOptions
        .map(
          (day) => `
            <button data-day="${esc(day.key)}" class="${day.key === dayKey ? "active" : ""}">
              ${esc(day.label)}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderApp(root, model) {
  const {
    dayKey,
    dayLabel,
    dayTitle,
    dayOptions,
    databaseVersion,
    domainKey,
    databases,
    databaseOrder,
    questionIndex,
    questions,
    answer,
    tables,
    columnsByTable,
    status,
    statusType,
    results,
    activeTable,
    previewLabel,
    syntaxOpen,
    syntaxGuide,
  } = model;

  const q = questions[questionIndex];

  root.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <img
          src="/assets/rpi_logo.svg"
          alt="Rensselaer Polytechnic Institute"
          class="rpi-logo"
        />
        <div class="brand-copy">
          <div class="brand-course">ISYE 2530</div>
          <div class="brand-title">SQL Practice</div>
        </div>
      </div>
      <div class="day-pill">${esc(dayLabel)} · ${esc(dayTitle)}</div>
    </header>

    <main class="shell">
      <section class="toolbar">
        <div class="toolbar-left">
          ${renderDayTabs(dayOptions, dayKey)}
          <div class="domain-tabs" aria-label="Choose database domain">
            ${databaseOrder
              .map(
                (key) => `
              <button data-domain="${key}" class="${key === domainKey ? "active" : ""}">
                ${esc(databases[key].label)}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
        <div class="toolbar-actions">
          <button id="openSyntaxGuide" class="outline syntax-guide-button">Syntax Guide</button>
          <button id="resetDb" class="outline danger">Reset Database</button>
        </div>
      </section>

      <section class="question-nav card">
        <div class="question-nav-top">
          <div>
            <span class="eyebrow">Questions</span>
            <h1>${esc(q.title)}</h1>
          </div>
          <div class="question-count">Question ${questionIndex + 1} of ${questions.length}</div>
        </div>

        <div class="pagination" aria-label="Question pagination">
          ${questions
            .map(
              (item, idx) => `
            <button
              data-question="${idx}"
              class="${idx === questionIndex ? "current" : ""}"
              title="${esc(item.title)}"
              aria-label="Question ${idx + 1}: ${esc(item.title)}"
            >${idx + 1}</button>
          `,
            )
            .join("")}
        </div>

        <div class="question-content">
          <div class="question-topic">${esc(q.topic)}</div>
          ${renderQuestionBody(q)}

       <details class="hint">
  <summary>Show Solution</summary>

  <div class="solution-header">
    <span>Solution</span>

    <button
      type="button"
      class="copy-solution-btn"
      data-copy-solution
    >
      Copy
    </button>
  </div>

  <pre class="solution-code"><code>${esc(q.solutionSql)}</code></pre>
</details>
        </div>

        <div class="question-buttons">
          <button id="prevQuestion" class="outline" ${questionIndex === 0 ? "disabled" : ""}>← Previous</button>
          <button id="nextQuestion" class="solid" ${questionIndex === questions.length - 1 ? "disabled" : ""}>Next →</button>
        </div>
      </section>

      <section class="work-grid">
        <section class="editor card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Workspace</span>
              <strong>SQL Editor</strong>
            </div>
            <span class="shortcut">Ctrl/⌘ + Enter</span>
          </div>

          <textarea id="sqlEditor" spellcheck="false">${esc(answer)}</textarea>

          <div class="editor-footer">
            <span>Code and database changes are saved automatically in this browser for ${esc(dayLabel)}.</span>
            <button id="runSql" class="run">▶ Run SQL</button>
          </div>
        </section>

        <aside class="database card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Database</span>
              <strong>${esc(databases[domainKey].label)}</strong>
            </div>
            <span class="database-note">${esc(dayLabel)} · DB v${databaseVersion}</span>
          </div>

          <div class="database-content">
            ${renderDatabasePanel(tables, columnsByTable, activeTable)}
          </div>
        </aside>
      </section>

      <section class="results card">
        <div class="card-header">
          <div>
            <span class="eyebrow">Output</span>
            <strong>${previewLabel ? esc(previewLabel) : "Results"}</strong>
          </div>
          <span class="status-light ${statusType}"></span>
        </div>

        <div class="status ${statusType}">${esc(status)}</div>
        ${renderResults(results)}
      </section>
    </main>

    <footer>
      SQL code and database state are stored in this browser by day and domain. A new course day uses its own canonical database.
    </footer>

    ${syntaxOpen ? renderSyntaxModal(syntaxGuide, dayLabel) : ""}
  `;
}
