// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const genreSelect = document.getElementById("genreSelect");
const platformSelect = document.getElementById("platformSelect")
const publisherSelect = document.getElementById("publisherSelect")
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const year = [...new Set(chartData.map(r => r.year))];
const genre = [...new Set(chartData.map(r => r.genre))];
const platform = [...new Set(chartData.map(r => r.platform))];
const publisher = [...new Set(chartData.map(r => r.publisher))];
const metric = [...new Set(chartData.map(r => r.metric))];



year.forEach(y => yearSelect.add(new Option(y, y)));
genreSelect.forEach(g => genreSelect.add(new Option(g, g)));
platformSelect.forEach(plat => platformSelect.add(new Option(plat, plat)));
publisherSelect.forEach(pub => publisherSelect.add(new Option(pub, pub)));


yearSelect.value = year[0];
genreSelect.value = genre[0];
platformSelect.value = platform[0];
publisherSelect.value = publisher[0];
metricSelect.value = metric[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const platform = platformSelect.value;
  const publisher = publisherSelect.value;
  const genre = genreSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, genre, metric, platform, publisher });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, genre, metric, publisher, platform }) {
  if (type === "bar") return barByNeighborhood(metric, platform);
  if (type === "line") return lineOverTime(metric, ["Year", "revenueUSD"]);
  if (type === "scatter") return scatterTripsVsTemp(genre);
  if (type === "doughnut") return doughnutMemberVsCasual(year, genre);
  if (type === "radar") return radarCompareNeighborhoods(publisher);
  return barByNeighborhood(platform, genre);
}

// Task A: BAR — compare neighborhoods for a given month
function barByNeighborhood(year, metric) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.metric);
  const values = rows.map(r => r[platform]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${platform}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Sales by platforms (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Platform" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(hood, metrics) {
  const rows = chartData.filter(r => r.hood === hood);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${hood}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "year" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(hood) {
  const rows = chartData.filter(r => r.hood === hood);

  const points = rows.map(r => ({ x: r.tempC, y: r.trips }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Trips vs Temp (${hood})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${hood})` }
      },
      scales: {
        x: { title: { display: true, text: "Temperature (C)" } },
        y: { title: { display: true, text: "Trips" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one hood + month
function doughnutMemberVsCasual(year, hood) {
  const row = chartData.find(r => r.year === year && r.hood === hood);

  const member = Math.round(row.memberShare * 100);
  const casual = 100 - member;

  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${hood} (${year})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one year
function radarCompareNeighborhoods(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.hood,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}