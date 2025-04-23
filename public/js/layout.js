// layout.js: Dynamically injects nav and footer into all pages

function includeHTML(id, url) {
    fetch(url)
        .then(res => res.text())
        .then(data => { document.getElementById(id).innerHTML = data; });
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('nav-placeholder')) {
        fetch('components/nav.html')
            .then(res => res.text())
            .then(data => {
                document.getElementById('nav-placeholder').innerHTML = data;
                
                // Check if user is admin and show admin dashboard link if they are
                const userRole = sessionStorage.getItem('userRole');
                if (userRole === 'admin') {
                    const adminLinks = document.querySelectorAll('.admin-only');
                    adminLinks.forEach(link => {
                        link.style.display = 'inline-block';
                    });
                }
                
                // Now nav is in DOM, initialize hamburger menu
                if (window.initHamburgerMenu) {
                    window.initHamburgerMenu();
                } else {
                    // Dynamically load script, then run init
                    var script = document.createElement('script');
                    script.src = '/js/nav_hamburger.js';
                    script.onload = function() {
                        if (window.initHamburgerMenu) window.initHamburgerMenu();
                    };
                    document.body.appendChild(script);
                }
            });
    }
    if (document.getElementById('footer-placeholder')) {
        includeHTML('footer-placeholder', 'components/footer.html');
    }
});
