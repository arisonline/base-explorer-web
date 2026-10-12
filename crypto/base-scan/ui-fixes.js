(() => {
    const BASE = '/crypto/base-scan';
    const RPC = 'https://mainnet.base.org';

    async function rpc(method, params = []) {
        const response = await fetch(RPC, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
        });
        if (!response.ok) throw new Error('RPC request failed');
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'RPC error');
        return data.result;
    }

    function go(path) {
        window.location.assign(path);
    }

    async function search(value) {
        value = String(value || '').trim();
        if (/^\d+$/.test(value)) return go(`${BASE}/block/${value}/`);
        if (/^0x[a-fA-F0-9]{64}$/.test(value)) return go(`${BASE}/tx/${value}/`);
        if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
            try {
                const code = await rpc('eth_getCode', [value, 'latest']);
                if (!code || code === '0x') return go(`${BASE}/address/${value}/`);
                const symbol = await rpc('eth_call', [{ to: value, data: '0x95d89b41' }, 'latest']).catch(() => '0x');
                const decimals = await rpc('eth_call', [{ to: value, data: '0x313ce567' }, 'latest']).catch(() => '0x');
                return go(`${BASE}/${symbol !== '0x' && decimals !== '0x' ? 'token' : 'contract'}/${value}/`);
            } catch {
                return go(`${BASE}/contract/${value}/`);
            }
        }
        alert('Enter a valid block number, transaction hash or 0x address.');
    }

    async function gas() {
        try {
            const value = BigInt(await rpc('eth_gasPrice'));
            const whole = value / 1000000000n;
            const fraction = (value % 1000000000n).toString().padStart(9, '0').slice(0, 6);
            return `${whole}.${fraction} Gwei`;
        } catch {
            return 'Unavailable';
        }
    }

    async function openGasPanel() {
        const collectionPanel = document.getElementById('gasPanel');
        const homePanel = document.getElementById('gasTrackerPanel');

        if (collectionPanel) {
            collectionPanel.classList.add('show');
            const value = await gas();
            const header = document.getElementById('headerGas');
            const body = document.getElementById('gasValue');
            const updated = document.getElementById('gasUpdated');
            if (header) header.textContent = value;
            if (body) body.textContent = value;
            if (updated) updated.textContent = value === 'Unavailable' ? 'Unable to load' : `Updated ${new Date().toLocaleTimeString()}`;
            return;
        }

        if (homePanel) {
            homePanel.classList.add('show');
            homePanel.setAttribute('aria-hidden', 'false');
            const value = await gas();
            const content = document.getElementById('gasTrackerContent');
            const updated = document.getElementById('gasTrackerUpdated');
            const header = document.getElementById('headerGasValue');
            if (header) header.textContent = value;
            if (content) content.innerHTML = `<div class="gas-current-value">${value}</div><div class="gas-current-label">Current gas price</div>`;
            if (updated) updated.textContent = value === 'Unavailable' ? 'Unable to load' : `Updated ${new Date().toLocaleTimeString()}`;
        }
    }

    function closeGasPanel() {
        document.getElementById('gasPanel')?.classList.remove('show');
        const homePanel = document.getElementById('gasTrackerPanel');
        if (homePanel) {
            homePanel.classList.remove('show');
            homePanel.setAttribute('aria-hidden', 'true');
        }
    }

    document.addEventListener('submit', event => {
        const form = event.target.closest('.explorer-header .search');
        if (!form) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const input = form.querySelector('input');
        search(input?.value || '');
    }, true);

    document.addEventListener('click', event => {
        const gasButton = event.target.closest('.explorer-header .gas-button');
        if (gasButton) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openGasPanel();
            return;
        }

        const closeButton = event.target.closest('.gas-close');
        if (closeButton && (document.getElementById('gasPanel') || document.getElementById('gasTrackerPanel'))) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeGasPanel();
        }
    }, true);
})();
