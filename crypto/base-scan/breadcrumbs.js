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
                width: min(1240px, 94%);
                margin: 0 auto 16px;
                padding-top: 20px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 7px;
                color: #8a8a98;
                font-size: 12px;
                line-height: 1.5;
            }
            .base-scan-breadcrumbs a {
                color: #686878;
                text-decoration: none;
                font-weight: 600;
            }
            .base-scan-breadcrumbs a:hover {
                color: #635bff;
            }
            .base-scan-breadcrumbs .separator {
                color: #b5b5c0;
            }
            .base-scan-breadcrumbs .current {
                color: #17171c;
                font-weight: 700;
            }
            @media (max-width: 700px) {
                .base-scan-breadcrumbs {
                    width: calc(100% - 28px);
                    padding-top: 14px;
                    margin-bottom: 12px;
                    font-size: 11px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function render() {
        const items = getItems();
        if (!items) return;

        const existing = document.getElementById('baseScanBreadcrumbs');
        if (existing) existing.remove();

        const anchor = document.querySelector('.page-head');
        if (!anchor || !anchor.parentElement) return;

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

        anchor.parentElement.insertBefore(nav, anchor);

        const path = location.pathname;
        if (/\/crypto\/base-scan\/contract\/0x/i.test(path)) {
            const heading = anchor.querySelector('h1');
            if (heading && heading.textContent.trim() === 'Smart Contract') heading.textContent = 'Contract';
        }
    }

    function start() {
        ensureStyles();
        render();

        const app = document.getElementById('app');
        if (app) {
            const observer = new MutationObserver(render);
            observer.observe(app, { childList: true, subtree: true });
        }

        window.addEventListener('popstate', render);
        window.addEventListener('hashchange', render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
