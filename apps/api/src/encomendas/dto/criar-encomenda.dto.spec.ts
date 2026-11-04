import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CriarEncomendaDto } from './criar-encomenda.dto';

describe('CriarEncomendaDto no pipeline HTTP', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const metadata = { type: 'body' as const, metatype: CriarEncomendaDto };
  const body = {
    unidadeId: '11111111-1111-4111-8111-111111111111',
    moradorId: '22222222-2222-4222-8222-222222222222',
    localArmazenamento: 'Armário A',
    remetente: 'Loja Exemplo',
    observacao: 'Frágil',
  };

  it('preserva os campos do cadastro quando whitelist está habilitada', async () => {
    const result = await pipe.transform({ ...body, campoDesconhecido: true }, metadata);
    expect(result).toEqual(body);
  });

  it('rejeita UUID inválido antes de consultar o banco', async () => {
    await expect(pipe.transform({ ...body, moradorId: 'invalido' }, metadata))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita campos de texto com tipos inesperados', async () => {
    await expect(pipe.transform({ ...body, localArmazenamento: 42 }, metadata))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});
