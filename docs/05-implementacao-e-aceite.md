# 05 · Implementação em lotes e critérios de aceite

## Entrega atual — fase 0
Planejamento visual e técnico; repositório independente; dados da artista; pastas de mídias; tokens 12/8/4; template de estrutura sem obras fictícias; validação, build e preview locais. Não confundir scaffold com site final. Sem deploy e sem PDF final nesta fase.

## Próximos lotes
| Lote | Entrega | Dependências |
|---|---|---|
| 1 — Composição | Header/hero/release/grid, tipografia final, estados sem mídia e responsividade | Aprovação do plano + retrato/obras para composição real |
| 2 — Exibição | Modal/carrossel por projeto, ficha, teclado, deep link, swipe mobile seguro, vídeo com clique | Registros e imagens aprovados |
| 3 — Conteúdo final | Tratamento/exportação de mídia, inglês revisado, seleção editorial, PDF | Material da artista e validação textual |
| 4 — Qualidade/publicação | Gates funcionais/visuais, SEO, deploy Pages, conferência da URL e links | Autorização de publicação/visibilidade |

Desenvolver em branch `feat/portfolio-premium`, abrir PR, não fazer merge sem autorização. Não aplicar alterações ao app SSSOM.

## Critérios verificáveis
A1. Nenhum overflow horizontal em 320/390/480/768/1024/1440/1920px e zoom 200%.
A2. Títulos, retrato, vídeo e galeria compartilham colunas reais. Validar overlay dentro do mesmo max-width em larguras menores e maiores que o contêiner.
A3. Proporções completas e cores das obras preservadas, sem recortes automáticos ou imagem sintética.
A4. DOM, teclado e ordem visual equivalentes. Alt/texto/ficha/legendas aprovados.
A5. Abrir, avançar, voltar, fechar, Escape e retorno de foco do viewer funcionam. Projeto com uma única imagem não mostra controle inválido.
A6. Scroll vertical iniciado sobre cada card funciona no celular; swipe lateral deliberado não dispara clique extra; gestos ambíguos não travam página.
A7. Reduced motion remove movimento não essencial. Nenhum autoplay audiovisual.
A8. Vídeo só carrega terceiro após clique; fallback abre link correto. Não publicar iframe quebrado.
A9. Rotas/hash, refresh e assets funcionam no subdiretório real de Pages. ID inválido tem saída segura.
A10. Nenhum original privado, GPS, telefone/endereço completo, credencial, fonte sem licença, dado de outro projeto ou LFS no deploy.
A11. PDF é diagramado para páginas, imagens nítidas e links clicáveis; não uma captura do site. Botão só existe quando arquivo for real.
A12. Registrar LCP/CLS/INP quando houver dados adequados; usar Lighthouse/lab como diagnóstico, não afirmar p95 real com uma única rodada. Alvos iniciais de projeto: LCP <=2,5s; CLS <=0,1; INP <=200ms em campo quando houver amostra. Medição real pendente.
A13. Checklist de publicação aprovado; evidência de deploy e HTTP; não declarar página online antes da conferência.

## Matriz de regressão
Desktop mouse+teclado; mobile toque; tablet; orientação paisagem; 200% zoom; leitor de tela/semântica; vídeo indisponível; foto indisponível; conexão lenta; prefers-reduced-motion; hash conhecido/desconhecido; back/forward; PDF disponível/ausente.

## STOP conditions
Não inventar conteúdo para fechar um gate. Não enfraquecer CSP/segurança para acomodar animação. Não converter o repo para público nem publicar sem autorização. Não misturar branches de outros projetos. Pendências devem ser registradas, não marcadas como testes passados.
