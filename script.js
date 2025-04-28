// === Load datasets ===
const datasets = {
  gdp_growth: "data/gdp_growth.csv",
  gdp_per_capita_growth: "data/gdp_per_capita_growth.csv",
  gdp_per_capita: "data/gdp_per_capita.csv"
};

let allData = {};
let combinedData = [];
let worldGeoJSON = null;
let currentChart = null;
let comparisonCharts = [];

Promise.all([
  d3.csv(datasets.gdp_growth),
  d3.csv(datasets.gdp_per_capita_growth),
  d3.csv(datasets.gdp_per_capita),
  d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
]).then(([growth, capitaGrowth, capita, geoData]) => {
  allData.gdp_growth = transformWideToLong(growth);
  allData.gdp_per_capita_growth = transformWideToLong(capitaGrowth);
  allData.gdp_per_capita = transformWideToLong(capita);
  combinedData = calculateCombinedData(allData);
  worldGeoJSON = geoData;
  init();
});

function transformWideToLong(data) {
  let longData = [];
  data.forEach(d => {
    const country = d['Country Name'];
    Object.keys(d).forEach(key => {
      if (!isNaN(+key)) {
        longData.push({
          Country: country,
          Year: key,
          Value: d[key] ? +d[key] : null
        });
      }
    });
  });
  return longData;
}

function calculateCombinedData(data) {
  let combined = [];
  let map = new Map();
  data.gdp_growth.forEach(d => {
    map.set(`${d.Country}-${d.Year}`, { growth: d.Value });
  });
  data.gdp_per_capita_growth.forEach(d => {
    const key = `${d.Country}-${d.Year}`;
    if (!map.has(key)) map.set(key, {});
    map.get(key).capitaGrowth = d.Value;
  });
  data.gdp_per_capita.forEach(d => {
    const key = `${d.Country}-${d.Year}`;
    if (!map.has(key)) map.set(key, {});
    map.get(key).capita = d.Value;
  });
  map.forEach((v, k) => {
    const [country, year] = k.split("-");
    if (v.growth !== undefined && v.capitaGrowth !== undefined && v.capita !== undefined) {
      combined.push({ Country: country, Year: year, growth: v.growth, capitaGrowth: v.capitaGrowth, capita: v.capita });
    }
  });
  return combined;
}

function init() {
  const countrySelect = document.getElementById('country-select');
  const yearRange = document.getElementById('year-range');
  const yearValue = document.getElementById('year-value');
  const metricSelect = document.getElementById('metric-select');

  const countries = Array.from(new Set(allData.gdp_growth.map(d => d.Country))).sort();
  const years = Array.from(new Set(allData.gdp_growth.map(d => +d.Year))).sort();

  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });

  yearRange.min = Math.min(...years);
  yearRange.max = Math.max(...years);
  yearRange.value = yearRange.max;
  yearValue.textContent = yearRange.value;

  updateEverything();

  document.getElementById('update-chart').addEventListener('click', updateEverything);
  yearRange.addEventListener('input', () => {
    yearValue.textContent = yearRange.value;
    updateEverything();
  });
  metricSelect.addEventListener('change', updateEverything);
  document.getElementById('predict-btn').addEventListener('click', predictNextYearGDP);
}

function getSelectedData() {
  const metric = document.getElementById('metric-select').value;
  return metric === 'combined' ? combinedData : allData[metric];
}

function updateEverything() {
  updateChart();
  updateTable();
  updateMap();
  showInsights();
}

function updateChart() {
  const metric = document.getElementById('metric-select').value;
  const country = document.getElementById('country-select').value;
  const chartType = document.getElementById('chart-type').value;
  const selectedYear = document.getElementById('year-range').value;

  let selectedData = getSelectedData()
    .filter(d => d.Country === country && +d.Year <= selectedYear && (d.Value !== null || d.growth !== undefined));

  const ctx = document.getElementById('gdp-chart').getContext('2d');
  if (currentChart) currentChart.destroy();
  comparisonCharts.forEach(chart => chart.destroy());
  comparisonCharts = [];

  if (metric === 'combined') {
    document.getElementById('comparison-section').style.display = 'block';
  } else {
    document.getElementById('comparison-section').style.display = 'none';
  }

  if (chartType === "pie") {
    if (metric === "combined") {
      const avgGrowth = d3.mean(selectedData.map(d => d.growth));
      const avgCapitaGrowth = d3.mean(selectedData.map(d => d.capitaGrowth));
      const avgCapita = d3.mean(selectedData.map(d => d.capita));

      currentChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["GDP Growth (%)", "GDP Per Capita Growth (%)", "GDP Per Capita ($)"],
          datasets: [{
            data: [avgGrowth, avgCapitaGrowth, avgCapita],
            backgroundColor: ["#4facfe", "#43e97b", "#f9a825"],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: `Combined Insights (Pie Chart) for ${country}` }
          }
        }
      });

      createComparisonPlot('comparison-chart-1', 'GDP Growth (%)', selectedData.map(d => d.growth), 'GDP Per Capita Growth (%)', selectedData.map(d => d.capitaGrowth), 'insight-1', chartType);
      createComparisonPlot('comparison-chart-2', 'GDP Growth (%)', selectedData.map(d => d.growth), 'GDP Per Capita ($)', selectedData.map(d => d.capita), 'insight-2', chartType);
      createComparisonPlot('comparison-chart-3', 'GDP Per Capita Growth (%)', selectedData.map(d => d.capitaGrowth), 'GDP Per Capita ($)', selectedData.map(d => d.capita), 'insight-3', chartType);

    } else {
      const avgValue = d3.mean(selectedData.map(d => d.Value));

      currentChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: [`Average ${metric.replaceAll('_', ' ').toUpperCase()}`, "Remaining"],
          datasets: [{
            data: [avgValue, 100 - avgValue],
            backgroundColor: ["#4facfe", "#ddd"],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: `${metric.replaceAll('_', ' ').toUpperCase()} (Pie Chart) for ${country}` }
          }
        }
      });
    }
  } else {
    const labels = selectedData.map(d => d.Year);
    const values = selectedData.map(d => d.Value ?? d.growth);

    currentChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: metric.replaceAll('_', ' ').toUpperCase(),
          data: values,
          borderColor: "#4facfe",
          backgroundColor: "#4facfe",
          fill: chartType === 'line' ? false : true,
          tension: chartType === 'line' ? 0.4 : 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: `${metric.replaceAll('_', ' ').toUpperCase()} (${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart) for ${country}` },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: chartType === 'pie' ? {} : {
          x: { title: { display: true, text: "Year" } },
          y: { title: { display: true, text: "Value" } }
        }
      }
    });

    if (metric === 'combined') {
      createComparisonPlot('comparison-chart-1', 'GDP Growth (%)', selectedData.map(d => d.growth), 'GDP Per Capita Growth (%)', selectedData.map(d => d.capitaGrowth), 'insight-1', chartType);
      createComparisonPlot('comparison-chart-2', 'GDP Growth (%)', selectedData.map(d => d.growth), 'GDP Per Capita ($)', selectedData.map(d => d.capita), 'insight-2', chartType);
      createComparisonPlot('comparison-chart-3', 'GDP Per Capita Growth (%)', selectedData.map(d => d.capitaGrowth), 'GDP Per Capita ($)', selectedData.map(d => d.capita), 'insight-3', chartType);
    }
  }
}

function createComparisonPlot(canvasId, label1, data1, label2, data2, insightId, chartType = 'line') {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const chart = new Chart(ctx, {
    type: chartType === 'pie' ? 'pie' : 'line',
    data: chartType === 'pie' ? {
      labels: [label1, label2],
      datasets: [{
        data: [d3.mean(data1), d3.mean(data2)],
        backgroundColor: ["#2196f3", "#4caf50"]
      }]
    } : {
      labels: data1.map((_, i) => i + 1960),
      datasets: [
        { label: label1, data: data1, borderColor: "blue", fill: false },
        { label: label2, data: data2, borderColor: "green", fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: { mode: 'index', intersect: false },
        legend: { position: 'bottom' }
      },
      scales: chartType === 'pie' ? {} : {
        x: { title: { display: true, text: 'Year' }},
        y: { title: { display: true, text: 'Value' }}
      }
    }
  });
  comparisonCharts.push(chart);

  const avg1 = d3.mean(data1);
  const avg2 = d3.mean(data2);
  let insightText = "";
  if (avg1 > avg2) {
    insightText = `${label1} tends to dominate over ${label2} across the selected period.`;
  } else {
    insightText = `${label2} shows stronger trend compared to ${label1}.`;
  }
  document.getElementById(insightId).innerText = insightText;
}

function updateTable() {
  const year = document.getElementById('year-range').value;
  const data = getSelectedData().filter(d => d.Year == year);

  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headerRow = document.createElement('tr');
  ['Country', 'Year', 'Value'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${d.Country}</td><td>${d.Year}</td><td>${(d.Value ?? d.growth)?.toFixed(2) ?? 'N/A'}</td>`;
    tbody.appendChild(row);
  });
}

function updateMap() {
  const year = document.getElementById('year-range').value;
  const data = getSelectedData().filter(d => d.Year == year);

  const gdpMap = new Map(data.map(d => [d.Country, d.Value ?? d.growth]));

  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(data, d => d.Value ?? d.growth)]);

  const svg = d3.select("#world-map");
  const projection = d3.geoMercator().scale(150).translate([480, 300]);
  const path = d3.geoPath().projection(projection);

  svg.selectAll("*").remove();

  const tooltip = d3.select("#tooltip");

  svg.selectAll("path")
    .data(worldGeoJSON.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const value = gdpMap.get(d.properties.name);
      return value !== undefined && value !== null ? colorScale(value) : "#ccc";
    })
    .attr("stroke", "#333")
    .on("mouseover", function(event, d) {
      const value = gdpMap.get(d.properties.name);
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`<strong>${d.properties.name}</strong><br>Value: ${value !== undefined ? value.toFixed(2) : "N/A"}`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 15) + "px")
             .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function showInsights() {
  const year = document.getElementById('year-range').value;
  const country = document.getElementById('country-select').value;
  let insightsHTML = `<h3>📊 Insights for Year ${year}</h3>`;

  const data = getSelectedData().filter(d => d.Year == year && (d.Value !== null || d.growth !== undefined));

  if (data.length === 0) {
    insightsHTML += `<p>No data available for this year.</p>`;
  } else {
    const worldAvg = d3.mean(data, d => d.Value ?? d.growth);
    const maxVal = d3.max(data, d => d.Value ?? d.growth);
    const minVal = d3.min(data, d => d.Value ?? d.growth);
    const topCountry = data.find(d => (d.Value ?? d.growth) === maxVal);
    const bottomCountry = data.find(d => (d.Value ?? d.growth) === minVal);

    insightsHTML += `<p>🌍 World Average: <b>${worldAvg.toFixed(2)}</b></p>`;
    insightsHTML += `<p>🏆 Highest: <b>${topCountry.Country}</b> (${maxVal.toFixed(2)})</p>`;
    insightsHTML += `<p>⚡ Lowest: <b>${bottomCountry.Country}</b> (${minVal.toFixed(2)})</p>`;
  }

  document.getElementById('insights').innerHTML = insightsHTML;
}

function predictNextYearGDP() {
  const country = document.getElementById('country-select').value;
  const countryData = getSelectedData().filter(d => d.Country === country && (d.Value !== null || d.growth !== undefined));
  if (countryData.length < 2) {
    document.getElementById('prediction-output').innerText = "Not enough data.";
    return;
  }

  const last = countryData[countryData.length - 1];
  const secondLast = countryData[countryData.length - 2];
  const growth = (last.Value ?? last.growth) - (secondLast.Value ?? secondLast.growth);
  const predicted = (last.Value ?? last.growth) + growth;

  document.getElementById('prediction-output').innerText = `🔮 Predicted ${+last.Year + 1}: ${predicted.toFixed(2)}`;
}

// --- View Switching (Chart / Table / Map) ---
function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(viewId).classList.add('active');
  document.querySelector(`.view-btn[onclick="showView('${viewId}')"]`).classList.add('active');
}
