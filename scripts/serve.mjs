import {createServer} from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {containedPath} from './content.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/ld+json; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8','.xml':'application/xml; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.avif':'image/avif','.png':'image/png','.pdf':'application/pdf'};
export async function startServer(root,prefix,{port=0}={}) {
  await stat(path.join(root,'index.html'));
  const rootReal=await realpath(root);
  const server=createServer(async (request,response)=>{
    try {
      if (!['GET','HEAD'].includes(request.method)) {response.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
      const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
      if (pathname==='/' && prefix!=='/') {response.writeHead(302,{'Location':prefix}).end();return;}
      if (pathname===prefix.slice(0,-1) && prefix!=='/') {response.writeHead(301,{'Location':prefix}).end();return;}
      if (!pathname.startsWith(prefix)) throw new Error();
      let relative=pathname.slice(prefix.length);
      if (!relative || relative.endsWith('/')) relative+='index.html';
      let filename=containedPath(root,relative);
      if ((await stat(filename)).isDirectory()) {response.writeHead(301,{'Location':pathname+'/'}).end();return;}
      const resolved=await realpath(filename);
      if (!resolved.startsWith(rootReal+path.sep) || !(await stat(filename)).isFile()) throw new Error();
      if (relative.split('/').some((part)=>part.startsWith('.'))) throw new Error();
      const body=await readFile(filename);
      response.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      response.end(request.method==='HEAD'?undefined:body);
    } catch {response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end(request.method==='HEAD'?undefined:'Not found.');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {server,url:`http://127.0.0.1:${server.address().port}${prefix}`};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const root=fileURLToPath(new URL('../',import.meta.url));
    const site=JSON.parse(await readFile(path.join(root,'site/content/site.json'),'utf8'));
    const {url}=await startServer(path.join(root,'dist'),site.basePath,{port:4173});
    console.log(`Preview: ${url}`);
  } catch (error) {console.error(`PREVIEW_FAIL: ${error.message}`);process.exitCode=1;}
}
