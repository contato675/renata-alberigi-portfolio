# 18 · Espanhol completo e seletor compacto de idiomas

## Escopo autorizado
Em 08/09/2026, o usuário solicitou espanhol em todo o portfólio e um seletor compacto no desktop. Base anterior: `b395661a38e956687c870068df285401dc8cabe5`.

## Conteúdo e rotas
- Quarto idioma: `es`, com home `/es/`, currículo `/es/curriculo/` e fichas em `/es/works/<id>/`.
- 75 chaves de interface e 410 campos editoriais recebem espanhol explícito, incluindo biografia, técnicas, descrições, imagens, legendas, vídeos e os 34 registros do currículo.
- Títulos originais de obras/filmes e nomes próprios das instituições são preservados; a coleção de design tem título descritivo localizado.
- HTML completo, Markdown, JSON, canonicals, hreflang, aliases, 404 e índices textuais gerados a partir da mesma fonte.
- EN continua na entrada. PT-BR e FR permanecem disponíveis; não há redirecionamento automático por idioma do navegador.

## Seletor desktop
`details`/`summary` nativos, com idioma atual e seta discreta. A lista abre somente por interação; quatro links reais e estado atual identificado. Sem bandeiras, bibliotecas adicionais, blur, gradientes ou sombra decorativa.
Menu mobile preservado com quatro idiomas. A troca mantém a página equivalente e o ponto de leitura. Escape devolve o foco; clique externo e saída de foco fecham o seletor. Links funcionam sem JavaScript.

## Precisão e privacidade
Galeria, imagens, dimensões, datas, correções de títulos e estudos de campo não são alterados. Espanhol usa a mesma seleção pública do currículo, sem escolaridade, nascimento, nome civil completo, endereço residencial ou contatos. O PDF administrativo não é publicado.
Os filmes originais permanecem os mesmos; não foram criadas dublagens, transcrições ou legendas audiovisuais inexistentes. O suporte técnico a um PDF espanhol não gera um arquivo fictício.
`editorialReview.es` permanece false: cobertura técnica não equivale à aprovação editorial independente de um falante nativo.

## Auditoria e publicação
Gates: `npm run verify`, `npm run design:spanish`, `npm run design:apple`, `npm run design:navigation`, `npm run design:locales`, `npm run design:curriculum`.
Após publicação: comparação HTTP/SHA-256 do manifesto e testes de espanhol e idiomas no domínio real. Relatório consolidado em `docs/audits/2026-09-08-spanish-selector.json` e recibo de publicação na PR #1.
A revisão encontrou e corrigiu fechamento prematuro por Tab: o seletor agora usa `focusout.relatedTarget`, em vez de observar `activeElement` durante a transição de foco. O auditor também passou a enviar o texto de Enter no CDP, para exercitar a ativação nativa de verdade.
Preservar main, DNS, HTTPS, política noindex e gates de lançamento. Sem merge. Emulação de navegador não é teste em aparelho físico/leitor de tela nem certificação Apple/WCAG.
