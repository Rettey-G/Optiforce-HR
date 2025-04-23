// nav_hamburger.js: Handles hamburger menu toggle for mobile nav

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('mobile-menu-btn');
    const navbarMenu = document.getElementById('navbar-menu');

    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', function (e) {
            navbarMenu.classList.toggle('open');
            console.log('Hamburger clicked. Menu open:', navbarMenu.classList.contains('open'));
        });
        // Close the menu when any link is clicked
        navbarMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('open');
            });
        });
    }
});
