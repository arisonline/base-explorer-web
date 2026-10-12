(function () {
    const KEY = 'dozni-base-scan-theme';

    function applyTheme(theme) {
        const value = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', value);
        localStorage.setItem(KEY, value);
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.textContent = value === 'dark' ? '☀' : '☾';
            button.setAttribute('aria-label', value === 'dark' ? 'Switch to light theme' : 'Switch to black theme');
            button.title = value === 'dark' ? 'Light theme' : 'Black theme';
        });
    }

    function toggleTheme() {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }

    function addButton() {
        if (document.querySelector('.theme-toggle')) return;
        const host = document.querySelector('.header-tools') || document.querySelector('.explorer-header-inner') || document.querySelector('.header-inner');
        if (!host) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'theme-toggle';
        button.addEventListener('click', toggleTheme);
        host.appendChild(button);
        applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    }

    const saved = localStorage.getItem(KEY);
    applyTheme(saved === 'dark' ? 'dark' : 'light');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addButton, { once: true });
    } else {
        addButton();
    }
})();
