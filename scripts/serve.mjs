import {createServer} from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {containedPath} from './content.mjs';
const root = fileURLToPath(new URL('../dist/',import.meta.url));
const prefix = '/renata-alberigi-portfolio/';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf'};
try {
  await stat(path.join(root,'index.html'));
  const server = createServer(async (request,response) => {
    try {
      if (!['GET','HEAD'].includes(request.method)) {response.writeHead(405).end();return;}
      let pathname = decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
      if (pathname === '/') {response.writeHead(302,{'Location':prefix}).end();return;}
      if (!pathname.startsWith(prefix)) {response.writeHead(404).end('Não encontrado.');return;}
      const relative = pathname.slice(prefix.length) || 'index.html';
      const filename = containedPath(root,relative);
      const resolved = await realpath(filename);
      if (!resolved.startsWith((await realpath(root))+path.sep)) throw new Error();
      if (!(await stat(filename)).isFile()) throw new Error();
      const body = await readFile(filename);
      response.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      response.end(request.method==='HEAD' ? undefined : body);
    } catch {response.writeHead(404).end('Não encontrado.');}
  });
  server.on('error',()=>{console.error('Não foi possível abrir a porta local.');process.exitCode=1;});
  server.listen(4173,'127.0.0.1',()=>console.log(`Preview local: http://127.0.0.1:4173${prefix}`));
} catch {console.error('Execute npm run build antes do preview.');process.exitCode=1;}
