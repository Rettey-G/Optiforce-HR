// nav_active.js: Dynamically set .active class for nav links based on current page

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.navbar-menu .nav-link');
    const path = window.location.pathname.replace(/\/+/g, '/');
    navLinks.forEach(link => {
        // Only match the main part of the URL
        if (link.getAttribute('href') && path.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
