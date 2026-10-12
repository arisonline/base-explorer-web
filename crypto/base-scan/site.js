const BASE = '/crypto/base-scan';
const RPC = 'https://mainnet.base.org';
const BLOCKSCOUT = 'https://base.blockscout.com/api/v2';

const $ = id => document.getElementById(id);

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function short(value, start = 10, end = 8) {
    const s = String(value ?? '');
    return s.length > start + end + 3 ? `${s.slice(0, start)}...${s.slice(-end)}` : s;
}

function eth(value) {
    try {
        const wei = BigInt(value || 0);
        const whole = wei / 1000000000000000000n;
        const fraction = (wei % 1000000000000000000n).toString().padStart(18, '0').slice(0, 6);
        return `${whole}.${fraction} ETH`;
    } catch {
        return '0.000000 ETH';
    }
}

function gwei(value) {
    try {
        const wei = BigInt(value || 0);
        const whole = wei / 1000000000n;
        const fraction = (wei % 1000000000n).toString().padStart(9, '0').slice(0, 6);
        return `${whole}.${fraction} Gwei`;
    } catch {
        return '-';
    }
}

function txStatus(tx) {
    if (tx?.status === 'ok' || tx?.status === '0x1' || tx?.status === 1) return 'Success';
    if (tx?.status === 'error' || tx?.status === '0x0' || tx?.status === 0) return 'Failed';
    return 'Unknown';
}

function txTime(tx, fallbackTimestamp = '') {
    const value = tx?.timestamp || tx?.block_timestamp || fallbackTimestamp;
    if (!value) return '-';
    try {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date.toLocaleString();
        if (/^0x/i.test(String(value))) return new Date(parseInt(value, 16) * 1000).toLocaleString();
    } catch {}
    return '-';
}

async function rpc(method, params = []) {
    const response = await fetch(RPC, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    });
    if (!response.ok) throw new Error('Base RPC request failed');
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'RPC error');
    return data.result;
}

function route() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === BASE) return { type: 'home' };
    let m;
    if ((m = path.match(new RegExp(`^${BASE}/block/(\\d+)$`)))) return { type: 'block', value: m[1] };
    if ((m = path.match(new RegExp(`^${BASE}/tx/(0x[a-fA-F0-9]{64})$`)))) return { type: 'tx', value: m[1] };
    if ((m = path.match(new RegExp(`^${BASE}/address/(0x[a-fA-F0-9]{40})$`)))) return { type: 'address', value: m[1] };
    if ((m = path.match(new RegExp(`^${BASE}/token/(0x[a-fA-F0-9]{40})$`)))) return { type: 'token', value: m[1] };
    if ((m = path.match(new RegExp(`^${BASE}/contract/(0x[a-fA-F0-9]{40})$`)))) return { type: 'contract', value: m[1] };
    return { type: '404' };
}

function navigate(path) {
    if (!path) return;
    if (location.pathname === path && !location.search) return;
    history.pushState({}, '', path);
    render();
}

function link(path, text, className = '') {
    return `<a href="${path}"${className ? ` class="${className}"` : ''}>${text}</a>`;
}

function shell(content) {
    const app = $('app');
    if (app) app.innerHTML = content;
}

function pageHead() {
    return '<div class="container detail-container">';
}

async function renderHome() {
    shell(`<section class="hero"><div class="hero-inner"><div class="hero-badge"><span class="status-dot"></span>Base Mainnet <span>•</span> Chain ID 8453</div><h1>Explore Base</h1><p>Search Base Mainnet blocks, transactions, addresses, tokens and smart contracts.</p><div class="hero-search"><input id="heroSearchInput" placeholder="Search by address, transaction hash or block number..." autocomplete="off"><button onclick="searchFromHero()">Search</button></div><div class="hero-network"><strong>● Base Mainnet</strong> • Ethereum-compatible L2</div></div></section><div class="container"><section class="stats"><div class="stat-card"><div class="stat-title">Latest Block</div><div class="stat-value" id="latestBlock">Loading...</div><div class="stat-sub">Base Mainnet</div></div><div class="stat-card"><div class="stat-title">Network</div><div class="stat-value">Base Mainnet</div><div class="stat-sub">Ethereum Layer 2</div></div><div class="stat-card"><div class="stat-title">Chain ID</div><div class="stat-value">8453</div><div class="stat-sub">Base Mainnet</div></div></section><section class="content"><div class="columns"><div class="card"><div class="card-header"><h2>Latest Blocks</h2><a class="view-all" href="${BASE}/block/">View all</a></div><div id="latestBlocksList" class="list"><div class="loading-item">Loading latest blocks...</div></div></div><div class="card"><div class="card-header"><h2>Latest Transactions</h2><a class="view-all" href="${BASE}/tx/">View all</a></div><div id="latestTransactionsList" class="list"><div class="loading-item">Loading latest transactions...</div></div></div></div></section></div>`);
    const input = $('heroSearchInput');
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') searchFromHero(); });
    loadHomeData();
}

async function loadHomeData() {
    try {
        const latest = parseInt(await rpc('eth_blockNumber'), 16);
        if ($('latestBlock')) $('latestBlock').textContent = latest.toLocaleString();
        const blocks = await Promise.all(Array.from({ length: 5 }, (_, i) => rpc('eth_getBlockByNumber', ['0x' + (latest - i).toString(16), false])));
        if ($('latestBlocksList')) $('latestBlocksList').innerHTML = blocks.map(b => `<a class="list-item" href="${BASE}/block/${parseInt(b.number, 16)}"><span class="item-main"><span class="item-title">Block #${parseInt(b.number, 16).toLocaleString()}</span><span class="item-sub">${new Date(parseInt(b.timestamp, 16) * 1000).toLocaleTimeString()}</span></span><span class="item-value">${b.transactions?.length || 0} txns</span></a>`).join('');
        const fullBlocks = await Promise.all(Array.from({ length: 3 }, (_, i) => rpc('eth_getBlockByNumber', ['0x' + (latest - i).toString(16), true])));
        const txs = fullBlocks.flatMap(b => b?.transactions || []).slice(0, 5);
        if ($('latestTransactionsList')) $('latestTransactionsList').innerHTML = txs.length ? txs.map(tx => `<a class="list-item" href="${BASE}/tx/${tx.hash}"><span class="item-main"><span class="item-title">${short(tx.hash)}</span><span class="item-sub">Block ${parseInt(tx.blockNumber, 16).toLocaleString()} · ${txStatus(tx)} · ${txTime(tx)}</span></span><span class="item-value">${eth(tx.value)}</span></a>`).join('') : '<div class="loading-item">No recent transactions found.</div>';
    } catch (error) {
        console.error(error);
        if ($('latestBlock')) $('latestBlock').textContent = 'Unavailable';
        if ($('latestBlocksList')) $('latestBlocksList').innerHTML = '<div class="loading-item">Unable to load blocks.</div>';
        if ($('latestTransactionsList')) $('latestTransactionsList').innerHTML = '<div class="loading-item">Unable to load transactions.</div>';
    }
}

function searchFromHero() {
    const value = ($('heroSearchInput')?.value || '').trim();
    performSearch(value);
}

function searchFromHeader() {
    const value = ($('headerSearchInput')?.value || '').trim();
    performSearch(value);
}

async function performSearch(value) {
    if (/^\d+$/.test(value)) return navigate(`${BASE}/block/${value}`);
    if (/^0x[a-fA-F0-9]{64}$/.test(value)) return navigate(`${BASE}/tx/${value}`);
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
        try {
            const code = await rpc('eth_getCode', [value, 'latest']);
            if (!code || code === '0x') return navigate(`${BASE}/address/${value}`);
            const symbol = await rpc('eth_call', [{ to: value, data: '0x95d89b41' }, 'latest']).catch(() => '0x');
            const decimals = await rpc('eth_call', [{ to: value, data: '0x313ce567' }, 'latest']).catch(() => '0x');
            return navigate(`${BASE}/${symbol !== '0x' && decimals !== '0x' ? 'token' : 'contract'}/${value}`);
        } catch {
            return navigate(`${BASE}/contract/${value}`);
        }
    }
    alert('Enter a valid block number, transaction hash or 0x address.');
}

async function renderBlock(number) {
    shell(pageHead() + '<div id="detail" class="detail-stack"><div class="loading">Loading block...</div></div></div>');
    try {
        const block = await fetch(`${BLOCKSCOUT}/blocks/${encodeURIComponent(number)}`).then(r => { if (!r.ok) throw Error(); return r.json(); });
        const txs = await fetch(`${BLOCKSCOUT}/blocks/${encodeURIComponent(number)}/transactions`).then(r => r.ok ? r.json() : { items: [] });
        const miner = block.miner?.hash || '';
        const blockTimestamp = block.timestamp || '';
        $('detail').innerHTML = `<div class="card"><div class="card-header">Block Details <span class="network-badge">● Base Mainnet</span></div><div class="card-body"><div class="block-number">#${Number(block.height ?? number).toLocaleString()}</div></div><div class="details"><div class="detail-label">Block Hash</div><div class="detail-value hash">${esc(block.hash || '-')}</div><div class="detail-label">Parent Hash</div><div class="detail-value hash">${esc(block.parent_hash || '-')}</div><div class="detail-label">Timestamp</div><div class="detail-value">${esc(block.timestamp ? new Date(block.timestamp).toLocaleString() : '-')}</div><div class="detail-label">Validator / Miner</div><div class="detail-value">${miner ? link(`${BASE}/address/${miner}`, short(miner)) : '-'}</div><div class="detail-label">Transactions</div><div class="detail-value">${Number(block.transaction_count ?? txs.items?.length ?? 0).toLocaleString()}</div><div class="detail-label">Gas Used</div><div class="detail-value">${Number(block.gas_used ?? 0).toLocaleString()}</div><div class="detail-label">Gas Limit</div><div class="detail-value">${Number(block.gas_limit ?? 0).toLocaleString()}</div><div class="detail-label">Base Fee</div><div class="detail-value">${esc(gwei(block.base_fee_per_gas || 0))}</div></div></div><div class="card"><div class="card-header">Transactions</div><div class="card-body">${txs.items?.length ? `<div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>From</th><th>To</th><th>Value</th><th>Status</th><th>Time</th></tr></thead><tbody>${txs.items.slice(0,25).map(tx => `<tr><td>${link(`${BASE}/tx/${tx.hash}`, short(tx.hash))}</td><td>${tx.from?.hash ? link(`${BASE}/address/${tx.from.hash}`, short(tx.from.hash)) : '-'}</td><td>${tx.to?.hash ? link(`${BASE}/address/${tx.to.hash}`, short(tx.to.hash)) : '-'}</td><td>${eth(tx.value)}</td><td class="tx-status ${txStatus(tx)==='Success'?'success':txStatus(tx)==='Failed'?'failed':''}">${txStatus(tx)}</td><td>${esc(txTime(tx, blockTimestamp))}</td></tr>`).join('')}</tbody></table></div>` : 'No transactions found.'}</div></div><div class="card"><div class="card-header">Explorer Links</div><div class="card-body"><a class="explorer-link" href="https://basescan.org/block/${number}" target="_blank" rel="noopener noreferrer">View on BaseScan →</a></div></div>`;
    } catch { $('detail').innerHTML = '<div class="card"><div class="card-body">Unable to load this block.</div></div>'; }
}

async function renderTx(hash) {
    shell(pageHead() + '<div id="detail" class="detail-stack"><div class="loading">Loading transaction...</div></div></div>');
    try {
        const tx = await fetch(`${BLOCKSCOUT}/transactions/${encodeURIComponent(hash)}`).then(r => { if (!r.ok) throw Error(); return r.json(); });
        $('detail').innerHTML = `<div class="card"><div class="card-header">Transaction Details <span class="network-badge">● Base Mainnet</span></div><div class="card-body"><div class="detail-label">Transaction Hash</div><div class="transaction-hash-row"><div class="transaction-hash">${esc(hash)}</div><button class="copy-btn" onclick="copyText('${esc(hash)}',this)">Copy</button></div></div><div class="details"><div class="detail-label">Status</div><div class="detail-value">${txStatus(tx)}</div><div class="detail-label">Block</div><div class="detail-value">${tx.block_number != null ? link(`${BASE}/block/${tx.block_number}`, Number(tx.block_number).toLocaleString()) : '-'}</div><div class="detail-label">Timestamp</div><div class="detail-value">${esc(txTime(tx))}</div><div class="detail-label">From</div><div class="detail-value hash">${tx.from?.hash ? link(`${BASE}/address/${tx.from.hash}`, short(tx.from.hash)) : '-'}</div><div class="detail-label">To</div><div class="detail-value hash">${tx.to?.hash ? link(`${BASE}/address/${tx.to.hash}`, short(tx.to.hash)) : '-'}</div><div class="detail-label">Value</div><div class="detail-value">${eth(tx.value)}</div><div class="detail-label">Transaction Fee</div><div class="detail-value">${eth(tx.fee?.value || tx.fee || 0)}</div><div class="detail-label">Gas Price</div><div class="detail-value">${gwei(tx.gas_price || 0)}</div><div class="detail-label">Gas Used</div><div class="detail-value">${Number(tx.gas_used || 0).toLocaleString()}</div></div></div><div class="card"><div class="card-header">Explorer Links</div><div class="card-body"><a class="explorer-link" href="https://basescan.org/tx/${hash}" target="_blank" rel="noopener noreferrer">View on BaseScan →</a><a class="explorer-link secondary" href="https://base.blockscout.com/tx/${hash}" target="_blank" rel="noopener noreferrer">View on Blockscout →</a></div></div>`;
    } catch { $('detail').innerHTML = '<div class="card"><div class="card-body">Unable to load this transaction.</div></div>'; }
}

async function renderAddress(address) {
    shell(pageHead() + `<div id="detail" class="detail-stack"><div class="loading">Loading address...</div></div></div>`);
    try {
        const balance = await rpc('eth_getBalance', [address, 'latest']);
        const code = await rpc('eth_getCode', [address, 'latest']);
        const data = await fetch(`${BLOCKSCOUT}/addresses/${address}/transactions`).then(r => r.ok ? r.json() : { items: [] });
        const txs = data.items || [];
        $('detail').innerHTML = `<div class="card"><div class="card-header">Address <span class="network-badge">● Base Mainnet</span></div><div class="card-body"><div class="address-row"><div class="address">${esc(address)}</div><button class="copy-btn" onclick="copyText('${esc(address)}',this)">Copy</button></div></div><div class="details"><div class="detail-label">ETH Balance</div><div class="detail-value">${eth(balance)}</div><div class="detail-label">Address Type</div><div class="detail-value">${code && code !== '0x' ? 'Contract' : 'EOA'}</div><div class="detail-label">Network</div><div class="detail-value">Base Mainnet</div></div></div><div class="card"><div class="card-header">Recent Transactions</div><div class="card-body">${txs.length ? `<div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>Block</th><th>From</th><th>To</th><th>Value</th><th>Status</th><th>Time</th></tr></thead><tbody>${txs.slice(0,25).map(tx => `<tr><td>${link(`${BASE}/tx/${tx.hash}`,short(tx.hash))}</td><td>${tx.block_number != null ? link(`${BASE}/block/${tx.block_number}`,Number(tx.block_number).toLocaleString()) : '-'}</td><td>${tx.from?.hash ? link(`${BASE}/address/${tx.from.hash}`,short(tx.from.hash)) : '-'}</td><td>${tx.to?.hash ? link(`${BASE}/address/${tx.to.hash}`,short(tx.to.hash)) : '-'}</td><td>${eth(tx.value)}</td><td class="tx-status ${txStatus(tx)==='Success'?'success':txStatus(tx)==='Failed'?'failed':''}">${txStatus(tx)}</td><td>${esc(txTime(tx))}</td></tr>`).join('')}</tbody></table></div>` : 'No transactions found.'}</div></div><div class="card"><div class="card-header">Explorer Links</div><div class="card-body"><a class="explorer-link" href="https://basescan.org/address/${address}" target="_blank" rel="noopener noreferrer">View on BaseScan →</a><a class="explorer-link secondary" href="https://base.blockscout.com/address/${address}" target="_blank" rel="noopener noreferrer">View on Blockscout →</a></div></div>`;
    } catch { $('detail').innerHTML = '<div class="card"><div class="card-body">Unable to load this address.</div></div>'; }
}

async function renderToken(address) {
    shell(pageHead() + '<div id="detail" class="detail-stack"><div class="loading">Loading token...</div></div></div>');
    try {
        const token = await fetch(`${BLOCKSCOUT}/tokens/${address}`).then(r => { if (!r.ok) throw Error(); return r.json(); });
        $('detail').innerHTML = `<div class="card"><div class="card-header">Token Details <span class="network-badge">● Base Mainnet</span></div><div class="card-body"><div class="token-name">${esc(token.name || 'Unknown Token')}</div><div class="token-symbol">${esc(token.symbol || '-')}</div></div><div class="details"><div class="detail-label">Contract</div><div class="detail-value hash">${link(`${BASE}/contract/${address}`,short(address))}</div><div class="detail-label">Token Type</div><div class="detail-value">${esc(token.type || 'ERC-20')}</div><div class="detail-label">Decimals</div><div class="detail-value">${esc(token.decimals ?? '-')}</div><div class="detail-label">Total Supply</div><div class="detail-value">${esc(token.total_supply || token.total_supply_raw || '-')}</div><div class="detail-label">Holders</div><div class="detail-value">${token.holders_count != null ? Number(token.holders_count).toLocaleString() : '-'}</div></div></div><div class="card"><div class="card-header">Explorer Links</div><div class="card-body"><a class="explorer-link" href="https://basescan.org/token/${address}" target="_blank" rel="noopener noreferrer">View on BaseScan →</a><a class="explorer-link secondary" href="https://base.blockscout.com/token/${address}" target="_blank" rel="noopener noreferrer">View on Blockscout →</a></div></div>`;
    } catch { $('detail').innerHTML = '<div class="card"><div class="card-body">Unable to load this token.</div></div>'; }
}

async function renderContract(address) {
    shell(pageHead() + '<div id="detail" class="detail-stack"><div class="loading">Loading contract...</div></div></div>');
    try {
        const data = await fetch(`${BLOCKSCOUT}/addresses/${address}`).then(r => { if (!r.ok) throw Error(); return r.json(); });
        const verified = data.is_verified === true || data.smart_contract?.is_verified === true;
        $('detail').innerHTML = `<div class="card"><div class="card-header">Contract Details <span class="network-badge">● Base Mainnet</span></div><div class="card-body"><div class="contract-title-row"><div><div class="contract-name">${esc(data.name || data.smart_contract?.name || 'Contract')}</div><div class="contract-address-row"><span class="contract-address">${link(`${BASE}/address/${address}`,esc(address))}</span><button class="copy-btn" onclick="copyText('${esc(address)}',this)">Copy</button></div></div><div class="contract-status">${verified ? '✓ Verified' : 'Unverified'}</div></div></div><div class="details"><div class="detail-label">Contract Type</div><div class="detail-value">${esc(data.type || data.smart_contract?.language || 'Smart Contract')}</div><div class="detail-label">Network</div><div class="detail-value">Base Mainnet</div><div class="detail-label">ETH Balance</div><div class="detail-value">${eth(data.coin_balance ?? data.balance ?? 0)}</div><div class="detail-label">Compiler</div><div class="detail-value">${esc(data.smart_contract?.compiler_version || data.compiler_version || '-')}</div></div></div><div class="card"><div class="card-header">Explorer Links</div><div class="card-body"><a class="explorer-link" href="https://basescan.org/address/${address}" target="_blank" rel="noopener noreferrer">View on BaseScan →</a><a class="explorer-link secondary" href="https://base.blockscout.com/address/${address}" target="_blank" rel="noopener noreferrer">View on Blockscout →</a></div></div>`;
    } catch { $('detail').innerHTML = '<div class="card"><div class="card-body">Unable to load this contract.</div></div>'; }
}

function copyText(value, button) {
    navigator.clipboard?.writeText(value).then(() => {
        if (!button) return;
        const old = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => button.textContent = old, 1200);
    });
}

async function updateGas() {
    const target = $('headerGasValue');
    if (!target) return;
    try { target.textContent = gwei(await rpc('eth_gasPrice')); }
    catch { target.textContent = 'Gas'; }
}

async function loadGasTracker() {
    const content = $('gasTrackerContent');
    if (!content) return;
    content.innerHTML = '<div class="gas-loading">Loading current Base gas...</div>';
    try { content.innerHTML = `<div class="gas-main"><span class="gas-label">Current Gas Price</span><strong>${esc(gwei(await rpc('eth_gasPrice')))}</strong></div>`; }
    catch { content.innerHTML = '<div class="gas-error">Unable to load current gas price.</div>'; }
}

function openGasTracker() { $('gasTrackerPanel')?.classList.add('show'); loadGasTracker(); }
function closeGasTracker() { $('gasTrackerPanel')?.classList.remove('show'); }

function renderHeaderState() { updateGas(); }

async function render() {
    const r = route();
    if (r.type === 'home') return renderHome();
    if (r.type === 'block') return renderBlock(r.value);
    if (r.type === 'tx') return renderTx(r.value);
    if (r.type === 'address') return renderAddress(r.value);
    if (r.type === 'token') return renderToken(r.value);
    if (r.type === 'contract') return renderContract(r.value);
    shell('<section class="page-container"><h1>404</h1><p>Page not found.</p></section>');
}

document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith(BASE + '/')) return;
    const url = new URL(href, location.origin);
    if (!/^\/crypto\/base-scan\/(block|tx|address|token|contract)\//.test(url.pathname)) return;
    event.preventDefault();
    navigate(url.pathname);
});

window.addEventListener('popstate', render);
window.searchFromHero = searchFromHero;
window.searchFromHeader = searchFromHeader;
window.openGasTracker = openGasTracker;
window.closeGasTracker = closeGasTracker;
window.loadGasTracker = loadGasTracker;
window.copyText = copyText;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { renderHeaderState(); render(); }, { once: true });
else { renderHeaderState(); render(); }
