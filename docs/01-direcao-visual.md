# 01 · Direção visual — Apple-like + Müller

## Autoridade escolhida
Substituição integral da direção anterior: a régua passa a ser a auditoria Apple-like, mantendo a grade Müller solicitada. Fonte verificável: `docs/design-system/STUDIO_KIT_PLATFORMS.md` e matriz de auditoria de design da SSSOM no master `f4e913efc377e13419c19bfb4199940b6469f431`. Não existe neste projeto uma alegação de leitura da skill ausente `apple-interface-premium`.

Apple-like significa hierarquia, clareza, resposta, consistência e contenção — não copiar o site da Apple ou revestir a galeria de vidro. A arte fornece a personalidade. Blur, sombras decorativas, gradientes, grandes cartões administrativos, contadores sociais e movimento ornamental não pertencem à composição.

## Composição
Galeria editorial branca com retrato/release, vídeo em destaque e grade de projetos. Cada projeto abre um visualizador e possui também uma página estática completa. A grade permite descobrir a seleção; o visualizador aprofunda uma obra sem esconder as demais em um único carrossel global.

| Elemento | Contrato |
|---|---|
| Fundo | Branco #FFFFFF; apoio funcional #F6F6F6 |
| Texto | Grafite #171717; secundário #626262 |
| Divisórias | #E7E7E7, discretas; não delimitam o foco sozinhas |
| Tipografia | Stack de sistema: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif |
| Hierarquia | Escala/peso/espaço, títulos de peso 500; sem fonte proprietária distribuída |
| Corpo | 16px base, entrelinha 24px; aceita preferências de tamanho do usuário |
| Controle | Alvo mínimo 44 CSS px, foco visível, estado coerente |
| Movimento | Controles 150ms; overlay 220ms; redução de movimento obrigatória |
| Fotografias | Proporção original, sem recorte de bordas, tint, máscara, brilho ou sombra |

## Grade verificável
Mobile <768: 4 colunas, gutter16, margem16. Tablet 768–1023: 8 colunas, gutter24, margem32. Desktop >=1024: 12 colunas, gutter24, margem48. Invólucro máximo1488; baseline de8px. Títulos, texto, retrato, vídeo, galeria e ficha se posicionam pelas mesmas linhas.
Os guias de desenvolvimento vivem na mesma caixa CSS do conteúdo e leem os mesmos tokens. Botão/tecla G somente no preview. Acima e abaixo da largura máxima, a auditoria mede aderência das bordas às colunas.

A composição não deforma uma pintura para encaixá-la na baseline. A imagem conserva sua proporção; o suporte e os espaços adotam o ritmo. O aumento de texto acessível também prevalece sobre uma baseline rigidamente fixa. Observações ópticas de glifos são registradas no navegador com a fonte realmente carregada, não corrigidas por mutação `.style` nem usadas como falsa prova de perfeição estética.

## Revisão obrigatória
Aplicar a régua da skill local original `apple-like-design-audit` a TODA a galeria, incluindo estados vazio, carregado, detalhe, visualizador, vídeo e troca de idioma. A composição final precisa de inspeção com as fotografias reais, não só retângulos de calibração.
