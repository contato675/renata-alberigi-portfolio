/** Explicit local import: originals are read-only; only clean web derivatives enter site/. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const existingWorks=JSON.parse(await fs.readFile(path.join(root,'site/content/works.json'),'utf8'));
if(existingWorks.length)throw new Error('Initial import only: preserve the existing reviewed catalogue. Use a targeted media update.');
const source=process.argv[2];
if(!source||!process.env.SHARP_MODULE)throw new Error('Usage: SHARP_MODULE=<sharp entry> node scripts/import-media.mjs <input-folder>');
const {default:sharp}=await import(pathToFileURL(process.env.SHARP_MODULE));
sharp.concurrency(2);
const localized=(en,pt)=>({en,'pt-BR':pt});
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const sorting=(a,b)=>a.localeCompare(b,'pt-BR',{numeric:true});
const isImage=name=>/\.(jpe?g|jfif|webp|png)$/i.test(name);
const hash=b=>createHash('sha256').update(b).digest('hex');
const provenance=[],works=[];
const folderNames=(await fs.readdir(source,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name);
const hand=folderNames.find(s=>s.startsWith('Obras Pintadas'));
const digital=folderNames.find(s=>s.startsWith('Obras Pinturas'));
if(!hand||!digital||!folderNames.includes('Perfil'))throw new Error('Required source folders missing.');
async function derivative(input,relative,alt,thumbnail=false){
  const original=await fs.readFile(input),originalHash=hash(original);
  const dest=path.join(root,'site',relative);await fs.mkdir(path.dirname(dest),{recursive:true});
  const info=await sharp(original).rotate().toColourspace('srgb').resize(1920,1920,{fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:5}).toFile(dest);
  const clean=await sharp(dest).metadata();if(clean.exif||clean.xmp||clean.iptc)throw new Error('Private metadata survived export.');
  const image={path:relative,width:info.width,height:info.height,alt};
  if(thumbnail&&info.width>640){const thumb=relative.replace('.webp','-640.webp');const t=await sharp(original).rotate().toColourspace('srgb').resize({width:640,withoutEnlargement:true}).webp({quality:88,effort:5}).toFile(path.join(root,'site',thumb));image.variants=[{path:thumb,width:t.width,height:t.height}];}
  if(hash(await fs.readFile(input))!==originalHash)throw new Error('Original changed during import.');
  provenance.push({source:path.relative(source,input),sourceHash:originalHash,sourceBytes:original.length,output:relative,outputBytes:info.size,width:info.width,height:info.height,metadataRemoved:true});return image;
}
const coverDescriptions=[
 ['A pink river between rocks, with an orange-flowering tree beneath a cloudy sky.','Um rio rosa entre rochas, com uma árvore de flores alaranjadas sob um céu de nuvens.'],
 ['A rocky river landscape with red and amber water and green vegetation.','Uma paisagem de rio rochoso, águas vermelhas e âmbar e vegetação verde.'],
 ['A narrow blue river surrounded by red rocks and green trees.','Um rio azul estreito cercado por rochas avermelhadas e árvores verdes.'],
 ['A network of trees, branches and small pink and green marks.','Uma trama de árvores, galhos e pequenas marcas rosas e verdes.'],
 ['Interwoven trees and roots across a densely painted pink and green landscape.','Árvores e raízes entrelaçadas em uma paisagem de pintura densa, rosa e verde.'],
 ['Sunlit rock formations beside dark water under a blue sky.','Formações rochosas iluminadas junto a águas escuras sob um céu azul.'],
 ['A richly coloured tree trunk and roots in a pink landscape.','Um tronco e suas raízes em muitas cores, em uma paisagem rosa.'],
 ['A pale river winding through a landscape of rocks and vegetation.','Um rio claro serpenteando por uma paisagem de rochas e vegetação.'],
 ['Branching blue and golden shapes in an intricately painted composition.','Formas ramificadas azuis e douradas em uma composição de pintura detalhada.']
];
for(const [i,folder] of (await fs.readdir(path.join(source,hand))).sort(sorting).entries()){
 const match=folder.match(/^\d+\s+(.+?)\s+(\d{4})$/);if(!match)throw new Error('Unrecognised painting folder: '+folder);
 let title=match[1];title=title.startsWith('analogiaeu')?title.replace('analogiaeu','ANALOGIAEU'):title.charAt(0).toUpperCase()+title.slice(1);
 const id=slug(title+'-'+match[2]);const files=(await fs.readdir(path.join(source,hand,folder))).filter(isImage).sort(sorting);
 const main=files.findIndex(f=>/principal/i.test(f));if(main>0)files.unshift(...files.splice(main,1));
 const images=[];for(const [j,file] of files.entries()){const description=j===0?coverDescriptions[i]:null;const alt=localized(title+' — '+(description?description[0]:'Photograph '+(j+1)+' of the hand-painted work and its details.'),title+' — '+(description?description[1]:'Fotografia '+(j+1)+' da pintura feita à mão e de seus detalhes.'));images.push(await derivative(path.join(source,hand,folder,file),`assets/images/obras/${id}/image-${String(j+1).padStart(2,'0')}.webp`,alt,j===0));}
 works.push({id,title:localized(title,title),originalTitle:title,year:match[2],technique:localized('Hand-painted artwork','Pintura feita à mão'),dimensions:null,status:'published',cover:0,collection:'paintings',category:localized('Hand-painted works','Pinturas feitas à mão'),images});
}
const digitalFiles=(await fs.readdir(path.join(source,digital))).filter(isImage).sort(sorting);
const groups=new Map();for(const file of digitalFiles){const m=file.match(/^(\d+)/);if(!m)throw new Error('Unrecognised digital filename');if(!groups.has(m[1]))groups.set(m[1],[]);groups.get(m[1]).push(file);}
for(const [number,files] of groups){const id='digital-'+number.padStart(2,'0'),named=number==='1';const title=named?localized('Mãe','Mãe'):localized('Digital painting '+number.padStart(2,'0'),'Pintura digital '+number.padStart(2,'0'));const images=[];
 for(const [j,file] of files.entries())images.push(await derivative(path.join(source,digital,file),`assets/images/obras/${id}/image-${String(j+1).padStart(2,'0')}.webp`,localized(title.en+' — hand-drawn digital painting, image '+(j+1)+'.',title['pt-BR']+' — pintura digital feita à mão, imagem '+(j+1)+'.'),j===0));
 works.push({id,title,...(named?{originalTitle:'Mãe'}:{titleStatus:'catalogue-label'}),year:'2024–2026',yearIsCollectionPeriod:true,technique:localized('Hand-drawn digital painting','Pintura digital feita à mão'),dimensions:null,status:'published',cover:0,collection:'digital',category:localized('Digital paintings','Pinturas digitais'),images});
}
const artist=JSON.parse(await fs.readFile(path.join(root,'site/content/artist.json'),'utf8'));
const portraitFiles=(await fs.readdir(path.join(source,'Perfil'))).filter(isImage);if(portraitFiles.length!==1)throw new Error('Portrait selection needs review.');
artist.portrait=await derivative(path.join(source,'Perfil',portraitFiles[0]),'assets/images/perfil/renata-alberigi.webp',localized('Artist portrait supplied for Renata Alberigi’s portfolio.','Retrato de apresentação fornecido para o portfólio de Renata Alberigi.'),true);
const videos=[];
for(const [i,id] of ['Q1bbei1X3VA','hS3SNQcha2o'].entries()){
 const response=await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);if(!response.ok)throw new Error('YouTube metadata unavailable.');const meta=await response.json();let bytes;
 for(const version of ['maxresdefault','hqdefault']){const r=await fetch(`https://i.ytimg.com/vi/${id}/${version}.jpg`);if(r.ok){bytes=Buffer.from(await r.arrayBuffer());break;}}if(!bytes)throw new Error('YouTube thumbnail unavailable.');
 const relative=`assets/images/video/film-${i+1}.webp`;await fs.mkdir(path.join(root,'site/assets/images/video'),{recursive:true});const info=await sharp(bytes).toColourspace('srgb').webp({quality:88}).toFile(path.join(root,'site',relative));
 videos.push({provider:'youtube',id,title:localized(meta.title,meta.title),transcript:null,poster:{path:relative,width:info.width,height:info.height,alt:localized('YouTube thumbnail: '+meta.title,'Imagem de capa do YouTube: '+meta.title)},description:localized('A film from the ANALOGIAEU body of work, selected for this portfolio. Original title preserved.','Vídeo do trabalho ANALOGIAEU selecionado para este portfólio. Título original preservado.')});
}
artist.featuredVideo=videos[0];artist.additionalVideos=videos.slice(1);
artist.role=localized('Brazilian painter & visual artist','Pintora e artista visual brasileira');
artist.intro=localized('Painting made by hand. Renata works with oil and acrylic painting, inspired by trees, rocks and river waters. A separate collection presents her hand-drawn digital paintings.','Pintura feita à mão. Renata trabalha com pintura a óleo e acrílica, inspirada por árvores, rochas e águas de rios. Uma coleção separada apresenta suas pinturas digitais feitas à mão.');
artist.bio.en=artist.bio.en.replace('is a Brazilian visual artist','is a Brazilian painter and visual artist').replace('Her practice encompasses oil and acrylic painting, portraits','Her practice centres on paintings made by hand in oil and acrylic, alongside portraits');
artist.bio['pt-BR']=artist.bio['pt-BR'].replace('é artista visual brasileira','é pintora e artista visual brasileira').replace('reúne pinturas a óleo e com tinta acrílica, retratos','tem como foco a pintura feita à mão, a óleo e com tinta acrílica, e também reúne retratos');
await fs.writeFile(path.join(root,'site/content/works.json'),JSON.stringify(works,null,2)+'\n');await fs.writeFile(path.join(root,'site/content/artist.json'),JSON.stringify(artist,null,2)+'\n');
await fs.writeFile(path.join(root,'artifacts/media-inspection/provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({works:works.length,paintings:works.filter(w=>w.collection==='paintings').length,digital:works.filter(w=>w.collection==='digital').length,artworkImages:works.reduce((s,w)=>s+w.images.length,0),portrait:1,videos:videos.length,originalBytes:provenance.reduce((s,r)=>s+r.sourceBytes,0),webBytes:provenance.reduce((s,r)=>s+r.outputBytes,0),originalsUnchanged:true}));
