import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { EncomendasService } from './encomendas.service';
import { LeitorEtiqueta } from './leitor-etiqueta';

export const LIMITE_FOTO_ETIQUETA = 5 * 1024 * 1024;
const formatosAceitos = ['jpeg', 'png', 'webp'];

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

@Injectable()
export class EtiquetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encomendas: EncomendasService,
    private readonly leitor: LeitorEtiqueta,
  ) {}

  async ler(foto?: Buffer) {
    if (!foto?.length || foto.length > LIMITE_FOTO_ETIQUETA) {
      throw new BadRequestException('Envie uma foto de até 5 MiB.');
    }

    let preparada: Buffer;
    try {
      const imagem = sharp(foto, { limitInputPixels: 24_000_000 });
      const { format, pages } = await imagem.metadata();
      if (!format || !formatosAceitos.includes(format) || (pages ?? 1) > 1) {
        throw new Error('Formato de foto inválido.');
      }
      preparada = await imagem
        .rotate()
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg()
        .toBuffer();
    } catch {
      throw new BadRequestException('Envie uma foto JPEG, PNG ou WebP válida.');
    }

    let leitura: Awaited<ReturnType<LeitorEtiqueta['ler']>>;
    try {
      leitura = await this.leitor.ler(preparada);
    } catch {
      throw new ServiceUnavailableException('Leitura de etiqueta indisponível. Tente novamente.');
    }

    const { campos, respostaBruta } = leitura;
    const auditoria = await this.prisma.leituraEtiqueta.create({
      data: { respostaBruta },
      select: { id: true },
    });
    const { bloco, unidade, destinatario } = campos ?? {};
    if (!bloco || !unidade || !destinatario) {
      return { leituraId: auditoria.id, status: 'inconclusiva', campos, sugestao: null };
    }

    const moradores = await this.encomendas.listarDestinatarios();
    const candidatos = moradores.filter((morador) =>
      normalizar(morador.unidade.bloco) === normalizar(bloco) &&
      normalizar(morador.unidade.numero) === normalizar(unidade) &&
      normalizar(morador.nome) === normalizar(destinatario),
    );
    const sugestao = candidatos.length === 1 ? candidatos[0] : null;
    return {
      leituraId: auditoria.id,
      status: sugestao ? 'aguardando_confirmacao' : 'inconclusiva',
      campos,
      sugestao,
    };
  }
}
