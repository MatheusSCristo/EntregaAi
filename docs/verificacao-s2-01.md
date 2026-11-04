# Verificação S2-01 — 04/11/2026

Ambiente: Docker Desktop Linux, projeto Compose isolado `entregaai-s2-check`, volumes novos criados nesta execução. Nenhum dado da cópia de desenvolvimento foi apagado.

## Evidências executadas

- `docker compose -p entregaai-s2-check config --quiet`: configuração válida.
- `docker compose -p entregaai-s2-check build`: imagens API e web compiladas com instalação de dependências dentro do Linux.
- `docker compose -p entregaai-s2-check up -d --wait --wait-timeout 180`: PostgreSQL, Redis, API e web saudáveis; migration inicial aplicada automaticamente.
- `GET http://localhost:5173/`: HTTP 200.
- `GET http://localhost:5173/api/encomendas/destinatarios`: quatro moradores, através do proxy nginx.
- `POST /api/encomendas` via porta da web: cadastro criado com ID `884d16ca-7f81-4e6f-815c-a8f1c28788cc`.
- Após `docker compose -p entregaai-s2-check down` e nova subida com `up -d --wait`, o ID permaneceu em `GET /api/encomendas/pendentes` e a consulta de destinatários manteve quatro moradores. O seed repetido preservou a encomenda e não duplicou moradores.
- `docker compose -p entregaai-s2-check exec -T api npm --workspace api run lint`: passou.
- `docker compose -p entregaai-s2-check exec -T --user root api npm --workspace api test`: duas suítes e oito testes passaram. Usuário root usado somente nesta verificação porque o compilador incremental grava no diretório de build; a aplicação roda como usuário node.

## Ajustes necessários encontrados

A main não tinha migration versionada nem dependências de validação exigidas pelo ValidationPipe. Foram incorporadas as correções locais existentes de DTO (incluindo seus testes), dependências e rootDir do build. O seed foi alterado para criar somente registros ausentes dentro de uma transação, sem apagar encomendas. A execução do seed usa npm para disponibilizar ts-node no PATH.

## Limites

Validação automatizada de HTTP e serviços local; não substitui o teste do README por pessoa externa previsto na S2-12. A primeira construção depende de acesso aos registros de imagens e pacotes. O npm ainda emite avisos de lockfile e auditoria das dependências existentes; a instalação e o build concluíram. Imagens incluem ferramentas de build para migrations e seed neste ambiente acadêmico. A configuração usa credenciais de demonstração e portas locais.

Lint da web: imagem de build gerada com docker build --target build -f apps/web/Dockerfile -t entregaai-s2-web-check .; docker run --rm entregaai-s2-web-check npm --workspace web run lint passou.
