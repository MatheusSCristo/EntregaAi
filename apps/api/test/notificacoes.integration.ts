import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { EncomendasService } from '../src/encomendas/encomendas.service';
import { NotificacoesService, PRAZO_ENVIO_MS } from '../src/notificacoes/notificacoes.service';
import { WhatsAppFake } from '../src/notificacoes/whatsapp';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL para um banco de teste com migrations aplicadas.');
  const db = new PrismaService();
  const condominioId = randomUUID();
  let envios = 0;
  const config = new ConfigService({ WHATSAPP_PROVIDER: 'fake', WHATSAPP_FAKE_MODE: 'sucesso',
    WHATSAPP_FAKE_FAILURES: '1' });
  const fake = new WhatsAppFake(config);
  const enviar = fake.enviar.bind(fake);
  fake.enviar = (mensagem) => { envios++; return enviar(mensagem); };
  const worker = () => new NotificacoesService(db, fake);

  try {
    const unidade = await db.unidade.create({ data: { bloco: 'T', numero: '001',
      condominio: { create: { id: condominioId, nome: `Teste WhatsApp ${condominioId}`,
        endereco: 'Fictício', cidade: 'Natal', estado: 'RN' } } } });
    const morador = await db.morador.create({ data: { unidadeId: unidade.id, nome: 'Pessoa fictícia',
      telefonePrincipal: '00000000000' } });
    const service = new EncomendasService(db);
    const criar = () => service.criar({ unidadeId: unidade.id, moradorId: morador.id, localArmazenamento: 'Teste' });
    const consultar = (encomendaId: string) => db.notificacaoWhatsApp.findUniqueOrThrow({ where: { encomendaId } });
    const liberar = (encomendaId: string) => db.notificacaoWhatsApp.update({ where: { encomendaId },
      data: { proximaTentativaEm: new Date(0) } });

    const primeira = await criar();
    assert.equal(primeira.notificacaoWhatsApp?.status, 'pendente');
    await Promise.all(Array.from({ length: 12 }, () => worker().processarUma()));
    const concluida = await consultar(primeira.id);
    assert.equal(concluida.status, 'simulada');
    assert.equal(concluida.tentativas, 1);
    assert.equal(envios, 1, 'consumidores concorrentes não podem duplicar envio');
    await worker().processarUma();
    assert.equal(envios, 1, 'item terminal não deve ser reenviado');

    await assert.rejects(db.notificacaoWhatsApp.create({ data: {
      encomendaId: primeira.id, telefone: 'fictício', nome: 'Teste', bloco: 'T', unidade: '001', local: 'Teste',
    } }), { code: 'P2002' });
    const totalAntes = await db.encomenda.count({ where: { condominioId } });
    await assert.rejects(db.encomenda.create({ data: { condominioId, unidadeId: unidade.id,
      moradorId: morador.id, localArmazenamento: 'Rollback', notificacaoWhatsApp: { create: {
        id: concluida.id, telefone: 'fictício', nome: 'Teste', bloco: 'T', unidade: '001', local: 'Teste',
      } } } }), { code: 'P2002' });
    assert.equal(await db.encomenda.count({ where: { condominioId } }), totalAntes,
      'falha ao enfileirar deve desfazer o cadastro');

    config.set('WHATSAPP_PROVIDER', 'disabled');
    const pausada = await criar();
    await worker().processarUma();
    assert.equal((await consultar(pausada.id)).tentativas, 0);
    await db.$disconnect();
    await db.$connect();
    assert.equal((await consultar(pausada.id)).status, 'pendente');
    config.set('WHATSAPP_PROVIDER', 'fake');
    await worker().processarUma();
    assert.equal((await consultar(pausada.id)).status, 'simulada');

    config.set('WHATSAPP_FAKE_MODE', 'temporaria');
    const temporaria = await criar();
    await worker().processarUma();
    assert.equal((await consultar(temporaria.id)).status, 'pendente');
    await worker().processarUma();
    assert.equal((await consultar(temporaria.id)).tentativas, 1, 'backoff deve impedir consumo antecipado');
    await liberar(temporaria.id);
    await worker().processarUma();
    assert.equal((await consultar(temporaria.id)).status, 'simulada');
    assert.equal((await consultar(temporaria.id)).tentativas, 2);

    config.set('WHATSAPP_FAKE_FAILURES', '10');
    const limite = await criar();
    for (let i = 0; i < 3; i++) { await liberar(limite.id); await worker().processarUma(); }
    assert.equal((await consultar(limite.id)).status, 'falha');
    assert.equal((await consultar(limite.id)).tentativas, 3);

    for (const modo of ['permanente', 'incerta']) {
      config.set('WHATSAPP_FAKE_MODE', modo);
      const encomenda = await criar();
      await worker().processarUma();
      assert.equal((await consultar(encomenda.id)).status, modo === 'permanente' ? 'falha' : 'incerta');
      const antes = envios;
      await worker().processarUma();
      assert.equal(envios, antes);
    }

    const interrompida = await criar();
    await db.notificacaoWhatsApp.update({ where: { encomendaId: interrompida.id }, data: {
      status: 'enviando', tentativas: 1, envioIniciadoEm: new Date(Date.now() - PRAZO_ENVIO_MS - 1_000),
    } });
    await worker().processarUma();
    assert.equal((await consultar(interrompida.id)).status, 'incerta');
    console.log('PASS: PostgreSQL — cadastro/fila atômicos, unicidade, 12 consumidores, reinício, pausa, backoff, limite, falha e recuperação. Nenhuma mensagem real enviada.');
  } finally {
    // Somente registros criados por esta execução, identificados pelo condomínio aleatório.
    await db.notificacaoWhatsApp.deleteMany({ where: { encomenda: { condominioId } } });
    await db.encomenda.deleteMany({ where: { condominioId } });
    await db.morador.deleteMany({ where: { unidade: { condominioId } } });
    await db.unidade.deleteMany({ where: { condominioId } });
    await db.condominio.deleteMany({ where: { id: condominioId } });
    await db.$disconnect();
  }
}

main().catch((erro) => { console.error(erro); process.exitCode = 1; });
