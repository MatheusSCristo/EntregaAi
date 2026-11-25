# Validação local do MVP — S2-12

Refs [#24](https://github.com/MatheusSCristo/EntregaAi/issues/24).
Execução em 25/11/2026, São Paulo. Responsável pela execução: agente Codex,
sob solicitação de Matheus Senas de Cristo.

## Escopo aprovado

O usuário informou que ninguém externo testaria. A
[decisão foi registrada na issue](https://github.com/MatheusSCristo/EntregaAi/issues/24#issuecomment-7161805763)
e o critério passou a ser validação local reproduzível pelo agente.
**Não houve pessoa externa, teste de usabilidade humana nem comprovação de
execução do README em menos de dez minutos por outra pessoa.** A ação de teste
externo da retrospectiva 01 continua não realizada; a mudança de escopo não
constitui evidência de execução dessa ação.

WhatsApp é fake, conforme #21. No ensaio compilado, somente o provedor de
leitura é substituído por dados controlados; Sharp, módulos compilados, HTTP,
validação, auditoria, PostgreSQL e consumidor periódico são reais. O PNG
gerado é uma imagem válida de teste, sem prova de qualidade de reconhecimento
de uma etiqueta real. Chamadas externas são desabilitadas no processo de teste.

## Ambiente e procedimento

- Host Windows, Docker Desktop/Compose; versões e tempos no
  [resultado de execução](evidencias/sprint-02/mvp-validacao.json).
- Projeto Compose exclusivo `entregaai-s224`, sem volumes prévios com esse nome.
  Imagens-base/camadas em cache são permitidas; a base de dados foi nova.
- API e web construídas pelos Dockerfiles do projeto; quatro serviços com
  health checks: PostgreSQL 16, Redis, API e Nginx/web.
- Sem chave de leitura ou provedor real de WhatsApp no ensaio. A API normal
  mantém a exigência de `OPENAI_API_KEY` para interpretar fotos reais.

Comandos principais, na raiz da branch:

```bash
docker compose -p entregaai-s224 up --build -d --wait
docker compose -p entregaai-s224 exec -T api node apps/api/scripts/verificar-mvp.cjs
docker compose -p entregaai-s224 down
docker compose -p entregaai-s224 up -d --wait
```

Antes do down/up, foi registrada uma encomenda fictícia pelo proxy
`http://127.0.0.1:5173/api/encomendas`. Depois, a consulta pelo mesmo proxy
conferiu a encomenda e os mesmos quatro moradores. Não foi usado `down -v`.
O projeto de teste pode ser parado com `docker compose -p entregaai-s224 down`,
preservando os volumes. Não parar projetos alheios para repetir o ensaio.

Para testar sem Compose: instalar dependências, gerar Prisma, migrar uma base
de teste, executar `npm run build` e `npm run test:mvp --workspace api` com
`DATABASE_URL` configurada. O script limpa somente os dados do condomínio
aleatório criado pela própria execução, preservando os dados preexistentes.

## Resultados e evidências

| Verificação | Resultado e cobertura |
| --- | --- |
| Inicialização com banco novo | Build, migrations, seed e quatro serviços saudáveis |
| Foto → sugestão | PNG real processado pelo Sharp compilado; auditoria gravada; sugestão relacionada ao cadastro |
| Confirmação | Nenhuma encomenda é criada somente pela leitura; POST confirmado cria encomenda e notificação |
| WhatsApp | Consumidor periódico conclui simulação com identificador `fake:` em uma tentativa |
| Persistência | Estado preservado após reiniciar a aplicação do ensaio; cadastro preservado após down/up do Compose |
| Retirada | Código incorreto mantém pendência; código correto registra método/horário; repetição retorna conflito |
| Alternativas | Leitura parcial, falha do leitor e foto inválida tratadas; cadastro manual continua disponível; retirada manual exige justificativa |
| Seed | Quatro moradores antes/depois da recriação, com os mesmos IDs, sem duplicação |
| Web/proxy | HTML responde 200; cadastro e consulta funcionam via Nginx em `/api` |

O JSON preserva início/fim e duração do build/subida, do ensaio compilado e
da recriação dos serviços. Durações são medidas desta máquina com cache e rede
disponíveis; não são garantia de tempo em outra instalação nem esforço humano.
Nesta execução: build/subida **145,080 s**, ensaio compilado **1,321 s** e
recriação com volumes preservados **25,984 s**. Os 45 testes de regras e a análise
da API passaram; a checagem de tipos no contêiner foi feita com
`tsc --noEmit --incremental false`, evitando gravar cache no `dist` da imagem
de runtime, que pertence à etapa de build. Jest foi executado separadamente.
O ensaio compilado passa a executar no CI após o build com PostgreSQL real,
cobrindo a lacuna observada no defeito Sharp da #22.

## Problemas encontrados e correções

- README descrevia Sprint 1 e envio real de WhatsApp, apesar do adaptador fake:
  atualizado para Sprint 2 e escopo efetivamente implementado.
- Referências a `docs/proposta.md` inexistente: corrigidas para
  `sprints/0/proposta.md`; quadro e vídeos versionados agora têm links reais.
- O comando inicial do ensaio assumia diretório da API, mas o contêiner tem
  `WORKDIR /app`: corrigido para `node apps/api/scripts/verificar-mvp.cjs` e
  reexecutado com sucesso. Não foi uma falha de inicialização da aplicação.
- A instalação emitiu avisos preexistentes de lockfile/dependências; terminou
  com sucesso. Esta tarefa não altera versões ou lockfile para resolver esses avisos.
- O fluxo compilado completo não tinha verificação contínua: script e etapa de
  CI adicionados. Os testes existentes de regras continuam em execução.

## Licença, credenciais e limites

Licença do repositório: [MIT](../LICENSE). A licença do código não substitui
termos dos serviços externos. Não foram adicionados tokens ou segredos.

| Dependência | Exigência |
| --- | --- |
| Docker e registro de imagens/pacotes | Internet no primeiro build; não exige Node no host |
| PostgreSQL | Persistência e fila; credenciais locais de demonstração no Compose |
| Redis | Serviço previsto e mantido no Compose; fila atual usa PostgreSQL |
| Leitura real | OpenAI Responses API, internet e chave no ambiente da API; não validada ao vivo nesta execução |
| WhatsApp | Fake local; sem conta, chave, custo de mensagem ou envio real |

Não foi feita validação visual de câmera/celular ou nova avaliação do modelo
OpenAI. O ensaio cobre integração técnica e persistência, sem provar usabilidade
externa ou comportamento em produção. O usuário pode revisar o roteiro e os
resultados antes de integrar o PR.
