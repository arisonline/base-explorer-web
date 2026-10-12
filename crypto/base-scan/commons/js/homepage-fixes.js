(() => {
    const RPC = 'https://mainnet.base.org';

    async function loadGasTracker() {
        const content = document.getElementById('gasTrackerContent');
        const updated = document.getElementById('gasTrackerUpdated');
        if (content) content.innerHTML = '<div class="gas-loading">Loading...</div>';
        try {
            const response = await fetch(RPC, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] })
            });
            if (!response.ok) throw new Error('RPC request failed');
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'RPC error');
            const value = BigInt(data.result);
            const whole = value / 1000000000n;
            const fraction = (value % 1000000000n).toString().padStart(9, '0').slice(0, 6);
            const text = `${whole}.${fraction} Gwei`;
            if (content) content.innerHTML = `<div class="gas-current-value">${text}</div><div class="gas-current-label">Current gas price</div>`;
            if (updated) updated.textContent = `Updated ${new Date().toLocaleTimeString()}`;
            const headerGas = document.getElementById('headerGasValue');
            if (headerGas) headerGas.textContent = text;
        } catch {
            if (content) content.innerHTML = '<div class="gas-current-value">Unavailable</div><div class="gas-current-label">Current gas price</div>';
            if (updated) updated.textContent = 'Unable to load';
            const headerGas = document.getElementById('headerGasValue');
            if (headerGas) headerGas.textContent = 'Unavailable';
        }
    }

    function openGasTracker(event) {
        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        const panel = document.getElementById('gasTrackerPanel');
        if (!panel) return;
        panel.classList.add('show');
        panel.setAttribute('aria-hidden', 'false');
        loadGasTracker();
    }

    function closeGasTracker(event) {
        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        const panel = document.getElementById('gasTrackerPanel');
        if (!panel) return;
        panel.classList.remove('show');
        panel.setAttribute('aria-hidden', 'true');
    }

    window.loadGasTracker = loadGasTracker;
    window.openGasTracker = openGasTracker;
    window.closeGasTracker = closeGasTracker;

    function fixHeader() {
        const form = document.querySelector('.explorer-header .search');
        const input = document.getElementById('headerSearchInput');
        if (form && input && form.dataset.homepageFix !== 'true') {
            form.dataset.homepageFix = 'true';
            form.addEventListener('submit', event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                const value = input.value.trim();
                if (typeof window.performSearch === 'function') window.performSearch(value);
            }, true);
        }

        const gasButton = document.querySelector('.explorer-header .gas-button');
        if (gasButton && gasButton.dataset.homepageGasFix !== 'true') {
            gasButton.dataset.homepageGasFix = 'true';
            gasButton.addEventListener('click', openGasTracker, true);
        }

        const panel = document.getElementById('gasTrackerPanel');
        const close = panel?.querySelector('.gas-close');
        if (close && close.dataset.homepageGasCloseFix !== 'true') {
            close.dataset.homepageGasCloseFix = 'true';
            close.addEventListener('click', closeGasTracker, true);
        }

        const refresh = panel?.querySelector('.gas-tracker-footer button');
        if (refresh && refresh.dataset.homepageGasRefreshFix !== 'true') {
            refresh.dataset.homepageGasRefreshFix = 'true';
            refresh.addEventListener('click', event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                loadGasTracker();
            }, true);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixHeader, { once: true });
    else fixHeader();
})();