# Uso de IA na Sprint 2

Refs [#25](https://github.com/MatheusSCristo/EntregaAi/issues/25).
Registro consolidado em 25/11/2026, por Codex, para validação de Matheus Senas
de Cristo. Parte do histórico foi recuperada de comentários, PRs e documentos;
não se afirma que este arquivo foi mantido diariamente desde o início da sprint.
Os registros originais continuaram nas issues durante a execução.

## Dois usos distintos

1. **Assistência ao desenvolvimento:** o agente ajudou a inspecionar código,
   implementar alterações, executar testes, calcular métricas e escrever documentação.
   O responsável define escopo, valida as entregas e faz o merge.
2. **IA no produto:** a API pode enviar foto à OpenAI para sugerir bloco, unidade
   e destinatário. A sugestão exige confirmação humana. Isso não é o mesmo que
   usar o agente para desenvolver o projeto. Os ensaios controlados não comprovam
   acurácia do modelo em fotos reais.

## Contribuições e evidências

O quadro registra contribuições observáveis na execução assistida, não autoria
exclusiva de cada linha ou esforço humano substituído.

| Período/item | Contribuição assistida e resultado | Validação e participação humana |
| --- | --- | --- |
| 04/11, #13 | Dockerfiles, Compose, migrations/seed não destrutivo e ensaio com persistência | [PR #28](https://github.com/MatheusSCristo/EntregaAi/pull/28), [evidência](verificacao-s2-01.md); integração feita pelo usuário |
| 06/11, #14/#15 | Padronização do CI, investigação de ambiente e documentação da proteção/prova de bloqueio | [PR #29](https://github.com/MatheusSCristo/EntregaAi/pull/29), [PR #31](https://github.com/MatheusSCristo/EntregaAi/pull/31), [proteção](protecao-main.md); prova defeituosa não foi integrada |
| 11–14/11, #16/#17/#18 | Registro de tempos, retirada validada e integração na portaria | [PR #32](https://github.com/MatheusSCristo/EntregaAi/pull/32), [#33](https://github.com/MatheusSCristo/EntregaAi/pull/33), [#34](https://github.com/MatheusSCristo/EntregaAi/pull/34); testes automatizados e merges do usuário não equivalem a registro de teste externo |
| 18/11, #19/#20 | Leitura estruturada de foto, auditoria, sugestões editáveis, tratamento de falhas e correção Sharp/CommonJS | [PR #35](https://github.com/MatheusSCristo/EntregaAi/pull/35), [#36](https://github.com/MatheusSCristo/EntregaAi/pull/36); ensaios com provedor controlado, com limitação explícita de avaliação ao vivo |
| 20–23/11, #21 | Fila PostgreSQL, retentativas e adaptador WhatsApp fake, com concorrência/recuperação | [PR #37](https://github.com/MatheusSCristo/EntregaAi/pull/37), [registro](verificacao-s2-09.md); o usuário pediu fake, sem envio real |
| 23/11, #22 | Coleta normalizada, cálculo offline e relatório de métricas com proxy de implantação | [PR #38](https://github.com/MatheusSCristo/EntregaAi/pull/38), [métricas](metricas-02.md); relato Sharp e diffs sustentam inferência revisável, não telemetria de produção |
| 25/11, #23 | Mapa de três itens, estimativas identificadas, cálculo de eficiência e proposta de melhoria | [PR #39](https://github.com/MatheusSCristo/EntregaAi/pull/39), [snapshot do fluxo](evidencias/sprint-02/fluxo-coleta.json); integrado pelo agente após autorização expressa do usuário |
| 25/11, #24 | Ensaio local do serviço compilado, PostgreSQL, Compose novo, reinício e revisão de README/licença | [PR #40](https://github.com/MatheusSCristo/EntregaAi/pull/40); utilitário e passo adicional de CI retirados a pedido do usuário; não houve pessoa externa |
| 25/11, #25 | Consolidação deste registro, preservação da minuta anterior, comparação das métricas e retrospectiva com três propostas | [Retrospectiva 02](retrospectiva-02.md) e cálculo reproduzível; conteúdo preparado pelo agente, sujeito à validação humana |

## Dificuldades, correções e limites

- **Alterações locais antigas:** foram preservadas. Cada tarefa usou uma branch e
  um checkout isolados; o agente não incluiu mudanças alheias nos commits.
- **Ambiente Windows/Linux:** houve incompatibilidades de dependências e runtime.
  O CI usa Node 22.16.0/npm 10.9.2; a imagem Docker Node 22 é flutuante e executou
  Node 22.23.4/npm 10.9.9 no ensaio da #24. Isso limita a afirmação de ambiente
  totalmente uniforme; o build/teste Linux foi usado como evidência concreta.
- **Acesso ao GitHub:** o conector permitiu leituras mas retornou 403 na escrita;
  a CLI autenticada foi usada para sincronizar issues, branches, PRs e quadro
  quando a conectividade foi restabelecida. Sucesso de uma leitura não foi
  tratado como comprovação de atualização do quadro.
- **Defeito não detectado pelo CI original:** o código de leitura compilava,
  mas Sharp falhava em execução. O problema foi reproduzido e corrigido; a #24
  executou um ensaio local do artefato compilado. O usuário pediu depois a
  retirada dos utilitários dos três PRs; a etapa adicional de CI também foi
  retirada. A evidência da execução pontual permanece, sem nova cobertura contínua.
- **Dados incompletos de processo:** faltam cronometragem líquida e série diária
  completa de WIP. O agente identificou estimativas e não as chamou de trabalho
  produtivo medido. Comentários e eventos de coluna são marcos, não cronômetros.
- **Limite da automação visual:** uma tentativa anterior de navegador foi
  interrompida por não conseguir verificar a URL com segurança. Não foi registrada
  validação visual que não ocorreu. Os testes atuais são técnicos/API/Compose.
- **Configuração do ensaio:** caminho do comando Docker corrigido para o
  `WORKDIR /app`. A checagem extra de tipos no runtime precisou de
  `--incremental false`, pois a pasta `dist` do build não era gravável pelo usuário
  node. Essas correções de procedimento não são defeitos do fluxo do produto.

## Decisões e revisão humana

- [20/11: WhatsApp fake solicitado pelo usuário](https://github.com/MatheusSCristo/EntregaAi/issues/21#issuecomment-7042266601).
- [25/11: teste externo dispensado pelo usuário](https://github.com/MatheusSCristo/EntregaAi/issues/24#issuecomment-7161805763).
- A prova de testes, CI ou merge é vinculada às fontes; **merge não comprova
  execução manual do roteiro pelo usuário**. Não há ata de reunião de
  retrospectiva humana, sessão de pair programming ou evidência de TDD que
  permita afirmar essas práticas.
- Inicialmente, os PRs ficaram aguardando validação e merge pelo usuário.
  Em 25/11/2026, o usuário autorizou expressamente o agente a integrar os PRs
  #39, #40 e #41. Essa autorização é específica para os três PRs. Os checks e
  as proteções da main foram respeitados, sem auto-merge ou bypass; a branch
  do #40 foi atualizada com a main e testada novamente antes da integração.
  O fluxo mantém WIP Em progresso=1 e Em revisão=2.
- Não foram adicionados segredos aos arquivos desta entrega. O ensaio da #24
  desabilita chamadas externas e usa dados fictícios; os dados não foram enviados
  ao WhatsApp. A leitura real depende de chave configurada fora do repositório.

## Fontes e manutenção

O [snapshot de base](evidencias/sprint-02/retrospectiva-base.json) preserva o
conteúdo e SHA-256 dos arquivos locais anteriores, os resultados DORA/fluxo,
o ensaio do MVP e as decisões de escopo. A minuta antiga não foi promovida
silenciosamente a retrospectiva humana aprovada.

Os valores foram conferidos localmente. O utilitário de conferência foi retirado
do PR a pedido do usuário; a entrega preserva os documentos e as fontes em JSON.

Atualizar este registro se a validação dos PRs exigir mudanças ou surgirem
novas contribuições antes do fechamento da sprint. A coleta é um retrato até
25/11, não uma descrição antecipada do vídeo ou da entrega final da #26.
