const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('pages/projects.html','utf8').replace(/\r\n/g,'\n');
const measures=[...html.matchAll(/function measure\(\) \{([\s\S]*?)\n      \}\n\n      function duplicate/g)];
test('both galleries use readable mobile columns and remeasure from their container on resize',()=>{
 assert.equal(measures.length,2);
 for(const m of measures){
  const cards=Array.from({length:18},()=>({style:{}}));const grid={style:{},querySelectorAll:()=>cards};const viewport={style:{},parentElement:{clientWidth:358},clientWidth:100};
  const context={showAllGraduation:false,getComputedStyle:()=>({paddingLeft:"16",paddingRight:"16"}),window:{innerWidth:390},grid,viewport,track:{style:{}},CARD_ASPECT:4/3,BASE_CARD_W:250,BASE_GAP:36,VISIBLE_ROWS:2,PX_PER_SEC:50};vm.createContext(context);
  vm.runInContext('function measure(){'+m[1]+'};measure()',context);
  assert.match(grid.style.gridTemplateColumns,/repeat\(2,/);assert.notEqual(viewport.style.maxHeight,'none');assert.equal(cards.filter(c=>c.style.display!=='none').length,18);
  const mobileWidth=+grid.style.gridTemplateColumns.match(/, (\d+)px/)[1];assert.ok(mobileWidth>=140);assert.ok(parseInt(viewport.style.width)<=326,"grid fits inside parent padding");
  assert.ok(Math.round(mobileWidth*5/3)-76>mobileWidth,'image retains a full portrait preview above caption');
  context.window.innerWidth=1440;viewport.parentElement.clientWidth=1200;vm.runInContext('measure()',context);
  if(m[1].includes('showAllGraduation')){context.showAllGraduation=true;vm.runInContext('measure()',context);assert.equal(viewport.style.maxHeight,'none');}
  assert.equal(grid.style.gridTemplateColumns,'repeat(4, 250px)');assert.ok(cards.every(c=>c.style.display!=='none'));
 }
});
test('a cloned carousel keeps its displayed slide when rebinding controls',()=>{
 const source=fs.readFileSync('pages/projects.html','utf8');const start=source.indexOf('    function bindGraduationCarousels()');const end=source.indexOf("    document.addEventListener('DOMContentLoaded'",start);
 function item(active){const state=new Set(active?['active']:[]);return {state,classList:{contains:k=>state.has(k),add:k=>state.add(k),remove:k=>state.delete(k)},addEventListener(k,f){this[k]=f}};}
 const slides=[item(false),item(false),item(true)],dots=[item(false),item(false),item(true)],prev=item(),next=item(),badge={};
 const carousel={dataset:{},querySelectorAll:s=>s.includes('slide')?slides:dots,querySelector:s=>s.includes('count')?badge:s.includes('prev')?prev:next};vm.runInNewContext(source.slice(start,end)+';bindGraduationCarousels();',{document:{querySelectorAll:()=>[carousel]}});next.click({stopPropagation(){}});assert.equal(slides.filter(x=>x.state.has('active')).length,1);assert.ok(slides[0].state.has('active'));assert.equal(badge.textContent,'1 / 3');
});
