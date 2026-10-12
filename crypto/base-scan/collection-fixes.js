(() => {
    const BASE = '/crypto/base-scan';
    const RPC = 'https://mainnet.base.org';

    async function searchHeader() {
        const input = document.getElementById('headerSearch');
        const value = (input?.value || '').trim();
        if (/^\d+$/.test(value)) return location.assign(`${BASE}/block/${value}/`);
        if (/^0x[a-fA-F0-9]{64}$/.test(value)) return location.assign(`${BASE}/tx/${value}/`);
        if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
            try {
                const response = await fetch(RPC, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [value, 'latest'] })
                });
                const data = await response.json();
                if (!data.error && (!data.result || data.result === '0x')) return location.assign(`${BASE}/address/${value}/`);
            } catch {}
            return location.assign(`${BASE}/contract/${value}/`);
        }
        alert('Enter a valid block number, transaction hash or 0x address.');
    }

    function bind() {
        const form = document.querySelector('.explorer-header .search');
        if (!form || form.dataset.collectionFix === 'true') return;
        form.dataset.collectionFix = 'true';
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();
            searchHeader();
        });
    }

    window.headerSearch = searchHeader;
    bind();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
})();
