# Renata Alberigi — portfólio de arte visual

**Fase 0 · Planejamento e estrutura inicial · 6 de setembro de 2026.**
Repositório independente e privado. GitHub Pages ainda não ativado. Isto não é o site final.

## Direção escolhida
Galeria editorial branca, grade Müller-Brockmann e acabamento Apple-like adaptado dos princípios de design da SSSOM. Perfil/release + vídeo em destaque + grade de projetos. Cada projeto abre uma galeria própria, com imagens grandes e ficha da obra. A implementação dessas interações pertence à próxima fase.

## Comece por aqui
- [Plano visual](docs/01-direcao-visual.md)
- [Layout, movimentos e mobile](docs/02-layout-interacoes-mobile.md)
- [Conteúdo e armazenamento](docs/03-conteudo-e-midias.md)
- [GitHub Pages e publicação](docs/04-github-pages.md)
- [Plano de implementação e aceite](docs/05-implementacao-e-aceite.md)
- [Portfólio PDF](pdf/README.md)
- [Fontes e decisões](docs/06-fontes-e-decisoes.md)

## Estrutura
`site/` contém template, tokens e conteúdo. `schemas/` contém o contrato das obras.
`scripts/` contém validação, build e servidor local, sem dependências externas.
`docs/` não é publicada no site. `dist/` é gerada e não deve ser versionada.

## Verificar e visualizar
Requer Node.js 22 ou superior. Não precisa de `npm install`.
```sh
npm run verify
npm run preview
```
Abra o endereço local informado pelo servidor. A página exibida é uma estrutura de revisão, com campos de mídia explicitamente pendentes, não uma simulação com obras inventadas.

## Conteúdo pendente
Retrato; vídeo e sua capa; seleção de obras com fotografias, títulos, anos, técnicas, dimensões e textos alternativos; PDF final. A biografia aprovada em português já foi incluída. A versão em inglês depende de revisão.

## Publicação deliberada
`npm run check:publish` deve falhar nesta fase. Não trocar a visibilidade do repositório nem ativar Pages sem autorização. Nenhuma chave/API, banco de dados, serviço de IA, original de ateliê ou arquivo privado da SSSOM faz parte do site.
