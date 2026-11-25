# Retrospectiva 02 — EntregaAí

Refs [#25](https://github.com/MatheusSCristo/EntregaAi/issues/25).
Preparação documental em **25/11/2026**, responsável: **Matheus Senas de Cristo**,
com assistência do Codex. Estado: **integração autorizada pelo responsável em 25/11/2026**. Não houve reunião
de retrospectiva humana registrada; este documento reúne fatos, hipóteses e
propostas para o responsável validar. O recorte não antecipa a entrega final
da sprint em 30/11 nem a gravação da #26.

## Meta e resultado observado

A base manual evoluiu para recebimento com sugestão de etiqueta, confirmação,
fila de WhatsApp fake, retirada validada e persistência. Até o início desta
preparação, #13–#22 estavam integradas à main. O mapa #23 e a validação #24
foram integrados pelos [PRs #39](https://github.com/MatheusSCristo/EntregaAi/pull/39)
e [#40](https://github.com/MatheusSCristo/EntregaAi/pull/40) em 25/11/2026, após
autorização expressa do usuário para o agente realizar os merges e aprovação
dos checks exigidos. O snapshot preserva as versões utilizadas na preparação
dos cálculos; a integração posterior não altera as janelas de medição congeladas.

O usuário escolheu **WhatsApp fake** e dispensou **teste com pessoa externa**.
Essas decisões reduziram dependências de credenciais e participação externa,
mas limitam o que a entrega comprova: não há mensagem real recebida, avaliação
nova da acurácia do OCR ou comprovação de usabilidade externa.

## Conferência das ações da retrospectiva 01

A [base preservada](evidencias/sprint-02/retrospectiva-base.json) contém a minuta
local de 16/10/2026 e fontes da Sprint 1, com hashes para conferência. A própria
minuta dizia depender de validação humana. Seus prazos eram propostas; não há
evidência de uma reunião que tenha confirmado compromissos nessas datas.

| Ação anterior | Evidência e avaliação em 25/11 |
| --- | --- |
| Padronizar runtime e validar instalação limpa no Linux — prazo proposto 19/10 | **Concluída para o CI, com limite de cobertura.** [#14/PR #29](https://github.com/MatheusSCristo/EntregaAi/pull/29) fixa Node 22.16.0, npm 10.9.2 e `npm ci`; runs verdes preservados. A evidência é de 06/11, posterior ao prazo originalmente proposto. Docker ainda usa tag Node 22 flutuante; ensaio #24 executou 22.23.4, portanto não se afirma padronização completa de todos os ambientes. |
| Registrar movimentações e WIP diário — prazo proposto 19/10 | **Parcial.** [#16/PR #32](https://github.com/MatheusSCristo/EntregaAi/pull/32) introduziu método e amostras; novas tarefas registram início, teste, espera e entrega nas issues. [Registro de tempos](tempos-kanban-sprint-2.md) não contém série diária contínua nem cronômetro líquido completo. O estado Done da #16 não comprova retrospectivamente os dias ausentes. |
| Teste externo do README antes da review — prazo proposto 23/10 | **Não realizada.** Na [decisão da #24](https://github.com/MatheusSCristo/EntregaAi/issues/24#issuecomment-7161805763), o usuário dispensou pessoa externa. O [PR #40](https://github.com/MatheusSCristo/EntregaAi/pull/40) substitui por ensaio local; isso comprova integração técnica, não a ação externa original nem o critério humano de dez minutos. |

## Comparação de métricas e evolução

| Indicador | Sprint 1 | Sprint 2 | Interpretação válida |
| --- | --- | --- | --- |
| Lead time | **11,109681 dias** médios, 5 issues #2–#6, criação→fechamento | **20 min 07 s** de mediana e **7 h 57 min 27,92 s** de média, 12 commits, commit→CI de integração | Pontos de início/fim e populações diferentes; não calcular redução percentual nem atribuir ganho de produtividade. |
| Cycle/fluxo | **1,270185 dias** de média, somente 2/5 cartões com transições completas | **25,111111 h** de média, início informado→merge de #13/#14/#21 | Cobertura maior para separar marcos em três itens; ainda são janelas de calendário e processamento estimado, não medição líquida comparável. |
| Volume semanal | **3, 0, 0, 2** issues fechadas nas quatro semanas da coleta, última parcial | **3, 3, 2, 1** integrações aprovadas por semana na janela parcial da #22 | As unidades diferem: issue fechada versus merge com CI. Indica eventos registrados, não taxa comparável de produtividade. |
| Frequência adaptada | Não medida com a mesma definição | **9 integrações / 19,381944 dias = 0,4643/dia**, 3,2504 por sete dias | Proxy acadêmico de implantação. Não há produção comprovada. |
| Falha de mudança | Sem taxa documentada equivalente | **1/9 (11,11%)**, caso Sharp atribuído ao PR #35 por inferência sustentada | A taxa não é obtida das falhas de CI. Duas falhas intencionais da prova #30 foram excluídas da classificação de mudança. |
| Recuperação | Sem observação equivalente | **11 min 39 s**, registro do problema→CI da integração corrigida | Intervalo de relato/correção no proxy, não indisponibilidade em produção ou MTTR real. |
| Eficiência do fluxo | Indisponível por falta de separação de trabalho/espera | **11,4652%** de média das três estimativas; **0,9414%** agregada | Só estimativas de janela de sessão. Não equivalem a eficiência real de trabalho, que continua indisponível. |

Fontes: [métricas DORA adaptadas](metricas-02.md),
[fluxo de valor](fluxo-de-valor.md)
e snapshot da base. A janela DORA termina em **23/11 às 09:10**, antes do merge
da #22 e dos PRs #39/#40. Não foi estendida apenas para incluir a própria medição.
A conferência local reconstruiu os valores da Sprint 1 das fontes preservadas.
O utilitário usado nessa conferência foi retirado do PR a pedido do usuário.

## Fatos, causas possíveis e aprendizado

- **Fato:** o defeito Sharp passou por lint, testes e build e apareceu ao executar
  a API compilada. **Causa sustentada:** incompatibilidade CommonJS/importação;
  a cobertura original não exercitava esse caminho compilado. **Resposta:** #24
  executou um ensaio local de PNG real no serviço compilado, PostgreSQL e fluxo
  completo. O utilitário e a etapa adicional de CI foram retirados do PR a pedido
  do usuário; o resultado pontual permanece documentado, sem cobertura contínua adicional.
- **Fato:** três itens somam **74 h 37 min 27 s** entre entrega e merge, 99,0586%
  do recorte, com a #21 atravessando fim de semana. **Hipótese:** ausência de uma
  janela combinada de validação contribui para a permanência. Não há logs que
  separem revisão ativa de espera; não atribuir o período a inatividade pessoal.
- **Fato:** há comentários e amostras de WIP, mas não cronômetro de trabalho
  líquido nem série diária completa. **Causa possível:** coleta manual por marcos
  perde pausas e dias sem acesso. É hipótese para o responsável confirmar.
- **Fato:** a #24 validou Compose com base nova, web/proxy, seed idempotente,
  persistência após down/up e fluxo com leitor controlado/WhatsApp fake.
  **Limite:** validação técnica local não substitui feedback de usuário externo.
- **Fato:** as decisões de escopo e interpretação de métricas exigiram revisão
  explícita: fake não é mensagem real; CI não é produção; timestamp não é esforço.
  O [registro de IA](uso-de-ia.md) preserva contribuições, dificuldades e controle humano.

## Três ações propostas para o próximo projeto

Não são resultados já atingidos nem compromissos aceitos em uma reunião.

| Ação | Responsável e prazo proposto | Métrica-alvo e verificação |
| --- | --- | --- |
| Combinar duas janelas de revisão por dia útil antes de puxar trabalho; respeitar WIP | Matheus; instituir até **30/11/2026** e adotar desde o primeiro PR do próximo projeto | Nos próximos 3 PRs, ReadyForReview→merge **≤24 h corridas nos três**; acompanhar mediana/máximo. Se a disponibilidade impedir, registrar causa e ajustar a proposta, sem omitir o fim de semana. |
| Registrar sessões, pausas e amostra diária de WIP em horário fixo | Matheus; configurar antes de iniciar o próximo projeto | **100% dos próximos 3 itens** com início/fim de cada sessão/pausa e amostras em **5 dias úteis consecutivos**; só então calcular eficiência medida. |
| Manter ensaio do artefato compilado e uniformizar runtime de CI/imagens | Matheus; configurar no primeiro PR do próximo projeto | Ensaio de foto→confirmação→notificação fake→retirada em **100% dos PRs**, com banco real; Node/npm reportados e alinhados no CI e nas imagens. Verificar logs, não somente a presença do workflow. |

O teste externo permanece uma lacuna conhecida e foi dispensado neste escopo.

## Conferência das fontes e condição de fechamento

O snapshot preserva conteúdo e hashes das fontes. Para conferir a Sprint 1,
calcular a média de fechamento menos criação das cinco issues #2–#6; para cycle
time, usar somente os dois cartões com ambas as transições registradas.
Throughput conta fechamentos por semana. As fórmulas e populações DORA/fluxo
continuam identificadas separadamente, sem comparar definições diferentes.
A conferência foi realizada localmente; esta entrega contém documentos e dados,
sem o utilitário de cálculo.

As dependências #23/#24 foram integradas e a capacidade de revisão foi liberada.
O usuário autorizou a integração do PR desta retrospectiva; os checks e o merge
correspondentes ficam registrados no GitHub. Essa autorização não é apresentada
como ata de reunião ou comprovação de teste funcional humano.
Se a validação mudar as fontes ou surgir nova evidência até o fechamento,
atualizar o retrato com nova data, preservando o histórico.
