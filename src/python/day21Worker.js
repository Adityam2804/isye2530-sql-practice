import { clinicWeeklyCsv } from "../data/day21.js";

const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

let runtime;
let output = "";
const OUTPUT_LIMIT = 80000;

function append(line) {
  if (output.length < OUTPUT_LIMIT) output += `${line}\n`;
}

async function engine() {
  if (!runtime) {
    const { loadPyodide } = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
    runtime = await loadPyodide({
      indexURL,
      stdout: append,
      stderr: append,
    });

    // Day 21 deliberately uses the real scientific Python packages.
    await runtime.loadPackage(["pandas", "statsmodels"]);
    runtime.FS.writeFile("clinic_weekly.csv", clinicWeeklyCsv);

    await runtime.runPythonAsync(`
import pandas as pd
import statsmodels
`);
  }

  return runtime;
}

function freshGlobals() {
  const dictType = runtime.globals.get("dict");
  const globals = dictType();
  dictType.destroy();
  return globals;
}

async function treeVisual(globals) {
  const raw = await runtime.runPythonAsync(`
import json as _json

_visual = None
try:
    _result = result
except NameError:
    _result = None

if isinstance(_result, dict):
    try:
        _visual = {
            "kind": "tree",
            "p_close": float(_result["p_close"]),
            "p_open": float(1 - _result["p_close"]),
            "pre_position": float(_result["pre_position"]),
            "open_cost": float(_result["open_cost"]),
            "closed_cost": float(_result["closed_cost"]),
            "wait": float(_result["wait"]),
            "choice": str(_result["choice"]),
            "sensitivity": [],
        }
        try:
            _visual["sensitivity"] = [
                {
                    "p_close": float(_row["p_close"]),
                    "wait": float(_row["wait"]),
                    "choice": str(_row["choice"]),
                }
                for _row in sensitivity
            ]
        except Exception:
            pass
    except Exception:
        _visual = None

_json.dumps(_visual)
`, { globals, filename: "day21_tree_visual.py" });

  return raw ? JSON.parse(raw) : null;
}

async function regressionVisual(globals) {
  const raw = await runtime.runPythonAsync(`
import json as _json
import math as _math
import numpy as _np
import pandas as _pd

_visual = None
try:
    _fit = fit
    _df = df
except NameError:
    _fit = None
    _df = None

if _fit is not None and isinstance(_df, _pd.DataFrame):
    try:
        _formula = str(getattr(_fit.model, "formula", ""))
        _response = str(getattr(_fit.model, "endog_names", "visits"))
        _params = {str(k): float(v) for k, v in _fit.params.items()}
        _pvalues = {str(k): float(v) for k, v in _fit.pvalues.items()}
        _x_name = "flu" if "flu" in _df.columns else None

        _points = []
        if _x_name and _response in _df.columns:
            for _idx, _row in _df.iterrows():
                _points.append({
                    "x": float(_row[_x_name]),
                    "y": float(_row[_response]),
                    "school": int(_row["school"]) if "school" in _df.columns else None,
                    "week": int(_row["week"]) if "week" in _df.columns else None,
                })

        _lines = []
        if _x_name:
            _xmin = float(_df[_x_name].min())
            _xmax = float(_df[_x_name].max())
            _xgrid = _np.linspace(_xmin, _xmax, 70)

            _base = {}
            for _col in _df.columns:
                if _col == _response:
                    continue
                if _pd.api.types.is_numeric_dtype(_df[_col]):
                    _base[_col] = float(_df[_col].mean())
                else:
                    _mode = _df[_col].mode(dropna=True)
                    _base[_col] = _mode.iloc[0] if len(_mode) else ""

            _school_levels = [None]
            if "school" in _df.columns and "school" in _formula:
                _school_levels = [0, 1]

            for _school in _school_levels:
                _rows = []
                for _x in _xgrid:
                    _row = dict(_base)
                    _row[_x_name] = float(_x)
                    if _school is not None:
                        _row["school"] = int(_school)
                    _rows.append(_row)
                _grid = _pd.DataFrame(_rows)
                _pred = _fit.predict(_grid)
                _lines.append({
                    "label": "school in" if _school == 1 else ("school out" if _school == 0 else "fitted model"),
                    "school": _school,
                    "x": [float(v) for v in _xgrid],
                    "y": [float(v) for v in _pred],
                })

        _forecast_rows = []
        try:
            _forecast = forecast
            _new = new
            for _i, _value in enumerate(_forecast):
                _record = {"prediction": float(_value)}
                if isinstance(_new, _pd.DataFrame) and _i < len(_new):
                    for _col in _new.columns:
                        _v = _new.iloc[_i][_col]
                        if isinstance(_v, (int, float, _np.integer, _np.floating)):
                            _record[str(_col)] = float(_v)
                        else:
                            _record[str(_col)] = str(_v)
                _record["nurses"] = int(_math.ceil(float(_value) / 60))
                _forecast_rows.append(_record)
        except Exception:
            pass

        _validation = None
        try:
            _validation = {
                "regression_mae": float(miss.mean()),
                "baseline_mae": float(naive.mean()),
            }
        except Exception:
            pass

        _visual = {
            "kind": "regression",
            "formula": _formula,
            "response": _response,
            "x_name": _x_name,
            "params": _params,
            "pvalues": _pvalues,
            "rsquared": float(_fit.rsquared),
            "points": _points,
            "lines": _lines,
            "forecast": _forecast_rows,
            "validation": _validation,
        }
    except Exception as _visual_error:
        _visual = {"kind": "regression", "visual_error": str(_visual_error)}

_json.dumps(_visual)
`, { globals, filename: "day21_regression_visual.py" });

  return raw ? JSON.parse(raw) : null;
}

async function extractVisual(mode, globals) {
  if (mode === "tree") return treeVisual(globals);
  if (mode === "regression") return regressionVisual(globals);
  return null;
}

self.onmessage = async ({ data }) => {
  output = "";

  try {
    await engine();

    if (data.type === "init") {
      const versions = runtime.runPython(`
import json, pandas, statsmodels
json.dumps({
    "python": __import__("sys").version.split()[0],
    "pandas": pandas.__version__,
    "statsmodels": statsmodels.__version__,
})
`);
      self.postMessage({
        id: data.id,
        output: "",
        versions: JSON.parse(versions),
      });
      return;
    }

    if (data.type === "run") {
      const globals = freshGlobals();
      let visual = null;
      try {
        output = "";
        const result = await runtime.runPythonAsync(data.code, {
          globals,
          filename: data.filename || "day21.py",
        });
        result?.destroy?.();
        visual = await extractVisual(data.mode, globals);
      } finally {
        globals.destroy();
      }

      self.postMessage({
        id: data.id,
        output: output.slice(0, OUTPUT_LIMIT),
        visual,
      });
      return;
    }

    throw new Error(`Unknown Day 21 worker message: ${data.type}`);
  } catch (error) {
    self.postMessage({
      id: data.id,
      output: output.slice(0, OUTPUT_LIMIT),
      error: error?.message || String(error),
    });
  }
};
