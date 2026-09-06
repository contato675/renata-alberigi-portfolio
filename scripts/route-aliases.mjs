import {LOCALES} from './i18n.mjs';
import {renderPage,pagePath,publicWorks} from './render.mjs';
import {pageMarkdown} from './discovery.mjs';
// Keep previously shared project URLs readable. Canonical/hreflang point to the corrected record.
const aliases=Object.freeze({'correnteza-2024':'correnteza-2022'});
export function addRouteAliases(files,data,template,options) {
  for(const [oldId,newId] of Object.entries(aliases)) {
    const work=publicWorks(data).find(w=>w.id===newId);
    if(!work)continue;
    if(data.works.some(w=>w.id===oldId))throw new Error('Alias conflicts with an artwork ID.');
    for(const locale of LOCALES) {
      const route=pagePath(locale,{id:oldId});
      if(files.has(route+'index.html'))throw new Error('Alias overwrites a generated page.');
      files.set(route+'index.html',renderPage(data,template,locale,{...options,work}));
      files.set(route+'index.md',pageMarkdown(data,locale,work));
    }
  }
}
