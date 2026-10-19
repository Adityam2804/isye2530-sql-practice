import { reliefSql, requestsSql, requestsCsv } from '../data/day15.js';

// Pinned runtime. Keep Python off the UI thread; Stop terminates this worker.
const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let runtime;
let namespace;
let output = '';
const limit = 60000;
function append(line) {
  if (output.length < limit) output += line + '\n';
}
async function engine() {
  if (!runtime) {
    const { loadPyodide } = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
    runtime = await loadPyodide({ indexURL, stdout: append, stderr: append });
    await runtime.loadPackage('sqlite3');
  }
  return runtime;
}
const setup = `
import sqlite3, os, csv, io
for name in os.listdir('/home/pyodide'):
    if name.endswith(('.db', '.db-journal', '.db-wal', '.db-shm')):
        os.remove('/home/pyodide/' + name)
con = sqlite3.connect('relief.db')
con.executescript(relief_sql)
con.close()
con = sqlite3.connect('intake.db')
con.executescript(requests_sql)
if preload:
    for row in csv.DictReader(io.StringIO(csv_text)):
        try:
            con.execute('INSERT INTO Requests VALUES (?, ?, ?, ?, ?)',
                (row['request_id'], int(row['camp_id']), row['camp_name'], row['category'], int(row['qty_requested'])))
        except sqlite3.IntegrityError:
            pass
con.commit()
con.close()
with open('camp_requests.csv', 'w', newline='') as f:
    f.write(csv_text)
`;
const snapshotCode = `
import sqlite3, json
result = []
for path, names in [('relief.db', ['Camps', 'Regions']), ('intake.db', ['Requests'])]:
    con = sqlite3.connect(path, timeout=0.1)
    try:
        for name in names:
            try:
                cur = con.execute('SELECT * FROM "' + name + '" LIMIT 100')
                result.append({'name': name, 'columns': [d[0] for d in cur.description], 'values': cur.fetchall()})
            except sqlite3.Error as error:
                result.append({'name': name, 'columns': ['Preview unavailable'], 'values': [[str(error)]]})
    finally:
        con.close()
json.dumps(result)
`;
function isolated(python, values = {}) {
  const dict = runtime.globals.get('dict');
  const globals = dict();
  dict.destroy();
  try {
    for (const [key, value] of Object.entries(values)) globals.set(key, value);
    return runtime.runPython(python, { globals });
  } finally { globals.destroy(); }
}
self.onmessage = async ({ data }) => {
  output = '';
  try {
    await engine();
    if (data.type === 'init') {
      namespace?.destroy();
      const dict = runtime.globals.get('dict');
      namespace = dict();
      dict.destroy();
      isolated(setup, { relief_sql: reliefSql, requests_sql: requestsSql, csv_text: requestsCsv, preload: !!data.preload });
    } else {
      // Load pandas only when needed, including student edits importing it.
      await runtime.loadPackagesFromImports(data.code);
      output = '';
      const result = await runtime.runPythonAsync(data.code, { globals: namespace, filename: 'day15.py' });
      result?.destroy?.();
    }
    const tables = JSON.parse(isolated(snapshotCode));
    self.postMessage({ id: data.id, output: output.slice(0, limit), tables });
  } catch (error) {
    self.postMessage({ id: data.id, output: output.slice(0, limit), error: error.message || String(error) });
  }
};
