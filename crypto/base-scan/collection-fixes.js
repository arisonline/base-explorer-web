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

    async function searchHeader(event) {
        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        const input = document.getElementById('headerSearch');
        const value = (input?.value || '').trim();
        if (/^\d+$/.test(value)) return location.assign(`${BASE}/block/${value}/`);
        if (/^0x[a-fA-F0-9]{64}$/.test(value)) return location.assign(`${BASE}/tx/${value}/`);
        if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
            try {
                const code = await rpc('eth_getCode', [value, 'latest']);
                if (!code || code === '0x') return location.assign(`${BASE}/address/${value}/`);
                const symbol = await rpc('eth_call', [{ to: value, data: '0x95d89b41' }, 'latest']).catch(() => '0x');
                const decimals = await rpc('eth_call', [{ to: value, data: '0x313ce567' }, 'latest']).catch(() => '0x');
                return location.assign(`${BASE}/${symbol !== '0x' && decimals !== '0x' ? 'token' : 'contract'}/${value}/`);
            } catch {
                return location.assign(`${BASE}/contract/${value}/`);
            }
        }
        alert('Enter a valid block number, transaction hash or 0x address.');
    }

    function bind() {
        const form = document.querySelector('.explorer-header .search');
        if (!form || form.dataset.collectionFix === 'true') return;
        form.dataset.collectionFix = 'true';
        form.addEventListener('submit', searchHeader, true);

        const gasButton = document.querySelector('.explorer-header .gas-button');
        const gasPanel = document.getElementById('gasPanel');
        if (gasButton && !gasButton.dataset.collectionGasFix) {
            gasButton.dataset.collectionGasFix = 'true';
            gasButton.addEventListener('click', event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                gasPanel?.classList.add('show');
                if (typeof window.loadGas === 'function') window.loadGas();
            }, true);
        }

        const close = gasPanel?.querySelector('.gas-close');
        if (close && !close.dataset.collectionGasCloseFix) {
            close.dataset.collectionGasCloseFix = 'true';
            close.addEventListener('click', event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                gasPanel.classList.remove('show');
            }, true);
        }
    }

    window.headerSearch = searchHeader;
    bind();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
})();