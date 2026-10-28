
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

  const maximumRevenue = Math.max(
    1, ...rows.map(row => row.revenue)
  );

  // Create one bar for each month
  rows.forEach(function (row) {

    const column = document.createElement("div");
    column.className = "analytics-bar-item";

    const track = document.createElement("div");
    track.className = "analytics-bar-track";

    const bar = document.createElement("div");
    bar.className = "analytics-bar";

    bar.style.height =
      (row.revenue / maximumRevenue * 100) + "%";

    const label = document.createElement("span");
    label.textContent = row.month;

    const value = document.createElement("span");
    value.textContent = formatCHF(row.revenue);

    track.appendChild(bar);
    column.append(track, label, value);
    salesChart.appendChild(column);

  });

  salesChart.setAttribute(
    "aria-label",
    rows.map(row =>
      `${row.month}: ${formatCHF(row.revenue)}`
    ).join("; ")
  );
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

    displayAnalytics(rows);

    analyticsStatus.textContent =
      `Loaded ${rows.length} records from ${file.name}.`;

  } catch (error) {

    analyticsStatus.textContent =
      "Could not load file: " + error.message;

  }

});

// Display fictional data when the page opens
displayAnalytics(sampleData);
