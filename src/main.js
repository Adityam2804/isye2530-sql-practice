import "./styles/app.css";
import { courseDays, dayOrder, CURRENT_DAY_KEY } from "./data/courseDays.js";
import {
  initDatabaseEngine,
  loadDatabase,
  resetDatabase,
  runSql,
  getTables,
  getColumns,
  previewTable,
} from "./db/databaseService.js";
import {
  getSetting,
  setSetting,
  getAnswer,
  setAnswer,
} from "./storage/browserStorage.js";
import { renderApp } from "./ui/appView.js";

const root = document.querySelector("#app");

await initDatabaseEngine();

const initialDayKey = courseDays[CURRENT_DAY_KEY]
  ? CURRENT_DAY_KEY
  : dayOrder[0];
const initialDay = courseDays[initialDayKey];
const savedInitialDomain = getSetting(
  `domain:${initialDayKey}`,
  initialDay.databaseOrder[0],
);
const initialDomainKey = initialDay.databases[savedInitialDomain]
  ? savedInitialDomain
  : initialDay.databaseOrder[0];

const savedInitialQuestion = Number(
  getSetting(`question:${initialDayKey}:${initialDomainKey}`, "0"),
);

const state = {
  // The app always starts on CURRENT_DAY_KEY after a page load. This means a
  // new class can become the default simply by changing CURRENT_DAY_KEY when
  // Day 11, Day 12, etc. is released. Older days remain available if registered.
  dayKey: initialDayKey,
  domainKey: initialDomainKey,
  questionIndex: Number.isFinite(savedInitialQuestion)
    ? savedInitialQuestion
    : 0,
  databasesByScope: new Map(),
  results: [],
  status: "Ready. Write SQL and click Run SQL.",
  statusType: "neutral",
  activeTable: null,
  previewLabel: "",
  syntaxOpen: false,
};

function dayConfig(dayKey = state.dayKey) {
  return courseDays[dayKey];
}

function databaseConfig(dayKey = state.dayKey, domainKey = state.domainKey) {
  return dayConfig(dayKey).databases[domainKey];
}

function dbScopeKey(dayKey = state.dayKey, domainKey = state.domainKey) {
  const day = dayConfig(dayKey);
  return `${dayKey}:${domainKey}:v${day.databaseVersion}`;
}

function getDb(dayKey = state.dayKey, domainKey = state.domainKey) {
  const scopeKey = dbScopeKey(dayKey, domainKey);

  if (!state.databasesByScope.has(scopeKey)) {
    const day = dayConfig(dayKey);
    state.databasesByScope.set(
      scopeKey,
      loadDatabase(
        dayKey,
        domainKey,
        day.databaseVersion,
        day.databases[domainKey],
      ),
    );
  }

  return state.databasesByScope.get(scopeKey);
}

function questions() {
  return dayConfig().buildQuestions(state.domainKey);
}

function normalizeQuestionIndex() {
  const max = questions().length - 1;
  state.questionIndex = Math.max(0, Math.min(state.questionIndex, max));
}

function currentAnswer() {
  const q = questions()[state.questionIndex];
  return getAnswer(state.dayKey, state.domainKey, q.id, q.starterSql);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requiredTablesForQuestion(question, tables) {
  const source = [
    question.title,
    question.prompt,
    question.starterSql,
    question.solutionSql,
  ]
    .filter(Boolean)
    .join("\n");

  return tables.filter((table) =>
    new RegExp(`\\b${escapeRegExp(table)}\\b`, "i").test(source),
  );
}

function questionTablePreviews(db, question, tables) {
  return requiredTablesForQuestion(question, tables).map((table) => {
    const result = previewTable(db, table)[0];

    return {
      name: table,
      columns: result?.columns ?? [],
      values: result?.values ?? [],
    };
  });
}

function snapshot() {
  normalizeQuestionIndex();

  const day = dayConfig();
  const db = getDb();
  const tables = getTables(db);
  const columnsByTable = Object.fromEntries(
    tables.map((table) => [table, getColumns(db, table)]),
  );
  const qList = questions();
  const currentQuestion = qList[state.questionIndex];
  const tablePreviews = questionTablePreviews(db, currentQuestion, tables);

  return {
    dayKey: state.dayKey,
    dayLabel: day.label,
    dayTitle: day.title,
    dayOptions: dayOrder.map((key) => ({
      key,
      label: courseDays[key].label,
      title: courseDays[key].title,
    })),
    databaseVersion: day.databaseVersion,
    domainKey: state.domainKey,
    databases: day.databases,
    databaseOrder: day.databaseOrder,
    questionIndex: state.questionIndex,
    questions: qList,
    answer: currentAnswer(),
    questionTablePreviews: tablePreviews,
    tables,
    columnsByTable,
    status: state.status,
    statusType: state.statusType,
    results: state.results,
    activeTable: state.activeTable,
    previewLabel: state.previewLabel,
    syntaxOpen: state.syntaxOpen,
    syntaxGuide: day.syntaxGuide ?? [],
  };
}

function render() {
  document.body.classList.toggle("modal-open", state.syntaxOpen);
  renderApp(root, snapshot());
  wire();
}

function savedQuestionIndex(dayKey, domainKey) {
  const value = Number(getSetting(`question:${dayKey}:${domainKey}`, "0"));
  return Number.isFinite(value) ? value : 0;
}

function switchDay(nextDayKey) {
  if (!courseDays[nextDayKey] || nextDayKey === state.dayKey) return;

  const nextDay = courseDays[nextDayKey];
  const savedDomain = getSetting(
    `domain:${nextDayKey}`,
    nextDay.databaseOrder[0],
  );
  const nextDomain = nextDay.databases[savedDomain]
    ? savedDomain
    : nextDay.databaseOrder[0];

  state.dayKey = nextDayKey;
  state.domainKey = nextDomain;
  state.questionIndex = savedQuestionIndex(nextDayKey, nextDomain);
  getDb(nextDayKey, nextDomain);
  state.results = [];
  state.status = `${nextDay.label} · ${nextDay.title} loaded.`;
  state.statusType = "neutral";
  state.activeTable = null;
  state.previewLabel = "";
  state.syntaxOpen = false;
  render();
}

function goToQuestion(index) {
  const qList = questions();
  if (index < 0 || index >= qList.length) return;

  state.questionIndex = index;
  state.results = [];
  state.status =
    "Question changed. Your SQL and database are saved automatically.";
  state.statusType = "neutral";
  state.activeTable = null;
  state.previewLabel = "";
  setSetting(`question:${state.dayKey}:${state.domainKey}`, index);
  render();
}

function closeSyntaxGuide() {
  if (!state.syntaxOpen) return;
  state.syntaxOpen = false;
  render();
}

function wire() {
  const editor = document.querySelector("#sqlEditor");
  const copyButton = document.querySelector("[data-copy-solution]");

  editor.addEventListener("input", () => {
    const q = questions()[state.questionIndex];
    setAnswer(state.dayKey, state.domainKey, q.id, editor.value);
  });

  editor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      execute(editor);
    }
  });
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const q = questions()[state.questionIndex];

      try {
        await navigator.clipboard.writeText(q.solutionSql);

        copyButton.textContent = "Copied ✓";

        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1500);
      } catch (error) {
        console.error("Unable to copy solution:", error);
      }
    });
  }

  document
    .querySelector("#runSql")
    .addEventListener("click", () => execute(editor));

  document
    .querySelector("#prevQuestion")
    .addEventListener("click", () => goToQuestion(state.questionIndex - 1));
  document
    .querySelector("#nextQuestion")
    .addEventListener("click", () => goToQuestion(state.questionIndex + 1));

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () =>
      goToQuestion(Number(button.dataset.question)),
    );
  });

  document.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => switchDay(button.dataset.day));
  });

  document.querySelectorAll("[data-domain]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.domain;
      const day = dayConfig();
      if (!day.databases[next] || next === state.domainKey) return;

      state.domainKey = next;
      state.questionIndex = savedQuestionIndex(state.dayKey, next);
      getDb(state.dayKey, next);
      state.results = [];
      state.status = `${day.databases[next].label} database restored from this browser.`;
      state.statusType = "neutral";
      state.activeTable = null;
      state.previewLabel = "";
      setSetting(`domain:${state.dayKey}`, next);
      render();
    });
  });

  document.querySelector("#resetDb").addEventListener("click", () => {
    const day = dayConfig();
    const dbConfig = databaseConfig();
    const confirmed = confirm(
      `Reset the ${dbConfig.label} database for ${day.label}?\n\nThis resets only the database for this day/domain/version. Your saved SQL code will be kept.`,
    );
    if (!confirmed) return;

    const scopeKey = dbScopeKey();
    const freshDb = resetDatabase(
      state.dayKey,
      state.domainKey,
      day.databaseVersion,
      dbConfig,
      getDb(),
    );
    state.databasesByScope.set(scopeKey, freshDb);
    state.results = [];
    state.status = `${day.label} ${dbConfig.label} database restored to canonical v${day.databaseVersion}. Your saved SQL code was kept.`;
    state.statusType = "success";
    state.activeTable = null;
    state.previewLabel = "";
    render();
  });

  document.querySelector("#openSyntaxGuide").addEventListener("click", () => {
    state.syntaxOpen = true;
    render();
  });

  const closeButton = document.querySelector("#closeSyntaxGuide");
  closeButton?.addEventListener("click", closeSyntaxGuide);

  const backdrop = document.querySelector("#syntaxModalBackdrop");
  backdrop?.addEventListener("click", (event) => {
    if (event.target === backdrop) closeSyntaxGuide();
  });

  document.querySelectorAll("[data-table]").forEach((button) => {
    button.addEventListener("click", () => {
      const table = button.dataset.table;
      try {
        state.results = previewTable(getDb(), table);
        state.status = `Showing up to 25 rows from ${table}.`;
        state.statusType = "neutral";
        state.activeTable = table;
        state.previewLabel = `${table} preview`;
      } catch (error) {
        state.results = [];
        state.status = error.message;
        state.statusType = "error";
      }
      render();
    });
  });
}

function execute(editor) {
  const selection = editor.value
    .slice(editor.selectionStart, editor.selectionEnd)
    .trim();
  const sql = selection || editor.value.trim();

  if (!sql) {
    state.results = [];
    state.status = "Write a SQL statement first.";
    state.statusType = "error";
    state.previewLabel = "";
    render();
    return;
  }

  const q = questions()[state.questionIndex];
  setAnswer(state.dayKey, state.domainKey, q.id, editor.value);

  const day = dayConfig();

  try {
    state.results = runSql(
      state.dayKey,
      state.domainKey,
      day.databaseVersion,
      getDb(),
      sql,
    );
    const rowCount = state.results.reduce(
      (sum, result) => sum + result.values.length,
      0,
    );
    state.status = state.results.length
      ? `Query executed successfully. ${rowCount} row(s) returned. Database saved in this browser.`
      : "SQL executed successfully. Database saved in this browser.";
    state.statusType = "success";
    state.previewLabel = "";
    state.activeTable = null;
  } catch (error) {
    state.results = [];
    state.status = `${error.message || String(error)} Database state was saved as executed.`;
    state.statusType = "error";
    state.previewLabel = "";
  }

  render();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.syntaxOpen) closeSyntaxGuide();
});

render();
