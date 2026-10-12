const BASE = '/crypto/base-scan';
const RPC = 'https://mainnet.base.org';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function rpc(method, params = []) {
    const response = await fetch(RPC, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}) });
    if (!response.ok) throw Error('RPC request failed');
    const data = await response.json();
    if (data.error) throw Error(data.error.message || 'RPC error');
    return data.result;
}

function header() {
    return `<header class="explorer-header"><div class="explorer-header-inner"><a class="brand" href="${BASE}/" aria-label="Base Scan by Dozni"><img class="brand-mark" src="${BASE}/dozni-mark.svg" alt="DOZNI"><span class="brand-name"><strong>Base Scan</strong><small>BY DOZNI</small></span></a><nav class="explorer-nav"><a href="${BASE}/blocks/">Blocks</a><a href="${BASE}/transactions/">Transactions</a><a href="${BASE}/addresses/">Addresses</a><a href="${BASE}/tokens/">Tokens</a><a href="${BASE}/contracts/">Contracts</a></nav><div class="header-tools"><form class="search" onsubmit="event.preventDefault();headerSearch()"><input id="headerSearch" placeholder="Search address, tx or block" autocomplete="off"><button type="submit">Search</button></form><button class="gas-button" onclick="openGas()">⛽ <strong id="headerGas">Loading...</strong></button></div><button class="mobile-menu-btn" onclick="document.getElementById('mobileCollectionMenu').classList.toggle('open')">☰</button></div><nav id="mobileCollectionMenu" class="mobile-menu"><a href="${BASE}/">Overview</a><a href="${BASE}/blocks/">Blocks</a><a href="${BASE}/transactions/">Transactions</a><a href="${BASE}/addresses/">Addresses</a><a href="${BASE}/tokens/">Tokens</a><a href="${BASE}/contracts/">Contracts</a></nav></header>`;
}

function footer() {
    return `<footer class="footer"><div class="footer-inner"><div><strong>DOZNI Base Scan</strong><br>Base Mainnet · Chain ID 8453</div><div class="footer-links"><a href="${BASE}/">Overview</a><a href="${BASE}/blocks/">Blocks</a><a href="${BASE}/transactions/">Transactions</a><a href="${BASE}/addresses/">Addresses</a><a href="${BASE}/tokens/">Tokens</a><a href="${BASE}/contracts/">Contracts</a></div></div></footer>`;
}

function gasPanel() {
    return `<div id="gasPanel" class="gas-panel"><div class="gas-card"><div class="gas-head"><div><strong>Base Gas Tracker</strong><span>Live Base Mainnet gas price</span></div><button class="gas-close" onclick="closeGas()">×</button></div><div class="gas-body"><div id="gasValue" class="gas-value">Loading...</div><span class="gas-label">Current gas price</span></div><div class="gas-foot"><span id="gasUpdated">Not loaded</span><button onclick="loadGas()">Refresh</button></div></div></div>`;
}

async function loadGas() {
    try {
        const value = BigInt(await rpc('eth_gasPrice'));
        const whole = value / 1000000000n;
        const fraction = (value % 1000000000n).toString().padStart(9,'0').slice(0,6);
        const text = `${whole}.${fraction} Gwei`;
        if ($('headerGas')) $('headerGas').textContent = text;
        if ($('gasValue')) $('gasValue').textContent = text;
        if ($('gasUpdated')) $('gasUpdated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
    } catch {
        if ($('headerGas')) $('headerGas').textContent = 'Gas';
        if ($('gasValue')) $('gasValue').textContent = 'Unavailable';
    }
}
function openGas(){ $('gasPanel')?.classList.add('show'); loadGas(); }
function closeGas(){ $('gasPanel')?.classList.remove('show'); }
function headerSearch(){
    const value = ($('headerSearch')?.value || '').trim();
    if (/^\d+$/.test(value)) location.href = `${BASE}/block/${value}`;
    else if (/^0x[a-fA-F0-9]{64}$/.test(value)) location.href = `${BASE}/tx/${value}`;
    else if (/^0x[a-fA-F0-9]{40}$/.test(value)) location.href = `${BASE}/address/${value}`;
}

function page(title, description, body) {
    $('app').innerHTML = `<main class="page"><div class="page-head"><div><div class="page-eyebrow">BASE MAINNET</div><h1>${esc(title)}</h1><p class="page-intro">${esc(description)}</p></div><div class="network-pill"><span class="network-dot"></span>Chain ID 8453</div></div>${body}</main>`;
}

async function blocks() {
    page('Base Blocks','Latest Base Mainnet blocks.','<div class="card"><div class="card-head"><h2>Latest Blocks</h2><span>20 most recent blocks</span></div><div id="list" class="loading">Loading latest blocks...</div></div>');
    try {
        const tip = parseInt(await rpc('eth_blockNumber'),16);
        const items = await Promise.all(Array.from({length:20},(_,i)=>rpc('eth_getBlockByNumber',['0x'+(tip-i).toString(16),false])));
        $('list').innerHTML = items.map(block => { const n=parseInt(block.number,16); return `<a class="list-item" href="${BASE}/block/${n}"><span class="item-left"><span class="item-icon">#</span><span class="item-main"><span class="item-title">Block #${n.toLocaleString()}</span><span class="item-sub">${new Date(parseInt(block.timestamp,16)*1000).toLocaleString()}</span></span></span><span class="item-value">${block.transactions?.length||0} txs</span></a>`; }).join('');
    } catch { $('list').innerHTML = '<div class="empty">Unable to load blocks right now.</div>'; }
}

async function transactions() {
    page('Base Transactions','Recent transactions confirmed on Base Mainnet.','<div class="card"><div class="card-head"><h2>Latest Transactions</h2><span>From the latest 3 blocks</span></div><div id="list" class="loading">Loading latest transactions...</div></div>');
    try {
        const tip=parseInt(await rpc('eth_blockNumber'),16);
        const blocks=await Promise.all([0,1,2].map(i=>rpc('eth_getBlockByNumber',['0x'+(tip-i).toString(16),true])));
        const txs=blocks.flatMap(b=>b?.transactions||[]).slice(0,30);
        $('list').innerHTML=txs.length?txs.map(tx=>`<a class="list-item" href="${BASE}/tx/${tx.hash}"><span class="item-left"><span class="item-icon">↗</span><span class="item-main"><span class="item-title">${esc(tx.hash.slice(0,14)+'…'+tx.hash.slice(-8))}</span><span class="item-sub">Block ${parseInt(tx.blockNumber,16).toLocaleString()}</span></span></span><span class="item-value">Transaction</span></a>`).join(''):'<div class="empty">No recent transactions found.</div>';
    } catch { $('list').innerHTML='<div class="empty">Unable to load transactions right now.</div>'; }
}

function searchCollection(kind) {
    const config={addresses:['Base Addresses','Search and open a Base Mainnet address.','Address Explorer','Search Address','address'],tokens:['Base Tokens','Search and open a Base Mainnet token contract.','Token Explorer','Search Token Contract','token'],contracts:['Base Contracts','Search and open a Base Mainnet smart contract.','Contract Explorer','Search Contract','contract']}[kind];
    page(config[0],config[1],`<div class="route-grid"><div class="info-card"><strong>${config[2]}</strong><span>Open a valid 0x address directly in Base Scan.</span></div><div class="info-card"><strong>Base Mainnet</strong><span>Ethereum-compatible Layer 2 · Chain ID 8453.</span></div><div class="info-card"><strong>Fast Lookup</strong><span>Paste a wallet or contract address below.</span></div></div><div class="route-search-card"><div class="route-search-title">${config[3]}</div><form class="route-search" onsubmit="event.preventDefault();collectionSearch('${config[4]}')"><input id="collectionSearch" placeholder="0x..." autocomplete="off" spellcheck="false"><button type="submit">Search</button></form></div>`);
}

function collectionSearch(kind){
    const value=($('collectionSearch')?.value||'').trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return;
    location.href=`${BASE}/${kind}/${value}`;
}

function setActive(){
    const current=location.pathname.replace(/\/+$/,'');
    document.querySelectorAll('.explorer-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href').replace(/\/+$/,'')===current));
}

function init(){
    document.body.insertAdjacentHTML('afterbegin',header());
    document.body.insertAdjacentHTML('beforeend',gasPanel()+footer());
    loadGas();
    setActive();
    const path=location.pathname.replace(/\/+$/,'');
    if(path===BASE+'/blocks') blocks();
    else if(path===BASE+'/transactions') transactions();
    else if(path===BASE+'/addresses') searchCollection('addresses');
    else if(path===BASE+'/tokens') searchCollection('tokens');
    else if(path===BASE+'/contracts') searchCollection('contracts');
    else location.href=BASE+'/';
}

window.headerSearch=headerSearch;
window.openGas=openGas;
window.closeGas=closeGas;
window.loadGas=loadGas;
window.collectionSearch=collectionSearch;

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
