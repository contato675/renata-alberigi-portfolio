import {escapeHtml as e} from './content.mjs';
/** Static, ordinary anchors are shared by desktop, no-JS disclosure and enhanced drawer. */
export function renderNavigation(data,locale,{homeUrl,localeMarkup,hasDigital,hasFilm,hasBrand}) {
  const u=data.dictionaries[locale];
  const items=[['works',u.paintingNav],...(hasDigital?[['digital',u.digital]]:[]),...(hasBrand?[['brand-design',u.brandNav]]:[]),...(hasFilm?[['film',u.video]]:[]),['about',u.about]];
  const links=items.map(([id,label])=>`<a class="control" href="${e(homeUrl)}#${id}">${e(label)}</a>`).join('')+`<a class="control" href="#contact">${e(u.contact)}</a>`;
  const nav=`<nav class="main-nav" aria-label="${e(u.mainNav)}">${links}</nav>`;
  return `<header class="site-header"><div class="wrap header-inner">
    <div class="desktop-navigation">${nav}${localeMarkup}</div>
    <details class="mobile-fallback" data-mobile-fallback><summary class="control">${e(u.menu)}</summary><div class="fallback-links">${nav}${localeMarkup}</div></details>
    <button class="menu-toggle" type="button" data-menu-open hidden aria-controls="mobile-navigation" aria-haspopup="dialog" aria-expanded="false" aria-label="${e(u.openMenu)}"><span>${e(u.menu)}</span><span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span></button>
  </div></header>
  <dialog id="mobile-navigation" class="nav-drawer" data-navigation aria-labelledby="navigation-title"><div class="nav-drawer-inner">
    <div class="drawer-heading"><h2 id="navigation-title">${e(u.menuTitle)}</h2><button type="button" data-menu-close aria-label="${e(u.closeMenu)}"><span aria-hidden="true">×</span></button></div>
    ${nav}<div class="drawer-languages"><p class="eyebrow">${e(u.language)}</p>${localeMarkup}</div>
  </div></dialog>`;
}
