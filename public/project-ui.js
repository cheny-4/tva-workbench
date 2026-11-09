'use strict';

// Project views accompany a fixed, ledger-first hypothesis-lab demonstration.
// The case module owns loop, evidence and required-skill readiness.
function renderPipeline() {}
function renderStageCoverage() {}
function showWorkflowDetails() {
  showDetails('The April 2019 hypothesis-lab demo',`<p>This is one VISTA project, <strong>Water4Energy-TVA-agent-loop</strong>, for the week <strong>16–22 April 2019</strong>, issued 15 April.</p><h3>The walkthrough</h3><p>Read the experiment ledger before proposing a new hypothesis. The Proposer, Critic and Referee use existing scored evidence to identify an open gap and describe a protocol. A person still authorizes any training.</p><h3>The evidence on screen</h3><p>Temperature and precipitation use the saved climate-week plus residual 9×9 results. Runoff is labeled ERA5 observation; the HEADWATER forecast slot is unavailable. The downscale panel compares frozen Trial 0 U-Net and bilinear results at 1° → 0.25°.</p><h3>Optional final panel</h3><p>A dam readout is shown only when enabled, with Normandy or Norris and an agreed plain-language rule. The interface does not infer an operating rule or run RiverWare.</p><p><a href="https://github.com/daliwang/HEADWATER/blob/main/docs/TVA_AGENT_DEMO_PLAN_20261102.md" target="_blank" rel="noopener noreferrer">Read the source demonstration plan ↗</a></p>`);
}
function renderPromptLibrary() {
  const featured=['walkthrough','ledger','runoff'];
  const starters=featured.map(id=>state.prompts.find(p=>p.id===id)).filter(Boolean);
  $('#starter-prompts').innerHTML=starters.map((p,i)=>`<button class="starter-prompt" data-use-prompt="${esc(p.id)}"><span class="starter-index">0${i+1}</span><span><strong>${esc(p.title)}</strong><small>${esc(p.description)}</small></span>${icon('arrow')}</button>`).join('');
  const categories=['All',...new Set(state.prompts.map(p=>p.category))];
  $('#prompt-filter').innerHTML=categories.map(c=>`<button class="${c===state.promptCategory?'active':''}" data-prompt-category="${esc(c)}">${esc(c)}</button>`).join('');
  $('#prompt-library').innerHTML=state.prompts.filter(p=>state.promptCategory==='All'||p.category===state.promptCategory).map(p=>`<article class="prompt-library-card"><span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><button class="text-button" data-use-prompt="${esc(p.id)}">Prepare prompt ${icon('arrow')}</button></article>`).join('');
  $('#prompt-mode-tag').textContent='Live agent · fixed case';
  $('#prompt-library-notice').textContent='Each starter prepares an editable request for 16–22 April 2019. Review it, then send it to the connected project.';
  $$('[data-use-prompt]').forEach(el=>el.addEventListener('click',()=>usePrompt(el.dataset.usePrompt)));
  $$('[data-prompt-category]').forEach(el=>el.addEventListener('click',()=>{state.promptCategory=el.dataset.promptCategory;renderPromptLibrary();}));
}
function usePrompt(id) {
  if(state.busy){toast('Finish the current turn before preparing another prompt.');return;}
  const prompt=state.prompts.find(p=>p.id===id);if(!prompt || typeof prompt.livePrompt!=='string')return;
  switchView('workspace');
  $('#prompt').value=prompt.livePrompt;
  $('#prompt').focus();$('#chat-form').scrollIntoView({behavior:'smooth',block:'center'});
  toast('Prompt prepared. Review the request, then press Send.');
}
async function refreshSkills() {
  const project=state.config.project,backend=state.config.backend_url;
  try {const response=await api('/api/skills?fresh=1');if(project!==state.config.project || backend!==state.config.backend_url || response.project!==project)return;state.skills=response;}
  catch(error){state.skills={count:null,skills:[],connected:false,project_found:false,detail:error.message};}
  const count=Number.isInteger(state.skills.count)?String(state.skills.count):'—';
  $('#skill-count').textContent=count;$('#skills-topbar-count').textContent=count;
  renderSkills();
}
function renderSkills() {
  const data=state.skills;
  const count=Number.isInteger(data?.count)?data.count:null;
  $('#skills-summary').innerHTML=`<div class="skill-total"><strong>${count===null?'—':count}</strong><span>skills loaded into<br><b>${esc(data?.project || state.config.project)}</b></span></div><p>${esc(data?.detail || 'Connect VISTA to inspect the selected project’s loaded skills.')}<br><small>The demo checklist below is separate from the live loaded count. Load skills in VISTA, then refresh here.</small></p>`;
  $('#skills-list').innerHTML=data?.skills?.length?data.skills.map((skill,i)=>`<article class="skill-card"><div class="skill-card-heading">${icon('skill')}<span class="tag loaded-tag">Loaded in project</span></div><h2>${esc(skill.name)}</h2><p>${esc(skill.description || 'Description unavailable from this VISTA version.')}</p><div class="skill-card-bottom"><span>${skill.hpc_jobs?.length?`${skill.hpc_jobs.length} job definition${skill.hpc_jobs.length===1?'':'s'} · ${esc(skill.hpc_jobs.join(', '))}`:'Instructions / scientific tools'}</span><button class="text-button" data-skill-index="${i}" ${skill.body?'':'disabled'}>View skill ↗</button></div></article>`).join(''):`<div class="empty-state">${count===0?'No skills are loaded into this project yet.':'The loaded-skill count is unavailable. Open VISTA and check the project connection.'}</div>`;
  $$('[data-skill-index]').forEach(el=>el.addEventListener('click',()=>{const skill=state.skills.skills[Number(el.dataset.skillIndex)];showDetails(skill.name,`<p>${esc(skill.description || '')}</p><div class="skill-instructions">${formatText(skill.body || '')}</div>`);}));
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
  // Location browsing is background context; it never changes the fixed demo case.
}
function selectNetworkSite(id) {
  if(!state.network?.sites.some(s=>s.id===id))return;
  state.focusSiteId=id;
  renderNetwork();
  toast('Background location selected. The April demo case and optional dam choice stay unchanged.');
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
