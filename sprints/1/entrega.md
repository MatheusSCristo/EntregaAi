# EntregaAí — Sprint 1

**Matheus Senas de Cristo · Matrícula 20240002384**  
DIM0510 — Processos de Software · Projeto individual · 16/10/2026

O incremento permite registrar encomendas manualmente e consultar os pendentes
persistidos. Este documento reúne as evidências dos quatro critérios da rubrica,
as métricas recuperadas e as ações propostas para a próxima sprint.

## Incremento funcional — 30%

O fluxo demonstrável é:

1. Buscar um morador pré-cadastrado.
2. Informar local de armazenamento, remetente e observação.
3. Registrar a encomenda.
4. Consultar o registro na lista de pendentes, com unidade, local e horário.
5. Recarregar a página e confirmar que os dados continuam salvos.

<img width="1425" height="891" alt="image" src="https://github.com/user-attachments/assets/49be5139-060a-4e34-b788-6eec8e541161" />


### Validação

- Cadastro realizado pela API e pelo formulário no navegador.
- Persistência confirmada após recarregar a página e reiniciar a API.
- PostgreSQL e Redis verificados; moradores fictícios preparados pelo seed.
- README com pré-requisitos e comandos de execução.
- PR #12 integrado à `main`, com CI aprovado.

**Limites:** as correções locais posteriores de conexão, build e validação ainda
precisam ser integradas por PR. O teste por uma pessoa externa permanece pendente.
IA, WhatsApp e retirada pertencem aos próximos incrementos.

**Evidências:** [PR #12](https://github.com/MatheusSCristo/EntregaAi/pull/12) ·
[CI aprovado](https://github.com/MatheusSCristo/EntregaAi/actions/runs/38976098214) ·
[README](../README.md).

## Kanban em uso real — 25%

O [quadro Kanban](https://github.com/users/MatheusSCristo/projects/9) contém cinco
cartões em **Done**: estrutura inicial, seed, CI, tela de registro e lista de pendentes.

<img width="1894" height="874" alt="image" src="https://github.com/user-attachments/assets/a5562bd2-2fed-45f8-9039-ba5772f0eba2" />


### Políticas e limites de WIP

| Coluna | Entrada | Saída | WIP |
|---|---|---|---|
| Backlog | História descrita e priorizada | Selecionada no planejamento | Sem limite |
| Sprint Backlog | Escopo, critérios e responsável definidos | Capacidade disponível para começar | 5 |
| In progress | Implementação iniciada e data registrada | PR aberto para revisão | 1 |
| In review | PR pronto para revisão e CI | Revisão, integração e verificação concluídas | 2 |
| Done | Definição de Pronto atendida | Novo cartão em caso de defeito | Sem limite |

Quando uma coluna atinge o limite, terminar ou revisar o trabalho existente antes
de puxar outro cartão. Bloqueios devem ter motivo e data registrados.

As políticas completas estão no [acordo de processo](processo.md). A formalização
no fechamento não comprova aplicação histórica. A captura mostra o estado atual;
as transições recuperadas comprovam parte do andamento, com lacunas em três cartões.

### Métricas de fluxo

Janela observada: **21/09 a 16/10/2026**, no fuso de Brasília. Durações em tempo
corrido, incluindo esperas; não representam horas efetivamente trabalhadas.

| Indicador | Resultado | Cobertura e definição |
|---|---|---|
| Lead time médio | **11,11 dias corridos** | Cinco issues, da criação ao fechamento |
| Cycle time médio observado | **1,27 dias corridos** | Dois dos cinco cartões, de In progress até Done |
| Throughput semanal | **3 · 0 · 0 · 2** | Cartões fechados por semana; última semana parcial |
| WIP médio total | **Histórico insuficiente** | Faltam transições de três cartões |

**Lead time** inclui o tempo na fila, desde a entrada da tarefa no sistema até a
conclusão. **Cycle time** começa quando o trabalho é iniciado e inclui pausas e revisão.

#### Lead time por cartão

| Cartão | Issue | Dias corridos |
|---|---|---:|
| Seed do condomínio | #2 | 2,53 |
| Configuração do CI | #3 | 3,54 |
| Estrutura inicial | #4 | 2,53 |
| Tela de registro | #5 | 22,00 |
| Lista de pendentes | #6 | 24,94 |

A história principal H01 (#1) permanece aberta e não foi contada novamente como entrega.

#### Entregas por semana

| Semana de segunda a domingo | Cartões fechados |
|---|---:|
| 21–27/09 | 3 |
| 28/09–04/10 | 0 |
| 05–11/10 | 0 |
| 12–18/10, observado até 16/10 | 2 |

#### Cycle time com histórico completo

| Cartão | Entrada em progresso | Chegada em Done | Duração |
|---|---|---|---|
| P01 — #4 | 21/09, 21:03:51 | 24/09, 09:46:08 | 60h42min17s |
| P03 — #6 | 16/10, 19:14:06 | 16/10, 19:29:57 | 15min51s |

A média de **1,27 dias** cobre apenas esses dois cartões. O ciclo mede as
movimentações registradas e não prova que toda a implementação ocorreu nesse intervalo.

O maior cycle time da amostra é o de **P01**, com **48h35min59s em progresso** e
**12h06min18s em revisão**. As permanências incluem trabalho e espera; não permitem
separar horas produtivas de bloqueio. O maior lead time é o de P03, com 24,94 dias.

Nas issues #2, #3 e #5 faltam transições necessárias. Por isso, o WIP médio total
não foi estimado como se o histórico estivesse completo.

**Fontes e método:** [métricas detalhadas](metricas-sprint-01.md) ·
[issues](evidencias/sprint-01/issues.json) ·
[transições do Projects](evidencias/sprint-01/transicoes-projects.json).

## Prática XP evidenciada — 20%

A prática adotada é **integração contínua**. O workflow existe desde 25/09 e
executa geração do cliente Prisma, lint, testes e build em pushes e PRs para `main`.

- Execução real aprovada no CI da principal.
- Revisão por IA registrada no PR #12, com recomendação de aprovação.
- Verificação local mais recente: **8 testes aprovados**, lint e builds aprovados.
- O acordo de processo descreve verificar o CI e responder aos apontamentos antes de integrar.

A revisão foi feita por IA; não comprova revisão por outro integrante humano.
Não há alegação de TDD nem de programação em par. A existência do workflow não
comprova, sozinha, que a proteção de branch está configurada.

**Evidências:** [workflow](../.github/workflows/ci.yml) ·
[CI aprovado](https://github.com/MatheusSCristo/EntregaAi/actions/runs/38976098214) ·
[PR e revisão](https://github.com/MatheusSCristo/EntregaAi/pull/12).

## Retrospectiva — 25%

### Fatos observados

- O cadastro e a lista funcionaram com persistência na verificação local.
- O histórico contém correções repetidas de configuração de testes e dependências.
- Um PostgreSQL instalado ocupava a porta 5432; o banco Docker passou a usar 5433.
- Foram corrigidos o caminho do build e a validação HTTP.
- Apenas dois cartões têm ciclo completo registrado; faltam transições em três.

### Causas e aprendizados

**Diagnóstico confirmado:** a colisão de porta direcionava a aplicação ao
PostgreSQL da máquina. A mudança para 5433 permitiu aplicar migration e seed e
validar o fluxo.

**Hipótese para o retrabalho de CI:** diferenças entre ambientes e ausência de
uma verificação de instalação limpa antes da integração. Essa causa deve ser
validada pelo autor com os logs do Actions; não foi registrada como discussão de
reunião concluída.

**Aprendizado de processo:** registrar toda entrada e saída de coluna. As lacunas
impedem calcular o WIP médio total e o cycle time dos cinco cartões com segurança.

### Ações propostas para a próxima sprint

| Ação | Responsável | Prazo | Critério de conclusão |
|---|---|---|---|
| Padronizar runtime e dependências | Matheus | 19/10/2026 | Instalação limpa no Linux e CI verde |
| Registrar datas e WIP diariamente | Matheus | 19/10/2026 | Movimentações registradas e primeira amostra diária no Projects |
| Realizar teste externo do README | Matheus | 23/10/2026 | Pessoa, data, resultado e correções documentados |

As ações ainda precisam ser validadas e virar cartões. O registro exigido pela
rubrica está em [docs/retrospectiva-01.md](retrospectiva-01.md); este documento de
apresentação não o substitui.

## Conferência antes do envio

- Integrar as correções locais por PR, com revisão e CI aprovado.
- Realizar o teste externo do README.
- Validar as causas da retrospectiva e criar cartões para as ações.
- Publicar o vídeo e inserir um link acessível no README.
- Preservar as fontes das métricas e explicitar a cobertura incompleta.

**Vídeo preparado:** [video](../1/sprint-01.mp4).

**Repositório:** [MatheusSCristo/EntregaAi](https://github.com/MatheusSCristo/EntregaAi).
