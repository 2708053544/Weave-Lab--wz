const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const page = name => fs.readFileSync(path.join('pages', name), 'utf8');
function dataset(name, variable) {
  const source = page(name);
  const start = source.indexOf(variable + ' = [');
  assert.ok(start >= 0, variable + ' dataset exists');
  const end = source.indexOf('\n    ];', start);
  return vm.runInNewContext(source.slice(start + variable.length + 3, end + 6).replace(/;\s*$/, ''));
}
test('every graduation gallery board resolves to a real asset, including unavailable entries', () => {
  for (const name of ['projects.html', 'graduation-works.html', 'graduation-detail.html']) {
    const records = dataset(name, 'graduationProjects');
    assert.equal(records.length, 18);
    for (const record of records) for (const board of record.boards) {
      assert.ok(fs.existsSync(path.join('images/graduation', board)), name + ': ' + board);
    }
    for (const record of records.filter(x => x.id >= 15)) assert.equal(record.boards[0], 'artwork-unavailable.svg');
  }
  assert.match(fs.readFileSync('images/graduation/artwork-unavailable.svg', 'utf8'), /作品展板暂未提供/);
});
test('ordinary work cards and clones navigate to generated gallery anchors', () => {
  const projects = page('projects.html');
  assert.doesNotMatch(projects, /normal-detail\.html/);
  assert.match(projects, /normal-works\.html#work-' \+ w\.id/);
  assert.match(projects, /normal-works\.html#work-' \+ pid/);
  const gallery = page('normal-works.html');
  const records = dataset('normal-works.html', 'normalWorks');
  assert.equal(records.length, 36);
  assert.equal(new Set(records.map(x => x.id)).size, 36);
  assert.match(gallery, /card\.id = 'work-' \+ work\.id/);
  assert.match(gallery, /selected\.scrollIntoView/);
  for (const name of ['projects.html', 'normal-works.html']) {
    assert.doesNotMatch(page(name), /src="\.\.\/images\/normal-works\//);
    assert.match(page(name), /src="\.\.\/images\/graduation\/artwork-unavailable\.svg"/);
  }
});
