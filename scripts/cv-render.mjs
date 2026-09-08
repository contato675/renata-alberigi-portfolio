import {escapeHtml as e} from './content.mjs';
import {localePath} from './i18n.mjs';
import {curriculumRecords} from './curriculum.mjs';
function dateMarkup(entry) {
  if (/^\d{4}[–-]\d{4}$/.test(entry.date)) {
    const [first,last]=entry.date.split(/[–-]/);
    return '<time datetime="'+first+'">'+first+'</time><span>–</span><time datetime="'+last+'">'+last+'</time>';
  }
  return '<time datetime="'+e(entry.date)+'">'+e(entry.dateLabel)+'</time>';
}
export function renderCurriculum(data,locale) {
  const u=data.dictionaries[locale],sections=curriculumRecords(data,locale),local=p=>data.site.basePath+p;
  const index='<nav class="cv-index" aria-label="'+e(u.cvIndex)+'">'+sections.map(s=>'<a class="control" href="#cv-'+e(s.id)+'">'+e(s.title)+'</a>').join('')+'</nav>';
  const content=sections.map((section,i)=>'<section class="grid cv-section" id="cv-'+e(section.id)+'" aria-labelledby="cv-heading-'+e(section.id)+'">'+
    '<div class="section-title cv-section-title"><p class="eyebrow">'+String(i+1).padStart(2,'0')+'</p><h2 id="cv-heading-'+e(section.id)+'">'+e(section.title)+'</h2></div>'+
    '<ol class="section-content cv-entries">'+section.entries.map(entry=>{
      const title=entry.workPath?'<a class="control cv-work-link" href="'+e(local(entry.workPath))+'">'+e(entry.title)+'<span aria-hidden="true"> ↗</span></a>':e(entry.title);
      const details=[entry.technique,entry.dimensions].filter(Boolean).join(' · ');
      const description=entry.description?entry.description.split(/\n+/).map(p=>'<p class="cv-detail">'+e(p)+'</p>').join(''):'';
      return '<li class="cv-entry" id="cv-'+e(section.id)+'-'+e(entry.id)+'"><div class="cv-date">'+dateMarkup(entry)+'</div><div class="cv-entry-content"><h3>'+title+'</h3>'+(details?'<p class="cv-detail">'+e(details)+'</p>':'')+description+'</div></li>';
    }).join('')+'</ol></section>').join('\n');
  return '<article class="cv-page" aria-labelledby="cv-title"><div class="grid cv-heading"><div class="cv-heading-copy"><a class="control cv-back" href="'+e(local(localePath(locale)))+'">← '+e(u.cvBack)+'</a><p class="eyebrow">'+e(data.artist.name)+'</p><h1 id="cv-title">'+e(u.cvTitle)+'</h1><p class="intro">'+e(u.cvIntro)+'</p></div></div>'+index+content+'</article>';
}
