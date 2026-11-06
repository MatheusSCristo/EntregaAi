# Proteção da main — S2-03

Verificação em 06/11/2026, São Paulo. Refs #15.

## Regras aplicadas

A main exige pull request e o check `Build, test and lint` aprovado, com a branch atualizada. `enforce_admins.enabled=true`: as regras incluem administradores. Force push e exclusão estão desabilitados. O número de aprovações exigidas é zero para permitir o fluxo de responsável único; isso não dispensa PR nem CI.

Configuração consultável com `gh api repos/MatheusSCristo/EntregaAi/branches/main/protection`.

## Prova de bloqueio

- PR de prova: https://github.com/MatheusSCristo/EntregaAi/pull/30
- Commit: fdab577, adicionando somente um teste temporário `expect(true).toBe(false)`.
- CI falho: https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269529884
- Resultado: etapa Test falhou em `src/protecao-main.spec.ts`; 1 suite falhou e 2 passaram.
- Consulta `gh pr view 30 --repo MatheusSCristo/EntregaAi --json mergeStateStatus,statusCheckRollup`: `mergeStateStatus=BLOCKED`, check `Build, test and lint` com `conclusion=FAILURE`.
- O PR foi fechado sem merge após coletar a evidência. O teste quebrado permanece somente na branch de prova, fora da main e deste PR de documentação. Não foi executada tentativa de merge nem bypass.

## Main saudável

CI verde na main após a entrega anterior: https://github.com/MatheusSCristo/EntregaAi/actions/runs/42223945782.
A proteção foi consultada novamente após a aplicação e manteve o check obrigatório e `enforce_admins=true`.

## Validação humana

Conferir Settings > Branches > main e os links acima. Este documento registra a evidência da configuração remota; alterações futuras nas configurações exigem nova verificação.

## Registro de tempo

Retomada em 06/11/2026 (São Paulo). Processamento: preparação isolada, aplicação e conferência da proteção, prova e documentação; duração efetiva não cronometrada. Espera do CI da prova: 15:18:44–15:19:49 (65 segundos), conforme timestamps do run. Não derivar tempo de processamento das datas de coluna. A entrega aguarda CI e, depois, validação e merge pelo usuário.
