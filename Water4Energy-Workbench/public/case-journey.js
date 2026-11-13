/* Teaching and question preparation only. Execution still belongs to explicit Send. */
(function(global){
  'use strict';
  const HEADER='Case: 16–22 April 2019, issued 15 April 2019, in Water4Energy-TVA-agent-loop.';
  const VIEWS=new Set(['introduction','network','workspace','headwater']);
  const QUESTIONS=Object.freeze([
    {id:'ledger',question:'What did the ledger already establish for 16–22 April 2019?',hint:'Start with scored, closed and still-open work.'},
    {id:'realization',question:'What do the saved April temperature and precipitation figures show?',hint:'Read the existing HEADWATER results and their sources.'},
    {id:'downscale',question:'How does frozen Trial 0 compare with bilinear for this April case?',hint:'Inspect the existing high-resolution comparison.'},
    {id:'runoff',question:'Why is the April runoff panel an observation rather than a forecast?',hint:'Distinguish ERA5 runoff from an unavailable prediction.'},
    {id:'design',question:'Which open April gap still needs a reviewed test?',hint:'Separate a proposed idea from recorded review and approval.'},
    {id:'commands',question:'Which existing commands would a person need to review before any future run?',hint:'Display command references without executing them.'}
  ].map(Object.freeze));
  const GUARD='Do not submit jobs, execute training commands, retrain, download data, change settings, or invent figures or scores. Report missing files. A person approves the next training run.';
  const LAB={
    ledger:{
      reading:'On 24 October the ledger had already settled the inputs. Root-zone soil had moved the valley to 0.841 K. The 9×9 neighborhood was 0.767 K. Indexes and season masks were closed.',
      file:'Pack: runs/20261024_track_review. The ledger is the prior, not a new idea.',
      question:'What had the ledger already settled before the 24 October review?',
      focus:'Focus on the ledger. Report the scored soil and 9×9 rows, and name what was already closed.'
    },
    proposer:{
      reading:'One test. Put root-zone soil on the 2° Reslim residual. Same files, same loss, same split. The stated change is the residual inputs.',
      file:'The proposed run is det_v2_reslim_patch2_soilresid.',
      question:'What was the one proposed change on 24 October?',
      focus:'Focus on the Proposer. Name the one change and what stayed fixed.'
    },
    critic:{
      reading:'Novelty passed. The delta is the residual inputs. A closed or blocked experiment is not offered again without that stated change. A replay of the 9×9, a valley weight, or all-month Niño is rejected.',
      file:'critique.json in the 24 October pack. Result: pass.',
      question:'What did the Critic accept, and what did it reject?',
      focus:'Focus on the Critic. Novelty passed because the residual inputs were the stated change.'
    },
    referee:{
      reading:'One brief. Launch that residual run and no other. The kill test is a four-week valley mean below 0.767 K and January at or under 0.597 K. Miss either one and the Reslim temperature track stops.',
      file:'referee_brief.md. This review does not start the training.',
      question:'What kill test did the referee write?',
      focus:'Focus on the Referee. State the one approved run and the kill test. Do not treat the brief as a started job.'
    },
    human:{
      reading:'A person accepts the brief, then that one run may start. The review itself does not set the training flag and does not launch the job.',
      file:'The human line in the referee brief: accept, then launch E_patch2_soil_residual and no other run.',
      question:'What did a person have to approve before that run?',
      focus:'Focus on the human gate. The brief is a recommendation. Print no command as if it were already running.'
    },
    evidence:{
      reading:'The kill test fired. Four-week valley temperature is 0.955 K, not below 0.767 K. January is 1.103 K. Reslim temperature variants stop. The 9×9 soil CNN stays the valley model. April at 0.904 K and July at 1.153 K are ahead of the 1979–2017 week. That progress does not reopen the track.',
      file:'RESIDUAL_RESULT.md. The score returned to the ledger.',
      question:'What did the residual run return, and what stayed closed?',
      focus:'Focus on the saved result. Report 0.955 K and the January miss. Do not reopen the Reslim temperature track.'
    }
  };
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let options={},selected='ledger',bound=false,context='headwater';
  function questionRequest(id,settings=options){
    const question=QUESTIONS.find(q=>q.id===id),guide=settings.guide||global.TVAHypothesisGuide;
    if(!question||!guide?.matchesCase(settings.caseDefinition))return null;
    const prompt=(Array.isArray(settings.prompts)?settings.prompts:[]).find(p=>p?.id===id)?.livePrompt;
    if(typeof prompt!=='string'||!prompt.startsWith(HEADER)||!prompt.includes('Do not submit jobs'))return null;
    return question.question+'\n\n'+prompt;
  }
  function headwaterApi(){return global.Water4EnergyWorkbench;}
  function welcomeHTML(){
    if(context==='lab'){
      const list=Object.keys(LAB).slice(0,3).map(id=>({id,question:LAB[id].question}));
      return `<div class="welcome"><h3>Ask about the 24 October cycle</h3><p>Choose a question to put an editable request in the message box. Review it, then Send.</p><div class="welcome-questions">${list.map(q=>`<button type="button" data-lab-question="${esc(q.id)}">${esc(q.question)}<span aria-hidden="true">↗</span></button>`).join('')}</div><p class="welcome-note">The chat asks about the saved pack. It does not start a role or a job.</p></div>`;
    }
    if(context==='tva')return `<div class="welcome"><h3>Start with the April evidence</h3><p>Read what was already tested, then inspect the saved figures. Choose a question to put an editable request in the message box.</p><div class="welcome-questions">${QUESTIONS.slice(0,3).map(q=>`<button type="button" data-case-question="${q.id}">${esc(q.question)}<span aria-hidden="true">↗</span></button>`).join('')}</div><p class="welcome-note">Review the request, then Send. Cited files and figures appear on the right.</p><button type="button" class="text-button case-method-link" data-journey-nav="introduction">Revisit the method ↗</button></div>`;
    const list=(headwaterApi()?.questions||[]).slice(0,3);
    return `<div class="welcome"><h3>Start from the ledger</h3><p>Choose a question to put an editable request in the message box.</p><div class="welcome-questions">${list.map(q=>`<button type="button" data-hw-question="${esc(q.id)}">${esc(q.question)}<span aria-hidden="true">↗</span></button>`).join('')}</div><p class="welcome-note">Review the request, then Send.</p></div>`;
  }
  function renderQuestions(){
    const questions=global.document?.querySelector?.('#case-question-controls');
    if(!questions)return;
    if(context==='tva'){
      questions.innerHTML=`<details><summary>Questions for this case</summary><div class="case-question-list">${QUESTIONS.map(q=>`<button type="button" data-case-question="${q.id}"${questionRequest(q.id)?'':' disabled'}><strong>${esc(q.question)}</strong><span>${esc(q.hint)}</span></button>`).join('')}</div></details>`;
      return;
    }
    if(context==='lab'){
      const list=Object.keys(LAB).map(id=>({id,question:LAB[id].question,hint:LAB[id].file}));
      questions.innerHTML=`<details><summary>Questions for the 24 October cycle</summary><div class="case-question-list">${list.map(q=>`<button type="button" data-lab-question="${esc(q.id)}"><strong>${esc(q.question)}</strong><span>${esc(q.hint)}</span></button>`).join('')}</div></details>`;
      return;
    }
    const list=headwaterApi()?.questions||[];
    questions.innerHTML=`<details><summary>Questions for HEADWATER development</summary><div class="case-question-list">${list.map(q=>`<button type="button" data-hw-question="${esc(q.id)}"><strong>${esc(q.question)}</strong><span>${esc(q.hint)}</span></button>`).join('')}</div></details>`;
  }
  function applyContext(){
    const doc=global.document;
    if(!doc?.querySelector)return;
    const subtitle=doc.querySelector('#case-lab-subtitle');
    if(subtitle)subtitle.textContent=context==='tva'?'TVA · 16–22 April 2019':context==='lab'?'Hypothesis lab · 24 October':'HEADWATER development';
    doc.querySelectorAll('[data-case-context]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.caseContext===context));
    });
    const guide=doc.querySelector('#hypothesis-guide'),pane=doc.querySelector('#headwater-case-pane'),labPane=doc.querySelector('#lab-case-pane');
    if(guide)guide.hidden=context!=='tva';
    if(pane)pane.hidden=context!=='headwater';
    if(labPane)labPane.hidden=context!=='lab';
    const box=doc.querySelector('#chat-messages');
    if(box && !box.querySelector('.message'))box.innerHTML=welcomeHTML();
    renderQuestions();
  }
  function setContext(next){
    if(next!=='tva' && next!=='headwater' && next!=='lab')return false;
    context=next;applyContext();return true;
  }
  function workflowHTML(steps){
    return `<div class="hypothesis-guide-map intro-workflow-map"><svg class="hypothesis-guide-connectors" viewBox="0 0 336 210" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><marker id="intro-workflow-arrow" viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6Z"/></marker></defs><g marker-end="url(#intro-workflow-arrow)"><path d="M148 32H186"/><path d="M252 58V72"/><path d="M188 98H150"/><path d="M84 124V138"/><path d="M148 164H186"/><path class="hypothesis-guide-return" d="M252 190V204H7V32H18"/></g></svg><div class="hypothesis-guide-nodes" role="group" aria-label="Explore the hypothesis method">${steps.map((s,i)=>`<button type="button" class="hypothesis-guide-node hypothesis-guide-node-${s.id}" data-intro-step="${s.id}" aria-pressed="${s.id===selected}" aria-controls="intro-step-detail" aria-label="${esc(s.title+' — '+s.role)}"><span class="hypothesis-guide-node-number" aria-hidden="true">${i+1}</span><span class="hypothesis-guide-node-copy"><strong>${esc(s.label)}</strong><small>${esc(s.role)}</small></span></button>`).join('')}</div><span class="hypothesis-guide-return-label">Findings return to the ledger</span></div>`;
  }
  function labRequest(id){
    const item=LAB[id];
    if(!item)return null;
    return item.question+'\n\nProject: Water4Energy. Context: Hypothesis lab. Example: HEADWATER/hypothesis_lab/runs/20261024_track_review. '+item.focus+'\n\n'+GUARD;
  }
  function renderStep(){
    const guide=options.guide,step=guide?.steps.find(s=>s.id===selected),example=LAB[selected],mount=global.document?.querySelector('#intro-step-detail');
    if(!step||!example||!mount)return;
    global.document.querySelectorAll('[data-intro-step]').forEach(button=>{
      const active=button.dataset.introStep===selected;
      button.setAttribute('aria-pressed',String(active));button.classList.toggle('selected',active);
    });
    const ready=typeof options.preparePrompt==='function'&&Boolean(labRequest(selected));
    mount.innerHTML=`<h3>${esc(step.title)}</h3><p>${esc(example.reading)}</p><p class="intro-case-link">${esc(example.file)}</p><p class="intro-question">“${esc(example.question)}”</p><button type="button" class="text-button" data-intro-prepare${ready?'':' disabled'}>Ask this in the chat</button>`;
  }
  function selectStep(id){
    if(!options.guide?.steps.some(s=>s.id===id))return false;
    selected=id;renderStep();return true;
  }
  function setView(view){
    global.document?.querySelectorAll('[data-journey-nav]').forEach(button=>{
      if(button.dataset.journeyNav===view)button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }
  function dispatch(event){
    const target=event.target?.closest?.('[data-journey-nav],[data-intro-step],[data-intro-prepare],[data-case-question],[data-case-context],[data-open-case],[data-hw-question],[data-lab-question]');
    if(!target||target.disabled)return;
    const host=target.closest?.('#view-headwater, #headwater-workflow');
    if(host && (host.id==='view-headwater' || host.id==='headwater-workflow'))return;
    if(target.dataset.caseContext){setContext(target.dataset.caseContext);return;}
    if(target.dataset.openCase){setContext(target.dataset.openCase);options.navigate?.('workspace');return;}
    if(target.dataset.journeyNav){if(target.dataset.journeyNav==='headwater')setContext('headwater');if(VIEWS.has(target.dataset.journeyNav))options.navigate?.(target.dataset.journeyNav);return;}
    if(target.dataset.introStep){selectStep(target.dataset.introStep);return;}
    if(target.dataset.hwQuestion){setContext('headwater');const text=headwaterApi()?.requestFor?.(target.dataset.hwQuestion);if(text)options.preparePrompt?.(text);return;}
    if(target.dataset.labQuestion){setContext('lab');const text=labRequest(target.dataset.labQuestion);if(text)options.preparePrompt?.(text);return;}
    if(target.hasAttribute('data-intro-prepare')){setContext('lab');const request=labRequest(selected);if(request)options.preparePrompt?.(request);return;}
    setContext('tva');
    const request=questionRequest(target.dataset.caseQuestion);
    if(request)options.preparePrompt?.(request);
  }
  function init(settings={}){
    options=settings;selected='ledger';
    const doc=global.document,mount=doc?.querySelector('#intro-workflow');
    if(!mount||!settings.guide?.steps)return false;
    mount.innerHTML=workflowHTML(settings.guide.steps);renderStep();
    if(!bound){doc.addEventListener('click',dispatch);bound=true;}
    setContext('headwater');setView('headwater');return true;
  }
  const api={init,setView,selectStep,setContext,questionRequest,welcomeHTML,questions:QUESTIONS,context:()=>context};
  global.TVACaseJourney=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
