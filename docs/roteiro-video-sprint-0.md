# Roteiro do vídeo — Sprint 0 (5 minutos)

Roteiro falado do vídeo do **EntregaAí**. A divisão de tempo segue a estrutura oficial do guia da
Sprint 0: **30 s equipe · 1 min 30 s visão · 1 min 30 s MVP · 1 min 30 s processo**.

**Como usar:** o texto em blocos citados é para **falar** (~150 palavras por minuto — não corra). O
que está entre `[colchetes]` é **o que aparece na tela**. Os slides de apoio
([`slides-video-sprint-0.pptx`](slides-video-sprint-0.pptx)) trazem este mesmo texto nas **notas do
apresentador** — grave em Modo de Apresentador e você lê sem decorar.

---

## Antes de gravar

**Pré-requisitos** — sem isso o vídeo não tem o que mostrar:

- [ ] Repositório público, com `README.md` preenchido
- [ ] `docs/proposta.md` no repositório
- [ ] **Quadro no GitHub Projects pronto**: 5 colunas, WIP declarado no nome da coluna, as 10
      histórias posicionadas, campos `Prioridade`, `Pontos`, `Sprint` e `Épico` visíveis
- [ ] Pelo menos **duas histórias com critérios de aceitação escritos** na issue (vão aparecer em
      close)
- [ ] Diagrama do fluxo do MVP aberto numa aba (o do slide 5, ou refeito no Excalidraw)

**Setup técnico:**

- Gravação de tela **com sua câmera num canto** (OBS Studio ou Loom). Aparecer na tela é o que
  sustenta o critério de participação.
- **Zoom do navegador em 125–150 %** antes de gravar. Quadro Kanban em fonte pequena é ilegível no
  vídeo e o avaliador não vai pausar para ler.
- Fecha abas pessoais, notificações e o que não for do projeto.
- Fone com microfone é melhor que o do notebook. Grave 10 segundos e ouça antes.
- **Grave em blocos separados** e junte depois. Acertar 5 minutos numa tacada custa mais que editar.

**Regra de ouro:** nada de slide com bullet point sobre o que o projeto *vai* ser. A rubrica premia
mostrar o artefato funcionando — na Sprint 0 o artefato é **o quadro, o repositório e a proposta**.

---

## Bloco 1 — Equipe · 0:00 → 0:30

`[Slide 1 — capa]`

> Oi, eu sou o Matheus Senas de Cristo, matrícula 20240002384, e este é o **EntregaAí**, meu projeto
> de Processos de Software.
>
> É um **projeto individual**: eu acumulo os quatro papéis — Product Owner, desenvolvedor, revisor e
> qualidade — e no último bloco eu mostro como o processo dá conta disso, porque é o ponto mais
> frágil de trabalhar sozinho.
>
> Coorte **B, online**, sem integração com outra disciplina.
>
> Nos próximos cinco minutos: o problema, o MVP e, principalmente, como eu vou trabalhar.

⏱ ~80 palavras · 30 s

---

## Bloco 2 — Visão do produto · 0:30 → 2:00

`[Slide 2 — Como é a portaria hoje]`

> Fui ver como funciona a portaria de um condomínio hoje, e o processo é manual de ponta a ponta.
>
> A encomenda chega e o porteiro **anota no caderno** — nome e apartamento, à mão, no meio da fila de
> entregadores.
>
> Depois ele **liga para o morador**, uma encomenda por vez. Se o morador não atende, ele liga de
> novo. E de novo mais tarde. O aviso depende da insistência do porteiro.
>
> O resultado é que encomenda **acumula** na portaria por dias — e quando alguém finalmente retira,
> não fica registro de quem foi.

`[Slide 3 — Três problemas]`

> Esse processo tem três problemas.
>
> **Primeiro:** em horário de pico chegam várias entregadoras juntas, e o porteiro tem que ler a
> etiqueta e transcrever à mão. Ele posterga ou abrevia — o dado nasce errado, ou nem nasce.
>
> **Segundo:** avisar o morador depende da insistência do porteiro. Ele liga, o morador não atende,
> ele liga de novo mais tarde. Enquanto isso a encomenda fica ocupando a portaria.
>
> **Terceiro:** a retirada não tem rastro. Quando aparece uma reclamação de extravio, é a palavra do
> morador contra a do porteiro, e o condomínio não tem como apurar.

`[Slide 4 — A proposta]`

> Quem sofre com isso é o **porteiro** — turno de doze horas, celular na mão, nenhuma familiaridade
> com software. Ele é o **único usuário** do sistema, e nem login existe: o app abre direto na
> operação. O morador não acessa nada; ele só recebe a mensagem no WhatsApp.
>
> O EntregaAí é um sistema web de portaria: o porteiro **tira uma foto da etiqueta**, uma IA lê o
> rótulo, identifica o apartamento e o morador no cadastro, e o morador **recebe WhatsApp na hora**.
> Diferente de caderno, planilha ou dos módulos de encomenda que já existem, ninguém digita nome e
> apartamento no momento da fila — e ninguém precisa ligar.

⏱ ~250 palavras · 1 min 30 s

---

## Bloco 3 — MVP · 2:00 → 3:30

`[Slide 5 — O ciclo do MVP · aponte com o cursor enquanto fala]`

> O MVP é este ciclo, e só ele: **não tem login** — o app abre direto na operação. O porteiro
> fotografa a etiqueta, o sistema devolve bloco, unidade e destinatário **já preenchidos e
> editáveis**, ele confirma, o morador recebe o WhatsApp — e quando vem buscar, a retirada é validada
> com **os quatro últimos dígitos do telefone dele**. Isso é a prova de que a encomenda foi entregue
> para a pessoa certa.

`[Slide 6 — No MVP / Fora do MVP]`

> Duas decisões de escopo que eu quero deixar explícitas, porque são elas que fazem isso caber em
> quatro sprints trabalhando sozinho.
>
> **Um: não existe login.** Nem autenticação, nem autorização, nem perfil de usuário. O app é a tela
> da portaria: abre e opera. É decisão consciente — o sistema roda na rede da portaria, o único
> operador é o porteiro, e colocar login agora custaria uma sprint sem testar nada da minha hipótese.
> Autenticação é o primeiro item **depois** do MVP, e a limitação está declarada na proposta.
>
> **Dois: não existe tela de cadastro.** O condomínio já vem pré-cadastrado — apartamentos e
> moradores entram por um **script de seed** versionado no repositório. Se trocar o telefone de um
> morador, eu rodo o script de novo.
>
> Também estão fora: cobrança, multi-condomínio, app nativo, biometria e bot de WhatsApp com resposta
> do morador.

`[Slide 7 — Como vou medir]`

> Minha hipótese de valor é que o porteiro vai **fotografar em vez de anotar no caderno** porque o
> registro deixa de ser digitação e o morador é avisado sozinho, sem ninguém ter que ligar.
>
> E eu defini como medir: **noventa por cento** dos registros aceitos sem nenhuma edição do que a IA
> leu, tempo mediano de **até cinco segundos** da foto ao registro salvo, **noventa e cinco por
> cento** das encomendas notificadas em cinco minutos, e **oitenta por cento** das retiradas validadas
> por telefone, não manualmente.

⏱ ~260 palavras · 1 min 30 s

---

## Bloco 4 — Processo · 3:30 → 5:00

**Este é o bloco que mais pesa.** Metade dele é o quadro ao vivo na tela — não fale sobre o quadro,
**mostre** o quadro.

`[Slide 8 — Como vou trabalhar]`

> Agora o processo, que nesta disciplina pesa tanto quanto o produto.
>
> **Sprints de duas semanas.** Planejo na segunda-feira da primeira semana e fecho na sexta da
> segunda, com demo gravada e retrospectiva escrita em arquivo no repositório. Como trabalho sozinho,
> as cerimônias viram registro escrito: o planejamento mora na issue da sprint, e todo dia útil eu
> escrevo duas linhas — o que fiz e o que travou. Isso não é burocracia: é o dado de fluxo que eu vou
> precisar para o VSM e para as métricas DORA nas próximas sprints.

`[TROQUE PARA O NAVEGADOR — GitHub Projects. Percorra as colunas com o cursor]`

> Este é o quadro: Backlog, Sprint Backlog, Em progresso, Em revisão e Pronto. Os limites de WIP
> estão declarados em cada coluna. O mais importante é **Em progresso igual a um**: sozinho, meu
> risco não é fila grande, é abrir três frentes e não fechar nenhuma. E **Em revisão no máximo dois**
> — batendo o limite, revisar passa à frente de escrever código.

`[Abra uma issue com critérios de aceitação, mostre os campos Prioridade / Pontos]`

> São dez histórias, todas priorizadas e estimadas em pontos, com critérios de aceitação escritos —
> como neste aqui. P1 é o MVP, P2 é fila.

`[VOLTE PARA O SLIDE 9 — agente de IA + Definição de Pronto]`

> E o ponto mais delicado de trabalhar sozinho: **não tem quem revise meu código**.
>
> Minha resposta a isso é um **agente de IA revisando todo Pull Request**, acionado automaticamente
> pelo GitHub Actions. Ele comenta bug, caso de borda e teste faltando; **cada apontamento tem que
> ser resolvido ou justificado por escrito no PR** antes do merge. A IA comenta, eu decido, e a
> decisão fica registrada. Recusar com justificativa vale; ignorar em silêncio, não.
>
> Fechando isso, a integração contínua roda lint, build e testes e **bloqueia o merge** se algo
> quebrar. Junto com os outros itens da minha Definição de Pronto, é o que faz um item sair de "Em
> revisão" para "Pronto".
>
> É isso. Na Sprint 1 eu entrego o ciclo funcionando sem a IA — o registro manual e a lista de
> pendentes — e na Sprint 2 entra a câmera. Obrigado.

⏱ ~330 palavras · 1 min 30 s (ritmo firme; respire nas transições)

---

## Se estourar o tempo

Corte **nesta ordem** — nunca corte o bloco 4:

1. No bloco 2, os três problemas: fale dois e diga "e o terceiro está na proposta".
2. No bloco 3, a lista do que está fora: cite três itens em vez de seis.
3. No bloco 3, as metas: cite dois números em vez de quatro.
4. No bloco 1, a frase sobre o que vem nos próximos cinco minutos.

## Erros que derrubam nota

| Erro | Por que custa |
|---|---|
| Afirmar número que você não mediu | *Evidência* (25 % da nota de comunicação) exige dado do próprio projeto; o professor pergunta a origem |
| Mostrar slide com bullets sobre o quadro em vez do quadro | *Demonstração* (30 %) pede o artefato funcionando |
| Quadro em fonte pequena, ilegível no vídeo | Vale o mesmo que não ter mostrado |
| Quadro com histórias mas sem WIP declarado | *Configuração do processo* (25 % da entrega) cobra WIP explícito |
| Não mencionar coorte e integração | Item explícito da rubrica, custa 30 segundos de fala |
| Dizer "não tem login" sem justificar | Soa como esquecimento em vez de recorte de escopo — sempre emende com o "por quê" |
| Passar de 5:30 ou ficar abaixo de 4:00 | *Clareza e objetividade* penaliza tempo estourado **e** subutilizado |
| Não explicar como se garante qualidade sem revisor humano | É a primeira pergunta que o avaliador faz de um projeto individual |

## Checklist de publicação

- [ ] Duração entre 4:30 e 5:30
- [ ] Áudio audível do começo ao fim
- [ ] Quadro Kanban aparece legível, com as colunas e os WIP
- [ ] Você aparece na tela
- [ ] Vídeo publicado em ⟨YouTube não listado / Drive público⟩ e testado **em janela anônima**
- [ ] Link no `README.md` e no cabeçalho de `docs/proposta.md`
