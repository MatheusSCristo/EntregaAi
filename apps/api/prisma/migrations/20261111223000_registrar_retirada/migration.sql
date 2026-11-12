CREATE TYPE "MetodoRetirada" AS ENUM ('telefone', 'manual');

ALTER TABLE "encomendas"
ADD COLUMN "retirada_em" TIMESTAMP(3),
ADD COLUMN "metodo_retirada" "MetodoRetirada",
ADD COLUMN "justificativa_retirada" TEXT;
