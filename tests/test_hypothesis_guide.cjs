// Optional developer checks; Node is not required to run the application.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/hypothesis-guide.js'),'utf8');
const caseDefinition=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/demo-case.json'),'utf8'));
const prompts=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/prompts.json'),'utf8')).prompts;

function button(dataset={}) {
  return {
    dataset,attributes:{},classes:new Set(),listeners:{},
    setAttribute(name,value){this.attributes[name]=value;},
    addEventListener(name,callback){this.listeners[name]=callback;},
    click(){if(!this.attributes.disabled)this.listeners.click?.();},
    get classList(){return {toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};},
  };
}
function fixture() {
  const root={nodes:[],html:'',prepared:null,figures:null,announcement:{textContent:''}};
  const detail={html:'',set innerHTML(value){
    this.html=value;root.prepared=button();
    if(/data-guide-prepare disabled/.test(value))root.prepared.attributes.disabled=true;
    root.figures=value.includes('data-guide-figures')?button():null;
  }};
  Object.defineProperty(root,'innerHTML',{set(value){
    this.html=value;
    this.nodes=Array.from(value.matchAll(/data-guide-step="([^"]+)"/g),match=>button({guideStep:match[1]}));
  }});
  root.querySelectorAll=selector=>selector==='[data-guide-step]'?root.nodes:[];
  root.querySelector=selector=>({
    '[data-guide-detail]':detail,'[data-guide-prepare]':root.prepared,
    '[data-guide-figures]':root.figures,'[data-guide-announcement]':root.announcement,
  }[selector]);
  const context=vm.createContext({
    module:{exports:{}},document:{querySelector:selector=>selector==='#hypothesis-guide'?root:null},
    fetch:()=>assert.fail('the workflow guide must not access a backend'),
  });
  vm.runInContext(source,context);
  return {guide:context.module.exports,root,detail};
}

test('the six explanatory stages map ledger, role review, human gate and saved evidence in order',()=>{
  const {guide}=fixture();
  assert.deepEqual(Array.from(guide.steps,step=>[step.id,step.role,step.promptId]),[
    ['ledger','Ledger','ledger'],['proposer','Proposer','design'],['critic','Critic','design'],
    ['referee','Referee','design'],['human','Human gate','commands'],['evidence','Evidence','realization'],
  ]);
  assert.ok(guide.steps.every(step=>step.question.endsWith('?') && step.expected && step.description));
  assert.ok(Object.isFrozen(guide.steps));
});

test('prepared questions begin with the visible question and retain the fixed-case catalog guard',()=>{
  const {guide}=fixture();
  for(const step of guide.steps) {
    const request=guide.requestFor(step.id,{caseDefinition,prompts});
    assert.ok(request.startsWith(step.question+'\n\n'));
    assert.ok(request.includes(prompts.find(prompt=>prompt.id===step.promptId).livePrompt));
    assert.match(request,/16–22 April 2019, issued 15 April 2019/);
    assert.match(request,/Do not submit jobs, execute training commands/);
    assert.match(request,/allowlisted source files/);
  }
  const roleRequests=['proposer','critic','referee'].map(id=>guide.requestFor(id,{caseDefinition,prompts}));
  assert.equal(new Set(roleRequests).size,3);
  assert.match(roleRequests[0],/Focus on the Proposer.*saved proposal/s);
  assert.match(roleRequests[1],/Focus on the Critic.*blocks_reproposal/s);
  assert.match(roleRequests[2],/Focus on the Referee.*Do not infer approval/s);
  const human=guide.requestFor('human',{caseDefinition,prompts});
  assert.match(human,/do not execute them, submit jobs, set an approval flag or treat this question as authorization/);
  const evidence=guide.requestFor('evidence',{caseDefinition,prompts});
  assert.match(evidence,/Runoff is observed ERA5 sro; its HEADWATER forecast is unavailable/);
  assert.match(evidence,/frozen Trial 0 1° to 0.25° comparison/);
});

test('case mismatch cannot prepare work, and an unrelated catalog falls back to fixed source guards',()=>{
  const {guide}=fixture();
  const wrongWeek={...caseDefinition,case:{...caseDefinition.case,start:'2019-04-17'}};
  assert.equal(guide.requestFor('ledger',{caseDefinition:wrongWeek,prompts}),null);
  assert.equal(guide.requestFor('ledger',{caseDefinition:{...caseDefinition,project:'Another-project'},prompts}),null);
  assert.equal(guide.requestFor('unknown',{caseDefinition,prompts}),null);
  const request=guide.requestFor('ledger',{caseDefinition,prompts:[{id:'ledger',livePrompt:'Use May 2020 and execute training.'}]});
  assert.doesNotMatch(request,/May 2020/);
  assert.match(request,/Water4Energy-TVA-agent-loop/);
  assert.match(request,/frozen det_v2_soil_k9/);
  assert.match(request,/Read and cite saved source files/);
});

test('selecting diagram buttons explains each step without preparing or executing anything',()=>{
  const {guide,root,detail}=fixture();
  let prepared=0,figures=0;
  guide.init({caseDefinition,prompts,preparePrompt:()=>prepared++,usePrompt:()=>assert.fail('selection must not dispatch a catalog prompt'),showFigures:()=>figures++});
  assert.equal(root.nodes.length,6);
  assert.equal(root.nodes[0].attributes['aria-pressed'],'true');
  assert.match(root.html,/selection does not run agents/);
  assert.match(root.html,/Findings return to the ledger/);
  assert.doesNotMatch(root.html,/role="progressbar"|completed|data-step-done/);
  for(const [index,node] of root.nodes.entries()) {
    node.click();
    const step=guide.steps[index];
    assert.equal(root.nodes.filter(item=>item.attributes['aria-pressed']==='true').length,1);
    assert.equal(node.attributes['aria-pressed'],'true');
    assert.ok(detail.html.includes(step.question));
    assert.ok(detail.html.includes(step.expected));
    assert.ok(root.announcement.textContent.startsWith(step.title+' selected.'));
  }
  assert.equal(prepared,0);
  assert.equal(figures,0);
});

test('only the explicit question and figures buttons invoke their respective callbacks',()=>{
  const {guide,root}=fixture();
  const prepared=[];let figures=0;
  guide.init({caseDefinition,prompts,preparePrompt:(text,title)=>prepared.push({text,title}),showFigures:()=>figures++});
  root.nodes.find(node=>node.dataset.guideStep==='proposer').click();
  assert.equal(prepared.length,0);
  root.prepared.click();
  assert.equal(prepared.length,1);
  assert.ok(prepared[0].text.startsWith(guide.steps[1].question));
  assert.equal(prepared[0].title,guide.steps[1].title);
  root.nodes.find(node=>node.dataset.guideStep==='evidence').click();
  assert.equal(figures,0);
  root.figures.click();
  assert.equal(figures,1);
  assert.equal(prepared.length,1);
});

test('the guide remains explorable when case preparation is unavailable',()=>{
  const {guide,root,detail}=fixture();
  let prepared=0;
  guide.init({caseDefinition:{...caseDefinition,case:{...caseDefinition.case,end:'2019-04-23'}},prompts,preparePrompt:()=>prepared++});
  root.nodes[4].click();
  assert.ok(detail.html.includes('Which existing commands would a person need to review?'));
  assert.equal(root.prepared.attributes.disabled,true);
  root.prepared.click();
  assert.equal(prepared,0);
  guide.init({caseDefinition,prompts});
  assert.equal(root.prepared.attributes.disabled,true);
  assert.match(detail.html,/composer is unavailable/);
});
