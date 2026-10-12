(function () {
    const BASE = '/crypto/base-scan';
    const CRYPTO = '/crypto/';
    const THEME_KEY = 'dozni-base-scan-theme';

    const labels = { blocks:'Blocks', transactions:'Transactions', addresses:'Addresses', tokens:'Tokens', contracts:'Contracts' };

    function esc(value){
        return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function short(value,start=12,end=8){
        const s=String(value||'');
        return s.length>start+end+3?`${s.slice(0,start)}...${s.slice(-end)}`:s;
    }

    function getItems(){
        const path=location.pathname.replace(/\/+$/,'')||'/';
        if(path===BASE)return null;
        const parts=path.split('/').filter(Boolean),baseIndex=parts.indexOf('base-scan');
        if(baseIndex===-1)return null;
        const rest=parts.slice(baseIndex+1),items=[{text:'Home',href:'/'},{text:'Crypto',href:CRYPTO},{text:'Base Scan',href:`${BASE}/`}];
        if(!rest.length)return items;
        const type=rest[0];
        if(labels[type]&&rest.length===1){items.push({text:labels[type]});return items}
        const detailLabels={block:'Block',tx:'Transaction',address:'Address',token:'Token',contract:'Contract'};
        if(!detailLabels[type])return items;
        items.push({text:detailLabels[type]});
        if(rest[1]){
            let value=rest[1];
            if(type==='block'&&/^\d+$/.test(value))value=`#${Number(value).toLocaleString('en-IN')}`;
            else if(/^0x[a-fA-F0-9]{40,64}$/.test(value))value=short(value);
            items.push({text:value});
        }
        return items;
    }

    function ensureStyles(){
        if(document.getElementById('baseScanBreadcrumbStyles'))return;
        const style=document.createElement('style');
        style.id='baseScanBreadcrumbStyles';
        style.textContent=`
            .base-scan-breadcrumbs{width:100%;margin:0 0 14px;padding:18px 0 0;display:flex;align-items:center;flex-wrap:wrap;gap:7px;color:#666b78;font-size:13px;line-height:1.55}.base-scan-breadcrumbs a{color:#4f5665;text-decoration:none;font-weight:600}.base-scan-breadcrumbs a:hover{color:#635bff}.base-scan-breadcrumbs .separator{color:#aeb4c0}.base-scan-breadcrumbs .current{color:#17171c;font-weight:700}
            .detail-container{padding-top:22px!important}

            /* Shared header: keep every Base Scan URL visually identical. */
            .site-header,.explorer-header{height:54px!important;min-height:54px!important}
            .header-inner,.explorer-header-inner{width:min(1380px,calc(100% - 28px))!important;height:54px!important;min-height:54px!important;margin:auto!important;gap:18px!important}
            .dozni-logo,.brand{display:inline-flex!important;align-items:center!important;gap:8px!important;text-decoration:none!important;color:#17171c!important;flex:0 0 auto!important}
            .dozni-logo-mark,.brand-mark{width:35px!important;height:31px!important;object-fit:contain!important;display:block!important}
            .dozni-logo-text{font-size:0!important;line-height:1!important}
            .dozni-logo-text::before{font-size:17px!important;font-weight:800!important;letter-spacing:-.03em!important}
            .brand-name{display:flex!important;flex-direction:column!important;line-height:1!important}
            .brand-name strong{font-size:17px!important;font-weight:800!important;letter-spacing:-.03em!important;color:#17171c!important}
            .brand-name small{margin-top:4px!important;font-size:8px!important;font-weight:700!important;letter-spacing:.12em!important;color:#8a8a98!important}
            .explorer-header-nav,.explorer-nav{flex:1!important;min-width:0!important;display:flex!important;justify-content:center!important;align-items:center!important;gap:3px!important}
            .explorer-header-nav a,.explorer-nav a{height:34px!important;padding:0 14px!important;border-radius:8px!important;font-size:13px!important;font-weight:750!important;white-space:nowrap!important}
            .header-tools{display:flex!important;align-items:center!important;gap:6px!important;flex:0 0 auto!important}
            .header-search,.search{width:230px!important;height:34px!important;display:flex!important;align-items:center!important;border-radius:8px!important}
            .header-search input,.search input{font-size:12px!important;height:100%!important}
            .header-search button,.search button{height:28px!important;padding:0 10px!important;font-size:11px!important;font-weight:700!important}
            .header-gas,.gas-button{height:34px!important;padding:0 10px!important;gap:5px!important;font-size:10px!important;font-weight:700!important;border-radius:8px!important}
            .header-gas strong,.gas-button strong{font-size:10px!important;font-weight:800!important}
            .mobile-menu-btn{width:36px!important;height:34px!important;border-radius:8px!important}
            .theme-toggle{width:36px;height:34px;flex:0 0 36px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #dfe3ea;border-radius:8px;background:#fff;color:#252832;cursor:pointer;font-size:18px;line-height:1}.theme-toggle:hover{border-color:#635bff;color:#635bff}

            body{font-size:16px!important;background:#fff!important;color:#17171c!important}.search input,.header-search input{font-size:12px!important}.search button,.header-search button{font-size:11px!important}.page h1{font-size:32px!important}.page-intro{font-size:14px!important}.page-eyebrow{font-size:11px!important}.card-head h2,.card-header h2{font-size:16px!important}.card-head span,.card-header span{font-size:12px!important}.item-title{font-size:14px!important}.item-sub{font-size:12px!important}.item-value{font-size:13px!important}.info-card strong,.route-search-title{font-size:14px!important}.info-card span,.note{font-size:12px!important}.route-search input{font-size:14px!important}.route-search button{font-size:13px!important}.footer-column h3,.footer-column a,.footer-brand p{font-size:13px!important}.footer-network,.footer-bottom{font-size:12px!important}
            .detail-container .card-header{font-size:17px!important}.detail-container .detail-label{font-size:13px!important}.detail-container .detail-value,.detail-container .transaction-hash,.detail-container .address,.detail-container .hash{font-size:15px!important}.detail-container .block-number{font-size:28px!important}.detail-container table{font-size:14px!important}.detail-container th{font-size:13px!important}.detail-container td{font-size:14px!important}.detail-container .explorer-link{font-size:14px!important}

            html[data-theme="dark"]{color-scheme:dark}
            html[data-theme="dark"] body,html[data-theme="dark"] main,html[data-theme="dark"] .container,html[data-theme="dark"] .page,html[data-theme="dark"] .detail-container,html[data-theme="dark"] .content{background:#090b0f!important;color:#f1f3f5!important}
            html[data-theme="dark"] .site-header,html[data-theme="dark"] .explorer-header,html[data-theme="dark"] .site-footer,html[data-theme="dark"] .footer,html[data-theme="dark"] .mobile-menu{background:#101318!important;border-color:#292f38!important}
            html[data-theme="dark"] .dozni-logo,html[data-theme="dark"] .brand,html[data-theme="dark"] .brand-name strong,html[data-theme="dark"] .dozni-logo-text::before{color:#f1f3f5!important}
            html[data-theme="dark"] .brand-name small{color:#8993a1!important}
            html[data-theme="dark"] .card,html[data-theme="dark"] .stat-card,html[data-theme="dark"] .info-card,html[data-theme="dark"] .route-search-card,html[data-theme="dark"] .gas-card,html[data-theme="dark"] .gas-tracker-card{background:#12161b!important;border-color:#2a313a!important;box-shadow:none!important}
            html[data-theme="dark"] .header-search,html[data-theme="dark"] .search,html[data-theme="dark"] .header-gas,html[data-theme="dark"] .gas-button,html[data-theme="dark"] .hero-search,html[data-theme="dark"] .route-search input{background:#12161b!important;border-color:#303741!important;color:#f1f3f5!important}
            html[data-theme="dark"] .header-search button,html[data-theme="dark"] .search button{color:#fff!important}
            html[data-theme="dark"] .network-pill{background:#12161b!important;border-color:#303741!important;color:#cbd1d9!important}
            html[data-theme="dark"] .hero{background:linear-gradient(180deg,#17142c 0%,#090b0f 100%)!important;border-color:#292f38!important}html[data-theme="dark"] .hero-badge{background:#12161b!important;border-color:#303741!important;color:#f1f3f5!important}
            html[data-theme="dark"] .card-header,html[data-theme="dark"] .card-head,html[data-theme="dark"] .footer-bottom,html[data-theme="dark"] .gas-head,html[data-theme="dark"] .gas-foot,html[data-theme="dark"] .gas-tracker-header,html[data-theme="dark"] .gas-tracker-footer{border-color:#2a313a!important}
            html[data-theme="dark"] .list-item,html[data-theme="dark"] .card .list-item{background:#12161b!important;border-color:#2a313a!important}html[data-theme="dark"] .list-item:hover{background:#191e25!important}
            html[data-theme="dark"] .page h1,html[data-theme="dark"] .page h2,html[data-theme="dark"] .page h3,html[data-theme="dark"] .hero h1,html[data-theme="dark"] .card-header,html[data-theme="dark"] .card-head,html[data-theme="dark"] .stat-value,html[data-theme="dark"] .item-value,html[data-theme="dark"] .detail-value,html[data-theme="dark"] .transaction-hash,html[data-theme="dark"] .address,html[data-theme="dark"] th,html[data-theme="dark"] .footer-column h3{color:#f1f3f5!important}
            html[data-theme="dark"] p,html[data-theme="dark"] .page-intro,html[data-theme="dark"] .hero p,html[data-theme="dark"] .stat-title,html[data-theme="dark"] .stat-sub,html[data-theme="dark"] .item-sub,html[data-theme="dark"] .info-card span,html[data-theme="dark"] .note,html[data-theme="dark"] .footer-brand p,html[data-theme="dark"] .footer-network,html[data-theme="dark"] .footer-bottom,html[data-theme="dark"] .detail-label,html[data-theme="dark"] .gas-label,html[data-theme="dark"] .gas-head span,html[data-theme="dark"] .gas-foot,html[data-theme="dark"] .gas-tracker-header span,html[data-theme="dark"] .gas-tracker-footer span{color:#aeb6c2!important}
            html[data-theme="dark"] .site-nav a,html[data-theme="dark"] .explorer-nav a,html[data-theme="dark"] .explorer-header-nav a,html[data-theme="dark"] .footer-column a,html[data-theme="dark"] .base-scan-breadcrumbs a{color:#cbd1d9!important}
            html[data-theme="dark"] .base-scan-breadcrumbs .current{color:#f1f3f5!important}html[data-theme="dark"] .base-scan-breadcrumbs .separator{color:#68717d!important}
            html[data-theme="dark"] input,html[data-theme="dark"] textarea{color:#f1f3f5!important}html[data-theme="dark"] table,html[data-theme="dark"] th,html[data-theme="dark"] td{border-color:#2a313a!important}html[data-theme="dark"] th,html[data-theme="dark"] td{background:#12161b!important}html[data-theme="dark"] td{color:#d6dbe2!important}
            html[data-theme="dark"] .copy-btn,html[data-theme="dark"] .copy-button{background:#1a1f25!important;color:#d6dbe2!important;border-color:#303741!important}html[data-theme="dark"] .explorer-link{background:#171c22!important;border-color:#303741!important;color:#aaa5ff!important}html[data-theme="dark"] .theme-toggle{background:#1a1f25!important;color:#f1f3f5!important;border-color:#3a424d!important}

            @media(max-width:700px){
                .header-inner,.explorer-header-inner{width:calc(100% - 20px)!important;gap:10px!important}
                .base-scan-breadcrumbs{font-size:12px}
                .page h1{font-size:29px!important}
                .detail-container .detail-value,.detail-container .transaction-hash,.detail-container .address,.detail-container .hash{font-size:14px!important}
            }
        `;
        document.head.appendChild(style);
    }

    function applyTheme(theme){
        const value=theme==='dark'?'dark':'light';
        document.documentElement.setAttribute('data-theme',value);
        try{localStorage.setItem(THEME_KEY,value)}catch{}
        const button=document.getElementById('baseScanThemeToggle');
        if(button){
            button.textContent=value==='dark'?'☀':'☾';
            button.title=value==='dark'?'Switch to light theme':'Switch to black theme';
            button.setAttribute('aria-label',button.title);
        }
    }

    function addThemeToggle(){
        if(document.getElementById('baseScanThemeToggle'))return;
        const host=document.querySelector('.header-tools')||document.querySelector('.explorer-header-inner')||document.querySelector('.header-inner');
        if(!host)return;
        const button=document.createElement('button');
        button.id='baseScanThemeToggle';
        button.className='theme-toggle';
        button.type='button';
        button.addEventListener('click',()=>applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));
        host.appendChild(button);
        let saved='light';
        try{saved=localStorage.getItem(THEME_KEY)||'light'}catch{}
        applyTheme(saved);
    }

    function render(){
        const items=getItems();
        if(!items)return;
        const existing=document.getElementById('baseScanBreadcrumbs');
        if(existing)return;
        ensureStyles();
        const nav=document.createElement('nav');
        nav.id='baseScanBreadcrumbs';
        nav.className='base-scan-breadcrumbs';
        nav.setAttribute('aria-label','Breadcrumb');
        nav.innerHTML=items.map((item,index)=>{
            const separator=index?'<span class="separator">/</span>':'';
            const content=item.href?`<a href="${item.href}">${esc(item.text)}</a>`:`<span class="current">${esc(item.text)}</span>`;
            return separator+content;
        }).join('');
        const detailContainer=document.querySelector('.detail-container');
        if(detailContainer){detailContainer.insertBefore(nav,detailContainer.firstChild);return}
        const pageHead=document.querySelector('.page-head');
        if(pageHead&&pageHead.parentElement)pageHead.parentElement.insertBefore(nav,pageHead);
    }

    function start(){
        ensureStyles();
        let saved='light';
        try{saved=localStorage.getItem(THEME_KEY)||'light'}catch{}
        applyTheme(saved);
        render();
        addThemeToggle();
        const app=document.getElementById('app');
        if(app){
            const observer=new MutationObserver(()=>{render();addThemeToggle()});
            observer.observe(app,{childList:true,subtree:true});
        }
        window.addEventListener('popstate',render);
        window.addEventListener('hashchange',render);
    }

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();