'use strict';

// No external services or frontend dependencies. Live calls stay behind server.py.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = {
  mode: 'live', view: 'workspace', config: {project: 'Genesis_Water4Energy'},
  status: null, geo: null, siteIndex: 0,
  busy: false, sessionId: null, history: [], events: [], lastSeq: 0,
  stream: null, pending: null, liveFiles: [], liveStudy: null,
  network: null, workflow: null, prompts: [], skills: null, focusSiteId: 'ELF13', selectedStage: null, promptCategory: 'All',
};
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const dateLabel = (value, options = {}) => new Date(`${String(value).slice(0,10)}T12:00:00Z`).toLocaleDateString('en-US', {timeZone:'UTC',month:'short',day:'numeric',...options});
const format = (n, digits=1) => n!==null && n!==undefined && n!=='' && Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US',{maximumFractionDigits:digits,minimumFractionDigits:digits}) : '—';
const projectUrl = (path='') => `/api/vista/projects/${encodeURIComponent(state.config.project)}${path}`;
const fileUrl = (kind,name) => projectUrl(`/${kind}/${String(name).split('/').map(encodeURIComponent).join('/')}`);
const sessionKey = () => `tva.session.${state.config.backend_url || ''}.${state.config.project}`;
const rememberSession = () => { try { if (state.sessionId) localStorage.setItem(sessionKey(),state.sessionId); else localStorage.removeItem(sessionKey()); } catch {} };
const readSessionId = () => { try { return localStorage.getItem(sessionKey()); } catch { return null; } };

async function api(url, options={}) {
  const response = await fetch(url, {...options, headers:{...(options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}), ...options.headers}});
  if (!response.ok) {
    let detail;
    try { const body = await response.json(); detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail || body); }
    catch { detail = response.statusText; }
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}
function toast(message) {
  $('#toast').textContent=message; $('#toast').hidden=false;
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('#toast').hidden=true,6000);
}
function showDetails(title,html) {
  $('#details-title').textContent=title; $('#details-content').innerHTML=html;
  if (!$('#details-dialog').open) $('#details-dialog').showModal();
}
function download(name, text, type='text/plain') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=document.createElement('a'); a.href=url; a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function setBusy(value,label) {
  state.busy=value;
  $('#send-button').hidden=value;
  $('#stop-button').hidden=!value;
  $('#send-button').disabled=value; $('#workflow-button').disabled=value;
  $('#new-chat').disabled=value; $('#history-new').disabled=value;
  $('#resource').disabled=value; $('#focus-site').disabled=value;
  $('#agent-state').textContent=label || (value ? 'Working…' : state.status?.project_found ? 'VISTA agent' : 'Connect VISTA');
  $('#agent-state').classList.toggle('working',value);
}
function setStage(index,complete=false) {
  $$('#workflow-strip [data-step]').forEach((el,i)=>{
    el.classList.toggle('done',i<index || complete);
    el.classList.toggle('active',i===index && !complete);
  });
}
function addActivity(title,detail='',kind='info',raw=null) {
  const item={time:new Date().toLocaleTimeString('en-US',{hour12:false}),title,detail,kind};
  state.events.push(item); if(state.events.length>250) state.events.shift();
  const row=document.createElement('div'); row.className='activity-event';
  row.innerHTML=`<time>${esc(item.time)}</time><div><strong>${esc(title)}</strong>${detail?`<div>${esc(detail)}</div>`:''}${raw?`<details><summary>Event detail</summary><pre>${esc(JSON.stringify(raw,null,2).slice(0,12000))}</pre></details>`:''}</div>`;
  $('#activity-log').append(row);
  while($('#activity-log').children.length>250) $('#activity-log').firstChild.remove();
  $('#activity-count').textContent=state.events.length; $('#activity-last').textContent=title;
  $('#activity-log').scrollTop=$('#activity-log').scrollHeight;
}
function resetActivity() {
  state.events=[]; state.lastSeq=0; $('#activity-log').replaceChildren();
  $('#activity-count').textContent='0'; $('#activity-last').textContent='Events and tool calls appear here'; setStage(-1);
}
function formatText(text) {
  // Escape first: model/file text can never inject active HTML into the page.
  let html=esc(text);
  html=html.replace(/```[^\n]*\n([\s\S]*?)```/g,(_,code)=>`<pre>${code}</pre>`);
  html=html.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`\n]+)`/g,'<code>$1</code>');
  html=html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
  return html;
}
function addMessage(role,text,options={}) {
  $('#chat-messages .welcome')?.remove();
  const el=document.createElement('div'); el.className=`message ${role}${options.error?' error':''}`;
  const label=role==='agent' ? '<div class="message-label"><b>✳ TVA AGENT</b><span>VIA VISTA</span></div>' : '';
  el.innerHTML=`${label}<div class="message-body">${formatText(text)}</div>`;
  $('#chat-messages').append(el); scrollChat(); return el.querySelector('.message-body');
}
function scrollChat() { $('#chat-scroll').scrollTop=$('#chat-scroll').scrollHeight; }
function showWelcome() {
  const featured=['end-to-end','lstm','skills'].map(id=>state.prompts.find(p=>p.id===id)).filter(Boolean);
  $('#chat-messages').innerHTML=`<div class="welcome"><div class="welcome-symbol">✳</div><h3>One project.<br>A connected scientific workflow.</h3><p>Choose a study location and a starter prompt, or ask your own question. The agent uses the skills loaded into your TVA project.</p><div class="prompt-cards">${featured.map((p,i)=>`<button class="prompt-card" data-welcome-prompt="${esc(p.id)}"><span>0${i+1}</span>${esc(p.title)}${icon('arrow')}</button>`).join('')}</div></div>`;
  $$('[data-welcome-prompt]').forEach(el=>el.addEventListener('click',()=>usePrompt(el.dataset.welcomePrompt)));
}
function switchView(view) {
  state.view=view;
  $$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));
  $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  $('#view-breadcrumb').textContent={workspace:'Workspace',network:'TVA network',skills:'Skills',prompts:'Prompt library',history:'Conversations',files:'Results Library',resources:'Compute resources'}[view];
  if(view==='history') renderHistory(); if(view==='files') renderFiles(); if(view==='resources') renderResources();
  if(view==='network')renderNetwork();if(view==='skills')renderSkills();if(view==='prompts')renderPromptLibrary();
  window.scrollTo({top:0,behavior:'instant'});
}

async function refreshConnection() {
  $('#connection-pill').innerHTML='<i></i> Checking VISTA';
  try {
    state.status=await api('/api/status?fresh=1'); state.config={backend_url:state.status.backend_url,project:state.status.project};
    const ok=state.status.connected && state.status.project_found;
    $('#connection-pill').classList.toggle('connected',ok);
    $('#connection-pill').innerHTML=`<i></i>${ok?'VISTA connected':state.status.connected?'Check project name':'VISTA offline'}`;
    $('#connection-pill').title=state.status.detail;
    renderResources();await refreshSkills();await renderFiles();setBusy(state.busy);
    if($('#settings-dialog').open) $('#settings-status').textContent=state.status.detail;
  } catch(error) {$('#connection-pill').classList.remove('connected');$('#connection-pill').innerHTML='<i></i> Connection unavailable';}
}
function resourceState(resource) {
  if(resource.planned) return ['planned','Planned'];
  if(resource.state==='ready') return ['ready','Ready in VISTA'];
  if(['not_connected','not_configured','missing','unconfigured'].includes(resource.state)) return ['error','Not connected'];
  if(['degraded','error','unavailable'].includes(resource.state)) return ['error','Needs attention'];
  if(resource.state==='checking') return ['','Checking'];
  return ['',state.status?.connected?'Status unavailable':'VISTA offline'];
}
function renderResources() {
  const resources=state.status?.resources || ['odo','frontier','lux','ccsi'].map((id,i)=>({id,name:['Odo','Frontier','Lux','CCSI GPU node'][i],state:'unknown',planned:id==='ccsi',message:id==='ccsi'?'Planned resource. Connection and a matching VISTA adapter will be added later.':'Open VISTA to check resource status.'}));
  $('#sidebar-resources').innerHTML=resources.map(r=>{const [cls,label]=resourceState(r);return `<div class="resource-mini ${r.id==='ccsi'?'ccsi':''}" title="${esc(r.message)}"><span class="resource-glyph">${icon('server')}</span><div><strong>${esc(r.name)}</strong><small>${esc(label)}</small></div><i class="status-dot ${cls}"></i></div>`;}).join('');
  $('#resource-cards').innerHTML=resources.map(r=>{const [cls,label]=resourceState(r);return `<article class="resource-card ${r.planned?'planned':''}"><div class="resource-card-header">${icon('server')}<span class="tag"><i class="status-dot ${cls}"></i>${esc(label)}</span></div><h2>${esc(r.name)}</h2><div class="facility">${r.planned?'FUTURE RESOURCE':'OAK RIDGE LEADERSHIP COMPUTING FACILITY'}</div><p>${esc(r.message)}</p><div class="tag">${r.id==='frontier'?'TVA inference skill target':r.planned?'Adapter to be added':'TVA job definition not configured'}</div></article>`;}).join('');
}
function showSettings() {
  $('#backend-url').value=state.config.backend_url || 'http://127.0.0.1:8001';
  $('#project-name').value=state.config.project;
  $('#settings-status').textContent=state.status?.detail || 'Open VISTA, then save and check this connection.';
  $('#settings-dialog').showModal();
}

function renderMap() {
  drawNetworkMap('basin-map');
  if(state.view==='network')drawNetworkMap('network-map',1000,410);
}
function currentStudy() { return state.liveStudy; }
function renderResults() {
  const study=currentStudy();
  $('#results-panel').classList.toggle('has-live-study',!!study);
  $('#results-panel').classList.toggle('has-live-artifacts',!!state.liveFiles.length);
  $('#results-description').textContent=study?'Predictions from a file displayed by the agent in this conversation.':'Figures, data and other outputs appear when the agent displays them.';
  $('#chart-site-tabs').innerHTML='';$('#result-site').innerHTML='';$('#result-site').closest('.chart-site-picker').hidden=!study; $('#result-chart').innerHTML='';$('#result-stats').innerHTML='';
  $('.chart-legend').hidden=!study; $('#chart-axis-label').hidden=!study;
  $('.live-artifacts')?.remove();
  if(!study) {
    $('#result-chart').innerHTML='<div class="live-result-empty">Your results workspace is ready.<br>Ask the agent to generate and display figures or data. Saved outputs are available in the Results Library.</div>';
    $('#provenance-short').textContent='Waiting for agent-generated outputs.';
    renderLiveArtifacts(); return;
  }
  state.siteIndex=Math.min(state.siteIndex,study.sites.length-1);
  $('#result-site').innerHTML=study.sites.map((s,i)=>`<option value="${i}" ${i===state.siteIndex?'selected':''}>${esc(s.name)}</option>`).join('');
  $('#chart-site-tabs').hidden=study.sites.length>4;
  if(study.sites.length<=4){
    $('#chart-site-tabs').innerHTML=study.sites.map((s,i)=>`<button class="${i===state.siteIndex?'active':''}" data-site="${i}" aria-pressed="${i===state.siteIndex}">${esc(s.name)}</button>`).join('');
    $$('#chart-site-tabs button').forEach(el=>el.addEventListener('click',()=>{state.siteIndex=Number(el.dataset.site);state.focusSiteId=study.sites[state.siteIndex].id;renderSiteContext();renderMap();renderResults();}));
  }
  const site=study.sites[state.siteIndex],rows=site.series;
  const hasObs=rows.some(r=>Number.isFinite(r.observed));
  $('.chart-legend span:last-child').hidden=!hasObs;
  $('#chart-axis-label').textContent=`${study.valueLabel || 'Weekly predicted volume'} · ${study.units || 'million m³'} / WEEK`;
  const w=800,h=207,l=40,r=15,t=15,b=31;
  const vals=rows.flatMap(r=>[r.predicted,r.observed]).filter(Number.isFinite);
  const rawMax=Math.max(...vals,1)*1.13,step=niceStep(rawMax/4),maxY=Math.ceil(rawMax/step)*step;
  const dates=rows.map(r=>Date.parse(r.date+'T12:00:00Z'));
  const first=Math.min(...dates),last=Math.max(...dates),span=last-first || 7*86400000;
  const x=i=>rows.length===1?(w+l-r)/2:l+(dates[i]-first)/span*(w-l-r),y=v=>h-b-v/maxY*(h-t-b);
  const line=(key)=>{let active=false;return rows.map((v,i)=>{if(!Number.isFinite(v[key])){active=false;return '';} if(i && dates[i]-dates[i-1]>7.01*86400000)active=false;const cmd=active?'L':'M';active=true;return `${cmd}${x(i).toFixed(1)},${y(v[key]).toFixed(1)}`;}).join(' ');};
  const grid=Array.from({length:Math.round(maxY/step)+1},(_,i)=>{const v=i*step;return `<line x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text x="${l-11}" y="${y(v)+3}" text-anchor="end">${format(v,v<1?2:0)}</text>`;}).join('');
  const labelIndices=rows.length<5?rows.map((_,i)=>i):rows.map((v,i)=>i===0 || v.date.slice(0,7)!==rows[i-1].date.slice(0,7)?i:-1).filter(i=>i>=0);
  const labels=labelIndices.map(i=>`<text x="${x(i)}" y="${h-7}" text-anchor="middle">${esc(dateLabel(rows[i].date,rows.length>5?{day:undefined,year:'2-digit'}:{}))}</text>`).join('');
  const predicted=line('predicted'),observed=line('observed');
  const allValid=rows.every((v,i)=>Number.isFinite(v.predicted) && (!i || dates[i]-dates[i-1]<=7.01*86400000));
  const area=allValid?`<path class="chart-area" d="${predicted}L${x(rows.length-1)},${h-b}L${x(0)},${h-b}Z"/>`:'';
  const points=rows.map((v,i)=>Number.isFinite(v.predicted)?`<circle class="data-point" cx="${x(i)}" cy="${y(v.predicted)}" r="${rows.length>5?2.5:4}"><title>${esc(site.name)} · ${esc(v.date)}\nPrediction: ${format(v.predicted,2)} million m³${Number.isFinite(v.observed)?`\nObserved: ${format(v.observed,2)} million m³`:''}</title></circle>`:'').join('');
  $('#result-chart').innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(site.name)} weekly predicted volume. Agent file model predictions${hasObs?' compared with observed values':''}, in million cubic metres per week.">${grid}${area}<path class="series-observed" d="${observed}"/><path class="series-predicted" d="${predicted}"/>${points}${labels}</svg>`;
  const valid=rows.filter(r=>Number.isFinite(r.predicted));
  $('#result-stats').innerHTML=`<div class="stat"><small>VALID WEEKS IN FILE</small><strong>${valid.length}<span>weeks</span></strong></div><div class="stat"><small>RESULT SOURCE</small><strong style="font-size:15px;letter-spacing:0">VISTA output</strong><p>${esc(site.name)}</p></div><div class="stat"><small>PREDICTED VOLUME</small><strong>${valid.length?format(valid.reduce((a,r)=>a+r.predicted,0),0):'—'}<span>Mm³</span></strong><p>Sum of available weeks</p></div>`;
  if(!valid.length)$('#result-chart').innerHTML=`<div class="live-result-empty"><strong>${esc(site.name)}</strong> has no valid predictions in the displayed file. Missing values remain gaps.</div>`;
  $('#provenance-short').textContent=`Agent file · ${study.provenance.sourceFile} · Volumes converted from m³`;
  renderLiveArtifacts();
}
function niceStep(value) { const p=10**Math.floor(Math.log10(value));return [1,2,2.5,5,10].map(v=>v*p).find(v=>v>=value) || 10*p; }
function showProvenance() {
  const study=currentStudy();
  if(!study) {showDetails('Live result provenance','<p>No live prediction file has been loaded. The agent’s displayed files and original provenance will appear after collection.</p>');return;}
  showDetails('The evidence behind this result',`<p>${esc(study.source || 'File displayed in the selected VISTA conversation.')}</p><h3>Interpretation limits</h3><ul>${(study.caveats || []).map(c=>`<li>${esc(c)}</li>`).join('')}</ul><h3>Provenance</h3><pre>${esc(JSON.stringify(study.provenance,null,2))}</pre><h3>Original artifacts</h3>${(study.downloads || []).map(f=>`<p><a href="${esc(f.url)}" download>${esc(f.label)} ↗</a></p>`).join('')}`);
}

async function ensureSession(title) {
  if(state.sessionId) return state.sessionId;
  const session=await api(projectUrl('/chat-sessions'),{method:'POST',body:JSON.stringify({title:title.slice(0,80)})});
  state.sessionId=session.id;state.lastSeq=0;rememberSession();return session.id;
}
async function sendLive(prompt) {
  if(!state.status?.project_found){addMessage('system','Open VISTA and connect the correct TVA project in Connection settings before sending a live message.',{error:true});showSettings();return;}
  if(state.busy)return;
  addMessage('user',prompt);setBusy(true,'Contacting VISTA');setStage(0);state.lastSeq=0;
  try {
    await ensureSession(prompt);
    await watchStream(projectUrl('/agent/run'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_prompt:prompt,stream:true,chat_session_id:state.sessionId})});
  } catch(error) {
    addMessage('system',`${error.message} If VISTA accepted the turn, it may still be running. Reopen this conversation to check or reconnect.`,{error:true});
    addActivity('Connection interrupted',error.message);setBusy(false,'Connection interrupted');
  }
}
async function watchStream(url,options={}) {
  state.stream=new AbortController();let finished=false,bodyNode=null,parts=new Map(),lastIndex=null;
  const response=await fetch(url,{...options,signal:state.stream.signal});
  if(response.status===204){state.stream=null;setBusy(false,'Turn ended');await loadSession(state.sessionId,false);await renderFiles();return;}
  if(!response.ok){let data;try{data=await response.json();}catch{};throw new Error(typeof data?.detail==='string'?data.detail:`VISTA request failed (${response.status}).`);}
  if(!response.body)throw new Error('This browser does not support streaming responses.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
  const outputText=()=>{
    if(!bodyNode)bodyNode=addMessage('agent','');
    bodyNode.innerHTML=formatText([...parts.values()].join('\n\n'));bodyNode.classList.add('stream-cursor');scrollChat();
  };
  async function eventReceived(block) {
    let type='message',data=[],seq;
    for(const line of block.split('\n')){
      if(line.startsWith('event:'))type=line.slice(6).trim();
      if(line.startsWith('data:'))data.push(line.slice(5).trimStart());
      if(line.startsWith('id:'))seq=Number(line.slice(3).trim());
    }
    if(seq && seq<=state.lastSeq)return;
    if(seq)state.lastSeq=seq;
    if(!data.length)return;
    let event;try{event=JSON.parse(data.join('\n'));}catch{return;}
    type=event.event_kind || type;
    if(type==='run_started'){addActivity('VISTA turn started','Backend-owned execution; conversation saved by VISTA.');setBusy(true,'Agent working');setStage(0);}
    else if(type==='part_start' && event.part?.part_kind==='text') {lastIndex=event.index;parts.set(event.index,event.part.content || '');outputText();}
    else if(type==='part_delta' && event.delta?.part_delta_kind==='text') {const index=event.index ?? lastIndex;parts.set(index,(parts.get(index)||'')+(event.delta.content_delta||''));outputText();}
    else if(type==='part_end' && event.part?.part_kind==='text') {parts.set(event.index,event.part.content||parts.get(event.index)||'');outputText();}
    else if(type==='function_tool_call') {
      const tool=event.part?.tool_name || event.tool_name || 'Scientific tool';
      addActivity(`Tool call · ${tool}`,'Actual VISTA tool event.','tool',event.part);
      setStage(1);
      if(/outputs|display|plot/i.test(tool))setStage(2);
    }
    else if(type==='function_tool_result') {const tool=event.part?.tool_name || 'Scientific tool';addActivity(`Tool returned · ${tool}`,'Inspect tool output for execution status.','tool',event.part);}
    else if(type==='log') addActivity(`${event.area || 'VISTA'} · ${event.level || 'INFO'}`,String(event.message || '').slice(0,2500));
    else if(['mcp_form_elicitation','mcp_url_elicitation','mcp_tool_approval'].includes(type)) {addActivity('Your input is needed',event.message || 'VISTA is waiting.');showElicitation(event);}
    else if(type==='prompt_resolved') {if(state.pending?.elicitation_id===event.elicitation_id){state.pending=null;$('#elicitation-dialog').close();}}
    else if(type==='agent_run_result') {
      const result=event.result || event;
      state.history=result.new_messages || state.history;
    }
    else if(type==='run_finished') {
      finished=true;bodyNode?.classList.remove('stream-cursor');
      const ok=event.state==='done';
      addActivity(ok?'Agent turn completed':`Agent turn ${event.state}`,event.error ? String(event.error) : 'A completed agent turn does not by itself verify an HPC job.');
      setBusy(false,ok?'Turn completed':`Turn ${event.state}`);
      $$('#workflow-strip .active').forEach(el=>el.classList.remove('active'));
      if(event.error)addMessage('system',String(event.error),{error:true});
      state.pending=null;$('#elicitation-dialog').close();
    }
  }
  try {
    while(true) {
      const {value,done}=await reader.read();
      buffer+=done?decoder.decode():decoder.decode(value,{stream:true});
      buffer=buffer.replace(/\r\n/g,'\n');
      let split;
      while((split=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,split);buffer=buffer.slice(split+2);await eventReceived(block);}
      if(done)break;
    }
    if(buffer.trim())await eventReceived(buffer);
    if(!finished)throw new Error('The event stream ended before VISTA reported completion.');
    await loadSession(state.sessionId,false);
    await renderFiles();
  } finally {bodyNode?.classList.remove('stream-cursor');state.stream=null;}
}
function messagesFromHistory(session) {
  const history=Array.isArray(session.message_history)?session.message_history:[];
  state.history=history;
  const transcript=[];
  for(const message of history){
    for(const part of message.parts || []) {
      if(part.part_kind==='user-prompt'){
        const content=typeof part.content==='string'?part.content:(part.content||[]).filter(x=>typeof x==='string').join('\n');
        if(content)transcript.push({role:'user',text:content});
      } else if(part.part_kind==='text' && part.content)transcript.push({role:'agent',text:part.content});
    }
  }
  if(!transcript.length && Array.isArray(session.messages))for(const m of session.messages)if(m.role==='user'||m.role==='assistant')transcript.push({role:m.role==='user'?'user':'agent',text:m.content || m.text || ''});
  return transcript;
}
async function loadSession(id,reconnect=false) {
  try {
    const session=await api(projectUrl(`/chat-session?chat_session_id=${encodeURIComponent(id)}`));
    state.sessionId=id;rememberSession();
    const messages=messagesFromHistory(session);
    if(messages.length){$('#chat-messages').replaceChildren();messages.forEach(m=>addMessage(m.role,m.text));}
    else showWelcome();
    if(reconnect){resetActivity();for(const entry of session.run_events || []){
      const data=entry.data || {};
      if(entry.event==='log')addActivity(data.area || 'VISTA',data.message || '');
      else if(entry.event==='function_tool_call'||entry.event==='function_tool_result')addActivity(`${entry.event==='function_tool_call'?'Tool call':'Tool returned'} · ${data.part?.tool_name || 'Scientific tool'}`,'Saved VISTA activity.','tool',data.part);
      else if(entry.event==='run_finished')addActivity(`Agent turn ${data.state || 'ended'}`,'Saved VISTA turn state; inspect outputs for job evidence.');
    }}
    await loadLiveArtifacts();
    if(reconnect && ['working','needs_you'].includes(session.run_status)) {
      setBusy(true,'Reconnecting');state.lastSeq=0;
      watchStream(projectUrl(`/chat-sessions/${id}/run/events?after=0`)).catch(error=>{addMessage('system',error.message,{error:true});setBusy(false,'Disconnected');});
    }
  } catch(error){state.sessionId=null;rememberSession();addMessage('system',`Could not open that VISTA conversation: ${error.message}`,{error:true});}
}
async function newConversation() {
  if(state.busy)return;
  state.sessionId=null;rememberSession();state.history=[];state.liveFiles=[];state.liveStudy=null;
  resetActivity();showWelcome();renderResults();switchView('workspace');toast('A new conversation will be created when you send your first message.');
}
async function renderHistory() {
  $('#history-list').innerHTML='<div id="live-history"><div class="empty-state">Loading VISTA conversations…</div></div>';
  if(!state.status?.project_found){$('#live-history').innerHTML='<div class="empty-state">Connect VISTA to view this laptop’s TVA conversations.</div>';return;}
  try {
    const sessions=await api(projectUrl('/chat-sessions'));
    $('#live-history').innerHTML=sessions.length?sessions.sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).map(s=>`<button class="history-card" data-session="${esc(s.id)}">${icon('file')}<div><h3>${esc(s.title || 'TVA conversation')}</h3><p>${esc(new Date(s.updated_at).toLocaleString())}</p></div><span class="tag">VISTA</span>${icon('arrow')}</button>`).join(''):'<div class="empty-state">No conversations yet. Send a message to begin.</div>';
    $$('#live-history [data-session]').forEach(el=>el.addEventListener('click',async()=>{if(state.busy){toast('Finish the current turn first.');return;}state.liveFiles=[];state.liveStudy=null;state.history=[];resetActivity();state.sessionId=el.dataset.session;state.lastSeq=0;await loadSession(state.sessionId,true);switchView('workspace');}));
  }catch(error){$('#live-history').innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;}
}
function fileRow(name,detail,url,label='Download') {return `<div class="file-row">${icon('file')}<div><strong>${esc(name)}</strong><small>${esc(detail)}</small></div><a href="${esc(url)}" download>${label}${icon('down')}</a></div>`;}
async function renderFiles() {
  return TVAResultsLibrary.render({projectFound:state.status?.project_found,project:state.config.project,api,projectUrl,fileUrl,showDetails,toast});
}
async function uploadFiles(files) {
  if(!files.length)return;
  if(!state.status?.project_found){toast('Connect your local TVA project before uploading files.');return;}
  const form=new FormData();for(const f of files)form.append('files',f);
  try {
    const result=await api(projectUrl('/uploads'),{method:'POST',body:form});
    toast(`${files.length} file${files.length===1?'':'s'} uploaded to ${state.config.project}.`);
    addActivity('Input files uploaded',Array.isArray(result)?result.join(', '):Array.from(files).map(f=>f.name).join(', '));
    if(state.view==='files')renderFiles();
  }catch(error){toast(`Upload failed: ${error.message}`);}
}
async function loadLiveArtifacts() {
  if(!state.sessionId)return;
  try {
    state.liveFiles=await api(projectUrl(`/chat-sessions/${state.sessionId}/displayed-files`));
    state.liveStudy=null;
    for(const file of state.liveFiles){
      if(file.status && file.status!=='current')continue;
      const name=file.path || file.name;
      if(!name || !/\.csv$/i.test(name))continue;
      const kind=file.kind || 'outputs';
      if(!['uploads','outputs'].includes(kind))continue;
      const response=await fetch(fileUrl(kind,name));
      if(!response.ok)continue;
      const study=parsePredictionCSV(await response.text(),name,kind);
      if(study){state.liveStudy=study;state.siteIndex=Math.max(0,study.sites.findIndex(s=>s.id===state.focusSiteId));break;}
    }
    renderResults();
  }catch{state.liveFiles=[];state.liveStudy=null;renderResults();}
}
function parseCSV(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted && text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===',' && !quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r') && !quoted){if(c==='\r' && text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  const headers=(rows.shift()||[]).map(h=>h.trim().replace(/^\uFEFF/,''));
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i] ?? ''])));
}
function parsePredictionCSV(text,name,kind='outputs') {
  if(!['uploads','outputs'].includes(kind))return null;
  const rows=parseCSV(text);if(!rows.length)return null;
  const idKey=['basin_id','site_id'].find(k=>k in rows[0]);const dateKey=['start','week_start','date'].find(k=>k in rows[0]);
  if(!idKey||!dateKey||!('predicted_volume_m3' in rows[0]))return null;
  const grouped=new Map();
  for(const row of rows){
    const day=row[dateKey].slice(0,10),stamp=Date.parse(day+'T12:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(stamp)||new Date(stamp).toISOString().slice(0,10)!==day)continue;
    if(row.days!=null && row.days!=='' && Number(row.days)!==7)continue;
    const id=row[idKey];if(!grouped.has(id))grouped.set(id,[]);
    const num=v=>v==null||v.trim()===''||!Number.isFinite(Number(v))?null:Number(v)/1e6;
    grouped.get(id).push({date:day,end:row.end || row.week_end || null,predicted:num(row.predicted_volume_m3),observed:num(row.observed_volume_m3)});
  }
  const sites=[...grouped].map(([id,series])=>({id,name:state.network?.sites?.find(s=>s.id===id || s.modelSiteId===id)?.name || id,series:series.sort((a,b)=>a.date.localeCompare(b.date))}));
  if(!sites.length)return null;
  return {sites,units:'million m³',valueLabel:'Weekly predicted volume',source:'Prediction CSV explicitly displayed by the agent in this VISTA conversation.',provenance:{sourceFile:name,sourceFileKind:kind,sourceColumns:['predicted_volume_m3','observed_volume_m3 (when present)'],displayConversion:'m³ divided by 1,000,000'},caveats:['The chart reads the displayed file; it does not independently verify a cluster job or model provenance.','Missing predictions stay missing. Values reflect only the displayed file.'],downloads:[{label:'Original prediction CSV',url:fileUrl(kind,name)}]};
}
function renderLiveArtifacts() {
  if(!state.liveFiles.length)return;
  const container=document.createElement('div');container.className='live-artifacts';
  container.innerHTML=state.liveFiles.map(f=>{
    const path=f.path||f.name;return fileRow(path,`Displayed by this conversation · ${f.kind || 'outputs'}${f.status && f.status!=='current'?' · '+f.status+' since display':''}`,fileUrl(f.kind||'outputs',path));
  }).join('');
  const images=state.liveFiles.filter(f=>(!f.status || f.status==='current') && /\.(png|jpg|jpeg|webp|gif)$/i.test(f.path || f.name)).slice(0,4);
  for(const file of images){
    const path=file.path || file.name,preview=document.createElement('div');preview.className='live-artifact-preview';
    const img=document.createElement('img');img.src=fileUrl(file.kind || 'outputs',path)+'?preview=true';img.alt=`VISTA result: ${path}`;img.loading='lazy';preview.append(img);container.append(preview);
  }
  $('#results-panel').insertBefore(container,$('.result-footer'));
}
function showElicitation(event) {
  // Sensitive form values are sent directly to VISTA and never stored or exported.
  state.pending=event;$('#agent-state').textContent='Waiting for your input';
  $('#elicitation-message').textContent=event.message || 'Review this request from VISTA.';
  $('#elicitation-fields').replaceChildren();
  if(event.event_kind==='mcp_url_elicitation'){
    let url;try{url=new URL(event.url);}catch{addMessage('system','VISTA supplied an invalid authorization URL. Complete this step in VISTA.',{error:true});return;}
    if(!['http:','https:'].includes(url.protocol)){addMessage('system','VISTA supplied an unsupported sign-in URL. Complete this step in VISTA.',{error:true});return;}
    const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open VISTA authorization page ↗';$('#elicitation-fields').append(a);
  }else if(event.event_kind==='mcp_tool_approval'){
    const pre=document.createElement('pre');pre.style.cssText='white-space:pre-wrap;font-size:11px;overflow-wrap:anywhere';pre.textContent=JSON.stringify({tool:event.tool_name,args:event.args},null,2);$('#elicitation-fields').append(pre);
  }else{
    const schema=event.requested_schema || {},required=schema.required || [];
    for(const [name,property] of Object.entries(schema.properties || {})){
      const label=document.createElement('label');label.textContent=property.title || name;label.htmlFor=`elicit-${name}`;
      let input;
      if(Array.isArray(property.enum)){input=document.createElement('select');for(const choice of property.enum){const option=document.createElement('option');option.value=choice;option.textContent=choice;input.append(option);}}
      else{input=document.createElement('input');input.type=property.type==='boolean'?'checkbox':property.type==='number'||property.type==='integer'?'number':/token|secret|password|key/i.test(name)?'password':'text';if(input.type==='number')input.step=property.type==='integer'?'1':'any';}
      input.id=`elicit-${name}`;input.name=name;input.dataset.type=property.type;input.required=required.includes(name);input.autocomplete='off';
      if(property.default!=null){if(input.type==='checkbox')input.checked=property.default;else input.value=property.default;}
      $('#elicitation-fields').append(label,input);
      if(property.description){const hint=document.createElement('small');hint.textContent=property.description;$('#elicitation-fields').append(hint);}
    }
  }
  if(!$('#elicitation-dialog').open)$('#elicitation-dialog').showModal();
}
async function resolveElicitation(action) {
  if(!state.pending)return;
  const content={};
  for(const el of $$('#elicitation-fields input, #elicitation-fields select'))content[el.name]=el.type==='checkbox'?el.checked:['number','integer'].includes(el.dataset.type)?Number(el.value):el.value;
  try {await api(projectUrl('/elicitation'),{method:'POST',body:JSON.stringify({id:state.pending.elicitation_id,action,content:action==='accept'?content:null})});state.pending=null;$('#elicitation-fields').replaceChildren();$('#elicitation-dialog').close();$('#agent-state').textContent='Agent working';}
  catch(error){toast(error.message);}
}
async function exportBrief() {
  const button=$('#export-report');button.disabled=true;
  try {
    if(!state.sessionId||!state.history.length){toast('Start a conversation before exporting its brief.');return;}
    const report=await api(projectUrl('/reports/generate'),{method:'POST',body:JSON.stringify({chat_session_id:state.sessionId,message_history:state.history,hint:'Write a concise TVA Water4Energy scientific demonstration brief. Distinguish proposed work, actual tool execution, pending jobs, verified outputs, and scientific limitations.'})});
    download((report.slug_suggestion || 'tva-live-brief')+'.md',`# ${report.title}\n\n${report.summary || ''}\n\n${report.body || ''}`,'text/markdown');toast('VISTA report draft downloaded. Review it before presenting.');
  }catch(error){toast(`Could not export brief: ${error.message}`);}finally{button.disabled=false;}
}


// Bind once. All execution actions originate in explicit user interaction.
$$('.nav-item').forEach(el=>el.addEventListener('click',()=>switchView(el.dataset.view)));
$('.brand').addEventListener('click',event=>{event.preventDefault();switchView('workspace');});
$('#focus-site').addEventListener('change',event=>selectNetworkSite(event.target.value));
$('#result-site').addEventListener('change',event=>{state.siteIndex=Number(event.target.value);state.focusSiteId=currentStudy().sites[state.siteIndex].id;renderSiteContext();renderMap();renderResults();});
$('#skills-topbar').addEventListener('click',()=>switchView('skills'));
$('#skills-refresh').addEventListener('click',refreshSkills);
$('#open-prompt-library').addEventListener('click',()=>switchView('prompts'));
$('#open-network').addEventListener('click',()=>switchView('network'));
$('#workflow-details').addEventListener('click',showWorkflowDetails);
$('#site-search').addEventListener('input',renderNetworkRoster);
$('#connection-button').addEventListener('click',showSettings);$('#resource-settings').addEventListener('click',showSettings);
$('#refresh-button').addEventListener('click',()=>{refreshConnection();if(state.view==='files')renderFiles();toast('Checking the local VISTA connection.');});
$('#resource-refresh').addEventListener('click',refreshConnection);
$$('[data-close-dialog]').forEach(el=>el.addEventListener('click',()=>el.closest('dialog').close()));
$('#settings-form').addEventListener('submit',async event=>{
  event.preventDefault();if(state.busy){$('#settings-status').textContent='Finish or stop the current turn before changing connections.';return;}
  const button=event.submitter;button.disabled=true;
  try{state.config=await api('/api/config',{method:'POST',body:JSON.stringify({backend_url:$('#backend-url').value.trim(),project:$('#project-name').value.trim()})});state.sessionId=null;state.history=[];state.liveFiles=[];state.liveStudy=null;$('#settings-status').textContent='Checking VISTA…';await refreshConnection();resetActivity();showWelcome();renderResults();toast('Local connection saved.');}
  catch(error){$('#settings-status').textContent=error.message;}finally{button.disabled=false;}
});
$('#activity-toggle').addEventListener('click',()=>{const log=$('#activity-log');log.hidden=!log.hidden;$('#activity-toggle').setAttribute('aria-expanded',String(!log.hidden));});
$('#mode-info').addEventListener('click',showSettings);
$('#provenance-button').addEventListener('click',showProvenance);
$('#export-report').addEventListener('click',exportBrief);
$('#new-chat').addEventListener('click',newConversation);$('#history-new').addEventListener('click',newConversation);
$('#workflow-button').addEventListener('click',()=>{
  const focus=state.network.sites.find(s=>s.id===state.focusSiteId);
  if(!focus)return;
  const prompt=`Prepare a TVA Water4Energy workflow plan for ${focus.name}${focus.headwater?' (headwater reservoir)':''} on ${$('#resource').value}, from HEADWATER precipitation, temperature and runoff through downscaling, LSTM water availability and economic assessment. First inspect the actual loaded skills, available inputs and model coverage with read-only tools. Distinguish planned integrations from runnable steps, and explicitly report any missing support for this location. Do not submit jobs until I explicitly confirm the exact plan. Do not train, install software, calibrate or apply bias correction without a separate request. After confirmed work, save generated figures, prediction data, reports and provenance as VISTA project outputs, and use display_file so they appear in this conversation and the Results Library. Report actual job state separately from agent-turn completion.`;
  $('#prompt').value=prompt;$('#prompt').focus();toast('The workflow request is ready. Review it and send when you are ready.');
});

$('#chat-form').addEventListener('submit',event=>{event.preventDefault();const prompt=$('#prompt').value.trim();if(!prompt||state.busy)return;if(state.status?.project_found)$('#prompt').value='';sendLive(prompt);});
$('#prompt').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#chat-form').requestSubmit();}});
$('#stop-button').addEventListener('click',async()=>{
  if(!state.sessionId)return;
  try{await api(projectUrl(`/chat-sessions/${state.sessionId}/run/stop`),{method:'POST',body:'{}'});toast('Stop requested for the agent turn. Submitted cluster jobs must be checked separately.');}
  catch(error){toast(error.message);}
});
function chooseUpload(){if(!state.status?.project_found){toast('Open VISTA and connect your TVA project first.');showSettings();return;}$('#upload-input').click();}
$('#attach-button').addEventListener('click',chooseUpload);
$('#upload-input').addEventListener('change',async event=>{await uploadFiles(event.target.files);event.target.value='';});
$('#reload-files').addEventListener('click',renderFiles);
$('#elicitation-form').addEventListener('submit',event=>{event.preventDefault();resolveElicitation('accept');});
$('#elicitation-decline').addEventListener('click',()=>resolveElicitation('decline'));
$('#elicitation-dialog').addEventListener('cancel',event=>{event.preventDefault();toast('Accept or decline this VISTA request so the workflow can continue.');});

async function init() {
  renderResources();showWelcome();renderResults();
  try {
    const [geo,config,network,workflow,prompts]=await Promise.all([api('/data/geo.json'),api('/api/config'),api('/data/network.json'),api('/data/workflow.json'),api('/data/prompts.json')]);
    state.geo=geo;state.config=config;state.network=network;state.workflow=workflow;state.prompts=prompts.prompts;
    renderPipeline();renderPromptLibrary();renderSkills();renderSiteContext();renderMap();renderResults();showWelcome();
    await refreshConnection();
    state.sessionId=readSessionId();
    if(state.sessionId && state.status?.project_found)await loadSession(state.sessionId,true);
  }catch(error){addMessage('system',`The workspace could not load: ${error.message}. Start it using the launcher rather than opening index.html directly.`,{error:true});}
}
init();
