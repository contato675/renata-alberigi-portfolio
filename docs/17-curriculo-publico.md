# 17 · Currículo artístico público — 08/09/2026

## Conteúdo e rotas
Página independente com cinco seções: direção de arte e projetos (4 registros), ações educativas e culturais (6), instalações e exposições (10), pinturas selecionadas (10) e percurso de ANALOGIAEU (4).
English: `/cv/`. Português: `/pt-br/curriculo/`. Français: `/fr/cv/`.
Cada rota possui HTML completo, `index.md` e `curriculum.json`. Menu global e biografia da home oferecem acesso no idioma correspondente.
Fonte: `site/content/curriculum.json`, selecionada do currículo confirmado pela artista. As oito pinturas com páginas existentes conservam seus links; Nibia e Vale do Capão permanecem registros textuais. Nibia não recebe dimensão presumida.

## Privacidade e precisão
O currículo público não inclui escolaridade, cursos de formação, nome civil completo, nascimento, residência, telefone, e-mail, retrato ou informações familiares. O PDF privado não é publicado.
Atividades educativas profissionais permanecem; não são dados de escolaridade. O estudo de campo de Vale do Capão (2019) é informação da obra, não residência.
A projeção HTML/Markdown/JSON usa somente os campos públicos selecionados, sem copiar a biografia ou os contatos completos. As demais páginas mantêm a biografia e os contatos preexistentes.
ANALOGIAEU preserva rascunhos de 2014, pintura em ateliê em 2015–2017, lançamento em 3 de junho de 2017 e continuação durante instalações até 2018. MAV e FIA constam em 2018; FIA é exposição coletiva.

## Design e funcionamento
Skill original Apple-like do projeto, grade compartilhada 12/8/4, ritmo de 8 px, datas separadas das descrições, índice nativo, espaçamento ampliado e alvos de pelo menos 44 px. CSS próprio apenas nas páginas do currículo.
Navegação e conteúdo completo também sem JavaScript; idiomas preservam a página equivalente e a seção de leitura. Não há nova dependência nem alteração das fotografias ou das páginas de obras.

## Evidências e publicação
Executar `npm run verify`, `npm run design:curriculum`, `npm run design:apple`, `npm run design:navigation` e `npm run design:locales`. Repetir o currículo ao vivo com `node scripts/audit-curriculum.mjs --live`.
Relatório: `docs/audits/2026-09-08-public-curriculum.json`. Evidência da publicação na PR #1. Preservar main, domínio, HTTPS e noindex; publicar somente pelo fluxo existente, sem merge.
Limites: emulação de navegador não substitui testes em aparelhos físicos ou com usuários de leitores de tela; não há certificação Apple/WCAG. Revisão editorial independente de EN/FR permanece pendente.
