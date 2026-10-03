import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusEncomenda } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEncomendaDto } from './dto/criar-encomenda.dto';

@Injectable()
export class EncomendasService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPendentes() {
    const encomendas = await this.prisma.encomenda.findMany({
      where: { status: StatusEncomenda.pendente },
      orderBy: { createdAt: 'desc' },
      include: {
        unidade: true,
        morador: true,
      },
    });

    return encomendas.map((encomenda) => ({
      id: encomenda.id,
      status: encomenda.status,
      localArmazenamento: encomenda.localArmazenamento,
      observacao: encomenda.observacao,
      remetente: encomenda.remetente,
      createdAt: encomenda.createdAt,
      unidade: {
        id: encomenda.unidade.id,
        bloco: encomenda.unidade.bloco,
        numero: encomenda.unidade.numero,
      },
      morador: {
        id: encomenda.morador.id,
        nome: encomenda.morador.nome,
        telefoneFinal: encomenda.morador.telefonePrincipal.slice(-4),
      },
    }));
  }

  async listarDestinatarios() {
    const moradores = await this.prisma.morador.findMany({
      where: {
        ativo: true,
        unidade: { ativo: true },
      },
      orderBy: [{ unidade: { bloco: 'asc' } }, { unidade: { numero: 'asc' } }, { nome: 'asc' }],
      include: { unidade: true },
    });

    return moradores.map((morador) => ({
      id: morador.id,
      nome: morador.nome,
      telefoneFinal: morador.telefonePrincipal.slice(-4),
      unidade: {
        id: morador.unidade.id,
        bloco: morador.unidade.bloco,
        numero: morador.unidade.numero,
      },
    }));
  }

  async criar(dto: CriarEncomendaDto) {
    const unidadeId = this.exigirTexto(dto.unidadeId, 'unidadeId');
    const moradorId = this.exigirTexto(dto.moradorId, 'moradorId');
    const localArmazenamento = this.exigirTexto(
      dto.localArmazenamento,
      'localArmazenamento',
    );

    const morador = await this.prisma.morador.findFirst({
      where: {
        id: moradorId,
        ativo: true,
        unidadeId,
        unidade: { ativo: true },
      },
      include: {
        unidade: true,
      },
    });

    if (!morador) {
      throw new NotFoundException(
        'Morador ativo não encontrado para a unidade informada.',
      );
    }

    const encomenda = await this.prisma.encomenda.create({
      data: {
        condominioId: morador.unidade.condominioId,
        unidadeId,
        moradorId,
        localArmazenamento,
        observacao: this.normalizarOpcional(dto.observacao),
        remetente: this.normalizarOpcional(dto.remetente),
      },
      include: {
        unidade: true,
        morador: true,
      },
    });

    return {
      id: encomenda.id,
      status: encomenda.status,
      localArmazenamento: encomenda.localArmazenamento,
      observacao: encomenda.observacao,
      remetente: encomenda.remetente,
      createdAt: encomenda.createdAt,
      unidade: {
        id: encomenda.unidade.id,
        bloco: encomenda.unidade.bloco,
        numero: encomenda.unidade.numero,
      },
      morador: {
        id: encomenda.morador.id,
        nome: encomenda.morador.nome,
        telefoneFinal: encomenda.morador.telefonePrincipal.slice(-4),
      },
    };
  }

  private exigirTexto(value: string | undefined, campo: string) {
    const normalizado = value?.trim();
    if (!normalizado) {
      throw new BadRequestException(`${campo} é obrigatório.`);
    }

    return normalizado;
  }

  private normalizarOpcional(value: string | undefined) {
    const normalizado = value?.trim();
    return normalizado || undefined;
  }
}
