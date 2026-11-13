/* A local input-size preference. This module never accesses the backend. */
(function(root){
  'use strict';

  const STORAGE_KEY='tva.workbench.composerHeight.v1';
  const MIN_HEIGHT=55;
  const DEFAULT_HEIGHT=65;
  const MAX_PREFERENCE=2000;
  const TRANSCRIPT_RESERVE=100;
  let controller=null;

  function clampHeight(value,min,max){
    const low=Number.isFinite(min)?min:MIN_HEIGHT;
    const high=Math.max(low,Number.isFinite(max)?max:low);
    return Math.round(Math.max(low,Math.min(high,Number.isFinite(value)?value:low)));
  }
  function calculateBounds({panelHeight,fixedHeight,composerChrome,minHeight=MIN_HEIGHT,transcriptReserve=TRANSCRIPT_RESERVE}){
    return {min:minHeight,max:Math.max(minHeight,Math.floor(panelHeight-fixedHeight-composerChrome-transcriptReserve))};
  }
  function dragHeight(startHeight,startY,currentY){return startHeight+startY-currentY;}
  function keyboardHeight(key,current,bounds,largeStep=false){
    const step=largeStep?48:24;
    if(key==='ArrowUp')return clampHeight(current+step,bounds.min,bounds.max);
    if(key==='ArrowDown')return clampHeight(current-step,bounds.min,bounds.max);
    if(key==='Home')return bounds.min;
    if(key==='End')return bounds.max;
    return null;
  }
  function parsePreference(raw){
    if(typeof raw!=='string'||!/^\d+(?:\.\d+)?$/.test(raw.trim()))return null;
    const value=Number(raw.trim());
    return Number.isFinite(value)&&value>=MIN_HEIGHT&&value<=MAX_PREFERENCE?Math.round(value):null;
  }
  function storageFor(win){try{return win.localStorage;}catch{return null;}}
  function readPreference(storage){try{return parsePreference(storage?.getItem(STORAGE_KEY));}catch{return null;}}
  function writePreference(storage,value){
    try{storage?.setItem(STORAGE_KEY,String(clampHeight(value,MIN_HEIGHT,MAX_PREFERENCE)));}catch{}
  }
  function clearPreference(storage){try{storage?.removeItem(STORAGE_KEY);}catch{}}

  function createController(environment={}){
    const win=environment.window||root;
    const doc=environment.document||win.document;
    const panel=doc?.querySelector('.demo-agent-primary');
    const composer=doc?.querySelector('#chat-form');
    const textarea=doc?.querySelector('#prompt');
    const handle=doc?.querySelector('#composer-resize-handle');
    const transcript=doc?.querySelector('#chat-scroll');
    const hints=doc?.querySelector('#chat-hints');
    if(!panel||!composer||!textarea||!handle||!transcript)return null;

    const storage=environment.storage===undefined?storageFor(win):environment.storage;
    const originalHeight=textarea.style.height;
    const defaultHeight=clampHeight(textarea.getBoundingClientRect().height||DEFAULT_HEIGHT,MIN_HEIGHT,MAX_PREFERENCE);
    let preferredHeight=readPreference(storage)??defaultHeight;
    let currentHeight=defaultHeight;
    let bounds={min:MIN_HEIGHT,max:defaultHeight};
    let drag=null;
    let frame=null;
    let destroyed=false;
    const listeners=[];

    const styleOf=element=>win.getComputedStyle(element);
    const px=value=>Number.parseFloat(value)||0;
    function margins(element){const style=styleOf(element);return px(style.marginTop)+px(style.marginBottom);}
    function outerHeight(element){
      const height=element.getBoundingClientRect().height;
      return height>0?height+margins(element):0;
    }
    function measureBounds(){
      const panelRect=panel.getBoundingClientRect();
      const areaRect=textarea.getBoundingClientRect();
      const composerRect=composer.getBoundingClientRect();
      // A hidden secondary view has no usable geometry; keep its preference.
      if(panelRect.height<=0||composerRect.height<=0||areaRect.height<=0)return null;
      const panelStyle=styleOf(panel);
      const panelHeight=panel.clientHeight||panelRect.height-px(panelStyle.borderTopWidth)-px(panelStyle.borderBottomWidth);
      const composerChrome=Math.max(0,composerRect.height-areaRect.height)+margins(composer);
      const fixedWithoutHints=Array.from(panel.children).filter(element=>element!==composer&&element!==transcript&&element!==hints).reduce((total,element)=>total+outerHeight(element),0);
      if(hints){
        const hintBudget=Math.max(0,Math.floor(panelHeight-fixedWithoutHints-composerChrome-MIN_HEIGHT-TRANSCRIPT_RESERVE));
        const value=hintBudget+'px';
        if(panel.style.getPropertyValue('--composer-hints-max')!==value)panel.style.setProperty('--composer-hints-max',value);
      }
      const fixedHeight=fixedWithoutHints+(hints?outerHeight(hints):0);
      return calculateBounds({panelHeight,fixedHeight,composerChrome});
    }
    function applyHeight(value){
      currentHeight=clampHeight(value,bounds.min,bounds.max);
      const valuePx=currentHeight+'px';
      if(textarea.style.height!==valuePx)textarea.style.height=valuePx;
      handle.setAttribute('aria-valuemin',String(bounds.min));
      handle.setAttribute('aria-valuemax',String(bounds.max));
      handle.setAttribute('aria-valuenow',String(currentHeight));
      handle.setAttribute('aria-valuetext',`Message box ${currentHeight} pixels tall`);
      return currentHeight;
    }
    function refresh(){
      if(destroyed)return null;
      const measured=measureBounds();
      if(!measured)return currentHeight;
      bounds=measured;
      return applyHeight(preferredHeight);
    }
    function scheduleRefresh(){
      if(destroyed||frame!==null)return;
      if(typeof win.requestAnimationFrame!=='function'){refresh();return;}
      frame=win.requestAnimationFrame(()=>{frame=null;refresh();});
    }
    function listen(element,name,callback){element.addEventListener(name,callback);listeners.push([element,name,callback]);}
    function userHeight(value,persist=true){
      refresh();
      preferredHeight=clampHeight(value,bounds.min,bounds.max);
      applyHeight(preferredHeight);
      if(persist)writePreference(storage,preferredHeight);
    }
    function reset(){
      preferredHeight=defaultHeight;
      clearPreference(storage);
      refresh();
    }
    function finishDrag(event,cancel=false){
      if(!drag||event.pointerId!==drag.pointerId)return;
      const previous=drag;
      drag=null;
      handle.classList.remove('is-resizing');
      doc.body?.classList.remove('composer-resizing');
      if(cancel){preferredHeight=previous.preference;refresh();}
      else writePreference(storage,preferredHeight);
      try{if(handle.hasPointerCapture?.(event.pointerId))handle.releasePointerCapture(event.pointerId);}catch{}
    }
    function onPointerDown(event){
      if(drag||event.isPrimary===false||!Number.isFinite(event.clientY)||(event.button!==undefined&&event.button!==0))return;
      event.preventDefault();
      refresh();
      drag={pointerId:event.pointerId,startY:event.clientY,startHeight:currentHeight,preference:preferredHeight};
      handle.classList.add('is-resizing');
      doc.body?.classList.add('composer-resizing');
      handle.focus?.({preventScroll:true});
      try{handle.setPointerCapture(event.pointerId);}catch{}
    }
    function onPointerMove(event){
      if(!drag||event.pointerId!==drag.pointerId||!Number.isFinite(event.clientY))return;
      event.preventDefault();
      userHeight(dragHeight(drag.startHeight,drag.startY,event.clientY),false);
    }
    function onKeyDown(event){
      if(event.key==='Enter'){event.preventDefault();reset();return;}
      const measured=measureBounds();
      if(measured)bounds=measured;
      const next=keyboardHeight(event.key,currentHeight,bounds,event.shiftKey);
      if(next===null)return;
      event.preventDefault();
      userHeight(next);
    }

    panel.classList.add('composer-resize-ready');
    handle.hidden=false;
    listen(handle,'pointerdown',onPointerDown);
    listen(handle,'pointermove',onPointerMove);
    listen(handle,'pointerup',event=>finishDrag(event));
    listen(handle,'pointercancel',event=>finishDrag(event,true));
    listen(handle,'lostpointercapture',event=>finishDrag(event,true));
    listen(handle,'keydown',onKeyDown);
    listen(handle,'dblclick',event=>{event.preventDefault();reset();});
    listen(win,'resize',scheduleRefresh);
    const observer=typeof win.ResizeObserver==='function'?new win.ResizeObserver(scheduleRefresh):null;
    // Changes in busy controls, hints, status wrapping and viewport size all
    // change the space that can safely be assigned to the input.
    const observed=new Set([panel,...Array.from(panel.children).filter(element=>element!==transcript),composer.querySelector('.composer-bottom')].filter(Boolean));
    observed.forEach(element=>observer?.observe(element));
    refresh();

    return {
      refresh,
      getState:()=>({height:currentHeight,preferredHeight,defaultHeight,bounds:{...bounds},dragging:!!drag}),
      destroy(){
        if(drag)finishDrag({pointerId:drag.pointerId},true);
        destroyed=true;
        observer?.disconnect();
        if(frame!==null)win.cancelAnimationFrame?.(frame);
        listeners.forEach(([element,name,callback])=>element.removeEventListener(name,callback));
        panel.classList.remove('composer-resize-ready');
        panel.style.removeProperty('--composer-hints-max');
        textarea.style.height=originalHeight;
        handle.hidden=true;
      },
    };
  }

  const api={
    init(){if(!controller)controller=createController();return !!controller;},
    refresh(){return controller?.refresh()??null;},
  };
  if(root?.document)root.TVAComposerResize=api;
  if(typeof module==='object'&&module.exports)module.exports={...api,createController,clampHeight,calculateBounds,dragHeight,keyboardHeight,parsePreference,readPreference,STORAGE_KEY};
})(typeof window!=='undefined'?window:globalThis);
