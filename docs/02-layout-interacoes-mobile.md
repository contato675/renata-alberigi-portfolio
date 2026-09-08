# 02 · Layout, movimento e mobile

## Ordem editorial em EN e PT-BR
Header com nome, obras/vídeo/sobre e troca EN/PT. Hero com nome, introdução curta, localização resumida e retrato quando fornecido. Vídeo com capa e transcrição, somente após clique. Grade de projetos; release em três parágrafos; processo quando aprovado; contato e PDF somente se existir.
A entrada é em inglês; português em `pt-br/`. Conteúdo editorial vem do mesmo cadastro e a ordem não muda entre idiomas.

## Grade de projetos
Uma coluna em celulares; duas em tablets; três em desktop. Cada projeto ocupa quatro colunas do grid estrutural, sem masonry que reordene o DOM. Fotos preservam altura natural. Título/técnica/ano aparecem como texto, nunca só em hover. Não há dados de curtidas, seguidores ou venda inventados.
A capa é um link real para `works/<id>/` (ou `pt-br/works/<id>/`). JavaScript melhora esse link com um dialog; não é requisito para ler ou navegar pelo acervo.

## Visualizador
Dialog nativo, imagem em contain, ficha completa, indicador de posição, anterior/próxima e fechar. Uma única imagem não recebe paginação. Escape fecha e devolve foco/posição à capa. Back fecha e Forward reabre; a URL preserva um hash de projeto. A página permanente expõe todas as fotos e fichas ao crawler e ao visitante sem script.
Native CSS scroll-snap mantém o gesto horizontal sem impedir a rolagem vertical da página. Não usar touchmove/pointermove com preventDefault nem touch-action pan-x exclusivo. A validação final de gesto precisa também de iOS/Android reais.

## Responsividade e Apple-like
Conteúdo empilhado no mobile, sem reduzir a biografia a uma coluna estreita. Alvos de44px, botões nomeados, foco consistente e navegação por teclado. UI clara e estável antes de movimento; não há entrada artificial que esconda o first paint, parallax, autoplay ou card levantando sobre as pinturas.
Movimento de controle150ms, overlay220ms, sem animação essencial; preferência reduced-motion remove animação/transição e scroll suave. O navegador continua permitindo zoom.

## Vídeo e ausência de mídia
Sem iframe/requisição de player antes do clique. A transcrição bilingue existe em HTML e Markdown. Não simular capa, vídeo, retrato ou obra inexistente. O preview nomeia a ausência; release não passa enquanto o material obrigatório estiver ausente. Links externos abrem com rel seguro; não adicionar formulário sem backend.

## Testes
Matriz 320/390/480/768/1024/1440/1920px em EN e PT, estados atual e fixture isolada. Verificar colunas, controles, contraste, mídia, dialog, foco, histórico, reduced motion, detalhe sem JS e player sob consentimento. Capturas, resultados e limites em docs/09.
