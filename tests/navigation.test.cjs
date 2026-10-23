const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
function setup(){
 const src=fs.readFileSync('js/main.js','utf8'),docEvents={},winEvents={},toggleEvents={},menuEvents={},state=new Set();
 const toggle={setAttribute(k,v){this[k]=v},addEventListener:(k,f)=>toggleEvents[k]=f,querySelectorAll:()=>[{style:{}},{style:{}},{style:{}}]};
 const menu={id:'primary-navigation',style:{},addEventListener:(k,f)=>menuEvents[k]=f};
 const navbar={classList:{toggle:(k,v)=>v?state.add(k):state.delete(k),remove:k=>state.delete(k),contains:k=>state.has(k)},contains:target=>target==='inside'};
 const document={querySelector:s=>s.includes('nav-toggle')?toggle:s.includes('nav-menu')?menu:navbar,addEventListener:(k,f)=>docEvents[k]=f};
 const window={innerWidth:390,addEventListener:(k,f)=>winEvents[k]=f};
 vm.runInNewContext(src.slice(src.indexOf('function initMobileNav()'),src.indexOf('/* ---------- Scroll Animations'))+'\ninitMobileNav();',{document,window});
 return {toggle,menu,window,state,toggleEvents,docEvents,winEvents,menuEvents};
}
test('mobile menu opens with the CSS-visible state and exposes expanded status',()=>{const x=setup();x.toggleEvents.click();assert.equal(x.state.has('nav-open'),true);assert.equal(x.toggle['aria-expanded'],'true');x.toggleEvents.click();assert.equal(x.state.has('nav-open'),false)});
test('Escape, selecting a route, and resizing to desktop each clear mobile state',()=>{for(const action of ['escape','route','resize']){const x=setup();x.toggleEvents.click();if(action==='escape')x.docEvents.keydown({key:'Escape'});if(action==='route')x.menuEvents.click({target:{closest:()=>({})}});if(action==='resize'){x.window.innerWidth=1200;x.winEvents.resize();}assert.equal(x.state.has('nav-open'),false);assert.equal(x.toggle['aria-expanded'],'false');assert.equal(x.menu.style.display,undefined);}});
