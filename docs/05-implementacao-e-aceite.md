# 05 · Implementação e aceite

## Implementado nesta fatia
EN primeiro + PT-BR, fontes/textos separados, release traduzido, HTML estático completo, páginas de obras, visualizador progressivo, vídeo por clique/transcrição, geração llms/Markdown/robots/sitemap/JSON público, validação fail-closed e auditoria Apple-like reproduzível. O cadastro de obras continua vazio; fotografias não são inventadas para preencher a tela.
Branch própria; PR para main sem merge. Não considerar publicação, conteúdo final ou PDF entregues.

## Contratos obrigatórios
A1. Sem overflow em320/390/480/768/1024/1440/1920 e reflow/zoom200% revisado antes de lançamento.
A2. Grade12/8/4 real; overlay na mesma caixa; bordas de módulos alinhadas; observação óptica separada do teste de caixa.
A3. Pinturas completas sem crop/deformação/tint; dimensões e alt bilíngue.
A4. Alvos44px, foco/nome acessível, h1 por rota, DOM e ordem visual coerentes; contraste mínimo de projeto4.5:1 em texto normal.
A5. Dialog: abrir/avançar/voltar/fechar/Escape/foco/posição/Back/Forward; uma foto sem setas inúteis.
A6. Scroll vertical sobre assets não bloqueado. Swipes reais iOS/Android e gestos ambíguos revisados.
A7. Reduced motion; nenhum autoplay ou animação decorativa sobre arte.
A8. Iframe de vídeo só após clique; título/transcrição/fallback corretos.
A9. EN na entrada, PT-BR explícito; links preservam equivalência; sem browser-language redirect; títulos originais mantidos quando necessário.
A10. HTML/Markdown/schema equivalentes, páginas sem JS, canonicals/hreflang/llms corretos, drafts excluídos inclusive de arquivos estáticos.
A11. Robots efetivo na raiz verificado; llms não é promessa de ranking, seleção, copyright ou bloqueio universal de treinamento.
A12. Ausência de segredo/original/GPS/LFS/artefato de teste no build. Sem scripts executáveis inline, eval ou afrouxamento CSP.
A13. PDF só aparece quando existir; precisa de diagramação/revisão própria.
A14. Registrar LCP/CLS/INP quando houver medições válidas; testes de laboratório não equivalem a métricas de campo.
A15. Autorizações, gates e HTTP de publicação comprovados antes de afirmar site online.

## Gates
`npm run verify` = conteúdo + testes + build preview. `npm run design:apple` = matriz de navegador e interações; relatório com pendências humanas. `npm run check:publish` e `npm run build:release` devem recusar o estado atual.

## Ainda necessário antes do lançamento
Fotografias reais/retrato, vídeo/capa/transcrição, seleção final, revisão inglesa, PDF, inspeção cromática/editorial de cada projeto, VoiceOver/TalkBack, toque e zoom em dispositivos, desempenho e autorização de hospedagem/root robots. Nenhuma pendência pode ser fechada por fixture ou booleano ajustado para passar teste.
