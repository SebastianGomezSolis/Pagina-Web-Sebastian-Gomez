(function() {
    'use strict';

    const fill = document.getElementById('sidebarProgressFill');
    const text = document.getElementById('sidebarProgressText');
    if (!fill) return;

    const target = parseInt(fill.getAttribute('data-progress')) || 0;

    setTimeout(function() {
        fill.style.width = target + '%';
    }, 300);

    if (text) {
        let current = 0;
        text.textContent = '0%';
        const step = Math.max(1, Math.ceil(target / 20));
        const interval = setInterval(function() {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            text.textContent = current + '%';
        }, 35);
    }
})();
