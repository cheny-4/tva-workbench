const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/headwater-workflow.js'),'utf8');
function fixture(){
  const controls=[],detail={innerHTML:''},video={outerHTML:''},connections=[],listeners={};
  const mount={html:'',set innerHTML(value){this.html=value;controls.splice(0,controls.length,...Array.from(value.matchAll(/data-development-stage="([^"]+)"/g),m=>control({developmentStage:m[1]})));},querySelectorAll:s=>s==='[data-development-stage]'?controls:s==='[data-development-connection]'?connections:[],querySelector:s=>s==='#development-stage-detail'?detail:s==='[data-headwater-video]'?video:null};
  function control(dataset={}){return {dataset,disabled:false,setAttribute(){},closest(){return this;}};}
  const document={querySelector:s=>s==='#headwater-workflow'?mount:null,addEventListener:(name,callback)=>{listeners[name]=callback;}};
  const context=vm.createContext({document,module:{exports:{}},fetch:()=>assert.fail('HEADWATER stage selection must not contact a service')});
  vm.runInContext(source,context);
  const api=context.module.exports,prepared=[],visited=[];
  api.init({prepareQuestion:text=>prepared.push(text),navigate:view=>visited.push(view)});
  return {api,prepared,visited,mount,detail,video,control,click:target=>listeners.click({target})};
}
test('stage selection only opens the supplied card; explicit review and navigation retain separate callbacks',()=>{
  const f=fixture();
  for(const stage of f.api.STAGES){f.click(f.control({developmentStage:stage.id}));assert.match(f.detail.innerHTML,new RegExp('<h2>'+stage.title+'</h2>'));}
  assert.deepEqual(f.prepared,[]);assert.deepEqual(f.visited,[]);
  f.click(f.control({headwaterQuestion:'brief'}));
  assert.equal(f.prepared.length,1);assert.ok(f.prepared[0].startsWith('What is the one change in the current brief?'));
  assert.match(f.prepared[0],/Do not submit jobs/);assert.match(f.prepared[0],/or invent scores/);assert.deepEqual(f.visited,[]);
  f.click(f.control({headwaterNav:'introduction'}));assert.deepEqual(f.visited,['introduction']);
  f.click(f.control({headwaterNav:'settings'}));assert.deepEqual(f.visited,['introduction']);
});
test('missing or unapproved media remain hidden or empty; approved video requires captions and never autoplays',()=>{
  const f=fixture();f.api.selectStage('score');
  let html=f.api.renderHTML();assert.match(html,/data-headwater-video hidden/);assert.doesNotMatch(html,/<video/);assert.match(html,/April map supplied for the demo/);assert.doesNotMatch(html,/<img/);
  f.api.setAssets({video:'/assets/water4energy-workbench-90s.mp4'});assert.doesNotMatch(f.api.renderHTML(),/<video/);
  f.api.setAssets({video:'https://example.org/video.mp4',captions:'/assets/water4energy-workbench-90s.vtt',scoreMap:'/api/vista/projects/Other/outputs/map.png'});html=f.api.renderHTML();assert.doesNotMatch(html,/<video|<img/);
  f.api.setAssets({video:'/assets/water4energy-workbench-90s.mp4',captions:'/assets/water4energy-workbench-90s.vtt',scoreMap:'/assets/water4energy-april-2019-score.png'});html=f.api.renderHTML();assert.match(html,/<video controls playsinline preload="none"/);assert.match(html,/<track kind="captions"[^>]+ default>/);assert.doesNotMatch(html,/autoplay/);assert.match(html,/<figcaption>16–22 April 2019/);assert.match(html,/water4energy-april-2019-score.png/);
});
test('connection messages cannot insert score claims into the Lux card and the evidence stays a supplied project record',()=>{
  const f=fixture();
  f.api.setResources([{id:'lux',state:'ready',message:'Lux 0.77 made-up score'},{id:'ccsi',state:'ready',planned:true}]);
  const html=f.api.renderHTML(),lux=html.match(/<article[^>]+id="development-lux-card"[\s\S]*?<\/article>/)[0];
  assert.match(lux,/Connection: Ready in VISTA/);assert.doesNotMatch(lux,/0\.77|made-up/);assert.match(html,/H100 \/ CCSI[\s\S]*?Connection: Planned connection/);
  const evidence={innerHTML:''};assert.equal(f.api.renderContextEvidence(evidence),true);assert.match(evidence.innerHTML,/Project record · 12 November 2026/);assert.match(evidence.innerHTML,/the 1979–2017 week already in the example files/);assert.match(evidence.innerHTML,/0\.77°C/);
});

test('the first view explains one recorded example and its result before technical supporting records',()=>{
  const f=fixture(),html=f.api.renderHTML(),lead=html.split('<details class="development-disclosure')[0];
  assert.match(lead,/one recorded example/);
  assert.match(lead,/soil conditions and nearby locations/);
  assert.match(lead,/Development records: October–November 2026 · Weather test weeks: 2019/);
  assert.match(lead,/Across four saved 2019 test weeks/);
  assert.match(lead,/Lower error is better/);
  assert.match(lead,/error, not the actual temperature/);
  assert.match(lead,/Recorded result · H100 \/ CCSI/);
  assert.match(lead,/0\.77°C[\s\S]*0\.86°C/);
  assert.doesNotMatch(lead,/det_v2_|lux_rocm|human_flag|root-mean-square/);
  assert.match(html,/<details class="development-disclosure development-history"><summary>/);
  assert.match(html,/<details class="development-disclosure"><summary><span>Machines and supporting records/);
  assert.match(html,/<details class="development-disclosure"><summary><span>Planned work and human review/);
  assert.doesNotMatch(html,/<details class="development-disclosure[^>]*\bopen\b/);
});

test('the dated history uses the documented source dates and does not manufacture execution times',()=>{
  const f=fixture(),story=JSON.parse(fs.readFileSync(path.join(__dirname,'../backend/headwater-story.json'),'utf8'));
  assert.deepEqual(Array.from(f.api.HISTORY,row=>row.date),story.history.map(row=>row.date));
  assert.deepEqual(Array.from(f.api.HISTORY,row=>row.source),story.history.map(row=>row.sources[0].url));
  const html=f.api.renderHTML();
  assert.match(html,/<th scope="col">Record date<\/th>/);
  assert.match(html,/document dates, not reported training start or completion times/);
  assert.match(html,/The weather test weeks are in 2019/);
  assert.match(html,/Identify one selected change before calling it the current brief/);
  f.api.selectStage('design');assert.match(f.detail.innerHTML,/does not isolate the effect of adding soil information alone/);
  assert.match(f.detail.innerHTML,/selected current brief and its approval are not established/);
});

test('each primary question explicitly selects the HEADWATER reader profile and readable evidence citations',()=>{
  const f=fixture(),expected={ledger:['lab.ledger','headwater-ledger'],brief:['lab.design','headwater-brief'],data:['lab.download','headwater-data'],board:['lab.board','headwater-board'],score:['lab.ledger','headwater-score']};
  assert.equal(f.api.QUESTIONS.length,5);
  for(const q of f.api.QUESTIONS){
    const request=f.api.questionRequest(q.id),[reader,profile]=expected[q.id];
    assert.ok(request.startsWith(q.question+'\n\n'));
    assert.ok(request.includes('Use only '+reader+' with --context headwater and --question '+profile));
    assert.match(request,/Quote the returned verified_answer exactly/);
    assert.match(request,/Call display_file for every returned display_paths entry/);
    assert.match(request,/source_citations separately using their readable titles and links/);
    assert.match(request,/Do not submit jobs/);
    assert.doesNotMatch(request,/--context tva|Case: 16–22 April 2019/);
  }
  assert.match(f.api.questionRequest('history'),/--question headwater-history/);
  assert.equal(f.api.questionRequest('unknown'),null);
});

test('next-step navigation explores the recorded cycle without preparing or executing work',()=>{
  const f=fixture();
  f.click(f.control({headwaterStageGo:'data'}));
  assert.match(f.detail.innerHTML,/<h2>Data<\/h2>/);
  assert.match(f.detail.innerHTML,/Viewing step 2 of 5 · Recorded work/);
  f.click(f.control({headwaterStageGo:'score'}));
  assert.match(f.detail.innerHTML,/<h2>Score<\/h2>/);
  assert.match(f.detail.innerHTML,/<details class="development-score-details"><summary>April case evidence<\/summary>/);
  assert.deepEqual(f.prepared,[]);assert.deepEqual(f.visited,[]);
  assert.equal(f.api.selectStage('running'),false);
});

test('known questions select matching saved-evidence explanations while unknown text retains the overview',()=>{
  const f=fixture();
  for(const q of f.api.QUESTIONS)assert.equal(f.api.evidenceTopicForRequest(f.api.questionRequest(q.id)),q.id);
  assert.equal(f.api.evidenceTopicForRequest(f.api.questionRequest('history')),'history');
  assert.equal(f.api.evidenceTopicForRequest('Could you discuss a new hypothesis?'),'overview');
  assert.equal(f.api.evidenceTopicForRequest('Background\n'+f.api.QUESTIONS[0].question),'overview');
  assert.equal(f.api.evidenceTopicForRequest(null),'overview');
  const box={innerHTML:''};
  f.api.renderContextEvidence(box,{topic:'brief'});assert.match(box.innerHTML,/Saved review · 6 November 2026/);assert.match(box.innerHTML,/do not establish which proposal/);assert.match(box.innerHTML,/20261106_second_model/);assert.doesNotMatch(box.innerHTML,/20261018_iter1_april/);
  f.api.renderContextEvidence(box,{topic:'data'});assert.match(box.innerHTML,/Saved inventory · 21 October 2026/);assert.match(box.innerHTML,/153 weekly examples/);
  f.api.renderContextEvidence(box,{topic:'board'});assert.match(box.innerHTML,/historical true flag does not mean a task is ready/);
  f.api.renderContextEvidence(box,{topic:'history'});assert.match(box.innerHTML,/headwater-record-list/);assert.equal((box.innerHTML.match(/<time /g)||[]).length,4);
  f.api.renderContextEvidence(box,{topic:'<img src=x onerror=alert(1)>'});assert.match(box.innerHTML,/data-evidence-topic="overview"/);assert.doesNotMatch(box.innerHTML,/onerror|<img/);
});

test('project-method questions retain their roles but use the matching HEADWATER saved record',()=>{
  const f=fixture(),profiles={ledger:'headwater-ledger',proposer:'headwater-brief',critic:'headwater-brief',referee:'headwater-brief',human:'headwater-board',evidence:'headwater-score'},topics={ledger:'ledger',proposer:'brief',critic:'brief',referee:'brief',human:'board',evidence:'score'};
  for(const role of Object.keys(profiles)){
    const request=f.api.methodRequest(role);
    assert.match(request,/--context headwater/);
    assert.ok(request.includes('--question '+profiles[role]),role);
    assert.match(request,/not a newly executed role/);
    assert.match(request,/Do not submit jobs/);
    assert.match(request,/no chosen proposal is established/);
    assert.equal(f.api.evidenceTopicForRequest(request),topics[role]);
  }
  assert.equal(f.api.methodRequest('unknown'),null);
  assert.deepEqual(f.prepared,[]);
});
