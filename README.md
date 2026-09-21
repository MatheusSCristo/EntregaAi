# EntregaAí

Sistema de portaria que registra encomendas a partir de **uma foto da etiqueta**: uma IA lê o rótulo,
identifica a unidade e o morador no cadastro do condomínio e **notifica o destinatário no WhatsApp**
automaticamente. A retirada é validada pelos 4 últimos dígitos do telefone do morador.

> Projeto acadêmico da disciplina **DIM0510 — Processos de Software** · 2026.2 · UFRN

**Status: Sprint 0 (planejamento).** Ainda não há código neste repositório — o primeiro incremento
executável chega na Sprint 1. O que existe hoje são os artefatos de planejamento em [`docs/`](docs/).

---

## O problema

Hoje, na portaria, o processo é manual de ponta a ponta:

1. A encomenda chega e o porteiro **anota no caderno** — nome e apartamento à mão, no meio da fila de
   entregadores.
2. Ele **liga para o morador**, uma encomenda por vez.
3. Se o morador não atende, **liga de novo**. E de novo mais tarde. O aviso depende da insistência do
   porteiro.
4. A encomenda **acumula** na portaria por dias — e quando alguém retira, não fica registro de quem
   foi.

## A proposta

**Foto → IA → WhatsApp.** O porteiro fotografa a etiqueta; o sistema devolve bloco, unidade e
destinatário já preenchidos e editáveis; ao confirmar, o morador recebe a mensagem na hora. Na
retirada, a validação pelos 4 últimos dígitos do telefone deixa registro de que a encomenda foi
entregue à pessoa certa.

## Escopo do MVP

**O porteiro é o único usuário — e não existe login.** O app abre direto na operação.

| No MVP | Fora do MVP |
|---|---|
| Recebimento com foto e leitura da etiqueta | **Login, autenticação e autorização** |
| Identificação da unidade e do morador no cadastro | Telas de cadastro — os dados vêm do seed |
| Registro com local de armazenamento, observação e auditoria da leitura | Qualquer perfil de usuário além do porteiro |
| Notificação automática no WhatsApp, com retentativa | Autoatendimento do morador (portal, app, consulta) |
| Retirada validada pelos 4 últimos dígitos do telefone | Cobrança, planos e multi-condomínio |
| Lista de pendentes da portaria | App nativo · bot de WhatsApp · biometria · rastreio de transportadora · modo offline |

**Condomínio, unidades e moradores vêm pré-cadastrados** por um script de seed versionado. O morador
existe no sistema apenas como **nome e telefone**: não tem conta, não acessa nada — só recebe a
mensagem.

Escopo completo, backlog e critérios de aceitação: [`docs/proposta.md`](docs/proposta.md).

## Equipe

Projeto individual.

| Nome | Matrícula | GitHub | Papéis |
|---|---|---|---|
| Matheus Senas de Cristo | 20240002384 | [@MatheusSCristo](https://github.com/MatheusSCristo) | Product Owner · Desenvolvedor · Revisor · Qualidade |

- **Coorte de apresentação:** B (online)
- **Integração com outra disciplina:** não há

## Documentos

- **Proposta da Sprint 0:** [`docs/proposta.md`](docs/proposta.md) — visão, MVP, backlog, stack e
  acordo de processo
- **Quadro (GitHub Projects):** ⟨link⟩ — backlog priorizado, com os critérios de aceitação em cada
  história
- **Vídeo da Sprint 0 (5 min):** ⟨link⟩

## Stack prevista

| Camada | Escolha |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| API | NestJS 11 (TypeScript) |
| Banco | PostgreSQL + Prisma, com `prisma/seed.ts` versionado |
| Assíncrono | BullMQ sobre Redis |
| Leitura da etiqueta | Modelo multimodal via API, com saída estruturada |
| WhatsApp | Porta + adaptador (API oficial / provedor self-hosted em desenvolvimento) |
| Front-end | React 19 + Vite + TypeScript + Tailwind |
| CI | GitHub Actions — lint, build e testes, com gate em PR |

Justificativa de cada escolha: [`docs/proposta.md`](docs/proposta.md#4-stack-tecnológico-e-justificativa).

## Como rodar

Será preenchido na Sprint 1, quando existir o primeiro incremento. O fluxo planejado:

```bash
git clone https://github.com/MatheusSCristo/EntregaAi.git
cd EntregaAi
cp apps/api/.env.example apps/api/.env   # preencha as chaves
docker compose up -d                     # Postgres, Redis e provedor de WhatsApp
npm install
npm run db:migrate                        # cria o schema
npm run db:seed                           # condomínio, unidades e moradores pré-cadastrados
npm run dev                               # API em :3000 · web em :5173
```

## Processo

- **Sprints de 2 semanas.** Planejamento na issue da sprint; registro diário de duas linhas;
  checkpoint no meio; review com demo gravada e retrospectiva escrita no fim.
- **Quadro Kanban** com 5 colunas e WIP declarado — *Em progresso = 1*, *Em revisão = 2*.
- **Revisão de código por agente de IA** acionado pelo GitHub Actions em todo Pull Request: cada
  apontamento é resolvido ou justificado por escrito antes do merge.
- **Definição de Pronto** em 7 itens, com CI verde como gate obrigatório.

Acordo completo: [`docs/proposta.md`](docs/proposta.md#5-acordo-de-processo).

## Licença

[MIT](LICENSE)

## Checklist das sprints

### Sprint 0
- [x] Repositório público + README completo
- [x] `docs/proposta.md` (≤3 pág.)
- [x] GitHub Projects com ≥5 itens, ≥3 estimados
- [x] Coorte declarada (A=presencial / B=online)
- [ ] Integração com outra disciplina declarada (se houver)
- [x] Vídeo 5 min

### Sprint 1
- [ ] Incremento funcional em `main`
- [ ] Kanban com WIP limits configurados
- [ ] Evidência de prática XP
- [ ] `docs/retrospectiva-01.md` com ações
- [ ] Vídeo 5 min

### Sprint 2
- [ ] CI verde (build + testes + lint) com gate em PR
- [ ] `Dockerfile` + `docker-compose.yml`
- [ ] `docs/dora.md` com as 5 métricas e método
- [ ] Segundo incremento
- [ ] Vídeo 5 min

### Sprint 3
- [ ] `docs/vsm.md` com tempos medidos
- [ ] ≥2 gargalos com dados
- [ ] 1–2 melhorias com métrica-alvo
- [ ] ≥3 PRs com revisão substantiva
- [ ] Evolução DORA S2→S3
- [ ] Vídeo 5 min

### Entrega Final
- [ ] MVP funcional, CI verde, README completo e licença
- [ ] `docs/relatorio-final.md` (≤6 pág.)
- [ ] `docs/melhoria-de-processo.md` (≤4 pág.)
- [ ] `docs/topologia.md` (≤1 pág.)
- [ ] `docs/uso-de-ia.md`
- [ ] Vídeo 10 min
- [ ] Apresentação ao vivo
