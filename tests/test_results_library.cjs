const test = require('node:test');
const assert = require('node:assert/strict');
const library = require('../public/results-library.js');

test('only passive raster image formats receive inline previews', () => {
  assert.equal(library.canPreview('run/figure.PNG'), true);
  assert.equal(library.canPreview('plot.svg'), false);
  assert.equal(library.canPreview('report.html'), false);
  assert.equal(library.canPreview('report.pdf'), false);
  assert.equal(library.category('plot.svg'), 'figures');
  assert.equal(library.category('results.parquet'), 'data');
  assert.equal(library.category('brief.md'), 'reports');
});
test('relative output paths preserve nested names but reject traversal and controls', () => {
  assert.equal(library.validName('run-1/figure #1.png'), true);
  for (const name of ['../plot.png', '/plot.png', 'run/../plot.png', 'run//plot.png', 'run\\plot.png', 'bad\0name.png', '']) {
    assert.equal(library.validName(name), false, name);
  }
});
test('listing rejects invalid response contracts and keeps valid outputs with unknown metadata', () => {
  assert.throws(() => library.normalizeFiles({files: []}), /invalid output listing/);
  const files = library.normalizeFiles([{name: '../bad.csv'}, {name: 'output.csv', size: -1, modified: 'invalid'}, {name: 'output.csv', size: 5}, null]);
  assert.equal(files.length, 1);
  assert.equal(files[0].name, 'output.csv');
  assert.equal(files[0].size, null);
  assert.equal(files[0].modified, null);
});
test('outputs sort by real modified timestamps and filter by type and nested filename', () => {
  const files = library.normalizeFiles([
    {name: 'run1/old.png', modified: '2026-11-01T10:00:00Z'},
    {name: 'run2/new.png', modified: '2026-11-07T10:00:00Z'},
    {name: 'run2/data.csv', modified: '2026-11-06T10:00:00Z'},
    {name: 'other.zip'}
  ]);
  assert.deepEqual(files.map(f => f.name), ['run2/new.png', 'run2/data.csv', 'run1/old.png', 'other.zip']);
  assert.deepEqual(library.filterFiles(files, 'figures', ' RUN2 ').map(f => f.name), ['run2/new.png']);
  assert.deepEqual(library.filterFiles(files, 'all', 'DATA').map(f => f.name), ['run2/data.csv']);
  assert.equal(library.filterFiles(files, 'reports', '').length, 0);
});
