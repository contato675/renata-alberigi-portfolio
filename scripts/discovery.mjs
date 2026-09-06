import {escapeHtml as xml} from './content.mjs';
import {localized as l, LOCALES,localePath} from './i18n.mjs';
import {absoluteUrl, pagePath, publicWorks} from './render.mjs';
export const mdText = (text) => String(text).replace(/([\\`*_{}\[\]<>#])/g, '\\$1');
export function pageMarkdown(data,locale,work=null) {
  const {artist,site} = data, u=data.dictionaries[locale];
  const line = (label,value) => `**${mdText(label)}:** ${mdText(value)}\n`;
  let text = `# ${mdText(work ? l(work.title,locale) : artist.name)}\n\n`;
  text += `${absoluteUrl(site,pagePath(locale,work))}\n\n`;
  if (!work) {
    text += `> ${mdText(l(artist.role,locale))}\n\n${mdText(l(artist.intro,locale))}\n\n${mdText(artist.location)}\n\n## ${mdText(u.about)}\n\n${mdText(l(artist.bio,locale))}\n\n## ${mdText(u.selection)}\n\n`;
    const works=publicWorks(data);
    text += works.length ? works.map((w) => `- [${mdText(l(w.title,locale))}](${absoluteUrl(site,pagePath(locale,w)+'index.md')}): ${mdText(w.year)}, ${mdText(l(w.technique,locale))}, ${mdText(w.dimensions)}`).join('\n')+'\n' : mdText(u.noWorks)+'\n';
    if (artist.featuredVideo) text += `\n## ${mdText(l(artist.featuredVideo.title,locale))}\n\n${mdText(l(artist.featuredVideo.transcript,locale))}\n`;
  } else {
    text += line(locale === 'en' ? 'Artist' : 'Artista',artist.name) + line(u.year,work.year) + line(u.technique,l(work.technique,locale)) + line(u.dimensions,work.dimensions);
    if (work.originalTitle) text += line(u.originalTitle,work.originalTitle);
    if (work.description) text += `\n${mdText(l(work.description,locale))}\n`;
    text += '\n'+work.images.map((im) => `![${mdText(l(im.alt,locale))}](${absoluteUrl(site,im.path)})${im.caption ? '\n\n'+mdText(l(im.caption,locale)) : ''}`).join('\n\n')+'\n';
  }
  return text + `\n## ${mdText(u.contact)}\n\n${mdText(artist.email)}\n\n${mdText(u.rights)}\n`;
}
export function llmsIndex(data,{release=false}={}) {
  const {artist,site}=data;
  let out=`# ${mdText(artist.name)}\n\n> ${mdText(l(artist.role,'en'))}. ${mdText(l(artist.intro,'en'))}\n\n`;
  out+='English is the default language. Brazilian Portuguese is available at pt-br/. These documents describe the same portfolio shown to people; there are no additional credentials or private artwork records for agents.\n\n';
  if (!release) out+='Review build, not a published portfolio. Canonical URLs describe the planned deployment, not evidence that it is live.\n\n';
  out+='Artwork titles and credited institutions retain their original names. A listed work is not automatically available for sale or licensed for reuse. This index neither authorizes training nor guarantees inclusion in search or any selection process.\n\n## Portfolio\n\n';
  for (const locale of LOCALES) out+=`- [${locale === 'en' ? 'English portfolio and biography' : 'Portfólio e biografia em português'}](${absoluteUrl(site,localePath(locale)+'index.md')}): Artist profile, biography, contact and selected works.\n`;
  if (publicWorks(data).length) {
    out+='\n## Works\n\n';
    for (const w of publicWorks(data)) for (const locale of LOCALES) out+=`- [${mdText(l(w.title,locale))} (${locale})](${absoluteUrl(site,pagePath(locale,w)+'index.md')}): ${mdText(w.year)}; ${mdText(l(w.technique,locale))}; ${mdText(w.dimensions)}.\n`;
  }
  out+='\n## Optional\n\n';
  out+=`- [Full bilingual portfolio text](${absoluteUrl(site,'llms-full.txt')}): Same public biography and work descriptions in one text document.\n`;
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
    {'@type':'Person','@id':absoluteUrl(site,'#artist'),name:artist.name,jobTitle:l(artist.role,locale),description:l(artist.bio,locale),url:absoluteUrl(site,pagePath(locale)),email:artist.email,...(artist.portrait ? {image:absoluteUrl(site,artist.portrait.path)} : {})},
    ...publicWorks(data).map((w)=>({'@type':'VisualArtwork','@id':absoluteUrl(site,pagePath(locale,w)),url:absoluteUrl(site,pagePath(locale,w)),name:l(w.title,locale),creator:{'@id':absoluteUrl(site,'#artist')},dateCreated:w.year,artMedium:l(w.technique,locale),inLanguage:locale,...(w.description ? {description:l(w.description,locale)} : {}),image:w.images.map((im)=>({'@type':'ImageObject',contentUrl:absoluteUrl(site,im.path),caption:im.caption ? l(im.caption,locale) : l(im.alt,locale),width:im.width,height:im.height}))}))
  ]};
}
