import {cvPath} from '../scripts/curriculum.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {LOCALES,localePath} from '../scripts/i18n.mjs';
import {loadContent} from '../scripts/load.mjs';
import {generatePages} from '../scripts/build.mjs';
import {escapeHtml,validateContent} from '../scripts/content.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const template=await readFile(path.join(root,'site/index.template.html'),'utf8'),pages=generatePages(data,template);
test('The films section has no playback subtitle in any language',()=>{
 for(const locale of LOCALES){
  const html=pages.get(localePath(locale)+'index.html');
  assert.ok(html.includes('<h2 id="film-title">'+escapeHtml(data.dictionaries[locale].filmTitle)+'</h2></div>'));
  assert.equal(data.dictionaries[locale].filmNote,undefined);
  assert.equal((html.match(/data-video=/g)||[]).length,2);
  assert.doesNotMatch(html,/<iframe|autoplay=/);
 }
});
test('All home, work, alias and error footers link to the requested Instagram profile',()=>{
 assert.equal(data.artist.instagram,'https://www.instagram.com/renataalberigi/');
 for(const [route,html] of pages)if(route.endsWith('.html')){
  const footer=html.match(/<footer[\s\S]*?<\/footer>/)?.[0];assert.ok(footer,route);
  const locale=html.match(/<html lang="([^"]+)"/)[1],u=data.dictionaries[locale];
  if(LOCALES.some(l=>route.startsWith(cvPath(l)))){assert.ok(!footer.includes(data.artist.email));assert.ok(!footer.includes(data.artist.instagram));assert.ok(footer.includes('href="'+data.site.basePath+localePath(locale)+'"'));continue;}
  assert.ok(footer.includes('href="'+data.artist.instagram+'" target="_blank" rel="noopener noreferrer"'),route);
  assert.ok(footer.includes('aria-label="'+escapeHtml(u.instagramProfile)+'"'),route);
  assert.ok(footer.includes('mailto:'+data.artist.email),route);
 }
});
test('Public Markdown and Person data use the same approved Instagram URL',()=>{
 for(const [route,text] of pages)if(route.endsWith('.md')){if(LOCALES.some(l=>route.startsWith(cvPath(l))))assert.ok(!text.includes(data.artist.instagram),route);else assert.ok(text.includes('[Instagram]('+data.artist.instagram+')'),route);}
 for(const locale of LOCALES)assert.deepEqual(JSON.parse(pages.get(localePath(locale)+'portfolio.json'))['@graph'][0].sameAs,[data.artist.instagram]);
});
test('Invalid Instagram URLs and injected attributes are rejected by validation',()=>{
 for(const instagram of [null,'http://instagram.com/renataalberigi/','javascript:alert(1)','https://instagram.com.evil.test/renataalberigi/','https://user:secret@instagram.com/renataalberigi/','https://instagram.com/renataalberigi/?token=private','https://instagram.com/renataalberigi/" onclick="x']){
  const copy=structuredClone(data);copy.artist.instagram=instagram;assert.ok(validateContent(copy).some(e=>e.includes('Instagram')),String(instagram));
 }
});
