# Registro de tempos e WIP da Sprint 2

Os horários abaixo usam São Paulo (UTC−03:00). O [Kanban da Sprint 2](https://github.com/users/MatheusSCristo/projects/9) contém um cartão por issue.

## Trabalho efetivo

| Cartão | Início registrado | Último marco de trabalho disponível | Qualidade do registro |
| --- | --- | --- | --- |
| [#13 — Compose](https://github.com/MatheusSCristo/EntregaAi/issues/13) | [04/11 14:32](https://github.com/MatheusSCristo/EntregaAi/issues/13#issuecomment-6637481448) | [04/11 14:49:25, publicação da branch corrigida](https://github.com/MatheusSCristo/EntregaAi/issues/13#issuecomment-6637828011) | Início aproximado ao minuto. Houve trabalho durante a janela de CI. Fim e duração líquida indisponíveis. |
| [#14 — CI](https://github.com/MatheusSCristo/EntregaAi/issues/14) | [06/11 09:53, anotado durante a execução](verificacao-s2-02.md#registro-de-execução) | [06/11 09:57:27, documentação do commit final e acompanhamento dos checks](https://github.com/MatheusSCristo/EntregaAi/issues/14#issuecomment-6685341919) | Início aproximado ao minuto. O horário 09:55:38 no registro anterior é do runner inicial. Fim e duração líquida indisponíveis. |
| [#15 — Proteção da main](https://github.com/MatheusSCristo/EntregaAi/issues/15) | [06/11 15:16:48, publicação do comentário inicial](https://github.com/MatheusSCristo/EntregaAi/issues/15#issuecomment-6692091011) | [06/11 15:23:26, publicação da entrega](https://github.com/MatheusSCristo/EntregaAi/issues/15#issuecomment-6692222840) | Comentários dão marcos aproximados. Fim e duração líquida indisponíveis. |

## Espera por CI

Os intervalos medidos vão da criação do primeiro run da rodada até a conclusão do último. Incluem fila, execução e finalização. Runs paralelos entram uma vez na janela da rodada. São janelas de CI e podem coincidir com trabalho no mesmo cartão. O estado de fila descrito no comentário da #13 era transitório. A execução original e a substituta terminaram com sucesso.

| Cartão | Início → fim | Duração | Evidência |
| --- | --- | --- | --- |
| #13 | 04/11 14:42:10 → 14:46:14 | 4 min 04 s | [PR original #27](https://github.com/MatheusSCristo/EntregaAi/pull/27), [run](https://github.com/MatheusSCristo/EntregaAi/actions/runs/41879670602) |
| #13 | 04/11 14:50:48 → 14:52:25 | 1 min 37 s | [PR substituto #28](https://github.com/MatheusSCristo/EntregaAi/pull/28), [run](https://github.com/MatheusSCristo/EntregaAi/actions/runs/41881015601) |
| #14 | 06/11 09:55:36 → 09:57:10 | 1 min 34 s | [Push](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42221394026), [PR](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42221469049) |
| #14 | 06/11 09:56:58 → 09:58:27 | 1 min 29 s | [Push final](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42221566212), [PR final](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42221576088) |
| #15 | 06/11 15:18:37 → 15:20:00 | 1 min 23 s | [PR de prova #30](https://github.com/MatheusSCristo/EntregaAi/pull/30), [push](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269518092), [PR](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269529884), ambos com falha intencional |
| #15 | 06/11 15:21:23 → 15:22:47 | 1 min 24 s | [Push final](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269944270), [PR final](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269951101) |

Na #14, as rodadas se sobrepuseram por 12 s. A janela combinada foi de 2 min 51 s.

## Espera por validação e merge

Os tempos da tabela representam o intervalo até o merge. A revisão pode ter ocorrido durante esse intervalo.

| Cartão | Disponível para validação | Merge | Intervalo |
| --- | --- | --- | --- |
| #13 | [04/11 14:52:06, PR #28 pronto para revisão](https://github.com/MatheusSCristo/EntregaAi/pull/28) | [04/11 19:55:47](https://github.com/MatheusSCristo/EntregaAi/commit/d4f5074f57de77c3346d6a0a5d171762e1fed6a0) | 5 h 03 min 41 s, medido |
| #14 | [06/11 09:58:58, PR #29 pronto para revisão](https://github.com/MatheusSCristo/EntregaAi/pull/29) | [06/11 10:14:46](https://github.com/MatheusSCristo/EntregaAi/commit/6b1a962d5414f8c213cea13eceaf4ce0a7ce3617) | 15 min 48 s, medido |
| #15 | [06/11 15:23:26, comentário de entrega do PR #31](https://github.com/MatheusSCristo/EntregaAi/issues/15#issuecomment-6692222840) | [06/11 18:24:37](https://github.com/MatheusSCristo/EntregaAi/commit/95d2e722d3ecf703cac2f200a26e09fcb893c6e8) | Aproximadamente 3 h 01 min, usando o comentário como marco |

## Coleta durante a sprint

1. Na issue, registrar início e fim de cada período de trabalho. Encerrar o período quando houver pausa ou bloqueio e abrir um novo na retomada.
2. Registrar início, fim e motivo de cada espera. Para CI, consultar a criação e a conclusão dos runs. Para validação, usar a entrega registrada e o merge. Vincular cartão, PR, runs e commit de merge.
3. Identificar cada intervalo como medido, estimado ou indisponível. Informar a fonte e o método. Ao calcular tempo total, descontar sobreposições. Usar comentários e datas de coluna como marcos aproximados quando faltarem registros de sessão.
4. No primeiro acesso ao quadro em cada dia da sprint, anotar os totais e as issues por coluna na tabela abaixo. Conferir os limites também antes de iniciar ou mover um cartão para revisão. Se algum limite estiver atingido, trabalhar no item ativo ou aguardar a liberação da coluna.

| Data e hora | Em progresso (limite 1) | Em revisão (limite 2) | Sprint Backlog (limite 5) |
| --- | --- | --- | --- |
| 11/11/2026 19:20 | 1 (#16) | 0 | 1 (#17) |

A primeira amostra foi consultada após o início da #16. A série diária começa em 11/11. A amostra registra o estado observado naquele horário.

## Ação da retrospectiva 01

A ação de padronizar o runtime e validar instalação limpa no Linux consta no [registro da #14](verificacao-s2-02.md#relação-com-a-retrospectiva-01). Os [checks finais](https://github.com/MatheusSCristo/EntregaAi/pull/29/checks) passaram com Ubuntu 24.04, Node 22.16.0 e npm 10.9.2. A validação humana da minuta local da retrospectiva segue pendente.
