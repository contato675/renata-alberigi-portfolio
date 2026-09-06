# Regras deste repositório

## Escopo e isolamento
Este projeto pertence a Renata Alberigi. Não alterar SSSOM, Aplanta, worktrees, processos ou branches de outros projetos. Ler os seis documentos em `docs/` antes de implementar. A fase atual é planejamento/scaffold, não lançamento.

## Conteúdo
Usar a biografia aprovada em `site/content/artist.json`. Não inventar obras, imagens, títulos, datas, técnicas, prêmios, dimensões ou traduções aprovadas. Dados ausentes permanecem null. Fotografias de obras não podem ser substituídas por imagens geradas por IA.
Não publicar telefone, endereço residencial, data completa de nascimento, metadados GPS, dados de clientes, documentos ou arquivos originais de ateliê. Acesso ao código ou habilidade de publicar não equivale à aprovação de divulgar um arquivo privado.

## Design e implementação
Seguir grade 12/8/4, baseline 8px, tipografia alinhada à esquerda, foco visual nas obras. Não reproduzir visual de dashboard, gradientes de IA ou feed com métricas sociais. Respeitar proporções e cores das obras. Preferir CSS a bibliotecas de animação.
Redução de movimento é obrigatória. Scroll vertical mobile não pode ser capturado por gesto ambíguo. Modal exige teclado, Escape e restauração de foco. Alvos de toque mínimos de 44px.
Não copiar skills privadas ou código de terceiros com licença não confirmada para este repositório. Implementar os princípios, não transplantar o aplicativo SSSOM.

## Segurança e publicação
Sem scripts inline, eval, innerHTML com conteúdo, credenciais ou backend. Paths locais relativos, com suporte a subdiretório de Pages. Dependências só quando justificadas e pinadas. Sem symlinks ou Git LFS no conteúdo de publicação.
Não ativar publicação automática nesta fase. Não mudar repositório para público sem autorização. Não fazer merge por conta própria. Fazer implementação em branch própria; criar PR com provas.

## Gates
`npm run verify`; testes visuais e de acessibilidade da matriz descrita em `docs/05-implementacao-e-aceite.md`; `npm run check:publish` somente na fase final. Registrar resultados reais e distinguir teste automatizado, inspeção visual e pendências. Não afirmar conformidade WCAG completa sem auditoria.
