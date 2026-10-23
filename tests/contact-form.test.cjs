const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');

function setup(provider = async () => ({ok:true, json:async () => ({success:'true',message:'The form was submitted successfully.'})})) {
  let submit, resets = 0;
  const calls = [];
  const button = {disabled:false,textContent:'提交留言'};
  const status = {hidden:false,textContent:'',style:{}};
  const fields = Object.fromEntries(Object.entries({name:'访客',email:'visitor@example.com',subject:'合作咨询',message:'02别轻易放弃，慢一点也没关系。',_honey:''}).map(([name,value]) => [name,{value}]));
  const form = {action:'https://formsubmit.co/1016520133@qq.com',elements:fields,querySelector:()=>button,addEventListener:(_,fn)=>{submit=fn;},reportValidity:()=>true,reset:()=>{resets++;}};
  const document = {querySelector:selector=>({'#studio-contact-form':form,'#contact-form-status':status,'#contact-verification':{hidden:true}}[selector])};
  vm.runInNewContext(fs.readFileSync('js/contact-form.js','utf8'),{document,fetch:async(url,options)=>{calls.push({url,options});return provider(url,options);},AbortController,setTimeout,clearTimeout});
  return {form,button,status,calls,resets:()=>resets,submit:()=>submit({preventDefault(){}})};
}

test('web submission uses the working AJAX endpoint with visitor Reply-To and full message',async()=>{
  const x=setup(); await x.submit();
  assert.equal(x.calls.length,1);
  assert.equal(x.calls[0].url,'https://formsubmit.co/ajax/1016520133@qq.com');
  assert.equal(x.calls[0].options.method,'POST');
  const body=JSON.parse(x.calls[0].options.body);
  assert.equal(body._replyto,'visitor@example.com');
  assert.equal(body._subject,'Weave Lab 留言咨询：合作咨询');
  assert.equal(body.message,'02别轻易放弃，慢一点也没关系。');
  assert.equal(body._captcha,undefined);
  assert.equal(x.resets(),1);
  assert.equal(x.button.disabled,false);
});

test('activation failure is visible and preserves the message',async()=>{
  const x=setup(async()=>({ok:true,json:async()=>({success:'false',message:"This form needs Activation. We've sent you an email containing an 'Activate Form' link."})}));
  await x.submit(); assert.equal(x.resets(),0);assert.match(x.status.textContent,/激活/);assert.equal(x.button.disabled,false);
});

test('HTTP errors and malformed responses never clear the message',async()=>{
  for(const response of [{ok:false,json:async()=>({success:'true'})},{ok:true,json:async()=>{throw new Error('HTML response');}}]){
    const x=setup(async()=>response);await x.submit();assert.equal(x.resets(),0);assert.match(x.status.textContent,/保留/);assert.equal(x.button.disabled,false);
  }
});

test('double clicks send once while the first request is pending',async()=>{
  let finish;
  const x=setup(()=>new Promise(resolve=>{finish=resolve;}));
  const first=x.submit(); await x.submit(); assert.equal(x.calls.length,1);
  finish({ok:true,json:async()=>({success:true})});await first;assert.equal(x.resets(),1);
});

test('honeypot input is not sent',async()=>{
  const x=setup();x.form.elements._honey.value='spam';await x.submit();assert.equal(x.calls.length,0);assert.equal(x.resets(),0);
});

test('an uncertain network result preserves input without automatic retries',async()=>{
  const x=setup(async()=>{throw Object.assign(new Error('timeout'),{name:'AbortError'});});
  await x.submit();assert.equal(x.calls.length,1);assert.equal(x.resets(),0);assert.match(x.status.textContent,/未确认/);assert.equal(x.button.disabled,false);
});
