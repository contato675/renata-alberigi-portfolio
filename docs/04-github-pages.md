# 04 · GitHub Pages e publicação

## Estado
Repositório independente `contato675/renata-alberigi-portfolio`, privado; main preservado. Pages não ativado. Push/PR não são deploy. Endereço planejado: `https://contato675.github.io/renata-alberigi-portfolio/`.

## Build e URLs
Node gera HTML estático para entrada inglesa, versão `pt-br/` e páginas permanentes de cada obra publicada. Paths usam `site.origin` + `site.basePath`, de modo que funcionem no subdiretório de Pages e, se autorizado, na raiz de um domínio próprio. Markdown e descoberta seguem o mesmo prefixo. Apenas `dist/` aprovado pode ser publicado; nunca `docs/`, fixtures, originais ou todo o repositório.

`npm run build` é SEMPRE preview com noindex e robots conservador. `npm run build:release` exige as mesmas condições de `check:publish` e só então gera metadados indexáveis e sitemap com páginas públicas. Não enviar preview ao Pages e chamar isso de lançamento.

## Exigência da raiz para robots.txt
Em um projeto Pages, o arquivo gerado em `/renata-alberigi-portfolio/robots.txt` NÃO controla crawlers. Estes procuram `https://contato675.github.io/robots.txt`. O llms.txt pode ser publicado na subpasta, com descoberta explícita no HTML, mas não confundir isso com a regra do robots.
Caminhos possíveis: configurar domínio próprio para este portfólio e `basePath: "/"`; ou revisar/instalar o robots na raiz do site de usuário `contato675.github.io`, sem conflitar com outras páginas. Não criar/editar esse outro repositório nesta entrega. `robotsRootVerified` só pode tornar-se true depois de conferência HTTP real da política efetiva.

## Gates para lançar
Material real + revisão humana dos idiomas; `phase: "ready"`, `implementationComplete: true`, `publicationApproved: true`; root policy efetiva; `npm run verify`; auditoria Apple-like e inspeção visual; `npm run check:publish`; `npm run build:release`.
Revisar a elegibilidade do plano GitHub ou autorizar explicitamente a mudança de visibilidade. Um repositório privado não promete que seu site Pages será privado.
Só depois ativar workflow deliberado (`workflow_dispatch`) para configure-pages/upload-pages-artifact/deploy-pages, actions pinadas e permissões mínimas. Não há workflow de publicação ativo nesta PR. Verificar execução e HTTP do domínio, rotas profundas, MIME de Markdown/texto, assets, idioma, canonicals e root robots após deploy.

## Escopo comercial
Não há loja, catálogo comercial, checkout ou integração Gumroad nesta implementação. Uma evolução para transações requer outra avaliação de hospedagem e políticas do Pages. Não criar dados de preços/Offer para tentar influenciar recomendações de IA.

## Rollback
Revert por novo commit e deploy conhecido; nunca force-push. Reversão não elimina automaticamente fotografias do histórico ou caches públicos. Revisar a seleção antes de publicar.
