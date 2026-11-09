// Optional developer checks; Node is not required to run the application.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../public/project-ui.js'), 'utf8');
const network = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/network.json'), 'utf8'));
const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/prompts.json'), 'utf8')).prompts;

function createContext() {
  const context = vm.createContext({
    state: {network, prompts, busy:false, focusSiteId:'NORRIS'},
    esc: value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
    toast: () => {},
  });
  vm.runInContext(source, context);
  return context;
}

// Native details emit a toggle after keyboard or pointer activation. This small
// DOM adapter exercises how those events affect rerendering and search recovery.
function rosterDOM(context) {
  const search = {value:''};
  const roster = {
    html:'', disclosures:[],
    set innerHTML(value) {
      this.html=value;
      this.disclosures=Array.from(value.matchAll(/<details class="network-roster-group" data-network-group="([^"]+)"( open)?>/g), match => ({
        dataset:{networkGroup:match[1]}, open:Boolean(match[2]),
        addEventListener(event,callback) {this[event]=callback;},
      }));
    },
    querySelectorAll(selector) {return selector==='[data-network-group]'?this.disclosures:[];},
  };
  context.$ = selector => ({'#site-search':search,'#network-roster':roster}[selector]);
  return {search,roster};
}

test('the network starts with 12 headwaters expanded and 42 other locations collapsed', () => {
  const context=createContext();
  const groups=context.networkRosterGroups();
  assert.deepEqual(Array.from(groups,group=>[group.id,group.sites.length,group.open]),[
    ['headwaters',12,true],['other',42,false],
  ]);
  assert.deepEqual(Array.from(groups[0].sites,site=>site.name),network.headwaterNames);
  const {roster}=rosterDOM(context);
  context.renderNetworkRoster();
  assert.match(roster.html,/<summary><strong>Headwater reservoirs<\/strong>/);
  assert.match(roster.html,/data-network-group="other"><summary>/);
  assert.equal((roster.html.match(/data-roster-site=/g)||[]).length,54);
});

test('location selection rerenders keep the expansion choices made through native details', () => {
  const context=createContext();
  const {roster}=rosterDOM(context);
  context.renderNetworkRoster();
  roster.disclosures[0].open=false;
  roster.disclosures[0].toggle();
  roster.disclosures[1].open=true;
  roster.disclosures[1].toggle();
  context.state.focusSiteId='WOLF_CREEK';
  context.renderNetworkRoster();
  assert.deepEqual(roster.disclosures.map(group=>[group.dataset.networkGroup,group.open]),[
    ['headwaters',false],['other',true],
  ]);
});

test('search opens matching groups with filtered counts and clearing restores expansion choices', () => {
  const context=createContext();
  const {search,roster}=rosterDOM(context);
  context.renderNetworkRoster();
  roster.disclosures[0].open=false;
  roster.disclosures[0].toggle();
  search.value='norris';
  context.renderNetworkRoster();
  assert.equal(roster.disclosures.length,1);
  assert.equal(roster.disclosures[0].open,true);
  assert.match(roster.html,/network-group-count">1 of 12<\/span>/);
  // Changing a temporary search disclosure must not change the user's defaults.
  roster.disclosures[0].open=false;
  roster.disclosures[0].toggle();
  search.value='';
  context.renderNetworkRoster();
  assert.deepEqual(roster.disclosures.map(group=>group.open),[false,false]);
  search.value='sevierville';
  context.renderNetworkRoster();
  assert.equal(roster.disclosures[0].dataset.networkGroup,'other');
  assert.equal(roster.disclosures[0].open,true);
  assert.match(roster.html,/network-group-count">1 of 42<\/span>/);
  search.value='not-a-tva-location';
  context.renderNetworkRoster();
  assert.equal(roster.disclosures.length,0);
  assert.match(roster.html,/No matching location/);
});

test('compact hints retain the full catalog with the three starting questions first', () => {
  const context=createContext();
  const groups=context.hintGroups(prompts);
  assert.deepEqual(Array.from(groups.featured,prompt=>prompt.id),['walkthrough','ledger','runoff']);
  assert.equal(groups.more.length,8);
  assert.equal(new Set([...groups.featured,...groups.more].map(prompt=>prompt.id)).size,prompts.length);
  const empty=context.hintGroups([{id:'bad'},null]);
  assert.equal(empty.featured.length+empty.more.length,0);
  const containers={};
  for(const id of ['chat-hints','conversation-hints'])containers['#'+id]={classList:{add(){}},querySelectorAll(){return [];}};
  context.$=selector=>containers[selector];
  context.renderPromptLibrary();
  for(const container of Object.values(containers)) {
    assert.equal((container.innerHTML.match(/class="context-hint-chip"/g)||[]).length,3);
    assert.equal((container.innerHTML.match(/class="context-hint-option"/g)||[]).length,8);
    assert.match(container.innerHTML,/<details class="context-hints-more"><summary>More hints/);
  }
});

test('hint selection prepares one original request without changing case or submitting work', () => {
  const context=createContext();
  const prepared=[];
  context.prepareDemoPrompt=text=>prepared.push(text);
  context.sendLive=()=>assert.fail('a hint must not send a live request');
  const before=context.state.focusSiteId;
  context.usePrompt('ledger');
  assert.deepEqual(prepared,[prompts.find(prompt=>prompt.id==='ledger').livePrompt]);
  assert.equal(context.state.focusSiteId,before);
  context.state.busy=true;
  context.usePrompt('walkthrough');
  context.state.busy=false;
  context.usePrompt('missing');
  assert.equal(prepared.length,1);
});
