import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const code = await readFile(new URL('../public/_worker.js', import.meta.url), 'utf8');
const { default: worker } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const origin = 'https://2708053544.github.io';
const env = { RESEND_API_KEY:'test-only', CONTACT_FROM:'Weave Lab <hello@example.com>', TURNSTILE_SECRET_KEY:'test-only', TURNSTILE_SITE_KEY:'test-only' };
const data = { name:'Visitor', email:'visitor@example.com', subject:'Inquiry', message:'Hello studio', token:'token', requestId:'b907c340-69e1-4dca-8cf9-ef9f1f47a2c1', website:'' };
const request = (body=data, source=origin) => new Request('https://backend.example/api/contact', {method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('CORS preflight permits only website origin', async()=>{
 const good=await worker.fetch(new Request('https://backend.example/api/contact',{method:'OPTIONS',headers:{Origin:origin}}),env);
 assert.equal(good.status,204);assert.equal(good.headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal((await worker.fetch(request(data,'https://attacker.example'),env)).status,403);
});
test('readiness and missing secrets fail closed',async()=>{
 assert.equal((await (await worker.fetch(new Request('https://backend.example/api/contact'),{})).json()).ready,false);
 assert.equal((await worker.fetch(request(),{})).status,503);
});
test('invalid and oversize messages never call provider',async()=>{
 assert.equal((await worker.fetch(request({...data,email:'bad\nmail'}),env)).status,400);
 assert.equal((await worker.fetch(request({...data,website:'spam'}),env)).status,400);
 assert.equal((await worker.fetch(request({...data,message:'x'.repeat(21000)}),env)).status,413);
});
test('challenge rejection, provider rejection and acceptance',async()=>{
 const original=globalThis.fetch;
 let validation={success:false}, providerOK=true, sent;
 globalThis.fetch=async(url,options)=>{
  if(url.includes('siteverify'))return Response.json(validation);
  sent={body:JSON.parse(options.body),headers:options.headers};
  return Response.json(providerOK?{id:'mail-123'}:{message:'denied'},{status:providerOK?200:403});
 };
 try {
  assert.equal((await worker.fetch(request(),env)).status,400);
  validation={success:true,hostname:'wrong.example',action:'weave-contact'};
  assert.equal((await worker.fetch(request(),env)).status,400);
  validation={success:true,hostname:'2708053544.github.io',action:'weave-contact'};providerOK=false;
  assert.equal((await worker.fetch(request(),env)).status,502);
  providerOK=true;
  assert.equal((await (await worker.fetch(request(),env)).json()).ok,true);
  assert.deepEqual(sent.body.to,['1016520133@qq.com']);assert.equal(sent.body.reply_to,'visitor@example.com');
  assert.equal(sent.headers['Idempotency-Key'],'weave-contact-'+data.requestId);
 } finally {globalThis.fetch=original;}
});
