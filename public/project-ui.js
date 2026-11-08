'use strict';

// Project-specific views. Scientific stages and installed skills stay distinct.
function stageSkills(stage) {
  return (state.skills?.skills || []).filter(skill=>(stage.skillKeywords || []).some(word=>skill.name.toLowerCase().includes(word)));
}
function renderPipeline() {
  if(!state.workflow)return;
  $('#pipeline-grid').innerHTML=state.workflow.stages.map(stage=>{
    const loaded=stageSkills(stage).length;
    const names={'headwater':'HEADWATER','downscaling':'Downscaling','water-availability':'LSTM','economics':'Economics'};
    const status=loaded?'Skill loaded':stage.status==='recorded_available'?'Recorded':'Planned';
    return `<button class="pipeline-stage ${state.selectedStage===stage.id?'selected':''}" data-science-stage="${esc(stage.id)}" aria-expanded="${state.selectedStage===stage.id}" title="${esc(stage.title+' · '+stage.statusLabel)}"><span class="stage-number">0${stage.number}</span><span class="stage-title">${esc(names[stage.id] || stage.shortTitle)}</span><span class="stage-status ${loaded?'loaded':stage.status==='recorded_available'?'recorded':''}"><i></i>${status}</span><span class="stage-arrow">→</span></button>`;
  }).join('');
  $$('#pipeline-grid [data-science-stage]').forEach(el=>el.addEventListener('click',()=>{
    state.selectedStage=state.selectedStage===el.dataset.scienceStage?null:el.dataset.scienceStage;renderPipeline();
  }));
  const stage=state.workflow.stages.find(s=>s.id===state.selectedStage);
  $('#pipeline-detail').hidden=!stage;
  if(stage){
    $('#pipeline-detail').innerHTML=`<div class="stage-detail-intro"><span class="eyebrow">${esc(stage.owner)}</span><h3>${esc(stage.title)}</h3><p>${esc(stage.description)}</p><span class="tag">${esc(stage.targetResolution || '')}</span></div><div><h4>INPUTS</h4><ul>${stage.input.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>OUTPUTS</h4><ul>${stage.output.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="stage-integration-note"><span>${esc(stage.integrationNote)}</span><button class="text-button" id="use-stage-prompt">Use this stage’s prompt →</button></div>`;
    $('#use-stage-prompt').addEventListener('click',()=>usePrompt(state.prompts.find(p=>p.stageId===stage.id)?.id || 'end-to-end'));
  }
  renderStageCoverage();
}
function showWorkflowDetails() {
  if(!state.workflow)return;
  const w=state.workflow;
  showDetails('TVA workflow & scientific handoffs',`<p>${esc(w.summary)}</p>${w.stages.map(s=>`<h3>0${s.number} · ${esc(s.title)}</h3><p><strong>${esc(s.owner)}</strong> · ${esc(s.statusLabel)}</p><p>${esc(s.description)}</p><p>${esc(s.integrationNote)}</p>`).join('')}<h3>Supporting pathways</h3>${w.branches.map(b=>`<p><strong>${esc(b.title)}</strong> · ${esc(b.statusLabel)}<br>${esc(b.description)} ${esc(b.integrationNote)}</p>`).join('')}<h3>${esc(w.handoff.title)}</h3><ul>${w.handoff.fields.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><p>${esc(w.handoff.note)}</p><h3>Project references</h3>${w.sources.filter(s=>s.deck).map(s=>`<p>${esc(s.deck)} · slide ${s.slide}</p>`).join('')}<p>These are science-stage definitions, not a claim that every model is installed or has executed.</p>`);
}
function renderPromptLibrary() {
  const featured=['end-to-end','network','skills'];
  const shortTitles={'end-to-end':'Explain workflow','network':'Explore TVA','skills':'Show skills'};
  $('#starter-prompts').innerHTML=featured.map(id=>state.prompts.find(p=>p.id===id)).filter(Boolean).map(p=>`<button class="starter-prompt" data-use-prompt="${esc(p.id)}" title="${esc(p.description)}">${esc(shortTitles[p.id])}</button>`).join('');
  const categories=['All',...new Set(state.prompts.map(p=>p.category))];
  $('#prompt-filter').innerHTML=categories.map(c=>`<button class="${c===state.promptCategory?'active':''}" data-prompt-category="${esc(c)}">${esc(c)}</button>`).join('');
  $('#prompt-library').innerHTML=state.prompts.filter(p=>state.promptCategory==='All'||p.category===state.promptCategory).map((p,i)=>`<article class="prompt-library-card"><span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><button class="text-button" data-use-prompt="${esc(p.id)}">${state.mode==='recorded'?'Explore recorded guide':'Prepare live prompt'} ${icon('arrow')}</button></article>`).join('');
  $('#prompt-mode-tag').textContent=state.mode==='recorded'?'Recorded guide · no model call':'Live VISTA · review & send';
  $$('[data-use-prompt]').forEach(el=>el.addEventListener('click',()=>usePrompt(el.dataset.usePrompt)));
  $$('[data-prompt-category]').forEach(el=>el.addEventListener('click',()=>{state.promptCategory=el.dataset.promptCategory;renderPromptLibrary();}));
}
function usePrompt(id) {
  if(state.busy){toast('Finish the current turn before starting another prompt.');return;}
  const prompt=state.prompts.find(p=>p.id===id);if(!prompt)return;
  switchView('workspace');
  if(state.mode==='live'){
    const site=state.network?.sites.find(s=>s.id===state.focusSiteId);
    $('#prompt').value=prompt.livePrompt+(id==='lstm'&&site?`\n\nSite currently inspected in the workspace: ${site.id} (${site.name}). Keep the 52-site network as study scope and report actual input coverage.`:'');
    $('#prompt').focus();$('#chat-form').scrollIntoView({behavior:'smooth',block:'center'});
    toast('Prompt prepared. Review the request, then press Send.');
  }else{
    addMessage('user',prompt.title);addGuideMessage(prompt);
    addActivity('Recorded project guide',`${prompt.category} · explanation from project references; no model call.`);
    if(id==='network')toast('Use TVA network to inspect all 52 sites and their recorded coverage.');
    if(id==='skills' && Number.isInteger(state.skills?.count))addMessage('agent',`${state.skills.count} skills are loaded in the connected TVA project. Open Skills to inspect them.`);
    $('#chat-scroll').scrollIntoView({behavior:'smooth',block:'center'});
  }
}
function addGuideMessage(prompt) {
  const summaries={
    'end-to-end':'HEADWATER forecasts precipitation, temperature and runoff. Downscaling prepares high-resolution fields for the LSTM, which estimates TVA water availability. Georgia Tech uses the water records for economic assessment. The LSTM example is recorded; the other model connections are planned.',
    'network':'The study covers all 52 TVA ELF sites. Choose a site on the map or open TVA network to browse them. Recorded evaluation coverage varies by site; missing results stay missing.',
    'skills':'The Skills page shows the selected TVA project’s actual loaded skills and job definitions. Workflow stages are listed separately from installed skills.',
    'headwater':'HEADWATER supplies precipitation, air temperature and runoff forecasts. Its handoff must preserve physical units, dates and ensemble IDs before downstream models can use the fields. This connection is planned.',
    'downscaling':'Downscaling reconstructs physical scenarios and prepares high-resolution fields, targeting 1 km. Those fields are then aggregated into the basin inputs required by the LSTM. This integration is planned.',
    'lstm':'The saved LSTM estimates weekly TVA water availability from basin forcing and static attributes. Use the chart to inspect recorded results. A live run first needs matched inputs and a verified compute environment.',
    'plant-interface':'TRITON can add hydraulic detail, and RiTHyMs can provide river water temperature near plants. These supporting models feed the plant data handoff and remain separate planned integrations.',
    'economics':'Georgia Tech combines plant water records with plant and economic data to assess generation, cost and risk. The partner interface and metrics still need agreement.'
  };
  const body=addMessage('agent',summaries[prompt.id] || prompt.recordedAnswer.split('\n\n')[0]);
  const detail=document.createElement('details');detail.className='answer-detail';
  const summary=document.createElement('summary');summary.textContent='More detail';
  const content=document.createElement('div');content.className='expanded-answer';content.innerHTML=formatText(prompt.recordedAnswer);
  detail.append(summary,content);body.append(detail);scrollChat();
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
  $('#skill-stage-coverage').innerHTML=state.workflow.stages.map(stage=>{const loaded=stageSkills(stage);return `<div class="coverage-stage"><span class="stage-number">0${stage.number}</span><div><strong>${esc(stage.shortTitle)}</strong><small>${esc(stage.owner)}</small></div><span class="tag ${loaded.length?'loaded-tag':''}">${loaded.length?'Matching skill loaded':esc(stage.statusLabel)}</span></div>`;}).join('');
}
function renderSiteContext() {
  const site=state.network?.sites.find(s=>s.id===state.focusSiteId);
  const total=state.network?.siteCount || 52;
  $('#coverage-label').textContent=`${total} ELF SITES`;
  $('#site-picks').innerHTML=`<div class="network-scope"><strong>${total}</strong><span>ELF sites across the<br>whole TVA network</span><button class="text-button" id="scope-network-button">Explore ↗</button></div>`;
  $('#scope-network-button').addEventListener('click',()=>switchView('network'));
  $('#focus-site').innerHTML=(state.network?.sites || []).map(s=>`<option value="${esc(s.id)}" ${s.id===state.focusSiteId?'selected':''}>${esc(s.id)} · ${esc(s.name)}</option>`).join('');
  $('#focus-site').value=state.focusSiteId;
}
function selectNetworkSite(id,showEvidence=false) {
  if(state.busy){toast('Finish the current turn before changing the study context.');return;}
  state.focusSiteId=id;
  if(state.mode==='recorded' && !state.study.sites.some(s=>s.id===id)){
    $('#scenario').value='historical';state.study=state.studies.historical;$('#model-label').textContent=state.study.modelLabel;
    $('#scenario-kind').textContent='HISTORICAL';toast('Showing the historical network. The GEFS pilot covers only Norris and Normandy.');
  }
  const study=currentStudy();state.siteIndex=Math.max(0,study?.sites.findIndex(s=>s.id===id) ?? 0);
  renderSiteContext();renderMap();renderResults();renderNetworkRoster();
  if(showEvidence){switchView('workspace');$('#results-panel').scrollIntoView({behavior:'smooth',block:'start'});}
}
function drawNetworkMap(targetId,width=450,height=285) {
  const target=$('#'+targetId);if(!target || !state.geo || !state.network)return;
  const all=state.geo.features.flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2));
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const pad=targetId==='network-map'?55:25;
  const scale=Math.min((width-pad*2)/((maxX-minX)*.82),(height-75)/(maxY-minY));
  const project=([x,y])=>[pad+(x-minX)*.82*scale+(width-pad*2-(maxX-minX)*.82*scale)/2,36+(maxY-y)*scale+(height-75-(maxY-minY)*scale)/2];
  const pathFor=ring=>ring.map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(1)).join(',')}`).join(' ')+'Z';
  const focus=state.network.sites.find(s=>s.id===state.focusSiteId);
  const areas=state.geo.features.map(f=>{const active=focus?.regionId===f.properties.id;const rings=f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat();return `<path d="${rings.map(pathFor).join(' ')}" fill="${active?'var(--map-selected)':'var(--map-area)'}" stroke="${active?'var(--map-selected-border)':'var(--map-border)'}" stroke-width="${active?1.1:.5}" fill-rule="evenodd"><title>${esc(f.properties.name)} forcing region</title></path>`;}).join('');
  // Shared centroids remain at their actual coordinates; the roster disambiguates overlapping sites.
  const markers=[...state.network.sites.filter(s=>s.id!==state.focusSiteId),...state.network.sites.filter(s=>s.id===state.focusSiteId)].map(s=>{
    const [x,y]=project([s.lon,s.lat]),active=s.id===state.focusSiteId;
    return `<g class="network-point" data-network-site="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.id+' '+s.name)}">${active?`<circle cx="${x}" cy="${y}" r="9" fill="var(--map-halo)" stroke="none"/>`:''}<circle cx="${x}" cy="${y}" r="${active?4.8:targetId==='network-map'?3.3:2.4}" fill="${active?'var(--map-focus)':'var(--map-point)'}" stroke="${active?'white':'var(--map-halo)'}" stroke-width="${active?1.5:.6}"/><title>${esc(s.id+' · '+s.name)} · forcing-region centroid</title>${active?`<text x="${x+10}" y="${y-13}" fill="var(--map-label)" stroke="none" font-size="${targetId==='network-map'?12:10}" font-weight="600">${esc(s.name)}</text>`:''}</g>`;
  }).join('');
  const gridId='grid-'+targetId;
  target.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="All 52 TVA ELF sites over reconstructed forcing regions. Markers are region centroids, not dam outlets."><defs><pattern id="${gridId}" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="var(--map-grid)" stroke-width=".5"/></pattern></defs><rect width="${width}" height="${height}" fill="var(--map-background)" stroke="none"/><rect width="${width}" height="${height}" fill="url(#${gridId})" stroke="none"/><text x="${pad}" y="25" fill="var(--map-muted)" stroke="none" font-size="8" letter-spacing="2">TENNESSEE VALLEY · 52 ELF SITES</text>${areas}${markers}<text x="${pad}" y="${height-13}" fill="var(--map-muted)" stroke="none" font-size="8">${state.geo.features.length} reconstructed forcing regions · site positions are centroids</text><text x="${width-pad}" y="25" text-anchor="end" fill="var(--map-muted)" stroke="none" font-size="8">N ↑</text></svg>`;
  target.querySelectorAll('[data-network-site]').forEach(el=>{
    el.addEventListener('click',()=>selectNetworkSite(el.dataset.networkSite));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNetworkSite(el.dataset.networkSite);}});
  });
}
function renderNetwork() {
  if(!state.network)return;
  const n=state.network,rows=state.studies.historical.sites.reduce((sum,s)=>sum+s.series.filter(r=>Number.isFinite(r.predicted)&&Number.isFinite(r.observed)).length,0);
  const covered=state.studies.historical.sites.filter(s=>s.series.some(r=>Number.isFinite(r.predicted))).length;
  $('#network-overview').innerHTML=`<div><strong>${n.siteCount}</strong><span>ELF sites in the supplied network</span></div><div><strong>${state.geo.features.length}</strong><span>Reconstructed forcing regions</span></div><div><strong>${covered} <small>/ ${n.siteCount}</small></strong><span>Sites with saved evaluation pairs</span></div><div><strong>${rows.toLocaleString()}</strong><span>Saved site–week pairs in this example</span></div>`;
  drawNetworkMap('network-map',1000,410);renderNetworkRoster();
}
function renderNetworkRoster() {
  if(!state.network)return;
  const query=$('#site-search').value.trim().toLowerCase();
  const sites=state.network.sites.filter(s=>(s.id+' '+s.name).toLowerCase().includes(query));
  $('#network-roster').innerHTML=sites.length?sites.map(s=>{
    const sample=state.studies.historical.sites.find(x=>x.id===s.id),valid=sample?.series.filter(r=>Number.isFinite(r.predicted)&&Number.isFinite(r.observed)).length || 0;
    return `<button class="network-site-card ${s.id===state.focusSiteId?'selected':''}" data-roster-site="${esc(s.id)}"><span class="elf-id">${esc(s.id)}</span><strong>${esc(s.name)}</strong><small>${valid?`${valid} / 26 saved paired weeks`:'No saved evaluation predictions'}</small><span class="site-open-arrow">↗</span></button>`;
  }).join(''):'<div class="empty-state">No matching site. Try a name or ELF ID.</div>';
  $$('[data-roster-site]').forEach(el=>el.addEventListener('click',()=>selectNetworkSite(el.dataset.rosterSite,true)));
}
function showOriginalNetwork() {
  if(!state.network)return;
  showDetails('Original TVA network references',`<p>These are the original map and schematic supplied with the ELF records. The diagrams also show sites beyond ELF01–ELF52; this workspace’s supplied time-series/model inventory covers 52 sites.</p>${state.network.referenceImages.map(image=>`<h3>${esc(image.label)}</h3><a href="${esc(image.url)}" target="_blank" rel="noopener"><img class="reference-network-image" src="${esc(image.url)}" alt="${esc(image.label)}"></a><p><a href="${esc(image.url)}" target="_blank" rel="noopener">Open full-size reference ↗</a></p>`).join('')}<p>Geographic markers in the interactive map are forcing-region centroids. Use the source schematic for the historical network relationships; geographic proximity does not imply a flow connection.</p>`);
}
function recordedProjectAnswer(prompt) {
  const text=prompt.toLowerCase();
  const match=state.prompts.find(p=>p.title.toLowerCase()===text);
  if(match){usePrompt(match.id);return;}
  const id=/end.to.end|full workflow|main workflow/.test(text)?'end-to-end':/headwater|precipitation|forecast handoff/.test(text)?'headwater':/downscal|high.resolution/.test(text)?'downscaling':/econom|georgia|cost|generation/.test(text)?'economics':/triton|rithyms|temperature near|plant interface/.test(text)?'plant-interface':/skill/.test(text)?'skills':/whole|network|52|all sites/.test(text)?'network':/lstm|water availability/.test(text)?'lstm':null;
  if(id){usePrompt(id);return;}
  if(/walk|workflow|step|run/.test(text)){playback();return;}
  addMessage('user',prompt);
  const study=state.study,site=study.sites[state.siteIndex];
  if(/provenance|source|limit|input|model|history/.test(text))addMessage('agent',`This is ${study.source.toLowerCase()}, using ${study.modelLabel} at selected epoch ${study.provenance.selectedEpoch}.\n\n${study.caveats.slice(0,4).join('\n\n')}\n\nUse View provenance below for the recorded input/model contract and source details. The full project workflow also includes HEADWATER, downscaling and Georgia Tech economic assessment; those stages have separate integration requirements.`);
  else if(/compar|result|volume|norris|normandy|site|water/.test(text)){
    const valid=site.series.filter(r=>Number.isFinite(r.predicted)&&Number.isFinite(r.observed));
    if(!valid.length)addMessage('agent',`${site.name} (${site.id}) belongs to the 52-site TVA network but has no saved paired predictions in this recorded evaluation. No values are substituted. A live plan must first confirm appropriate inputs and the inference runtime.`);
    else addMessage('agent',`${site.name} (${site.id}) has ${valid.length} valid paired weeks in this recorded sample. Predicted volume over those weeks is ${format(site.metrics.predictedTotal)} million m³; reference ELF volume is ${format(site.metrics.observedTotal)} million m³.${Number.isFinite(site.metrics.nse)?` Sample NSE is ${format(site.metrics.nse,2)}.`:''}\n\nMissing weeks remain gaps. Use the site selector or the TVA network view to inspect any of the 52 sites. ELF quantities can be local, incremental or allocated, so the app does not sum them into a network inflow total.`);
  }else addMessage('agent','Choose a starter prompt to explore HEADWATER, downscaling, the LSTM, Georgia Tech economics, the full TVA network or loaded skills. Recorded mode explains included project information; Live VISTA supports open-ended questions and actual tool execution.');
  addActivity('Recorded guide','Answered using included project metadata; no model call.');
}
