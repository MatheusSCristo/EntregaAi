#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const data=JSON.parse(fs.readFileSync(process.argv[2]||path.join(__dirname,'../docs/evidencias/sprint-02/retrospectiva-base.json'),'utf8'));
assert.equal(data.schema_version,1);
for(const source of data.source_files) assert.equal(crypto.createHash('sha256').update(source.content,'utf8').digest('hex'),source.sha256,'Fonte alterada: '+source.path);
const source=name=>JSON.parse(data.source_files.find(s=>s.path===name).content.replace(/^\uFEFF/,''));
const issues=source('docs/evidencias/sprint-01/issues.json').filter(i=>[2,3,4,5,6].includes(i.number));
assert.equal(issues.length,5);
const leadDays=issues.map(i=>(Date.parse(i.closed_at)-Date.parse(i.created_at))/86400000);
const transitions=source('docs/evidencias/sprint-01/transicoes-projects.json').data.repository;
const cycles=[];
for(const number of [2,3,4,5,6]) {
  const events=transitions[`i${number}`].timelineItems.nodes;
  const start=events.find(e=>e.status==='In progress');
  const end=events.find(e=>e.status==='Done');
  if(start&&end) cycles.push({issue:number,seconds:(Date.parse(end.createdAt)-Date.parse(start.createdAt))/1000});
}
const weekStarts=['2026-09-21T03:00:00Z','2026-09-28T03:00:00Z','2026-10-05T03:00:00Z','2026-10-12T03:00:00Z'];
const throughput=weekStarts.map(start=>issues.filter(i=>Date.parse(i.closed_at)>=Date.parse(start)&&Date.parse(i.closed_at)<Date.parse(start)+7*86400000).length);
assert.deepEqual(throughput,[3,0,0,2]);
assert.equal(cycles.length,2);
assert.equal(data.sprint2_dora.result.deployments,9);
assert.equal(data.sprint2_dora.result.commit_lead_time.median_seconds,1207);
assert.equal(data.sprint2_flow.result.rows.length,3);
assert.equal(data.sprint2_mvp.result.compiled_flow.resultado,'aprovado');
assert.equal(data.sprint2_mvp.result.compiled_flow.teste_externo,false);
assert.equal(data.sprint2_mvp.result.persistence.encomenda_persistida,true);
console.log(JSON.stringify({baseline:{sprint1_issue_lead_mean_days:leadDays.reduce((a,b)=>a+b,0)/leadDays.length,
  sprint1_cycle_mean_days:cycles.reduce((a,b)=>a+b.seconds,0)/cycles.length/86400,cycle_coverage:'2/5',cycles,throughput},
  sprint2_dora:data.sprint2_dora.result.commit_lead_time,
  sprint2_flow:data.sprint2_flow.result.aggregate,
  mvp:{compiled:'aprovado',external_test:false,compose_seconds:data.sprint2_mvp.result.compose.duracao_segundos},
  comparability:'Definições e populações diferentes; não calcular melhoria percentual de lead time entre sprints.'},null,2));
