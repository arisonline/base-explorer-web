(() => {
  const BASE = '/crypto/base-scan';
  const replacements = [
    ['/blocks/', '/block/'],
    ['/transactions/', '/tx/'],
    ['/addresses/', '/address/'],
    ['/tokens/', '/token/'],
    ['/contracts/', '/contract/']
  ];

  function fixLinks() {
    document.querySelectorAll('a[href]').forEach(a => {
      let href = a.getAttribute('href');
      if (!href || !href.startsWith(BASE + '/')) return;
      for (const [from, to] of replacements) {
        if (href === BASE + from || href.startsWith(BASE + from)) {
          a.setAttribute('href', BASE + to + href.slice((BASE + from).length));
          break;
        }
      }
    });
  }

  function redirectLegacyPath() {
    const path = location.pathname;
    for (const [from, to] of replacements) {
      const oldPath = BASE + from;
      if (path === oldPath || path.startsWith(oldPath)) {
        const target = BASE + to + path.slice(oldPath.length);
        location.replace(target + location.search + location.hash);
        return true;
      }
    }
    return false;
  }

  // Let detail links perform a normal document navigation.
  // site.js uses SPA history.pushState for these links, which can leave
  // the dynamic page without the stylesheet that the Worker serves.
  // A capture-phase listener stops the SPA handler before it can intercept.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith(BASE + '/')) return;
    const url = new URL(href, location.origin);
    if (/^\/crypto\/base-scan\/(block|tx|address|token|contract)\//.test(url.pathname)) {
      event.stopImmediatePropagation();
    }
  }, true);

  if (redirectLegacyPath()) return;
  fixLinks();
  new MutationObserver(fixLinks).observe(document.documentElement, { childList: true, subtree: true });
})();
