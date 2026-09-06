# 02 · Layout, movimento e comportamento mobile

## Ordem da página
1. Cabeçalho: Renata Alberigi; Obras, Vídeo, Sobre e Contato. PDF só aparece quando existir. Idioma só aparece quando a tradução estiver revisada.
2. Apresentação: nome, Artista visual brasileira, localização resumida, introdução curta, link Ler apresentação completa e retrato.
3. Vídeo em destaque: uma capa real e ação Assistir. Título, duração e contexto quando fornecidos.
4. Obras selecionadas: grade editorial, cada card representa uma obra ou projeto, não cada foto de detalhe.
5. Sobre: release completo em três parágrafos e trajetória selecionada com datas reais.
6. Ateliê/processo: bloco opcional; só aparece quando houver fotos pertinentes aprovadas.
7. Contato e PDF: e-mail, links oficiais informados e arquivo de portfólio quando pronto.

## Wireframe desktop (12 colunas)
```text
| Nome                         Obras  Vídeo  Sobre  Contato |
|---------------------------------------------------------|
| 01 — ARTISTA                                            |
| Renata Alberigi                  | Retrato               |
| Introdução + localização         | 4 colunas             |
| Ler apresentação completa        |                       |
| 7 colunas + 1 coluna de respiro   |                       |
|---------------------------------------------------------|
| 02 — VÍDEO                                              |
|           Capa panorâmica real + assistir                |
|---------------------------------------------------------|
| 03 — OBRAS SELECIONADAS                                  |
| [projeto A, 4 cols] [projeto B, 4 cols] [projeto C, 4 cols]|
| [projeto D, 8 cols, destaque editorial] [projeto E, 4 cols]|
|---------------------------------------------------------|
| 04 — SOBRE           | Release completo                  |
| 4 colunas            | 8 colunas                        |
|---------------------------------------------------------|
| Contato                                  PDF (quando pronto)|
```
A, B, C etc. representam posições, não obras reais ou títulos sugeridos.

## Hero e release
O retrato não será avatar circular: será uma fotografia editorial, preferencialmente vertical, com enquadramento aprovado. Evitar heros de 100vh que escondem todas as obras. A apresentação curta é de apoio; o release integral permanece acessível em Sobre, sem ser repetido duas vezes inteiro. O link para Sobre leva à seção, não abre um segundo modal.

## Galeria
Desktop: três colunas de projetos, com possibilidade de uma obra-chave ocupar oito colunas; tablet: duas; mobile até 479px: uma; 480–767px: duas somente quando imagens e legendas continuarem legíveis. A ordem editorial deve ser igual no DOM, no teclado e visualmente. Não usar grid-auto-flow:dense ou masonry que reordene a leitura.
Usar a proporção original da obra e, quando necessário, um suporte neutro com object-fit:contain. Não padronizar tudo em quadrados nem cortar as bordas da pintura. Título/ano/técnica permanecem visíveis; nada essencial exclusivamente no hover. Um indicativo discreto mostra quantas imagens existem no projeto, quando >1. Filtros só entram quando houver volume e categorias úteis; não criar categorias vazias.

## Visualizador de projeto
Clique/toque na capa abre dialog modal identificado pelo título da obra. Desktop: imagem ocupa a maior parte da janela, ficha em painel lateral de até 320px; mobile: imagem acima e ficha abaixo, com rolagem dentro do dialog. Imagem sempre em contain. Oferecer Fechar, Anterior, Próxima e contador, com rótulos acessíveis. Miniaturas opcionais. Uma única imagem não ganha setas desnecessárias.
Sequência sugerida: obra inteira, detalhes, contexto da instalação, processo. Não misturar fotos de projetos diferentes no mesmo carrossel. Sem troca automática de slide.
Teclado: Tab confinado ao modal, Escape fecha, setas navegam somente quando não estão em campo/controle com semântica própria; foco volta ao card inicial. Fundo não interativo enquanto aberto. Fechar não perde a posição da página. Gestos e pinça nativos não devem ser desabilitados.
V1 pode usar um hash do projeto (`#obra/slug`) para deep link estático; Voltar do navegador fecha o viewer. ID desconhecido exibe estado neutro e saída clara, não erro bruto. Não usar rotas que quebrem com refresh no Pages.

## Vídeo
Nenhum autoplay. Carregar player de terceiro somente após clique; antes, imagem de capa local e botão. Preservar a proporção real (16:9 apenas quando o vídeo for 16:9). Oferecer link direto como fallback. Legendas quando disponíveis. Não hospedar vídeo pesado neste repositório.

## Movimento
| Interação | Proposta |
|---|---|
| Links/botões | Cor/opacidade 160ms; feedback de clique discreto |
| Entrada de seções abaixo da dobra | Opacidade + deslocamento máximo de 8px, 240ms, uma vez |
| Abrir/fechar viewer | Opacidade 200–240ms; sem salto de zoom agressivo |
| Trocar imagem | Transição curta, reservando dimensões para evitar deslocamento |
| Reduced motion | Sem translação, smooth scroll ou efeitos de escala; ações imediatas |

Não animar todas as propriedades com transition:all. Não esconder conteúdo inicial aguardando animação. Sem scroll hijacking, parallax permanente, loops decorativos ou cursor falso.

## Mobile e acessibilidade
Conferir 320, 390, 480, 768, 1024, 1440 e 1920px. Em 320px, nome e navegação não causam scroll horizontal. Respeitar safe-area e altura dinâmica da tela no modal. Controles >=44px. Não bloquear zoom de página. Imagens com width/height, alt descritivo e srcset/sizes. Abaixo da dobra: lazy loading; imagem principal não é lazy.
Scroll vertical começando sobre obra/miniatura continua funcionando. Swipe horizontal só captura gesto após intenção lateral clara; gestos ambíguos não chamam preventDefault. Esta regra foi retirada dos guardrails mobile da SSSOM.
