import {renderBrandCollection,renderBrandPage} from './brand-render.mjs';
import {renderNavigation} from './navigation.mjs';
import {escapeHtml as e,allVideos,pdfPath} from './content.mjs';
import {localized as l, localePath, LOCALES} from './i18n.mjs';
export const localUrl = (site, relative = '') => site.basePath + relative;
export const absoluteUrl = (site, relative = '') => site.origin + localUrl(site, relative);
export const pagePath = (locale, work) => localePath(locale) + (work ? `works/${work.id}/` : '');
export const publicWorks = (data) => data.works.filter((work) => work.status === 'published');
export function paragraphs(text) {
  return text.split(/\n\s*\n|(?=Entre seus trabalhos,)|(?=Sua trajetória também inclui)|(?=Among her works is)|(?=Her experience also includes)/).filter(Boolean).map((p) => `<p>${e(p.trim())}</p>`).join('\n');
}
export function picture(image, locale, site, eager = false, extra = '', size = '90vw') {
  const candidates=[...(image.variants||[]),image];
  const responsive=candidates.length>1 ? ` srcset="${candidates.map(v=>`${e(localUrl(site,v.path))} ${v.width}w`).join(', ')}" sizes="${e(size)}"` : '';
  return `<img src="${e(localUrl(site,image.path))}"${responsive} alt="${e(l(image.alt,locale))}" width="${image.width}" height="${image.height}" loading="${eager?'eager':'lazy'}" decoding="async" draggable="false" ${eager?'fetchpriority="high"':''} ${extra}>`;
}
function guides(preview) {
  return preview ? '<div class="guides" aria-hidden="true">' + '<i></i>'.repeat(12) + '</div>' : '';
}
function localeNav(data, locale, work) {
  return `<nav class="locale-nav" aria-label="${e(data.dictionaries[locale].language)}">${LOCALES.map((other) => `<a class="control" data-locale-link href="${e(localUrl(data.site,pagePath(other,work)))}" lang="${other}" hreflang="${other}"${locale === other ? ' aria-current="page"' : ''}>${other === 'en' ? 'English' : 'Português'}</a>`).join('')}</nav>`;
}
function facts(work, locale, u) {
  const yearLabel=work.yearIsCollectionPeriod?u.collectionPeriod:u.year;
  return `<dl><dt>${e(yearLabel)}</dt><dd${/^\d{4}$/.test(work.year)?' itemprop="dateCreated"':''}>${e(work.year)}</dd><dt>${e(u.technique)}</dt><dd itemprop="${work.collection==='brand-design'?'genre':'artMedium'}">${e(l(work.technique,locale))}</dd>${work.dimensions?`<dt>${e(u.dimensions)}</dt><dd itemprop="size">${e(work.dimensions)}</dd>`:''}</dl>${work.titleStatus==='catalogue-label'?`<p class="meta">${e(u.catalogueLabel)}</p>`:''}${work.description?paragraphs(l(work.description,locale)):''}`;
}
function card(work, data, locale) {
  const {site} = data, u = data.dictionaries[locale];
  return `<li class="project"><a href="${e(localUrl(site,pagePath(locale,work)))}" data-open-project="${e(work.id)}" aria-labelledby="card-${e(work.id)}"><figure>${picture(work.images[work.cover],locale,site,false,'','(min-width: 1488px) 448px, (min-width: 1024px) 31vw, (min-width: 768px) 47vw, 94vw')}<figcaption class="caption"><h3 id="card-${e(work.id)}">${e(l(work.title,locale))}</h3><p>${work.yearIsCollectionPeriod?e(u.collectionPeriod)+': ':''}${e(work.year)} · ${e(l(work.technique,locale))}</p>${work.dimensions?`<p class="work-dimensions">${e(work.dimensions)}</p>`:''}${work.images.length > 1 ? `<span class="project-number">${work.images.length} ${e(u.images)}</span>` : ''}</figcaption></figure></a></li>`;
}
function dialog(work, data, locale) {
  const {site} = data, u = data.dictionaries[locale];
  return `<dialog class="viewer" data-project="${e(work.id)}" data-cover="${work.cover}" aria-labelledby="viewer-${e(work.id)}"><div class="viewer-head"><h2 id="viewer-${e(work.id)}">${e(l(work.title,locale))}</h2><button type="button" data-close>${e(u.close)}</button></div><div class="viewer-layout"><div class="viewer-media"><div class="image-rail" role="region" aria-label="${e(l(work.title,locale))}">${work.images.map((im, i) => `<figure aria-label="${e(u.image)} ${i+1} ${e(u.of)} ${work.images.length}">${picture(im,locale,site)}${im.caption ? `<figcaption>${e(l(im.caption,locale))}</figcaption>` : ''}</figure>`).join('')}</div><div class="viewer-controls"${work.images.length === 1 ? ' hidden' : ''}><button type="button" data-prev><span aria-hidden="true">←</span><span class="sr-only">${e(u.previous)}</span></button><output aria-live="polite" aria-atomic="true" data-of="${e(u.of)}">${work.cover+1} ${e(u.of)} ${work.images.length}</output><button type="button" data-next><span aria-hidden="true">→</span><span class="sr-only">${e(u.next)}</span></button></div></div><aside>${facts(work,locale,u)}<a class="control" href="${e(localUrl(site,pagePath(locale,work)))}">${e(u.openFull)}</a><a class="control" hreflang="${locale === 'en' ? 'pt-BR' : 'en'}" href="${e(localUrl(site,pagePath(locale === 'en' ? 'pt-BR' : 'en',work)))}">${e(u.viewLanguage)}</a></aside></div></dialog>`;
}
function film(data, locale, preview) {
  const {artist,site}=data,u=data.dictionaries[locale],videos=allVideos(artist);
  if(!videos.length&&!preview)return '';
  const cards=videos.map((video,i)=>{
    const embed=video.provider==='youtube'?`https://www.youtube-nocookie.com/embed/${video.id}`:`https://player.vimeo.com/video/${video.id}`;
    const original=video.provider==='youtube'?`https://www.youtube.com/watch?v=${video.id}`:`https://vimeo.com/${video.id}`;
    return `<article class="film-card" aria-labelledby="film-${i}"><div class="video-poster">${picture(video.poster,locale,site,false,'','(min-width: 768px) 46vw, 94vw')}<button type="button" class="video-button" data-video="${e(embed)}" data-title="${e(l(video.title,locale))}" hidden><span aria-hidden="true">▶</span> ${e(u.watch)}</button></div><h3 id="film-${i}">${e(l(video.title,locale))}</h3><a class="control" href="${e(original)}" rel="noopener noreferrer">${e(u.externalVideo)} ↗</a>${video.description?`<p class="meta">${e(l(video.description,locale))}</p>`:''}${video.transcript?`<div class="bio">${paragraphs(l(video.transcript,locale))}</div>`:''}</article>`;
  }).join('');
  return `<section id="film" aria-labelledby="film-title"><div class="section-heading"><p class="eyebrow">02 / ${e(u.video)}</p><h2 id="film-title">${e(u.filmTitle)}</h2><p class="meta">${e(u.filmNote)}</p></div>${videos.length?`<div class="film-grid grid">${cards}</div>`:`<div class="placeholder video-slot"><p>${e(u.filmPending)}</p></div>`}</section>`;
}
function collection(data,locale,key) {
  const works=publicWorks(data).filter(w=>(w.collection||'paintings')===key),u=data.dictionaries[locale];
  if(key==='digital'&&!works.length)return '';
  const isPainting=key==='paintings',id=isPainting?'works':'digital';
  return `<section id="${id}" data-collection="${key}" aria-labelledby="${id}-title"><div class="section-heading"><p class="eyebrow">${isPainting?'01':'03'} / ${e(isPainting?u.paintingNav:u.digital)}</p><h2 id="${id}-title">${e(isPainting?u.paintings:u.digitalTitle)}</h2><p class="collection-intro">${e(isPainting?u.paintingsNote:u.digitalNote)}</p></div>${works.length?`<ul class="gallery grid">${works.map(w=>card(w,data,locale)).join('')}</ul>`:`<div class="placeholder"><p>${e(u.emptyTitle)}</p><p>${e(u.emptyText)}</p></div>`}</section>`;
}
function home(data,locale,preview) {
 const {artist,site}=data,u=data.dictionaries[locale];
 const portrait=artist.portrait?`<figure class="portrait">${picture(artist.portrait,locale,site,true,'itemprop="image"','(min-width: 1024px) 38vw, (min-width: 768px) 34vw, 94vw')}</figure>`:(preview?`<div class="placeholder portrait">${e(u.portraitPending)}</div>`:'');
 return `<section class="grid hero" aria-labelledby="name" itemscope itemtype="https://schema.org/Person" itemid="${e(absoluteUrl(site,'#artist'))}"><div class="hero-copy"><p class="eyebrow" itemprop="jobTitle">${e(l(artist.role,locale))}</p><h1 id="name" itemprop="name">${e(artist.name)}</h1><p class="intro" itemprop="description">${e(l(artist.intro,locale))}</p><p class="meta">${e(l(artist.location,locale))}</p><div class="hero-actions"><a class="control primary" href="#works">${e(u.viewPaintings)} <span aria-hidden="true">↓</span></a><a class="control" href="#about">${e(u.readBio)}</a></div></div>${portrait}${guides(preview)}</section>
 ${collection(data,locale,'paintings')}${film(data,locale,preview)}${collection(data,locale,'digital')}${renderBrandCollection(data,locale,{picture,pagePath,localUrl})}
 <section id="about" class="grid" aria-labelledby="about-title"><div class="section-title section-heading"><p class="eyebrow">${data.works.some(w=>w.collection==='brand-design')?'05':'04'} / ${e(u.bioLabel)}</p><h2 id="about-title">${e(artist.name)}</h2></div><div class="section-content bio">${paragraphs(l(artist.bio,locale))}</div>${guides(preview)}</section>
 ${artist.studioImages.length?`<section id="studio" aria-labelledby="studio-title"><h2 id="studio-title">${e(u.studio)}</h2><div class="grid">${artist.studioImages.map(im=>`<figure class="project">${picture(im,locale,site)}${im.caption?`<figcaption>${e(l(im.caption,locale))}</figcaption>`:''}</figure>`).join('')}</div></section>`:''}`;
}
function workPage(work,data,locale) {
  if(work.collection==='brand-design')return renderBrandPage(work,data,locale,{picture,pagePath,localUrl,absoluteUrl,facts});
  const {site,artist} = data, u = data.dictionaries[locale];
  return `<article itemscope itemtype="https://schema.org/VisualArtwork" itemid="${e(absoluteUrl(site,pagePath(locale,work)))}"><div class="work-heading"><a class="control" href="${e(localUrl(site,pagePath(locale)))}#${work.collection==='digital'?'digital':'works'}">${e(u.back)}</a><h1 itemprop="name">${e(l(work.title,locale))}</h1><p itemprop="creator" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${e(artist.name)}</span></p></div><div class="grid"><div class="work-images">${work.images.map((im,i) => `<figure>${picture(im,locale,site,i === 0,'itemprop="image"')}${im.caption ? `<figcaption>${e(l(im.caption,locale))}</figcaption>` : ''}</figure>`).join('')}</div><aside class="work-info">${facts(work,locale,u)}</aside></div></article>`;
}
export function renderPage(data,template,locale,{work=null,release=false,notFound=false}={}) {
  const {artist,site} = data, u = data.dictionaries[locale], preview = !release;
  const route = pagePath(locale,work), canonical = absoluteUrl(site,route);
  const homeUrl = localUrl(site,pagePath(locale));
  const title = notFound ? `${u.notFound} — ${artist.name}` : `${work ? l(work.title,locale) : artist.name} — ${l(artist.role,locale)}`;
  const description = work ? (work.description ? l(work.description,locale) : `${l(work.title,locale)} · ${work.year} · ${l(work.technique,locale)} · ${work.dimensions||''}`) : l(artist.intro,locale);
  const header = renderNavigation(data,locale,{homeUrl,localeMarkup:localeNav(data,locale,work),hasDigital:publicWorks(data).some(w=>w.collection==='digital'),hasFilm:!!artist.featuredVideo||preview,hasBrand:publicWorks(data).some(w=>w.collection==='brand-design')});
  const footer = `<footer id="contact"><div class="wrap"><p class="eyebrow">${e(u.contact)}</p><p>${e(u.contactIntro)}</p><div class="footer-links"><a class="control" href="mailto:${e(artist.email)}">${e(artist.email)}</a>${pdfPath(artist,locale) ? `<a class="control" href="${e(localUrl(site,pdfPath(artist,locale)))}" type="application/pdf">${e(u.pdf)}</a>` : ''}<a class="control" href="${e(localUrl(site,route+'index.md'))}">${e(u.machine)}</a></div><p class="meta">${e(u.rights)}</p></div></footer>`;
  const alternates = LOCALES.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${e(absoluteUrl(site,pagePath(lang,work)))}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${e(absoluteUrl(site,pagePath('en',work)))}">`;
  const values = {LANG:locale,ROBOTS:release && !notFound ? 'index,follow,max-image-preview:large' : 'noindex,follow',TITLE:e(title),DESCRIPTION:e(description),CANONICAL:e(canonical),OGIMAGE:publicWorks(data).length?`<meta property="og:image" content="${e(absoluteUrl(site,(work||publicWorks(data)[0]).images[(work||publicWorks(data)[0]).cover].path))}">`:'',OGLOCALE:locale === 'en' ? 'en_US' : 'pt_BR',ALTERNATES:alternates,BASE:e(site.basePath),LLMS:e(absoluteUrl(site,'llms.txt')),MARKDOWN:e(absoluteUrl(site,route+'index.md')),DATA:e(absoluteUrl(site,localePath(locale)+'portfolio.json')),STAGE:preview ? 'review' : 'published',SKIP:e(u.skip),HEADER:header,NOTICE:'',MAIN:notFound ? `<section><h1>${e(u.notFound)}</h1><p>${e(u.notFoundText)}</p><a class="control" href="${e(homeUrl)}">${e(u.home)}</a></section>` : (work ? workPage(work,data,locale) : home(data,locale,preview)),FOOTER:footer,DIALOGS:notFound?'':work?(work.collection==='brand-design'?dialog(work,data,locale):''):publicWorks(data).map((w)=>dialog(w,data,locale)).join('\n')};
  return template.replace(/\{\{([A-Z]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template placeholder: ${key}`);
    return values[key];
  });
}
