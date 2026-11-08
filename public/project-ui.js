'use strict';

// Project-specific views. Scientific stages and installed skills stay distinct.
function stageSkills(stage) {
  return (state.skills?.skills || []).filter(skill=>(stage.skillKeywords || []).some(word=>skill.name.toLowerCase().includes(word)));
}
function renderPipeline() {
  if(!state.workflow)return;
  $('#pipeline-grid').innerHTML=state.workflow.stages.map(stage=>{
    const loaded=stageSkills(stage).length;
    return `<button class="pipeline-stage ${state.selectedStage===stage.id?'selected':''}" data-science-stage="${esc(stage.id)}" aria-expanded="${state.selectedStage===stage.id}"><span class="stage-number">0${stage.number}</span><span class="stage-title">${esc(stage.shortTitle)}</span><span class="stage-status ${loaded?'loaded':''}"><i></i>${loaded?'Project skill loaded':esc(stage.statusLabel)}</span><span class="stage-output">${esc(stage.id==='headwater'?'Precipitation · air T · runoff':stage.id==='downscaling'?'Physical fields · 1 km target':stage.id==='water-availability'?'Weekly site water availability':'Generation · cost · risk')}</span><span class="stage-arrow">→</span></button>`;
  }).join('');
  $$('#pipeline-grid [data-science-stage]').forEach(el=>el.addEventListener('click',()=>{
    state.selectedStage=state.selectedStage===el.dataset.scienceStage?null:el.dataset.scienceStage;renderPipeline();
  }));
  const stage=state.workflow.stages.find(s=>s.id===state.selectedStage);
  $('#pipeline-detail').hidden=!stage;
  if(stage){
    $('#pipeline-detail').innerHTML=`<div class="stage-detail-intro"><span class="eyebrow">SCIENCE STAGE</span><h3>${esc(stage.title)}</h3><p>${esc(stage.description)}</p><span class="tag">${esc(stage.targetResolution || '')}</span></div><div><h4>INPUTS</h4><ul>${stage.input.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>OUTPUTS</h4><ul>${stage.output.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="stage-integration-note"><span>${esc(stage.integrationNote)}</span><button class="text-button" id="use-stage-prompt">Use this stage’s prompt →</button></div>`;
    $('#use-stage-prompt').addEventListener('click',()=>usePrompt(state.prompts.find(p=>p.stageId===stage.id)?.id || 'end-to-end'));
  }
  renderStageCoverage();
}
function showWorkflowDetails() {
  if(!state.workflow)return;
  const w=state.workflow;
  showDetails('TVA workflow & scientific handoffs',`<p>${esc(w.summary)}</p>${w.stages.map(s=>`<h3>0${s.number} · ${esc(s.title)}</h3><p>${esc(s.statusLabel)}</p><p>${esc(s.description)}</p><p>${esc(s.integrationNote)}</p>`).join('')}<h3>Supporting pathways</h3>${w.branches.map(b=>`<p><strong>${esc(b.title)}</strong> · ${esc(b.statusLabel)}<br>${esc(b.description)} ${esc(b.integrationNote)}</p>`).join('')}<h3>${esc(w.handoff.title)}</h3><ul>${w.handoff.fields.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><p>${esc(w.handoff.note)}</p><h3>Project references</h3>${w.sources.filter(s=>s.deck).map(s=>`<p>${esc(s.deck)} · slide ${s.slide}</p>`).join('')}<p>These are science-stage definitions, not a claim that every model is installed or has executed.</p>`);
}
function renderPromptLibrary() {
  const featured=['end-to-end','network','skills'];
  $('#starter-prompts').innerHTML=featured.map(id=>state.prompts.find(p=>p.id===id)).filter(Boolean).map((p,i)=>`<button class="starter-prompt" data-use-prompt="${esc(p.id)}"><span class="starter-index">0${i+1}</span><span><strong>${esc(p.title)}</strong><small>${esc(p.description)}</small></span>${icon('arrow')}</button>`).join('');
  const categories=['All',...new Set(state.prompts.map(p=>p.category))];
  $('#prompt-filter').innerHTML=categories.map(c=>`<button class="${c===state.promptCategory?'active':''}" data-prompt-category="${esc(c)}">${esc(c)}</button>`).join('');
  $('#prompt-library').innerHTML=state.prompts.filter(p=>state.promptCategory==='All'||p.category===state.promptCategory).map(p=>`<article class="prompt-library-card"><span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><button class="text-button" data-use-prompt="${esc(p.id)}">Prepare prompt ${icon('arrow')}</button></article>`).join('');
  $('#prompt-mode-tag').textContent='VISTA · review & send';
  $('#prompt-library-notice').textContent='Choose a starter to prepare an editable request. Review it, then send it to the connected TVA project.';
  $$('[data-use-prompt]').forEach(el=>el.addEventListener('click',()=>usePrompt(el.dataset.usePrompt)));
  $$('[data-prompt-category]').forEach(el=>el.addEventListener('click',()=>{state.promptCategory=el.dataset.promptCategory;renderPromptLibrary();}));
}
function usePrompt(id) {
  if(state.busy){toast('Finish the current turn before starting another prompt.');return;}
  const prompt=state.prompts.find(p=>p.id===id);if(!prompt)return;
  const site=state.network?.sites.find(s=>s.id===state.focusSiteId);
  const context=site?`\n\nSelected study location: ${site.name}${site.headwater?' (headwater reservoir)':''}. Verify its actual input coverage and model mapping before execution.${site.modelSiteId===null?' No model-site mapping is supplied for this added reservoir.':''}`:'';
  switchView('workspace');
  $('#prompt').value=prompt.livePrompt+context;
  $('#prompt').focus();$('#chat-form').scrollIntoView({behavior:'smooth',block:'center'});
  toast('Prompt prepared. Review the request, then press Send.');
}
async function refreshSkills() {
  const project=state.config.project,backend=state.config.backend_url;
  try {const response=await api('/api/skills?fresh=1');if(project!==state.config.project || backend!==state.config.backend_url || response.project!==project)return;state.skills=response;}
  catch(error){state.skills={count:null,skills:[],connected:false,project_found:false,detail:error.message};}
  const count=Number.isInteger(state.skills.count)?String(state.skills.count):'—';
  $('#skill-count').textContent=count;$('#skills-topbar-count').textContent=count;
  renderSkills();renderPipeline();
}
function renderSkills() {
  const data=state.skills;
  const count=Number.isInteger(data?.count)?data.count:null;
  $('#skills-summary').innerHTML=`<div class="skill-total"><strong>${count===null?'—':count}</strong><span>skills loaded into<br><b>${esc(data?.project || state.config.project)}</b></span></div><p>${esc(data?.detail || 'Connect VISTA to read the skills loaded into this TVA project.')}<br><small>Workflow-stage cards are not included in this count. Add or load skills in VISTA, then refresh here.</small></p>`;
  $('#skills-list').innerHTML=data?.skills?.length?data.skills.map((skill,i)=>`<article class="skill-card"><div class="skill-card-heading">${icon('skill')}<span class="tag loaded-tag">Loaded in project</span></div><h2>${esc(skill.name)}</h2><p>${esc(skill.description || 'Description unavailable from this VISTA version.')}</p><div class="skill-card-bottom"><span>${skill.hpc_jobs?.length?`${skill.hpc_jobs.length} job definition${skill.hpc_jobs.length===1?'':'s'} · ${esc(skill.hpc_jobs.join(', '))}`:'Instructions / scientific tools'}</span><button class="text-button" data-skill-index="${i}" ${skill.body?'':'disabled'}>View skill ↗</button></div></article>`).join(''):`<div class="empty-state">${count===0?'No skills are loaded into the selected TVA project yet.':'The current skill count is unavailable. Open VISTA and check the project connection.'}</div>`;
  $$('[data-skill-index]').forEach(el=>el.addEventListener('click',()=>{const s=state.skills.skills[Number(el.dataset.skillIndex)];showDetails(s.name,`<p>${esc(s.description || '')}</p><div class="skill-instructions">${formatText(s.body || '')}</div>`);}));
  renderStageCoverage();
}
function renderStageCoverage() {
  if(!state.workflow)return;
  $('#skill-stage-coverage').innerHTML=state.workflow.stages.map(stage=>{const loaded=stageSkills(stage);return `<div class="coverage-stage"><span class="stage-number">0${stage.number}</span><div><strong>${esc(stage.shortTitle)}</strong></div><span class="tag ${loaded.length?'loaded-tag':''}">${loaded.length?'Matching skill loaded':esc(stage.statusLabel)}</span></div>`;}).join('');
}
function networkGroups() {
  const sites=state.network?.sites || [];
  const order=state.network?.headwaterNames || [];
  return [
    {id:'headwaters',title:'Headwater reservoirs',sites:sites.filter(s=>s.headwater).sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name))},
    {id:'other',title:'Other reservoirs & gages',sites:sites.filter(s=>!s.headwater)}
  ];
}
function renderSiteContext() {
  if(!state.network)return;
  const total=state.network.siteCount;
  $('#coverage-label').textContent=`${state.network.headwaterCount} HEADWATER RESERVOIRS`;
  $('#site-picks').innerHTML=`<div class="network-scope"><strong>${total}</strong><span>study locations ·<br>${state.network.headwaterCount} headwater reservoirs</span><button class="text-button" id="scope-network-button">Explore ↗</button></div>`;
  $('#scope-network-button').addEventListener('click',()=>switchView('network'));
  $('#focus-site').innerHTML=networkGroups().map(group=>`<optgroup label="${esc(group.title)} (${group.sites.length})">${group.sites.map(s=>`<option value="${esc(s.id)}" ${s.id===state.focusSiteId?'selected':''}>${esc(s.name)}</option>`).join('')}</optgroup>`).join('');
  $('#focus-site').value=state.focusSiteId;
  const selected=state.network.sites.find(s=>s.id===state.focusSiteId);
  $('#focus-site').classList.toggle('headwater-selected',Boolean(selected?.headwater));
}
function selectNetworkSite(id,showWorkspace=false) {
  if(state.busy){toast('Finish the current turn before changing the study context.');return;}
  if(!state.network?.sites.some(s=>s.id===id))return;
  state.focusSiteId=id;
  const study=currentStudy(),index=study?.sites.findIndex(s=>s.id===id);
  if(Number.isInteger(index)&&index>=0)state.siteIndex=index;
  renderSiteContext();renderMap();renderResults();renderNetworkRoster();
  if(showWorkspace){switchView('workspace');$('#focus-site').scrollIntoView({behavior:'smooth',block:'center'});}
}
function drawNetworkMap(targetId,width=450,height=285) {
  const target=$('#'+targetId);if(!target || !state.geo || !state.network)return;
  const all=[...state.geo.features.flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2)),...state.network.sites.map(s=>[s.lon,s.lat])];
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const pad=targetId==='network-map'?55:25;
  const scale=Math.min((width-pad*2)/((maxX-minX)*.82),(height-85)/(maxY-minY));
  const project=([x,y])=>[pad+(x-minX)*.82*scale+(width-pad*2-(maxX-minX)*.82*scale)/2,36+(maxY-y)*scale+(height-85-(maxY-minY)*scale)/2];
  const pathFor=ring=>ring.map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(1)).join(',')}`).join(' ')+'Z';
  const focus=state.network.sites.find(s=>s.id===state.focusSiteId);
  const areas=state.geo.features.map(f=>{const active=focus?.regionId===f.properties.id;const rings=f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat();return `<path d="${rings.map(pathFor).join(' ')}" fill="${active?'var(--map-selected)':'var(--map-area)'}" stroke="${active?'var(--map-selected-border)':'var(--map-border)'}" stroke-width="${active?1.1:.5}" fill-rule="evenodd"><title>${esc(f.properties.name)} study forcing region</title></path>`;}).join('');
  // Original points remain forcing-region references, not dam/gage coordinates.
  const markers=[...state.network.sites.filter(s=>s.id!==state.focusSiteId),...state.network.sites.filter(s=>s.id===state.focusSiteId)].map(s=>{
    const [x,y]=project([s.lon,s.lat]),active=s.id===state.focusSiteId;
    const radius=active?5.5:targetId==='network-map'?4:3;
    const color=active?'var(--map-focus)':s.headwater?'var(--headwater-color, #00662c)':'var(--map-point)';
    const mark=s.headwater?`<path d="M${x},${y-radius-1}l${radius+1},${radius+1}l${-radius-1},${radius+1}l${-radius-1},${-radius-1}Z" fill="${color}" stroke="${active?'white':'var(--map-halo)'}" stroke-width="${active?1.5:.7}"/>`:`<circle cx="${x}" cy="${y}" r="${active?4.8:targetId==='network-map'?3:2.3}" fill="${color}" stroke="${active?'white':'var(--map-halo)'}" stroke-width="${active?1.5:.6}"/>`;
    return `<g class="network-point ${s.headwater?'network-headwater':''}" data-network-site="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.name+(s.headwater?', headwater reservoir':', network location'))}">${active?`<circle cx="${x}" cy="${y}" r="10" fill="var(--map-halo)" stroke="none"/>`:''}${mark}<title>${esc(s.name)} · ${s.headwater?'headwater reservoir · ':''}${esc(s.locationType)}</title>${active?`<text x="${x+11}" y="${y-13}" fill="var(--map-label)" stroke="none" font-size="${targetId==='network-map'?12:10}" font-weight="600">${esc(s.name)}</text>`:''}</g>`;
  }).join('');
  const gridId='grid-'+targetId;
  target.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="TVA study coverage with ${state.network.siteCount} locations, including ${state.network.headwaterCount} headwater reservoirs. Markers are study-region and reservoir reference points, not uniformly dam outlets or gage positions."><defs><pattern id="${gridId}" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="var(--map-grid)" stroke-width=".5"/></pattern></defs><rect width="${width}" height="${height}" fill="var(--map-background)" stroke="none"/><rect width="${width}" height="${height}" fill="url(#${gridId})" stroke="none"/><text x="${pad}" y="25" fill="var(--map-muted)" stroke="none" font-size="8" letter-spacing="2">TVA STUDY NETWORK · ${state.network.siteCount} LOCATIONS</text>${areas}${markers}<text x="${pad}" y="${height-27}" fill="var(--headwater-color, #00662c)" stroke="none" font-size="8">◆ Headwater reservoir</text><text x="${pad+126}" y="${height-27}" fill="var(--map-muted)" stroke="none" font-size="8">● Other location</text><text x="${pad}" y="${height-12}" fill="var(--map-muted)" stroke="none" font-size="8">Study-region reference points · not a routing diagram</text><text x="${width-pad}" y="25" text-anchor="end" fill="var(--map-muted)" stroke="none" font-size="8">N ↑</text></svg>`;
  target.querySelectorAll('[data-network-site]').forEach(el=>{
    el.addEventListener('click',()=>selectNetworkSite(el.dataset.networkSite));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNetworkSite(el.dataset.networkSite);}});
  });
}
function renderNetwork() {
  if(!state.network)return;
  const n=state.network;
  $('#network-overview').innerHTML=`<div><strong>${n.siteCount}</strong><span>Study locations</span></div><div><strong>${n.headwaterCount}</strong><span>Headwater reservoirs</span></div><div><strong>${n.siteCount-n.headwaterCount}</strong><span>Other reservoirs and gages</span></div>`;
  drawNetworkMap('network-map',1000,410);renderNetworkRoster();
}
function renderNetworkRoster() {
  if(!state.network)return;
  const query=$('#site-search').value.trim().toLowerCase();
  let matched=0;
  $('#network-roster').innerHTML=networkGroups().map(group=>{
    const sites=group.sites.filter(s=>(s.name+' '+(s.headwater?'headwater reservoir':'other reservoir gage location')).toLowerCase().includes(query));
    matched+=sites.length;
    return sites.length?`<h3 class="network-group-heading">${esc(group.title)} <span>${sites.length}</span></h3>${sites.map(s=>`<button class="network-site-card ${s.headwater?'network-headwater':''} ${s.id===state.focusSiteId?'selected':''}" data-roster-site="${esc(s.id)}"><span class="${s.headwater?'headwater-badge':'location-kind'}">${s.headwater?'Headwater':'Network location'}</span><strong>${esc(s.name)}</strong><small>${s.headwater?'Headwater reservoir':'Reservoir / gage study location'}</small><span class="site-open-arrow">↗</span></button>`).join('')}`:'';
  }).join('');
  if(!matched)$('#network-roster').innerHTML='<div class="empty-state">No matching location. Try a reservoir or gage name.</div>';
  $$('[data-roster-site]').forEach(el=>el.addEventListener('click',()=>selectNetworkSite(el.dataset.rosterSite,true)));
}
function showOriginalNetwork() {
  if(!state.network)return;
  showDetails('Network geography & references',`<p>${esc(state.network.mapNote)}</p><p>${esc(state.network.quantityNote)}</p><p>${esc(state.network.coverageNote)}</p><h3>Added headwater reservoir references</h3>${state.network.coordinateReferences.map(source=>`<p><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.site)} · ${esc(source.label)} ↗</a></p>`).join('')}<h3>Supplied network diagrams</h3>${state.network.referenceImages.map(image=>`<p><a href="${esc(image.url)}" target="_blank" rel="noopener">${esc(image.label)} ↗</a></p>`).join('')}`);
}
