# 09 · Auditoria Apple-like — escopo e evidência

## Régua
Contrato original `.agents/skills/apple-like-design-audit/SKILL.md`, inspirado nas fontes Apple-like efetivamente verificadas da SSSOM e Apple HIG, combinado à grade Müller. Não é ferramenta oficial nem certificação da Apple.

## Execução
`npm run design:apple` gera build real e build de calibração em diretório temporário. Usa um perfil temporário do Chrome/Chromium/Edge via CDP, sem anexar ao perfil pessoal, sem pacote adicional e sem alterar política do navegador. O diretório temporário e o processo próprios são encerrados ao final. Se faltar navegador ou houver bloqueio, o comando falha explicitamente.
A primeira tentativa no ambiente Linux foi bloqueada por `net::ERR_BLOCKED_BY_ADMINISTRATOR` no acesso a localhost. Nenhuma política foi removida ou modificada. A validação deve ser repetida em um ambiente autorizado e o resultado real registrado antes de aprovar os gates.

## Matriz
Estado atual sem obras e fixture neutra isolada, inglês/português, larguras320/390/480/768/1024/1440/1920:28 combinações. Fixtures testam retrato, grade e projetos com uma ou várias imagens; os retângulos são explicitamente técnicos, não trabalhos de Renata. Nunca entram no `dist/` real.
Medições: overflow, h1, nome/tamanho de controles, dimensões/alt, aderência às colunas, contraste e locale. Interações: dialog, foco, paginação, Escape, posição, Back/Forward, mobile, reduced motion, detalhe sem JS, ausência de terceiro antes do clique e overlay.

## Evidências
A saída local fica em `artifacts/apple-like/report.json` e screenshots. Resultados consolidados do ambiente autorizado serão registrados abaixo; não interpretar esta descrição da matriz como execução bem-sucedida.

## Limites permanentes nesta fase
Sem retrato/obras/vídeo reais não há aprovação cromática/editorial final. Revisão humana de inglês, leitores de tela, toque real iOS/Android, zoom200%, desempenho de campo e root robots ao vivo continuam pendentes. O auditor não executa axe e não prova conformidade WCAG completa. Métricas computadas não substituem inspeção das capturas.

## Resultado executado em 2026-09-06

Auditoria final no Windows autorizado, Chrome 152.0.7977.77, às 13:26:18 UTC.
Relatório versionado: `docs/audits/2026-09-06-apple-like.json` (inclui hashes dos arquivos auditados).

| Verificação | Resultado |
|---|---|
| `npm run verify` | Check e build passaram; 42 testes, 0 falhas |
| `npm run design:apple` | `PASS_WITH_EDITORIAL_PENDING` |
| Matriz de layout | 28 combinações, 0 falhas |
| Interações do navegador | 9 verificações, 0 falhas |
| Overflow horizontal máximo | 0 px |
| Desvio máximo das caixas na grade | 0,0628 px |
| Contraste calculado: texto / secundário | 17,93:1 / 6,10:1 sobre branco |
| `npm run check:publish` | Exit 1 esperado: aprovação, mídias, revisão EN e robots raiz pendentes |

A inspeção visual incluiu a página completa em inglês/desktop, português/320 px, grade de calibração e visualizador mobile/desktop. As capturas são evidências técnicas, não aprovação das obras reais. O teste carrega as imagens lazy antes de capturar a página; capturas do modal usam apenas o viewport.
Na primeira execução foram encontrados e corrigidos overflow do placeholder em 320 px, largura da biografia desalinhada à grade e foco que escapava do dialog por Tab. O próprio harness foi corrigido para não depender de timers de página no teste sem JavaScript e sempre restaurar esse estado em `finally`.
O Kaspersky instalado injeta recursos no navegador. O relatório identifica somente a origem observada, sem parâmetros ou identificadores; não atribui essa conexão ao site e não oculta terceiros inesperados. Antivírus e políticas permaneceram ativos.
A medição da grade é de caixas; offsets ópticos de glifos foram registrados separadamente e não certificados como zero em todas as fontes/sistemas.

**Conclusão:** base técnica e matriz automatizada aprovadas para revisão da PR; publicação e aprovação editorial continuam bloqueadas. Os limites de toque real, leitores de tela, zoom e fidelidade das mídias acima permanecem abertos.
