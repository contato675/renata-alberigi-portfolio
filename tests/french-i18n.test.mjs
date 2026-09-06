import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {LOCALES,LOCALE_CONFIG,localePath,localized,validateTranslations} from '../scripts/i18n.mjs';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {pagePath} from '../scripts/render.mjs';
import {escapeHtml,validateContent,pdfPath} from '../scripts/content.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await loadContent(root),template=await readFile(path.join(root,'site/index.template.html'),'utf8');
const files=generatePages(data,template),fr=data.dictionaries.fr;
function localizedPaths(value,prefix=[]){
 if(!value||typeof value!=='object')return [];
 if(typeof value.en==='string'&&typeof value['pt-BR']==='string')return [prefix];
 return Object.entries(value).flatMap(([key,child])=>localizedPaths(child,[...prefix,key]));
}
const contentPaths=localizedPaths({artist:data.artist,works:data.works});
test('French is the third explicit locale, with its own path and Open Graph locale',()=>{
 assert.deepEqual(LOCALES,['en','pt-BR','fr']);assert.deepEqual(data.site.locales,LOCALES);
 assert.deepEqual(LOCALES.map(localePath),['','pt-br/','fr/']);assert.equal(LOCALE_CONFIG.fr.og,'fr_FR');
 assert.throws(()=>localePath('fr-CA'),/Unsupported/);assert.throws(()=>localePath('../'),/Unsupported/);
});
test('Every UI key has a nonempty French translation; parity rejects missing and blank keys',()=>{
 assert.deepEqual(validateTranslations(data.dictionaries),[]);
 assert.equal(Object.keys(fr).length,Object.keys(data.dictionaries.en).length);
 for(const value of Object.values(fr))assert.ok(typeof value==='string'&&value.trim());
 for(const key of Object.keys(fr)){
  const missing=structuredClone(data.dictionaries);delete missing.fr[key];assert.ok(validateTranslations(missing).some(e=>e.includes('fr')));
  const blank=structuredClone(data.dictionaries);blank.fr[key]=' ';assert.ok(validateTranslations(blank).some(e=>e.includes('fr.'+key)));
 }
});
test('Every localized biography, project, image, caption and video field has French',()=>{
 assert.ok(contentPaths.length>=330);
 for(const keys of contentPaths){const value=keys.reduce((v,k)=>v[k],data);assert.ok(value.fr?.trim(),keys.join('.'));}
});
test('Deleting any French content field makes validation fail instead of falling back',()=>{
 for(const keys of contentPaths){const copy=structuredClone(data),value=keys.reduce((v,k)=>v[k],copy);delete value.fr;assert.ok(validateContent(copy).some(e=>e.includes('fr')),keys.join('.'));}
 assert.throws(()=>localized({en:'English','pt-BR':'Português'},'fr'),/Missing translation/);
 assert.throws(()=>localized({fr:' '},'fr'),/Missing translation/);
});
test('French schema is mandatory for every localized work field',async()=>{
 const schema=JSON.parse(await readFile(path.join(root,'schemas/work.schema.json'),'utf8'));
 assert.deepEqual(schema.$defs.localized.required,LOCALES);assert.equal(schema.$defs.localized.additionalProperties,false);
 assert.equal(schema.$defs.localized.properties.fr.minLength,1);
});
test('All French project and home pages are complete static HTML, Markdown and self-canonical',()=>{
 for(const work of [null,...data.works]){
  const route=pagePath('fr',work),html=files.get(route+'index.html'),md=files.get(route+'index.md');
  assert.ok(html&&md,route);assert.ok(html.includes('<html lang="fr">'));
  assert.ok(html.includes(`rel="canonical" href="${data.site.origin}/${route}"`));
  assert.ok(html.includes('property="og:locale" content="fr_FR"'));
  assert.ok(html.includes(escapeHtml(fr.closeMenu)));assert.ok(html.includes(escapeHtml(fr.rights)));
  assert.doesNotMatch(html,/\{\{[A-Z]+\}\}|>undefined<|>null</);
  for(const locale of LOCALES)assert.ok(html.includes(`hreflang="${locale}" href="${data.site.origin}/${pagePath(locale,work)}"`));
  assert.ok(html.includes(`hreflang="x-default" href="${data.site.origin}/${pagePath('en',work)}"`));
  if(work){assert.ok(html.includes(escapeHtml(work.technique.fr)));assert.ok(md.includes(work.technique.fr));assert.ok(html.includes(work.images.at(-1).path));}
 }
});
test('Every language selector offers three named, equivalent routes and a current-language marker',()=>{
 for(const locale of LOCALES)for(const work of [null,...data.works]){
  const html=files.get(pagePath(locale,work)+'index.html');
  const header=html.match(/<header[\s\S]*?<\/header>/)[0];
  for(const [,nav] of header.matchAll(/<nav class="locale-nav"[^>]*>([\s\S]*?)<\/nav>/g)){
   assert.equal((nav.match(/data-locale-link/g)||[]).length,3);assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
   for(const other of LOCALES){assert.ok(nav.includes(`href="/${pagePath(other,work)}"`));assert.ok(nav.includes(`lang="${other}"`));assert.ok(nav.includes(data.dictionaries[other].localeName));}
  }
 }
});
test('French viewers localize every image description, counter, close action and language link',()=>{
 const home=files.get('fr/index.html');
 for(const work of data.works){
  const dialog=home.match(new RegExp(`<dialog class="viewer" data-project="${work.id}"[\\s\\S]*?<\\/dialog>`))?.[0];assert.ok(dialog,work.id);
  assert.ok(dialog.includes(escapeHtml(fr.close)));assert.ok(dialog.includes('data-of="sur"'));
  for(const image of work.images)assert.ok(dialog.includes(`alt="${escapeHtml(image.alt.fr)}"`));
  for(const locale of LOCALES)assert.ok(dialog.includes(`href="/${pagePath(locale,work)}"`));
 }
});
test('French original artwork and film titles remain unchanged; no dates or dimensions fabricated',()=>{
 for(const work of data.works.filter(w=>w.collection!=='brand-design'))assert.equal(work.title.fr,work.originalTitle);
 for(const video of [data.artist.featuredVideo,...data.artist.additionalVideos]){assert.equal(video.title.fr,video.title['pt-BR']);assert.equal(video.transcript,null);}
 assert.equal(data.works.find(w=>w.id==='correnteza-2022').year,'2022');
 assert.equal(data.works.find(w=>w.id==='analogiaeu-2018').dimensions,'130 × 800 cm');
});
test('French structured data and Markdown contain the same full biography and all 21 projects',()=>{
 const graph=JSON.parse(files.get('fr/portfolio.json'))['@graph'];assert.equal(graph.length,22);
 assert.equal(graph[0].description,data.artist.bio.fr);assert.ok(files.get('fr/index.md').includes(data.artist.bio.fr));
 for(const work of data.works){const item=graph.find(v=>v.url?.endsWith(pagePath('fr',work)));assert.ok(item);assert.equal(item.name,work.title.fr);assert.equal(item.inLanguage,'fr');assert.equal(item.image.length,work.images.length);assert.equal(item.artMedium??item.genre,work.technique.fr);}
});
test('RUADOFLOW French collection includes all 66 translated captions without commerce claims',()=>{
 const work=data.works.find(w=>w.collection==='brand-design'),html=files.get(pagePath('fr',work)+'index.html');
 assert.equal(work.images.length,66);assert.equal((html.match(/<figure id="brand-image-/g)||[]).length,66);
 for(const image of work.images)assert.ok(html.includes(escapeHtml(image.caption.fr)));
 assert.doesNotMatch(files.get('fr/portfolio.json'),/"offers"|"price"|"availability"/);
});
test('French discovery links and legacy aliases are complete and correctly labelled',()=>{
 const llms=files.get('llms.txt');assert.ok(llms.includes(fr.portfolioBiography));assert.ok(llms.includes('/fr/index.md'));assert.ok(llms.includes(fr.portfolioSummary));
 assert.ok(files.get('llms-full.txt').includes(data.artist.bio.fr));assert.doesNotMatch(llms,/bilingual/);
 assert.ok(files.get('fr/works/correnteza-2024/index.html').includes('/fr/works/correnteza-2022/'));
});
test('Localized error pages have equivalent language links and no nonexistent Markdown URL',()=>{
 for(const locale of LOCALES){const route=localePath(locale)+'404.html',html=files.get(route);assert.ok(html.includes(escapeHtml(data.dictionaries[locale].notFoundText)));assert.ok(html.includes(`href="${data.site.origin}/${route}"`));assert.doesNotMatch(html,/404\.htmlindex\.md/);for(const other of LOCALES)assert.ok(html.includes(`href="/${localePath(other)}404.html"`));}
});
test('French PDF lookup supports a distinct file without inventing an unavailable download',()=>{
 assert.equal(pdfPath(data.artist,'fr'),null);
 assert.equal(pdfPath({...data.artist,pdf:'downloads/en.pdf',pdfFr:'downloads/fr.pdf'},'fr'),'downloads/fr.pdf');
 const copy=structuredClone(data);copy.artist.pdfFr='../private.pdf';assert.ok(validateContent(copy).some(e=>e.includes('French PDF')));
});
test('Project-subpath mode generates the same three locales without root-only assumptions',()=>{
 const copy=structuredClone(data);copy.site.origin='https://contato675.github.io';copy.site.basePath='/renata-alberigi-portfolio/';delete copy.site.customDomain;
 const out=generatePages(copy,template);assert.ok(out.get('fr/index.html').includes('href="/renata-alberigi-portfolio/fr/"'));assert.equal(out.has('CNAME'),false);
});
test('A ready test fixture produces reciprocal three-language sitemap entries; actual noindex stays intact',()=>{
 const copy=structuredClone(data);Object.assign(copy.site,{phase:'ready',implementationComplete:true,publicationApproved:true,robotsRootVerified:true});copy.artist.editorialReview=Object.fromEntries(LOCALES.map(locale=>[locale,true]));copy.artist.pdf='downloads/test-only.pdf';
 const sitemap=generatePages(copy,template,{release:true}).get('sitemap.xml');assert.equal((sitemap.match(/<url>/g)||[]).length,66);assert.ok(sitemap.includes('hreflang="fr"'));
 assert.equal(data.artist.editorialReview.fr,false);assert.equal(data.site.publicationApproved,false);assert.equal(files.get('CNAME'),'renataalberigi.com.br\n');assert.doesNotMatch(files.get('sitemap.xml'),/<url>/);
});
