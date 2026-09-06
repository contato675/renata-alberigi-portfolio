import {deflateSync} from 'node:zlib';
import {mkdir,writeFile,cp} from 'node:fs/promises';
import path from 'node:path';
// Neutral calibration media for tests ONLY. Never copy fixture output into dist/.
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([size,name,data,crc]);}
function png(width,height,tone){const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;const stride=width*3+1,pixels=Buffer.alloc(stride*height,tone);for(let y=0;y<height;y++){pixels[y*stride]=0;for(let x=0;x<width;x++){const edge=x<8||x>=width-8||y<8||y>=height-8;if(edge)pixels.fill(90,y*stride+1+x*3,y*stride+4+x*3);}}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);}
export async function createFixtures(root,fixtureRoot,data) {
  await cp(path.join(root,'site'),path.join(fixtureRoot,'site'),{recursive:true});
  data=structuredClone(data);
  for(const locale of ['en','pt-BR'])data.dictionaries[locale].preview=locale==='en'?'AUDIT FIXTURE · Calibration images only · NOT the artist’s work':'FIXTURE DE AUDITORIA · Imagens de calibração · NÃO são obras da artista';
  const images=[];
  for(const [i,[width,height,tone]] of [[640,960,220],[960,640,190],[640,640,205]].entries()){
    const relative=`assets/images/obras/audit/calibration-${i}.png`,filename=path.join(fixtureRoot,'site',relative);
    await mkdir(path.dirname(filename),{recursive:true});await writeFile(filename,png(width,height,tone));
    images.push({path:relative,width,height,alt:{en:`Calibration image ${i+1}; not an artwork or artist portrait`,'pt-BR':`Imagem de calibração ${i+1}; não é obra ou retrato da artista`},caption:{en:'Technical layout fixture — not an artwork','pt-BR':'Fixture técnica de layout — não é uma obra'}});
  }
  data.works=[0,1,2].map((i)=>({id:`audit-${i}`,status:'published',title:{en:`Layout fixture ${i+1} — not an artwork`,'pt-BR':`Fixture de layout ${i+1} — não é uma obra`},year:'Test only',technique:{en:'Technical test','pt-BR':'Teste técnico'},dimensions:'640 × 960 / 960 × 640 px',description:{en:'These neutral media test portrait, landscape and square layouts. They do not represent Renata’s artistic practice.','pt-BR':'Estas mídias neutras testam composições verticais, horizontais e quadradas. Não representam a produção artística de Renata.'},cover:0,images:i===1?[images[1]]:[images[i],images[(i+1)%3],images[(i+2)%3]]}));
  data.artist.portrait=images[0];
  data.artist.featuredVideo={provider:'youtube',id:'audit-only',poster:images[1],title:{en:'Technical video fixture','pt-BR':'Fixture técnica de vídeo'},transcript:{en:'Technical transcript fixture. No real film has been supplied.','pt-BR':'Fixture técnica de transcrição. Nenhum filme real foi fornecido.'}};
  return data;
}
