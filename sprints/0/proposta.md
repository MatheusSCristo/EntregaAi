# Proposta — EntregaAí

**Matheus Senas de Cristo** · 20240002384 · [@MatheusSCristo](https://github.com/MatheusSCristo) ·
projeto individual · **Coorte B (online)** · DIM0510 — 2026.2

**Repositório** github.com/MatheusSCristo/EntregaAi · 
**Quadro** https://github.com/MatheusSCristo/EntregaAi/wiki/Backlog · 
**Vídeo** [⟨link⟩](https://github.com/MatheusSCristo/EntregaAi/blob/main/sprints/0/Sprint0.mp4)

---

## 1. Visão do produto

```
Para porteiros de condomínios residenciais de 50 a 300 unidades
Que anotam encomendas no caderno e ligam para o morador até alguém atender
O EntregaAí é um sistema web de portaria
Que lê a etiqueta a partir de uma foto, identifica a unidade e o morador e notifica o
   destinatário no WhatsApp na hora
Diferente de cadernos, planilhas e módulos de encomenda que exigem digitar unidade e nome
Nosso produto tira a digitação do momento de pico e troca a ligação por uma mensagem automática
```

**O problema.** O processo é manual de ponta a ponta. A encomenda chega e o porteiro **anota no
caderno** — nome e apartamento à mão, no meio da fila de entregadores. Depois **liga para o morador**,
uma encomenda por vez; se não atende, **liga de novo**, e de novo mais tarde: o aviso depende da
insistência de quem está na portaria. O resultado é encomenda **acumulando por dias** e, quando
alguém finalmente retira, **nenhum registro de quem foi** — qualquer reclamação de extravio vira a
palavra do morador contra a do porteiro.

**Usuário.** Um único perfil: o **porteiro** — celular ou monitor na guarita, turno de 12 h, pouca
familiaridade com software. O **morador** existe no sistema apenas como nome e telefone: não tem
conta, não acessa nada, só recebe a mensagem no WhatsApp.

**Viabilidade.** Cabe em quatro sprints de trabalho individual porque não há login, não há telas de
cadastro (o condomínio vem pré-cadastrado por seed), a "IA" é uma chamada a um modelo multimodal
existente e a notificação usa WhatsApp — sem app nativo.

---

## 2. Definição do MVP

**Hipótese de valor.** Acreditamos que **porteiros** vão **fotografar a etiqueta em vez de anotar no
caderno** porque **o registro deixa de ser digitação e o morador é avisado sozinho, sem ninguém
precisar ligar**.

| No MVP — um usuário, sem login | Fora do MVP |
|---|---|
| Recebimento com foto: bloco, unidade e destinatário preenchidos e editáveis | **Login, autenticação e autorização** |
| Identificação da unidade e do morador no cadastro pré-carregado | Telas de cadastro — os dados vêm do seed |
| Registro com local de armazenamento, observação e leitura bruta para auditoria | Qualquer perfil de usuário além do porteiro |
| Lista de pendentes da portaria | Identificação por aproximação quando a unidade está ilegível |
| Notificação automática no WhatsApp, com retentativa | Autoatendimento do morador (portal, app, consulta) |
| Retirada validada pelos 4 últimos dígitos do telefone, ou manual justificada | Cobrança, planos, multi-condomínio |
| — | App nativo · bot de WhatsApp · biometria · rastreio de transportadora · modo offline |

**Escopo estendido (P2, nesta ordem, se houver capacidade):** histórico auditável · candidatos quando
a leitura é ambígua · busca em pendentes · mensagem consolidada · retirada em lote.

| Critério de sucesso | Meta |
|---|---|
| Registros aceitos sem edição do que a IA leu | ≥ 90 % |
| Tempo mediano da foto até o registro salvo | ≤ 5 s |
| Encomendas notificadas em até 5 min do registro | ≥ 95 % |
| Retiradas validadas por telefone (não manual) | ≥ 80 % |

**Pronto quando** um porteiro real, com 5 minutos de demonstração, faz no ambiente publicado: abre o
app → fotografa a etiqueta → confirma o registro → o morador recebe o WhatsApp → registra a retirada
validando os 4 dígitos. E todo item P1 está em **Pronto** conforme a seção 5.

**Limitações assumidas e declaradas.**

1. **Sem autenticação:** quem abre a URL opera como a portaria. É aceitável no piloto — o sistema roda
   na rede da guarita e o único operador é o porteiro — e autenticação é o primeiro item pós-MVP.
2. **Sem login, não há autoria por pessoa:** o registro guarda o que aconteceu e quando, não quem
   operou. O rastro da retirada (morador, horário, método de validação) existe; a identificação do
   porteiro que atendeu, não.
3. **Dados por seed:** morador ou telefone novo exige reexecutar o script.

---

## 3. Backlog inicial

No **GitHub Projects** deste repositório: **⟨link do quadro⟩** — é lá que vivem os critérios de
aceitação de cada história.

10 histórias, todas priorizadas e estimadas (Fibonacci), mais 4 `chore` de infraestrutura.

| Prio | História | Pontos | Sprint |
|---|---|---|---|
| P1 | H01 · Como porteiro, quero registrar a encomenda e vê-la na lista de pendentes, para saber o que está guardado e onde | 3 | 1 |
| P1 | H02 · Como porteiro, quero fotografar a etiqueta e receber bloco, unidade e destinatário preenchidos, para não digitar em horário de fila | 8 | 2 |
| P1 | H03 · Como morador, quero receber WhatsApp quando minha encomenda chegar, para ninguém precisar me ligar | 8 | 3 |
| P1 | H04 · Como porteiro, quero validar a retirada pelos 4 últimos dígitos do telefone, para ter prova de que entreguei à pessoa certa | 5 | 3 |
| P1 | `chore` S01 seed do condomínio · S02 CI com gate · S03 docker-compose · S04 ambiente publicado | 10 | 1–2 |
| P2 | H05 histórico auditável (5) · H06 candidatos na leitura ambígua (3) · H07 busca em pendentes (3) · H08 mensagem consolidada (5) · H09 retirada em lote (3) | 19 | 4 |
| P3 | H10 · aviso ao destinatário quando outra pessoa retira | 3 | — |

Épicos: **E1 Recebimento com IA** · **E2 Notificação** · **E3 Retirada validada** · **E4 Histórico**.

---

## 4. Stack tecnológico e justificativa

| Camada | Escolha | Por que |
|---|---|---|
| Monorepo e API | Turborepo + NestJS 11 (TypeScript) | Um repositório, um quadro; módulos por domínio mantêm os PRs pequenos e revisáveis |
| Banco e dados | PostgreSQL + Prisma · `prisma/seed.ts` | Relações fortes (condomínio → unidade → morador → encomenda → entrega) pedem relacional; o seed substitui as telas de cadastro e recria o condomínio piloto com um comando |
| Sem camada de autenticação | — | Não há login, sessão nem perfil: a economia é uma sprint inteira, e o app é a própria tela da portaria |
| Assíncrono | BullMQ + Redis | A notificação não pode travar o registro na portaria, e a retentativa é o que a torna confiável sem eu monitorar |
| Leitura da etiqueta | Modelo multimodal via API, saída estruturada por *tool schema* · sharp (800 px) | Devolve `{bloco, unidade, destinatário, confiança}` já interpretado, com o padrão de unidade do prédio como contexto; a compressão corta custo e latência — e é o que viabiliza a meta de 5 s |
| Casamento de nomes | Similaridade de Dice + normalização | "Ma. Sarah S. Oliveira" ≠ "Maria Sarah Silva Oliveira": comparação exata falharia |
| WhatsApp | Porta + adaptador (API oficial / provedor self-hosted em dev) | Demonstro sem depender de aprovação de conta comercial |
| Front-end | React 19 + Vite + Tailwind + TanStack Query | Três telas de uso em pé; captura por `<input capture="environment">`, sem app nativo |
| Testes, infra e CI | Jest + Supertest · Docker Compose · GitHub Actions com gate em PR | Trabalhando sozinho, o CI é o revisor que não cansa |

---

## 5. Acordo de processo

**Cadência.** Sprints de **2 semanas**: planejo na ⟨segunda⟩ da primeira semana e fecho na ⟨sexta⟩ da
segunda. Escopo congela após o planejamento.

| Cerimônia | Quando | Duração | Formato individual |
|---|---|---|---|
| Planejamento | início da sprint | 45 min | Issue da sprint: meta e itens escolhidos |
| Registro diário | dias úteis | 5 min | Duas linhas na issue: o que fiz, o que travou |
| Checkpoint | meio da sprint | 20 min | Quadro × meta; corto escopo aqui, não no fim |
| Review + retrospectiva | fim da sprint | 60 min | Demo gravada no ambiente publicado + `docs/retrospectiva-0N.md` com ações e prazo |

**Papéis (acumulados, separados por momento).** Product Owner no planejamento e no aceite ·
Desenvolvedor na sprint · Revisor ao responder o agente de IA · Qualidade no teste manual antes de
"Pronto".

**Revisão de código.** Sem par humano, todo Pull Request é revisado por **agente de IA acionado
automaticamente pelo GitHub Actions**. Cada apontamento é **resolvido ou justificado por escrito no
PR** antes do merge: a IA comenta, eu decido, a decisão fica registrada. Uso e limites vão para
`docs/uso-de-ia.md`. Isso cobre padrões, casos de borda e consistência — não substitui julgamento de
produto, e **confirmarei com o docente** se atende ao critério da Sprint 3.

**Definição de Pronto** — um item sai de "Em revisão" quando **todos** valem:

1. Critérios de aceitação marcados na issue.
2. Pull Request para `main` vinculado à issue — nunca commit direto em `main`.
3. Apontamentos do agente de IA resolvidos ou justificados no PR.
4. CI verde (lint, build, testes) — **gate obrigatório**, sem merge com falha.
5. Regra de negócio nova coberta por teste; migration versionada e seed rodando em base limpa.
6. Verificado à mão no ambiente publicado, no celular; nenhum segredo no repositório.
7. `README`/docs atualizados quando muda instalação, execução ou fluxo.

**Ferramentas.** GitHub — código, PR, Actions e agente de revisão · GitHub Projects — backlog e
quadro · GitHub Issues — histórias, bugs e registro diário · decisões em `docs/decisoes/` · métricas
de fluxo e DORA extraídas do Project e do Actions.

| Coluna | WIP | Significado |
|---|---|---|
| Backlog | — | Priorizado, fora da sprint |
| Sprint Backlog | ≤ 5 | Comprometido para a sprint |
| Em progresso | **1** | Só uma coisa em código por vez |
| Em revisão | **2** | PR aberto, revisão da IA em curso |
| Pronto | — | Atende integralmente à Definição de Pronto |

`Em progresso = 1` é o limite crítico: sozinho, a falha típica é abrir três frentes e não fechar
nenhuma. Item bloqueado recebe a label `blocked` e volta ao Sprint Backlog com o motivo em comentário.

---

## 6. Equipe

| Nome | Matrícula | GitHub | Papéis |
|---|---|---|---|
| Matheus Senas de Cristo | 20240002384 | @MatheusSCristo | Product Owner · Desenvolvedor · Revisor · Qualidade |

Projeto individual, dentro do limite de 1 a 4 integrantes.

---

## 7. Coorte, quadro e integração

- **Coorte:** B (online).
- **Quadro:** ⟨link do Projects⟩ — colunas Backlog · Sprint Backlog · Em progresso · Em revisão ·
  Pronto, com os WIP limits da seção 5 e as 10 histórias posicionadas.
- **Integração com outra disciplina:** não há.
- **Licença:** MIT.
