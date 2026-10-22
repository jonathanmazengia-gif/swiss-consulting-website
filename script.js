
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
