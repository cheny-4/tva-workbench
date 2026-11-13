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
