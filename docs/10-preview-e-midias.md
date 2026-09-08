# 10 · Preview público da PR #1 e material real

## Autorização e escopo
Em 06/09/2026, o usuário autorizou o preview público e, se necessário, tornar público somente `contato675/renata-alberigi-portfolio`. A autorização não permite merge automático, alterar outros repositórios, publicar os originais do Desktop ou chamar o preview de lançamento editorial aprovado.
Esta atualização substitui o estado anterior de mídia ausente descrito nos documentos históricos 03/05/09.

## Conteúdo incorporado
São 20 projetos: 9 pinturas físicas (94 fotografias) e 11 pinturas digitais manuais (29 imagens), além de um retrato e dois filmes do YouTube. Pintura feita à mão / painting made by hand é o foco explícito do release e da abertura em inglês. As categorias são separadas: grade de pinturas físicas primeiro, grade digital depois; cada projeto tem seu carrossel e página estática nos dois idiomas.
Títulos e anos físicos vêm das pastas fornecidas. Nos digitais sem título, o nome é identificado como rótulo de catálogo; 2024–2026 é período da coleção, não data presumida de cada criação. Não foram inventadas dimensões, técnica específica por pintura, preços ou transcrições. Títulos originais dos dois filmes preservados.
Somente derivados WebP entram no Git. O importador leu os 124 originais, conferiu seus hashes durante a importação, removeu EXIF/XMP/IPTC dos derivados e manteve proporções/gestão de cor. Fotografias não foram geradas por IA. Versões menores das capas evitam carregar ampliações desnecessárias.

## Evidências
`npm run verify`: 51 testes passaram e build gerou 239 arquivos.
`npm run design:apple`: matriz de 28 combinações e 9 interações aprovada, com revisão editorial pendente.
`node scripts/audit-real-media.mjs`: 45 verificações passaram, incluindo 20 visualizadores em EN/PT, 40 páginas completas, duas coleções e players por clique.
A inspeção das capturas reduzidas verificou hero, grade com fotografias e visualizador mobile. Arte real, não apenas retângulos de calibração. Isso não substitui aprovação cromática da artista, dispositivos reais ou leitores de tela.
Relatórios: `docs/audits/2026-09-06-media-layout.json` e `2026-09-06-real-media.json`.

## Deploy deliberado sem merge
O preview usa a branch separada `pages-preview`, contendo apenas o build estático, `.nojekyll` e `preview-build.json` com SHA da fonte e hashes dos arquivos. `main` não é modificada. GitHub Pages lê a raiz dessa branch; o build Node não roda no site.
Após commit/push e revisão, `node scripts/publish-preview.mjs --confirm-public-preview` prepara e envia apenas o preview noindex. O comando recusa árvore suja, branch errada, fonte não enviada ou falta de autorização. Não usa force-push e não ativa Pages ou muda visibilidade por conta própria. Essas configurações são operações administrativas separadas e verificadas.
Esta é uma escolha deliberada para oferecer preview sem precisar inserir/mergear um workflow na main. Referências oficiais: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site e https://docs.github.com/en/rest/pages/pages.

## Pendências para lançamento
O preview é público, não protegido por login. Meta noindex solicita não indexar; não é controle de acesso. O robots da subpasta é apenas candidato: a raiz da origem ainda precisa ser verificada/configurada sem alterar outros projetos. PDF, revisão humana final do inglês, títulos/dimensões incompletos, transcrições e revisão em aparelhos reais continuam pendentes. Flags de lançamento final permanecem falsas.
URL esperada: https://contato675.github.io/renata-alberigi-portfolio/ ; confirmar HTTP depois do deploy antes de comunicar que está online.
