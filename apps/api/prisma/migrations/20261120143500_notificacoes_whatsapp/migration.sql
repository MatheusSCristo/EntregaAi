CREATE TYPE "StatusNotificacao" AS ENUM ('pendente', 'enviando', 'simulada', 'falha', 'incerta');

CREATE TABLE "notificacoes_whatsapp" (
  "id" UUID NOT NULL,
  "encomenda_id" UUID NOT NULL,
  "telefone" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "bloco" TEXT NOT NULL,
  "unidade" TEXT NOT NULL,
  "local" TEXT NOT NULL,
  "status" "StatusNotificacao" NOT NULL DEFAULT 'pendente',
  "tentativas" INTEGER NOT NULL DEFAULT 0,
  "proxima_tentativa_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "envio_iniciado_em" TIMESTAMP(3),
  "simulada_em" TIMESTAMP(3),
  "provedor_id" TEXT,
  "ultimo_erro" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notificacoes_whatsapp_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notificacoes_whatsapp_encomenda_id_fkey" FOREIGN KEY ("encomenda_id") REFERENCES "encomendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "notificacoes_whatsapp_encomenda_id_key" ON "notificacoes_whatsapp"("encomenda_id");
CREATE INDEX "notificacoes_whatsapp_status_proxima_tentativa_em_idx" ON "notificacoes_whatsapp"("status", "proxima_tentativa_em");
