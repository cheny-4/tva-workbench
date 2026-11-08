// Optional developer checks; Node is not required to run the application.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8').split('// Bind once.')[0];
const context = vm.createContext({console});
const projectUI = fs.readFileSync(path.join(__dirname, '../public/project-ui.js'), 'utf8');
vm.runInContext(projectUI + '\n' + source + '\nglobalThis.parse = {parseCSV, parsePredictionCSV, format};', context);

test('quoted CSV cells and CRLF preserve names and numeric fields', () => {
  const rows=context.parse.parseCSV('site_id,start,predicted_volume_m3,note\r\n"ELF13",2010-01-04,1000000,"a, b"\r\n');
  assert.equal(rows[0].note,'a, b');
  assert.equal(rows[0].predicted_volume_m3,'1000000');
});
test('plotting requires an explicit volume unit contract', () => {
  assert.equal(context.parse.parsePredictionCSV('site_id,date,prediction\nELF13,2010-01-04,10\n','unqualified.csv'),null);
});
test('volumes convert exactly and missing observations remain missing', () => {
  const data=context.parse.parsePredictionCSV('basin_id,start,predicted_volume_m3,observed_volume_m3\nELF13,2010-01-04,7000000,\nELF13,2010-01-11,0,1000000\n','predictions.csv');
  assert.equal(data.sites[0].series[0].predicted,7);
  assert.equal(data.sites[0].series[0].observed,null);
  assert.equal(data.sites[0].series[1].predicted,0);
  assert.equal(data.sites[0].series[1].observed,1);
});
test('impossible dates and explicitly nonweekly rows are excluded', () => {
  const csv='site_id,start,days,predicted_volume_m3\nELF13,2010-02-30,7,100\nELF13,2010-03-01,6,200\nELF13,2010-03-08,7,3000000\n';
  const data=context.parse.parsePredictionCSV(csv,'weekly.csv');
  assert.equal(data.sites[0].series.length,1);
  assert.equal(data.sites[0].series[0].date,'2010-03-08');
});
test('missing predictions stay null rather than becoming zero', () => {
  const data=context.parse.parsePredictionCSV('basin_id,start,predicted_volume_m3\nELF13,2010-01-04,NaN\nELF13,2010-01-18,\n','incomplete.csv');
  assert.equal(data.sites[0].series[0].predicted,null);
  assert.equal(data.sites[0].series[1].predicted,null);
});
test('missing totals cannot be exported as zero volume', () => {
  assert.equal(context.parse.format(null),'—');
  assert.equal(context.parse.format(undefined),'—');
  assert.equal(context.parse.format(''),'—');
  assert.equal(context.parse.format(0),'0.0');
});
test('starter prompts prepare a request without sending it or claiming a result', () => {
  const prompt={id:'lstm',livePrompt:'Verify the model mapping before proposing a job.'};
  const field={value:'',focus(){this.focused=true;}};
  const form={scrollIntoView(){}};
  const controls={'#prompt':field,'#chat-form':form};
  context.document={querySelector:selector=>controls[selector]};
  context.promptFixture=prompt;
  vm.runInContext("state.busy=false; state.prompts=[promptFixture]; state.network={sites:[{id:'WOLF_CREEK',name:'Wolf Creek',headwater:true,modelSiteId:null}]}; state.focusSiteId='WOLF_CREEK'; globalThis.sent=0; sendLive=()=>{sent++;}; switchView=view=>{globalThis.openedView=view;}; toast=()=>{}; usePrompt('lstm');",context);
  assert.equal(context.openedView,'workspace');
  assert.equal(context.sent,0);
  assert.equal(field.focused,true);
  assert.match(field.value,/Wolf Creek \(headwater reservoir\)/);
  assert.match(field.value,/No model-site mapping is supplied/);
  assert.match(field.value,/Verify the model mapping/);
  const before=field.value;
  vm.runInContext("state.busy=true; usePrompt('lstm');",context);
  assert.equal(field.value,before);
});
test('science stages retain truthful integration status and live prompts require job review', () => {
  const workflow=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/workflow.json')));
  const prompts=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/prompts.json'))).prompts;
  assert.deepEqual(workflow.stages.map(s=>s.id),['headwater','downscaling','water-availability','economics']);
  assert.equal(workflow.stages.filter(s=>s.status==='planned').length,3);
  assert.ok(workflow.stages.every(s=>!Object.hasOwn(s,'owner') && !/recorded/i.test(s.statusLabel)));
  assert.equal(new Set(prompts.map(p=>p.id)).size,prompts.length);
  assert.ok(prompts.every(p=>p.livePrompt.includes('Do not submit jobs') && p.livePrompt.includes('explicit confirmation') && !Object.hasOwn(p,'recordedAnswer')));
  assert.ok(prompts.some(p=>p.id==='results' && p.livePrompt.includes('project output')));
  const network=prompts.find(p=>p.id==='network').livePrompt;
  assert.match(network,/Wolf Creek and Dale Hollow/);
  assert.match(network,/not supplied/);
});
