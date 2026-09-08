import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {renderPage,pagePath} from '../scripts/render.mjs';
import {validateContent,escapeHtml as e,pdfPath} from '../scripts/content.mjs';
import {LOCALES,LOCALE_CONFIG,localePath,localized,validateTranslations} from '../scripts/i18n.mjs';
import {cvPath,curriculumRecords} from '../scripts/curriculum.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const template=await fs.readFile(path.join(root,'site/index.template.html'),'utf8'),files=generatePages(data,template),ui=data.dictionaries.es;
function localizedPaths(x,p=[]){if(!x||typeof x!=='object')return [];if(typeof x.en==='string'&&typeof x['pt-BR']==='string')return[p];return Object.entries(x).flatMap(([k,v])=>localizedPaths(v,[...p,k]));}
const fields=localizedPaths({artist:data.artist,works:data.works,curriculum:data.curriculum});
const get=(x,keys)=>keys.reduce((v,k)=>v[k],x);
test('Spanish is the fourth locale and English remains the default',()=>{
 assert.deepEqual(LOCALES,['en','pt-BR','fr','es']);assert.deepEqual(data.site.locales,LOCALES);assert.equal(data.site.defaultLocale,'en');assert.equal(localePath('es'),'es/');assert.equal(cvPath('es'),'es/curriculo/');assert.equal(LOCALE_CONFIG.es.og,'es_ES');assert.throws(()=>localePath('de'));
});
test('Spanish covers every public localized field, including the full CV and captions',()=>{
 assert.equal(fields.length,410);for(const keys of fields)assert.ok(get(data,keys).es?.trim(),keys.join('.'));assert.equal(Object.keys(ui).length,75);assert.deepEqual(validateTranslations(data.dictionaries),[]);assert.equal(ui.localeName,'Español');
});
test('Removing any Spanish field fails instead of falling back to another language',()=>{
 for(const keys of fields){const d=structuredClone(data);delete get(d,keys).es;assert.ok(validateContent(d).some(x=>x.includes('es')),keys.join('.'));}
 const dictionaries=structuredClone(data.dictionaries);delete dictionaries.es.cvTitle;assert.ok(validateTranslations(dictionaries).length);assert.throws(()=>localized({en:'Test','pt-BR':'Teste',fr:'Test'},'es'));
});
test('All Spanish home and artwork pages are complete, self-canonical and mutually linked',()=>{
 for(const work of [null,...data.works]){
  const route=pagePath('es',work),html=files.get(route+'index.html'),md=files.get(route+'index.md');assert.ok(html&&md);assert.ok(html.includes('<html lang="es">'));assert.ok(html.includes('content="es_ES"'));assert.ok(html.includes('rel="canonical" href="'+data.site.origin+'/'+route+'"'));assert.ok(html.includes(e(ui.closeMenu)));assert.ok(html.includes(e(ui.rights)));assert.doesNotMatch(html,/\{\{[A-Z]+\}\}|>undefined<|>null</);
  for(const other of LOCALES)assert.ok(html.includes('hreflang="'+other+'" href="'+data.site.origin+'/'+pagePath(other,work)+'"'));
  if(work){assert.ok(html.includes(e(work.technique.es)));assert.ok(md.includes(work.technique.es));for(const im of work.images){assert.ok(html.includes(e(im.alt.es)));if(im.caption)assert.ok(html.includes(e(im.caption.es)));}}
 }
});
test('Spanish artwork and film titles preserve original names, dates and authorship',()=>{
 for(const w of data.works.filter(w=>w.collection!=='brand-design'))assert.equal(w.title.es,w.originalTitle);
 for(const v of [data.artist.featuredVideo,...data.artist.additionalVideos]){assert.equal(v.title.es,v.title['pt-BR']);assert.equal(v.transcript,null);}
 assert.equal(data.works.find(w=>w.id==='maternidade-2026').title.es,'Poço da Maternidade');assert.match(data.works.find(w=>w.id==='maternidade-2026').description.es,/Cachoeira da Fumaça/);
 assert.ok(data.artist.bio.es.includes('exposición colectiva'));assert.ok(data.artist.bio.es.includes('50 docentes'));assert.ok(data.artist.bio.es.includes('3 de junio de 2017'));
});
test('Spanish CV has all 34 dated records, eight work links, and no personal or schooling information',()=>{
 const route=cvPath('es'),html=files.get(route+'index.html'),md=files.get(route+'index.md'),json=files.get(route+'curriculum.json');
 assert.equal((html.match(/class="cv-entry"/g)||[]).length,34);assert.equal((html.match(/class="control cv-work-link"/g)||[]).length,8);
 for(const text of [html,md,json])assert.doesNotMatch(text,/1993|Petrolina|mailto:|@gmail|birthDate|homeLocation|alumniOf|autodidacta|enseñanza media completa|Renata da Silva|9158-6972/i);
 for(const s of curriculumRecords(data,'es')){assert.ok(html.includes(e(s.title)));for(const row of s.entries){assert.ok(html.includes(e(row.title)));assert.ok(md.includes(row.dateLabel));}}
 for(const other of LOCALES)assert.ok(html.includes('data-locale-link href="/'+cvPath(other)+'"'));
});
test('Spanish structured portfolio, alias, error page and discovery match public content',()=>{
 const graph=JSON.parse(files.get('es/portfolio.json'))['@graph'];assert.equal(graph.length,22);assert.equal(graph[0].description,data.artist.bio.es);
 for(const w of data.works){const x=graph.find(v=>v.url?.endsWith(pagePath('es',w)));assert.ok(x);assert.equal(x.inLanguage,'es');assert.equal(x.name,w.title.es);assert.equal(x.image.length,w.images.length);}
 assert.ok(files.get('es/404.html').includes(ui.notFound));assert.ok(files.get('es/works/correnteza-2024/index.html').includes('/es/works/correnteza-2022/'));
 for(const p of ['es/index.md','es/curriculo/index.md'])assert.ok(files.get('llms.txt').includes(p));assert.ok(files.get('llms-full.txt').includes(data.artist.bio.es));assert.doesNotMatch(files.get('llms.txt'),/trilingual|bilingual/);
});
test('Compact desktop language picker contains all four equivalent routes',()=>{
 for(const locale of LOCALES){
  for(const route of [pagePath(locale),cvPath(locale)]){
   const html=files.get(route+'index.html');
   const picker=html.match(/<details class="language-picker"[\s\S]*?<\/details>/)?.[0];
   assert.ok(picker);assert.equal((picker.match(/data-locale-link/g)||[]).length,4);
   const summary=picker.match(/<summary[\s\S]*?<\/summary>/)[0];
   assert.ok(summary.includes(e(data.dictionaries[locale].localeName)));
   assert.ok(summary.includes(e(data.dictionaries[locale].language)));
  }
 }
});
test('Spanish optional PDF support does not manufacture a document',()=>{
 assert.equal(pdfPath(data.artist,'es'),null);
 assert.equal(pdfPath({...data.artist,pdf:'downloads/en.pdf',pdfEs:'downloads/es.pdf'},'es'),'downloads/es.pdf');
 assert.doesNotMatch(files.get('es/index.html'),/type="application\/pdf"/);
});
test('Spanish schema is mandatory and publication policy remains unchanged',async()=>{
 const schema=JSON.parse(await fs.readFile(path.join(root,'schemas/work.schema.json'),'utf8'));
 assert.deepEqual(schema.$defs.localized.required,LOCALES);
 assert.equal(data.site.publicationApproved,false);assert.equal(data.artist.editorialReview.es,false);
 assert.equal(files.get('CNAME'),'renataalberigi.com.br\n');
 assert.doesNotMatch(files.get('sitemap.xml'),/<url>/);
});
