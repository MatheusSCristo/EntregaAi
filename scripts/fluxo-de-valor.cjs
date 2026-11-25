#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const data = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname,
  '../docs/evidencias/sprint-02/fluxo-coleta.json'), 'utf8'));
const at = value => { const time = Date.parse(value); assert(Number.isFinite(time)); return time; };
const union = intervals => {
  const sorted = intervals.sort((a,b) => a[0]-b[0]);
  const merged = [];
  for (const interval of sorted) {
    const last = merged.at(-1);
    if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
    else merged.push([...interval]);
  }
  return merged.reduce((sum, [start,end]) => sum + end-start, 0);
};
assert.equal(data.schema_version, 1);
assert.equal(data.items.length, 3);
const rows = data.items.map(item => {
  const start = at(item.started_at), end = at(item.session_end_at), merge = at(item.merged_at);
  assert(start <= at(item.ready_at) && at(item.ready_at) <= end && end <= merge);
  assert(item.checks.every(c => c.conclusion === 'SUCCESS'));
  const processing = (end-start)/1000;
  const waiting = (merge-end)/1000;
  const ci = union(item.checks.map(c => [Math.max(start,at(c.started_at)), Math.min(end,at(c.completed_at))]))/1000;
  assert(ci >= 0 && ci <= processing);
  return { issue: item.issue, processing_estimated_seconds: processing,
    validation_window_seconds: waiting, lead_seconds: processing+waiting,
    ci_execution_union_seconds: ci,
    efficiency_estimated_percent: 100*processing/(processing+waiting),
    lead_hours: (processing+waiting)/3600 };
});
const sum = key => rows.reduce((total,row) => total+row[key],0);
const values = rows.map(r=>r.efficiency_estimated_percent);
console.log(JSON.stringify({ rows, aggregate: {
  mean_lead_hours: sum('lead_seconds')/rows.length/3600,
  mean_processing_estimated_hours: sum('processing_estimated_seconds')/rows.length/3600,
  mean_validation_window_hours: sum('validation_window_seconds')/rows.length/3600,
  mean_efficiency_estimated_percent: values.reduce((a,b)=>a+b,0)/values.length,
  weighted_efficiency_estimated_percent: 100*sum('processing_estimated_seconds')/sum('lead_seconds'),
  validation_share_percent: 100*sum('validation_window_seconds')/sum('lead_seconds'),
}, caveat: 'Eficiência estimada da janela de sessão, sem cronômetro de trabalho líquido; CI sobreposto não é somado. Lead = início registrado até merge, não criação da issue nem commit até produção.' }, null, 2));
