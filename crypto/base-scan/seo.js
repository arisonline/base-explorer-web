(() => {
  const BASE = '/crypto/base-scan';
  const SITE = 'https://dozni.com';
  const SITE_URL = `${SITE}${BASE}/`;
  const SITE_NAME = 'Dozni Base Scan';
  const DEFAULT_IMAGE = `${SITE_URL}og-image.svg`;
  const KEYWORDS = 'Base Scan, Base Mainnet explorer, Base explorer, Base blockchain explorer, Base blocks, Base transactions, Base addresses, Base tokens, Base smart contracts, Base L2, Ethereum Layer 2, Dozni';

  const $meta = (name, content, attr = 'name') => {
    let el = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      if (attr === 'property') el.setAttribute('property', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const $link = (rel, href, extra = {}) => {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
    Object.entries(extra).forEach(([key, value]) => el.setAttribute(key, value));
  };

  function getPage() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === BASE) return { type: 'home', canonical: SITE_URL };
    if (path === `${BASE}/block`) return { type: 'blocks', canonical: `${SITE_URL}block/` };
    if (path === `${BASE}/tx`) return { type: 'transactions', canonical: `${SITE_URL}tx/` };
    if (path === `${BASE}/address`) return { type: 'addresses', canonical: `${SITE_URL}address/` };
    if (path === `${BASE}/token`) return { type: 'tokens', canonical: `${SITE_URL}token/` };
    if (path === `${BASE}/contract`) return { type: 'contracts', canonical: `${SITE_URL}contract/` };

    let match;
    if ((match = path.match(new RegExp(`^${BASE}/block/(\\d+)$`)))) return { type: 'block', value: match[1], canonical: `${SITE_URL}block/${match[1]}/` };
    if ((match = path.match(new RegExp(`^${BASE}/tx/(0x[a-fA-F0-9]{64})$`)))) return { type: 'tx', value: match[1], canonical: `${SITE_URL}tx/${match[1]}/` };
    if ((match = path.match(new RegExp(`^${BASE}/address/(0x[a-fA-F0-9]{40})$`)))) return { type: 'address', value: match[1], canonical: `${SITE_URL}address/${match[1]}/` };
    if ((match = path.match(new RegExp(`^${BASE}/token/(0x[a-fA-F0-9]{40})$`)))) return { type: 'token', value: match[1], canonical: `${SITE_URL}token/${match[1]}/` };
    if ((match = path.match(new RegExp(`^${BASE}/contract/(0x[a-fA-F0-9]{40})$`)))) return { type: 'contract', value: match[1], canonical: `${SITE_URL}contract/${match[1]}/` };
    return { type: '404', canonical: `${SITE_URL}404/` };
  }

  function pageData(page) {
    const data = {
      home: {
        title: 'Base Scan — Base Mainnet Explorer | Dozni',
        description: 'Explore Base Mainnet with Dozni Base Scan. Search blocks, transactions, addresses, tokens and smart contracts on Base.',
        type: 'WebSite', breadcrumbs: [['Base Scan', SITE_URL]], keywords: KEYWORDS
      },
      blocks: {
        title: 'Latest Base Blocks — Base Scan | Dozni',
        description: 'View the latest Base Mainnet blocks, block numbers, timestamps, gas data and transactions with Dozni Base Scan.',
        type: 'CollectionPage', breadcrumbs: [['Base Scan', SITE_URL], ['Blocks', `${SITE_URL}block/`]], keywords: 'Base blocks, latest Base blocks, Base Mainnet blocks, Base block explorer, Base Scan blocks'
      },
      transactions: {
        title: 'Latest Base Transactions — Base Scan | Dozni',
        description: 'Browse the latest Base Mainnet transactions with block, sender, receiver, value, status and timestamp details.',
        type: 'CollectionPage', breadcrumbs: [['Base Scan', SITE_URL], ['Transactions', `${SITE_URL}tx/`]], keywords: 'Base transactions, latest Base transactions, Base Mainnet transactions, Base tx explorer, Base Scan transactions'
      },
      addresses: {
        title: 'Base Addresses — Base Scan | Dozni',
        description: 'Explore Base Mainnet addresses, ETH balances, address types and recent transactions with Dozni Base Scan.',
        type: 'CollectionPage', breadcrumbs: [['Base Scan', SITE_URL], ['Addresses', `${SITE_URL}address/`]], keywords: 'Base addresses, Base wallet address, Base address explorer, Base Mainnet addresses, Base Scan addresses'
      },
      tokens: {
        title: 'Base Tokens — Base Scan | Dozni',
        description: 'Explore Base Mainnet token contracts, token types, decimals, total supply and holders with Dozni Base Scan.',
        type: 'CollectionPage', breadcrumbs: [['Base Scan', SITE_URL], ['Tokens', `${SITE_URL}token/`]], keywords: 'Base tokens, Base token explorer, Base Mainnet tokens, ERC-20 Base, Base Scan tokens'
      },
      contracts: {
        title: 'Base Smart Contracts — Base Scan | Dozni',
        description: 'Explore Base Mainnet smart contracts, verification status, compiler details and contract balances with Dozni Base Scan.',
        type: 'CollectionPage', breadcrumbs: [['Base Scan', SITE_URL], ['Contracts', `${SITE_URL}contract/`]], keywords: 'Base smart contracts, Base contracts, Base contract explorer, Base Mainnet contracts, Base Scan contracts'
      },
      block: {
        title: `Base Block #${page.value} — Base Scan | Dozni`,
        description: `View Base Mainnet block #${page.value}, including block hash, timestamp, validator, gas data and transactions.`,
        type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL], ['Blocks', `${SITE_URL}block/`], [`Block #${page.value}`, page.canonical]], keywords: `Base block ${page.value}, Base block explorer, Base Mainnet block, Base Scan block`
      },
      tx: {
        title: `Base Transaction ${page.value} — Base Scan | Dozni`,
        description: `View Base Mainnet transaction ${page.value}, including status, block, timestamp, sender, receiver, value and gas details.`,
        type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL], ['Transactions', `${SITE_URL}tx/`], [`Transaction ${page.value}`, page.canonical]], keywords: `Base transaction ${page.value}, Base tx, Base Mainnet transaction, Base transaction explorer`
      },
      address: {
        title: `Base Address ${page.value} — Base Scan | Dozni`,
        description: `Explore Base Mainnet address ${page.value}, including ETH balance, address type and recent transactions.`,
        type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL], ['Addresses', `${SITE_URL}address/`], [`Address ${page.value}`, page.canonical]], keywords: `Base address ${page.value}, Base wallet address, Base address explorer, Base Mainnet address`
      },
      token: {
        title: `Base Token ${page.value} — Base Scan | Dozni`,
        description: `Explore Base Mainnet token contract ${page.value}, including token type, decimals, total supply and holders.`,
        type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL], ['Tokens', `${SITE_URL}token/`], [`Token ${page.value}`, page.canonical]], keywords: `Base token ${page.value}, Base token contract, Base Mainnet token, Base token explorer`
      },
      contract: {
        title: `Base Contract ${page.value} — Base Scan | Dozni`,
        description: `Explore Base Mainnet smart contract ${page.value}, including verification status, contract type, balance and compiler information.`,
        type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL], ['Contracts', `${SITE_URL}contract/`], [`Contract ${page.value}`, page.canonical]], keywords: `Base contract ${page.value}, Base smart contract, Base Mainnet contract, Base contract explorer`
      },
      '404': {
        title: 'Page Not Found — Base Scan | Dozni', description: 'The requested Base Scan page could not be found.', type: 'WebPage', breadcrumbs: [['Base Scan', SITE_URL]], keywords: KEYWORDS
      }
    };
    return data[page.type] || data['404'];
  }

  function setSchema(page, data) {
    let script = document.getElementById('base-scan-schema');
    if (!script) {
      script = document.createElement('script'); script.id = 'base-scan-schema'; script.type = 'application/ld+json'; document.head.appendChild(script);
    }
    const breadcrumbItems = data.breadcrumbs.map(([name, url], index) => ({ '@type':'ListItem', position:index+1, name, item:url }));
    const graph = [
      { '@type':'Organization', '@id':`${SITE}/#organization`, name:'Dozni', url:SITE, logo:`${SITE_URL}favicon.svg` },
      { '@type':'WebSite', '@id':`${SITE_URL}#website`, url:SITE_URL, name:SITE_NAME, alternateName:'Base Scan', description:'Base Mainnet explorer by Dozni.', publisher:{'@id':`${SITE}/#organization`} },
      { '@type':data.type, '@id':`${page.canonical}#webpage`, url:page.canonical, name:data.title, description:data.description, isPartOf:{'@id':`${SITE_URL}#website`}, about:{'@type':'Thing',name:'Base Mainnet'}, publisher:{'@id':`${SITE}/#organization`} },
      { '@type':'BreadcrumbList', '@id':`${page.canonical}#breadcrumb`, itemListElement:breadcrumbItems }
    ];
    script.textContent = JSON.stringify({'@context':'https://schema.org','@graph':graph});
  }

  function update() {
    const page = getPage(); const data = pageData(page); const is404 = page.type === '404';
    document.title = data.title;
    $meta('description', data.description);
    $meta('robots', is404 ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    $meta('keywords', data.keywords); $meta('author','Dozni'); $meta('application-name',SITE_NAME); $meta('theme-color','#635bff'); $meta('referrer','strict-origin-when-cross-origin');
    $meta('og:type','website','property'); $meta('og:site_name',SITE_NAME,'property'); $meta('og:title',data.title,'property'); $meta('og:description',data.description,'property'); $meta('og:url',page.canonical,'property'); $meta('og:image',DEFAULT_IMAGE,'property'); $meta('og:image:alt','Dozni Base Scan — Base Mainnet Explorer','property'); $meta('og:locale','en_US','property');
    $meta('twitter:card','summary_large_image'); $meta('twitter:title',data.title); $meta('twitter:description',data.description); $meta('twitter:image',DEFAULT_IMAGE); $meta('twitter:image:alt','Dozni Base Scan — Base Mainnet Explorer');
    $link('canonical',page.canonical); $link('icon',`${SITE_URL}favicon.svg`,{type:'image/svg+xml'}); $link('shortcut icon',`${SITE_URL}favicon.svg`,{type:'image/svg+xml'}); $link('apple-touch-icon',`${SITE_URL}favicon.svg`);
    setSchema(page,data);
  }

  let lastUrl = location.href;
  const run = () => { if(location.href !== lastUrl) lastUrl = location.href; update(); };
  window.addEventListener('popstate',run); window.addEventListener('hashchange',run);
  ['pushState','replaceState'].forEach(method => { const original=history[method]; history[method]=function(...args){const result=original.apply(this,args);setTimeout(run,0);return result;}; });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',update,{once:true}); else update();
})();
