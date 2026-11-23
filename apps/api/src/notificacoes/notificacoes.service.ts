import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FalhaWhatsApp, WhatsApp } from './whatsapp';

export const MAX_TENTATIVAS = 3;
export const PRAZO_ENVIO_MS = 120_000;

@Injectable()
export class NotificacoesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificacoesService.name);
  private timer?: ReturnType<typeof setInterval>;
  private processamento?: Promise<void>;

  constructor(private readonly prisma: PrismaService, private readonly whatsapp: WhatsApp) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      if (this.processamento) return;
      this.processamento = this.processarUma()
        .catch(() => { this.logger.error('Falha ao processar a fila WhatsApp.'); })
        .finally(() => { this.processamento = undefined; });
    }, 2_000);
    this.timer.unref();
  }

  async onModuleDestroy() {
    clearInterval(this.timer);
    await this.processamento;
  }

  async processarUma() {
    // Um processo encerrado pode ter enviado antes de conseguir persistir o resultado.
    await this.prisma.notificacaoWhatsApp.updateMany({
      where: { status: 'enviando', envioIniciadoEm: { lt: new Date(Date.now() - PRAZO_ENVIO_MS) } },
      data: { status: 'incerta', ultimoErro: 'processamento_interrompido' },
    });
    if (!this.whatsapp.disponivel()) return;
    const agora = new Date();
    const item = await this.prisma.notificacaoWhatsApp.findFirst({
      where: { status: 'pendente', proximaTentativaEm: { lte: agora }, tentativas: { lt: MAX_TENTATIVAS } },
      orderBy: [{ proximaTentativaEm: 'asc' }, { id: 'asc' }],
    });
    if (!item) return;
    const tentativas = item.tentativas + 1;
    const reserva = await this.prisma.notificacaoWhatsApp.updateMany({
      where: { id: item.id, status: 'pendente', tentativas: item.tentativas,
        proximaTentativaEm: { lte: agora } },
      data: { status: 'enviando', tentativas, envioIniciadoEm: agora },
    });
    if (reserva.count !== 1) return;
    const where = { id: item.id, status: 'enviando' as const, tentativas };
    let provedorId: string;
    try {
      provedorId = await this.whatsapp.enviar({ ...item, tentativa: tentativas });
    } catch (erro) {
      const falha = erro instanceof FalhaWhatsApp ? erro :
        new FalhaWhatsApp('resultado_desconhecido', 'incerta');
      const repetir = falha.tipo === 'temporaria' && tentativas < MAX_TENTATIVAS;
      await this.prisma.notificacaoWhatsApp.updateMany({
        where,
        data: {
          status: repetir ? 'pendente' : falha.tipo === 'incerta' ? 'incerta' : 'falha',
          ultimoErro: falha.codigo,
          proximaTentativaEm: new Date(Date.now() + 60_000 * 2 ** (tentativas - 1)),
        },
      });
      return;
    }
    // Persistência falha após envio: manter reserva; recuperação marcará como incerta.
    await this.prisma.notificacaoWhatsApp.updateMany({
      where, data: { status: 'simulada', provedorId, simuladaEm: new Date(), ultimoErro: null },
    });
  }
}
