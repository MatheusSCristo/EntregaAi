import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MetodoRetirada, StatusEncomenda } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { EncomendasController } from './encomendas.controller';
import { EncomendasService } from './encomendas.service';

describe('POST /api/encomendas/:id/retirada', () => {
  const id = 'bcaf4694-19c1-464e-8d12-d57c28cb2639';
  const url = `/api/encomendas/${id}/retirada`;
  const encomenda = {
    status: StatusEncomenda.pendente,
    morador: { telefonePrincipal: '+55 (84) 99123-0042' },
  };
  const prisma = { encomenda: { findUnique: jest.fn(), updateMany: jest.fn() } };
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [EncomendasController],
      providers: [EncomendasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.encomenda.findUnique.mockResolvedValue(encomenda);
    prisma.encomenda.updateMany.mockResolvedValue({ count: 1 });
  });

  afterAll(async () => {
    await app.close();
  });

  it('valida o sufixo do telefone e persiste a retirada apenas se pendente', async () => {
    const response = await request(app.getHttpServer())
      .post(url)
      .send({ metodo: 'telefone', codigo: '0042' })
      .expect(200);

    expect(response.body).toEqual({
      id,
      status: 'entregue',
      metodoRetirada: 'telefone',
      retiradaEm: expect.any(String),
      justificativaRetirada: null,
    });
    expect(prisma.encomenda.updateMany).toHaveBeenCalledWith({
      where: { id, status: StatusEncomenda.pendente },
      data: {
        status: StatusEncomenda.entregue,
        metodoRetirada: MetodoRetirada.telefone,
        retiradaEm: new Date(response.body.retiradaEm),
        justificativaRetirada: null,
      },
    });
  });

  it.each([
    { metodo: 'telefone', codigo: '0000' },
    { metodo: 'telefone', codigo: 42 },
    { metodo: 'telefone' },
    { metodo: 'telefone', codigo: '0042', justificativa: 'Outra forma' },
    { metodo: 'manual', justificativa: '   ' },
    { metodo: 'manual', justificativa: 'Conferência presencial', codigo: '0042' },
    { metodo: 'desconhecido' },
  ])('recusa payload inválido sem modificar a encomenda (%j)', async (payload) => {
    await request(app.getHttpServer()).post(url).send(payload).expect(400);
    expect(prisma.encomenda.updateMany).not.toHaveBeenCalled();
  });

  it('persiste o motivo da retirada manual', async () => {
    const response = await request(app.getHttpServer())
      .post(url)
      .send({ metodo: 'manual', justificativa: '  Conferência presencial  ' })
      .expect(200);
    expect(response.body).toMatchObject({
      status: 'entregue',
      metodoRetirada: 'manual',
      justificativaRetirada: 'Conferência presencial',
    });
    expect(prisma.encomenda.updateMany).toHaveBeenCalledWith({
      where: { id, status: StatusEncomenda.pendente },
      data: expect.objectContaining({
        metodoRetirada: MetodoRetirada.manual,
        justificativaRetirada: 'Conferência presencial',
      }),
    });
  });

  it('recusa uma segunda retirada e preserva a anterior', async () => {
    prisma.encomenda.findUnique.mockResolvedValue({
      ...encomenda,
      status: StatusEncomenda.entregue,
    });
    await request(app.getHttpServer())
      .post(url)
      .send({ metodo: 'telefone', codigo: '0042' })
      .expect(409);
    expect(prisma.encomenda.updateMany).not.toHaveBeenCalled();
  });

  it('retorna conflito se outra retirada vencer entre a leitura e a atualização', async () => {
    prisma.encomenda.updateMany.mockResolvedValue({ count: 0 });
    await request(app.getHttpServer())
      .post(url)
      .send({ metodo: 'telefone', codigo: '0042' })
      .expect(409);
  });

  it('retorna 404 para um ID válido sem encomenda', async () => {
    prisma.encomenda.findUnique.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post(url)
      .send({ metodo: 'telefone', codigo: '0042' })
      .expect(404);
    expect(prisma.encomenda.updateMany).not.toHaveBeenCalled();
  });
});
