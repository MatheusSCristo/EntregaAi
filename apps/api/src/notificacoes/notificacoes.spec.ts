import { NotificacoesService, MAX_TENTATIVAS } from './notificacoes.service';
import { FalhaWhatsApp } from './whatsapp';

describe('fila WhatsApp', () => {
  const fila = { updateMany: jest.fn(), findFirst: jest.fn() };
  const whatsapp = { disponivel: jest.fn(), enviar: jest.fn() };
  const service = new NotificacoesService({ notificacaoWhatsApp: fila } as never, whatsapp);
  const item = { id: 'n1', tentativas: 0, telefone: '84991234567', nome: 'Ana',
    bloco: 'A', unidade: '101', local: 'Armário' };

  beforeEach(() => {
    jest.resetAllMocks();
    fila.updateMany.mockResolvedValue({ count: 1 });
    fila.findFirst.mockResolvedValue(item);
    whatsapp.disponivel.mockReturnValue(true);
    whatsapp.enviar.mockResolvedValue('fake:n1');
  });

  it('salva o identificador do provedor e identifica a simulação', async () => {
    await service.processarUma();
    expect(whatsapp.enviar).toHaveBeenCalledWith({ ...item, tentativa: 1 });
    expect(fila.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'n1', status: 'enviando', tentativas: 1 },
      data: { status: 'simulada', provedorId: 'fake:n1', simuladaEm: expect.any(Date), ultimoErro: null },
    });
  });

  it('mantém a fila sem consumir tentativas enquanto o envio está desativado', async () => {
    whatsapp.disponivel.mockReturnValue(false);
    await service.processarUma();
    expect(fila.findFirst).not.toHaveBeenCalled();
    expect(whatsapp.enviar).not.toHaveBeenCalled();
  });

  it('não envia quando outro consumidor já reservou o item', async () => {
    fila.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 0 });
    await service.processarUma();
    expect(whatsapp.enviar).not.toHaveBeenCalled();
  });

  it('agenda nova tentativa com espera após recusa temporária explícita', async () => {
    whatsapp.enviar.mockRejectedValue(new FalhaWhatsApp('meta_130429', 'temporaria'));
    const antes = Date.now();
    await service.processarUma();
    const data = fila.updateMany.mock.calls.at(-1)[0].data;
    expect(data.status).toBe('pendente');
    expect(data.proximaTentativaEm.getTime()).toBeGreaterThanOrEqual(antes + 60_000);
    expect(fila.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'pendente', proximaTentativaEm: { lte: expect.any(Date) },
        tentativas: { lt: MAX_TENTATIVAS } },
    }));
  });

  it('encerra após três tentativas', async () => {
    fila.findFirst.mockResolvedValue({ ...item, tentativas: MAX_TENTATIVAS - 1 });
    whatsapp.enviar.mockRejectedValue(new FalhaWhatsApp('meta_130429', 'temporaria'));
    await service.processarUma();
    expect(fila.updateMany.mock.calls.at(-1)[0].data.status).toBe('falha');
  });

  it('não repete falha permanente', async () => {
    whatsapp.enviar.mockRejectedValue(new FalhaWhatsApp('meta_190', 'permanente'));
    await service.processarUma();
    expect(fila.updateMany.mock.calls.at(-1)[0].data.status).toBe('falha');
  });

  it('isola resultado desconhecido para não duplicar um envio possivelmente aceito', async () => {
    whatsapp.enviar.mockRejectedValue(new Error('timeout'));
    await service.processarUma();
    expect(fila.updateMany.mock.calls.at(-1)[0].data).toEqual(expect.objectContaining({
      status: 'incerta', ultimoErro: 'resultado_desconhecido',
    }));
  });

  it('uma falha de banco depois do envio não agenda novo envio', async () => {
    fila.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 })
      .mockRejectedValueOnce(new Error('banco indisponível'));
    await expect(service.processarUma()).rejects.toThrow('banco indisponível');
    expect(whatsapp.enviar).toHaveBeenCalledTimes(1);
    expect(fila.updateMany).toHaveBeenCalledTimes(3);
  });

  it('recupera reservas abandonadas como incertas, sem reenviar automaticamente', async () => {
    fila.findFirst.mockResolvedValue(null);
    await service.processarUma();
    expect(fila.updateMany).toHaveBeenNthCalledWith(1, {
      where: { status: 'enviando', envioIniciadoEm: { lt: expect.any(Date) } },
      data: { status: 'incerta', ultimoErro: 'processamento_interrompido' },
    });
    expect(whatsapp.enviar).not.toHaveBeenCalled();
  });
});
