document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('visible');
        });
    }

    // Optional: Close the sidebar when clicking outside of it on mobile
    document.addEventListener('click', function(event) {
        if (sidebar.classList.contains('visible') && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('visible');
        }
    });
});