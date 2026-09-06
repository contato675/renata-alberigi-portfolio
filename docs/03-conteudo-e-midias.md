# 03 · Conteúdo e armazenamento

## O que já existe
Biografia aprovada em português em `site/content/artist.json`; nome Renata Alberigi, localização resumida e e-mail informado na conversa. `works.json` começa vazio. Retrato, vídeo, PDF e fotos de ateliê são null ou listas vazias. Não há acervo fictício.

## Onde adicionar as imagens
```text
site/assets/images/
  perfil/                      retrato de apresentação
  obras/<slug-da-obra>/         capa, obra inteira, detalhes, instalação
  processo/                    ateliê e processo aprovados
  video/                       capa do vídeo em destaque
site/downloads/                PDF final otimizado
```
`<slug-da-obra>` é uma pasta descritiva, em minúsculas, sem espaços ou acentos. Ex.: usar o título real depois de confirmar a obra; não preencher a galeria com exemplos inventados.

Cada obra tem um registro em `site/content/works.json`, validado pelo contrato de `schemas/work.schema.json`. Campos: id, título, ano/intervalo, técnica, dimensões (texto), descrição, categoria, imagens e índice da capa. A posição na lista determina a ordem editorial. Cada imagem tem path relativo, alt, width e height obrigatórios; legenda é opcional. Registro só pode ficar published quando a artista aprovar as fotografias e a ficha.

## Entrega de mídia recomendada
- Retrato: foto vertical em boa resolução, sem corte definitivo obrigatório.
- Obra: uma foto frontal da peça completa + detalhes úteis. Fotografia de instalação quando existir.
- Informação: título, ano, material/técnica, altura x largura, série, descrição e crédito fotográfico quando aplicável.
- Vídeo: link direto, título, duração e capa, sem arquivo pesado neste Git.

## Exportação para web — alvos editoriais, não limites do GitHub
Manter um original privado fora do repositório. Criar versões 640/1280/1920px e, para ampliações necessárias, até 2560px no lado longo. WebP ou JPEG de alta qualidade; AVIF opcional após conferir fidelidade e compatibilidade. Preservar cores corretas em sRGB; converter com gestão de cor, não remover perfil antes da conversão. Nunca alterar textura/pincelada por IA.
Alvos iniciais: miniatura ~80–200KB; imagem de galeria ~200–700KB; ampliação ~500KB–1,5MB, ajustando à complexidade da obra. Estes valores são metas de desempenho a verificar, não compressão obrigatória às custas da qualidade.
Remover GPS e metadados pessoais das cópias de web, sem remover créditos aprovados da ficha. Não adicionar RAW, PSD, PSB, TIFF, vídeos master, documentos ou backups.

## GitHub como repositório de mídia pública
Sim, as imagens otimizadas podem ficar no próprio GitHub e ser servidas pelo Pages com o site. Isso não é um painel de upload nem um bucket privado com URLs protegidas. Tudo enviado para o site público poderá ser visualizado e baixado. Bloquear botão direito não oferece proteção real; não implementar.
O histórico Git conserva versões, portanto trocar/apagar uma imagem em um commit não torna a cópia anterior automaticamente privada. Evitar substituições frequentes de originais grandes.

## Como atualizar depois
No computador, colocar arquivos nas pastas e editar o JSON; rodar verify; revisar em preview; commit/push da branch; PR; publicação após aprovação. Pelo navegador do GitHub, usar Add file > Upload files dentro da pasta, depois editar o registro JSON. Um administrador visual não faz parte desta fase.

## Limites oficiais consultados em 06/09/2026
Upload pelo navegador: até 25MiB por arquivo. Git avisa acima de 50MiB e GitHub bloqueia acima de 100MiB. Pages: site publicado até 1GB; banda mensal soft de 100GB. Git LFS não é compatível com GitHub Pages. Fontes oficiais em `06-fontes-e-decisoes.md`.

## Quando evoluir o storage
Usar GitHub para a pequena seleção editorial. Considerar storage de objetos separado apenas se surgir acervo volumoso, atualização frequente, upload administrável ou vídeo hospedado. Não criar contas, custos ou integrações de storage agora.
