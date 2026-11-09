// Exercise the app's asynchronous session boundaries without a browser or VISTA.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
const sessionSource=source.slice(source.indexOf('async function loadSession('),source.indexOf('\nasync function newConversation('));
const first='00000000-0000-4000-8000-000000000090';
const second='00000000-0000-4000-8000-000000000091';
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};

function fixture(){
 const initial=deferred(),artifacts=deferred(),artifactEntered=deferred();
 const effects={watchers:[],busy:[],visible:'Current transcript',artifactReads:0};
 const state={sessionId:first,config:{project:'Water4Energy-TVA-agent-loop',backend_url:'http://127.0.0.1:8790'}};
 const context=vm.createContext({
  state,
  liveContext:()=>({project:state.config.project,backend:state.config.backend_url,session:state.sessionId}),
  isLiveContext:scope=>scope.project===state.config.project && scope.backend===state.config.backend_url && scope.session===state.sessionId,
  api:()=>initial.promise,projectUrl:suffix=>'/projects/'+state.config.project+suffix,
  rememberSession:()=>{},messagesFromHistory:()=>[{role:'agent',text:'First session transcript'}],
  $:()=>({replaceChildren:()=>{effects.visible='';}}),
  addMessage:(role,text)=>{effects.visible+=text;},showWelcome:()=>{effects.visible='Welcome';},
  resetActivity:()=>{},addActivity:()=>{},
  TVAHypothesisGuide:{resetConversation:()=>{},handleEvent:()=>{},finishTurn:()=>{}},
  loadLiveArtifacts:()=>{effects.artifactReads++;artifactEntered.resolve();return artifacts.promise;},
  setBusy:(...args)=>effects.busy.push(args),
  watchStream:url=>{effects.watchers.push(url);return Promise.resolve();},
 });
 vm.runInContext(sessionSource,context);
 return {context,state,effects,initial,artifacts,artifactEntered};
}
const saved={run_status:'working',run_events:[]};

test('a previous session GET cannot overwrite the newly selected session or transcript',async()=>{
 const f=fixture();
 const pending=f.context.loadSession(first,true);
 f.state.sessionId=second;f.effects.visible='Second session transcript';
 f.initial.resolve(saved);await pending;
 assert.equal(f.state.sessionId,second);
 assert.equal(f.effects.visible,'Second session transcript');
 assert.equal(f.effects.artifactReads,0);
 assert.deepEqual(f.effects.watchers,[]);
 assert.deepEqual(f.effects.busy,[]);
});

test('an old artifact read cannot start a watcher after the session or backend changes',async()=>{
 for(const change of ['session','backend']){
  const f=fixture();
  const pending=f.context.loadSession(first,true);
  f.initial.resolve(saved);await f.artifactEntered.promise;
  if(change==='session')f.state.sessionId=second;
  else f.state.config.backend_url='http://127.0.0.1:8799';
  f.effects.visible='New scope transcript';
  f.artifacts.resolve();await pending;
  assert.equal(f.effects.visible,'New scope transcript',change);
  assert.equal(f.state.sessionId,change==='session'?second:first,change);
  assert.deepEqual(f.effects.watchers,[],change);
  assert.deepEqual(f.effects.busy,[],change);
 }
});
