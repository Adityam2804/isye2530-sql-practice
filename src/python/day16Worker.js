import { day16ReliefSql } from '../data/day16.js';

const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
const outputLimit = 60000;
let runtime;
let namespace;
let output = '';

function append(line) {
  if (output.length < outputLimit) output += `${line}\n`;
}

async function engine() {
  if (!runtime) {
    const { loadPyodide } = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
    runtime = await loadPyodide({ indexURL, stdout: append, stderr: append });
    await runtime.loadPackage('sqlite3');
  }
  return runtime;
}

function isolated(python, values = {}) {
  const dict = runtime.globals.get('dict');
  const globals = dict();
  dict.destroy();

  try {
    for (const [key, value] of Object.entries(values)) globals.set(key, value);
    return runtime.runPython(python, { globals });
  } finally {
    globals.destroy();
  }
}

const setupCode = `
import sqlite3, os
for name in os.listdir('/home/pyodide'):
    if name.endswith(('.db', '.db-journal', '.db-wal', '.db-shm')):
        os.remove('/home/pyodide/' + name)

con = sqlite3.connect('relief.db')
con.executescript(relief_sql)
con.commit()
con.close()
`;

const snapshotCode = `
import sqlite3, json
result = []
con = sqlite3.connect('relief.db', timeout=0.1)
try:
    for name in ['Camps', 'Regions', 'Items', 'Shipments']:
        cur = con.execute('SELECT * FROM "' + name + '" LIMIT 100')
        result.append({
            'name': name,
            'columns': [d[0] for d in cur.description],
            'values': cur.fetchall(),
        })
finally:
    con.close()
json.dumps(result)
`;

const figureCode = `
import io, base64, json
figures = []
import matplotlib.pyplot as plt
for number in plt.get_fignums()[:3]:
    fig = plt.figure(number)
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=120, bbox_inches='tight')
    figures.append('data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('ascii'))
    buffer.close()
plt.close('all')
json.dumps(figures)
`;

self.onmessage = async ({ data }) => {
  output = '';

  try {
    await engine();

    if (data.type === 'init') {
      namespace?.destroy?.();
      const dict = runtime.globals.get('dict');
      namespace = dict();
      dict.destroy();
      isolated(setupCode, { relief_sql: day16ReliefSql });
      self.postMessage({
        id: data.id,
        output: '',
        tables: JSON.parse(isolated(snapshotCode)),
        figures: [],
      });
      return;
    }

    if (data.chart) {
      await runtime.loadPackage('pandas');
      await runtime.loadPackage('matplotlib');
      isolated("import matplotlib; matplotlib.use('Agg')");
    } else {
      await runtime.loadPackagesFromImports(data.code);
    }

    // Also load any non-chart imports that appear in the student's edited code.
    await runtime.loadPackagesFromImports(data.code);

    output = '';
    const result = await runtime.runPythonAsync(data.code, {
      globals: namespace,
      filename: 'day16.py',
    });
    result?.destroy?.();

    const tables = JSON.parse(isolated(snapshotCode));
    const figures = data.chart ? JSON.parse(isolated(figureCode)) : [];

    self.postMessage({
      id: data.id,
      output: output.slice(0, outputLimit),
      tables,
      figures,
    });
  } catch (error) {
    self.postMessage({
      id: data.id,
      output: output.slice(0, outputLimit),
      error: error.message || String(error),
      figures: [],
    });
  }
};
