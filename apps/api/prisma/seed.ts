import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (db) => {
    const condominio = await db.condominio.upsert({
      where: { nome: "Residencial EntregaAi" },
      update: {},
      create: {
        nome: "Residencial EntregaAi",
        endereco: "Rua das Acacias, 100",
        cidade: "Natal",
        estado: "RN",
      },
    });

    const unidades = [
      {
        bloco: "A",
        numero: "101",
        moradores: [
          { nome: "Ana Clara Lima", telefonePrincipal: "84991234567" },
          { nome: "Bruno Lima", telefonePrincipal: "84999887766" },
        ],
      },
      {
        bloco: "A",
        numero: "204",
        moradores: [{ nome: "Carla Souza", telefonePrincipal: "84988776655" }],
      },
      {
        bloco: "B",
        numero: "302",
        moradores: [
          { nome: "Diego Fernandes", telefonePrincipal: "84977665544" },
        ],
      },
    ];

    for (const unidade of unidades) {
      const registro = await db.unidade.upsert({
        where: {
          condominioId_bloco_numero: {
            condominioId: condominio.id,
            bloco: unidade.bloco,
            numero: unidade.numero,
          },
        },
        update: {},
        create: {
          bloco: unidade.bloco,
          numero: unidade.numero,
          condominioId: condominio.id,
        },
      });
      for (const morador of unidade.moradores) {
        const existente = await db.morador.findFirst({
          where: {
            unidadeId: registro.id,
            telefonePrincipal: morador.telefonePrincipal,
          },
        });
        if (!existente)
          await db.morador.create({
            data: { unidadeId: registro.id, ...morador },
          });
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
