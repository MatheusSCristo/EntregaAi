#!/usr/bin/env node
'use strict';

// Reproduz os cálculos do snapshot congelado, sem rede ou dependências npm.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const input = path.resolve(process.argv[2] ||
  path.join(__dirname, '../docs/evidencias/sprint-02/dora-coleta.json'));
const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const ms = value => {
  const parsed = Date.parse(value);
  assert(Number.isFinite(parsed), 'Timestamp inválido: ' + value);
  return parsed;
};
const start = ms(data.window.start);
const end = ms(data.window.end);
assert(end > start, 'Janela vazia');
const inside = value => value != null && ms(value) >= start && ms(value) < end;
const unique = (items, key) => {
  assert.equal(new Set(items.map(key)).size, items.length, 'Registros duplicados');
};
const statistics = values => {
  assert(values.length, 'Amostra vazia');
  const sorted = [...values].sort((a, b) => a - b);
  assert(sorted.every(x => Number.isFinite(x) && x >= 0), 'Duração inválida');
  const middle = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    min_seconds: sorted[0],
    median_seconds: sorted.length % 2 ? sorted[middle] :
      (sorted[middle - 1] + sorted[middle]) / 2,
    mean_seconds: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
    p90_seconds: sorted[Math.ceil(0.9 * sorted.length) - 1],
    max_seconds: sorted.at(-1)
  };
};
assert.equal(data.schema_version, 1);
unique(data.pulls, p => p.number);
unique(data.workflow_runs, r => r.id);
unique(data.main_runs, r => r.id);
for (const [name, page] of Object.entries(data.collection.pages)) {
  // O snapshot atual cabe em uma página; recusar uma coleta possivelmente truncada.
  assert(page.returned < page.per_page, 'Paginar a fonte: ' + name);
  if (page.total_count != null) assert.equal(page.returned, page.total_count);
}
assert.equal(data.workflow_runs.length, data.collection.pages.workflow_runs.returned);
assert.equal(data.main_runs.length, data.collection.pages.main_push_runs.returned);
assert.equal(data.pulls.length, data.collection.pages.pulls.returned);

const merges = data.pulls.filter(p => p.base === 'main' && inside(p.merged_at));
assert(merges.length, 'Nenhum merge na janela');
const rows = merges.map(p => {
  const candidates = data.main_runs.filter(r =>
    r.head_sha === p.merge_commit_sha && r.event === 'push' &&
    r.head_branch === 'main' && r.name === 'CI' &&
    r.status === 'completed' && r.conclusion === 'success');
  assert(candidates.length, 'CI aprovado ausente no merge #' + p.number);
  const completed = candidates.map(run => {
    const jobs = data.jobs_by_run[run.id];
    assert(jobs && jobs.jobs.length > 0, 'Jobs ausentes no run ' + run.id);
    assert.equal(jobs.total_count, jobs.jobs.length, 'Jobs truncados');
    assert(jobs.jobs.every(j => j.status === 'completed' &&
      j.conclusion === 'success' && j.completed_at), 'Job sem aprovação');
    return { run, at: Math.max(...jobs.jobs.map(j => ms(j.completed_at))) };
  }).sort((a, b) => a.at - b.at)[0];
  assert(inside(new Date(completed.at).toISOString()), 'CI fora da janela');
  const commits = data.commits_by_pr[p.number];
  assert(commits && commits.length > 0 && commits.length < 100,
    'Coleta de commits ausente ou possivelmente truncada');
  unique(commits, c => c.sha);
  const own = commits.filter(c => c.parent_shas.length === 1);
  assert(own.length, 'PR sem commits próprios');
  assert(ms(p.merged_at) <= completed.at);
  const first = Math.min(...own.map(c => ms(c.committed_at)));
  return {
    pr: p.number,
    first_commit_at: new Date(first).toISOString(),
    merged_at: p.merged_at,
    deployed_at: new Date(completed.at).toISOString(),
    merge_sha: p.merge_commit_sha,
    run_id: completed.run.id,
    lead_seconds: (completed.at - first) / 1000,
    pr_open_to_merge_seconds: (ms(p.merged_at) - ms(p.created_at)) / 1000,
    merge_to_ci_seconds: (completed.at - ms(p.merged_at)) / 1000,
    commit_leads: own.map(c => ({
      sha: c.sha, committed_at: c.committed_at,
      lead_seconds: (completed.at - ms(c.committed_at)) / 1000
    }))
  };
}).sort((a, b) => ms(a.deployed_at) - ms(b.deployed_at));
unique(rows.flatMap(r => r.commit_leads), c => c.sha);
const mainRunsInWindow = data.main_runs.filter(r => inside(r.created_at) &&
  r.name === 'CI' && r.event === 'push' && r.head_branch === 'main');
assert(mainRunsInWindow.every(r => rows.some(row => row.merge_sha === r.head_sha)),
  'Run da main sem merge correspondente: verificar push direto ou falha');
assert(data.workflow_runs.every(r => inside(r.created_at)), 'Run fora da coleta');
assert(data.workflow_runs.every(r => r.run_attempt === 1),
  'Consultar histórico das tentativas antes de agregar');
const ci = data.workflow_runs.filter(r =>
  r.name === 'CI' && r.path === '.github/workflows/ci.yml' &&
  ['push', 'pull_request'].includes(r.event));
assert(ci.every(r => r.status === 'completed'), 'CI pendente');
const failed = ci.filter(r => r.conclusion === 'failure');
const intentional = new Set(data.intentional_ci_failures.map(x => x.run_id));
assert([...intentional].every(id => failed.some(r => r.id === id)));
const operational = ci.filter(r => !intentional.has(r.id));
unique(data.incidents, x => x.id);
unique(data.incidents, x => x.failed_pr);
const recoveries = data.incidents.map(incident => {
  const bad = rows.find(r => r.pr === incident.failed_pr);
  const fixed = rows.find(r => r.pr === incident.recovery_pr);
  assert(bad && fixed, 'Incidente sem implantação/correção na amostra');
  assert(ms(bad.deployed_at) <= ms(incident.reported_at));
  assert(ms(fixed.deployed_at) >= ms(incident.reported_at));
  assert(data.commits_by_pr[incident.recovery_pr].some(c =>
    c.sha === incident.fix_commit), 'Correção não pertence ao PR');
  return {
    id: incident.id, failed_pr: incident.failed_pr,
    recovery_pr: incident.recovery_pr,
    reported_at: incident.reported_at,
    recovered_proxy_at: fixed.deployed_at,
    report_to_corrected_ci_seconds:
      (ms(fixed.deployed_at) - ms(incident.reported_at)) / 1000
  };
});

const day = 86400000;
const monday = new Date(start - 3 * 3600000);
const shift = (monday.getUTCDay() + 6) % 7;
monday.setUTCDate(monday.getUTCDate() - shift);
monday.setUTCHours(0, 0, 0, 0);
let week = monday.getTime() + 3 * 3600000;
const weeks = [];
while (week < end) {
  const from = Math.max(start, week);
  const to = Math.min(end, week + 7 * day);
  const group = rows.filter(r => ms(r.deployed_at) >= from && ms(r.deployed_at) < to);
  weeks.push({
    local_monday: new Date(week - 3 * 3600000).toISOString().slice(0, 10),
    observed_days: (to - from) / day,
    deployments: group.length,
    prs: group.map(r => r.pr),
    documented_failures: data.incidents.filter(i =>
      group.some(r => r.pr === i.failed_pr)).length
  });
  week += 7 * day;
}
const commitLeads = rows.flatMap(r => r.commit_leads.map(c => c.lead_seconds));
const days = (end - start) / day;
console.log(JSON.stringify({
  window: data.window,
  days,
  deployments: rows.length,
  deployments_per_day: rows.length / days,
  deployments_per_seven_days: rows.length / days * 7,
  commit_lead_time: statistics(commitLeads),
  first_commit_per_pr_lead_time: statistics(rows.map(r => r.lead_seconds)),
  documented_change_failures: data.incidents.length,
  documented_change_fail_rate_percent: data.incidents.length / rows.length * 100,
  recovery_intervals: recoveries,
  ci: {
    total_runs: ci.length,
    failure_runs: failed.length,
    failure_percent: failed.length / ci.length * 100,
    intentional_failure_runs: intentional.size,
    non_intentional_runs: operational.length,
    non_intentional_failure_runs:
      operational.filter(r => r.conclusion === 'failure').length,
    excluded_dynamic_runs: data.workflow_runs.length - ci.length
  },
  weeks,
  rows
}, null, 2));
