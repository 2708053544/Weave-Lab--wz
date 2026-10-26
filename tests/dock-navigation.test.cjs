const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('dock routes remain links while buttons open one menu and close on Escape or outside click',()=>{
 const events={};const buttons=Array.from({length:3},()=>{const state=new Set();return {attrs:{'aria-expanded':'false'},parentElement:{classList:{remove:k=>state.delete(k),toggle:(k,v)=>v?state.add(k):state.delete(k)}},state,getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this[k]=f},focus(){this.focused=true}}});
 const nav={querySelectorAll:()=>buttons,contains:t=>t==='inside'};
 vm.runInNewContext(fs.readFileSync('js/dock-navigation.js','utf8'),{document:{getElementById:()=>nav,addEventListener:(k,f)=>events[k]=f}});
 buttons[0].click();assert.equal(buttons[0].attrs['aria-expanded'],'true');buttons[1].click();assert.equal(buttons[0].attrs['aria-expanded'],'false');assert.equal(buttons[1].attrs['aria-expanded'],'true');events.keydown({key:'Escape'});assert.equal(buttons[1].attrs['aria-expanded'],'false');assert.ok(buttons[1].focused);buttons[2].click();events.click({target:'outside'});assert.equal(buttons[2].attrs['aria-expanded'],'false');
 const html=fs.readFileSync('index.html','utf8');assert.match(html,/<a href="pages\/about.html" class="nav-link appear/);assert.match(html,/aria-controls="dock-team"/);
});
