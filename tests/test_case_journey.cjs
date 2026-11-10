const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const guide=require('../public/hypothesis-guide.js');
const definition=require('../public/data/demo-case.json');
const prompts=require('../public/data/prompts.json').prompts;
const source=fs.readFileSync(path.join(__dirname,'../public/case-journey.js'),'utf8');
function fixture(){
  const nodes=[],nav=['introduction','network','workspace'].map(view=>control({journeyNav:view}));
  function control(dataset={},attributes={}){return {dataset,attributes,disabled:false,setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},hasAttribute(k){return Object.hasOwn(this.attributes,k);},classList:{toggle(){}},closest(){return this;}};}
  const workflow={set innerHTML(value){this.html=value;nodes.splice(0,nodes.length,...Array.from(value.matchAll(/data-intro-step="([^"]+)"/g),m=>control({introStep:m[1]})));}};
  const detail={innerHTML:''},questions={innerHTML:''},listeners={};
  const document={querySelector:s=>({'#intro-workflow':workflow,'#intro-step-detail':detail,'#case-question-controls':questions}[s]),querySelectorAll:s=>s==='[data-intro-step]'?nodes:s==='[data-journey-nav]'?nav:[],addEventListener:(name,fn)=>{listeners[name]=fn;}};
  const context=vm.createContext({module:{exports:{}},document,fetch:()=>assert.fail('intro and hints must not access a backend')});
  vm.runInContext(source,context);const api=context.module.exports;
  const prepared=[],visited=[];
  api.init({guide,caseDefinition:definition,prompts,preparePrompt:text=>prepared.push(text),navigate:view=>visited.push(view)});
  return {api,prepared,visited,nodes,nav,detail,questions,workflow,control,click:target=>listeners.click({target})};
}
test('the six case questions retain the catalog case and execution guard',()=>{
  const {api}=fixture();
  for(const q of api.questions){const text=api.questionRequest(q.id,{guide,caseDefinition:definition,prompts});assert.ok(text.startsWith(q.question+'\n\n'));assert.match(text,/16–22 April 2019, issued 15 April 2019/);assert.match(text,/Do not submit jobs/);}
  assert.equal(api.questionRequest('dam',{guide,caseDefinition:definition,prompts}),null);
  assert.equal(api.questionRequest('ledger',{guide,caseDefinition:{...definition,project:'Other'},prompts}),null);
  assert.equal(api.questionRequest('ledger',{guide,caseDefinition:{...definition,case:{...definition.case,end:'2019-04-23'}},prompts}),null);
  assert.equal(api.questionRequest('ledger',{guide,caseDefinition:definition,prompts:[{id:'ledger',livePrompt:'Execute a different experiment.'}]}),null);
});
test('intro exploration is independent from live following and only an explicit Try prepares work',()=>{
  const f=fixture();
  assert.equal(f.nodes.length,6);
  assert.match(f.workflow.html,/intro-workflow-arrow/);
  f.click(f.nodes.find(n=>n.dataset.introStep==='critic'));
  assert.match(f.detail.innerHTML,/closed or blocked experiment/);
  assert.equal(f.prepared.length,0);
  assert.equal(f.visited.length,0);
  f.click(f.control({}, {'data-intro-prepare':''}));
  assert.equal(f.prepared.length,1);
  assert.match(f.prepared[0],/Focus on the Critic/);
  assert.match(f.prepared[0],/Do not submit jobs/);
  assert.equal(f.api.selectStep('unknown'),false);
});
test('navigation changes only the view, while a case question prepares its explicit fixed request',()=>{
  const f=fixture();
  f.click(f.nav[1]);assert.deepEqual(f.visited,['network']);assert.equal(f.prepared.length,0);
  f.click(f.control({journeyNav:'settings'}));assert.deepEqual(f.visited,['network']);
  f.click(f.control({caseQuestion:'downscale'}));assert.equal(f.prepared.length,1);assert.match(f.prepared[0],/downscale.scorecard/);
  f.api.setView('workspace');assert.equal(f.nav[2].attributes['aria-current'],'page');assert.equal(f.nav[0].attributes['aria-current'],undefined);
  assert.match(f.questions.innerHTML,/data-case-question="runoff"/);
  assert.equal((f.api.welcomeHTML().match(/data-case-question=/g)||[]).length,3);
});
