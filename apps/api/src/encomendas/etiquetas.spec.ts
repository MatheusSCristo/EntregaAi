import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import sharp from 'sharp';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { EncomendasController } from './encomendas.controller';
import { EncomendasService } from './encomendas.service';
import { EtiquetasService, LIMITE_FOTO_ETIQUETA } from './etiquetas.service';
import { LeitorEtiqueta } from './leitor-etiqueta';

describe('POST /api/encomendas/leitura-etiqueta', () => {
  const url = '/api/encomendas/leitura-etiqueta';
  const morador = {
    id: 'morador-1',
    nome: 'Lívia da Silva',
    telefonePrincipal: '84999991111',
    unidade: { id: 'unidade-1', bloco: 'A', numero: '0042' },
  };
  const campos = { bloco: 'a', unidade: '0042', destinatario: 'Livia da Silva' };
  const respostaBruta = '{"resposta":"original"}';
  const leitor = { ler: jest.fn() };
  const prisma = { leituraEtiqueta: { create: jest.fn() }, morador: { findMany: jest.fn() } };
  let app: INestApplication;
  let foto: Buffer;

  beforeAll(async () => {
    foto = await sharp({
      create: { width: 1200, height: 600, channels: 3, background: 'white' },
    }).png().toBuffer();
    const module = await Test.createTestingModule({
      controllers: [EncomendasController],
      providers: [
        EncomendasService,
        EtiquetasService,
        { provide: PrismaService, useValue: prisma },
        { provide: LeitorEtiqueta, useValue: leitor },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    leitor.ler.mockResolvedValue({ campos, respostaBruta });
    prisma.leituraEtiqueta.create.mockResolvedValue({ id: 'leitura-1' });
    prisma.morador.findMany.mockResolvedValue([morador]);
  });

  afterAll(async () => app.close());

  it('redimensiona, audita e sugere um destinatário ativo para confirmação', async () => {
    const { body } = await request(app.getHttpServer()).post(url).attach('foto', foto, 'foto.png').expect(200);
    expect(body).toEqual({
      leituraId: 'leitura-1',
      status: 'aguardando_confirmacao',
      campos,
      sugestao: { id: morador.id, nome: morador.nome, unidade: morador.unidade, telefoneFinal: '1111' },
    });
    expect(await sharp(leitor.ler.mock.calls[0][0]).metadata()).toMatchObject({
      format: 'jpeg', width: 800, height: 400,
    });
    expect(prisma.leituraEtiqueta.create).toHaveBeenCalledWith({
      data: { respostaBruta }, select: { id: true },
    });
    expect(prisma.morador.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { ativo: true, unidade: { ativo: true } },
    }));
  });

  it.each([null, { ...campos, destinatario: null }])('audita leitura inconclusiva (%j)', async (parcial) => {
    leitor.ler.mockResolvedValue({ campos: parcial, respostaBruta });
    const { body } = await request(app.getHttpServer()).post(url).attach('foto', foto, 'foto.png').expect(200);
    expect(body).toEqual({ leituraId: 'leitura-1', status: 'inconclusiva', campos: parcial, sugestao: null });
    expect(prisma.leituraEtiqueta.create).toHaveBeenCalledTimes(1);
    expect(prisma.morador.findMany).not.toHaveBeenCalled();
  });

  it.each([
    { caso: 'nenhum candidato', cadastro: [] },
    { caso: 'dois candidatos', cadastro: [morador, { ...morador, id: 'morador-2' }] },
  ])(
    'requer seleção manual com $caso',
    async ({ cadastro }) => {
      prisma.morador.findMany.mockResolvedValue(cadastro);
      const { body } = await request(app.getHttpServer()).post(url).attach('foto', foto, 'foto.png').expect(200);
      expect(body).toMatchObject({ status: 'inconclusiva', campos, sugestao: null });
    },
  );

  it('rejeita envio ausente, inválido ou acima do limite antes de chamar o provedor', async () => {
    await request(app.getHttpServer()).post(url).expect(400);
    await request(app.getHttpServer()).post(url).attach('foto', Buffer.from('texto'), 'foto.png').expect(400);
    await request(app.getHttpServer()).post(url)
      .attach('foto', Buffer.alloc(LIMITE_FOTO_ETIQUETA + 1), 'foto.png').expect(413);
    expect(leitor.ler).not.toHaveBeenCalled();
  });

  it('retorna 503 na falha do provedor', async () => {
    leitor.ler.mockRejectedValue(new Error('Falha de rede'));
    const { body } = await request(app.getHttpServer()).post(url).attach('foto', foto, 'foto.png').expect(503);
    expect(body.message).toBe('Leitura de etiqueta indisponível. Tente novamente.');
    expect(prisma.leituraEtiqueta.create).not.toHaveBeenCalled();
  });
});
