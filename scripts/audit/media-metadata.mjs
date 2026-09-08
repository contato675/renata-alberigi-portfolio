import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {allVideos,imagePaths} from '../content.mjs';
/** Inspect the actual current derivatives, not a stale import receipt. */
export async function inspectMediaMetadata(root,data) {
 const images=[data.artist.portrait,...allVideos(data.artist).map(v=>v.poster),...data.artist.studioImages,...data.works.filter(w=>w.status==='published').flatMap(w=>w.images)].filter(Boolean);
 const paths=[...new Set(imagePaths(images))];
 for(const relative of paths) {
  assert.ok(relative.endsWith('.webp'),'Expected web derivative: '+relative);
  const bytes=await fs.readFile(path.join(root,'site',relative));
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  let offset=12;
  while(offset+8<=bytes.length){const tag=bytes.subarray(offset,offset+4).toString(),length=bytes.readUInt32LE(offset+4);assert.ok(!['EXIF','XMP ','IPTC'].includes(tag),'Unexpected personal metadata in '+relative);offset+=8+length+(length%2);}
  assert.equal(offset,bytes.length,'Malformed WebP chunks');
 }
 return {images:images.length,derivatives:paths.length,personalMetadata:0};
}
