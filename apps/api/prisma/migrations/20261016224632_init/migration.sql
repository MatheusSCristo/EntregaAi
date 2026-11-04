-- CreateEnum
CREATE TYPE "StatusEncomenda" AS ENUM ('pendente', 'entregue', 'extraviada');

-- CreateTable
CREATE TABLE "condominios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condominios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" UUID NOT NULL,
    "condominio_id" UUID NOT NULL,
    "bloco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moradores" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone_principal" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encomendas" (
    "id" UUID NOT NULL,
    "condominio_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "morador_id" UUID NOT NULL,
    "status" "StatusEncomenda" NOT NULL DEFAULT 'pendente',
    "local_armazenamento" TEXT NOT NULL,
    "observacao" TEXT,
    "remetente" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encomendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "condominios_nome_key" ON "condominios"("nome");

-- CreateIndex
CREATE INDEX "unidades_condominio_id_idx" ON "unidades"("condominio_id");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_condominio_id_bloco_numero_key" ON "unidades"("condominio_id", "bloco", "numero");

-- CreateIndex
CREATE INDEX "moradores_unidade_id_idx" ON "moradores"("unidade_id");

-- CreateIndex
CREATE INDEX "encomendas_condominio_id_status_idx" ON "encomendas"("condominio_id", "status");

-- CreateIndex
CREATE INDEX "encomendas_unidade_id_idx" ON "encomendas"("unidade_id");

-- CreateIndex
CREATE INDEX "encomendas_morador_id_idx" ON "encomendas"("morador_id");

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_condominio_id_fkey" FOREIGN KEY ("condominio_id") REFERENCES "condominios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moradores" ADD CONSTRAINT "moradores_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encomendas" ADD CONSTRAINT "encomendas_condominio_id_fkey" FOREIGN KEY ("condominio_id") REFERENCES "condominios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encomendas" ADD CONSTRAINT "encomendas_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encomendas" ADD CONSTRAINT "encomendas_morador_id_fkey" FOREIGN KEY ("morador_id") REFERENCES "moradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
