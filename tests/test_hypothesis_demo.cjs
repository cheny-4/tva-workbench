// The values below are isolated contract fixtures, never bundled as demo results.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const demo=require('../public/hypothesis-demo.js');
const definition=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/demo-case.json'),'utf8'));
const fixed={start:'2019-04-16',end:'2019-04-22',issued:'2019-04-15'};
function fixture(){
  const panels={};
  for(const id of ['temperature','precipitation'])panels[id]={kind:'frozen_prediction',model:'det_v2_soil_k9',figure:id+'.png',source_file:'realization.json',source:'Contract fixture only'};
  panels.runoff={kind:'observation',dataset:'ERA5',variable:'sro',forecast_available:false,figure:'runoff.png',source_file:'realization.json',source:'Contract fixture only'};
  panels.downscale={kind:'frozen_comparison',trial:'Trial 0',scored:'2026-09-07',input_resolution_deg:1,output_resolution_deg:0.25,date:'2019-04-19',figure:'comparison.png',source_file:'scorecard.json',source:'Contract fixture only'};
  return {schema_version:1,case:{...fixed},panels};
}
const files=['temperature.png','precipitation.png','runoff.png','comparison.png','realization.json','scorecard.json','readout.json'].map(name=>({name,size:100}));

test('only the fixed issue and valid week match the demo',()=>{
  assert.equal(demo.matchesCase(fixed),true);
  assert.equal(demo.matchesCase({...fixed,issued:'2019-04-16'}),false);
  assert.equal(demo.dateInCase('2019-04-19'),true);
  assert.equal(demo.dateInCase('2019-04-23'),false);
  const data=fixture();data.case.start='2010-01-04';
  const result=demo.validateManifest(data,files);
  assert.equal(result.matched,false);
  assert.ok(Object.values(result.panels).every(panel=>!panel.available));
});
test('matching metadata requires existing figures and backing source JSON',()=>{
  let data=fixture(),result=demo.validateManifest(data,files);
  assert.equal(result.matched,true);
  assert.equal(Object.values(result.panels).filter(panel=>panel.available).length,4);
  result=demo.validateManifest(data,files.filter(file=>file.name!=='realization.json'));
  assert.equal(result.panels.temperature.available,false);
  assert.equal(result.panels.downscale.available,true);
  data=fixture();data.example_only=true;
  assert.equal(demo.validateManifest(data,files).matched,false);
});
test('runoff cannot be mislabeled as a forecast or a different data source',()=>{
  for(const change of [{kind:'forecast'},{dataset:'HEADWATER'},{forecast_available:true},{variable:'runoff'}]){
    const data=fixture();Object.assign(data.panels.runoff,change);
    assert.equal(demo.validateManifest(data,files).panels.runoff.available,false);
  }
});
test('downscale requires the frozen comparison and an in-week figure date',()=>{
  for(const change of [{date:'2018-01-19'},{output_resolution_deg:0.01},{trial:'Trial 1'},{scored:'2026-11-08'}]){
    const data=fixture();Object.assign(data.panels.downscale,change);
    assert.equal(demo.validateManifest(data,files).panels.downscale.available,false);
  }
});
test('unsafe and ambiguous output references cannot enter evidence cards',()=>{
  for(const name of ['/tmp/file.png','../file.png','a/../file.png','https://example.com/x.png','a%2fb.png','a\\b.png','a\u0000.png'])assert.equal(demo.validPath(name),false,name);
  assert.equal(demo.validPath('figures/case figure.png'),true);
  const data=fixture();data.panels.temperature.figure='../temperature.png';
  assert.equal(demo.validateManifest(data,files).panels.temperature.available,false);
});
test('required skills use exact names and separate the optional dam skill',()=>{
  const response={project:definition.project,project_found:true,count:3,skills:[{name:'lab.ledger'},{name:'lab.ledger-extra'},{name:'dam.readout'}]};
  const result=demo.skillReadiness(response,definition.project);
  assert.equal(result.loaded,1);
  assert.equal(result.optional,'loaded');
  assert.equal(result.required.length,8);
  assert.equal(demo.skillReadiness({...response,project:'Other'},definition.project).known,false);
  assert.equal(demo.skillReadiness({project:definition.project,project_found:false,count:null},definition.project).loaded,null);
});
test('a ready index does not imply all six lead sources are present',()=>{
  const knowledge={project:definition.project,project_found:true,count:1,ready_count:1,all_ready:true,knowledge_bases:[{build_status:'ready',ready:true,documents:[{filename:'README.md',title:'Unrelated README',index_status:'indexed'},{filename:'TVA_AGENT_DEMO_PLAN_20261102.md',index_status:'indexed'}]}]};
  const coverage=demo.knowledgeCoverage(knowledge,definition.sources,definition.project);
  assert.equal(coverage.listed,1);
  assert.equal(coverage.rows.find(row=>row.source.id==='readme').state,'not-listed');
  assert.equal(coverage.rows.find(row=>row.source.id==='plan').state,'listed-ready-index');
  assert.equal(demo.knowledgeCoverage({...knowledge,project:'Other'},definition.sources,definition.project).listed,null);
  const rebuilding=JSON.parse(JSON.stringify(knowledge));rebuilding.knowledge_bases[0].ready=false;
  assert.equal(demo.knowledgeCoverage(rebuilding,definition.sources,definition.project).rows.find(row=>row.source.id==='plan').state,'listed');
});
test('the dam readout stays unavailable until explicitly enabled with matching rule and source',()=>{
  const manifestation=demo.validateManifest(fixture(),files);
  const selection={enabled:false,reservoir:'Normandy',rule:'Agreed test rule'};
  const readout={case:{...fixed},reservoir:'Normandy',rule:'Agreed test rule',decision:'hold',realization_source_file:'realization.json'};
  assert.equal(demo.validateDamReadout(readout,selection,manifestation).available,false);
  selection.enabled=true;
  assert.equal(demo.validateDamReadout(readout,selection,manifestation).available,true);
  assert.equal(demo.validateDamReadout({...readout,decision:'release'},selection,manifestation).available,false);
  assert.equal(demo.validateDamReadout({...readout,reservoir:'Norris'},selection,manifestation).available,false);
  assert.equal(demo.validateDamReadout({...readout,rule:'A different rule'},selection,manifestation).available,false);
  assert.equal(demo.validateDamReadout({...readout,realization_source_file:'unrelated.json'},selection,manifestation).available,false);
  assert.equal(demo.validateDamReadout({...readout,case:{...fixed,end:'2019-04-23'}},selection,manifestation).available,false);
  const invalid=fixture();
  invalid.panels.temperature.model='unknown';invalid.panels.precipitation.model='unknown';invalid.panels.runoff.kind='forecast';
  assert.equal(demo.validateDamReadout(readout,selection,demo.validateManifest(invalid,files)).available,false);
});

function refreshHarness(provider) {
  const context=vm.createContext({module:{exports:{}},document:{querySelector:()=>null}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/hypothesis-demo.js'),'utf8'),context);
  const instance=context.module.exports;
  const outputBase='/api/vista/projects/'+definition.project+'/outputs';
  instance.init({caseDefinition:definition,projectUrl:suffix=>'/api/vista/projects/'+definition.project+suffix,api:provider});
  return {instance,outputBase,refresh:(next={})=>instance.refresh({project:definition.project,status:{project_found:true},...next})};
}
function researchFixture() {
  const manifest=fixture();
  manifest.research={ledger_file:'records/ledger April.json',proposal_file:'review/proposal.md',critic_file:'review/critic.md',referee_file:'review/referee.md',protocol_file:'review/human protocol.md'};
  return {manifest,listing:[...files,{name:definition.manifest,size:100},...Object.values(manifest.research).map(name=>({name,size:100}))]};
}
const plain=value=>JSON.parse(JSON.stringify(value));

test('refresh returns actual research references as encoded links scoped to the current output store',async()=>{
  const {manifest,listing}=researchFixture();
  manifest.research.unrecognized_file='not-a-research-step.md';
  manifest.research.url='https://example.com/untrusted';
  listing.push({name:'not-a-research-step.md',size:100});
  const harness=refreshHarness(async url=>url.endsWith('/outputs')?listing:manifest);
  const result=await harness.refresh();
  assert.equal(result.matched,true);
  assert.deepEqual(plain(result.researchLinks),[
    {step:'ledger',name:'records/ledger April.json',url:harness.outputBase+'/records/ledger%20April.json'},
    {step:'proposer',name:'review/proposal.md',url:harness.outputBase+'/review/proposal.md'},
    {step:'critic',name:'review/critic.md',url:harness.outputBase+'/review/critic.md'},
    {step:'referee',name:'review/referee.md',url:harness.outputBase+'/review/referee.md'},
    {step:'human',name:'review/human protocol.md',url:harness.outputBase+'/review/human%20protocol.md'},
  ]);
});

test('research references require existing safe names and a matching non-example manifest',async()=>{
  let data=researchFixture();
  const harness=refreshHarness(async url=>url.endsWith('/outputs')?data.listing:data.manifest);
  for(const name of ['../ledger.json','/ledger.json','https://example.com/ledger.json','a%2fledger.json','a\\ledger.json','a?ledger.json','a#ledger.json','a\u0000.json']) {
    data=researchFixture();data.manifest.research={ledger_file:name};data.listing.push({name,size:100});
    assert.deepEqual(plain((await harness.refresh()).researchLinks),[],name);
  }
  data=researchFixture();data.manifest.research={ledger_file:'absent.json'};
  assert.deepEqual(plain((await harness.refresh()).researchLinks),[]);
  for(const change of [{schema_version:2},{case:{...fixed,start:'2019-04-17'}},{example_only:true}]) {
    data=researchFixture();Object.assign(data.manifest,change);
    const result=await harness.refresh();
    assert.equal(result.matched,false);
    assert.deepEqual(plain(result.researchLinks),[]);
  }
});

test('unavailable project, missing manifest and read failure explicitly clear prior research links',async()=>{
  const data=researchFixture();let mode='valid';
  const harness=refreshHarness(async url=>{
    if(mode==='failed')throw new Error('QA fixture unavailable');
    if(url.endsWith('/outputs'))return mode==='missing'?files:data.listing;
    return data.manifest;
  });
  for(const unavailable of [
    ()=>harness.refresh({project:'Other project'}),
    ()=>harness.refresh({status:{project_found:false}}),
    ()=>{mode='missing';return harness.refresh();},
    ()=>{mode='failed';return harness.refresh();},
  ]) {
    mode='valid';assert.equal((await harness.refresh()).researchLinks.length,5);
    const result=await unavailable();
    assert.equal(result.matched,false);
    assert.deepEqual(plain(result.researchLinks),[]);
  }
});

test('a superseded output read cannot replace a newer set of research links',async()=>{
  const data=researchFixture();let release,reads=0;
  const harness=refreshHarness(async url=>{
    if(url.endsWith('/outputs')) {
      if(++reads===1)return new Promise(resolve=>{release=resolve;});
      return data.listing;
    }
    return data.manifest;
  });
  const previous=harness.refresh();
  const current=await harness.refresh();
  assert.equal(current.researchLinks.length,5);
  release(data.listing);
  assert.equal(await previous,null);
});
