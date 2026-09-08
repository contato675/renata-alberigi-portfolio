import {cvPath,curriculumRecords} from './curriculum.mjs';
const md=value=>String(value).replace(/([\\\x60*_{}\[\]<>#])/g,'\\$1');
export function curriculumMarkdown(data,locale) {
  const u=data.dictionaries[locale],url=data.site.origin+data.site.basePath+cvPath(locale);
  let text='# '+md(u.cvTitle)+' — '+md(data.artist.name)+'\n\n'+url+'\n\n'+md(u.cvIntro)+'\n';
  for(const section of curriculumRecords(data,locale)) {
    text+='\n## '+md(section.title)+'\n\n';
    for(const entry of section.entries) {
      const title=entry.workPath?'['+md(entry.title)+']('+data.site.origin+data.site.basePath+entry.workPath+')':md(entry.title);
      text+='### '+md(entry.dateLabel)+' — '+title+'\n\n';
      if(entry.technique)text+=md(entry.technique)+(entry.dimensions?' · '+md(entry.dimensions):'')+'\n\n';
      if(entry.description)text+=md(entry.description)+'\n\n';
    }
  }
  return text+md(u.rights)+'\n';
}
/** Curriculum metadata must not inherit the full biography or personal fields. */
export function curriculumStructured(data,locale) {
  const u=data.dictionaries[locale],url=data.site.origin+data.site.basePath+cvPath(locale);
  return {'@context':'https://schema.org','@type':'WebPage','@id':url,url,name:u.cvTitle+' — '+data.artist.name,description:u.cvIntro,inLanguage:locale,
    about:{'@type':'Person',name:data.artist.name},
    hasPart:curriculumRecords(data,locale).map(section=>({'@type':'CreativeWork',name:section.title,url:url+'#cv-'+section.id,
      text:section.entries.map(entry=>[entry.dateLabel+' — '+entry.title,[entry.technique,entry.dimensions].filter(Boolean).join(' · '),entry.description].filter(Boolean).join('\n')).join('\n\n')}))};
}
