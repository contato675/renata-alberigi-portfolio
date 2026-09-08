import {LOCALES,localePath} from '../scripts/i18n.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {pagePath} from '../scripts/render.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const template=await fs.readFile(path.join(root,'site/index.template.html'),'utf8'),out=generatePages(data,template);
const work=data.works.find(w=>w.collection==='brand-design');
test('RUADOFLOW is one complete project, keeping the original two collections',()=>{assert.equal(data.works.filter(w=>w.collection==='brand-design').length,1);assert.equal(data.works.filter(w=>w.collection==='paintings').length,9);assert.equal(data.works.filter(w=>w.collection==='digital').length,11);assert.equal(work.images.length,66);assert.equal(work.year,'2024–2025');assert.equal(work.yearIsCollectionPeriod,true);});
test('The new single horizontal row comes immediately after digital paintings',()=>{
 for(const locale of LOCALES){const html=out.get(pagePath(locale,null)+'index.html');const start=html.indexOf('<section id="brand-design"'),digital=html.indexOf('<section id="digital"'),about=html.indexOf('<section id="about"');assert.ok(digital<start&&start<about);assert.equal((html.match(/class="brand-rail"/g)||[]).length,1);const section=html.slice(start,about);assert.equal((section.match(/data-start=/g)||[]).length,66);assert.doesNotMatch(section,/class="gallery grid"/);assert.ok(section.includes(pagePath(locale,work)));}
});
test('Dedicated collection pages contain all 66 designs and a single complete viewer',()=>{
 for(const locale of LOCALES){const html=out.get(pagePath(locale,work)+'index.html');assert.ok(html.includes('https://schema.org/CreativeWork'));assert.equal((html.match(/<figure id="brand-image-/g)||[]).length,66);assert.equal((html.match(/data-project="ruadoflow-brand-design/g)||[]).length,1);assert.ok(html.includes(work.images.at(-1).path));assert.ok(out.get(pagePath(locale,work)+'index.md').includes(work.images.at(-1).path));}
});
test('Design collection is distinguished from painting in structured data',()=>{
 for(const locale of LOCALES){const json=JSON.parse(out.get((localePath(locale))+'portfolio.json'));const w=json['@graph'].find(w=>w.url?.includes(work.id));assert.equal(w['@type'],'CreativeWork');assert.equal(w.artMedium,undefined);assert.equal(w.artform,undefined);assert.equal(w.dateCreated,undefined);assert.equal(w.temporalCoverage,'2024/2025');assert.equal(w.genre,work.technique[locale]);assert.equal(w.image.length,66);}
});
test('Machine-readable indexes include the collection with its own heading',()=>{assert.ok(out.get('llms.txt').includes('RUADOFLOW — Brand Design Collection'));assert.ok(out.get('llms-full.txt').includes(work.id));for(const locale of LOCALES)assert.ok(out.get(pagePath(locale,null)+'index.md').includes(work.id));});
test('Brand originals are not packaged; all derivative image ratios are intact',()=>{for(const im of work.images){assert.ok(im.path.startsWith('assets/images/brand-design/'));assert.ok(im.path.endsWith('.webp'));assert.ok(im.variants.length);assert.ok(Math.abs(im.width/im.height-im.variants[0].width/im.variants[0].height)<.01);}});
test('Carousel has no autoplay, global gesture interception or unsafe DOM insertion',async()=>{const s=await fs.readFile(path.join(root,'site/assets/js/brand-carousel.js'),'utf8');assert.doesNotMatch(s,/setInterval|preventDefault|touchmove|\.innerHTML\s*=|\.style\./);assert.match(s,/prefers-reduced-motion/);const c=await fs.readFile(path.join(root,'site/assets/css/brand.css'),'utf8');assert.match(c,/overflow-x: auto/);assert.doesNotMatch(c,/touch-action:\s*pan-x/);});
