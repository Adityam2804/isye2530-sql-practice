const PLOTLY_URL = "https://cdn.plot.ly/plotly-4.2.0.min.js";
let plotlyPromise = null;

function loadPlotly() {
  if (window.Plotly) return Promise.resolve(window.Plotly);
  if (plotlyPromise) return plotlyPromise;

  plotlyPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PLOTLY_URL}"]`);
    const script = existing || document.createElement("script");

    const done = () => {
      if (window.Plotly) resolve(window.Plotly);
      else reject(new Error("Plotly loaded but was not available."));
    };

    if (existing) {
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Plotly could not load.")),
        { once: true },
      );
      if (window.Plotly) done();
      return;
    }

    script.src = PLOTLY_URL;
    script.charset = "utf-8";
    script.async = true;
    script.onload = done;
    script.onerror = () => reject(new Error("Plotly could not load."));
    document.head.appendChild(script);
  });

  return plotlyPromise;
}

const money = (value) =>
  Number.isFinite(Number(value))
    ? `$${Math.round(Number(value)).toLocaleString()}`
    : "—";

const pct = (value) =>
  Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 100)}%` : "—";

function card(label, value, note = "") {
  return `
    <div class="day21-visual-stat">
      <span>${label}</span>
      <strong>${value}</strong>
      ${note ? `<small>${note}</small>` : ""}
    </div>
  `;
}

function treeSummary(visual) {
  const chosen = String(visual.choice || "").toLowerCase().includes("wait")
    ? "Wait"
    : "Pre-position now";

  let sensitivity = "";
  if (Array.isArray(visual.sensitivity) && visual.sensitivity.length) {
    sensitivity = `
      <div class="day21-sensitivity-strip">
        ${visual.sensitivity
          .map(
            (row) => `
              <span class="${String(row.choice).toLowerCase().includes("wait") ? "wait" : "pre"}">
                p=${Number(row.p_close).toFixed(2)} · ${String(row.choice).toLowerCase().includes("wait") ? "wait" : "pre-position"}
              </span>
            `,
          )
          .join("")}
      </div>
    `;
  }

  return `
    <div class="day21-visual-stats">
      ${card("Chance road closes", pct(visual.p_close))}
      ${card("Pre-position", money(visual.pre_position))}
      ${card("Wait", money(visual.wait))}
      ${card("Decision", chosen)}
    </div>
    ${sensitivity}
  `;
}

function treeTraces(visual) {
  const waitChosen = String(visual.choice || "").toLowerCase().includes("wait");
  const chosenColor = "#067647";
  const mutedColor = "#98A2B3";
  const chanceColor = waitChosen ? chosenColor : mutedColor;
  const preColor = waitChosen ? mutedColor : chosenColor;

  return [
    {
      x: [0, 1.1],
      y: [0, 0.82],
      mode: "lines",
      line: { color: preColor, width: waitChosen ? 3 : 6 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      x: [0, 0.95],
      y: [0, -0.55],
      mode: "lines",
      line: { color: chanceColor, width: waitChosen ? 6 : 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      x: [0.95, 2.0],
      y: [-0.55, 0.02],
      mode: "lines",
      line: { color: chanceColor, width: waitChosen ? 5 : 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      x: [0.95, 2.0],
      y: [-0.55, -1.1],
      mode: "lines",
      line: { color: chanceColor, width: waitChosen ? 5 : 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      x: [0, 0.95],
      y: [0, -0.55],
      mode: "markers",
      marker: {
        size: [21, 21],
        symbol: ["square", "circle"],
        color: ["#C8102E", "#175CD3"],
        line: { color: "#FFFFFF", width: 2 },
      },
      text: ["Decision node", "Chance node"],
      hovertemplate: "%{text}<extra></extra>",
      showlegend: false,
    },
  ];
}

function treeLayout(visual) {
  const waitChosen = String(visual.choice || "").toLowerCase().includes("wait");
  return {
    height: 390,
    margin: { l: 35, r: 35, t: 20, b: 20 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: { visible: false, range: [-0.22, 2.55], fixedrange: true },
    yaxis: { visible: false, range: [-1.42, 1.16], fixedrange: true },
    annotations: [
      {
        x: -0.02,
        y: 0.22,
        text: "Reyes chooses",
        showarrow: false,
        font: { size: 12, color: "#475467" },
      },
      {
        x: 0.64,
        y: 0.64,
        text: `<b>Pre-position now</b><br>${money(visual.pre_position)}`,
        showarrow: false,
        align: "center",
        font: { size: 13, color: waitChosen ? "#667085" : "#067647" },
      },
      {
        x: 0.45,
        y: -0.42,
        text: `<b>Wait</b><br>EV ${money(visual.wait)}`,
        showarrow: false,
        align: "center",
        font: { size: 13, color: waitChosen ? "#067647" : "#667085" },
      },
      {
        x: 1.02,
        y: -0.75,
        text: "storm chooses",
        showarrow: false,
        font: { size: 11, color: "#475467" },
      },
      {
        x: 1.56,
        y: 0.24,
        text: `Road stays open · ${pct(visual.p_open)}`,
        showarrow: false,
        font: { size: 12, color: "#344054" },
      },
      {
        x: 2.28,
        y: 0.02,
        text: `<b>${money(visual.open_cost)}</b>`,
        showarrow: false,
        font: { size: 13, color: "#101828" },
      },
      {
        x: 1.55,
        y: -0.87,
        text: `Road closes · ${pct(visual.p_close)}`,
        showarrow: false,
        font: { size: 12, color: "#344054" },
      },
      {
        x: 2.28,
        y: -1.1,
        text: `<b>${money(visual.closed_cost)}</b>`,
        showarrow: false,
        font: { size: 13, color: "#101828" },
      },
    ],
  };
}

function regressionSummary(visual) {
  const entries = Object.entries(visual.params || {});
  const coefCards = entries
    .slice(0, 4)
    .map(([name, value]) => card(name, Number(value).toFixed(1), `p=${Number(visual.pvalues?.[name] ?? NaN).toPrecision(2)}`))
    .join("");

  const forecasts = Array.isArray(visual.forecast) ? visual.forecast : [];
  const forecastHtml = forecasts.length
    ? `
        <div class="day21-forecast-strip">
          ${forecasts
            .map(
              (row, index) => `
                <span>
                  Week ${index + 1}: <strong>${Number(row.prediction).toFixed(1)} visits</strong>
                  · ${row.nurses} nurses
                </span>
              `,
            )
            .join("")}
        </div>
      `
    : "";

  const validation = visual.validation
    ? `
        <div class="day21-validation-strip">
          Held-out MAE: <strong>${Number(visual.validation.regression_mae).toFixed(1)}</strong>
          · average-week baseline: <strong>${Number(visual.validation.baseline_mae).toFixed(1)}</strong>
        </div>
      `
    : "";

  return `
    <div class="day21-formula-chip">${visual.formula || "statsmodels fit"}</div>
    <div class="day21-visual-stats">
      ${card("R-squared", Number(visual.rsquared).toFixed(3))}
      ${coefCards}
    </div>
    ${forecastHtml}
    ${validation}
  `;
}

function regressionTraces(visual) {
  const points = Array.isArray(visual.points) ? visual.points : [];
  const schoolOut = points.filter((point) => point.school === 0);
  const schoolIn = points.filter((point) => point.school === 1);
  const other = points.filter((point) => point.school !== 0 && point.school !== 1);

  const traces = [];
  if (schoolOut.length) {
    traces.push({
      x: schoolOut.map((point) => point.x),
      y: schoolOut.map((point) => point.y),
      mode: "markers",
      type: "scatter",
      name: "school out",
      marker: { size: 8, color: "#98A2B3", opacity: 0.82 },
      customdata: schoolOut.map((point) => point.week),
      hovertemplate: "week %{customdata}<br>flu %{x}<br>visits %{y}<extra>school out</extra>",
    });
  }
  if (schoolIn.length) {
    traces.push({
      x: schoolIn.map((point) => point.x),
      y: schoolIn.map((point) => point.y),
      mode: "markers",
      type: "scatter",
      name: "school in",
      marker: { size: 8, color: "#175CD3", opacity: 0.82 },
      customdata: schoolIn.map((point) => point.week),
      hovertemplate: "week %{customdata}<br>flu %{x}<br>visits %{y}<extra>school in</extra>",
    });
  }
  if (other.length) {
    traces.push({
      x: other.map((point) => point.x),
      y: other.map((point) => point.y),
      mode: "markers",
      type: "scatter",
      name: "observed",
      marker: { size: 8, color: "#667085", opacity: 0.8 },
    });
  }

  for (const line of visual.lines || []) {
    traces.push({
      x: line.x,
      y: line.y,
      mode: "lines",
      type: "scatter",
      name: line.label,
      line: {
        width: 4,
        color: line.school === 1 ? "#175CD3" : line.school === 0 ? "#667085" : "#C8102E",
      },
      hovertemplate: `${line.label}<br>flu %{x:.2f}<br>predicted visits %{y:.1f}<extra></extra>`,
    });
  }

  const forecast = Array.isArray(visual.forecast) ? visual.forecast : [];
  const forecastWithX = forecast.filter((row) => Number.isFinite(Number(row[visual.x_name])));
  if (forecastWithX.length) {
    traces.push({
      x: forecastWithX.map((row) => Number(row[visual.x_name])),
      y: forecastWithX.map((row) => Number(row.prediction)),
      mode: "markers",
      type: "scatter",
      name: "forecast",
      marker: {
        size: 13,
        symbol: "diamond",
        color: "#C8102E",
        line: { color: "#FFFFFF", width: 1.5 },
      },
      hovertemplate: "forecast<br>flu %{x}<br>visits %{y:.1f}<extra></extra>",
    });
  }

  return traces;
}

function regressionLayout(visual) {
  return {
    height: 440,
    margin: { l: 62, r: 24, t: 18, b: 58 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "#FFFFFF",
    hovermode: "closest",
    legend: { orientation: "h", y: 1.08, x: 0 },
    xaxis: {
      title: visual.x_name ? `${visual.x_name} index` : "explanatory variable",
      gridcolor: "#EAECF0",
      zeroline: false,
    },
    yaxis: {
      title: `${visual.response || "visits"} per week`,
      gridcolor: "#EAECF0",
      zeroline: false,
    },
  };
}

export async function renderDay21Visual(root, mode, visual) {
  const plotNode = root.querySelector("#day21ModelPlot");
  const summaryNode = root.querySelector("#day21VisualSummary");
  if (!plotNode || !summaryNode) return;

  if (!visual) {
    plotNode.innerHTML = '<div class="day21-visual-empty">No results yet.</div>';
    summaryNode.innerHTML = "";
    return;
  }

  if (visual.visual_error) {
    plotNode.innerHTML = `<div class="day21-visual-empty error">Visualization unavailable: ${visual.visual_error}</div>`;
    summaryNode.innerHTML = "";
    return;
  }

  try {
    const Plotly = await loadPlotly();
    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
    };

    if (mode === "tree" && visual.kind === "tree") {
      summaryNode.innerHTML = treeSummary(visual);
      await Plotly.react(plotNode, treeTraces(visual), treeLayout(visual), config);
      return;
    }

    if (mode === "regression" && visual.kind === "regression") {
      summaryNode.innerHTML = regressionSummary(visual);
      await Plotly.react(
        plotNode,
        regressionTraces(visual),
        regressionLayout(visual),
        config,
      );
      return;
    }

    plotNode.innerHTML = '<div class="day21-visual-empty error">Visualization unavailable.</div>';
    summaryNode.innerHTML = "";
  } catch (error) {
    plotNode.innerHTML = '<div class="day21-visual-empty error">Visualization unavailable.</div>';
    summaryNode.innerHTML = "";
  }
}
