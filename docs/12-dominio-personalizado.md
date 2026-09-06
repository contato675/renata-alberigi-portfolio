# 12 · Domínio próprio — renataalberigi.com.br

## Autorização e escopo
Em 06/09/2026, o usuário informou a compra de `renataalberigi.com.br` na GoDaddy e solicitou a configuração do GitHub. Esta mudança associa esse domínio ao mesmo portfólio no GitHub Pages; não migra hospedagem, não registra outro domínio, não muda e-mail, conteúdo artístico ou layout, não faz merge e não altera a GoDaddy.
Quatro edições não commitadas estavam na cópia original. A configuração foi feita em clone isolado da branch da PR #1; esses arquivos não foram sobrescritos nem incluídos neste commit.

## Configuração implementada
- `site.origin`: `https://renataalberigi.com.br`.
- `site.basePath`: `/`; inglês na entrada e português em `/pt-br/`.
- `site.customDomain`: `renataalberigi.com.br`.
- O build gera `CNAME` com uma única linha, e o publicador recusa um build que perder esse arquivo.
- HTML, imagens, JS/CSS, canonical, hreflang, Markdown, dados estruturados e descoberta usam a nova raiz. Não há redirecionamento por idioma.
- O verificador HTTP usa o domínio configurado, não o antigo endereço fixo.
- Preview continua `noindex`; domínio comprado não equivale a aprovação editorial ou final de indexação. `robotsRootVerified` permanece false até conferência HTTP real; a raiz `/` não dispensa esse gate.

## DNS necessário na GoDaddy
Manter o DNS na GoDaddy, caso seja a provedora autoritativa. Registros A em `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. CNAME `www`: `contato675.github.io` (sem protocolo/caminho). TTL padrão de 1 hora é adequado.
IPv6 opcional: quatro AAAA em `@`, `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
Remover/substituir somente registros conflitantes de hospedagem `@`/`www`, não MX/TXT ou registros de serviços alheios. Não usar wildcard `*`, URL forwarding ou serviços SSL pagos para esse apontamento.
A consulta inicial ao DNS local e a 1.1.1.1 retornou NXDOMAIN para apex/www. Isso registra ausência de resolução naquele momento, não prova falha da compra. Confirmar ativação do registro e zona DNS no registrador.

## HTTPS e verificação de propriedade
O GitHub só consegue emitir certificado após validar o DNS. Não desativar verificação TLS ou afirmar HTTPS válido antes da emissão. A configuração `https_enforced` deve ser habilitada/confirmada quando o certificado estiver disponível.
Verificação de propriedade por TXT é adicional à associação CNAME, nas configurações pessoais GitHub > Pages > Add a domain. O valor precisa ser gerado pelo GitHub; não inventar um token. Registrar o TXT fornecido em `_github-pages-challenge-contato675` e manter o registro após verificar.

## Publicação e limites
Fonte de publicação mantida: `pages-preview`, raiz `/`. Main não é mergeada. O antigo endereço github.io pode redirecionar para o domínio próprio; enquanto DNS/HTTPS estiverem pendentes, não apresentá-lo como alternativa funcional garantida.
Executar `npm run verify`, `npm run design:apple`, publicação deliberada, ler Pages e build status. Verificação HTTP integral do domínio fica pendente de DNS, sem contornar TLS.

## Evidências desta configuração
94 testes passaram; build com 384 arquivos, incluindo CNAME. Auditoria Apple-like repetida na base raiz: 28 layouts e 9 interações, zero falhas. Associação do Pages confirmada como `renataalberigi.com.br`, fonte `pages-preview` em `/`. GitHub health: domínio e www sem resolução DNS; certificado ausente e HTTPS ainda não imposto. Não confundir build aprovado com domínio online. Relatório e hashes em `docs/audits/2026-09-06-custom-domain.json`.

Fontes: [GitHub — custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), [GoDaddy — registro A](https://www.godaddy.com/pt-br/help/adicionar-um-registro-a-19238).
