
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
