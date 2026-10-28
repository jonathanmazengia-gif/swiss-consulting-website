
const menuButton = document.querySelector(".menu-toggle");
const navigationLinks = document.querySelector(".nav-links");

// Check that both elements exist
if (menuButton && navigationLinks) {

  // Function to close the menu
  function closeMenu() {
    navigationLinks.classList.remove("is-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute(
      "aria-label",
      "Open navigation menu"
    );
  }

  // Open or close the menu when clicked
  menuButton.addEventListener("click", function () {

    const isOpen = navigationLinks.classList.toggle("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

  });

  // Close the menu after selecting a link
  navigationLinks.querySelectorAll("a").forEach(function (link) {

    link.addEventListener("click", closeMenu);

  });

  // Close the menu when Escape is pressed
  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
      closeMenu();
    }

  });
}

// STAGE 9: INTERACTIVE FINANCIAL DASHBOARD

// Fictional quarterly financial information
const financialData = {
  2024: {
    revenue: [160000, 180000, 200000, 220000],
    expenses: [139000, 160000, 176000, 193000],
    retention: 75
  },

  2025: {
    revenue: [200000, 225000, 245000, 270000],
    expenses: [174000, 192000, 205000, 226120],
    retention: 79
  },

  2026: {
    revenue: [250000, 290000, 310000, 350000],
    expenses: [213000, 241000, 255000, 270200],
    retention: 84
  }
};

// Find the dashboard elements
const yearSelector = document.querySelector("#dashboard-year");
const revenueKPI = document.querySelector("#kpi-revenue");
const marginKPI = document.querySelector("#kpi-margin");
const profitKPI = document.querySelector("#kpi-profit");
const retentionKPI = document.querySelector("#kpi-retention");

const chart = document.querySelector("#dashboard-chart");
const chartBars = document.querySelectorAll(".chart-bar");
const chartValues = document.querySelectorAll(".chart-value");
const dashboardSummary = document.querySelector("#dashboard-summary");

// Update everything when the selected year changes
function updateDashboard() {

  const selectedYear = yearSelector.value;
  const data = financialData[selectedYear];

  // Calculate the totals
  const annualRevenue = data.revenue.reduce(
    (total, amount) => total + amount, 0
  );

  const annualExpenses = data.expenses.reduce(
    (total, amount) => total + amount, 0
  );

  const operatingProfit = annualRevenue - annualExpenses;
  const operatingMargin = operatingProfit / annualRevenue * 100;

  // Update the KPI cards
  revenueKPI.textContent =
    `CHF ${(annualRevenue / 1000000).toFixed(2)}M`;

  marginKPI.textContent = operatingMargin.toFixed(1) + "%";

  profitKPI.textContent =
    `CHF ${Math.round(operatingProfit / 1000)}k`;

  retentionKPI.textContent = data.retention + "%";

  // Update the quarterly chart
  data.revenue.forEach((amount, index) => {

    const percentage = amount / 350000 * 100;

    chartBars[index].style.height = percentage + "%";

    chartValues[index].textContent =
      `CHF ${Math.round(amount / 1000)}k`;

  });

  // Update the accessible chart description
  chart.setAttribute(
    "aria-label",
    `Fictional ${selectedYear} quarterly revenue: ` +
    data.revenue.map((amount, index) =>
      `Q${index + 1} CHF ${amount.toLocaleString("en-CH")}`
    ).join(", ")
  );

  dashboardSummary.textContent =
    `Showing fictional financial data for ${selectedYear}.`;
}

// Run only when the dashboard exists
if (yearSelector && chart && chartBars.length === 4) {

  yearSelector.addEventListener("change", updateDashboard);

  // Display 2026 data when the page first loads
  updateDashboard();

}

// STAGE 10: LIVE EXCHANGE RATES

const fxSection = document.querySelector("#fx-rates");

if (fxSection) {

  const fxButton = document.querySelector("#fx-refresh");
  const fxStatus = document.querySelector("#fx-status");
  const fxDate = document.querySelector("#fx-date");

  const fxCurrencies = ["EUR", "USD", "GBP"];

// Currency converter elements

const fxAmount = document.querySelector("#fx-amount");
const fxTarget = document.querySelector("#fx-target");
const fxResult = document.querySelector("#fx-result");

// Store rates once they have been retrieved
let latestRates = null;

// Convert CHF to the selected currency
function updateConversion() {

  if (!latestRates) {
    fxResult.textContent = "Waiting for exchange rates...";
    return;
  }

  const amount = fxAmount.valueAsNumber;

  if (!Number.isFinite(amount) || amount < 0) {
    fxResult.textContent = "Enter a valid amount.";
    return;
  }

  const currency = fxTarget.value;
  const rate = latestRates[currency];

  // Multiply CHF by the exchange rate
  const convertedAmount = amount * rate;

  // Display the formatted result
  fxResult.textContent = new Intl.NumberFormat(
    "en-CH",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(convertedAmount);

}

  async function loadExchangeRates() {

    fxButton.disabled = true;
    fxStatus.textContent = "Loading exchange rates...";

    try {

      // Request real data from Frankfurter
      const response = await fetch(
        "https://api.frankfurter.dev/v2/rates?base=CHF&quotes=EUR,USD,GBP"
      );

      // Check that the request succeeded
      if (!response.ok) {
        throw new Error("API request failed: " + response.status);
      }

      // Convert JSON into JavaScript data
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected API response format");
      }

      // Find and validate each currency rate
      const rates = fxCurrencies.map(function (currency) {

        const item = data.find(function (row) {
          return row.base === "CHF" &&
                 row.quote === currency &&
                 Number.isFinite(row.rate) &&
                 row.rate > 0 &&
                 typeof row.date === "string";
        });

        if (!item) {
          throw new Error("Missing valid rate for " + currency);
        }

        return item;
      });

      // Update the exchange-rate cards
      rates.forEach(function (item) {

        const elementId = "#fx-" + item.quote.toLowerCase();
        const element = document.querySelector(elementId);

        element.textContent = item.rate.toFixed(4);

      });
      
// Save the API rates for the converter

latestRates = Object.fromEntries(
  rates.map(function (item) {
    return [item.quote, item.rate];
  })
);

// Calculate the initial conversion
updateConversion();


      // Display the publication date(s)
      const dates = [...new Set(
        rates.map(function (item) {
          return item.date;
        })
      )];

      fxDate.textContent =
        "Reference date(s): " + dates.join(", ");

      fxStatus.textContent =
        "Exchange rates loaded successfully.";

    } catch (error) {

      console.error("Exchange rate error:", error);

      fxStatus.textContent =
        "Unable to load rates. Please try again later.";

    } finally {

      fxButton.disabled = false;

    }
  }

  // Refresh when the visitor clicks the button
  fxButton.addEventListener("click", loadExchangeRates);

// Recalculate whenever the amount changes
fxAmount.addEventListener("input", updateConversion);

// Recalculate whenever the currency changes
fxTarget.addEventListener("change", updateConversion);

  // Load data automatically when the page opens
  loadExchangeRates();

}

// STAGE 10.3: HISTORICAL EXCHANGE RATE CHART

const historyCurrency = document.querySelector("#fx-history-currency");
const historyChart = document.querySelector("#fx-history-chart");
const historyStatus = document.querySelector("#fx-history-status");
const historySummary = document.querySelector("#fx-history-summary");
const historyStart = document.querySelector("#fx-history-start");
const historyEnd = document.querySelector("#fx-history-end");

if (historyCurrency && historyChart) {

  let requestNumber = 0;

  async function loadHistoricalRates() {

    const currentRequest = ++requestNumber;
    const currency = historyCurrency.value;

    historyStatus.textContent = "Loading historical data...";
    historySummary.textContent = "";
    historyChart.replaceChildren();

    // Calculate the requested date range
    const today = new Date();
    const start = new Date(today);

    start.setUTCDate(start.getUTCDate() - 30);

    const fromDate = start.toISOString().slice(0, 10);
    const toDate = today.toISOString().slice(0, 10);

    const url =
      `https://api.frankfurter.dev/v2/rates` +
      `?from=${fromDate}&to=${toDate}` +
      `&base=CHF&quotes=${currency}`;

    try {

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Historical API request failed");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid historical data");
      }

      // Keep valid observations in date order
      const points = data.filter(function (item) {
        return item.base === "CHF" &&
          item.quote === currency &&
          typeof item.date === "string" &&
          Number.isFinite(item.rate) &&
          item.rate > 0;
      }).sort(function (a, b) {
        return a.date.localeCompare(b.date);
      });

      if (points.length < 2) {
        throw new Error("Not enough historical observations");
      }

      // Ignore an older request if the user changed currency
      if (currentRequest !== requestNumber) return;

      // Determine the range for the chart
      const values = points.map(point => point.rate);

      const min = Math.min(...values);
      const max = Math.max(...values);
      const spread = Math.max(max - min, 0.0001);

      const lower = min - spread * 0.15;
      const upper = max + spread * 0.15;

      // Convert rates into SVG coordinates
      const coordinates = points.map(function (point, index) {

        const x = 40 + index / (points.length - 1) * 600;
        const y = 230 - (point.rate - lower) /
          (upper - lower) * 190;

        return [x, y];

      });

      const svgNS = "http://www.w3.org/2000/svg";

      // Draw three horizontal grid lines
      [40, 135, 230].forEach(function (y) {

        const gridLine = document.createElementNS(svgNS, "line");

        gridLine.setAttribute("x1", "40");
        gridLine.setAttribute("x2", "640");
        gridLine.setAttribute("y1", y);
        gridLine.setAttribute("y2", y);
        gridLine.setAttribute("stroke", "#e3e7eb");

        historyChart.appendChild(gridLine);

      });

      // Draw the exchange-rate line
      const line = document.createElementNS(svgNS, "polyline");

      line.setAttribute(
        "points",
        coordinates.map(pair => pair.join(",")).join(" ")
      );

      line.setAttribute("fill", "none");
      line.setAttribute("stroke", "#78582c");
      line.setAttribute("stroke-width", "3");
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("stroke-linecap", "round");

      historyChart.appendChild(line);

      // Display the actual observation dates
      const first = points[0];
      const last = points[points.length - 1];

      historyStart.textContent = first.date;
      historyEnd.textContent = last.date;

      const change = (last.rate / first.rate - 1) * 100;

      historySummary.textContent =
        `First: ${first.rate.toFixed(4)} ${currency} | ` +
        `Last: ${last.rate.toFixed(4)} ${currency} | ` +
        `Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

      historyChart.setAttribute(
        "aria-label",
        `Historical CHF to ${currency} exchange rates ` +
        `from ${first.date} to ${last.date}. ` +
        `First ${first.rate.toFixed(4)}, ` +
        `last ${last.rate.toFixed(4)}.`
      );

      historyStatus.textContent =
        `${points.length} historical observations loaded.`;

    } catch (error) {

      if (currentRequest !== requestNumber) return;

      console.error("Historical chart error:", error);

      historyStatus.textContent =
        "Unable to load historical rates. Try another currency.";

    }
  }

  historyCurrency.addEventListener(
    "change",
    loadHistoricalRates
  );

  // Load the chart automatically
  loadHistoricalRates();

}
