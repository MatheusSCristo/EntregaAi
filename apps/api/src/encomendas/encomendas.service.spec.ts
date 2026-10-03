import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StatusEncomenda } from '@prisma/client';
import { EncomendasService } from './encomendas.service';

describe('EncomendasService', () => {
  const prisma = {
    encomenda: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    morador: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const service = new EncomendasService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria uma encomenda pendente para um morador ativo da unidade', async () => {
    prisma.morador.findFirst.mockResolvedValue({
      id: 'morador-1',
      nome: 'Ana Clara Lima',
      telefonePrincipal: '84991234567',
      unidade: {
        id: 'unidade-1',
        bloco: 'A',
        numero: '101',
        condominioId: 'condominio-1',
      },
    });
    prisma.encomenda.create.mockResolvedValue({
      id: 'encomenda-1',
      status: StatusEncomenda.pendente,
      localArmazenamento: 'Prateleira 2',
      observacao: null,
      remetente: 'Loja Exemplo',
      createdAt: new Date('2026-10-02T12:00:00.000Z'),
      unidade: {
        id: 'unidade-1',
        bloco: 'A',
        numero: '101',
      },
      morador: {
        id: 'morador-1',
        nome: 'Ana Clara Lima',
        telefonePrincipal: '84991234567',
      },
    });

    const result = await service.criar({
      unidadeId: 'unidade-1',
      moradorId: 'morador-1',
      localArmazenamento: ' Prateleira 2 ',
      remetente: ' Loja Exemplo ',
    });

    expect(prisma.encomenda.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          condominioId: 'condominio-1',
          unidadeId: 'unidade-1',
          moradorId: 'morador-1',
          localArmazenamento: 'Prateleira 2',
          remetente: 'Loja Exemplo',
        }),
      }),
    );
    expect(result.morador.telefoneFinal).toBe('4567');
  });

  it('recusa cadastro sem local de armazenamento', async () => {
    await expect(
      service.criar({
        unidadeId: 'unidade-1',
        moradorId: 'morador-1',
        localArmazenamento: ' ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa morador que não pertence à unidade informada', async () => {
    prisma.morador.findFirst.mockResolvedValue(null);

    await expect(
      service.criar({
        unidadeId: 'unidade-1',
        moradorId: 'morador-1',
        localArmazenamento: 'Armario',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
