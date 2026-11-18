import { ConfigService } from '@nestjs/config';
import { LeitorEtiquetaOpenAI } from './leitor-etiqueta';

describe('LeitorEtiquetaOpenAI', () => {
  const leitor = new LeitorEtiquetaOpenAI(new ConfigService({ OPENAI_API_KEY: 'chave-de-teste' }));

  afterEach(() => jest.restoreAllMocks());

  it('solicita saída estruturada e preserva a resposta original', async () => {
    const campos = { bloco: 'A', unidade: '0042', destinatario: 'Lívia da Silva' };
    const respostaBruta = JSON.stringify({
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(campos) }] }],
    });
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(respostaBruta));
    const foto = Buffer.from('foto');

    await expect(leitor.ler(foto)).resolves.toEqual({ respostaBruta, campos });

    const [url, opcoes] = fetch.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(JSON.parse(opcoes?.body as string)).toMatchObject({
      store: false,
      input: [{
        role: 'user',
        content: [{ type: 'input_image', image_url: `data:image/jpeg;base64,${foto.toString('base64')}` }],
      }],
      text: { format: { type: 'json_schema', strict: true } },
    });
  });

  it('preserva a recusa do provedor como leitura inconclusiva', async () => {
    const respostaBruta = JSON.stringify({
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'Imagem ilegível' }] }],
    });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(respostaBruta));
    await expect(leitor.ler(Buffer.from('foto'))).resolves.toEqual({ respostaBruta, campos: null });
  });

  it('sinaliza indisponibilidade quando o provedor rejeita a requisição', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 429 }));
    await expect(leitor.ler(Buffer.from('foto'))).rejects.toMatchObject({ status: 503 });
  });
});
