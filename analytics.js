
// STAGE 11: BUSINESS DATA ANALYSIS

// Fictional monthly financial records
const sampleData = [
  { month: "2026-01", revenue: 120000, expenses: 94000 },
  { month: "2026-02", revenue: 135000, expenses: 98000 },
  { month: "2026-03", revenue: 128000, expenses: 97000 },
  { month: "2026-04", revenue: 151000, expenses: 108000 },
  { month: "2026-05", revenue: 162000, expenses: 116000 },
  { month: "2026-06", revenue: 175000, expenses: 120000 }
];

// Find the page elements
const csvInput = document.querySelector("#sales-csv");
const analyticsStatus = document.querySelector("#analytics-status");
const salesChart = document.querySelector("#sales-chart");

// Stage 11.3: Advanced analytics elements

const monthFromInput = document.querySelector("#sales-from");
const monthToInput = document.querySelector("#sales-to");
const resetFiltersButton = document.querySelector("#sales-reset");

const salesComparison = document.querySelector("#sales-comparison");
const salesInsights = document.querySelector("#sales-insights");

// Remember the active dataset
let currentData = sampleData;
let datasetName = "fictional sample data";


// Format numbers as Swiss francs
function formatCHF(value) {
  return new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0
  }).format(value);
}

// Calculate KPIs and redraw the chart
function displayAnalytics(rows) {

  const totalRevenue = rows.reduce(
    (total, row) => total + row.revenue, 0
  );

  const totalExpenses = rows.reduce(
    (total, row) => total + row.expenses, 0
  );

  const profit = totalRevenue - totalExpenses;

  const margin = totalRevenue > 0
    ? profit / totalRevenue * 100
    : 0;

  document.querySelector("#sales-revenue")
    .textContent = formatCHF(totalRevenue);

  document.querySelector("#sales-expenses")
    .textContent = formatCHF(totalExpenses);

  document.querySelector("#sales-profit")
    .textContent = formatCHF(profit);

  document.querySelector("#sales-margin")
    .textContent = margin.toFixed(1) + "%";

  // Clear the existing chart
  salesChart.replaceChildren();

  
const maximumValue = Math.max(
  1,
  ...rows.map(row => Math.max(row.revenue, row.expenses))
);


  // Create one bar for each month
  rows.forEach(function (row) {

    const column = document.createElement("div");
    column.className = "analytics-bar-item";

    const track = document.createElement("div");
    track.className = "analytics-bar-track";

    
// Revenue bar
const revenueBar = document.createElement("div");
revenueBar.className = "analytics-bar";

revenueBar.style.height =
  (row.revenue / maximumValue * 100) + "%";

// Expense bar
const expenseBar = document.createElement("div");
expenseBar.className =
  "analytics-bar analytics-expense-bar";

expenseBar.style.height =
  (row.expenses / maximumValue * 100) + "%";


    const label = document.createElement("span");
    label.textContent = row.month;

    
const value = document.createElement("span");

value.textContent =
  "R: " + formatCHF(row.revenue) +
  " | E: " + formatCHF(row.expenses);

track.append(revenueBar, expenseBar);

    column.append(track, label, value);
    salesChart.appendChild(column);

  });

  
salesChart.setAttribute(
  "aria-label",
  rows.map(row =>
    `${row.month}: revenue ${formatCHF(row.revenue)}, ` +
    `expenses ${formatCHF(row.expenses)}`
  ).join("; ")
);

// Update comparisons and financial insights
updateAnalyticsInterpretation(rows);

}

// Read a simple, comma-separated CSV
function parseBusinessCSV(text) {

  const lines = text.replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .filter(line => line.trim() !== "");

  const header = lines.shift();

  if (!header ||
      header.trim() !== "month,revenue_chf,expenses_chf") {
    throw new Error("Incorrect CSV column headers.");
  }

  if (lines.length < 1 || lines.length > 36) {
    throw new Error("Use between 1 and 36 monthly records.");
  }

  const months = new Set();

  const rows = lines.map(function (line) {

    const values = line.split(",").map(v => v.trim());

    if (values.length !== 3) {
      throw new Error("Each row must contain three values.");
    }

    const [month, revenueText, expensesText] = values;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new Error("Invalid month: " + month);
    }

    if (months.has(month)) {
      throw new Error("Duplicate month: " + month);
    }

    months.add(month);

    if (!revenueText || !expensesText) {
      throw new Error("Missing financial value.");
    }

    const revenue = Number(revenueText);
    const expenses = Number(expensesText);

    if (!Number.isFinite(revenue) ||
        !Number.isFinite(expenses) ||
        revenue < 0 || expenses < 0) {
      throw new Error("Invalid number in " + month);
    }

    return { month, revenue, expenses };

  });

  return rows.sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

// STAGE 11.3: FINANCIAL INTERPRETATION

function updateAnalyticsInterpretation(rows) {

  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];

  // Check whether the last two months are consecutive
  if (!previous) {

    salesComparison.textContent =
      "At least two months are needed for a comparison.";

  } else {

    const expectedPrevious = new Date(
      latest.month + "-01T00:00:00Z"
    );

    expectedPrevious.setUTCMonth(
      expectedPrevious.getUTCMonth() - 1
    );

    const expectedMonth =
      expectedPrevious.toISOString().slice(0, 7);

    if (previous.month !== expectedMonth) {

      salesComparison.textContent =
        "The last two selected months are not consecutive. " +
        "A month-over-month comparison is unavailable.";

    } else {

      const revenueChange =
        latest.revenue - previous.revenue;

      const expenseChange =
        latest.expenses - previous.expenses;

      const latestProfit =
        latest.revenue - latest.expenses;

      const previousProfit =
        previous.revenue - previous.expenses;

      const profitChange =
        latestProfit - previousProfit;

      // Convert changes to percentages when possible
      function percentChange(change, previousValue) {

        if (previousValue === 0) {
          return "N/A (previous value was zero)";
        }

        const percentage =
          change / previousValue * 100;

        return (percentage >= 0 ? "+" : "") +
          percentage.toFixed(1) + "%";
      }

      salesComparison.textContent =
        `Monthly comparison (${previous.month} to ${latest.month}) — ` +
        `Revenue: ${percentChange(revenueChange, previous.revenue)}. ` +
        `Expenses: ${percentChange(expenseChange, previous.expenses)}. ` +
        `Profit change: ${formatCHF(profitChange)}.`;
    }
  }

  // Identify highest-revenue month
  const bestRevenueMonth = rows.reduce(
    (best, row) =>
      row.revenue > best.revenue ? row : best
  );

  // Identify highest-profit month
  const bestProfitMonth = rows.reduce(
    (best, row) =>
      (row.revenue - row.expenses) >
      (best.revenue - best.expenses) ? row : best
  );

  const totalRevenue = rows.reduce(
    (sum, row) => sum + row.revenue, 0
  );

  const totalExpenses = rows.reduce(
    (sum, row) => sum + row.expenses, 0
  );

  const expenseRatio = totalRevenue > 0
    ? (totalExpenses / totalRevenue * 100).toFixed(1) + "%"
    : "N/A (zero revenue)";

  // Generate factual financial observations
  const insights = [
    `Highest revenue: ${bestRevenueMonth.month} ` +
    `(${formatCHF(bestRevenueMonth.revenue)}).`,

    `Highest profit: ${bestProfitMonth.month} ` +
    `(${formatCHF(
      bestProfitMonth.revenue - bestProfitMonth.expenses
    )}).`,

    `Expenses represented ${expenseRatio} of revenue ` +
    `during the selected period.`
  ];

  // Replace existing insights
  salesInsights.replaceChildren();

  insights.forEach(function (insight) {

    const item = document.createElement("li");
    item.textContent = insight;
    salesInsights.appendChild(item);

  });
}


// STAGE 11.3: DATE FILTERING

function applyMonthFilter() {

  const from = monthFromInput.value;
  const to = monthToInput.value;

  let message = "";

  if (from && to && from > to) {

    message = "The start month must not be after the end month.";

  } else {

    const filteredRows = currentData.filter(function (row) {

      return (!from || row.month >= from) &&
             (!to || row.month <= to);

    });

    if (filteredRows.length > 0) {

      displayAnalytics(filteredRows);

      analyticsStatus.textContent =
        `${datasetName}: showing ${filteredRows.length} ` +
        `of ${currentData.length} monthly records.`;

      return;

    } else {

      message = "No records match the selected months.";

    }
  }

  // Clear outdated results if the filter is invalid or empty
  ["sales-revenue", "sales-expenses",
   "sales-profit", "sales-margin"].forEach(function (id) {

    document.querySelector("#" + id).textContent = "—";

  });

  salesChart.replaceChildren();
  salesComparison.textContent = "No comparison available.";
  salesInsights.replaceChildren();
  analyticsStatus.textContent = message;
}

// Read a file selected by the visitor
csvInput.addEventListener("change", async function () {

  const file = csvInput.files[0];

  if (!file) return;

  try {

    if (file.size > 1024 * 1024) {
      throw new Error("File exceeds the 1 MB limit.");
    }

    const text = await file.text();
    const rows = parseBusinessCSV(text);

    
// Save the newly imported dataset
currentData = rows;
datasetName = file.name;

// Reset filters when loading a new file
monthFromInput.value = "";
monthToInput.value = "";

// Recalculate the complete dashboard
applyMonthFilter();


  } catch (error) {

    analyticsStatus.textContent =
      "Could not load file: " + error.message;

  }

});


// Update when the date filters change
monthFromInput.addEventListener(
  "change", applyMonthFilter
);

monthToInput.addEventListener(
  "change", applyMonthFilter
);

// Reset both filters
resetFiltersButton.addEventListener("click", function () {

  monthFromInput.value = "";
  monthToInput.value = "";

  applyMonthFilter();

});

// Display fictional data when the page opens
applyMonthFilter();

