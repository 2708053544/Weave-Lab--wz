const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const pages=['index.html',...fs.readdirSync('pages').filter(x=>x.endsWith('.html')).map(x=>'pages/'+x)];
function canonical(file){const html=fs.readFileSync(file,'utf8');const matches=[...html.matchAll(/<footer class="footer">[\s\S]*?<\/footer>/g)];assert.equal(matches.length,1,file);return matches[0][0].replace(/(href|src)="([^"]+)"/g,(_,key,value)=>key+'="'+new URL(value,'https://weavelab.website/'+file).href+'"').replace(/\s+/g,' ').trim();}
test('all sixteen pages share the same footer content, destinations and structure',()=>{const expected=canonical('index.html');assert.equal(pages.length,16);for(const file of pages)assert.equal(canonical(file),expected,file)});
