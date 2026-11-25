# EntregaAí

Sistema de portaria para registrar encomendas, conferir pendentes e validar retiradas.
A leitura de **foto da etiqueta** sugere unidade e morador para confirmação humana.
Nesta entrega, o **WhatsApp é simulado**, com fila e retentativas; nenhuma mensagem real é enviada.
A retirada é validada pelos 4 últimos dígitos do telefone ou por justificativa manual.

> Projeto acadêmico da disciplina **DIM0510 — Processos de Software** · 2026.2 · UFRN

**Status: Sprint 2 — MVP local.** API, web, banco, seed, leitura assistida de etiqueta,
WhatsApp fake e retirada estão implementados. O cadastro manual funciona sem credenciais;
a leitura real de fotos exige chave OpenAI. O ensaio automatizado pode usar leitura controlada,
sem chamar serviços externos. Não houve teste com pessoa externa, por decisão do responsável.

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
destinatário já preenchidos e editáveis; ao confirmar, uma notificação entra na fila de teste. Na
retirada, a validação pelos 4 últimos dígitos do telefone deixa registro de que a encomenda foi
entregue à pessoa certa.

## Escopo do MVP

**O porteiro é o único usuário — e não existe login.** O app abre direto na operação.

| No MVP | Fora do MVP |
|---|---|
| Recebimento com foto e leitura da etiqueta | **Login, autenticação e autorização** |
| Identificação da unidade e do morador no cadastro | Telas de cadastro — os dados vêm do seed |
| Registro com local de armazenamento, observação e auditoria da leitura | Qualquer perfil de usuário além do porteiro |
| WhatsApp simulado, com fila e retentativa | Envio real de WhatsApp; autoatendimento do morador |
| Retirada validada pelos 4 últimos dígitos do telefone | Cobrança, planos e multi-condomínio |
| Lista de pendentes da portaria | App nativo · bot de WhatsApp · biometria · rastreio de transportadora · modo offline |

**Condomínio, unidades e moradores vêm pré-cadastrados** por um seed versionado.
O morador existe no sistema apenas como nome e telefone: não tem conta nem acessa o app.
Os dados do seed são fictícios; o simulador não envia mensagens a esses números.

Escopo completo, backlog e critérios de aceitação: [`sprints/0/proposta.md`](sprints/0/proposta.md).

## Equipe

Projeto individual.

| Nome | Matrícula | GitHub | Papéis |
|---|---|---|---|
| Matheus Senas de Cristo | 20240002384 | [@MatheusSCristo](https://github.com/MatheusSCristo) | Product Owner · Desenvolvedor · Revisor · Qualidade |

- **Coorte de apresentação:** B (online)
- **Integração com outra disciplina:** não há

## Documentos

- **Proposta da Sprint 0:** [`sprints/0/proposta.md`](sprints/0/proposta.md) — visão, MVP, backlog, stack e
  acordo de processo
- **Quadro (GitHub Projects):** [Kanban](https://github.com/users/MatheusSCristo/projects/9) — backlog priorizado, com os critérios de aceitação em cada
  história
- **Vídeo da Sprint 0:** [arquivo versionado](sprints/0/Sprint0.mp4)
- **Validação local do MVP:** [roteiro, evidências e limites](docs/validacao-mvp.md)

## Stack implementada

| Camada | Escolha |
|---|---|
| Monorepo | npm workspaces |
| API | NestJS 11 (TypeScript) |
| Banco | PostgreSQL + Prisma, com `prisma/seed.ts` versionado |
| Assíncrono | Fila persistente no PostgreSQL; Redis permanece no Compose, sem BullMQ nesta entrega |
| Leitura da etiqueta | Modelo multimodal via API, com saída estruturada |
| WhatsApp | Porta + adaptador fake local, sem provedor externo |
| Front-end | React 19 + Vite + TypeScript + CSS |
| CI | GitHub Actions — lint, build e testes, com gate em PR |

Justificativa de cada escolha: [`sprints/0/proposta.md`](sprints/0/proposta.md#4-stack-tecnológico-e-justificativa).

## Como rodar

Pré-requisito: Docker Desktop (ou Docker Engine com Compose) em execução.
Portas livres: 5173 (web), 3000 (API), 5433 (PostgreSQL) e 6379 (Redis).
Não é necessário instalar Node, npm ou configurar `.env` para cadastro manual,
WhatsApp simulado e retirada. Para interpretar fotos reais, configure a chave
conforme a seção de leitura de etiqueta; falha na leitura permite preenchimento manual.

```bash
git clone https://github.com/MatheusSCristo/EntregaAi.git
cd EntregaAi
docker compose up --build -d --wait
```

Abra [a portaria](http://localhost:5173). A primeira construção baixa dependências;
as próximas reutilizam as imagens. O Compose inicia banco e Redis, aplica migrations,
cria dados de demonstração sem apagar os existentes e inicia API e web com health checks.
A configuração é para demonstração local: portas acessíveis somente pela própria máquina.

Dependências e credenciais:

| Fluxo | Serviços | Credenciais |
| --- | --- | --- |
| Cadastro manual, pendentes e retirada | Docker, API, web e PostgreSQL | Nenhuma chave externa |
| WhatsApp fake | Consumidor da API + PostgreSQL | Nenhuma; não há envio real |
| Leitura real de foto | OpenAI Responses API + internet | `OPENAI_API_KEY`, somente no ambiente da API |
| Ensaio compilado abaixo | PostgreSQL e imagem da API com dependências de teste | Nenhuma; leitor controlado injetado somente no ensaio |

A licença do projeto é [MIT](LICENSE). Instalação inicial de imagens e pacotes
requer internet; o ensaio automatizado não chama OpenAI nem WhatsApp.

### Ensaio reproduzível do MVP compilado (S2-12)

Em um ambiente de teste, após a subida do Compose:

```bash
docker compose exec -T api node apps/api/scripts/verificar-mvp.cjs
```

O comando usa os módulos compilados e um PostgreSQL real, cria dados fictícios
próprios e remove somente esses dados ao terminar. Confere foto PNG/Sharp,
auditoria, confirmação, WhatsApp fake, reinício da aplicação de teste, retirada,
código incorreto, duplicação de retirada, leitura parcial e falha de leitura.
O leitor de foto substituto existe apenas no processo de teste; a API normal
continua exigindo chave para leitura real. O resultado é JSON com horários e duração.
Esse ensaio roda no CI após o build. Não mede usabilidade humana nem equivale a
uma validação visual de câmera/celular ou teste por pessoa externa.

Escolha um morador, registre uma encomenda com local de armazenamento e recarregue
a página. Para verificar persistência, execute `docker compose down`, depois
`docker compose up -d --wait`: encomendas e moradores devem permanecer.
`docker compose logs api` mostra falhas de inicialização. Para parar sem apagar
os dados: `docker compose down`. A opção `down -v` apaga definitivamente os volumes.

Para desenvolver com Node 22.16.0 (`.nvmrc`) e npm 10.9.2 (`packageManager`), mantenha apenas os serviços de infraestrutura:

```bash
docker compose up -d --wait postgres redis
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Nesse modo, copie `apps/api/.env.example` para `apps/api/.env` e use PostgreSQL
em `localhost:5433`; ajuste a URL antes de migrar. Se os containers API/web estiverem
rodando, pare-os antes de usar as mesmas portas no desenvolvimento local.

### Lista de encomendas pendentes (P03)

A tela inicial consulta `GET /api/encomendas/pendentes` e mostra morador, bloco,
apartamento, local de armazenamento e data/hora de recebimento, com as mais recentes
primeiro. A consulta inclui somente o status `pendente`; encomendas `entregue` ou
`extraviada` ficam fora da lista. Os registros são persistidos no PostgreSQL e
consultados novamente ao recarregar a página. Após registrar uma encomenda, a lista
é atualizada automaticamente. Falhas de consulta mostram uma opção de tentar novamente.

Para conferir o fluxo localmente:

1. Inicie o banco, execute as migrations e o seed e abra o app conforme os comandos acima.
2. Registre uma encomenda e confira morador, unidade, local e horário na lista.
3. Recarregue a página e confirme que a encomenda continua visível.
4. Sem pendentes no banco, confira a mensagem de lista vazia. Com a API indisponível,
   confira a mensagem de erro e use **Tentar novamente** após restabelecer a API.

Execute `npm test` para verificar os testes da API, incluindo o filtro de status e
os dados devolvidos pela consulta de pendentes.

### Retirada de encomenda na API (S2-05)

Com as migrations aplicadas, envie `POST /api/encomendas/<id>/retirada` com
`Content-Type: application/json` e um dos seguintes corpos.

- Por telefone: `{"metodo":"telefone","codigo":"0042"}`. Envie o código como texto
  para preservar zeros à esquerda. A API confere os quatro últimos dígitos do
  telefone do morador vinculado à encomenda.
- Manual: `{"metodo":"manual","justificativa":"Documento conferido na portaria"}`.
  A justificativa é obrigatória.

A resposta `200` contém `id`, `status` (`entregue`), `retiradaEm`,
`metodoRetirada` e `justificativaRetirada`. Confira que a encomenda sai da lista
de pendentes. Um código incorreto ou uma solicitação inválida retorna `400` e
preserva o registro. Um ID válido sem encomenda retorna `404`. Uma encomenda
fora do status pendente retorna `409`, inclusive em tentativas concorrentes.

### Leitura de etiqueta por foto na API (S2-07)

Configure `OPENAI_API_KEY` em `apps/api/.env` para execução local. No Compose,
defina a variável no ambiente do terminal ou no `.env` da raiz antes de subir a API.
`OPENAI_ETIQUETA_MODEL` é opcional e usa `gpt-4.1-mini` por padrão.
Aplique as migrations e carregue o seed conforme o modo de execução acima.

Envie uma foto JPEG, PNG ou WebP de até 5 MiB no campo multipart `foto`.
Para testar, use uma etiqueta fictícia com bloco, número e nome de um destinatário
retornado por `GET /api/encomendas/destinatarios`.

```sh
curl -F "foto=@etiqueta.jpg" http://localhost:3000/api/encomendas/leitura-etiqueta
```

A API devolve `leituraId`, `campos`, `status` e `sugestao`. O status
`aguardando_confirmacao` indica que bloco, número e nome correspondem a um único
morador ativo de uma unidade ativa. Confirme os dados antes de registrar a encomenda
pelo fluxo existente. Com `inconclusiva`, a portaria deve selecionar o destinatário
manualmente. Foto inválida retorna 400, tamanho acima do limite retorna 413 e
indisponibilidade do provedor retorna 503.

A API envia ao provedor uma versão da foto com até 800 px no maior lado.
A resposta bruta fica na tabela `leituras_etiqueta` para auditoria, identificada
por `leituraId`. A foto é processada em memória.

### Recebimento por foto na portaria (S2-08)

Em **Novo recebimento**, toque em **Fotografar etiqueta** para abrir a câmera
traseira em celulares compatíveis, ou use **Selecionar foto**. Use JPEG, PNG
ou WebP de até 5 MiB. Para testar a leitura, configure a chave conforme a seção
anterior e use uma etiqueta fictícia com os dados de um morador do seed.

Confira bloco, unidade e nome. Se editar os campos ou se a leitura falhar,
selecione o destinatário no cadastro. **Limpar dados da etiqueta** volta a
mostrar todas as opções. Preencha o local de armazenamento e clique em
**Registrar encomenda**. Confira a nova encomenda nos pendentes e recarregue a
página para verificar a persistência.

### WhatsApp simulado com fila (S2-09)

O WhatsApp desta entrega é **fake, apenas para teste**, conforme decisão de escopo.
Nenhuma mensagem real é enviada e não é necessário configurar provedor ou credenciais.
Ao registrar uma encomenda, sua notificação entra na mesma transação do banco.
Um consumidor verifica a fila a cada 2 segundos, sem aguardar o envio na resposta do cadastro.

No Compose, o simulador funciona por padrão. Para desenvolvimento sem Docker,
copie as opções de `apps/api/.env.example` para o `.env` da API. Nos pendentes,
clique em **Atualizar status**: o resultado aparece como **WhatsApp (teste): Simulação concluída**.
Encomendas anteriores à migração ficam sem notificação; não há disparo retroativo.

| Opção | Valor padrão | Uso |
| --- | --- | --- |
| `WHATSAPP_PROVIDER` | `fake` | `disabled` pausa a fila sem consumir tentativas. |
| `WHATSAPP_FAKE_MODE` | `sucesso` | `temporaria`, `permanente` ou `incerta` simulam falhas. |
| `WHATSAPP_FAKE_FAILURES` | `1` | Quantas tentativas falham no modo `temporaria`, por notificação. |

Para demonstrar retentativa, defina `WHATSAPP_FAKE_MODE=temporaria`, reinicie a API
(no Compose: `docker compose up -d --force-recreate api`) e registre uma encomenda.
A primeira tentativa falha; a segunda ocorre após pelo menos 60 segundos.
Com `WHATSAPP_FAKE_FAILURES=3`, o item termina em falha após três tentativas,
com esperas de 60 e 120 segundos. `permanente` termina na primeira tentativa.
`incerta` exige conferência e não é reenviada automaticamente. As opções de
modo se aplicam aos itens ainda na fila; itens concluídos não são reabertos.

O estado, tentativas, horário da simulação e código de falha são consultáveis em
`GET /api/encomendas/pendentes`, campo `notificacaoWhatsApp`, sem expor telefone completo.
A fila usa PostgreSQL, dispensando uma segunda gravação no Redis. O adaptador
é substituível; envio real e confirmação de recebimento não integram este escopo.

Teste adicional com PostgreSQL e migrations aplicadas:
`npm run test:whatsapp --workspace api`, com `DATABASE_URL` apontando a um banco
de teste. O teste cria seus próprios dados fictícios e remove somente esses registros.
Ele também roda no CI. Detalhes: [verificação S2-09](docs/verificacao-s2-09.md).

## Processo

- **Sprints de 2 semanas.** Planejamento na issue da sprint; registro diário de duas linhas;
  checkpoint no meio; review com demo gravada e retrospectiva escrita no fim.
- **Quadro Kanban** com 5 colunas e WIP declarado — *Em progresso = 1*, *Em revisão = 2*.
- **Revisão de código por agente de IA** acionado pelo GitHub Actions em todo Pull Request: cada
  apontamento é resolvido ou justificado por escrito antes do merge.
- **Definição de Pronto** em 7 itens, com CI verde como gate obrigatório.

Acordo completo: [`sprints/0/proposta.md`](sprints/0/proposta.md#5-acordo-de-processo).

## Licença

[MIT](LICENSE)

## Checklist das sprints

### Sprint 0
- [x] Repositório público + README completo
- [x] `sprints/0/proposta.md` (≤3 pág.)
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

Evidências da containerização: [verificação S2-01](docs/verificacao-s2-01.md).

### CI reproduzível (S2-02)

Em todo push e PR para main, o Actions usa Ubuntu 24.04, Node da .nvmrc e npm 10.9.2. A instalação limpa usa npm ci --include=optional com o lockfile versionado, seguida de geração Prisma, lint, testes e build. Para reproduzir: instale essas versões e execute npm ci --include=optional, npm run db:generate, npm run lint, npm test e npm run build em uma cópia limpa. Não é necessário banco para essas verificações.

