CREATE TABLE "leituras_etiqueta" (
    "id" UUID NOT NULL,
    "resposta_bruta" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leituras_etiqueta_pkey" PRIMARY KEY ("id")
);
