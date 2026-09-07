import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {LOCALES,localePath} from '../scripts/i18n.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await loadContent(root),template=await fs.readFile(path.join(root,'site/index.template.html'),'utf8');
const generated=generatePages(data,template);
const folded=text=>String(text).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const localResidence=/caete[\s\p{Pd}]*acu/u;
const expected={en:'Chapada Diamantina · Bahia - Brazil','pt-BR':'Chapada Diamantina · Bahia - Brasil',fr:'Chapada Diamantina · Bahia - Brésil'};
for(const locale of LOCALES){
 test('Residence is regional only in '+locale,()=>{assert.equal(data.artist.location[locale],expected[locale]);for(const field of ['intro','bio']){assert.match(data.artist[field][locale],/Chapada Diamantina/);assert.match(data.artist[field][locale],/Bahia/);assert.doesNotMatch(folded(data.artist[field][locale]),localResidence);}});
 test('Birthplace and personal name are preserved in '+locale,()=>{for(const field of ['intro','bio']){assert.match(data.artist[field][locale],/Petrolina/);assert.match(data.artist[field][locale],/1993/);}assert.equal(data.artist.name,'Renata Alberigi');});
 test('HTML, Markdown and artist metadata share regional residence in '+locale,()=>{const prefix=localePath(locale),html=generated.get(prefix+'index.html'),md=generated.get(prefix+'index.md'),json=JSON.parse(generated.get(prefix+'portfolio.json'));assert.ok(html.includes(data.artist.intro[locale]));assert.ok(html.includes(expected[locale]));assert.ok(md.includes(expected[locale]));assert.ok(md.includes(data.artist.bio[locale]));assert.equal(json['@graph'][0].description,data.artist.bio[locale]);});
}
test('No generated page or discovery document names the specific residence',()=>{for(const [file,content] of generated)assert.doesNotMatch(folded(content),localResidence,file);});
test('All configured locales are protected, including French',()=>assert.deepEqual(LOCALES,['en','pt-BR','fr']));
test('Regional copy is retained in consolidated AI-readable text',()=>{const all=generated.get('llms-full.txt');for(const locale of LOCALES){assert.ok(all.includes(data.artist.intro[locale]));assert.ok(all.includes(data.artist.bio[locale]));assert.ok(all.includes(expected[locale]));}assert.ok(generated.get('llms.txt').includes(data.artist.intro.en));});
test('Residence edit does not change the live host or preview publication flags',()=>{assert.equal(data.site.customDomain,'renataalberigi.com.br');assert.equal(data.site.basePath,'/');assert.equal(generated.get('CNAME'),'renataalberigi.com.br\n');assert.match(generated.get('index.html'),/noindex/);assert.equal(data.artist.email,'estudiorenascida@gmail.com');});
