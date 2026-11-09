/* An explorable explanation, separate from agent execution and scientific results. */
(function (global) {
  'use strict';
  const FIXED_CASE=Object.freeze({start:'2019-04-16',end:'2019-04-22',issued:'2019-04-15'});
  const PROJECT='Water4Energy-TVA-agent-loop';
  const OUTPUT_PREFIX='/api/vista/projects/'+encodeURIComponent(PROJECT)+'/outputs/';
  const SOURCE_STEPS=new Set(['ledger','proposer','critic','referee','human']);
  const CASE_HEADER='Case: 16–22 April 2019, issued 15 April 2019, in '+PROJECT+'.';
  const FALLBACK_CONTEXT=CASE_HEADER+' Start from the HEADWATER experiment ledger and allowlisted source files. Treat temperature and precipitation as the frozen det_v2_soil_k9 realization, runoff as ERA5 observed sro with no HEADWATER runoff forecast, and downscaling as the existing frozen Trial 0 1° to 0.25° comparison scored 7 September 2026. Do not submit jobs, execute training commands, retrain, download ERA5, change settings, or invent figures or scores. Report missing files or skills explicitly. Read and cite saved source files; do not claim a role ran or approval was granted without recorded evidence.';
  const STEPS=Object.freeze([
    {id:'ledger',label:'Read records',title:'Read the ledger',role:'Ledger',promptId:'ledger',
      description:'Start with what was already tested. Separate scored, closed and blocked experiments from questions that are still open.',
      expected:'Ledger rows and cited source files',
      question:'What have we already learned for 16–22 April 2019?',
      focus:'Use lab.ledger and lab.board to explain what the saved ledger already establishes and which questions remain open. Consult local literature only for those open gaps.'},
    {id:'proposer',label:'Propose an idea',title:'Propose an idea',role:'Proposer',promptId:'design',
      description:'Turn an open question into a testable idea. Explain what would change from an experiment that was already tried.',
      expected:'A proposed test and its stated difference',
      question:'What testable idea addresses an open gap in this case?',
      focus:'Focus on the Proposer. Use lab.design, the April charge and ledger to inspect a saved proposal, if present. Identify its hypothesis, proposed test and meaningful difference from already-tested runs. Distinguish a proposed protocol from a reviewed one. If no proposal artifact exists, report that rather than claiming the Proposer ran.'},
    {id:'critic',label:'Challenge it',title:'Challenge the idea',role:'Critic',promptId:'design',
      description:'Check the idea against the evidence. An already-tested or blocked proposal needs a meaningful change before it can be reconsidered.',
      expected:'Recorded objections and missing evidence',
      question:'Where could this proposal be wrong, or repeat a tested idea?',
      focus:'Focus on the Critic. Inspect saved proposal and Critic artifacts, if present. Check the ledger for an already-tested or blocks_reproposal experiment without a meaningful stated change. Explain recorded objections, unsupported claims and missing evidence. Do not invent a critique or claim the Critic ran when its saved artifact is absent.'},
    {id:'referee',label:'Review evidence',title:'Review the evidence',role:'Referee',promptId:'design',
      description:'Weigh the proposal and critique together. Read the recorded review to see which protocol is supported and what remains unresolved.',
      expected:'A recorded review status and unresolved tests',
      question:'What does the saved review support, and what is unresolved?',
      focus:'Focus on the Referee. Inspect saved proposal, Critic and Referee artifacts, if present. Explain the recorded review status, supported protocol and unresolved tests. Cite each source. Do not infer approval from a proposal, invent a Referee decision, or claim a multi-agent review ran without saved evidence. Human training approval remains separate.'},
    {id:'human',label:'Human review',title:'Keep a person in the loop',role:'Human gate',promptId:'commands',
      description:'A person decides whether future training may proceed. Here, inspect the existing command and its source without executing it.',
      expected:'Command references for a person to review',
      question:'Which existing commands would a person need to review?',
      focus:'Focus on human review. Use lab.show_command to display existing 9×9 training and Trial 0 scoring command/config references and their provenance. Explain the human training-flag approval gate. Print commands only; do not execute them, submit jobs, set an approval flag or treat this question as authorization.'},
    {id:'evidence',label:'Inspect results',title:'Inspect the saved evidence',role:'Evidence',promptId:'realization',
      description:'Read frozen temperature and precipitation results, observed ERA5 runoff (no HEADWATER forecast), and the frozen Trial 0 downscale comparison. Findings return to the ledger.',
      expected:'Existing figures, score files and remaining gaps',
      question:'What do the saved April figures show, and what remains unknown?',
      focus:'Use lab.realize and downscale.scorecard to inspect existing case figures and their source JSON. Temperature and precipitation are frozen det_v2_soil_k9 results. Runoff is observed ERA5 sro; its HEADWATER forecast is unavailable. Downscaling is the frozen Trial 0 1° to 0.25° comparison, not a new training run. Identify which findings inform the ledger and what is still missing. Do not draw substitute figures, alter scores or record a new experiment as completed.'}
  ].map(step=>Object.freeze(step)));
  const escapeHTML=value=>String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let options=null,root=null,selectedId='ledger',researchSources=[];

  function matchesCase(definition) {
    return Boolean(definition && definition.project===PROJECT && definition.case && Object.keys(FIXED_CASE).every(key=>definition.case[key]===FIXED_CASE[key]));
  }
  function requestFor(id,settings={}) {
    const step=STEPS.find(item=>item.id===id);
    if(!step || !matchesCase(settings.caseDefinition))return null;
    const catalog=Array.isArray(settings.prompts)?settings.prompts:[];
    const candidate=catalog.find(prompt=>prompt?.id===step.promptId)?.livePrompt;
    // Keep the supplied catalog context only when it belongs to this fixed case.
    const base=typeof candidate==='string' && candidate.startsWith(CASE_HEADER) && candidate.includes('Do not submit jobs')?candidate:FALLBACK_CONTEXT;
    return step.question+'\n\n'+base+'\n\nGuide focus — '+step.role+': '+step.focus;
  }
  function validatedResearchSources(entries,definition) {
    if(!matchesCase(definition) || !Array.isArray(entries))return [];
    const seen=new Set();
    return entries.filter(entry=>{
      if(!entry || !SOURCE_STEPS.has(entry.step) || typeof entry.name!=='string' || typeof entry.url!=='string')return false;
      const name=entry.name;
      if(!name || name.length>1024 || name.startsWith('/') || /[\\\u0000-\u001f\u007f%?#:]/.test(name) || name.split('/').some(part=>!part || part==='.' || part==='..'))return false;
      let expected;
      try {expected=OUTPUT_PREFIX+name.split('/').map(encodeURIComponent).join('/');}catch{return false;}
      if(entry.url!==expected || seen.has(entry.step+'\n'+expected))return false;
      seen.add(entry.step+'\n'+expected);return true;
    }).map(entry=>({step:entry.step,name:entry.name,url:entry.url}));
  }
  function renderSources() {
    if(!root)return;
    const container=root.querySelector('[data-guide-sources]');
    if(!container)return;
    if(!matchesCase(options?.caseDefinition))researchSources=[];
    const sources=researchSources.filter(source=>source.step===selectedId);
    container.hidden=!sources.length;
    container.innerHTML=sources.length?`<div class="hypothesis-guide-source-heading"><h3>Saved source${sources.length===1?'':'s'}</h3><span>April case</span></div>${sources.map(source=>`<a class="hypothesis-guide-source-link" href="${escapeHTML(source.url)}" download><span>${escapeHTML(source.name)}</span><span aria-hidden="true">↧</span></a>`).join('')}`:'';
  }
  function setResearchSources(entries) {
    // The case adapter supplies only files from its matched manifest. Validate
    // the project-scoped URL again before retaining or displaying any link.
    researchSources=validatedResearchSources(entries,options?.caseDefinition);
    renderSources();return researchSources.length;
  }
  function renderDetail(announce=false) {
    const step=STEPS.find(item=>item.id===selectedId);
    const canPrepare=matchesCase(options.caseDefinition) && typeof options.preparePrompt==='function';
    root.querySelectorAll('[data-guide-step]').forEach(button=>{
      const selected=button.dataset.guideStep===selectedId;
      button.setAttribute('aria-pressed',String(selected));
      button.classList.toggle('selected',selected);
    });
    root.querySelector('[data-guide-detail]').innerHTML=`<div class="hypothesis-guide-detail-heading"><h3 id="hypothesis-guide-detail-title">${escapeHTML(step.title)}</h3><span>${escapeHTML(step.role)}</span></div><p class="hypothesis-guide-explanation">${escapeHTML(step.description)}</p><p class="hypothesis-guide-expected"><span>Look for</span> ${escapeHTML(step.expected)}</p><div class="hypothesis-guide-question"><span class="hypothesis-guide-question-label">A question to try</span><p>${escapeHTML(step.question)}</p><div class="hypothesis-guide-actions"><button type="button" data-guide-prepare${canPrepare?'':' disabled'}>Use this question <span aria-hidden="true">↗</span></button>${step.id==='evidence' && typeof options.showFigures==='function'?'<button type="button" class="hypothesis-guide-figures" data-guide-figures>View case figures</button>':''}</div></div>${canPrepare?'':`<p class="hypothesis-guide-unavailable">${matchesCase(options.caseDefinition)?'The conversation composer is unavailable.':'Questions are available for the fixed 16–22 April 2019 demo case.'}</p>`}`;
    root.querySelector('[data-guide-prepare]').addEventListener('click',()=>{
      const request=requestFor(selectedId,options);
      if(request && typeof options.preparePrompt==='function')options.preparePrompt(request,step.title);
    });
    const figures=root.querySelector('[data-guide-figures]');
    if(figures)figures.addEventListener('click',()=>options.showFigures());
    renderSources();
    if(announce)root.querySelector('[data-guide-announcement]').textContent=step.title+' selected. '+step.description;
  }
  function selectStep(id) {
    if(!root || !STEPS.some(step=>step.id===id))return false;
    selectedId=id;renderDetail(true);return true;
  }
  function init(settings={}) {
    root=global.document?.querySelector('#hypothesis-guide');
    if(!root)return false;
    options=settings;selectedId='ledger';researchSources=[];
    root.innerHTML=`<section class="hypothesis-guide-overview" aria-label="Explore the workflow"><header class="hypothesis-guide-heading"><h2>How hypothesis lab works</h2><p>Turn a question into a testable, reviewed idea.</p></header><div class="hypothesis-guide-map"><svg class="hypothesis-guide-connectors" viewBox="0 0 336 174" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><marker id="hypothesis-guide-arrow" viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6Z"/></marker></defs><g marker-end="url(#hypothesis-guide-arrow)"><path d="M148 26H186"/><path d="M252 46V60"/><path d="M188 80H150"/><path d="M84 100V114"/><path d="M148 134H186"/><path class="hypothesis-guide-return" d="M252 154V166H7V26H18"/></g></svg><div class="hypothesis-guide-nodes" role="group" aria-label="Explore the six steps of hypothesis lab">${STEPS.map((step,index)=>`<button type="button" class="hypothesis-guide-node hypothesis-guide-node-${escapeHTML(step.id)}" data-guide-step="${escapeHTML(step.id)}" aria-pressed="${index===0?'true':'false'}" aria-controls="hypothesis-guide-detail" aria-label="${escapeHTML(step.title+' — '+step.role)}"><span class="hypothesis-guide-node-number" aria-hidden="true">${index+1}</span><span class="hypothesis-guide-node-copy"><strong>${escapeHTML(step.label)}</strong><small>${escapeHTML(step.role)}</small></span></button>`).join('')}</div><span class="hypothesis-guide-return-label">Findings return to the ledger</span></div><p class="hypothesis-guide-caption">Explore the workflow · selection does not run agents</p></section><section id="hypothesis-guide-detail" class="hypothesis-guide-detail" data-guide-detail aria-labelledby="hypothesis-guide-detail-title"></section><section class="hypothesis-guide-sources" data-guide-sources aria-label="Saved files for the selected step" hidden></section><p class="sr-only" data-guide-announcement role="status" aria-live="polite" aria-atomic="true"></p>`;
    root.querySelectorAll('[data-guide-step]').forEach(button=>button.addEventListener('click',()=>selectStep(button.dataset.guideStep)));
    renderDetail();return true;
  }
  const api={init,setResearchSources,steps:STEPS,requestFor,matchesCase,validatedResearchSources};
  global.TVAHypothesisGuide=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
