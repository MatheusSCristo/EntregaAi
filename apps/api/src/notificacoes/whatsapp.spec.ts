import { ConfigService } from '@nestjs/config';
import { WhatsAppFake } from './whatsapp';

describe('WhatsApp simulado', () => {
  const mensagem = { id: 'notificacao-1', tentativa: 1, telefone: 'telefone-ficticio',
    nome: 'Ana', bloco: 'A', unidade: '101', local: 'Armário' };
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  beforeEach(() => { fetchMock = jest.spyOn(global, 'fetch'); });
  afterEach(() => { expect(fetchMock).not.toHaveBeenCalled(); jest.restoreAllMocks(); });

  it('funciona sem credenciais, gera identificador claramente fictício e estável', async () => {
    const adapter = new WhatsAppFake(new ConfigService({}));
    expect(adapter.disponivel()).toBe(true);
    await expect(adapter.enviar(mensagem)).resolves.toBe('fake:notificacao-1');
    await expect(adapter.enviar(mensagem)).resolves.toBe('fake:notificacao-1');
  });

  it('falha temporariamente e obtém sucesso mesmo após recriar o adaptador', async () => {
    const config = new ConfigService({ WHATSAPP_FAKE_MODE: 'temporaria', WHATSAPP_FAKE_FAILURES: '1' });
    await expect(new WhatsAppFake(config).enviar(mensagem)).rejects.toMatchObject({ tipo: 'temporaria' });
    await expect(new WhatsAppFake(config).enviar({ ...mensagem, tentativa: 2 })).resolves.toMatch(/^fake:/);
  });

  it.each(['permanente', 'incerta'])('simula falha %s', async (modo) => {
    const adapter = new WhatsAppFake(new ConfigService({ WHATSAPP_FAKE_MODE: modo }));
    await expect(adapter.enviar(mensagem)).rejects.toMatchObject({ tipo: modo });
  });

  it('pode pausar o consumo sem gastar tentativas', async () => {
    const adapter = new WhatsAppFake(new ConfigService({ WHATSAPP_PROVIDER: 'disabled' }));
    expect(adapter.disponivel()).toBe(false);
  });

  it('sinaliza configuração inválida', async () => {
    const adapter = new WhatsAppFake(new ConfigService({ WHATSAPP_FAKE_FAILURES: '-1' }));
    await expect(adapter.enviar(mensagem)).rejects.toMatchObject({ codigo: 'configuracao_fake_invalida' });
  });
});
