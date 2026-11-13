const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const hw = require('../public/headwater-workflow.js');

test('the project shell opens on HEADWATER development', () => {
  const page = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(page, /<title>Water4Energy workbench<\/title>/);
  assert.match(page, /id="view-headwater" class="view active"/);
  const first = page.slice(page.indexOf('id="view-headwater"'), page.indexOf('id="view-introduction"'));
  assert.match(first, /1979–2017 week/);
  assert.match(first, /https:\/\/github.com\/Genesis-VISTA\/vista/);
  assert.doesNotMatch(first, /megawatt/i);
  const network = page.slice(page.indexOf('id="view-network"'), page.indexOf('id="view-skills"'));
  assert.match(network, /54 study locations/);
  assert.match(network, /16–22 April 2019/);
});

test('the Lux card lists run names and the score card keeps the valley figure', () => {
  const lux = hw.luxHTML();
  assert.match(lux, /det_v2_reslim_patch2_obs/);
  assert.match(lux, /lux_rocm\/layer4/);
  assert.doesNotMatch(lux, /0\.77/);
  assert.doesNotMatch(lux, /megawatt/i);
  const score = hw.scoreHTML();
  assert.match(score, /1979–2017 week/);
  assert.match(score, /0\.77°C/);
  assert.match(score, /16–22 April 2019/);
  assert.match(score, /tva_t2m_2019_reslim\.png/);
  assert.match(score, /tva_precip_2019_reslim\.png/);
  assert.doesNotMatch(score, /valley_temperature_2019\.png/);
  const example = hw.downscaleHTML();
  assert.deepEqual(hw.stages.map(stage => stage[0]), ['hypothesis','data','design','execution','score','downscale']);
  assert.equal(hw.stages[5][1], 'Downscaling');
  assert.match(example, /about 4 km/);
  assert.match(example, /april_2019_tmax_refine\.png/);
  assert.match(example, /april_2019_prcp_refine\.png/);
  assert.match(example, /not a claim that the HEADWATER forecast/);
  assert.doesNotMatch(example, /Deterministic example/);
  assert.doesNotMatch(example, /megawatt/i);
  const source = fs.readFileSync(path.join(__dirname, '../public/headwater-workflow.js'), 'utf8');
  assert.doesNotMatch(source, /headwater-resources/);
  assert.doesNotMatch(source, /Deterministic example/);
  for (const item of hw.questions) {
    const text = hw.requestFor(item.id);
    assert.match(text, /Do not submit jobs/);
    assert.match(text, /HEADWATER development/);
  }
});
