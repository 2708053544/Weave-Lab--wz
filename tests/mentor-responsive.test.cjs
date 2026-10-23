const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/mentors-3d.js', 'utf8');
const touch = source.slice(source.indexOf('  let tsX ='), source.indexOf('  /* ---------------- 键盘'));
const listeners = {};
let prevented = 0, switches = 0;
vm.runInNewContext(touch, {
  window: { addEventListener: (name, fn) => { listeners[name] = fn; } },
  standalone: false, sectionActive: () => true,
  stage: { getBoundingClientRect: () => ({ left: 0, right: 300, top: 0, bottom: 400 }) },
  next: () => switches++, prev: () => switches--,
});
function swipe(x, y) {
  listeners.touchstart({ touches: [{ clientX: 150, clientY: 100 }] });
  listeners.touchmove({ touches: [{ clientX: 150 + x, clientY: 100 + y }], preventDefault: () => prevented++ });
  listeners.touchend({ changedTouches: [{ clientX: 150 + x, clientY: 100 + y }] });
}
swipe(4, -80);
assert.equal(prevented, 0, 'Vertical swipes on embedded portraits must scroll the page');
assert.equal(switches, 0, 'Vertical scrolling must not change mentors');
swipe(-80, 4);
assert.equal(prevented, 1, 'Horizontal portrait swipes are handled');
assert.equal(switches, 1, 'Horizontal portrait swipes change mentors');
console.log('Mentor embedded touch checks passed');
