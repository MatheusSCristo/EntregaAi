import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.encomenda.deleteMany();
  await prisma.morador.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.condominio.deleteMany();

  const condominio = await prisma.condominio.create({
    data: {
      nome: 'Residencial EntregaAi',
      endereco: 'Rua das Acacias, 100',
      cidade: 'Natal',
      estado: 'RN',
    },
  });

  const unidades = [
    {
      bloco: 'A',
      numero: '101',
      moradores: [
        { nome: 'Ana Clara Lima', telefonePrincipal: '84991234567' },
        { nome: 'Bruno Lima', telefonePrincipal: '84999887766' },
      ],
    },
    {
      bloco: 'A',
      numero: '204',
      moradores: [{ nome: 'Carla Souza', telefonePrincipal: '84988776655' }],
    },
    {
      bloco: 'B',
      numero: '302',
      moradores: [{ nome: 'Diego Fernandes', telefonePrincipal: '84977665544' }],
    },
  ];

  for (const unidade of unidades) {
    await prisma.unidade.create({
      data: {
        bloco: unidade.bloco,
        numero: unidade.numero,
        condominioId: condominio.id,
        moradores: {
          create: unidade.moradores,
        },
      },
    });
  }
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
