#!/usr/bin/env node
'use strict';
// Exercita o artefato compilado com PostgreSQL real e leitor de etiqueta controlado.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const request = require('supertest');
const sharp = require('sharp');

async function main() {
  assert(process.env.DATABASE_URL, 'Configure DATABASE_URL para uma base de teste migrada.');
  process.env.WHATSAPP_PROVIDER = 'fake';
  process.env.WHATSAPP_FAKE_MODE = 'sucesso';
  // O ensaio é offline: o leitor substituto é injetado somente no módulo de teste.
  global.fetch = async () => { throw new Error('Rede externa desabilitada no ensaio MVP.'); };
  const { AppModule } = require('../dist/app.module');
  const { LeitorEtiqueta } = require('../dist/encomendas/leitor-etiqueta');
  const { PrismaService } = require('../dist/prisma/prisma.service');
  const condominioId = randomUUID();
  const leituras = [];
  const etapas = [];
  const inicio = new Date();
  let modo = 'sucesso';
  const campos = { bloco: 'TESTE', unidade: '0042', destinatario: 'Pessoa fictícia MVP' };
  const leitor = { async ler(foto) {
    assert.equal((await sharp(foto).metadata()).format, 'jpeg');
    if (modo === 'falha') throw new Error('falha simulada');
    return { campos: modo === 'parcial' ? { ...campos, destinatario: null } : campos,
      respostaBruta: JSON.stringify({ simulada: true, campos }) };
  } };
  let app, db;
  const abrir = async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(LeitorEtiqueta).useValue(leitor).compile();
    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    db = app.get(PrismaService);
    return request(app.getHttpServer());
  };
  try {
    let http = await abrir();
    const unidade = await db.unidade.create({ data: { bloco: campos.bloco, numero: campos.unidade,
      condominio: { create: { id: condominioId, nome: `Ensaio MVP ${condominioId}`,
        endereco: 'Endereço fictício', cidade: 'Natal', estado: 'RN' } } } });
    const morador = await db.morador.create({ data: { nome: campos.destinatario,
      telefonePrincipal: '00000000042', unidadeId: unidade.id } });
    const foto = await sharp({ create: { width: 1200, height: 600, channels: 3,
      background: 'white' } }).png().toBuffer();
    const leitura = (await http.post('/api/encomendas/leitura-etiqueta').attach('foto', foto, 'etiqueta.png').expect(200)).body;
    leituras.push(leitura.leituraId);
    assert.equal(leitura.sugestao.id, morador.id);
    assert.equal(await db.encomenda.count({ where: { condominioId } }), 0,
      'a foto não deve registrar encomenda antes da confirmação humana');
    assert.ok(await db.leituraEtiqueta.findUnique({ where: { id: leitura.leituraId } }));
    etapas.push('foto PNG real processada pelo Sharp compilado, auditada e relacionada ao cadastro; confirmação exigida');
    const payload = { unidadeId: unidade.id, moradorId: morador.id, localArmazenamento: 'Armário MVP corrigido' };
    const recebida = (await http.post('/api/encomendas').send(payload).expect(201)).body;
    assert.equal(recebida.notificacaoWhatsApp.status, 'pendente');
    let notificacao;
    for (let i=0; i<40; i++) {
      notificacao = await db.notificacaoWhatsApp.findUniqueOrThrow({ where: { encomendaId: recebida.id } });
      if (notificacao.status === 'simulada') break;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.equal(notificacao.status, 'simulada');
    assert.equal(notificacao.tentativas, 1);
    assert.match(notificacao.provedorId, /^fake:/);
    etapas.push('cadastro confirmado e WhatsApp fake concluído pelo consumidor periódico em uma tentativa');
    await app.close();
    app = undefined;
    http = await abrir();
    let pendentes = (await http.get('/api/encomendas/pendentes').expect(200)).body;
    assert.equal(pendentes.find(p=>p.id===recebida.id).localArmazenamento, payload.localArmazenamento);
    etapas.push('encomenda e estado da notificação persistem após reiniciar a aplicação de teste');
    await http.post(`/api/encomendas/${recebida.id}/retirada`).send({ metodo:'telefone', codigo:'9999' }).expect(400);
    assert.equal((await db.encomenda.findUniqueOrThrow({ where:{ id:recebida.id } })).status, 'pendente');
    await http.post(`/api/encomendas/${recebida.id}/retirada`).send({ metodo:'telefone', codigo:'0042' }).expect(200);
    await http.post(`/api/encomendas/${recebida.id}/retirada`).send({ metodo:'telefone', codigo:'0042' }).expect(409);
    const entregue = await db.encomenda.findUniqueOrThrow({ where:{ id:recebida.id } });
    assert.equal(entregue.status, 'entregue');
    assert.equal(entregue.metodoRetirada, 'telefone');
    assert.ok(entregue.retiradaEm);
    pendentes = (await http.get('/api/encomendas/pendentes').expect(200)).body;
    assert(!pendentes.some(p=>p.id===recebida.id));
    etapas.push('código incorreto preserva pendência; código correto registra método/horário; repetição bloqueada e item removido dos pendentes');
    modo='parcial';
    const parcial = (await http.post('/api/encomendas/leitura-etiqueta').attach('foto',foto,'parcial.png').expect(200)).body;
    leituras.push(parcial.leituraId);
    assert.equal(parcial.status,'inconclusiva');
    assert.equal(parcial.sugestao,null);
    modo='falha';
    await http.post('/api/encomendas/leitura-etiqueta').attach('foto',foto,'falha.png').expect(503);
    await http.post('/api/encomendas/leitura-etiqueta').attach('foto',Buffer.from('inválida'),'invalida.png').expect(400);
    const manual = (await http.post('/api/encomendas').send(payload).expect(201)).body;
    await http.post(`/api/encomendas/${manual.id}/retirada`).send({ metodo:'manual', justificativa:'  ' }).expect(400);
    await http.post(`/api/encomendas/${manual.id}/retirada`).send({ metodo:'manual', justificativa:'Responsável conferido no ensaio fictício' }).expect(200);
    assert.equal((await db.encomenda.findUniqueOrThrow({ where:{ id:manual.id } })).metodoRetirada,'manual');
    etapas.push('leitura parcial e falha de provedor permitem cadastro manual; retirada manual exige justificativa');
    const final = new Date();
    console.log(JSON.stringify({ resultado:'aprovado', inicio:inicio.toISOString(), fim:final.toISOString(),
      duracao_segundos:(final-inicio)/1000, ambiente:{ node:process.version, banco:'PostgreSQL real',
        artefato:'NestJS compilado + Sharp real', leitura:'substituto injetado apenas no ensaio', whatsapp:'fake' },
      teste_externo:false, chamadas_externas:false, etapas }, null,2));
  } finally {
    if (db) {
      await db.notificacaoWhatsApp.deleteMany({ where:{ encomenda:{ condominioId } } });
      await db.encomenda.deleteMany({ where:{ condominioId } });
      await db.morador.deleteMany({ where:{ unidade:{ condominioId } } });
      await db.unidade.deleteMany({ where:{ condominioId } });
      await db.condominio.deleteMany({ where:{ id:condominioId } });
      await db.leituraEtiqueta.deleteMany({ where:{ id:{ in:leituras } } });
    }
    if (app) await app.close();
  }
}
main().catch(erro=>{ console.error(erro); process.exitCode=1; });
