import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {pagePath} from '../scripts/render.mjs';
import {LOCALES,localePath} from '../scripts/i18n.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await loadContent(root),template=await readFile(path.join(root,'site/index.template.html'),'utf8'),pages=generatePages(data,template);
const specs=[['amor-incondicional-2026','Amor Incondicional','Ponte Velha'],['ponte-nova-2025','Ponte Nova','Ponte Velha'],['maternidade-2026','Poço da Maternidade','Cachoeira da Fumaça'],['maternidade1-2025','Maternidade',null],['aureo-2025','Áureo','Ponte Velha']];
for(const [id,title,field] of specs)test('Confirmed CV title and field-study parity: '+title,()=>{
 const work=data.works.find(w=>w.id===id);assert.ok(work);assert.equal(work.originalTitle,title);
 for(const locale of LOCALES){
  assert.equal(work.title[locale],title);
  const route=pagePath(locale,work),html=pages.get(route+'index.html'),md=pages.get(route+'index.md');
  assert.ok(html.includes(title));assert.ok(md.includes(title));assert.ok(route.endsWith('works/'+id+'/'));
  assert.ok(work.images.every(im=>im.alt[locale].startsWith(title+' — ')));
  const graph=JSON.parse(pages.get(localePath(locale)+'portfolio.json'))['@graph'];
  const record=graph.find(r=>r.url===data.site.origin+'/'+route);assert.ok(record);assert.equal(record.name,title);
  if(field){assert.ok(work.description[locale].includes(field));assert.ok(html.includes(work.description[locale]));assert.ok(md.includes(work.description[locale]));assert.equal(record.description,work.description[locale]);assert.ok(pages.get('llms-full.txt').includes(work.description[locale]));}
 }
});
test('The 2025 acrylic Maternidade and 2026 oil Poço da Maternidade remain distinct works',()=>{
 const a=data.works.find(w=>w.id==='maternidade1-2025'),b=data.works.find(w=>w.id==='maternidade-2026');
 assert.equal(a.year,'2025');assert.match(a.technique.en,/Acrylic and pastel/);assert.equal(b.year,'2026');assert.equal(b.technique.en,'Oil on canvas');assert.notEqual(a.images[0].path,b.images[0].path);
});
test('ANALOGIAEU distinguishes 2014 sketches, 2015–2018 painting and 2017 launch in all formats',()=>{
 const work=data.works.find(w=>w.id==='analogiaeu-2018');assert.equal(work.year,'2015–2018');assert.equal(work.dimensions,'130 × 800 cm');
 for(const locale of LOCALES){
  const route=pagePath(locale,work),html=pages.get(route+'index.html'),md=pages.get(route+'index.md');
  for(const year of ['2014','2015','2017','2018']){assert.ok(work.description[locale].includes(year));assert.ok(data.artist.bio[locale].includes(year));}
  assert.ok(html.includes('2015–2018'));assert.ok(md.includes('2015–2018'));
  const record=JSON.parse(pages.get(localePath(locale)+'portfolio.json'))['@graph'].find(r=>r.name==='ANALOGIAEU');assert.equal(record.temporalCoverage,'2015/2018');assert.equal(record.dateCreated,undefined);assert.equal(record.description,work.description[locale]);
 }
 assert.equal(data.works.find(w=>w.id==='analogiaeu-part4-2024').year,'2024');
});
test('Confirmed institutions, group exhibition and school talks appear in each biography',()=>{
 const collective={en:'group exhibition','pt-BR':'exposição coletiva',fr:'exposition collective'};
 for(const locale of LOCALES){const bio=data.artist.bio[locale];for(const phrase of ['16ª Semana Nacional de Museus','2018','FIA — Festival Integrações de Arte','Teatro da Cidade','Diretoria de Cultura José Maria de Abreu','EducaMais Jacareí — Espaço Tomie Ohtake','50',collective[locale]])assert.ok(bio.includes(phrase),locale+': '+phrase);const person=JSON.parse(pages.get(localePath(locale)+'portfolio.json'))['@graph'][0];assert.equal(person.description,bio);}
});
test('No retired title, incorrect contact or old ANALOGIAEU range remains in public copy',()=>{
 assert.equal(data.artist.email,'estudiorenascida@gmail.com');
 for(const [name,body] of pages){if(/\.(html|md|json|txt)$/.test(name))assert.doesNotMatch(body,/Maternidade 1|estudorenascida@|2014 (?:e|and|et) 2019|2014–2019|9158-6972/,name);}
});
test('Domain, noindex mode, three locales and regional residence remain unchanged',()=>{
 assert.equal(data.site.customDomain,'renataalberigi.com.br');assert.equal(data.site.basePath,'/');assert.equal(data.site.publicationApproved,false);assert.deepEqual(LOCALES,['en','pt-BR','fr']);assert.equal(pages.get('CNAME'),'renataalberigi.com.br\n');
 for(const locale of LOCALES){assert.ok(!data.artist.location[locale].includes('Caeté'));assert.ok(!data.artist.intro[locale].includes('Caeté'));assert.ok(pages.get(localePath(locale)+'index.html').includes('content="noindex,follow"'));}
});
