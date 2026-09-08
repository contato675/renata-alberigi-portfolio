# 13 · Français e correção da troca de idioma

Atualização de 6 de setembro de 2026. Repositório exclusivo do portfólio de Renata Alberigi. Esta atualização amplia a arquitetura bilíngue histórica dos documentos 03/08 para EN/PT-BR/FR; preserva a publicação pública noindex e não autoriza merge ou indexação final.

## Cobertura implementada

O registro central `scripts/i18n.mjs` define `en`, `pt-BR`, `fr`, caminhos distintos e os identificadores Open Graph correspondentes. `site/content/locales/fr.json` contém as mesmas 68 chaves dos outros idiomas. As chaves ausentes ou vazias, incluindo todos os campos editoriais, impedem a geração em vez de usar inglês/português silenciosamente.

Francês cobre apresentação, biografia completa, localização, navegação desktop, menu mobile, controles acessíveis, galerias, fichas, títulos descritivos de coleções, vídeos, rodapé, direitos, estados auxiliares e páginas de erro estáticas. São 330 campos editoriais localizados, 21 projetos, 189 descrições de imagens das obras e 66 legendas da coleção RUADOFLOW. Nomes originais de obras, filmes e instituições permanecem originais; nenhum título, ano, dimensão ou transcrição foi inventado. O status de revisão humana francesa permanece false.

| Recurso | Inglês | Português | Francês |
| --- | --- | --- | --- |
| Entrada | `/` | `/pt-br/` | `/fr/` |
| Projeto | `/works/<id>/` | `/pt-br/works/<id>/` | `/fr/works/<id>/` |
| Texto | `/index.md` | `/pt-br/index.md` | `/fr/index.md` |
| Dados | `/portfolio.json` | `/pt-br/portfolio.json` | `/fr/portfolio.json` |
| Erro estático | `/404.html` | `/pt-br/404.html` | `/fr/404.html` |

As rotas continuam compatíveis com uma base de projeto Pages, embora o domínio atual use `/`. Cada página tem canonical próprio e alternates en/pt-BR/fr/x-default. O alias histórico de Correnteza também existe em francês. `llms.txt` e `llms-full.txt` incluem os três idiomas. O sitemap público continua vazio devido ao modo noindex; o teste de release usa somente uma cópia de teste aprovada artificialmente, nunca altera a configuração pública.

## Salto ao selecionar um idioma

Causa reproduzida: `gallery.js` copiava `location.hash` para os links de idioma. Depois de visitar `#works` e voltar manualmente ao topo, o clique em Português reintroduzia a âncora antiga: o navegador saiu de 0 para 808 px e reenquadrou a seção de pinturas.

A cópia cega foi removida. `locale-navigation.js` usa o ponto de leitura real, incluindo a margem da seção, e não a âncora antiga da URL. A posição é armazenada uma única vez em sessionStorage, apenas nesta aba, vinculada ao destino e com validade de 30 segundos. Nenhuma chamada de rede, cookie, preferência persistente ou detecção automática de idioma é adicionada. O registro é consumido; dados inválidos/expirados, navegação de histórico, reload e fragmentos intencionais não são sobrescritos.

Selecionar o idioma já ativo não recarrega a página. Cliques modificados preservam o comportamento nativo. Links do visualizador para páginas permanentes de projetos continuam abrindo o projeto equivalente normalmente, em vez de transferir a posição da página inicial. Sem JavaScript ou acesso ao armazenamento, os links estáticos continuam utilizáveis e não carregam `#works` antigo; a restauração exata de posição depende desse aprimoramento.

## Ajustes editoriais solicitados

O subtítulo da seção de vídeos foi removido de HTML e dos três dicionários; o título da seção e as informações individuais de cada filme permanecem. A reprodução continua sendo ativada apenas por clique.

O rodapé de todas as páginas contém Instagram apontando para `https://www.instagram.com/renataalberigi/`, com nome acessível localizado, abertura em nova aba e `noopener noreferrer`. O endereço tem uma única fonte em `artist.instagram`, é validado como perfil HTTPS e também aparece no Markdown e em `Person.sameAs`. Nenhum widget de Instagram ou requisição de terceiros foi introduzido.

## Verificações

`npm run verify` inclui testes de paridade, remoção de cada campo francês, ausência de fallback, rotas, canonical/hreflang, aliases, HTML/Markdown/dados e casos negativos de restauração. `npm run design:locales` reproduz a regressão nas seis direções de idioma em 390 e 1440 px, preservação de filmes/digitais/sobre, idioma atual, páginas permanentes, visualizador, Voltar/Avançar, armazenamento bloqueado e navegação sem scripts. A auditoria Apple-like foi ampliada de 28 para 42 combinações (três idiomas, sete larguras e dois conjuntos de conteúdo).

Relatórios finais desta rodada ficam em `docs/audits/2026-09-06-fr-*.json`. Screenshots permanecem em `artifacts/` local e não entram no site publicado. Foram inspecionados desktop e mobile franceses, menu mobile, visualizador e detalhe sem JavaScript; sem cortes de controles ou overflow nas capturas revisadas. A matriz automatizada não certifica Apple/WCAG nem substitui aparelhos físicos, leitores de tela ou revisão editorial humana.

## Isolamento e publicação

A implementação foi feita em cópia isolada da branch de origem da PR #1. Os quatro arquivos com mudanças preexistentes no checkout original não foram alterados. Uma comparação JSON contra `d8759ff5e1f1d17b8fea77f098f21a331f3af0ba` confirma que o catálogo mantém integralmente todos os dados anteriores ao remover as novas propriedades `fr` e o campo adicional de Instagram autorizado pelo usuário. A artista recebeu também o endereço de Instagram explicitamente solicitado, sem alteração dos textos anteriores em português e inglês.

Publicação pelo mecanismo existente `scripts/publish-preview.mjs --confirm-public-preview`, exclusivamente de arquivos gerados em `pages-preview`. CNAME, domínio, HTTPS e política noindex são preservados; não há merge em main. O recebimento em produção precisa ser confirmado pelo manifesto/hash, execução do Pages e repetição da auditoria de idiomas no domínio, com o resultado anexado à PR.

## Ajustes adicionais solicitados antes do deploy

Incluído o perfil `https://www.instagram.com/renataalberigi/` no rodapé de todas as páginas, no Markdown e no `sameAs` da artista. As chaves `instagram` e `instagramProfile` existem nos três idiomas, com link externo seguro e validação do endereço. Removido o subtítulo de reprodução da seção de filmes e sua chave `filmNote` em todos os idiomas. As 68 chaves atuais mantêm paridade completa. A remoção da frase não altera o carregamento de vídeo somente após clique. Quatro testes específicos cobrem esses ajustes.

## Resultado técnico desta rodada

124 testes unitários aprovados, zero falhas; build com 434 arquivos. Auditoria Apple-like: 42 layouts e 9 interações, zero falhas. Navegação, coleção e mídias reais: zero falhas nas matrizes de três idiomas. Auditoria específica de idiomas/vídeos/Instagram: 38 verificações, zero falhas. Os hashes do código auditado estão em `docs/audits/2026-09-06-fr-summary.json`; comprovação HTTP e implantação são registradas na PR depois do deploy.
