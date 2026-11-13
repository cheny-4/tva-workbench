/* Project workflow for the Water4Energy workbench. Cards prepare requests. They do not start jobs. */
(function (global) {
  'use strict';
  const GUARD = 'Do not submit jobs, execute training commands, retrain, download data, change settings, or invent figures or scores. Report missing files. A person approves the next training run.';
  const QUESTIONS = Object.freeze([
    {id:'scored', question:'What has the ledger already scored?', hint:'Start from the records already on disk.', focus:'Use lab.ledger and lab.board. Report scored, closed, and open rows.'},
    {id:'brief', question:'What is the one change in the current brief?', hint:'One change, then a person picks the experiment.', focus:'Read the saved referee brief and name the one change. A brief is not a started job.'},
    {id:'frontier', question:'What did Frontier already prepare?', hint:'153 weekly examples, then the root-zone soil copy.', focus:'Report the committed example count and the root-zone soil copy. The dates and the destination were already written down.'},
    {id:'board', question:'Which board rows are ready, and which training flags are off?', hint:'Ready is not a start. The flag stays with a person.', focus:'Read the board. Name ready rows and say which training flags are off.'},
    {id:'score', question:'What did the 2019 valley score return?', hint:'The number comes back to the ledger.', focus:'Read the saved 2019 valley score for det_v2_soil_k9 and the 1979–2017 week stored in the example files.'}
  ].map(Object.freeze));
  const LUX_RUNS = Object.freeze([
    ['det_v2_reslim_patch2_obs', 'Reslim. Attention is over patches and variables. It does not run along the 90 days.'],
    ['det_v2_soil_k9_obs', '9×9 soil CNN'],
    ['lux_rocm/valley_cnn', '9×9 CNN'],
    ['lux_rocm/band', '9×9 CNN plus the 10–20 day band'],
    ['lux_rocm/daily90', 'Named as a Lux score. The trainer script in this tree is still the 9×9 CNN.'],
    ['lux_rocm/tcwv', '9×9 CNN, column water vapour'],
    ['lux_rocm/z500', '9×9 CNN, 500 hPa height'],
    ['lux_rocm/z850', '9×9 CNN, 850 hPa height'],
    ['lux_rocm/layer4', '9×9 CNN, soil-water layer 4']
  ]);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let options = {}, selected = 'hypothesis', bound = false;

  function requestFor(id) {
    const item = QUESTIONS.find(q => q.id === id);
    if (!item) return null;
    return item.question + '\n\nProject: Water4Energy. Context: HEADWATER development. ' + item.focus + '\n\n' + GUARD;
  }
  function luxHTML() {
    return `<article class="hw-lux"><h3>Lux run names</h3><p>Nine directories are listed as scored on Lux. Their score files are on Lux, not in this checkout.</p><table><thead><tr><th>Run on Lux</th><th>What it is</th></tr></thead><tbody>${LUX_RUNS.map(([name, what]) => `<tr><td><code>${esc(name)}</code></td><td>${esc(what)}</td></tr>`).join('')}</tbody></table></article>`;
  }
  function downscaleHTML() {
    return `<article class="hw-downscale"><p>April 2019. A 1° field is drawn at about 4 km, one twenty-fourth of a degree, over the valley. The left map is the refined field, the middle map is Daymet/ERA5, and the right map is the difference. The top row is the monthly mean. The bottom row is the daily 95th percentile. These are the 2019 downscaling results. They are not a claim that the HEADWATER forecast and this downscaler are already one pipeline.</p><figure><img src="/assets/april_2019_tmax_refine.png" alt="April 2019 daily maximum temperature, 1 degree refined to about 4 kilometers, beside Daymet/ERA5"><figcaption>April 2019 daily maximum temperature. REFINED, 1° to about 4 km, 30 days.</figcaption></figure><figure><img src="/assets/april_2019_prcp_refine.png" alt="April 2019 precipitation, 1 degree refined to about 4 kilometers, beside Daymet/ERA5"><figcaption>April 2019 precipitation. Same layout. Mean above, the heavy days below.</figcaption></figure></article>`;
  }
  function scoreHTML() {
    return `<article class="hw-score"><p>The 2019 valley number returns to the ledger, and the next brief is written from that ledger. These two maps are the Reslim comparison: reference, observed, the 9×9, Reslim 6°, and Reslim 2°. Reslim attends over spatial patches and over variables. The 90 days enter as the channels of each variable. The four-week valley temperature for the 9×9 is <strong>0.77°C</strong> against <strong>0.86°C</strong> for the 1979–2017 week stored in the example files. Exact figures: 0.767 K and 0.861 K. Reslim 6° is 1.015 K and Reslim 2° is 1.124 K on that same four-week mean.</p><figure><img src="/assets/tva_t2m_2019_reslim.png" alt="2019 week-ahead temperature: reference, observed, 9×9, Reslim 6°, Reslim 2°"><figcaption>2019 week-ahead 2 m temperature. Columns: reference, observed, 9×9, Reslim 6°, Reslim 2°.</figcaption></figure><figure><img src="/assets/tva_precip_2019_reslim.png" alt="2019 week-ahead precipitation: reference, observed, 9×9, Reslim 6°, Reslim 2°"><figcaption>2019 week-ahead precipitation. Same columns. 16–22 April 2019 is the second row: observed valley 55.9 mm, the 1979–2017 week 24.4 mm.</figcaption></figure></article>`;
  }
  function detailHTML(id) {
    if (id === 'hypothesis') return `<h3>Hypothesis</h3><p>Ledger, then Proposer, Critic, Referee. The lab starts from what was already scored.</p><button type="button" class="text-button" data-hw-nav="introduction">Open Hypothesis lab</button>`;
    if (id === 'data') return `<h3>Data</h3><p>Frontier. <strong>153</strong> weekly examples, then the root-zone soil copy. The dates and the destination were already written down. The dataset agent runs that committed job.</p>`;
    if (id === 'design') return `<h3>Design</h3><p>The brief names one change. A person picks that experiment and sets the training flag.</p><button type="button" class="text-button" data-hw-question="brief">Ask this in the chat</button>`;
    if (id === 'execution') return `<h3>Execution</h3><p>The same brief is the job. The H100s (<code>ccsi-gpu</code>) are where <code>det_v2_soil_k9</code> was trained. Lux holds the nine scored run directories below.</p>${luxHTML()}`;
    if (id === 'score') return `<h3>Score</h3>${scoreHTML()}<button type="button" class="text-button" data-hw-question="score">Ask this in the chat</button>`;
    if (id === 'downscale') return `<h3>Downscaling example</h3>${downscaleHTML()}`;
    return '';
  }
  const STAGES = [['hypothesis','Hypothesis'],['data','Data'],['design','Design'],['execution','Execution'],['score','Score'],['downscale','Downscaling']];
  function stageButtons() {
    return STAGES.map(([id, label], i) => `<button type="button" class="hw-stage${id === selected ? ' selected' : ''}" data-hw-stage="${id}" aria-pressed="${id === selected}"><span>${i + 1}</span>${label}</button>`).join('');
  }
  function boardHTML() {
    const rows = [
      ['April rain rank', 'Frontier', 'Reads the soil files. No GPU.'],
      ['Lux device check', 'Lux, one MI355X', 'Prints the device name. Does not train.'],
      ['Column water E_tcwv_9x9', 'Designed', 'Waits on the rank file and a person.'],
      ['90-day daily filter', 'Designed', 'An odd temporal kernel cannot see all 90 days.'],
      ['Temporal attention along the 90 days', 'Not a row', 'No script and no board row.']
    ];
    return `<section class="hw-board"><h2>Board · 12 November 2026</h2><p>Both training flags are off.</p><table><thead><tr><th>Row</th><th>Where</th><th>What the card may say</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`;
  }
  function renderDetail() {
    const mount = global.document?.querySelector?.('#hw-stage-detail');
    if (!mount) return;
    mount.innerHTML = detailHTML(selected);
    global.document.querySelectorAll('[data-hw-stage]').forEach(button => {
      const on = button.dataset.hwStage === selected;
      button.setAttribute('aria-pressed', String(on));
      button.classList.toggle('selected', on);
    });
  }
  function render() {
    const root = global.document?.querySelector?.('#headwater-workflow');
    if (!root) return false;
    root.innerHTML = `<div class="hw-stages" role="group" aria-label="HEADWATER development stages">${stageButtons()}</div><div id="hw-stage-detail" class="hw-detail"></div>${boardHTML()}`;
    renderDetail();
    return true;
  }
  function onClick(event) {
    const target = event.target?.closest?.('[data-hw-stage],[data-hw-question],[data-hw-nav]');
    if (!target || !target.closest?.('#view-headwater, #headwater-workflow')) return;
    if (target.dataset.hwStage) { selected = target.dataset.hwStage; renderDetail(); return; }
    if (target.dataset.hwNav && typeof options.navigate === 'function') {
      if (target.dataset.hwNav === 'introduction') global.TVACaseJourney?.setContext?.('lab');
      options.navigate(target.dataset.hwNav);
      return;
    }
    const text = requestFor(target.dataset.hwQuestion);
    if (text && typeof options.preparePrompt === 'function') options.preparePrompt(text);
  }
  function mountVideo() {
    const video = global.document?.querySelector?.('#hw-video');
    if (!video) return;
    video.hidden = true;
    video.addEventListener('loadeddata', () => { video.hidden = false; });
    video.src = '/assets/water4energy-workbench-90s.mp4';
  }
  function init(settings) {
    options = settings || {};
    if (!bound && global.document?.addEventListener) { global.document.addEventListener('click', onClick); bound = true; }
    render();
    mountVideo();
    return true;
  }
  const api = {questions: QUESTIONS, requestFor, luxHTML, scoreHTML, downscaleHTML, exampleHTML: downscaleHTML, stages: STAGES, render, init};
  global.Water4EnergyWorkbench = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
