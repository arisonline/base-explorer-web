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

  if (redirectLegacyPath()) return;
  fixLinks();
  new MutationObserver(fixLinks).observe(document.documentElement, { childList: true, subtree: true });
})();
