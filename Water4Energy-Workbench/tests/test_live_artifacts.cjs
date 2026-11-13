// File provenance must resolve to the same VISTA store as the parsed artifact.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8').split('// Bind once.')[0];
const context = vm.createContext({console});
vm.runInContext(source + '\nglobalThis.parsePrediction = parsePredictionCSV;', context);
const csv = 'site_id,start,predicted_volume_m3\nELF13,2026-11-02,1000000\n';

test('displayed input CSV provenance downloads from uploads', () => {
  const study = context.parsePrediction(csv, 'nested folder/predictions.csv', 'uploads');
  assert.equal(study.provenance.sourceFileKind, 'uploads');
  assert.equal(study.downloads[0].url,
    '/api/vista/projects/Water4Energy-TVA-agent-loop/uploads/nested%20folder/predictions.csv');
});

test('generated prediction CSV defaults to outputs', () => {
  const study = context.parsePrediction(csv, 'predictions.csv');
  assert.equal(study.provenance.sourceFileKind, 'outputs');
  assert.equal(study.downloads[0].url,
    '/api/vista/projects/Water4Energy-TVA-agent-loop/outputs/predictions.csv');
});

test('unsupported artifact stores are not parsed into download links', () => {
  assert.equal(context.parsePrediction(csv, 'predictions.csv', 'settings'), null);
  assert.equal(context.parsePrediction(csv, 'predictions.csv', '../uploads'), null);
});

test('legacy model identifiers use the study-location catalog names', () => {
  vm.runInContext("state.network = {sites:[{id:'ELF13',name:'Norris'}]}; state.geo = {features:[]};", context);
  const study = context.parsePrediction(csv, 'predictions.csv');
  assert.equal(study.sites[0].id, 'ELF13');
  assert.equal(study.sites[0].name, 'Norris');
});

test('explicit model-site mapping resolves a location name without inventing coverage', () => {
  vm.runInContext("state.network = {sites:[{id:'NORRIS',modelSiteId:'ELF13',name:'Norris'},{id:'WOLF_CREEK',modelSiteId:null,name:'Wolf Creek'}]};", context);
  assert.equal(context.parsePrediction(csv, 'predictions.csv').sites[0].name, 'Norris');
  const unsupported = csv.replace('ELF13', 'unknown-model-site');
  assert.equal(context.parsePrediction(unsupported, 'predictions.csv').sites[0].name, 'unknown-model-site');
});
