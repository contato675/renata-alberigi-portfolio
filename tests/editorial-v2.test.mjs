import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {cvPath} from '../scripts/curriculum.mjs';
import {LOCALES,localePath} from '../scripts/i18n.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await loadContent(root),pages=generatePages(data,await fs.readFile(new URL('../site/index.template.html',import.meta.url),'utf8'));
const section=id=>data.curriculum.sections.find(s=>s.id===id),entry=(s,id)=>section(s).entries.find(e=>e.id===id);
for(const locale of LOCALES)test('Confirmed second editorial revision in '+locale,()=>{
 const html=pages.get(cvPath(locale)+'index.html'),md=pages.get(cvPath(locale)+'index.md'),json=JSON.parse(pages.get(cvPath(locale)+'curriculum.json'));
 assert.equal(section('exhibitions').entries.length,9);assert.equal(entry('exhibitions','pos-futurismo').title[locale],'O começo do pós-futurismo');
 assert.equal(entry('art-direction','rdfs').date,'2017–2026');assert.ok(!entry('art-direction','rdfs').title[locale].includes('Residência'));
 assert.ok(entry('cultural-actions','municipal-workshops').description[locale].includes('Museu de Antropologia do Vale do Paraíba (MAV)'));
 assert.match(entry('exhibitions','launch').description[locale],/^(?:Instalação|Installation|Instalación) · Estúdio/);assert.ok(entry('exhibitions','renascida').description[locale].includes('Café del Tiempo'));
 for(const value of [html,md,JSON.stringify(json)]){assert.doesNotMatch(value,/Duo Du|Magia do Amor|dízimo|dizimo|Re-nascimento|100 × 120 cm|70 × 100 cm/);assert.ok(value.includes('130 × 130'));assert.ok(value.includes('Níbia'));}
 assert.match(html,/<h3 translate="no" class="notranslate">Re-nascida<\/h3>/);assert.match(html,/<h3 translate="no" class="notranslate">O começo do pós-futurismo<\/h3>/);
 assert.equal(entry('paintings','lar-2026').dimensions,'100 × 120');assert.equal(entry('paintings','correnteza-2022').dimensions,'70 cm × 100');
 for(const id of ['lar-2026','correnteza-2022']){const work=data.works.find(w=>w.id===id);assert.equal(work.dimensions,entry('paintings',id).dimensions);const page=pages.get(localePath(locale)+'works/'+id+'/index.html');assert.ok(page.includes('itemprop="name" translate="no" class="notranslate"'));assert.ok(page.includes(work.dimensions));}
 assert.doesNotMatch(html,/mailto:|1993|Petrolina|@gmail|alumniOf/);assert.ok(html.includes('content="noindex,follow"'));
});
