import {escapeHtml as e} from './content.mjs';
import {localized as l} from './i18n.mjs';
/** A complete design collection is one project, not dozens of separate artwork cards. */
export function renderBrandCollection(data,locale,{picture,pagePath,localUrl}) {
 const work=data.works.find(w=>w.status==='published'&&w.collection==='brand-design');if(!work)return '';
 const u=data.dictionaries[locale],url=localUrl(data.site,pagePath(locale,work));
 const slides=work.images.map((im,i)=>`<li><a href="${e(url)}#brand-image-${i+1}" data-open-project="${e(work.id)}" data-start="${i}" aria-label="${e(l(im.alt,locale))}">${picture(im,locale,data.site,false,'','(min-width: 1024px) 23vw, (min-width: 768px) 44vw, 82vw')}</a></li>`).join('');
 return `<section id="brand-design" data-collection="brand-design" aria-labelledby="brand-design-title"><div class="section-heading"><p class="eyebrow">04 / ${e(u.brandNav)}</p><h2 id="brand-design-title">${e(u.brandTitle)}</h2><p class="brand-byline">RUADOFLOW · 2024–2025</p><p class="collection-intro">${e(l(work.description,locale))}</p></div>
 <div class="brand-carousel" data-brand-carousel><ul class="brand-rail" aria-label="${e(u.brandTitle)}">${slides}</ul><div class="brand-actions"><a class="control" href="${e(url)}">${e(u.openFull)} <span aria-hidden="true">↗</span></a><div class="brand-controls" data-brand-controls hidden><button type="button" data-brand-prev aria-label="${e(u.previous)}"><span aria-hidden="true">←</span></button><output aria-live="polite" aria-atomic="true" data-of="${e(u.of)}"></output><button type="button" data-brand-next aria-label="${e(u.next)}"><span aria-hidden="true">→</span></button></div></div></div></section>`;
}
export function renderBrandPage(work,data,locale,{picture,pagePath,localUrl,absoluteUrl,facts}) {
 const u=data.dictionaries[locale],url=localUrl(data.site,pagePath(locale));
 const images=work.images.map((im,i)=>`<figure id="brand-image-${i+1}"><a href="${e(localUrl(data.site,im.path))}" data-open-project="${e(work.id)}" data-start="${i}">${picture(im,locale,data.site,i===0,'itemprop="image"','(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 94vw')}</a><figcaption>${im.caption?e(l(im.caption,locale)):e(l(im.alt,locale))}</figcaption></figure>`).join('');
 return `<article class="brand-project" itemscope itemtype="https://schema.org/CreativeWork" itemid="${e(absoluteUrl(data.site,pagePath(locale,work)))}"><div class="work-heading"><a class="control" href="${e(url)}#brand-design">${e(u.back)}</a><h1 itemprop="name">${e(l(work.title,locale))}</h1><p itemprop="creator" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${e(data.artist.name)}</span></p></div><div class="brand-project-info">${facts(work,locale,u)}</div><div class="brand-full-gallery">${images}</div></article>`;
}
