const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const library=require('../public/literature-library.js');
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/literature.json'),'utf8'));
const catalog=library.normalizeCatalog(snapshot);

test('the source snapshot separates stored files, repair flags, pending references and the review note',()=>{
  assert.equal(catalog.rejected,0);
  assert.equal(catalog.entries.length,42);
  assert.deepEqual(library.counts(catalog.entries),{all:42,repository_pdf:24,needs_repair:2,reference:15,repository_note:1});
  const core=catalog.entries.filter(e=>e.repo==='daliwang/HEADWATER'&&e.pdfPath);
  assert.equal(core.length,22);
  assert.equal(core.filter(e=>e.status==='repository_pdf').length,20);
  assert.ok(snapshot.repos.length===4&&snapshot.repos.every(r=>r.treeComplete===true));
});
test('known bad repository copies are kept visible as repairs with the source-reported correction',()=>{
  const ridge=catalog.entries.find(e=>e.id==='li2012ridge');
  assert.equal(ridge.status,'needs_repair');
  assert.equal(ridge.doi,'10.1007/s00382-011-1214-y');
  assert.match(ridge.note,/wrong article/);
  assert.match(ridge.sourcePath,/EXTEND_DOWNLOAD/);
  const enso=catalog.entries.find(e=>e.id==='ropelewski1986enso');
  assert.equal(enso.status,'needs_repair');
  assert.match(enso.note,/no article text/);
});
test('search spans author, topic, year and key and composes with the availability filter',()=>{
  assert.equal(library.filterEntries(catalog.entries,'muñoz 2021')[0].id,'munozsabater2021era5land');
  assert.equal(library.filterEntries(catalog.entries,'munoz 2021')[0].id,'munozsabater2021era5land');
  assert.ok(library.filterEntries(catalog.entries,'land memory').length>=5);
  assert.equal(library.filterEntries(catalog.entries,'li2012ridge','repository_pdf').length,0);
  assert.equal(library.filterEntries(catalog.entries,'li2012ridge','needs_repair').length,1);
  assert.equal(library.filterEntries(catalog.entries,'no-such-citation').length,0);
});
test('repository copy labels require a real PDF metadata record and exact pinned project URL',()=>{
  const original=catalog.entries.find(e=>e.id==='koster2004coupling');
  for(const patch of [{pdfBytes:0},{pdfUrl:'https://example.com/paper.pdf'},{pdfPath:'../paper.pdf'},{sourceUrl:'javascript:alert(1)'},{repo:'another/repo'},{commit:'main'}])assert.equal(library.normalizeEntry({...original,...patch}),null);
  assert.ok(library.normalizeEntry(original));
  assert.equal(library.repositoryURL(original.repo,original.commit,'folder/file.pdf'),'https://github.com/'+original.repo+'/blob/'+original.commit+'/folder/file.pdf');
});
test('reference links accept only credential-free HTTPS scholarly destinations',()=>{
  for(const value of ['javascript:alert(1)','http://doi.org/10.1/x','https://name:secret@doi.org/10.1/x','https://doi.org.evil.example/x','https://example.com/paper'])assert.equal(library.safeReferenceURL(value),null);
  assert.equal(library.safeReferenceURL('https://doi.org/10.1002/qj.3803'),'https://doi.org/10.1002/qj.3803');
});
test('catalog normalization removes duplicate or malformed metadata without inventing availability',()=>{
  const first=snapshot.entries[0];
  const result=library.normalizeCatalog({schema_version:1,entries:[first,first,{id:'unknown',title:'Unknown',status:'repository_pdf'}]});
  assert.equal(result.entries.length,1);
  assert.equal(result.rejected,2);
  assert.throws(()=>library.normalizeCatalog({entries:[]}));
});
