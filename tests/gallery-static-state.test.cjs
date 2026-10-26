const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');

function setup() {
  const html = fs.readFileSync('pages/projects.html', 'utf8');
  const start = html.indexOf('function setupGraduationMarquee()');
  const end = html.indexOf('// 筛选标签切换', start);
  assert.ok(start >= 0 && end > start);
  const windowEvents = {}, viewportEvents = {}, timers = [];
  const clones = [];
  const originals = Array.from({length: 4}, () => ({
    cloneNode() {
      const clone = {
        classList: {add() {}},
        querySelector: () => null,
        remove() { clones.splice(clones.indexOf(clone), 1); }
      };
      return clone;
    }
  }));
  const grid = {
    style: {}, offsetHeight: 2400,
    querySelectorAll: selector => selector === '.graduation-clone' ? [...clones] : originals,
    appendChild: clone => clones.push(clone)
  };
  const viewport = {
    style: {}, parentElement: {clientWidth: 358},
    addEventListener: (name, listener) => { viewportEvents[name] = listener; }
  };
  const track = {style: {}};
  const window = {
    innerWidth: 390,
    addEventListener: (name, listener) => { windowEvents[name] = listener; }
  };
  const elements = {graduationViewport: viewport, graduationTrack: track, graduationGrid: grid};
  vm.runInNewContext(html.slice(start, end) + '\nsetupGraduationMarquee();', {
    document: {getElementById: id => elements[id], readyState: 'complete'},
    window,
    getComputedStyle: () => ({paddingLeft: '16', paddingRight: '16'}),
    bindGraduationCarousels() {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    setTimeout: callback => timers.push(callback)
  });
  timers.splice(0).forEach(callback => callback());
  function wheel() {
    const state = {prevented: false, stopped: false};
    viewportEvents.wheel({
      deltaY: 100,
      preventDefault() { state.prevented = true; },
      stopPropagation() { state.stopped = true; }
    });
    return state;
  }
  return {window, windowEvents, viewport, track, clones, wheel};
}

test('excellent graduation mode remains fully visible after resize and lets the page scroll', () => {
  const x = setup();
  assert.equal(x.wheel().prevented, true, 'the ordinary photo stream handles its own wheel input');
  x.window._pauseGraduationMarquee();
  assert.equal(x.viewport.style.maxHeight, 'none');
  assert.equal(x.clones.length, 0);
  const stationary = x.track.style.transform;
  for (const width of [1440, 390]) {
    x.window.innerWidth = width;
    x.viewport.parentElement.clientWidth = width - 32;
    x.windowEvents.resize();
    assert.equal(x.viewport.style.maxHeight, 'none', 'resize must not reapply a crop');
    assert.deepEqual(x.wheel(), {prevented: false, stopped: false});
    assert.equal(x.track.style.transform, stationary, 'page scrolling must not translate the static gallery');
  }
});

test('returning to graduation photographs restores the looping gallery and wheel input', () => {
  const x = setup();
  x.window._pauseGraduationMarquee();
  x.window._resumeGraduationMarquee();
  assert.notEqual(x.viewport.style.maxHeight, 'none');
  assert.equal(x.clones.length, 4);
  const before = x.track.style.transform;
  assert.deepEqual(x.wheel(), {prevented: true, stopped: true});
  assert.notEqual(x.track.style.transform, before);
});
