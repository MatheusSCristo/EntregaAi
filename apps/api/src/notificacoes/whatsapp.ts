import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MensagemWhatsApp = {
  id: string; tentativa: number;
  telefone: string; nome: string; bloco: string; unidade: string; local: string;
};

export class FalhaWhatsApp extends Error {
  constructor(readonly codigo: string, readonly tipo: 'temporaria' | 'permanente' | 'incerta') {
    super(codigo);
  }
}

export abstract class WhatsApp {
  abstract disponivel(): boolean;
  abstract enviar(mensagem: MensagemWhatsApp): Promise<string>;
}

// Adaptador estritamente local: não chama APIs, não exige credenciais e não envia mensagens.
@Injectable()
export class WhatsAppFake extends WhatsApp {
  constructor(private readonly config: ConfigService) { super(); }

  disponivel() {
    return this.config.get<string>('WHATSAPP_PROVIDER', 'fake') === 'fake';
  }

  enviar(mensagem: MensagemWhatsApp): Promise<string> {
    if (!this.disponivel()) {
      return Promise.reject(new FalhaWhatsApp('simulador_desativado', 'permanente'));
    }
    const modo = this.config.get<string>('WHATSAPP_FAKE_MODE', 'sucesso');
    const falhas = Number(this.config.get<string>('WHATSAPP_FAKE_FAILURES', '1'));
    if (!Number.isInteger(falhas) || falhas < 0 || !['sucesso', 'temporaria', 'permanente', 'incerta'].includes(modo)) {
      return Promise.reject(new FalhaWhatsApp('configuracao_fake_invalida', 'permanente'));
    }
    if (modo === 'temporaria' && mensagem.tentativa <= falhas) {
      return Promise.reject(new FalhaWhatsApp('fake_temporaria', 'temporaria'));
    }
    if (modo === 'permanente' || modo === 'incerta') {
      return Promise.reject(new FalhaWhatsApp(`fake_${modo}`, modo));
    }
    return Promise.resolve(`fake:${mensagem.id}`);
  }
}
