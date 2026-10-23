const ORIGIN = 'https://weavelab.website';
const HOSTNAME = 'weavelab.website';
const ACTION = 'weave-contact';
const configured = env => Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY);
function reply(request, body, status = 200) {
  const headers = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', Vary:'Origin' };
  if (request.headers.get('Origin') === ORIGIN) headers['Access-Control-Allow-Origin'] = ORIGIN;
  return Response.json(body, { status, headers });
}
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/contact') return new Response('Not found', {status:404});
    if (request.method === 'GET') return reply(request, configured(env) ? {ready:true,siteKey:env.TURNSTILE_SITE_KEY} : {ready:false});
    if (request.headers.get('Origin') !== ORIGIN) return reply(request,{error:'请从工作室网站提交留言。'},403);
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600',Vary:'Origin'}});
    if (request.method !== 'POST') return reply(request,{error:'不支持的请求。'},405);
    if (!configured(env)) return reply(request,{error:'留言投递正在配置，请直接发送邮件。'},503);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(request,{error:'提交格式不正确。'},415);
    if (Number(request.headers.get('Content-Length') || 0) > 20000) return reply(request,{error:'留言过长。'},413);
    let data;
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 20000) return reply(request,{error:'留言过长。'},413);
      data = JSON.parse(text);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error();
    } catch { return reply(request,{error:'提交格式不正确。'},400); }
    const field = name => typeof data[name] === 'string' ? data[name].trim() : '';
    const name=field('name'), email=field('email'), subject=field('subject'), message=field('message'), token=field('token'), requestId=field('requestId');
    if (field('website') || !name || name.length>80 || /[\r\n]/.test(name) || email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !subject || subject.length>150 || /[\r\n]/.test(subject) || !message || message.length>5000 || !token || token.length>2048 || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return reply(request,{error:'请检查留言内容并完成验证。'},400);
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get('CF-Connecting-IP') || undefined}),signal:AbortSignal.timeout(10000)});
      const check = await verification.json();
      if (!verification.ok || !check.success || check.hostname!==HOSTNAME || check.action!==ACTION) return reply(request,{error:'验证已失效，请重新验证后提交。'},400);
      const result = await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`weave-contact-${requestId}`},body:JSON.stringify({from:env.CONTACT_FROM,to:['1016520133@qq.com'],reply_to:email,subject:`Weave Lab 留言咨询：${subject}`,text:`姓名：${name}\n回复邮箱：${email}\n主题：${subject}\n\n${message}\n\n来源：${ORIGIN}/pages/contact.html`}),signal:AbortSignal.timeout(15000)});
      if (!result.ok) return reply(request,{error:'邮件服务未接受留言，请稍后重试。'},502);
      const receipt = await result.json();
      if (typeof receipt.id !== 'string' || !receipt.id) return reply(request,{error:'暂未确认投递结果，请稍后重试。'},502);
      console.info('weave-contact-mail-accepted',receipt.id);
      return reply(request,{ok:true,id:receipt.id});
    } catch { return reply(request,{error:'暂未确认投递结果，请稍后重试。'},502); }
  }
};
