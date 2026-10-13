const BASE = '/crypto/base-scan';
const RPC = 'https://mainnet.base.org';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));

async function rpc(method, params = []) {
    const response = await fetch(RPC, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}) });
    if (!response.ok) throw Error('RPC request failed');
    const data = await response.json();
    if (data.error) throw Error(data.error.message || 'RPC error');
    return data.result;
}

function short(value,start=10,end=8){
    const s=String(value||'');
    return s.length>start+end+3?`${s.slice(0,start)}...${s.slice(-end)}`:s;
}

function eth(value){
    try{
        const wei=BigInt(value||0), whole=wei/1000000000000000000n;
        const fraction=(wei%1000000000000000000n).toString().padStart(18,'0').slice(0,6);
        return `${whole}.${fraction} ETH`;
    }catch{return '0.000000 ETH';}
}

function header() {
    return `<header class="explorer-header"><div class="explorer-header-inner"><a class="brand" href="${BASE}/" aria-label="Base Scan by Dozni"><img class="brand-mark" src="${BASE}/assets/svg/dozni-mark.svg" alt="DOZNI"><span class="brand-name"><strong>Base Scan</strong><small>BY DOZNI</small></span></a><nav class="explorer-nav"><a href="${BASE}/block/">Blocks</a><a href="${BASE}/tx/">Transactions</a><a href="${BASE}/address/">Addresses</a><a href="${BASE}/token/">Tokens</a><a href="${BASE}/contract/">Contracts</a></nav><div class="header-tools"><form class="search" onsubmit="event.preventDefault();headerSearch()"><input id="headerSearch" placeholder="Search address, tx or block" autocomplete="off"><button type="submit">Search</button></form><button class="gas-button" type="button" onclick="openGas()">⛽ <strong id="headerGas">Loading...</strong></button></div><button class="mobile-menu-btn" type="button" onclick="document.getElementById('mobileCollectionMenu').classList.toggle('open')">☰</button></div><nav id="mobileCollectionMenu" class="mobile-menu"><a href="${BASE}/">Overview</a><a href="${BASE}/block/">Blocks</a><a href="${BASE}/tx/">Transactions</a><a href="${BASE}/address/">Addresses</a><a href="${BASE}/token/">Tokens</a><a href="${BASE}/contract/">Contracts</a></nav></header>`;
}

function footer() {
    return `<footer class="footer"><div class="footer-inner"><div class="footer-brand"><div class="footer-logo"><img class="brand-mark" src="${BASE}/assets/svg/dozni-mark.svg" alt="DOZNI"><strong>DOZNI Base Scan</strong></div><p>Explore Base Mainnet blocks, transactions, addresses, tokens and smart contracts.</p></div><div class="footer-column"><h3>Explorer</h3><a href="${BASE}/block/">Blocks</a><a href="${BASE}/tx/">Transactions</a><a href="${BASE}/address/">Addresses</a><a href="${BASE}/token/">Tokens</a><a href="${BASE}/contract/">Contracts</a></div><div class="footer-column"><h3>Network</h3><a href="https://base.org/" target="_blank" rel="noopener noreferrer">Base</a><a href="https://basescan.org/" target="_blank" rel="noopener noreferrer">BaseScan</a><div class="footer-network"><strong>Base Mainnet</strong><br>Chain ID: 8453</div></div><div class="footer-column"><h3>Base Network</h3><div class="footer-network">Ethereum-compatible Layer 2</div><a href="${BASE}/">Explore Base</a></div></div><div class="footer-bottom"><span>© 2026 Dozni · Base Scan</span><span>Base Mainnet · Chain ID 8453</span></div></footer>`;
}

function gasPanel() {
    return `<div id="gasPanel" class="gas-panel"><div class="gas-card"><div class="gas-head"><div><strong>Base Gas Tracker</strong><span>Live Base Mainnet gas price</span></div><button class="gas-close" type="button" onclick="closeGas()">×</button></div><div class="gas-body"><div id="gasValue" class="gas-value">Loading...</div><span class="gas-label">Current gas price</span></div><div class="gas-foot"><span id="gasUpdated">Not loaded</span><button type="button" onclick="loadGas()">Refresh</button></div></div></div>`;
}

async function loadGas() {
    if (window.BaseScanGas?.refresh) return window.BaseScanGas.refresh();
    try {
        const value = BigInt(await rpc('eth_gasPrice'));
        const whole = value / 1000000000n;
        const fraction = (value % 1000000000n).toString().padStart(9,'0').slice(0,6);
        const text = `${whole}.${fraction} Gwei`;
        if ($('headerGas')) $('headerGas').textContent = text;
        if ($('gasValue')) $('gasValue').textContent = text;
        if ($('gasUpdated')) $('gasUpdated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
    } catch {
        if ($('headerGas')) $('headerGas').textContent = 'Unavailable';
        if ($('gasValue')) $('gasValue').textContent = 'Unavailable';
        if ($('gasUpdated')) $('gasUpdated').textContent = 'Unable to load';
    }
}
function openGas(){
    if (window.BaseScanGas?.open) return window.BaseScanGas.open();
    $('gasPanel')?.classList.add('show');
    loadGas();
}
function closeGas(){
    if (window.BaseScanGas?.close) return window.BaseScanGas.close();
    $('gasPanel')?.classList.remove('show');
}

async function headerSearch(){
    const value = ($('headerSearch')?.value || '').trim();
    if (window.BaseScanSearch?.search) return window.BaseScanSearch.search(value);
    if (/^\d+$/.test(value)) return location.href = `${BASE}/block/${value}/`;
    if (/^0x[a-fA-F0-9]{64}$/.test(value)) return location.href = `${BASE}/tx/${value}/`;
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) return location.href = `${BASE}/contract/${value}/`;
    alert('Enter a valid block number, transaction hash or 0x address.');
}

function page(title, description, body) {
    $('app').innerHTML = `<main class="page"><div class="page-head"><div><div class="page-eyebrow">BASE MAINNET</div><h1>${esc(title)}</h1><p class="page-intro">${esc(description)}</p></div><div class="network-pill"><span class="network-dot"></span>Chain ID 8453</div></div>${body}</main>`;
}

async function blocks() {
    page('Base Blocks','Latest Base Mainnet blocks.','<div class="card"><div class="card-head"><h2>Latest Blocks</h2><span>20 most recent blocks</span></div><div id="list" class="loading">Loading latest blocks...</div></div>');
    try {
        const tip = parseInt(await rpc('eth_blockNumber'),16);
        const items = await Promise.all(Array.from({length:20},(_,i)=>rpc('eth_getBlockByNumber',['0x'+(tip-i).toString(16),false])));
        $('list').innerHTML = items.map(block => { const n=parseInt(block.number,16); return `<a class="list-item" href="${BASE}/block/${n}/"><span class="item-left"><span class="item-icon">#</span><span class="item-main"><span class="item-title">Block #${n.toLocaleString()}</span><span class="item-sub">${new Date(parseInt(block.timestamp,16)*1000).toLocaleString()}</span></span></span><span class="item-value">${block.transactions?.length||0} txs</span></a>`; }).join('');
    } catch { $('list').innerHTML = '<div class="empty">Unable to load blocks right now.</div>'; }
}

async function transactions() {
    page('Base Transactions','Recent transactions confirmed on Base Mainnet.','<div class="card"><div class="card-head"><h2>Recent Transactions</h2><span>Base Mainnet</span></div><div id="list" class="loading">Loading recent transactions...</div></div>');
    try {
        const tip=parseInt(await rpc('eth_blockNumber'),16);
        const blockResults=await Promise.all([0,1,2].map(i=>rpc('eth_getBlockByNumber',['0x'+(tip-i).toString(16),true])));
        const txs=blockResults.flatMap(block => (block?.transactions||[]).map(tx => ({...tx, _timestamp:block.timestamp}))).slice(0,30);
        const rows=await Promise.all(txs.map(async tx => {
            let status='Unknown';
            try {
                const receipt=await rpc('eth_getTransactionReceipt',[tx.hash]);
                status=receipt?.status==='0x1'?'Success':'Failed';
            } catch {}
            const blockNumber=tx.blockNumber ? parseInt(tx.blockNumber,16) : null;
            const time=tx._timestamp ? new Date(parseInt(tx._timestamp,16)*1000).toLocaleString() : '-';
            return `<tr><td>${linkHtml(`${BASE}/tx/${tx.hash}/`,short(tx.hash))}</td><td>${blockNumber!=null?linkHtml(`${BASE}/block/${blockNumber}/`,blockNumber.toLocaleString()):'-'}</td><td>${tx.from?linkHtml(`${BASE}/address/${tx.from}/`,short(tx.from)):'-'}</td><td>${tx.to?linkHtml(`${BASE}/address/${tx.to}/`,short(tx.to)):'-'}</td><td>${eth(tx.value)}</td><td class="tx-status ${status==='Success'?'success':status==='Failed'?'failed':''}">${status}</td><td>${esc(time)}</td></tr>`;
        }));
        $('list').innerHTML=rows.length?`<div class="table-wrapper"><table class="transactions-table"><thead><tr><th>Transaction</th><th>Block</th><th>From</th><th>To</th><th>Value</th><th>Status</th><th>Time</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`:'<div class="empty">No recent transactions found.</div>';
    } catch { $('list').innerHTML='<div class="empty">Unable to load transactions right now.</div>'; }
}

function linkHtml(path,text){return `<a href="${path}">${esc(text)}</a>`;}

function searchCollection(kind) {
    const config={address:['Base Addresses','Search and open a Base Mainnet address.','Address Explorer','Search Address','address'],token:['Base Tokens','Search and open a Base Mainnet token contract.','Token Explorer','Search Token Contract','token'],contract:['Base Contracts','Search and open a Base Mainnet smart contract.','Contract Explorer','Search Contract','contract']}[kind];
    page(config[0],config[1],`<div class="route-grid"><div class="info-card"><strong>${config[2]}</strong><span>Open a valid 0x address directly in Base Scan.</span></div><div class="info-card"><strong>Base Mainnet</strong><span>Ethereum-compatible Layer 2 · Chain ID 8453.</span></div><div class="info-card"><strong>Fast Lookup</strong><span>Paste a wallet or contract address below.</span></div></div><div class="route-search-card"><div class="route-search-title">${config[3]}</div><form class="route-search" onsubmit="event.preventDefault();collectionSearch('${config[4]}')"><input id="collectionSearch" placeholder="0x..." autocomplete="off" spellcheck="false"><button type="submit">Search</button></form></div>`);
}

function collectionSearch(kind){
    const value=($('collectionSearch')?.value||'').trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return alert('Enter a valid 0x address.');
    location.href=`${BASE}/${kind}/${value}/`;
}

function setActive(){
    const current=location.pathname.replace(/\/+$/,'');
    document.querySelectorAll('.explorer-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href').replace(/\/+$/,'')===current));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();

function init(){
    document.body.insertAdjacentHTML('afterbegin',header());
    document.body.insertAdjacentHTML('beforeend',gasPanel()+footer());
    loadGas();
    setActive();
    const path=location.pathname.replace(/\/+$/,'');
    if(path===BASE+'/block') blocks();
    else if(path===BASE+'/tx') transactions();
    else if(path===BASE+'/address') searchCollection('address');
    else if(path===BASE+'/token') searchCollection('token');
    else if(path===BASE+'/contract') searchCollection('contract');
    else location.href=BASE+'/';
}

window.headerSearch=headerSearch;
window.openGas=openGas;
window.closeGas=closeGas;
window.loadGas=loadGas;
window.collectionSearch=collectionSearch;
