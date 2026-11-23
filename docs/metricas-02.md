# Métricas de entrega — Sprint 2

Refs [#22](https://github.com/MatheusSCristo/EntregaAi/issues/22).
Coleta em 23/11/2026. Todos os horários das tabelas estão em São Paulo (UTC−03:00).

## Janela e significado de implantação

A janela foi fixada antes dos cálculos: **[04/11/2026 00:00, 23/11/2026 09:10)**,
ou `[2026-11-04T03:00:00Z, 2026-11-23T12:10:00Z)`. O início é inclusivo e o fim,
exclusivo. São **19 dias, 9 horas e 10 minutos**, ou 19,381944 dias corridos.
Esta é uma medição parcial da última sprint, cujo prazo é 30/11.

Não há publicação em produção comprovada nesta coleta. A definição operacional
adotada é **integração em main cujo CI de push terminou aprovado**, uma aproximação
acadêmica de implantação. O instante usado é o maior `completed_at` dos jobs do
run aprovado para o SHA de merge; `updated_at` não é tratado como fim do CI.

A unidade é uma integração do repositório inteiro: aplicação, infraestrutura, CI
e documentação entram na mesma população. Não são contadas duas implantações
pelos runs de push e pull request, nem por reexecuções do mesmo SHA. Esta
amostra tem uma tentativa por run. O commit de referência da main é
[`478ccaf7`](https://github.com/MatheusSCristo/EntregaAi/commit/478ccaf7a6b7cd0587973c5cef9873535141e2bc).
O PR desta medição não entra na própria amostra.

O [guia oficial DORA](https://dora.dev/guides/dora-metrics/) define frequência,
tempo entre commit e produção e taxa de mudanças que exigem intervenção.
Aqui, esses conceitos são adaptados à integração com CI. **Os números abaixo
não medem disponibilidade, implantação ou incidentes reais de produção.**

## Resultados

| Métrica | Método | Resultado |
| --- | --- | --- |
| Frequência de implantação, aproximação | 9 integrações aprovadas / 19,381944 dias | **0,4643 por dia**, equivalente a **3,2504 por 7 dias** |
| Tempo de entrega de mudança, aproximação | Do `committer.date` de cada commit próprio até o CI aprovado de sua integração; 12 commits | **Mediana 20 min 07 s**; média **7 h 57 min 27,92 s**; P90 **12 h 52 min 30 s** |
| Taxa de falha de mudança documentada, aproximação | 1 integração com defeito funcional que exigiu correção posterior / 9 integrações aprovadas | **11,11% (1/9)** |
| Recuperação, observação complementar | Do registro do defeito ao CI da integração corrigida; um caso | **11 min 39 s**, intervalo de registro até CI corrigido, sem medição de indisponibilidade real |

A mediana usa a média dos dois valores centrais quando n é par. P90 usa
**nearest rank**: posição `ceil(0,9 × n)`, com ordenação crescente.
Média e mediana ponderam cada commit igualmente; o resultado depende do tamanho
dos PRs. Commits de merge e commits da base são excluídos da amostra de lead time.
Neste conjunto, autoria e commit têm o mesmo horário; usa-se o horário de commit
de forma explícita, sem inferir início do desenvolvimento.

## Distribuição por integração

A coluna de tempo usa o **primeiro commit próprio de cada PR**, para expor a
distribuição de lotes. Ela não é a série de 12 commits usada no resumo acima.
Todos os nove merges têm CI de push aprovado, com um job por run.

| PR | Primeiro commit | Merge | Fim do job de CI | Tempo do primeiro commit ao CI |
| --- | --- | --- | --- | --- |
| [#28](https://github.com/MatheusSCristo/EntregaAi/pull/28) | 2026-11-04 14:41:58 | 2026-11-04 19:55:47 | [2026-11-04 19:57:13](https://github.com/MatheusSCristo/EntregaAi/actions/runs/41929496550) | 5 h 15 min 15 s |
| [#29](https://github.com/MatheusSCristo/EntregaAi/pull/29) | 2026-11-06 09:55:31 | 2026-11-06 10:14:46 | [2026-11-06 10:16:15](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42223945782) | 20 min 44 s |
| [#31](https://github.com/MatheusSCristo/EntregaAi/pull/31) | 2026-11-06 15:20:37 | 2026-11-06 18:24:37 | [2026-11-06 18:26:06](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42296492186) | 3 h 5 min 29 s |
| [#32](https://github.com/MatheusSCristo/EntregaAi/pull/32) | 2026-11-11 19:22:00 | 2026-11-11 19:29:37 | [2026-11-11 19:31:04](https://github.com/MatheusSCristo/EntregaAi/actions/runs/43112215256) | 9 min 4 s |
| [#33](https://github.com/MatheusSCristo/EntregaAi/pull/33) | 2026-11-11 19:33:21 | 2026-11-12 08:24:24 | [2026-11-12 08:25:51](https://github.com/MatheusSCristo/EntregaAi/actions/runs/43208885779) | 12 h 52 min 30 s |
| [#34](https://github.com/MatheusSCristo/EntregaAi/pull/34) | 2026-11-14 13:59:31 | 2026-11-14 14:10:18 | [2026-11-14 14:11:50](https://github.com/MatheusSCristo/EntregaAi/actions/runs/43619637705) | 12 min 19 s |
| [#35](https://github.com/MatheusSCristo/EntregaAi/pull/35) | 2026-11-18 09:01:47 | 2026-11-18 09:19:40 | [2026-11-18 09:21:17](https://github.com/MatheusSCristo/EntregaAi/actions/runs/44302854752) | 19 min 30 s |
| [#36](https://github.com/MatheusSCristo/EntregaAi/pull/36) | 2026-11-18 09:27:19 | 2026-11-18 09:43:05 | [2026-11-18 09:44:02](https://github.com/MatheusSCristo/EntregaAi/actions/runs/44306595258) | 16 min 43 s |
| [#37](https://github.com/MatheusSCristo/EntregaAi/pull/37) | 2026-11-20 11:44:28 | 2026-11-23 09:05:27 | [2026-11-23 09:07:20](https://github.com/MatheusSCristo/EntregaAi/actions/runs/45171012662) | 2 d 21 h 22 min 52 s |

Nesta série de nove PRs, a mediana é **20 min 44 s**, a média **10 h 12 min 42,89 s**
e o P90 **2 d 21 h 22 min 52 s**. Não confundir essa mediana com a de 12 commits.

### Série por commit usada na métrica

| PR | Commit | Commit em São Paulo | Tempo até a integração aprovada |
| --- | --- | --- | --- |
| #28 | [3d5bfd7](https://github.com/MatheusSCristo/EntregaAi/commit/3d5bfd7ade0dd71adf9842cfd7524e9ea9fb1d38) | 2026-11-04 14:41:58 | 5 h 15 min 15 s |
| #29 | [ac74bf9](https://github.com/MatheusSCristo/EntregaAi/commit/ac74bf9afbb5551108ed8e345028e0ddd7d12a63) | 2026-11-06 09:55:31 | 20 min 44 s |
| #29 | [e80e608](https://github.com/MatheusSCristo/EntregaAi/commit/e80e608b7f581b4e823b818bd3a4fabdca66b71e) | 2026-11-06 09:56:53 | 19 min 22 s |
| #31 | [80c4889](https://github.com/MatheusSCristo/EntregaAi/commit/80c4889eee17f439af1f55531f5817ec3fcfe1bc) | 2026-11-06 15:20:37 | 3 h 5 min 29 s |
| #31 | [5130afa](https://github.com/MatheusSCristo/EntregaAi/commit/5130afa3ac75007ebfca5d5b9984fb0aa2526ac6) | 2026-11-06 15:21:19 | 3 h 4 min 47 s |
| #32 | [cf35c87](https://github.com/MatheusSCristo/EntregaAi/commit/cf35c87cc4850a81e113d2017a915a50f6a4d433) | 2026-11-11 19:22:00 | 9 min 4 s |
| #33 | [c0b8cb3](https://github.com/MatheusSCristo/EntregaAi/commit/c0b8cb38c1d040e74c913c309ea594f8f77c8785) | 2026-11-11 19:33:21 | 12 h 52 min 30 s |
| #34 | [728b2db](https://github.com/MatheusSCristo/EntregaAi/commit/728b2db5d2b1b01fe59e60d4e1196cfa4d66f2f8) | 2026-11-14 13:59:31 | 12 min 19 s |
| #35 | [f411358](https://github.com/MatheusSCristo/EntregaAi/commit/f411358824e6bab8ff491b1646a917f620adbd3b) | 2026-11-18 09:01:47 | 19 min 30 s |
| #36 | [4912a06](https://github.com/MatheusSCristo/EntregaAi/commit/4912a06140e5fd8ebd321a8ff9e471e169404a90) | 2026-11-18 09:27:19 | 16 min 43 s |
| #36 | [808beb4](https://github.com/MatheusSCristo/EntregaAi/commit/808beb46312cf0f1434c87799df7d3b8f70528a1) | 2026-11-18 09:33:02 | 11 min 0 s |
| #37 | [ecafb41](https://github.com/MatheusSCristo/EntregaAi/commit/ecafb411fc3bf3a9d912c0512572408dc0941987) | 2026-11-20 11:44:28 | 2 d 21 h 22 min 52 s |

Mínimo: **9 min 04 s**. Máximo: **2 d 21 h 22 min 52 s**.
A distribuição é assimétrica; a média isolada esconde a concentração dos valores
curtos e as esperas longas.

## Distribuição semanal

Semanas começam na segunda-feira, em São Paulo. As bordas são recortadas pela
janela; não comparar contagens parciais como se fossem semanas completas.

| Semana | Cobertura observada | Integrações | PRs | Falhas documentadas |
| --- | --- | --- | --- | --- |
| 02–08/11 | 04–08/11, 5 dias | 3 | #28, #29, #31 | 0 |
| 09–15/11 | 7 dias completos | 3 | #32, #33, #34 | 0 |
| 16–22/11 | 7 dias completos | 2 | #35, #36 | 1 |
| 23–29/11 | 23/11 até 09:10, 9 h 10 min | 1 | #37 | 0 |

A taxa de 3,2504 por sete dias é uma normalização da janela inteira; não é média
simples das quatro contagens da tabela.

## Falha de mudança: classificação e evidência

A classificação exige defeito funcional no artefato integrado que levou a uma
correção ou reversão posterior. Foi feita revisão manual dos PRs, commits,
índice de issues e comentários das tarefas #13–#21. Ausência de registro não
comprova ausência de defeitos.

**Caso Sharp/CommonJS, atribuído ao PR #35 por inferência documentada:**

1. A API de leitura de etiqueta foi integrada no [PR #35](https://github.com/MatheusSCristo/EntregaAi/pull/35),
   com CI aprovado às **18/11 09:21:17**.
2. O primeiro commit do [PR #36](https://github.com/MatheusSCristo/EntregaAi/commit/4912a06140e5fd8ebd321a8ff9e471e169404a90)
   alterou apenas web e README. Na validação seguinte, PNG válido retornou HTTP
   400 no Nginx e na API compilada. O [comentário do defeito](https://github.com/MatheusSCristo/EntregaAi/issues/20#issuecomment-6978654493)
   foi publicado às **09:32:23** e descreve a incompatibilidade de `sharp.default`.
3. O [commit corretivo `808beb4`](https://github.com/MatheusSCristo/EntregaAi/commit/808beb46312cf0f1434c87799df7d3b8f70528a1)
   substituiu `allowSyntheticDefaultImports` por `esModuleInterop` em
   `apps/api/tsconfig.json`. A [validação funcional](https://github.com/MatheusSCristo/EntregaAi/issues/20#issuecomment-6978727709)
   confirmou o processamento da foto.
4. A correção entrou na main pelo PR #36. O [CI desse merge](https://github.com/MatheusSCristo/EntregaAi/actions/runs/44306595258)
   terminou às **09:44:02**.

Assim, há **uma falha observada em nove integrações**, mesmo com todos os CIs da
main verdes. O caso não foi contado por haver `fix` no título: comentário, diff e
ordem dos eventos sustentam a classificação. Foi observado em teste local do
artefato compilado herdado da main; não há evidência de incidente com usuários
em produção. Sem aceitar a aproximação de integração, a taxa DORA de produção
é **indisponível**, não 0%.

O intervalo adicional é `09:44:02 − 09:32:23 = 699 s`.
O instante exato de descoberta pode ser anterior ao comentário; não usar esse
intervalo como MTTR ou duração de uma interrupção em produção. Do primeiro CI
aprovado do PR #35 ao CI corrigido há 22 min 45 s, uma janela de exposição do
proxy, também sem comprovação de indisponibilidade durante todo o período.

### Falhas de CI são outra série

A API retornou **43 workflow runs** na janela. O cálculo seleciona somente
`name=CI`, `path=.github/workflows/ci.yml` e eventos `push`/`pull_request`:
**35 runs de CI**. Os outros oito são revisões dinâmicas do Copilot.

Há **2/35 runs de CI com falha (5,71%)**, ambos do mesmo commit intencional da
[prova #30](https://github.com/MatheusSCristo/EntregaAi/pull/30):
[push](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269518092)
e [pull request](https://github.com/MatheusSCristo/EntregaAi/actions/runs/42269529884).
A [issue #15](https://github.com/MatheusSCristo/EntregaAi/issues/15#issuecomment-6692181802)
registra o teste proposital e o fechamento sem merge. Excluída essa prova,
restam **0/33 falhas de CI não intencionais**.

Essas duas execuções não entram no numerador de falhas de mudança: não foram
integradas. O PR #27 foi substituído pelo #28 após renomear a branch, sem merge
do #27; não representa outra implantação nem outra falha.

## Interpretação e limitações

- A espera de #37 atravessou o fim de semana. Seu lead time é corrido, inclui
  validação e espera até o merge e não equivale a esforço de implementação.
  #33 também ficou até o dia seguinte. A média é sensível a esses dois lotes.
- O CI da main terminou entre 57 e 113 segundos após os merges. Nessas entregas,
  o intervalo até a integração predominou nos lotes longos; esta observação não
  separa desenvolvimento, revisão humana e espera de calendário.
- O caso Sharp mostra uma lacuna de teste do artefato compilado: lint, testes e
  build verdes não garantiram execução correta. Uma melhoria sustentada por
  essa evidência é incluir um ensaio de foto no serviço compilado antes da
  próxima entrega. Esta tarefa documenta a proposta; não altera a aplicação.
- A amostra é pequena, de um projeto individual, mistura código e documentação
  e tem semanas parciais. Não atribuir classificação de desempenho DORA.
- Não há observabilidade de produção nem garantia de relato de todos os
  defeitos. A taxa 1/9 é observada no proxy e pode subestimar falhas.
- Atribuir o caso ao PR #35 é uma inferência dos diffs e do relato posterior.
  O snapshot preserva as fontes para revisão humana.
- Para relatórios futuros, manter o período, o critério de falha e o ponto final
  constantes. Ao existir deploy real, trocar o proxy por eventos de publicação
  e observabilidade; não comparar as duas definições sem essa ressalva.

## Fontes e reprodução

O [snapshot normalizado](evidencias/sprint-02/dora-coleta.json) preserva campos
originais de PRs, commits, runs, jobs, issues e comentários, com URLs e
classificações manuais explícitas. Não é uma cópia integral dos payloads REST.
Foram retornados 17 PRs, 21 issues, 18 runs de push da main (histórico completo
disponível) e 43 runs na janela. Cada coleção coube em uma página de 100; as
listas de commits e jobs também ficaram abaixo do limite. O script recusa
coleta potencialmente truncada e valida a correspondência por SHA.

Recalcular o snapshot, sem rede ou instalação de dependências, na raiz do projeto
com **Node 22.16.0** (runtime da sprint):

```powershell
node scripts/metricas-sprint-02.cjs
node scripts/metricas-sprint-02.cjs docs/evidencias/sprint-02/dora-coleta.json
```

As duas formas imprimem o mesmo JSON; as tabelas acima derivam desses resultados.
O script mantém a classificação dos incidentes como entrada humana; não deduz
incidentes contando títulos com `fix`, labels ou falhas de CI.

Consultas equivalentes para conferir/coletar novamente em uma sessão com
`gh` autenticado e conectividade. São somente leituras; salvar respostas se a
coleta for refeita e registrar novo horário. `--paginate --slurp` preserva
todas as páginas em um array de páginas:

```powershell
gh api --paginate --slurp 'repos/MatheusSCristo/EntregaAi/pulls?state=all&base=main&sort=created&direction=desc&per_page=100'
gh api --paginate --slurp 'repos/MatheusSCristo/EntregaAi/issues?state=all&per_page=100'
gh api --paginate --slurp 'repos/MatheusSCristo/EntregaAi/actions/runs?branch=main&event=push&per_page=100'
gh api --paginate --slurp 'repos/MatheusSCristo/EntregaAi/actions/runs?created=2026-11-04T03%3A00%3A00Z..2026-11-23T12%3A09%3A59Z&per_page=100'
$metricPrs = 28,29,31,32,33,34,35,36,37
foreach ($metricPr in $metricPrs) {
  gh api --paginate --slurp "repos/MatheusSCristo/EntregaAi/pulls/$metricPr/commits?per_page=100"
}
$metricRuns = 41929496550,42223945782,42296492186,43112215256,43208885779,43619637705,44302854752,44306595258,45171012662
foreach ($metricRun in $metricRuns) {
  gh api --paginate --slurp "repos/MatheusSCristo/EntregaAi/actions/runs/$metricRun/jobs?per_page=100"
}
foreach ($metricIssue in 13..21) {
  gh api --paginate --slurp "repos/MatheusSCristo/EntregaAi/issues/$metricIssue/comments?per_page=100"
}
gh api repos/MatheusSCristo/EntregaAi/commits/4912a06140e5fd8ebd321a8ff9e471e169404a90
gh api repos/MatheusSCristo/EntregaAi/commits/808beb46312cf0f1434c87799df7d3b8f70528a1
git fetch origin main
git log 478ccaf7a6b7cd0587973c5cef9873535141e2bc --first-parent --since='2026-11-04T03:00:00Z' --until='2026-11-23T12:09:59Z' --format='%H|%cI|%s'
git show 808beb46312cf0f1434c87799df7d3b8f70528a1 -- apps/api/tsconfig.json
```

Na preparação desta tarefa, a coleta foi feita pelo conector GitHub com os endpoints
REST equivalentes; a CLI falhou por conectividade. Na retomada para publicação,
em 23/11/2026, o acesso pela CLI foi restabelecido para consultar o quadro e enviar
o PR. O snapshot permanece congelado: os comandos de recoleta acima não foram
reexecutados nesta retomada.

O histórico de jobs é usado para o término exato: por exemplo, no PR #35 o job
terminou às 09:21:17 e o run foi atualizado às 09:21:18. A diferença é preservada
no snapshot, evitando atribuir atualização de metadados a tempo de execução.
