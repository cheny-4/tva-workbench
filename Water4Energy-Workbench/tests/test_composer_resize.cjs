const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const resize=require('../public/composer-resize.js');

function classes(){
  const values=new Set();
  return {add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
}
function element(height=0){
  const properties=new Map();
  const listeners=new Map();
  return {
    height,hidden:false,style:{height:'',setProperty:(name,value)=>properties.set(name,value),getPropertyValue:name=>properties.get(name)||'',removeProperty:name=>properties.delete(name)},
    classList:classes(),attributes:{},children:[],captured:new Set(),
    getBoundingClientRect(){return {height:this.hidden?0:this.height};},
    addEventListener(name,callback){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(callback);},
    removeEventListener(name,callback){listeners.get(name)?.delete(callback);},
    dispatch(name,values={}){
      const event={pointerId:1,button:0,clientY:300,isPrimary:true,prevented:false,preventDefault(){this.prevented=true;},...values};
      for(const listener of listeners.get(name)||[])listener(event);
      return event;
    },
    listenerCount:name=>listeners.get(name)?.size||0,
    setAttribute(name,value){this.attributes[name]=value;},
    setPointerCapture(id){this.captured.add(id);},
    releasePointerCapture(id){this.captured.delete(id);},
    hasPointerCapture(id){return this.captured.has(id);},
    focus(){this.focused=true;},
  };
}
function fixture({preference=null,storageError=false}={}){
  const panel=element(600),header=element(73),status=element(31),intro=element(39),hints=element(55),workflow=element(),activity=element(),handle=element(20),form=element(),textarea=element(65),footer=element(42),transcript=element();
  handle.hidden=true;
  panel.children=[header,status,intro,hints,workflow,transcript,activity,handle,form,element()];
  Object.defineProperty(panel,'clientHeight',{get:()=>panel.height});
  textarea.getBoundingClientRect=()=>({height:Number.parseFloat(textarea.style.height)||65});
  form.getBoundingClientRect=()=>({height:textarea.getBoundingClientRect().height+footer.height});
  form.querySelector=selector=>selector==='.composer-bottom'?footer:null;
  hints.getBoundingClientRect=()=>({height:Math.min(hints.height,panel.height*.3,Number.parseFloat(panel.style.getPropertyValue('--composer-hints-max'))||0)});
  transcript.getBoundingClientRect=()=>({height:Math.max(0,panel.height-panel.children.filter(child=>child!==transcript&&child!==form).reduce((sum,child)=>sum+child.getBoundingClientRect().height,0)-form.getBoundingClientRect().height-14)});
  const controls={'.demo-agent-primary':panel,'#chat-form':form,'#prompt':textarea,'#composer-resize-handle':handle,'#chat-scroll':transcript,'#chat-hints':hints};
  const document={body:{classList:classes()},querySelector:selector=>controls[selector]||null};
  const stored=new Map(preference===null?[]:[[resize.STORAGE_KEY,preference]]);
  const writes=[];
  const storage={
    getItem:key=>{if(storageError)throw new Error('storage unavailable');return stored.get(key)??null;},
    setItem:(key,value)=>{if(storageError)throw new Error('storage unavailable');stored.set(key,value);writes.push(value);},
    removeItem:key=>{if(storageError)throw new Error('storage unavailable');stored.delete(key);},
  };
  const frames=new Map();let nextFrame=0;
  const window={...element(),document,localStorage:storage,
    getComputedStyle:target=>({marginTop:'0px',marginBottom:target===form?'14px':'0px',borderTopWidth:'0px',borderBottomWidth:'0px'}),
    requestAnimationFrame(callback){frames.set(++nextFrame,callback);return nextFrame;},
    cancelAnimationFrame(id){frames.delete(id);},
    ResizeObserver:class{constructor(callback){this.callback=callback;this.targets=new Set();window.observer=this;}observe(target){this.targets.add(target);}disconnect(){this.disconnected=true;}},
  };
  return {panel,header,status,intro,hints,workflow,activity,handle,form,textarea,footer,transcript,document,window,storage,stored,writes,
    controller:()=>resize.createController({window,document}),
    flush(){const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());},
  };
}

test('available input space accounts for controls, composer footer and a 100px transcript',()=>{
  assert.deepEqual(resize.calculateBounds({panelHeight:600,fixedHeight:220,composerChrome:56}),{min:55,max:224});
  assert.deepEqual(resize.calculateBounds({panelHeight:600,fixedHeight:300,composerChrome:56}),{min:55,max:144});
  assert.equal(resize.clampHeight(999,55,144),144);
  assert.equal(resize.clampHeight(0,55,144),55);
  assert.equal(resize.clampHeight(NaN,55,144),55);
});

test('upward drag expands, downward drag shrinks, and keyboard movement stays within bounds',()=>{
  assert.equal(resize.dragHeight(100,300,240),160);
  assert.equal(resize.dragHeight(100,300,340),60);
  const bounds={min:55,max:180};
  assert.equal(resize.keyboardHeight('ArrowUp',170,bounds),180);
  assert.equal(resize.keyboardHeight('ArrowDown',60,bounds),55);
  assert.equal(resize.keyboardHeight('Home',130,bounds),55);
  assert.equal(resize.keyboardHeight('End',130,bounds),180);
  assert.equal(resize.keyboardHeight('ArrowUp',70,bounds,true),118);
  assert.equal(resize.keyboardHeight('Tab',70,bounds),null);
});

test('only bounded numeric preferences are accepted; malformed or blocked storage is ignored',()=>{
  assert.equal(resize.parsePreference('120'),120);
  assert.equal(resize.parsePreference(' 125.5 '),126);
  for(const value of [null,'','-1','54','2001','Infinity','NaN','1e3','120px','{}','{"height":200}','<script>'])assert.equal(resize.parsePreference(value),null);
  assert.equal(resize.readPreference({getItem(){throw new Error('denied');}}),null);
  const view=fixture({storageError:true}),controller=view.controller();
  view.handle.dispatch('keydown',{key:'End'});
  assert.ok(controller.getState().height>65);
});

test('initial size stays at the existing default and the separator reports its live range',()=>{
  const view=fixture(),controller=view.controller();
  assert.equal(controller.getState().height,65);
  assert.equal(view.handle.hidden,false);
  assert.equal(view.handle.attributes['aria-valuemin'],'55');
  assert.equal(view.handle.attributes['aria-valuenow'],'65');
  assert.equal(view.handle.attributes['aria-valuemax'],String(controller.getState().bounds.max));
  assert.equal(view.writes.length,0);
  assert.ok(view.window.observer.targets.has(view.panel));
  assert.ok(view.window.observer.targets.has(view.header));
  assert.ok(view.window.observer.targets.has(view.hints));
  assert.ok(view.window.observer.targets.has(view.workflow));
  assert.ok(view.window.observer.targets.has(view.activity));
  assert.ok(view.window.observer.targets.has(view.footer));
});

test('pointer capture permits up/down adjustment and persists only the finished numeric height',()=>{
  const view=fixture(),controller=view.controller();
  const down=view.handle.dispatch('pointerdown',{clientY:300,pointerType:'touch'});
  assert.equal(down.prevented,true);
  assert.equal(view.handle.hasPointerCapture(1),true);
  view.handle.dispatch('pointermove',{clientY:220});
  assert.equal(controller.getState().height,145);
  assert.equal(view.writes.length,0);
  view.handle.dispatch('pointermove',{clientY:280});
  assert.equal(controller.getState().height,85);
  view.handle.dispatch('pointerup');
  assert.equal(controller.getState().dragging,false);
  assert.equal(view.handle.hasPointerCapture(1),false);
  assert.deepEqual(view.writes,['85']);
  assert.equal(view.document.body.classList.contains('composer-resizing'),false);
});

test('a canceled or lost pointer restores the earlier preference without persisting the partial drag',()=>{
  const view=fixture({preference:'100'}),controller=view.controller();
  for(const reason of ['pointercancel','lostpointercapture']){
    view.handle.dispatch('pointerdown',{clientY:300});
    view.handle.dispatch('pointermove',{clientY:200});
    assert.equal(controller.getState().height,200);
    view.handle.dispatch(reason);
    assert.equal(controller.getState().height,100);
    assert.equal(controller.getState().dragging,false);
  }
  assert.deepEqual(view.writes,[]);
  view.handle.dispatch('pointerdown',{button:2});
  assert.equal(controller.getState().dragging,false);
});

test('keyboard limits preserve transcript space and Enter or double-click restores the default',()=>{
  const view=fixture(),controller=view.controller();
  assert.equal(view.handle.dispatch('keydown',{key:'ArrowUp'}).prevented,true);
  assert.equal(controller.getState().height,89);
  view.handle.dispatch('keydown',{key:'ArrowDown'});
  assert.equal(controller.getState().height,65);
  view.handle.dispatch('keydown',{key:'End'});
  assert.equal(controller.getState().height,controller.getState().bounds.max);
  assert.ok(view.transcript.getBoundingClientRect().height>=100);
  view.handle.dispatch('keydown',{key:'Home'});
  assert.equal(controller.getState().height,55);
  view.handle.dispatch('keydown',{key:'Enter'});
  assert.equal(controller.getState().height,65);
  assert.equal(view.stored.has(resize.STORAGE_KEY),false);
  view.handle.dispatch('keydown',{key:'End'});
  view.handle.dispatch('dblclick');
  assert.equal(controller.getState().height,65);
  assert.equal(view.stored.has(resize.STORAGE_KEY),false);
  assert.equal(view.handle.dispatch('keydown',{key:'Tab'}).prevented,false);
});

test('viewport, expanded hints and busy controls reclamp while keeping the preferred height for later',()=>{
  const view=fixture({preference:'220'}),controller=view.controller();
  assert.equal(controller.getState().height,220);
  view.hints.height=400;view.workflow.height=39;view.activity.height=33;view.panel.height=500;
  view.window.observer.callback();view.flush();
  assert.equal(controller.getState().height,55);
  assert.ok(view.transcript.getBoundingClientRect().height>=100);
  assert.ok(view.hints.getBoundingClientRect().height<150);
  assert.equal(view.stored.get(resize.STORAGE_KEY),'220');
  assert.equal(view.writes.length,0);
  view.hints.height=55;view.workflow.height=0;view.activity.height=0;view.panel.height=600;
  view.window.dispatch('resize');view.flush();
  assert.equal(controller.getState().height,220);
  assert.ok(view.transcript.getBoundingClientRect().height>=100);
});

test('a hidden view leaves the preference intact and destroy restores native resizing',()=>{
  const view=fixture({preference:'180'}),controller=view.controller();
  view.panel.height=0;
  controller.refresh();
  assert.equal(controller.getState().height,180);
  controller.destroy();
  assert.equal(view.handle.hidden,true);
  assert.equal(view.textarea.style.height,'');
  assert.equal(view.panel.classList.contains('composer-resize-ready'),false);
  assert.equal(view.handle.listenerCount('keydown'),0);
  assert.equal(view.window.observer.disconnected,true);
});

test('public init is idempotent and exposes the requested refresh hook',()=>{
  const view=fixture();
  const source=fs.readFileSync(path.join(__dirname,'../public/composer-resize.js'),'utf8');
  const context=vm.createContext({window:view.window,module:{exports:{}}});
  vm.runInContext(source,context);
  assert.equal(view.window.TVAComposerResize.init(),true);
  assert.equal(view.window.TVAComposerResize.init(),true);
  assert.equal(view.handle.listenerCount('pointerdown'),1);
  assert.equal(view.window.TVAComposerResize.refresh(),65);
});
