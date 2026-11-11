/* Repository metadata only. Paper files and account access remain in GitHub. */
(function(global){
  'use strict';
  const REPOSITORIES=new Set(['daliwang/HEADWATER','daliwang/water4energy_AgenticAmSC','daliwang/water4energy_projectPlan','daliwang/water4energy_experiment']);
  const STATUSES={repository_pdf:'Repository PDF',needs_repair:'Needs repair',reference:'Reference only',repository_note:'Project note'};
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let options={},root=null,catalog=null,query='',status='all';
  function safePath(value){return typeof value==='string'&&value.length>0&&value.length<=1024&&!value.startsWith('/')&&!/[\\\u0000-\u001f\u007f%?#:]/.test(value)&&value.split('/').every(p=>p&&p!=='.'&&p!=='..');}
  function repositoryURL(repo,commit,path){
    if(!REPOSITORIES.has(repo)||!/^[a-f0-9]{40}$/.test(commit||'')||!safePath(path))return null;
    try{return 'https://github.com/'+repo+'/blob/'+commit+'/'+path.split('/').map(encodeURIComponent).join('/');}catch{return null;}
  }
  function safeReferenceURL(value){
    try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['doi.org','arxiv.org','www.weather.gov','weather.gov'].includes(url.hostname)?url.href:null;}catch{return null;}
  }
  function normalizeEntry(entry){
    if(!entry||typeof entry.id!=='string'||!entry.id||typeof entry.title!=='string'||!entry.title.trim()||!Object.hasOwn(STATUSES,entry.status))return null;
    const source=repositoryURL(entry.repo,entry.commit,entry.sourcePath);
    if(!source||source!==entry.sourceUrl)return null;
    const pdf=entry.pdfPath?repositoryURL(entry.repo,entry.commit,entry.pdfPath):null;
    if(['repository_pdf','needs_repair'].includes(entry.status)&&(!pdf||pdf!==entry.pdfUrl||!entry.pdfPath.toLowerCase().endsWith('.pdf')||!Number.isInteger(entry.pdfBytes)||entry.pdfBytes<=0))return null;
    return {...entry,title:entry.title.trim(),authors:typeof entry.authors==='string'?entry.authors:'',tags:Array.isArray(entry.tags)?entry.tags.filter(t=>typeof t==='string'):[],year:Number.isInteger(entry.year)?entry.year:null,note:typeof entry.note==='string'?entry.note:'',sourceUrl:source,pdfUrl:pdf===entry.pdfUrl?pdf:null,doiUrl:safeReferenceURL(entry.doiUrl)};
  }
  function normalizeCatalog(value){
    if(value?.schema_version!==1||!Array.isArray(value.entries))throw new Error('The literature catalog format is unavailable.');
    const seen=new Set(),entries=[];
    for(const item of value.entries){const entry=normalizeEntry(item);if(entry&&!seen.has(entry.id)){seen.add(entry.id);entries.push(entry);}}
    return {...value,entries,rejected:value.entries.length-entries.length};
  }
  function filterEntries(entries,search='',selected='all'){
    const terms=fold(search).trim().split(/\s+/).filter(Boolean);
    return entries.filter(e=>(selected==='all'||e.status===selected)&&terms.every(term=>fold([e.id,e.title,e.shortTitle,e.authors,e.year,e.venue,e.repo,...(e.tags||[])].join(' ')).includes(term)));
  }
  function counts(entries){return Object.fromEntries(['all',...Object.keys(STATUSES)].map(s=>[s,s==='all'?entries.length:entries.filter(e=>e.status===s).length]));}
  function authorLabel(value){
    const names=String(value||'').split(' and ').filter(Boolean);
    return names.length>3?names.slice(0,3).map(n=>n.split(',')[0]).join(', ')+' et al.':names.join('; ');
  }
  function sizeLabel(bytes){return bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.round(bytes/1024)+' KB';}
  function card(entry){
    const meta=[authorLabel(entry.authors),entry.year,entry.venue].filter(Boolean).join(' · ');
    const file=entry.pdfUrl?`<a href="${escapeHTML(entry.pdfUrl)}" target="_blank" rel="noopener noreferrer">${entry.status==='needs_repair'?'Flagged PDF':'PDF'} ↗</a>`:'';
    const details=`<details class="literature-file-details"><summary>Details</summary><div><p class="literature-origin">${escapeHTML(entry.repo)} · ${escapeHTML(entry.kind||'paper')}<br><code>${escapeHTML(entry.pdfPath||entry.sourcePath)}</code>${entry.pdfUrl?` · ${sizeLabel(entry.pdfBytes)}`:''}</p>${entry.tags.length?`<p class="literature-tags">${entry.tags.map(escapeHTML).join(' · ')}</p>`:''}${entry.note&&entry.status!=='needs_repair'?`<p class="literature-note">${escapeHTML(entry.note)}</p>`:''}</div></details>`;
    return `<article class="literature-card ${entry.status}"><div class="literature-row-heading"><h2>${escapeHTML(entry.title)}</h2><span class="literature-status">${escapeHTML(STATUSES[entry.status])}</span></div>${entry.status==='needs_repair'&&entry.note?`<p class="literature-note">${escapeHTML(entry.note)}</p>`:''}<div class="literature-row-footer">${meta?`<p class="literature-citation">${escapeHTML(meta)}</p>`:''}<div class="literature-links">${file}${entry.doiUrl?`<a href="${escapeHTML(entry.doiUrl)}" target="_blank" rel="noopener noreferrer">${entry.doi?'DOI':'Source'} ↗</a>`:''}<a href="${escapeHTML(entry.sourceUrl)}" target="_blank" rel="noopener noreferrer">${entry.status==='repository_note'?'Review note':'Record'} ↗</a></div>${details}</div></article>`;
  }
  function renderResults(){
    if(!root||!catalog)return;
    const found=filterEntries(catalog.entries,query,status),total=counts(catalog.entries);
    root.querySelector('[data-literature-count]').textContent=`${found.length} of ${catalog.entries.length} entries`;
    root.querySelectorAll('[data-literature-filter]').forEach(button=>{const active=button.dataset.literatureFilter===status;button.setAttribute('aria-pressed',String(active));});
    root.querySelector('[data-literature-results]').innerHTML=found.length?found.map(card).join(''):'<div class="empty-state">No matching literature. Try a title, author, year or topic.</div>';
    root.querySelector('[data-literature-summary]').innerHTML=[['repository_pdf','Repository PDFs'],['needs_repair','Need repair'],['reference','References'],['repository_note','Review note']].map(([key,label])=>`<div><strong>${total[key]}</strong><span>${label}</span></div>`).join('');
  }
  function render(){
    if(!root||!catalog)return;
    const total=counts(catalog.entries),shelf=catalog.entries.filter(e=>e.repo==='daliwang/HEADWATER'&&e.pdfUrl);
    if(!root.querySelector('[data-literature-shell]')){
      root.innerHTML=`<div data-literature-shell><div class="literature-summary" data-literature-summary></div><div class="literature-snapshot"><p><strong>HEADWATER shelf:</strong> ${shelf.length} tracked PDF files; repository notes flag ${shelf.filter(e=>e.status==='needs_repair').length} for repair. Pending citation extensions are listed separately. Repository presence does not establish VISTA indexing or scientific validity.</p><span>Snapshot checked ${escapeHTML(catalog.checkedOn||'date unavailable')}</span></div><div class="literature-toolbar"><label><span class="sr-only">Search literature</span><input type="search" data-literature-search placeholder="Search title, author, year or topic…" aria-label="Search literature"></label><button type="button" class="secondary-button" data-literature-reload>Reload catalog ↻</button></div><div class="literature-filters" role="group" aria-label="Literature availability">${[['all','All'],...Object.entries(STATUSES)].map(([key,label])=>`<button type="button" data-literature-filter="${key}" aria-pressed="${status===key}">${escapeHTML(label)} <span>${total[key]}</span></button>`).join('')}</div><p class="literature-result-count" data-literature-count role="status" aria-live="polite"></p><div class="literature-grid" data-literature-results></div></div>`;
      const search=root.querySelector('[data-literature-search]');search.value=query;
      search.addEventListener('input',()=>{query=search.value;renderResults();});
      root.querySelectorAll('[data-literature-filter]').forEach(button=>button.addEventListener('click',()=>{status=button.dataset.literatureFilter;renderResults();}));
      root.querySelector('[data-literature-reload]').addEventListener('click',load);
    }
    renderResults();
  }
  async function load(){
    if(!root)return false;
    root.setAttribute('aria-busy','true');
    try{const value=await options.api('/data/literature.json');catalog=normalizeCatalog(value);root.innerHTML='';render();return true;}
    catch(error){root.innerHTML=`<div class="empty-state"><strong>Literature catalog unavailable.</strong><p>${escapeHTML(error?.message||'Reload the local package.')}</p><button type="button" class="secondary-button" data-literature-retry>Try again</button></div>`;root.querySelector('[data-literature-retry]').addEventListener('click',load);return false;}
    finally{root.setAttribute('aria-busy','false');}
  }
  async function init(settings={}){options=settings;root=global.document?.querySelector('#literature-library');if(!root)return false;if(typeof options.api!=='function'){root.textContent='The literature catalog reader is unavailable.';return false;}return load();}
  const api={init,render,reload:load,normalizeEntry,normalizeCatalog,filterEntries,counts,repositoryURL,safeReferenceURL};
  global.TVALiteratureLibrary=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
