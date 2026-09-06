# 01 · Direção visual

## Conceito: galeria, não aplicativo
O conteúdo é a arte de Renata. A interface funciona como a parede de uma exposição: ordem, silêncio visual e boa leitura. A inspiração Cosmos está na descoberta por imagens e no agrupamento de conteúdos, não na cópia de seu layout, marca ou acervo.

**Decisão:** grade editorial de projetos na página principal + visualizador de imagens grandes dentro de cada projeto. Não usar um único carrossel como a única forma de descobrir o portfólio: isso esconderia toda a seleção atrás de sucessivos cliques.

## Princípios adaptados da SSSOM
A skill Müller-Brockmann foi lida, junto de Hallmark, AGENTS, Constituição Art. 6 e guardrails de gesto mobile. Aplicar grid verificável, ritmo de 8px, hierarquia por escala/peso/espaço e microinterações discretas. Não portar backend, React ou dependências da SSSOM apenas por associação visual.
A cópia local consultada não foi confirmada como master atualizado. A proveniência exata está em `06-fontes-e-decisoes.md`; não declarar leitura de uma skill Apple de nome diferente sem evidência.

## Sistema visual proposto
| Elemento | Decisão |
|---|---|
| Fundo | Branco `#FFFFFF`; cinza `#F6F6F6` somente em suportes de interface |
| Texto | Grafite `#171717`; secundário `#626262` |
| Separadores | `#E7E7E7`; nunca uma moldura pesada em cada pintura |
| Cor de destaque | Grafite; as cores das obras são os verdadeiros destaques |
| Títulos | Outfit, pesos 500–600, proposta sujeita à composição com as imagens |
| Corpo | Plus Jakarta Sans, pesos 400–500, tamanho confortável |
| Fontes nesta fase | Somente fallbacks declarados; nenhum arquivo de fonte foi copiado ou distribuído |
| Texto | Alinhado à esquerda; coluna de release até 64 caracteres de largura aproximada |
| Cantos | UI 12–16px; fotografias das obras sem máscara que corte as extremidades |
| Sombras | Ausentes nas pinturas; muito suaves somente onde houver sobreposição funcional |
| Cabeçalho | Nome tipográfico, navegação curta; sem logo inventado |

Não usar gradiente azul/roxo, fundo creme genérico, textura falsa de papel, brilho sobre a arte, moldura digital pesada, cursor personalizado, animação 3D ou carrossel em autoplay.

## Grade estrutural
Desktop >= 1024px: 12 colunas, gutter 24px, margem 48px; largura útil máxima 1392px dentro de um invólucro de 1488px. Tablet 768–1023px: 8 colunas, gutter 24px, margem 32px. Mobile <768px: 4 colunas, gutter 16px, margem 16px. Baseline 8px; espaçamentos em múltiplos de 8px. Tokens são a fonte única dos valores.

Título, release, retrato, vídeo, galeria e rodapé compartilham as mesmas linhas de coluna. Subgrid pode ser usado com fallback explícito. Um overlay de desenvolvimento deve ficar no mesmo contêiner do conteúdo; não pode ficar ativo para visitantes por padrão.

## Conflitos resolvidos
Hallmark admite gradientes e cantos generosos; aqui a contenção da grade e a integridade das obras prevalecem. A skill Müller exemplifica correção óptica por mutação `.style`; não copiar essa técnica: os guardrails de frontend prevalecem. Fazer ajustes ópticos por CSS verificado, somente quando necessários. Uma imagem de arte não será cortada nem deformada para obedecer à baseline; alinhar o módulo/suporte, preservando a imagem inteira dentro dele.
