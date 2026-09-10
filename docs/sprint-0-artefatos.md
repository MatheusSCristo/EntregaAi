# Sprint 0 — Artefatos por tarefa (T1 → T8)

Companheiro de [`docs/proposta.md`](proposta.md), que é limitado a **3 páginas** pelo checklist das
rubricas. Todo detalhe que não cabe lá mora aqui: backlog com critérios de aceitação, configuração do
quadro, processo em detalhe e a arquitetura planejada.

**Produto:** EntregaAí — a portaria recebe a encomenda, o porteiro fotografa a etiqueta, uma IA lê o
rótulo e identifica morador e apartamento, e o morador é notificado automaticamente no WhatsApp.

**Três decisões atravessam todo este documento:**

1. **Sem autenticação.** Não há login, sessão, perfil nem autorização. O app é a tela da portaria:
   abre e opera. Consequência declarada: não há autoria por pessoa nos registros.
2. **Um único usuário — o porteiro.** O morador existe apenas como nome e telefone no cadastro: não
   acessa nada, só recebe a mensagem no WhatsApp.
3. **Equipe individual.** Isso dimensiona o backlog (~12 pontos por sprint, não ~16 de um quarteto),
   acumula os papéis em quem escreve o código e substitui a revisão por par por **revisão de PR por
   agente de IA + CI com gate**.

---

## T1 — Repositório

### Checklist

- [x] Equipe declarada — **individual**, dentro do limite de 1 a 4 integrantes
- [x] Coorte **B (online)**
- [x] Integração com outra disciplina: **não há** (sem bônus de integração)
- [x] Repositório **público**: github.com/MatheusSCristo/EntregaAi
- [x] `README.md` na raiz com produto, problema, escopo, equipe, links e checklist das sprints
- [ ] Licença `LICENSE` no repositório (a Entrega Final cobra licença — resolver já)
- [ ] Quadro no GitHub Projects criado e linkado no `README.md`

---

## T2 — Visão do produto

Registrada na **seção 1** de [`docs/proposta.md`](proposta.md#1-visão-do-produto).

### Template preenchido

| Campo | Conteúdo |
|---|---|
| **Para** | porteiros de condomínios residenciais de 50 a 300 unidades |
| **Que** | anotam encomendas no caderno e ligam para o morador até alguém atender |
| **O** EntregaAí **é** | um sistema web de portaria, com um único usuário e sem login |
| **Que** | lê a etiqueta a partir de uma foto, identifica unidade e morador e notifica o destinatário no WhatsApp na hora |
| **Diferente de** | caderno, planilha e módulos de encomenda que exigem digitar unidade e nome |
| **Nosso produto** | tira a digitação do momento de pico e troca a ligação por uma mensagem automática |

### Personas

| Persona | Papel | Contexto | Dor principal |
|---|---|---|---|
| **Porteiro** | **único usuário do sistema** | Celular ou monitor na guarita, turno de 12 h, mãos ocupadas, pouca familiaridade com software | A fila no pico; ligar várias vezes para o mesmo morador; ser responsabilizado por extravio |
| **Morador** | **não acessa o sistema** — existe como nome e telefone | Recebe WhatsApp; não instala aplicativo | Não saber que a encomenda chegou |

### O processo atual (evidência qualitativa)

| # | O que acontece hoje | Consequência |
|---|---|---|
| 1 | Porteiro **anota no caderno** — nome e apartamento à mão, no meio da fila | Registro abreviado, ilegível ou inexistente |
| 2 | **Liga para o morador**, uma encomenda por vez | Tempo do porteiro consumido em ligação |
| 3 | Não atendeu? **Liga de novo**, e de novo mais tarde | O aviso depende da insistência de quem está de plantão |
| 4 | A encomenda **acumula** na portaria | Espaço ocupado por dias; nenhum registro de quem retirou |

### Autoconferência contra a rubrica *Definição do problema* (25 %)

| Exigência | Situação |
|---|---|
| Problema real e delimitado | ✅ Recebimento manual, aviso por ligação repetida, retirada sem rastro. Não é "melhorar a gestão do condomínio" |
| Público-alvo identificado | ✅ Porteiro de condomínio residencial de 50–300 unidades, com contexto de uso descrito |
| **Evidência de que existe** | ⚠️ **Qualitativa**: descrição do processo observado. **Sem baseline numérico**, este critério tende a "plausível mas genérico". Uma tarde na portaria cronometrando ~20 recebimentos resolveria — decidir se vale antes de gravar o vídeo |

### Roteiro de entrevista (se decidir coletar)

1. Descreva o que você faz quando um entregador chega com uma encomenda. Passo a passo.
2. Quantas encomendas chegam em um dia comum? E na Black Friday?
3. Onde você anota? Já aconteceu de não anotar? Por quê?
4. Como o morador descobre que a encomenda chegou? Quantas vezes você liga?
5. Já teve encomenda que ficou dias parada? O que aconteceu?
6. Já teve reclamação de encomenda que "não chegou"? Como foi resolvido?
7. Se o registro fosse tirar uma foto, o que poderia dar errado no seu dia a dia?

**Coletar etiquetas reais** (foto, remetente anonimizado) para calibrar a leitura: nome completo ·
nome abreviado · nome que não está no cadastro · etiqueta rasurada · sem bloco · com torre.

---

## T3 — Definição do MVP

Registrada na **seção 2** de [`docs/proposta.md`](proposta.md#2-definição-do-mvp).

### Fluxo do MVP, ponta a ponta

```
  ┌──────────── PORTARIA — porteiro, único usuário, sem login ────────────┐
  │  O app abre direto na operação                                        │
  │  Aba "Receber" → fotografa a etiqueta da encomenda                    │
  └───────────────────────────────┬───────────────────────────────────────┘
                                  │ imagem
                                  ▼
         1. API comprime a imagem e chama o modelo multimodal,
            passando o padrão de unidade do prédio como contexto
                                  │
               { bloco, unidade, destinatário, confiança }
                                  ▼
         2. Casamento contra as unidades e moradores do seed
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
  match confiante          leitura ambígua           nada reconhecido
  campos preenchidos       porteiro corrige          porteiro digita
        └─────────────────────────┼─────────────────────────┘
                                  ▼
         3. Porteiro confirma → encomenda "pendente"
            (guarda a leitura bruta para auditoria e medição)
                                  │
                                  ▼
         4. Fila envia o WhatsApp ao morador, com retentativa
                                  │
                                  ▼  (o morador não acessa o sistema)
  ┌───── 5. Morador vem buscar → porteiro acha a unidade em "Pendentes",
  │         escolhe o morador e valida com os 4 últimos dígitos do telefone
  │                               │
  │                               ▼
  └───── 6. Retirada registrada: morador, horário e método de validação
```

### Recortes de escopo que protegem o prazo

| Decisão | Alternativa descartada | Ganho |
|---|---|---|
| **Sem autenticação** | login, sessão, recuperação de senha, perfis | ~1 sprint; e nenhuma tela de acesso para manter |
| **Um perfil de usuário** | vários perfis com permissões distintas | Nenhum guard por papel, nenhuma tela de gestão de acesso |
| **Condomínio pré-cadastrado por seed** | CRUD de unidades e moradores | ~1 sprint de formulários e validação |
| **Morador só como nome + telefone** | conta do morador, portal de consulta | Sem cadastro público, sem recuperação de acesso |
| Uma foto por encomenda | lote de fotos com fila de revisão | Fluxo linear, sem estado intermediário |
| Notificação unidirecional | bot com respostas do morador | Sem webhook de entrada, sem máquina de estados |
| Validação por 4 dígitos do telefone | código por mensagem, QR Code, assinatura na tela | Zero infraestrutura extra; usa dado que já existe |

### Critérios de "pronto" do MVP

Um porteiro real, com 5 minutos de demonstração, consegue no ambiente publicado: abrir o app →
fotografar a etiqueta → confirmar o registro → o morador receber o WhatsApp → registrar a retirada
validando os 4 dígitos. E todos os itens **P1** estão em **Pronto** conforme a Definição de Pronto.

---

## T4 — Backlog inicial

**10 histórias de usuário** — todas priorizadas, todas estimadas — mais **4 itens de infraestrutura**
(`chore`), que não são histórias porque não entregam resultado ao usuário. A rubrica pede ≥ 5
histórias e ≥ 3 estimadas.

Escala Fibonacci (1, 2, 3, 5, 8), onde **1 ponto ≈ meio dia de trabalho efetivo**.

**P1 é o MVP** e cabe na capacidade suposta; **P2 é escopo estendido**, entra na ordem declarada se a
capacidade real superar a suposta; **P3 não é promessa**.

### E1 — Recebimento com IA

#### H01 · P1 · 3 pontos
**Como** porteiro, **quero** registrar a encomenda e vê-la na lista de pendentes **para que** eu saiba
o que está guardado na portaria e onde.

*Critérios de aceitação*
- Ao abrir o app, caio direto na operação — **não há tela de login**.
- Consigo escolher a unidade e o morador a partir do cadastro carregado pelo seed.
- Consigo informar remetente/transportadora, local de armazenamento e observação.
- Após confirmar, a encomenda aparece em "Pendentes" com unidade, destinatário e horário.
- Uma encomenda já entregue não pode ser editada.
- A lista mostra primeiro as mais recentes e é paginada.

> É o incremento da Sprint 1: o ciclo funcionando **sem IA**, com preenchimento manual. Serve de base
> para H02 substituir o formulário pela câmera.

#### H02 · P1 · 8 pontos
**Como** porteiro, **quero** fotografar a etiqueta e receber bloco, unidade e destinatário já
preenchidos **para que** eu não precise digitar nada em horário de fila.

*Critérios de aceitação*
- Ao tocar em "Receber" e tirar a foto, a câmera traseira é usada e a imagem é enviada sem eu precisar
  salvar arquivo.
- Com etiqueta legível, bloco, unidade e destinatário aparecem preenchidos e **editáveis**; a mediana
  do tempo entre a foto e o registro salvo é **≤ 5 s**.
- Se a leitura falhar ou estourar o tempo limite, o formulário abre em branco para digitação manual,
  com aviso — **o fluxo nunca fica travado**.
- A imagem é reduzida no servidor antes de ir para o modelo (custo e latência).
- A unidade lida que **não existe** no cadastro vem vazia — o sistema não inventa unidade.
- O resultado bruto da leitura é gravado junto à encomenda, para auditoria e para medir a meta de
  **≥ 90 % de registros aceitos sem edição**.

### E2 — Notificação

#### H03 · P1 · 8 pontos
**Como** morador, **quero** receber uma mensagem no WhatsApp quando minha encomenda chegar **para que**
ninguém precise me ligar — nem eu precise perguntar na portaria.

*Critérios de aceitação*
- Encomenda registrada para morador com telefone → mensagem com condomínio, unidade, data e hora.
- Destinatário lido que **não está no cadastro** → a mensagem vai para o morador principal da unidade,
  citando o nome lido e orientando a procurar a portaria caso não reconheça.
- Provedor fora do ar → a encomenda continua registrada e o envio é retentado automaticamente. **O
  registro nunca falha por causa da notificação, e a tela do porteiro não espera o envio.**
- Uma encomenda notificada não é notificada de novo.
- Morador sem telefone não gera envio nem erro na tela.
- **≥ 95 %** das encomendas notificadas em até 5 min do registro.

### E3 — Retirada validada

#### H04 · P1 · 5 pontos
**Como** porteiro, **quero** validar a retirada com os 4 últimos dígitos do telefone do morador
**para que** eu tenha prova de que entreguei para a pessoa certa.

*Critérios de aceitação*
- Telefone terminando em 4321 + porteiro digita "4321" → retirada registrada com método "telefone".
- Código errado → retirada recusada.
- Morador sem telefone cadastrado → é possível registrar com método "manual" **e observação
  obrigatória**.
- Não é possível registrar duas retiradas para a mesma encomenda.
- Não é possível registrar retirada de encomenda que não está pendente.
- O morador escolhido precisa pertencer à unidade da encomenda.
- A retirada grava morador, horário e método de validação.

### Escopo estendido

| ID | Épico | História | Prio | Pontos |
|---|---|---|---|---|
| H05 | E4 | **Como** porteiro, **quero** consultar o histórico do que foi recebido e entregue, com filtro por período e busca, **para que** eu me defenda de reclamação de extravio com fato | P2 | 5 |
| H06 | E1 | **Como** porteiro, **quero** ver os moradores candidatos quando a leitura é ambígua, **para que** eu resolva com um toque em vez de digitar o nome | P2 | 3 |
| H07 | E1 | **Como** porteiro, **quero** buscar pendentes por nome, unidade ou bloco, **para que** eu atenda rápido quem já está no balcão | P2 | 3 |
| H08 | E2 | **Como** morador com três encomendas na mesma tarde, **quero** receber uma única mensagem, **para que** meu WhatsApp não seja inundado | P2 | 5 |
| H09 | E3 | **Como** porteiro, **quero** entregar várias encomendas da mesma unidade numa operação, **para que** quatro caixas não custem quatro validações | P2 | 3 |
| H10 | E2 | **Como** morador, **quero** ser avisado quando outra pessoa retira uma encomenda minha, **para que** eu tenha rastro do que saiu | P3 | 3 |

**H05 lidera a fila P2** porque fecha o problema do rastro: os dados de auditoria já são gravados
desde H04, mas sem essa tela ninguém os consulta.

### Itens de infraestrutura (`chore`)

| ID | Item | Prio | Pontos | Sprint |
|---|---|---|---|---|
| S01 | `prisma/seed.ts`: condomínio com padrão de unidade, ~40 unidades e ~80 moradores com telefone; idempotente e executável em base limpa | P1 | 3 | 1 |
| S02 | GitHub Actions: lint + build + testes em push e PR, com gate impedindo merge vermelho, **e o agente de IA de revisão de PR** | P1 | 2 | 1 |
| S03 | `docker-compose.yml` com Postgres, Redis e provedor de WhatsApp; `.env.example` documentado | P1 | 2 | 1 |
| S04 | Publicação do ambiente de demonstração (API + web + banco) usado nas reviews | P1 | 3 | 2 |

**S04 é P1, não P2**, porque a Definição de Pronto exige verificação manual no ambiente publicado —
sem ele nenhum item fecha a partir da Sprint 2.

### Quadro-resumo

| ID | Épico | Resumo | Prio | Pontos | Sprint |
|---|---|---|---|---|---|
| H01 | E1 | Registro manual + lista de pendentes | P1 | 3 | 1 |
| S01 | — | Seed do condomínio piloto | P1 | 3 | 1 |
| S02 | — | CI com gate + agente de revisão | P1 | 2 | 1 |
| S03 | — | Docker Compose + `.env.example` | P1 | 2 | 1 |
| H02 | E1 | Foto da etiqueta → campos preenchidos | P1 | 8 | 2 |
| S04 | — | Ambiente publicado | P1 | 3 | 2 |
| H03 | E2 | Notificação no WhatsApp | P1 | 8 | 3 |
| H04 | E3 | Retirada validada por telefone | P1 | 5 | 3 |
| | | **MVP comprometido (P1)** | | **34** | **1–3** |
| H05 | E4 | Histórico auditável | P2 | 5 | 4 |
| H06 | E1 | Candidatos na leitura ambígua | P2 | 3 | 4 |
| H07 | E1 | Busca em pendentes | P2 | 3 | 4 |
| H08 | E2 | Mensagem consolidada | P2 | 5 | 4 |
| H09 | E3 | Retirada em lote | P2 | 3 | 4 |
| | | **Escopo estendido (P2)** | | **19** | **4** |
| H10 | E2 | Aviso quando outra pessoa retira | P3 | 3 | — |
| | | **Total do backlog** | | **56** | |

**Fatiamento (por que nesta ordem).** A Sprint 1 entrega o ciclo **sem IA** — registro manual, lista
de pendentes, seed, CI — o que já é um incremento executável por terceiros. A Sprint 2 troca o
formulário pela câmera e pela leitura automática, o coração da hipótese de valor. A Sprint 3 fecha o
ciclo com notificação e retirada validada. A Sprint 4 é ajuste, piloto e artefatos finais, com o P2
entrando conforme sobrar capacidade.

**Capacidade suposta:** **~12 pontos por sprint** (≈ 6 dias de trabalho efetivo em duas semanas,
sozinho e com outras disciplinas em paralelo), ou ~48 no semestre. Os **34 pontos do P1** ocupam as
Sprints 1 a 3. **Esta é a suposição mais frágil do plano** — nunca medi minha velocidade neste
projeto. A retrospectiva da Sprint 1 a substitui por dado; se a velocidade real ficar abaixo, o corte
sai do P2, nunca do P1, e a decisão fica registrada na issue da sprint.

---

## T5 — Quadro Kanban

### Colunas e WIP

| Coluna | WIP | Critério de entrada | Critério de saída |
|---|---|---|---|
| **Backlog** | — | Item escrito no formato de história | Selecionado no planejamento |
| **Sprint Backlog** | ≤ 5 | Estimado, priorizado, com critérios de aceitação | Comecei a codificar |
| **Em progresso** | **1** | Branch aberta | PR aberto |
| **Em revisão** | **2** | PR aberto, agente de IA acionado, CI rodando | Apontamentos resolvidos ou justificados no PR |
| **Pronto** | — | Satisfaz a Definição de Pronto integralmente | — |

**`Em progresso = 1` é o limite crítico no trabalho individual.** A falha típica de quem trabalha só
não é excesso de fila: é abrir três frentes ao mesmo tempo e não fechar nenhuma. O limite de 1 torna
esse desvio visível no quadro. Ao bater 2 em *Em revisão*, revisar passa à frente de codificar.

Item bloqueado recebe a label `blocked`, volta para *Sprint Backlog* e o motivo vai em comentário.
A rubrica da Sprint 1 avalia **Kanban em uso real**: cartões movidos ao longo da sprint, não no
último dia. Mover o cartão é parte da tarefa.

### Campos personalizados do Project

`Prioridade` (P1 · P2 · P3) · `Pontos` (1, 2, 3, 5, 8) · `Sprint` (0 a 4) · `Épico` (E1 a E4).

### Papéis e revisão de código

| Papel | Quando age | O que decide |
|---|---|---|
| Product Owner | Planejamento e aceite | O que entra na sprint; aceita ou recusa o item contra os critérios — **nunca no mesmo dia em que escrevi o código** |
| Desenvolvedor | Durante a sprint | Como implementar, dentro das convenções |
| Revisor | Ao responder o agente de IA no PR | O que acatar, o que recusar — com justificativa escrita |
| Qualidade | Antes de mover para "Pronto" | Roteiro de teste manual e checagem da Definição de Pronto |

### Convenções de git

- Branch: `tipo/H0X-descricao-curta` (ex.: `feat/H02-leitura-etiqueta`)
- Commit: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`)
- **Pair programming com agente de IA registra `Co-authored-by:`** — evidência de prática XP para a
  rubrica da Sprint 1
- PR: título com o ID da história, corpo com `Closes #N`, checklist da Definição de Pronto e print
  quando muda a interface
- `main` protegida: PR obrigatório, CI verde

---

## T6 — Acordo de processo

Versão consolidada na **seção 5** de [`docs/proposta.md`](proposta.md#5-acordo-de-processo).

### Revisão de código por agente de IA

Sem par humano, a revisão de Pull Request é feita por **agente de IA acionado automaticamente em todo
PR** por GitHub Action, que comenta no próprio PR:

1. Abro o PR → o workflow dispara o agente de revisão.
2. O agente comenta: bugs, casos de borda, inconsistência com as convenções, teste faltando.
3. **Cada apontamento é resolvido ou justificado por escrito no PR** antes do merge. "Não vou mudar
   porque X" é resposta válida; ignorar em silêncio, não.
4. Merge só com **CI verde** — o gate que nenhum papel meu contorna.

**Por que isso é melhor que auto-revisão:** o agente não tem o viés de quem acabou de escrever o
código, lê o diff inteiro sem cansar e é consistente entre PRs. **O que ele não faz:** julgar se a
funcionalidade é a certa para o usuário, nem decidir prioridade — isso continua sendo decisão minha.

**Configurar na Sprint 1** (parte de S02): workflow em `pull_request`, chave do provedor em *secret*
do repositório, agente instruído com as convenções do projeto (Conventional Commits, camadas
controller → service → repository, testes nas regras de domínio).

**Registro para a rubrica.** Uso, prompts, acertos e erros vão para `docs/uso-de-ia.md` desde a
Sprint 1 — a Entrega Final avalia *Uso crítico de IA* (10 %) por avaliação de impacto com evidência,
não por menção. Anotar também os apontamentos que eu **recusei** e por quê: é o que demonstra uso
crítico em vez de aceitação automática.

> **Pendência a resolver com o docente.** A rubrica da Sprint 3 pede "≥ 3 PRs com revisão substantiva
> (comentários que mudaram o código)". Revisão por agente de IA gera exatamente esse rastro, mas
> **confirmar se é aceita no lugar da revisão por par** em equipe individual, e registrar a resposta
> em `docs/decisoes/`.

### Como estimo

Sem planning poker — não há com quem votar. **Estimativa por comparação com a âncora**: **H01
(registro manual + pendentes) = 3 pontos** é a referência, e cada item responde "é maior, igual ou
menor que a âncora, e quantas vezes?". A estimativa vai na issue **antes** de começar; no fechamento
anoto o esforço real ao lado. É esse par (estimado, real) que calibra a sprint seguinte.

Item que eu não consiga comparar com a âncora com alguma confiança está grande demais: quebro em dois
antes de comprometer.

### Como lido com o que não é história

- **Bug** na sprint corrente: entra com label `bug`, sem estimativa.
- **Dívida técnica e infraestrutura:** entram como `chore`, estimados, limitados a 20 % dos pontos.
- **Descoberta que muda o escopo:** vai para a retrospectiva; a repriorização é decidida no papel de
  PO, no planejamento seguinte, e registrada na issue da sprint.

### Quando a sprint não fecha

Item não concluído não é "quase pronto": volta para o Sprint Backlog com o que falta descrito na
issue, e a retrospectiva registra **por que** a estimativa falhou. **Não estendo a sprint** — a
tentação de "só terminar no fim de semana" destrói o dado de velocidade, que é o que as rubricas das
Sprints 2 e 3 cobram.

### Registro e memória do processo

Trabalhando sozinho, nada é dito em voz alta para outra pessoa — logo, **o que não for escrito não
existe** na hora de montar retrospectiva, VSM e relatório final:

- Decisão técnica relevante vai para `docs/decisoes/` (contexto, opções, escolha, consequência).
- O registro diário é obrigatório mesmo em dia sem progresso — "não avancei, motivo X" é dado de
  fluxo, não confissão.
- Impedimento que dure mais de dois dias vira comentário explícito com a alternativa escolhida.
- Indisponibilidade prevista (prova, trabalho de outra disciplina) é anotada no planejamento e
  **desconta da capacidade da sprint**.

### Métricas que acompanho desde a Sprint 1

As rubricas das Sprints 2 e 3 exigem dado **do próprio repositório**, com método reprodutível — e não
há como reconstruir depois o que não foi medido.

| Métrica | Fonte | Serve para |
|---|---|---|
| Pontos concluídos por sprint | Project | Calibrar a estimativa seguinte |
| Tempo de cada cartão por coluna | Project (histórico de movimentação) | **VSM da Sprint 3**: processamento vs. espera e eficiência de fluxo |
| Frequência de deploy · lead time · taxa de falha · tempo de restauração · confiabilidade | GitHub Actions + histórico de PR e tags | **DORA das Sprints 2 e 3** |
| Tempo médio em *Em revisão* e itens que voltaram | Project | Detectar a revisão virando gargalo |
| Estimado × real por item | Issue de cada história | Calibrar a capacidade suposta de 12 pontos/sprint |
| Registros aceitos sem edição · tempo foto→registro | Log da aplicação (leitura bruta + resultado) | Validar a hipótese de valor (90 % e 5 s) |

**Definir já na Sprint 0:** script de exportação em `scripts/metricas/` (rodado no fim de cada sprint)
e `docs/dora.md` a partir da Sprint 2. Sozinho, a coleta precisa ser **um comando**, não uma rotina
manual — rotina manual é o primeiro item que se abandona numa semana cheia.

---

## T7 — Consolidação

[`docs/proposta.md`](proposta.md) tem as 7 seções na ordem do guia: visão · MVP · backlog e link do
quadro · stack e justificativa · acordo de processo · equipe · coorte e integração.

> **Atenção ao limite de páginas — os documentos da disciplina divergem.** O guia da Sprint 0 diz
> "máximo 5 páginas"; o **checklist das rubricas exige ≤ 3 páginas**. A proposta foi escrita para 3.
> Se o PDF passar disso, corte nesta ordem: (1) coluna "Por que" da tabela de stack, (2) tabela de
> limitações assumidas — já está aqui, (3) resumo do backlog, deixando só o link do quadro.
> **Vale confirmar o limite com o docente.**

**Antes de entregar:** exportar em PDF e conferir a contagem de páginas · substituir os ⟨link⟩ do
quadro e do vídeo · confirmar que o repositório está público e a licença está no lugar.

---

## T8 — Vídeo de 5 minutos

Roteiro falado, com o que mostrar na tela em cada momento:
[`docs/roteiro-video-sprint-0.md`](roteiro-video-sprint-0.md).
Slides de apoio, com o roteiro nas notas do apresentador:
[`docs/slides-video-sprint-0.pptx`](slides-video-sprint-0.pptx).

Divisão de tempo conforme a estrutura oficial do guia (30 s + 1 min 30 s × 3):

| Bloco | Tempo | Conteúdo |
|---|---|---|
| **1. Equipe** | 0:00–0:30 | Nome, matrícula, projeto **individual** com os quatro papéis. Coorte **B (online)**, sem integração |
| **2. Visão** | 0:30–2:00 | Como é a portaria hoje: caderno, ligação, ligar de novo, encomenda acumulando sem rastro. Usuário: **um só, o porteiro** |
| **3. MVP** | 2:00–3:30 | O ciclo em 5 passos. **Dizer em voz alta:** não existe login, o condomínio vem pré-cadastrado por seed, e o que ficou fora. Hipótese e as 4 metas |
| **4. Processo** | 3:30–5:00 | Cadência · cerimônias adaptadas ao trabalho individual · **Definição de Pronto item por item** · os quatro papéis · **agente de IA revisando PR + CI com gate**, dito como risco declarado · **quadro Kanban ao vivo na tela** |

**O bloco 4 é onde o projeto individual se defende.** A pergunta óbvia do avaliador é "como você
garante qualidade sem alguém revisando seu código?" — responda antes de ser perguntado, mostrando o
gate do CI e os comentários do agente num PR real.

---

## Roadmap dos artefatos das próximas sprints

| Sprint | Artefato | Depende de decidir agora |
|---|---|---|
| 1 | `docs/retrospectiva-01.md` com **ações, responsável e prazo** | — |
| 1 | Evidência de prática XP | Qual: `Co-authored-by` com agente de IA, TDD nas regras de domínio, ou histórico de refatoração |
| 2 | `docs/dora.md` — 5 métricas com método reprodutível | Começar a coletar na Sprint 1 |
| 2 | Dockerfile multi-estágio + compose subindo tudo do zero | S03 já na Sprint 1 |
| 3 | `docs/vsm.md` com tempos **medidos** | Histórico de movimentação de cartões desde a Sprint 1 |
| 3 | ≥ 3 PRs com revisão substantiva + critérios documentados | Agente de revisão configurado em S02 |
| Final | `relatorio-final.md` · `melhoria-de-processo.md` · `topologia.md` · `uso-de-ia.md` · licença | Registrar uso de IA **desde já** |

---

## Anexo técnico — arquitetura planejada

### Organização do repositório

```
EntregaAi/
├── apps/
│   ├── api/                     NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts          condomínio, unidades e moradores pré-cadastrados
│   │   └── src/
│   │       ├── integrations/
│   │       │   ├── vision/      leitura de etiqueta (porta + adaptador + prompt)
│   │       │   └── whatsapp/    envio de mensagem (porta + adaptadores)
│   │       └── modules/
│   │           ├── unidade/     leitura das unidades (sem escrita no MVP)
│   │           ├── morador/     leitura dos moradores (sem escrita no MVP)
│   │           ├── encomenda/   recebimento + fila de notificação
│   │           ├── entrega/     retirada validada
│   │           ├── vision/      orquestra leitura + casamento de morador
│   │           ├── whatsapp/    mensagens de domínio
│   │           └── fila/        configuração das filas
│   └── web/                     React + Vite — sem tela de login
│       └── pages/
│           ├── Receber.tsx       foto → leitura → confirmação
│           ├── Pendentes.tsx     busca → seleção → retirada validada
│           └── Historico.tsx     recebidos e entregues (P2)
├── docker-compose.yml           Postgres · Redis · provedor de WhatsApp
├── .github/workflows/
│   ├── ci.yml                   lint + build + testes, gate em PR
│   └── ai-review.yml            agente de IA revisando o PR
└── docs/
```

Cada módulo segue **controller → service → repository → entity/DTO**: o controller só valida, o
service tem a regra de negócio (onde ficam os testes unitários) e o repository é o único que fala com
o Prisma.

### Modelo de dados (5 entidades)

```
Condominio ──1:N── Unidade ──1:N── Morador
                       │              │
                       └──1:N── Encomenda ──1:1── Entrega
```

| Entidade | Papel | Campos que importam |
|---|---|---|
| `Condominio` | Um por instalação, vindo do seed | `padraoUnidade` (usa bloco? exemplo de unidade) — alimenta o prompt da leitura |
| `Unidade` | Apartamento | `numero` + `bloco` (único por condomínio) |
| `Morador` | Destinatário — **sem conta** | `nome`, `telefonePrincipal`, `tipo` (principal/dependente) |
| `Encomenda` | Item recebido | `status` (pendente/entregue/extraviada), `notificada`, `localArmazenamento`, `fotoUrl`, `leituraBruta` |
| `Entrega` | Retirada | `moradorId`, `telefoneValidado` (**só os 4 últimos dígitos**), `metodoValidacao` (telefone/manual), `observacao` |

**Não existe entidade `User`** — sem login, não há quem autenticar. A consequência está declarada na
proposta: o registro guarda **o que** aconteceu e **quando**, não **quem** operou.

Convenções: chaves UUID · `deletedAt` para exclusão lógica · índices compostos em
`(condominioId, status)` e `(moradorId, notificada, status)`.

### Conteúdo do seed (S01)

| O que | Quantidade | Observação |
|---|---|---|
| Condomínio | 1 | Nome, endereço completo e padrão de unidade do prédio piloto |
| Unidades | ~40 | Cobrindo os dois formatos: com bloco/torre e sem bloco |
| Moradores | ~80 | Um principal por unidade + dependentes; nomes que exercitam o casamento (nome composto, sobrenome repetido na mesma unidade, homônimo em unidades diferentes) |
| Telefones | — | **Apenas números meus** ou de teste do provedor. Nunca telefone real de terceiro sem consentimento |

O seed é **idempotente** e roda em base limpa — a Definição de Pronto cobra isso a cada item.

### Pipeline de leitura da etiqueta

1. **Captura** — `<input type="file" accept="image/*" capture="environment">`; a imagem vira base64.
2. **`POST /vision/read-label`** — o condomínio vem da configuração do servidor, não do corpo da
   requisição (não há sessão de onde tirá-lo).
3. **Compressão** — sharp reduz para no máximo 800 px e JPEG de qualidade 65 antes de sair do
   servidor. É o que viabiliza a meta de 5 s.
4. **Prompt com contexto do prédio** — o *system prompt* recebe o endereço do condomínio (para o
   modelo **não** confundir número do prédio ou CEP com número do apartamento), o formato esperado da
   unidade e se existem blocos/torres.
5. **Saída estruturada obrigatória** — o modelo é forçado a chamar `extract_label(apt, bloco,
   destinatario, confianca)`; `temperature = 0` e teto baixo de tokens. Nada de texto livre.
6. **Tempo limite** — vencido o prazo, a resposta volta com confiança `falhou` e o porteiro digita. O
   fluxo da portaria nunca depende de a IA estar disponível. **Calibrar o timeout abaixo da meta de
   5 s**, para o fallback disparar antes de a meta estourar.

### Identificação do morador

Comparação exata falharia: a etiqueta traz "Ma. Sarah S. Oliveira" e o cadastro tem "Maria Sarah
Silva Oliveira". O motor:

1. **Normaliza** — maiúsculas, remove acentos e pontuação, colapsa espaços.
2. **Pontua o nome** por similaridade de Dice, com bônus quando todos os sobrenomes buscados aparecem
   no candidato e penalidade quando o primeiro nome não bate.
3. **No MVP**, só o casamento direto: unidade lida existe + um morador acima do limiar → preenche.
   Caso contrário, campos em branco para o porteiro completar. Estratégias de aproximação (bloco
   ilegível, número ilegível, busca por nome no condomínio inteiro) são **H06, no P2**.
4. **Registra a decisão** (pontuação, nº de candidatos, motivo da falha) — é o que permite medir a
   meta de ≥ 90 % sem edição.

### Notificação assíncrona

- O registro **enfileira** e responde na hora. Se o Redis estiver lento, o porteiro não espera e o
  erro é apenas logado.
- Ao processar: busca as pendências não notificadas, monta a mensagem e só então marca
  `notificada = true` — se o envio falhar, a retentativa reaproveita o estado.
- Retentativa com atraso exponencial; teto de tentativas configurável.
- Consolidação de várias encomendas numa mensagem é **H08, no P2**: no MVP, uma encomenda, uma
  mensagem.

### Endpoints previstos

| Método | Rota | Para quê |
|---|---|---|
| `POST` | `/vision/read-label` | Foto da etiqueta → campos sugeridos |
| `GET` `POST` `PATCH` | `/encomendas` | Recebimento e listagem (filtro por status, busca, paginação) |
| `POST` | `/entregas` | Retirada validada |
| `GET` | `/entregas/historico` | Histórico com filtros (P2) |
| `GET` | `/unidades` · `/moradores` | Leitura para preenchimento e seleção (**sem escrita no MVP**) |

Não há endpoints de autenticação nem de criação de usuário, unidade ou morador — contrapartida direta
das decisões de escopo.

### Riscos técnicos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| **Sem autenticação, qualquer um com a URL opera** | Registro indevido; exposição de nomes e telefones | Ambiente publicado com URL não divulgada e acesso restrito por rede/senha de infraestrutura durante o piloto; autenticação é o primeiro item pós-MVP. **Não usar dados reais de terceiros no seed** |
| Provedor de WhatsApp bloqueia o número em desenvolvimento | Demo quebra na review | Porta + adaptador: número de teste em dev, API oficial em produção; nenhuma regra de domínio depende do provedor |
| Meta de 5 s não se sustentar com a latência do modelo | Métrica-chave falha | Compressão agressiva, teto de tokens, cache do prompt de sistema; se não fechar, a retrospectiva reajusta a meta **com o dado medido**, não por conveniência |
| Leitura errada gera aviso ao morador errado | Perda de confiança e exposição indevida | Confirmação humana obrigatória antes de salvar; nunca inventar unidade; mensagem para destinatário não cadastrado orienta procurar a portaria |
| **Dados só por seed** | Morador novo exige reexecutar o script | Limitação declarada; seed idempotente; CRUD é o primeiro item pós-MVP junto com autenticação |
| Etiqueta com dado pessoal (foto, nome, telefone) | Exposição de dado pessoal | Guardar somente **4 dígitos** do telefone na validação; telefones do seed são meus; política de retenção da foto definida antes do piloto |
| Trabalho individual: nenhuma folga quando eu travo | Sprint não fecha | WIP de 1 item, checkpoint de meio de sprint para cortar escopo cedo, registro diário expondo o impedimento em 24 h |

### Ambiente

```bash
docker compose up -d      # Postgres, Redis e provedor de WhatsApp
npm install
npm run db:migrate        # prisma migrate dev
npm run db:seed           # condomínio, unidades e moradores
npm run dev               # API :3000 · web :5173
npm test                  # Jest
```

Variáveis de ambiente (documentar em `apps/api/.env.example`): `DATABASE_URL`, `REDIS_HOST`,
`REDIS_PORT`, `CONDOMINIO_ID` (o condomínio único da instalação), chave da API de visão, provedor e
credenciais do WhatsApp. **Nenhum segredo no repositório.**
