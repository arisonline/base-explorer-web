(function(){
  const BASE='/crypto/base-scan';
  const path=location.pathname.replace(/\/+$/,'');
  if(!path.startsWith(BASE)) return;

  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current='';
  let detail=false;
  let value='';

  let m=path.match(new RegExp('^'+BASE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/block/(\\d+)$'));
  if(m){current='Block';value='#'+Number(m[1]).toLocaleString();detail=true}
  m=path.match(new RegExp('^'+BASE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/tx/(0x[a-fA-F0-9]{64})$'));
  if(m){current='Transaction';value=m[1].slice(0,14)+'…'+m[1].slice(-8);detail=true}
  m=path.match(new RegExp('^'+BASE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/(address|token|contract)/(0x[a-fA-F0-9]{40})$'));
  if(m){current=m[1].charAt(0).toUpperCase()+m[1].slice(1);value=m[2].slice(0,12)+'…'+m[2].slice(-6);detail=true}
  if(!detail) return;

  function apply(){
    const app=document.getElementById('app');
    if(!app) return;
    const existing=app.querySelector('.breadcrumb');
    const html='<nav class="breadcrumb dozni-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/crypto/">Crypto</a><span>/</span><a href="'+BASE+'/">Base Scan</a><span>/</span><strong>'+esc(current)+'</strong><span>/</span><strong>'+esc(value)+'</strong></nav>';
    if(existing){existing.outerHTML=html;return true}
    const container=app.querySelector('.container');
    if(container){container.insertAdjacentHTML('afterbegin',html);return true}
    return false;
  }

  const style=document.createElement('style');
  style.textContent='.dozni-breadcrumb{display:flex!important;align-items:center;flex-wrap:wrap;gap:7px;margin:0 0 22px;padding:0;color:#9293a1;font-size:11px}.dozni-breadcrumb a{color:#737482;text-decoration:none}.dozni-breadcrumb a:hover{color:#635bff}.dozni-breadcrumb span{color:#c4c5ce}.dozni-breadcrumb strong{color:#282831;font-weight:700}';
  document.head.appendChild(style);

  if(!apply()){
    const observer=new MutationObserver(()=>{if(apply()) observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }
})();
