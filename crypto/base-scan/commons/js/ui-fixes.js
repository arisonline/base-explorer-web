(() => {
    const BASE = '/crypto/base-scan';
    const RPC = 'https://mainnet.base.org';
    const BLOCKSCOUT = 'https://base.blockscout.com/api/v2';

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

    function addressArg(address) {
        return String(address).toLowerCase().replace(/^0x/, '').padStart(64, '0');
    }

    function validUint256(value) {
        return /^0x[0-9a-fA-F]{64}$/.test(String(value || ''));
    }

    async function looksLikeErc20(address) {
        // Blockscout has token-aware indexing and is the first classification source.
        try {
            const response = await fetch(`${BLOCKSCOUT}/tokens/${address}`, { cache: 'no-store' });
            if (response.ok) return true;
        } catch {}

        // Fallback to several core ERC-20 read methods. Metadata methods such as
        // symbol() and decimals() are optional in EIP-20, so they are not used alone.
        try {
            const owner = addressArg(address);
            const [totalSupply, balanceOf, allowance] = await Promise.all([
                rpc('eth_call', [{ to: address, data: '0x18160ddd' }, 'latest']),
                rpc('eth_call', [{ to: address, data: `0x70a08231${owner}` }, 'latest']),
                rpc('eth_call', [{ to: address, data: `0xdd62ed3e${owner}${owner}` }, 'latest'])
            ]);
            return validUint256(totalSupply) && validUint256(balanceOf) && validUint256(allowance);
        } catch {
            return false;
        }
    }

    async function resolveAddress(value) {
        const code = await rpc('eth_getCode', [value, 'latest']);
        if (!code || code === '0x') return 'address';
        return await looksLikeErc20(value) ? 'token' : 'contract';
    }

    async function search(value) {
        value = String(value || '').trim();
        if (/^\d+$/.test(value)) return go(`${BASE}/block/${value}/`);
        if (/^0x[a-fA-F0-9]{64}$/.test(value)) return go(`${BASE}/tx/${value}/`);
        if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
            try {
                const type = await resolveAddress(value);
                return go(`${BASE}/${type}/${value}/`);
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

    async function refreshGasUi() {
        const value = await gas();
        const header = document.getElementById('headerGasValue');
        const collectionHeader = document.getElementById('headerGas');
        const homeContent = document.getElementById('gasTrackerContent');
        const homeUpdated = document.getElementById('gasTrackerUpdated');
        const collectionValue = document.getElementById('gasValue');
        const collectionUpdated = document.getElementById('gasUpdated');

        if (header) header.textContent = value;
        if (collectionHeader) collectionHeader.textContent = value;
        if (homeContent) homeContent.innerHTML = `<div class="gas-current-value">${value}</div><div class="gas-current-label">Current gas price</div>`;
        if (collectionValue) collectionValue.textContent = value;
        if (homeUpdated) homeUpdated.textContent = value === 'Unavailable' ? 'Unable to load' : `Updated ${new Date().toLocaleTimeString()}`;
        if (collectionUpdated) collectionUpdated.textContent = value === 'Unavailable' ? 'Unable to load' : `Updated ${new Date().toLocaleTimeString()}`;
        return value;
    }

    async function openGasPanel() {
        const collectionPanel = document.getElementById('gasPanel');
        const homePanel = document.getElementById('gasTrackerPanel');

        if (collectionPanel) collectionPanel.classList.add('show');
        if (homePanel) {
            homePanel.classList.add('show');
            homePanel.setAttribute('aria-hidden', 'false');
        }
        await refreshGasUi();
    }

    function closeGasPanel() {
        document.getElementById('gasPanel')?.classList.remove('show');
        const homePanel = document.getElementById('gasTrackerPanel');
        if (homePanel) {
            homePanel.classList.remove('show');
            homePanel.setAttribute('aria-hidden', 'true');
        }
    }

    // One shared search implementation for every search surface.
    window.BaseScanSearch = { search, resolveAddress };
    window.BaseScanGas = { gas, refresh: refreshGasUi, open: openGasPanel, close: closeGasPanel };

    document.addEventListener('submit', event => {
        const headerForm = event.target.closest('.explorer-header .search');
        const collectionForm = event.target.closest('.route-search');
        if (!headerForm && !collectionForm) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const input = event.target.querySelector('input');
        if (headerForm) search(input?.value || '');
        else {
            const value = String(input?.value || '').trim();
            if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return alert('Enter a valid 0x address.');
            go(`${BASE}/${location.pathname.includes('/token') ? 'token' : location.pathname.includes('/contract') ? 'contract' : 'address'}/${value}/`);
        }
    }, true);

    document.addEventListener('click', event => {
        const heroButton = event.target.closest('.hero-search button');
        if (heroButton) {
            event.preventDefault();
            event.stopImmediatePropagation();
            search(document.getElementById('heroSearchInput')?.value || '');
            return;
        }

        const gasButton = event.target.closest('.explorer-header .gas-button');
        if (gasButton) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openGasPanel();
            return;
        }

        const homepageRefresh = event.target.closest('#gasTrackerRefresh');
        if (homepageRefresh) {
            event.preventDefault();
            event.stopImmediatePropagation();
            refreshGasUi();
            return;
        }

        const collectionRefresh = event.target.closest('#gasPanel .gas-foot button');
        if (collectionRefresh) {
            event.preventDefault();
            event.stopImmediatePropagation();
            refreshGasUi();
            return;
        }

        const closeButton = event.target.closest('.gas-close');
        if (closeButton && (document.getElementById('gasPanel') || document.getElementById('gasTrackerPanel'))) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeGasPanel();
        }
    }, true);

    document.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        const heroInput = event.target.closest('#heroSearchInput');
        if (!heroInput) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        search(heroInput.value || '');
    }, true);
})();