# 11 · Revisão editorial, navegação mobile e coleção RUADOFLOW

## Escopo solicitado em 06/09/2026
Mesma PR #1, sem merge e sem alterar outros repositórios. Atualizar o preview público já autorizado; não transformar a revisão visual em aprovação de lançamento/indexação. Retirar a etiqueta visual de preview não muda o `noindex`.

## Checklist de conteúdo — implementado e coberto por testes
- [x] Amor incondicional: óleo sobre tela, 100 × 80 cm.
- [x] Ponte nova: óleo sobre tela, 120 × 80 cm.
- [x] Maternidade: óleo sobre tela, 100 × 80 cm.
- [x] Maternidade 1: acrílica e giz pastel sobre tela, envernizada, 100 × 80 cm.
- [x] Lar: acrílica e giz pastel sobre tela, envernizada, 100 × 120 cm.
- [x] Áureo: acento no Á; óleo sobre tela, 40 × 60 cm.
- [x] ANALOGIAEU part4: óleo sobre tela, 100 × 80 cm.
- [x] Correnteza: óleo sobre tela, 70 × 100 cm; ano corrigido para 2022.
- [x] ANALOGIAEU: acrílica sobre tela, 130 × 800 cm.
- [x] Digitais 02–11: Renascida, Fluir, Balanço, Alexandrina, Nara, Nadine, Sol, Fernanda, Raio Rubi, Capa do Disco de Rap. Títulos originais preservados nos dois idiomas; retirados os avisos de identificação provisória dessas obras.
- [x] Contato alterado para estudiorenascida@gmail.com em HTML, Markdown e JSON.
- [x] Resumo português substituído pelo texto fornecido e versão inglesa equivalente.
- [x] Localização termina em Brasil/Brazil, conforme o idioma.
- [x] Foto substituída pelo arquivo “nova foto de perfil.jpg”; cópias WebP com nome derivado do hash para evitar cache antigo. Original preservado e metadados pessoais removidos das cópias.

**Medidas:** a unidade cm foi adotada para as linhas sem unidade, seguindo a convenção da lista do usuário. A ordem dos valores foi preservada, sem inferir altura/largura. O número 800 em ANALOGIAEU foi mantido; não foi reduzido para 80 nem convertido a partir do histórico. Essa medida merece conferência editorial, mas não foi corrigida por suposição.
A página de Correnteza usa `correnteza-2022`; a URL antiga permanece como alias de conteúdo atualizado, com canonical/hreflang para 2022. Os nomes dos arquivos de imagem anteriores são identificadores estáveis, não metadados de data.

## Checklist visual
- [x] Nome duplicado removido do cabeçalho; título principal preservado.
- [x] Aviso “Preview do portfólio · Revisão editorial” removido da interface.
- [x] Botão e atalho público de grade removidos. O auditor ainda consegue medir a grade sem oferecer esse controle ao visitante.
- [x] Abaixo de 1024 px: botão Menu com ícone; drawer com navegação e idiomas.
- [x] Drawer com Escape, Tab/Shift+Tab, foco restaurado, fechamento no fundo/ao selecionar seção e ao passar para desktop; menu nativo alternativo sem JavaScript.

## Brand Design Collection — RUADOFLOW
- [x] Um único projeto, em seção própria imediatamente após as pinturas digitais.
- [x] 66 imagens organizadas em uma linha horizontal, sem rotação automática.
- [x] Anterior/próxima, contador de intervalo visível e rolagem nativa; rolagem vertical preservada.
- [x] Clique em uma imagem abre essa posição no visualizador completo; Open project page abre todas as imagens em uma página estática própria.
- [x] Página completa responsiva, com 1/2/3 colunas, 66 imagens, ampliação individual e navegação sem JavaScript.
- [x] Período 2024–2025 e descrição bilíngue do trabalho de Renata para a marca. O lançamento oficial no site da marca é informação fornecida pelo usuário, não uma data independente inventada nem uma integração de loja.
- [x] 288.199.925 bytes de originais lidos sem alteração; 21.397.762 bytes em cópias WebP principais + miniaturas. Originais não enviados ao GitHub.
- [x] Coleção distinta nos índices Markdown/llms/JSON; CreativeWork com gênero de design, não classificada como pintura a óleo, produto à venda ou Offer.

## Manutenção e testes
O importador inicial agora recusa um catálogo preenchido, para não apagar posteriormente os títulos e as especificações revisados. O comando de testes está restrito a `tests/*.test.mjs`; scripts operacionais ignorados em artifacts não podem ser executados por descoberta acidental do runner.
Recursos CSS/JS receberam versão de URL e a fotografia um nome por hash. Não é necessário publicar originais nem desativar caches do navegador.

Comandos: `npm run verify`, `npm run design:apple`, `npm run design:navigation`, `npm run design:brand`, `npm run design:media`. Os resultados finais e hashes da fonte são registrados em `docs/audits/2026-09-06-revision-*.json` após a execução. Conferência HTTP pós-deploy é independente dos testes locais.
Inspeção visual inclui abertura EN desktop, PT mobile, drawer PT e a coleção RUADOFLOW EN desktop; outras capturas ficam em artifacts locais. Screenshots nunca incluem tokens, histórico do navegador pessoal ou arquivos originais.

## Limites não confundidos com conclusão desta revisão
Permanecem a produção do PDF, revisão editorial humana final do inglês, transcrições dos vídeos, validação cromática em monitor da artista, aparelhos físicos/tecnologias assistivas e política efetiva de robots na raiz. Nenhum gate de lançamento é dispensado pela retirada do aviso de preview.

## Resultado final local

`npm run verify`: 84 testes, zero falhas; build com 383 arquivos. Auditoria Apple-like: 28 layouts + 9 interações, zero falhas. Menu: 24 verificações; coleção RUADOFLOW: 11; mídia real: 47 — todas passaram. As medições e hashes estão nos cinco relatórios `revision-*.json`. A validação de publicação final continua separada.
