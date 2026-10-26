const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('pages/projects.html','utf8').replace(/\r\n/g,'\n');
const measures=[...html.matchAll(/function measure\(\) \{([\s\S]*?)\n      \}\n\n      function duplicate/g)];
test('both galleries use readable mobile columns and remeasure from their container on resize',()=>{
 assert.equal(measures.length,2);
 for(const m of measures){
  const cards=Array.from({length:18},()=>({style:{}}));const grid={style:{},querySelectorAll:()=>cards};const viewport={style:{},parentElement:{clientWidth:358},clientWidth:100};
  const context={getComputedStyle:()=>({paddingLeft:"16",paddingRight:"16"}),window:{innerWidth:390},grid,viewport,track:{style:{}},CARD_ASPECT:4/3,BASE_CARD_W:250,BASE_GAP:36,VISIBLE_ROWS:2,PX_PER_SEC:50};vm.createContext(context);
  vm.runInContext('function measure(){'+m[1]+'};measure()',context);
  assert.match(grid.style.gridTemplateColumns,/repeat\(2,/);if(m[1].includes('.graduation-card')){assert.notEqual(viewport.style.maxHeight,'none');assert.equal(cards.filter(c=>c.style.display!=='none').length,18);}else{assert.equal(viewport.style.maxHeight,'none');assert.equal(cards.filter(c=>c.style.display!=='none').length,4);}
  const mobileWidth=+grid.style.gridTemplateColumns.match(/, (\d+)px/)[1];assert.ok(mobileWidth>=140);assert.ok(parseInt(viewport.style.width)<=326,"grid fits inside parent padding");
  assert.ok(Math.round(mobileWidth*5/3)-76>mobileWidth,'image retains a full portrait preview above caption');
  context.window.innerWidth=1440;viewport.parentElement.clientWidth=1200;vm.runInContext('measure()',context);
  assert.equal(grid.style.gridTemplateColumns,'repeat(4, 250px)');assert.ok(cards.every(c=>c.style.display===''));
 }
});
