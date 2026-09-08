import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {renderPage} from '../scripts/render.mjs';
import {escapeHtml as e,validateContent} from '../scripts/content.mjs';
import {LOCALES,localePath} from '../scripts/i18n.mjs';
import {cvPath,CV_SECTIONS,validateCurriculum,curriculumRecords} from '../scripts/curriculum.mjs';
import {curriculumStructured,curriculumMarkdown} from '../scripts/cv-discovery.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await loadContent(root),template=await readFile(path.join(root,'site/index.template.html'),'utf8'),pages=generatePages(data,template);
const forbidden=/mailto:|tel:|@gmail|1993|Petrolina|birthDate|birthPlace|telephone|homeLocation|alumniOf|autodidata|self-taught|autodidacte|autodidacta|Ensino médio completo|Formação e cursos|Renata da Silva/i;
const get=(locale,suffix='index.html')=>pages.get(cvPath(locale)+suffix);
const records=data.curriculum.sections.flatMap(s=>s.entries);
for(const locale of LOCALES){
 test('CV '+locale+': complete static HTML, Markdown and privacy-safe metadata',()=>{
  const html=get(locale),md=get(locale,'index.md'),json=get(locale,'curriculum.json');
  for(const v of [html,md,json]){assert.ok(v);assert.doesNotMatch(v,forbidden);assert.doesNotMatch(v,/\{\{[A-Z]+\}\}|>undefined<|>null</);}
  assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/class="grid cv-section"/g)||[]).length,5);assert.equal((html.match(/class="cv-entry"/g)||[]).length,34);
  assert.ok(html.includes('<html lang="'+locale+'">'));assert.ok(html.includes(e(data.dictionaries[locale].cvTitle)));
  const graph=JSON.parse(json);assert.equal(graph['@type'],'WebPage');assert.deepEqual(graph.about,{'@type':'Person',name:'Renata Alberigi'});assert.equal(graph.hasPart.length,5);assert.equal(graph.inLanguage,locale);
  assert.ok(!html.includes('portfolio.json'));assert.ok(!html.includes('data-project='));assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('type="application/pdf"'));
 });
 test('CV '+locale+': all translated records and date labels occur in every representation',()=>{
  const html=get(locale),md=get(locale,'index.md'),structured=JSON.parse(get(locale,'curriculum.json'));
  for(const section of curriculumRecords(data,locale)){
   assert.ok(html.includes(e(section.title)));assert.ok(md.includes(section.title));
   const part=structured.hasPart.find(p=>p.name===section.title);assert.ok(part);
   for(const entry of section.entries){assert.ok(html.includes(e(entry.title)),entry.id);assert.ok(md.includes(entry.title),entry.id);assert.ok(part.text.includes(entry.title),entry.id);assert.ok(md.includes(entry.dateLabel));if(entry.technique)assert.ok(html.includes(e(entry.technique)));if(entry.dimensions)assert.ok(html.includes(e(entry.dimensions)));}
  }
 });
 test('CV '+locale+': canonical, reciprocal languages and index links stay on the CV',()=>{
  const html=get(locale),url=data.site.origin+data.site.basePath+cvPath(locale);assert.ok(html.includes('rel="canonical" href="'+url+'"'));
  for(const other of LOCALES){assert.ok(html.includes('hreflang="'+other+'" href="'+data.site.origin+data.site.basePath+cvPath(other)+'"'));assert.ok(html.includes('data-locale-link href="'+data.site.basePath+cvPath(other)+'"'));}
  assert.ok(html.includes('hreflang="x-default" href="'+data.site.origin+data.site.basePath+cvPath('en')+'"'));
  for(const id of CV_SECTIONS){assert.ok(html.includes('href="#cv-'+id+'"'));assert.ok(html.includes('id="cv-'+id+'"'));}
  assert.ok(html.includes('href="'+data.site.basePath+localePath(locale)+'#contact"'));assert.equal((html.match(/data-cv-menu[^>]+aria-current="page"/g)||[]).length,3);
 });
 test('CV '+locale+': entry IDs are identical across translations for position restoration',()=>{
  const ids=html=>[...html.matchAll(/\bid="(cv-[^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids(get(locale)),ids(get('en')));
 });
 test('CV '+locale+': existing painting pages linked, text-only works remain text-only',()=>{
  const html=get(locale);assert.equal((html.match(/class="control cv-work-link"/g)||[]).length,8);
  for(const r of curriculumRecords(data,locale).find(s=>s.id==='paintings').entries){if(r.workPath)assert.ok(html.includes('href="'+data.site.basePath+r.workPath+'"'));}
  assert.doesNotMatch(html,/href="[^"]*works\/(?:nibia|vale-do-capao)/);
  const nibia=html.match(/id="cv-paintings-nibia-2023"[\s\S]*?<\/li>/)?.[0];assert.ok(nibia);assert.doesNotMatch(nibia,/130|cm/);
 });
 test('Home '+locale+': biography CTA and all menu variants link to the public CV',()=>{
  const html=pages.get(localePath(locale)+'index.html'),about=html.match(/<section id="about"[\s\S]*?<\/section>/)[0];assert.ok(about.includes('data-cv-link href="'+data.site.basePath+cvPath(locale)+'"'));assert.ok(about.includes(e(data.dictionaries[locale].cvLink)));assert.equal((html.match(/data-cv-menu/g)||[]).length,3);assert.ok(html.includes(data.artist.bio[locale].slice(0,100)));
 });
}
test('Curriculum retains the approved five sections and selected record counts',()=>{
 assert.deepEqual(data.curriculum.sections.map(s=>s.id),CV_SECTIONS);assert.deepEqual(data.curriculum.sections.map(s=>s.entries.length),[4,6,10,10,4]);assert.deepEqual(validateCurriculum(data.curriculum),[]);
});
test('CV paths are explicit, locale-safe and independent of work IDs',()=>{
 assert.deepEqual(LOCALES.map(cvPath),['cv/','pt-br/curriculo/','fr/cv/','es/curriculo/']);assert.throws(()=>cvPath('de'));assert.throws(()=>cvPath('../'));
});
test('Every existing painting matches the canonical gallery record',()=>{
 for(const row of data.curriculum.sections.find(s=>s.id==='paintings').entries.filter(r=>r.workId)){
  const work=data.works.find(w=>w.id===row.workId);assert.ok(work);assert.deepEqual(row.title,work.title);assert.equal(row.date,work.year);assert.deepEqual(row.technique,work.technique);assert.equal(row.dimensions,work.dimensions);
 }
 assert.ok(!data.works.some(w=>w.id==='nibia-2023'));assert.equal(data.works.length,21);
});
test('Confirmed dates, institutions and field studies are preserved without upgrades',()=>{
 const exhibits=data.curriculum.sections.find(s=>s.id==='exhibitions').entries;
 assert.equal(exhibits.find(e=>e.id==='mav').date,'2018');assert.equal(exhibits.find(e=>e.id==='fia').date,'2018');assert.match(exhibits.find(e=>e.id==='fia').description['pt-BR'],/Exposição coletiva/);
 assert.match(exhibits.find(e=>e.id==='diretoria').title['pt-BR'],/Diretoria de Cultura José Maria de Abreu/);
 assert.equal(data.curriculum.sections.at(-1).entries[2].date,'2017-06-03');
 const paintings=data.curriculum.sections.find(s=>s.id==='paintings').entries;
 for(const id of ['amor-incondicional-2026','ponte-nova-2025','aureo-2025'])assert.match(paintings.find(e=>e.id===id).description['pt-BR'],/Ponte Velha/);
 assert.match(paintings.find(e=>e.id==='maternidade-2026').description['pt-BR'],/Cachoeira da Fumaça/);assert.equal(paintings.find(e=>e.id==='maternidade1-2025').title['pt-BR'],'Maternidade');
 assert.doesNotMatch(get('pt-BR'),/Instituto Tomie Ohtake|Maternidade 1|2014–2019/);
});
test('Missing translation in any CV field fails validation',()=>{
 function paths(value,p=[]){if(!value||typeof value!=='object')return [];if(Object.hasOwn(value,'en'))return[p];return Object.entries(value).flatMap(([k,v])=>paths(v,[...p,k]));}
 for(const keys of paths(data.curriculum))for(const locale of LOCALES){const copy=structuredClone(data.curriculum);delete keys.reduce((o,k)=>o[k],copy)[locale];assert.ok(validateCurriculum(copy).some(e=>e.includes(locale)),keys.join('.')+' '+locale);}
});
test('Unknown public fields, bad IDs and empty entries are rejected',()=>{
 for(const mutate of [v=>v.education='not public',v=>v.sections[0].privateAddress='not public',v=>v.sections[0].entries[0].phone='not public',v=>v.sections[0].entries[0].id='../bad',v=>v.sections[0].entries[0].workId='https://bad.test',v=>v.sections[0].entries=[],v=>v.sections[0].entries[0].date='undated']){const copy=structuredClone(data.curriculum);mutate(copy);assert.ok(validateCurriculum(copy).length);}
 for(const bad of [true,'text',[],{sections:[null]}])assert.ok(validateCurriculum(bad).length);
});
test('CV metadata projection never copies a full personal profile',()=>{
 const copy=structuredClone(data);copy.artist.email='PRIVATE_EMAIL_SENTINEL';copy.artist.bio.en='PRIVATE_BIO_SENTINEL';copy.artist.address='PRIVATE_ADDRESS_SENTINEL';copy.artist.education='PRIVATE_EDUCATION_SENTINEL';
 for(const locale of LOCALES){const html=renderPage(copy,template,locale,{curriculum:true}),json=JSON.stringify(curriculumStructured(copy,locale)),md=curriculumMarkdown(copy,locale);assert.doesNotMatch(html+json+md,/PRIVATE_.*?_SENTINEL/);}
});
test('CV escapes authored text and does not insert inline executable code',()=>{
 const copy=structuredClone(data);copy.curriculum.sections[0].entries[0].title.en='<script>alert("x")</script>';
 const html=renderPage(copy,template,'en',{curriculum:true});assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>alert'));assert.doesNotMatch(html,/<script(?![^>]*src=)|\sonclick=|\sstyle=/);
});
test('Absent or draft gallery records never create broken CV work links',()=>{
 const copy=structuredClone(data);copy.works=[];const out=generatePages(copy,template);assert.doesNotMatch(out.get(cvPath('en')+'index.html'),/class="control cv-work-link"/);assert.ok(out.get(cvPath('en')+'index.html').includes('Nibia'));
});
test('CV appears in discovery but does not change noindex or the existing domain',()=>{
 for(const locale of LOCALES){assert.ok(pages.get('llms.txt').includes(cvPath(locale)+'index.md'));assert.ok(pages.get('llms-full.txt').includes(curriculumMarkdown(data,locale)));assert.ok(get(locale).includes('content="noindex,follow"'));}
 assert.doesNotMatch(pages.get('sitemap.xml'),/<url>/);assert.equal(pages.get('CNAME'),'renataalberigi.com.br\n');assert.equal(data.site.publicationApproved,false);
});
test('Project-subdirectory hosting preserves CV routes, navigation and metadata',()=>{
 const copy=structuredClone(data);copy.site.origin='https://contato675.github.io';copy.site.basePath='/renata-alberigi-portfolio/';delete copy.site.customDomain;
 const out=generatePages(copy,template);for(const locale of LOCALES){const html=out.get(cvPath(locale)+'index.html');assert.ok(html.includes('href="/renata-alberigi-portfolio/'+cvPath(locale)+'"'));assert.ok(html.includes('href="https://contato675.github.io/renata-alberigi-portfolio/'+cvPath(locale)+'"'));}assert.equal(out.has('CNAME'),false);
});
