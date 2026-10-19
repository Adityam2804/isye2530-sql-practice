import { day15Exercises, requestsCsv } from '../data/day15.js';
import { PythonRunner } from '../python/pythonRunner.js';
import { handlePythonIndentation } from './pythonEditorKeys.js';
import { getAnswer, setAnswer, getSetting, setSetting } from '../storage/browserStorage.js';
import '../styles/day15.css';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
function tableHtml(table) {
  return `<div class="table-wrap"><table><thead><tr>${table.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${table.values.length ? table.values.map(row => `<tr>${row.map(v => `<td>${v === null ? '<em>NULL</em>' : `<code>${esc(typeof v === 'string' ? JSON.stringify(v) : v)}</code>`}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${table.columns.length}">0 rows</td></tr>`}</tbody></table></div>`;
}
export function mountDay15Lab(root, dayOptions, onDay) {
  const savedId = getSetting('day15:exercise-id', 'python-query');
  let index = Math.max(0, day15Exercises.findIndex(exercise => exercise.id === savedId));
  let runner, ready = false, busy = false, disposed = false, generation = 0, tables = [];
  const question = () => day15Exercises[index];
  // Practice starters get their own scope so previously cached complete examples
  // cannot replace the new TODOs. Earlier saved work remains stored separately.
  const answerDomain = () => question().mode !== 'demo' ? 'humanitarian-practice-v2' : 'humanitarian';
  const code = () => getAnswer('day15', answerDomain(), question().id, question().starter);
  const save = value => setAnswer('day15', answerDomain(), question().id, value);
  const status = (message, error = false) => {
    const node = root.querySelector('#pythonStatus');
    if (node) { node.textContent = message; node.className = `status ${error ? 'error' : 'neutral'}`; }
  };
  function controls() {
    root.querySelectorAll('[data-python-run]').forEach(button => { button.disabled = busy || !ready; });
    root.querySelector('#stopPython').disabled = !busy;
    root.querySelector('#runPython').textContent = busy ? 'Running…' : '▶ Run Python';
  }
  function previews() {
    const node = root.querySelector('#pythonTables');
    if (node) node.innerHTML = tables.filter(t => question().tables.includes(t.name)).map(t => `<h3>${esc(t.name)}</h3>${tableHtml(t)}`).join('') || '<p>Tables appear when Python finishes loading.</p>';
  }
  async function initialize() {
    const ticket = ++generation;
    runner?.stop();
    runner = new PythonRunner();
    ready = false; busy = true; tables = []; previews(); controls();
    status('Loading Python and SQLite. The first download may take a moment…');
    try {
      const result = await runner.request({ type: 'init', preload: question().preload });
      if (disposed || ticket !== generation) return;
      if (result.error) throw new Error(result.error);
      tables = result.tables; ready = true;
      status('Ready. Predict the output, then run. Database changes last until Reset Example or leaving this exercise.');
      previews();
    } catch (error) {
      if (!disposed && ticket === generation) status(`${error.message} Reset Example to retry.`, true);
    } finally {
      if (!disposed && ticket === generation) { busy = false; controls(); }
    }
  }
  async function run(source, sql = false) {
    if (busy || !ready) return;
    const ticket = generation;
    const editor = root.querySelector('#pythonEditor');
    save(editor.value);
    busy = true; controls(); status('Running… (pandas downloads on its first import).');
    try {
      let program = source;
      if (sql) program = `import sqlite3\n_sql_con = sqlite3.connect("relief.db")\n_sql_cur = _sql_con.execute(${JSON.stringify(source)})\n_sql_result = (_sql_cur.description, _sql_cur.fetchall())\n_sql_con.close()\nprint(_sql_result)`;
      const result = await runner.request({ type: 'run', code: program });
      if (disposed || ticket !== generation) return;
      const output = root.querySelector('#pythonOutput');
      output.textContent = (result.output || '') + (result.error ? '\n' + result.error : '') || 'Finished. No printed output.';
      if (result.tables) { tables = result.tables; previews(); }
      status(result.error ? 'Python reported an error. Read the output, edit the code, and try again.' : 'Finished. The output below is from your code.', !!result.error);
      // SQL comparison uses SQLite through Python, returning a real table below.
      if (sql && !result.error) {
        const parsed = await runner.request({ type: 'run', code: 'import json\nprint(json.dumps({"columns": [c[0] for c in _sql_result[0]], "values": _sql_result[1]}))' });
        if (disposed || ticket !== generation) return;
        if (parsed.error) throw new Error(parsed.error);
        root.querySelector('#sqlComparisonResult').innerHTML = tableHtml(JSON.parse(parsed.output));
      }
    } catch (error) {
      if (!disposed && ticket === generation) { ready = false; status(error.message, true); }
    } finally {
      if (!disposed && ticket === generation) { busy = false; controls(); }
    }
  }
  function render() {
    const q = question();
    root.innerHTML = `
      <header class="app-header"><div class="brand"><img src="/assets/rpi_logo.svg" alt="Rensselaer Polytechnic Institute" class="rpi-logo"><div class="brand-copy"><div class="brand-course">ISYE 2530</div><div class="brand-title">SQL Practice</div></div></div><div class="day-pill">Day 15 · Working with the Database from Code</div></header>
      <main class="shell day15-lab">
        <section class="toolbar"><div class="day-tabs" aria-label="Choose course day">${dayOptions.map(d => `<button data-lab-day="${esc(d.key)}" class="${d.key === 'day15' ? 'active' : ''}">${esc(d.label)}</button>`).join('')}</div><span class="database-note">30-minute guided lab · Humanitarian Operations</span></section>
        <section class="card question-nav"><div class="question-nav-top"><div><span class="eyebrow">Day 15 · ${q.time} · ${q.mode === 'demo' ? 'Demonstration' : q.mode === 'debug' ? 'Debugging task' : 'Complete the code'}</span><h1>${index + 1}. ${esc(q.title)}</h1></div><div class="question-count">Question ${index + 1} of ${day15Exercises.length}</div></div>
        <div class="pagination" aria-label="Choose question">${day15Exercises.map((x, i) => `<button data-exercise="${i}" class="${i === index ? 'current' : ''}" title="${esc(x.title)}" aria-label="Question ${i + 1}: ${esc(x.title)}">${i + 1}</button>`).join('')}</div>
        <div class="question-content"><p class="question-prompt">${esc(q.prompt)}</p><p><strong>Expected result:</strong> ${esc(q.expected)}</p><p class="python-prediction"><strong>Predict before running:</strong> ${esc(q.prediction)}</p>
        <details class="question-tables"><summary>Show Tables for this exercise</summary><p>Committed rows, read through a separate connection. Quotation marks make blank strings and trailing spaces visible.</p><div id="pythonTables"></div></details>
        ${q.csv ? `<details class="question-tables"><summary>Show CSV · 16 input records</summary><p>Original values are preserved, including the repeated R007, trailing space, and blank category.</p><pre class="python-csv">${esc(requestsCsv)}</pre><button id="downloadCsv" class="outline">Download CSV</button></details>` : ''}
        <details class="hint"><summary>Show Solution</summary><p>${esc(q.explanation)}</p><button id="loadPythonSolution" class="outline">Load solution into editor</button><pre class="solution-code"><code>${esc(q.solution)}</code></pre></details></div>
        <div class="question-buttons"><button id="pythonPrev" class="outline" ${index === 0 ? 'disabled' : ''}>← Previous</button><button id="pythonNext" class="solid" ${index === day15Exercises.length - 1 ? 'disabled' : ''}>Next →</button></div></section>
        ${q.comparisonSql ? `<section class="card python-comparison"><label for="sqlComparison"><strong>SQL comparison</strong></label><textarea id="sqlComparison" spellcheck="false">${esc(q.comparisonSql)}</textarea><button id="runComparison" class="outline" data-python-run>Run SQL comparison</button><div id="sqlComparisonResult"></div></section>` : ''}
        <section class="work-grid python-work-grid"><section class="editor card"><div class="card-header"><strong>Python Editor</strong><span class="shortcut">Ctrl/⌘ + Enter: Run · Tab / Shift+Tab: Indent</span></div><label class="sr-only" for="pythonEditor">Python program. Enter preserves indentation and adds four spaces after a block colon. Tab indents; Shift+Tab unindents.</label><textarea id="pythonEditor" spellcheck="false">${esc(code())}</textarea>
        <div class="python-snippets">${(q.snippets || []).map((x, i) => `<button class="outline" data-snippet="${i}">Load: ${esc(x.label)}</button>`).join('')}</div>
        <div class="editor-footer"><button id="resetPython" class="outline">Reset Example</button><button id="stopPython" class="outline danger">Stop</button><button id="runPython" class="run" data-python-run>▶ Run Python</button></div>
        ${q.actions ? `<div class="python-actions"><p>Run these steps in order. Use Read B again after Commit A.</p>${q.actions.map((x, i) => `<button class="outline" data-action="${i}" data-python-run>${esc(x.label)}</button>`).join('')}</div>` : ''}
        </section><section class="results card"><div class="card-header"><strong>Python Output</strong><span>Actual results and errors</span></div><div id="pythonStatus" class="status" role="status" aria-live="polite"></div><pre id="pythonOutput" class="python-output" tabindex="0" aria-label="Python output">Run the code to see its output.</pre></section></section>
        <p class="python-note">Questions 1–2 are demonstrations. For questions 3–11, write your code below each TODO comment; question 12 is a debugging task. Code is saved in this browser per question. Reset Example restores its code and practice data. Switching exercises starts fresh data; questions 10 and 11 start with the imported requests. Open Day 15 before class to load Python, and run question 11 once to load pandas.</p>
      </main><footer>Day 15 · Predict → Run → Explain</footer>`;
    root.querySelectorAll('[data-lab-day]').forEach(button => button.onclick = () => onDay(button.dataset.labDay));
    root.querySelectorAll('[data-exercise]').forEach(button => button.onclick = () => choose(Number(button.dataset.exercise)));
    root.querySelector('#pythonPrev').onclick = () => choose(index - 1);
    root.querySelector('#pythonNext').onclick = () => choose(index + 1);
    const editor = root.querySelector('#pythonEditor');
    editor.oninput = () => save(editor.value);
    function runEditor() {
      const selection = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
      run(selection || editor.value);
    }
    editor.onkeydown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runEditor(); }
      if (handlePythonIndentation(event, editor)) save(editor.value);
    };
    root.querySelector('#runPython').onclick = runEditor;
    root.querySelector('#stopPython').onclick = () => {
      ++generation; runner?.stop(); busy = false; ready = false; controls(); status('Stopped. Reset Example to restore the practice data and restart Python.');
    };
    root.querySelector('#resetPython').onclick = () => {
      save(q.starter); editor.value = q.starter;
      root.querySelector('#pythonOutput').textContent = 'Example reset.';
      const comparison = root.querySelector('#sqlComparisonResult');
      if (comparison) comparison.innerHTML = '';
      initialize();
    };
    root.querySelector('#loadPythonSolution').onclick = () => { editor.value = q.solution; save(editor.value); editor.focus(); };
    root.querySelectorAll('[data-snippet]').forEach(button => button.onclick = () => { editor.value = q.snippets[Number(button.dataset.snippet)].code; save(editor.value); editor.focus(); });
    root.querySelectorAll('[data-action]').forEach(button => button.onclick = () => run(q.actions[Number(button.dataset.action)].code));
    root.querySelector('#runComparison')?.addEventListener('click', () => run(root.querySelector('#sqlComparison').value, true));
    root.querySelector('#downloadCsv')?.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([requestsCsv], { type: 'text/csv' }));
      const link = document.createElement('a'); link.href = url; link.download = 'camp_requests.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    initialize();
  }
  function choose(next) {
    if (next < 0 || next >= day15Exercises.length || next === index) return;
    save(root.querySelector('#pythonEditor').value);
    ++generation; runner?.stop(); index = next; setSetting('day15:exercise-id', question().id); render();
  }
  render();
  return () => { disposed = true; ++generation; runner?.stop(); };
}
