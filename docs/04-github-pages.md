# 04 · GitHub Pages e publicação

## Estado da fase 0
Repositório: `contato675/renata-alberigi-portfolio`, privado, branch main.
Pages não ativado; não há URL de site publicado. O endereço abaixo é apenas o endereço esperado quando houver publicação:
`https://contato675.github.io/renata-alberigi-portfolio/`

## Funcionamento
Pages entrega arquivos estáticos HTML/CSS/JavaScript e imagens a partir do repositório. Não executa backend, não usa Supabase e não requer chave de IA. Nosso build simples produz `dist/`; somente essa pasta deve ser publicada, nunca os documentos internos ou o repositório inteiro.
Todos os paths de assets são relativos. Isso evita a quebra de `/assets/...` quando o site está no subdiretório `/renata-alberigi-portfolio/`. Um domínio próprio pode ser configurado depois, sem ser obrigatório.

## Visibilidade e custo
GitHub Free oferece Pages em repositórios públicos. Planos elegíveis pagos também permitem fontes privadas; não presumimos o plano da conta. O site Pages normalmente é público mesmo quando a fonte é privada; controles privados têm elegibilidade específica. Não usar repositório privado como promessa de sigilo do conteúdo publicado.
Não alterar a visibilidade por conta própria. Para o caminho gratuito, revisar todo o histórico e conteúdo primeiro e obter autorização para tornar ESTE repositório público. O acesso a outros projetos privados não é alterado.

## Sequência futura de publicação
1. Implementar layout/viewer, carregar mídias e concluir revisão visual.
2. Confirmar autorização editorial e `npm run check:publish` sem falhas.
3. Decidir manter fonte privada em plano elegível ou mudar o repo para público com autorização.
4. Settings > Pages > Build and deployment > Source: GitHub Actions.
5. Ativar workflow revisado: checkout mínimo sem credenciais persistidas, setup-node, verify, gate de publicação, build, configure-pages, upload-pages-artifact (dist), deploy-pages. Pin de cada action em commit oficial revisado. Usar environment github-pages e permissões mínimas contents:read, pages:write, id-token:write; somente job de deploy pode escrever Pages.
6. Começar com workflow_dispatch (disparo deliberado); push automático só após aceite.
7. Confirmar deploy pela execução real e HTTP do endereço, testar assets no subdiretório, teclado/mobile e PDF. Não afirmar publicação apenas porque houve push.

Um workflow de deploy não foi ativado nesta fase para evitar site incompleto e uso desnecessário de Actions privados. A verificação local já funciona sem npm install. Integração contínua e pins definitivos entram com a implementação.

## Limite de uso comercial
Este projeto é apresentação artística/portfólio, não checkout, SaaS ou loja. GitHub Pages não deve ser usado para site primariamente voltado a transações comerciais. Uma futura loja, pagamento ou área autenticada exige avaliar outra hospedagem.

## Rollback
Reverter o commit defeituoso por novo commit e executar novamente o deploy conhecido. Nunca force-push no histórico compartilhado. Fotografias sensíveis publicadas por erro exigem procedimento próprio; simples revert não remove versões públicas anteriores.
