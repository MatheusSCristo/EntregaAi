# S2-09 — WhatsApp fake com fila persistente

## Escopo

Em 20/11/2026, o usuário pediu no chat um fake apenas para teste.
Decisão registrada na [issue #21](https://github.com/MatheusSCristo/EntregaAi/issues/21).
O critério de mensagem real foi substituído por evidência de simulação identificada.
Esta entrega não contém adaptador de envio externo, credenciais ou mensagens reais.

## Comportamento

```text
Confirmação do cadastro
  └─ transação PostgreSQL: encomenda + notificação única por encomenda
       └─ consumidor a cada 2 segundos
            ├─ sucesso → simulada, identificador fake:<id>
            ├─ falha temporária → fila com espera de 60 s / 120 s, até 3 tentativas
            ├─ falha permanente → falha
            └─ resultado desconhecido / reserva abandonada → incerta, sem reenvio
```

O cadastro só aguarda a gravação no banco. A seleção e reserva condicional do
item impedem consumidores concorrentes de processar a mesma tentativa. O índice
único em `encomenda_id` impede duas notificações para a mesma encomenda.
O contador persistido torna a simulação temporária reproduzível após reinício.
Reservas com mais de 120 segundos são isoladas como incertas; uma falha ao
gravar o resultado após o envio não agenda nova tentativa automática.

Nos pendentes, o botão **Atualizar status** exibe o estado com o prefixo
**WhatsApp (teste)**. O estado `simulada` não comprova envio ou recebimento real.
Os registros antigos não recebem notificação retroativa. Repetir o POST de
cadastro cria outra encomenda: idempotência do cadastro está fora deste escopo.

## Verificações reproduzíveis

1. Instale as dependências (`npm ci --include=optional`) e gere o cliente (`npm run db:generate`).
2. Execute `npm test`, `npm run lint` e `npm run build`.
3. Configure `DATABASE_URL` para PostgreSQL de teste e, em `apps/api`, aplique
   `npx prisma migrate deploy`. Não use uma base de produção.
4. Na raiz, execute `npm run test:whatsapp --workspace api`.

O teste de integração verifica cadastro e fila atômicos (incluindo rollback),
unicidade, 12 consumidores concorrentes, estado terminal sem reenvio, pausa sem
consumo de tentativas, reconexão, backoff, sucesso após falha temporária, limite
de três tentativas, falha permanente, estado incerto e recuperação de reserva.
Ele usa apenas o adaptador fake e limpa seus dados pelo condomínio aleatório
da execução. O CI aplica as migrations em PostgreSQL 16 e executa o mesmo teste.

## Evidência local de 20/11/2026

- Migrations aplicadas em PostgreSQL 16 descartável, porta 55421, banco `entregaai_task21`.
- Integração PostgreSQL aprovada, incluindo os 12 consumidores concorrentes.
- 45 testes automatizados aprovados; lint e build aprovados na versão fake.
- API compilada validada em HTTP: cadastro responde 201 com estado `pendente`,
  consumidor periódico muda para `simulada` e consulta retorna uma tentativa,
  sem telefone completo. Registro fictício: `444b5bce-7d2f-47da-8ddc-f6b937a1e404`.
- A validação visual não foi concluída: o navegador integrado não alcançou o
  servidor local e a ferramenta de navegador nativo interrompeu a operação por
  não conseguir determinar a URL com segurança. O roteiro humano permanece abaixo.
- Nenhuma mensagem real enviada.

## Validação humana

Inicie com `docker compose up --build`, registre uma encomenda e aguarde cerca
de 2 segundos. Clique **Atualizar status** e confira **Simulação concluída**.
Recarregue a página: o estado permanece. Para falha e retentativa, use as opções
documentadas no README e uma nova encomenda por cenário. O identificador da
simulação começa com `fake:` no banco. O fluxo de retirada continua disponível.
