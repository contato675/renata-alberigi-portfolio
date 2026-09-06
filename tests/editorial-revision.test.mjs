import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {pagePath} from '../scripts/render.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const template=await readFile(path.join(root,'site/index.template.html'),'utf8'),pages=generatePages(data,template);
const specs=[
 ['amor-incondicional-2026','Amor incondicional','Óleo sobre tela','Oil on canvas','100 × 80 cm'],
 ['ponte-nova-2025','Ponte nova','Óleo sobre tela','Oil on canvas','120 × 80 cm'],
 ['maternidade-2026','Maternidade','Óleo sobre tela','Oil on canvas','100 × 80 cm'],
 ['maternidade1-2025','Maternidade 1','Acrílica e giz pastel sobre tela, envernizada','Acrylic and pastel on canvas, varnished','100 × 80 cm'],
 ['lar-2026','Lar','Acrílica e giz pastel sobre tela, envernizada','Acrylic and pastel on canvas, varnished','100 × 120 cm'],
 ['aureo-2025','Áureo','Óleo sobre tela','Oil on canvas','40 × 60 cm'],
 ['analogiaeu-part4-2024','ANALOGIAEU part4','Óleo sobre tela','Oil on canvas','100 × 80 cm'],
 ['correnteza-2022','Correnteza','Óleo sobre tela','Oil on canvas','70 × 100 cm'],
 ['analogiaeu-2018','ANALOGIAEU','Acrílica sobre tela','Acrylic on canvas','130 × 800 cm']
];
for(const [id,title,pt,en,size] of specs)test('Requested painting specification: '+title,()=>{
 const w=data.works.find(w=>w.id===id);assert.ok(w);assert.deepEqual(w.title,{en:title,'pt-BR':title});assert.deepEqual(w.technique,{en,'pt-BR':pt});assert.equal(w.dimensions,size);
 for(const locale of ['en','pt-BR']){const html=pages.get(pagePath(locale,w)+'index.html'),md=pages.get(pagePath(locale,w)+'index.md');assert.ok(html.includes(size));assert.ok(md.includes(size));assert.ok(html.includes(w.technique[locale]));assert.ok(pages.get('llms.txt').includes(size));const json=JSON.parse(pages.get((locale==='en'?'':'pt-br/')+'portfolio.json'));const record=json['@graph'].find(r=>r.name===title);assert.equal(record.size,size);assert.equal(record.artMedium,w.technique[locale]);}
});
const names=['Renascida','Fluir','Balanço','Alexandrina','Nara','Nadine','Sol','Fernanda','Raio Rubi','Capa do Disco de Rap'];
for(const [i,name] of names.entries())test('Requested digital title: '+name,()=>{const w=data.works.find(w=>w.id==='digital-'+String(i+2).padStart(2,'0'));assert.deepEqual(w.title,{en:name,'pt-BR':name});assert.equal(w.originalTitle,name);assert.equal(w.titleStatus,undefined);assert.ok(w.images.every(im=>im.alt.en.startsWith(name)&&im.alt['pt-BR'].startsWith(name)));for(const locale of ['en','pt-BR'])assert.ok(pages.get(pagePath(locale,w)+'index.html').includes(name));});
test('Correnteza uses 2022; previously shared pages resolve to the corrected canonical',()=>{
 const w=data.works.find(w=>w.id==='correnteza-2022');assert.equal(w.year,'2022');
 for(const locale of ['en','pt-BR']){const prefix=locale==='en'?'':'pt-br/',html=pages.get(prefix+'works/correnteza-2024/index.html');assert.ok(html);assert.match(html,/<link rel="canonical" href="[^"]*\/correnteza-2022\/">/);assert.match(html,/itemprop="dateCreated">2022<\/dd>/);const md=pages.get(prefix+'works/correnteza-2022/index.md');assert.ok(md.includes('2022'));}
});
test('Requested Portuguese introduction replaces the previous summary',()=>{
 const expected='Pintora e artista visual brasileira, nascida em Petrolina, Pernambuco, em 1993, e radicada em Caeté-Açu, na Chapada Diamantina, Bahia. Autodidata, pinta desde a infância e desenvolve uma produção que tem como foco a pintura feita à mão, a óleo e com tinta acrílica, e também reúne retratos, instalações e trabalhos digitais feitos à mão.';
 assert.equal(data.artist.intro['pt-BR'],expected);assert.ok(pages.get('pt-br/index.html').includes(expected));assert.ok(data.artist.intro.en.includes('hand-painted works in oil and acrylic'));
});
test('Contact and country are consistent in both languages and all public formats',()=>{
 assert.equal(data.artist.email,'estudiorenascida@gmail.com');assert.ok(data.artist.location.en.endsWith('Brazil'));assert.ok(data.artist.location['pt-BR'].endsWith('Brasil'));
 for(const [name,body] of pages)if(/\.(html|md|json|txt)$/.test(name)){assert.ok(!body.includes('ataneribero@gmail.com'),name);if(/\.(html|md|json)$/.test(name))assert.ok(body.includes(data.artist.email),name);}
});
test('No redundant header name, review banner or grid control; noindex retained',()=>{
 for(const [name,html] of pages)if(name.endsWith('.html')){const header=html.match(/<header[\s\S]*?<\/header>/)?.[0];assert.ok(header);assert.ok(!header.includes('Renata Alberigi'),name);assert.doesNotMatch(html,/data-grid-toggle|class="wrap notice"|Preview do portfólio|Portfolio preview · Editorial review/);assert.match(html,/<meta name="robots" content="noindex,follow">/);}
});
test('New portrait has a cache-distinct filename and the source aspect ratio',()=>{assert.equal(data.artist.portrait.path,'assets/images/perfil/renata-alberigi-c758528aa6.webp');assert.equal(data.artist.portrait.width,676);assert.equal(data.artist.portrait.height,806);assert.match(pages.get('index.html'),/renata-alberigi-c758528aa6/);assert.doesNotMatch(pages.get('index.html'),/perfil\/renata-alberigi\.webp/);});
test('Mobile drawer is localized and backed by no-JavaScript links',()=>{
 for(const locale of ['en','pt-BR']){const html=pages.get((locale==='en'?'':'pt-br/')+'index.html');assert.match(html,/<details class="mobile-fallback"/);assert.match(html,/aria-controls="mobile-navigation" aria-haspopup="dialog" aria-expanded="false"/);assert.match(html,/<dialog id="mobile-navigation"/);assert.ok(html.includes(data.dictionaries[locale].closeMenu));assert.ok(html.includes('assets/js/navigation.js'));}
});
test('Drawer and gallery contain no unsafe executable insertion',async()=>{
 for(const name of ['navigation.js','gallery.js']){const js=await readFile(path.join(root,'site/assets/js',name),'utf8');assert.doesNotMatch(js,/\.innerHTML\s*=|\.style\.|\beval\s*\(|new Function/);}
 const js=await readFile(path.join(root,'site/assets/js/gallery.js'),'utf8');assert.doesNotMatch(js,/data-grid-toggle/);
});
