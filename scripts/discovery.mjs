import {escapeHtml as xml,allVideos} from './content.mjs';
import {localized as l, LOCALES,localePath} from './i18n.mjs';
import {absoluteUrl, pagePath, publicWorks} from './render.mjs';
export const mdText = (text) => String(text).replace(/([\\`*_{}\[\]<>#])/g, '\\$1');
export function pageMarkdown(data,locale,work=null) {
  const {artist,site} = data, u=data.dictionaries[locale];
  const line = (label,value) => `**${mdText(label)}:** ${mdText(value)}\n`;
  let text = `# ${mdText(work ? l(work.title,locale) : artist.name)}\n\n`;
  text += `${absoluteUrl(site,pagePath(locale,work))}\n\n`;
  if (!work) {
    text += `> ${mdText(l(artist.role,locale))}\n\n${mdText(l(artist.intro,locale))}\n\n${mdText(l(artist.location,locale))}\n\n## ${mdText(u.about)}\n\n${mdText(l(artist.bio,locale))}\n\n## ${mdText(u.selection)}\n\n`;
    const works=publicWorks(data);
    for(const key of ['paintings','digital','brand-design']){
      const collection=works.filter(w=>(w.collection||'paintings')===key);
      if(!collection.length)continue;
      text+=`\n### ${mdText(key==='paintings'?u.paintings:key==='digital'?u.digitalTitle:u.brandTitle)}\n\n`;
      text+=collection.map(w=>`- [${mdText(l(w.title,locale))}](${absoluteUrl(site,pagePath(locale,w)+'index.md')}): ${w.yearIsCollectionPeriod?mdText(u.collectionPeriod)+': ':''}${mdText(w.year)}; ${mdText(l(w.technique,locale))}${w.dimensions?'; '+mdText(w.dimensions):''}.`).join('\n')+'\n';
    }
    if(!works.length)text+=mdText(u.noWorks)+'\n';
    for(const video of allVideos(artist)){
      const url=video.provider==='youtube'?`https://www.youtube.com/watch?v=${video.id}`:`https://vimeo.com/${video.id}`;
      text+=`\n## ${mdText(l(video.title,locale))}\n\n${url}\n`;
      if(video.description)text+=`\n${mdText(l(video.description,locale))}\n`;
      if(video.transcript)text+=`\n${mdText(l(video.transcript,locale))}\n`;
    }
  } else {
    text += line(u.artist,artist.name) + line(work.yearIsCollectionPeriod?u.collectionPeriod:u.year,work.year) + line(u.technique,l(work.technique,locale)) + (work.dimensions?line(u.dimensions,work.dimensions):'');
    if (work.originalTitle) text += line(u.originalTitle,work.originalTitle);
    if (work.titleStatus==='catalogue-label') text += '\n'+mdText(u.catalogueLabel)+'\n';
    if (work.description) text += `\n${mdText(l(work.description,locale))}\n`;
    text += '\n'+work.images.map((im) => `![${mdText(l(im.alt,locale))}](${absoluteUrl(site,im.path)})${im.caption ? '\n\n'+mdText(l(im.caption,locale)) : ''}`).join('\n\n')+'\n';
  }
  return text + `\n## ${mdText(u.contact)}\n\n${mdText(artist.email)}\n\n[${mdText(u.instagram)}](${artist.instagram})\n\n${mdText(u.rights)}\n`;
}
export function llmsIndex(data,{release=false}={}) {
  const {artist,site}=data;
  let out=`# ${mdText(artist.name)}\n\n> ${mdText(l(artist.role,'en'))}. ${mdText(l(artist.intro,'en'))}\n\n`;
  out+='English is the default language. Brazilian Portuguese is available at pt-br/ and French at fr/. These documents describe the same portfolio shown to people; there are no additional credentials or private artwork records for agents.\n\n';
  if (!release) out+=(site.previewPublic?'Public portfolio preview for editorial review; not the final release.':'Review build; URLs describe the planned deployment.')+'\n\n';
  out+='Artwork titles and credited institutions retain their original names. A listed work is not automatically available for sale or licensed for reuse. This index neither authorizes training nor guarantees inclusion in search or any selection process.\n\n## Portfolio\n\n';
  for (const locale of LOCALES) out+=`- [${mdText(data.dictionaries[locale].portfolioBiography)}](${absoluteUrl(site,localePath(locale)+'index.md')}): ${mdText(data.dictionaries[locale].portfolioSummary)}\n`;
  if (publicWorks(data).length) {
    for(const key of ['paintings','digital','brand-design']){
      const works=publicWorks(data).filter(w=>(w.collection||'paintings')===key);
      if(!works.length)continue;
      out+=`\n## ${key==='paintings'?'Hand-painted works — primary collection':key==='digital'?'Hand-drawn digital paintings — separate collection':'RUADOFLOW — Brand Design Collection'}\n\n`;
      for(const w of works)for(const locale of LOCALES)out+=`- [${mdText(l(w.title,locale))} (${locale})](${absoluteUrl(site,pagePath(locale,w)+'index.md')}): ${w.yearIsCollectionPeriod?'Collection period: ':''}${mdText(w.year)}; ${mdText(l(w.technique,locale))}${w.dimensions?'; '+mdText(w.dimensions):''}.\n`;
    }
  }
  out+='\n## Optional\n\n';
  out+=`- [Full trilingual portfolio text](${absoluteUrl(site,'llms-full.txt')}): Same public biography and work descriptions in one text document.\n`;
  for (const locale of LOCALES) out+=`- [Structured portfolio (${locale})](${absoluteUrl(site,localePath(locale)+'portfolio.json')}): Public Person and VisualArtwork data; no prices, stock or unsupported claims.\n`;
  return out;
}
export function robotsText(site,{release=false}={}) {
  const scope=site.basePath;
  const header='# Must be served at '+site.origin+'/robots.txt to control crawlers.\n# At a project subpath this file is a deployment reference only.\n# robots.txt is not access control or a copyright licence.\n';
  if (!release) return header+`User-agent: *\nDisallow: ${scope}\n`;
  // Search access does not imply permission to train on this artist's images.
  return header+`User-agent: OAI-SearchBot\nAllow: ${scope}\n\nUser-agent: GPTBot\nDisallow: ${scope}\n\nUser-agent: *\nAllow: ${scope}\n\nSitemap: ${absoluteUrl(site,'sitemap.xml')}\n`;
}
export function sitemap(data,{release=false}={}) {
  const pages=[null,...publicWorks(data)];
  const urls=release ? pages.flatMap((work)=>LOCALES.map((locale)=>`  <url><loc>${xml(absoluteUrl(data.site,pagePath(locale,work)))}</loc>${[...LOCALES,'x-default'].map((lang)=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${xml(absoluteUrl(data.site,pagePath(lang==='x-default'?'en':lang,work)))}"/>`).join('')}</url>`)).join('\n') : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}
export function structuredPortfolio(data,locale) {
  const {artist,site}=data;
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Person','@id':absoluteUrl(site,'#artist'),name:artist.name,jobTitle:l(artist.role,locale),description:l(artist.bio,locale),url:absoluteUrl(site,pagePath(locale)),email:artist.email,sameAs:[artist.instagram],...(artist.portrait ? {image:absoluteUrl(site,artist.portrait.path)} : {})},
    ...publicWorks(data).map((w)=>({'@type':w.collection==='brand-design'?'CreativeWork':'VisualArtwork','@id':absoluteUrl(site,pagePath(locale,w)),url:absoluteUrl(site,pagePath(locale,w)),name:l(w.title,locale),creator:{'@id':absoluteUrl(site,'#artist')},...(/^\d{4}$/.test(w.year)?{dateCreated:w.year}:{}),...(w.yearIsCollectionPeriod?{temporalCoverage:w.year.replace('–','/')}:{ }),...(w.collection?{...(w.collection==='brand-design'?{}:{artform:'Painting'}),keywords:l(w.category||w.technique,locale)}:{}),...(w.collection==='brand-design'?{genre:l(w.technique,locale)}:{artMedium:l(w.technique,locale)}),...(w.dimensions?{size:w.dimensions}:{}),inLanguage:locale,...(w.description ? {description:l(w.description,locale)} : {}),image:w.images.map((im)=>({'@type':'ImageObject',contentUrl:absoluteUrl(site,im.path),caption:im.caption ? l(im.caption,locale) : l(im.alt,locale),width:im.width,height:im.height}))}))
  ]};
}
