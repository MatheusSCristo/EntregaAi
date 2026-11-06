# Verificação S2-02 — CI reproduzível

## Escopo

Issue: https://github.com/MatheusSCristo/EntregaAi/issues/14
PR: https://github.com/MatheusSCristo/EntregaAi/pull/29

O CI passa a validar todo push e PR para main com Ubuntu 24.04, Node 22.16.0 e npm 10.9.2. `npm ci --include=optional` instala o lockfile sem atualizá-lo. O cache do setup-node guarda downloads npm; node_modules é instalado do zero a cada job.

## Relação com a retrospectiva 01

A minuta local `docs/retrospectiva-01.md` propõe "Padronizar runtime e validar instalação limpa no Linux" diante das correções recorrentes de dependências nativas. Esta tarefa implementa essa ação. A minuta ainda não integra a main e sua validação humana permanece separada; não foi alterada ou publicada por esta tarefa.

## Registro de execução

- Início do processamento: 06/11/2026 09:53 (São Paulo), aproximado ao minuto; fonte: sessão de execução e comentário inicial na issue.
- Implementação: commit ac74bf9.
- Início da espera pelo runner: 06/11/2026 09:55:38 (São Paulo), fonte: startedAt do job 127904043545.
- Execução Linux por push: https://github.com/MatheusSCristo/EntregaAi/actions/runs/42221394026.
- Resultado e execução final do PR: consultar comentários da issue e checks do PR; registros remotos são a fonte dos horários exatos de conclusão.

## Validação humana

Abrir os checks do PR, conferir versões reportadas e as etapas de instalação limpa, geração Prisma, lint, testes e build. O workflow não exige banco ou credenciais de aplicação para essas verificações. A proteção da main pertence à tarefa #15.
