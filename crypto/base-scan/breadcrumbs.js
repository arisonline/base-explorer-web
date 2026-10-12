(function () {
    const BASE = '/crypto/base-scan';
    const CRYPTO = '/crypto/';

    const labels = {
        blocks: 'Blocks',
        transactions: 'Transactions',
        addresses: 'Addresses',
        tokens: 'Tokens',
        contracts: 'Contracts'
    };

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function short(value, start = 12, end = 8) {
        const s = String(value || '');
        return s.length > start + end + 3 ? `${s.slice(0, start)}...${s.slice(-end)}` : s;
    }

    function getItems() {
        const path = location.pathname.replace(/\/+$/, '') || '/';
        if (path === BASE) return null;

        const parts = path.split('/').filter(Boolean);
        const baseIndex = parts.indexOf('base-scan');
        if (baseIndex === -1) return null;

        const rest = parts.slice(baseIndex + 1);
        const items = [
            { text: 'Home', href: '/' },
            { text: 'Crypto', href: CRYPTO },
            { text: 'Base Scan', href: `${BASE}/` }
        ];

        if (!rest.length) return items;

        const type = rest[0];
        if (labels[type] && rest.length === 1) {
            items.push({ text: labels[type] });
            return items;
        }

        const detailLabels = {
            block: 'Block',
            tx: 'Transaction',
            address: 'Address',
            token: 'Token',
            contract: 'Contract'
        };

        if (!detailLabels[type]) return items;

        items.push({ text: detailLabels[type] });

        if (rest[1]) {
            let value = rest[1];
            if (type === 'block' && /^\d+$/.test(value)) {
                value = `#${Number(value).toLocaleString('en-IN')}`;
            } else if (/^0x[a-fA-F0-9]{40,64}$/.test(value)) {
                value = short(value);
            }
            items.push({ text: value });
        }

        return items;
    }

    function ensureStyles() {
        if (document.getElementById('baseScanBreadcrumbStyles')) return;
        const style = document.createElement('style');
        style.id = 'baseScanBreadcrumbStyles';
        style.textContent = `
            .base-scan-breadcrumbs {
                width: 100%;
                margin: 0 0 14px;
                padding: 18px 0 0;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                color: #666b78;
                font-size: 14px;
                line-height: 1.55;
            }
            .base-scan-breadcrumbs a {
                color: #4f5665;
                text-decoration: none;
                font-weight: 600;
                transition: color .16s ease;
            }
            .base-scan-breadcrumbs a:hover {
                color: #635bff;
            }
            .base-scan-breadcrumbs .separator {
                color: #aeb4c0;
            }
            .base-scan-breadcrumbs .current {
                color: #17171c;
                font-weight: 700;
            }

            /* =====================================================
               READABILITY + THEME SYSTEM
            ===================================================== */
            :root {
                color-scheme: light;
            }

            html[data-theme="dark"] {
                color-scheme: dark;
            }

            body {
                font-size: 16px !important;
                background: #ffffff !important;
                color: #17171c !important;
            }

            body,
            button,
            input,
            select,
            textarea {
                font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            }

            p,
            li,
            td,
            th,
            .page-intro,
            .hero p,
            .stat-sub,
            .item-sub,
            .loading,
            .loading-item {
                font-size: 15px !important;
            }

            .site-nav a,
            .explorer-nav a {
                font-size: 15px !important;
            }

            .header-search input,
            .header-search button,
            .hero-search input,
            .hero-search button {
                font-size: 14px !important;
            }

            .footer-brand p,
            .footer-column a,
            .footer-column h3,
            .footer-network,
            .footer-bottom {
                font-size: 13px !important;
            }

            .theme-toggle {
                width: 38px;
                height: 38px;
                flex: 0 0 38px;
                border: 1px solid #dfe3ea;
                border-radius: 9px;
                background: #ffffff;
                color: #252832;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
            }
            .theme-toggle:hover {
                border-color: #635bff;
                color: #635bff;
                transform: translateY(-1px);
            }
            .theme-toggle:focus-visible {
                outline: 2px solid #635bff;
                outline-offset: 2px;
            }

            /* White-based light theme */
            body,
            .site-header,
            .explorer-header,
            .site-footer,
            .explorer-footer,
            .hero,
            .card,
            .stat-card,
            .page,
            .gas-tracker-card,
            .header-search,
            .hero-search,
            .gas-header-button,
            .theme-toggle {
                background-color: #ffffff !important;
            }

            .site-header,
            .explorer-header,
            .site-footer,
            .explorer-footer,
            .card,
            .stat-card,
            .gas-tracker-card,
            .header-search,
            .hero-search,
            .gas-header-button,
            .theme-toggle {
                border-color: #e2e5ea !important;
            }

            .card,
            .stat-card {
                box-shadow: 0 2px 10px rgba(15, 23, 42, .045) !important;
            }

            .hero,
            main,
            .content,
            .container,
            .detail-container,
            .page {
                background-color: #ffffff !important;
            }

            .card-header,
            .footer-bottom,
            .gas-tracker-header,
            .gas-tracker-footer {
                border-color: #e7e9ee !important;
            }

            .gas-info-item,
            .list-item:hover,
            .mobile-navigation a:hover {
                background: #f7f8fa !important;
            }

            .site-logo,
            .site-nav a,
            .explorer-nav a,
            .footer-column h3,
            .card-header,
            .detail-value,
            .item-title,
            .stat-value,
            .page h1,
            .hero h1,
            .base-scan-breadcrumbs .current {
                color: #17171c !important;
            }

            .site-nav a,
            .explorer-nav a,
            .footer-column a,
            .base-scan-breadcrumbs a {
                color: #4f5665 !important;
            }

            .site-nav a:hover,
            .explorer-nav a:hover,
            .footer-column a:hover,
            .base-scan-breadcrumbs a:hover {
                color: #635bff !important;
            }

            .header-search,
            .hero-search {
                background: #f7f8fa !important;
            }

            .header-search input,
            .hero-search input {
                color: #17171c !important;
            }

            /* Dark theme */
            html[data-theme="dark"] body {
                background: #0b0d10 !important;
                color: #eef1f5 !important;
            }

            html[data-theme="dark"] body,
            html[data-theme="dark"] .site-header,
            html[data-theme="dark"] .explorer-header,
            html[data-theme="dark"] .site-footer,
            html[data-theme="dark"] .explorer-footer,
            html[data-theme="dark"] .hero,
            html[data-theme="dark"] .card,
            html[data-theme="dark"] .stat-card,
            html[data-theme="dark"] .page,
            html[data-theme="dark"] .container,
            html[data-theme="dark"] main,
            html[data-theme="dark"] .content,
            html[data-theme="dark"] .detail-container {
                background-color: #0b0d10 !important;
            }

            html[data-theme="dark"] .card,
            html[data-theme="dark"] .stat-card,
            html[data-theme="dark"] .gas-tracker-card,
            html[data-theme="dark"] .header-search,
            html[data-theme="dark"] .hero-search,
            html[data-theme="dark"] .gas-header-button,
            html[data-theme="dark"] .theme-toggle,
            html[data-theme="dark"] .gas-info-item {
                background: #12161b !important;
                border-color: #29303a !important;
                box-shadow: none !important;
            }

            html[data-theme="dark"] .site-header,
            html[data-theme="dark"] .explorer-header,
            html[data-theme="dark"] .site-footer,
            html[data-theme="dark"] .explorer-footer {
                background: #0f1216 !important;
                border-color: #29303a !important;
            }

            html[data-theme="dark"] .card-header,
            html[data-theme="dark"] .footer-bottom,
            html[data-theme="dark"] .gas-tracker-header,
            html[data-theme="dark"] .gas-tracker-footer,
            html[data-theme="dark"] .table-wrapper,
            html[data-theme="dark"] table,
            html[data-theme="dark"] th,
            html[data-theme="dark"] td {
                border-color: #29303a !important;
            }

            html[data-theme="dark"] .site-logo,
            html[data-theme="dark"] .site-nav a,
            html[data-theme="dark"] .explorer-nav a,
            html[data-theme="dark"] .footer-column h3,
            html[data-theme="dark"] .card-header,
            html[data-theme="dark"] .detail-value,
            html[data-theme="dark"] .item-title,
            html[data-theme="dark"] .stat-value,
            html[data-theme="dark"] .page h1,
            html[data-theme="dark"] .page h2,
            html[data-theme="dark"] .page h3,
            html[data-theme="dark"] .hero h1,
            html[data-theme="dark"] .base-scan-breadcrumbs .current,
            html[data-theme="dark"] .transaction-hash,
            html[data-theme="dark"] .address,
            html[data-theme="dark"] th {
                color: #eef1f5 !important;
            }

            html[data-theme="dark"] p,
            html[data-theme="dark"] li,
            html[data-theme="dark"] td,
            html[data-theme="dark"] .page-intro,
            html[data-theme="dark"] .hero p,
            html[data-theme="dark"] .stat-sub,
            html[data-theme="dark"] .item-sub,
            html[data-theme="dark"] .loading,
            html[data-theme="dark"] .loading-item,
            html[data-theme="dark"] .footer-brand p,
            html[data-theme="dark"] .footer-column a,
            html[data-theme="dark"] .footer-network,
            html[data-theme="dark"] .footer-bottom,
            html[data-theme="dark"] .gas-tracker-header span,
            html[data-theme="dark"] .gas-tracker-footer span,
            html[data-theme="dark"] .gas-label,
            html[data-theme="dark"] .gas-info-item span,
            html[data-theme="dark"] .gas-info-item strong,
            html[data-theme="dark"] .base-scan-breadcrumbs,
            html[data-theme="dark"] .base-scan-breadcrumbs .separator {
                color: #aeb6c2 !important;
            }

            html[data-theme="dark"] .site-nav a,
            html[data-theme="dark"] .explorer-nav a,
            html[data-theme="dark"] .footer-column a,
            html[data-theme="dark"] .base-scan-breadcrumbs a {
                color: #c4cbd5 !important;
            }

            html[data-theme="dark"] .site-nav a:hover,
            html[data-theme="dark"] .explorer-nav a:hover,
            html[data-theme="dark"] .footer-column a:hover,
            html[data-theme="dark"] .base-scan-breadcrumbs a:hover {
                color: #8b84ff !important;
            }

            html[data-theme="dark"] .header-search,
            html[data-theme="dark"] .hero-search {
                background: #12161b !important;
            }

            html[data-theme="dark"] .header-search input,
            html[data-theme="dark"] .hero-search input {
                color: #eef1f5 !important;
            }

            html[data-theme="dark"] .header-search input::placeholder,
            html[data-theme="dark"] .hero-search input::placeholder {
                color: #7f8997 !important;
            }

            html[data-theme="dark"] .theme-toggle {
                background: #171c22 !important;
                color: #f3f5f7 !important;
                border-color: #39414c !important;
            }

            html[data-theme="dark"] .mobile-navigation {
                background: #0f1216 !important;
                border-color: #29303a !important;
            }

            html[data-theme="dark"] .list-item:hover,
            html[data-theme="dark"] .mobile-navigation a:hover {
                background: #181d23 !important;
            }

            html[data-theme="dark"] .copy-button,
            html[data-theme="dark"] .gas-close,
            html[data-theme="dark"] .gas-header-button {
                color: #c4cbd5 !important;
            }

            @media (max-width: 700px) {
                .base-scan-breadcrumbs {
                    margin-bottom: 10px;
                    padding-top: 14px;
                    gap: 6px;
                    font-size: 13px;
                }
            }

            @media (max-width: 520px) {
                .theme-toggle {
                    width: 36px;
                    height: 36px;
                    flex-basis: 36px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('dozni-base-theme', theme); } catch {}
        const button = document.getElementById('baseScanThemeToggle');
        if (button) {
            const dark = theme === 'dark';
            button.textContent = dark ? '☀' : '☾';
            button.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
            button.setAttribute('aria-label', button.title);
        }
    }

    function getStoredTheme() {
        try {
            const saved = localStorage.getItem('dozni-base-theme');
            if (saved === 'dark' || saved === 'light') return saved;
        } catch {}
        return 'light';
    }

    function addThemeToggle() {
        if (document.getElementById('baseScanThemeToggle')) return;

        const button = document.createElement('button');
        button.id = 'baseScanThemeToggle';
        button.className = 'theme-toggle';
        button.type = 'button';
        button.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });

        const host = document.querySelector('.header-actions, .explorer-header-actions, .header-right');
        if (host) {
            host.appendChild(button);
            applyTheme(document.documentElement.getAttribute('data-theme') || getStoredTheme());
            return;
        }

        const header = document.querySelector('.site-header-inner, .explorer-header-inner, .header-inner');
        if (header) {
            header.appendChild(button);
            applyTheme(document.documentElement.getAttribute('data-theme') || getStoredTheme());
        }
    }

    function initTheme() {
        ensureStyles();
        applyTheme(getStoredTheme());
        addThemeToggle();
    }

    function render() {
        const items = getItems();
        if (!items) return;

        const existing = document.getElementById('baseScanBreadcrumbs');
        if (existing) return;

        ensureStyles();

        const nav = document.createElement('nav');
        nav.id = 'baseScanBreadcrumbs';
        nav.className = 'base-scan-breadcrumbs';
        nav.setAttribute('aria-label', 'Breadcrumb');
        nav.innerHTML = items.map((item, index) => {
            const separator = index ? '<span class="separator">/</span>' : '';
            const content = item.href
                ? `<a href="${item.href}">${esc(item.text)}</a>`
                : `<span class="current">${esc(item.text)}</span>`;
            return separator + content;
        }).join('');

        const detailContainer = document.querySelector('.detail-container');
        if (detailContainer) {
            detailContainer.insertBefore(nav, detailContainer.firstChild);
            return;
        }

        const pageHead = document.querySelector('.page-head');
        if (pageHead && pageHead.parentElement) {
            pageHead.parentElement.insertBefore(nav, pageHead);
        }
    }

    function start() {
        ensureStyles();
        initTheme();
        render();

        const app = document.getElementById('app');
        if (app) {
            const observer = new MutationObserver(() => {
                render();
                addThemeToggle();
            });
            observer.observe(app, { childList: true, subtree: true });
        }

        window.addEventListener('popstate', () => {
            render();
            addThemeToggle();
        });
        window.addEventListener('hashchange', () => {
            render();
            addThemeToggle();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
