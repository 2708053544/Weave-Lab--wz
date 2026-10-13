(() => {
  const form = document.querySelector('#studio-contact-form');
  if (!form) return;
  const endpoint = 'https://weave-lab-contact.pages.dev/api/contact';
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#contact-form-status');
  const verification = document.querySelector('#contact-verification');
  let ready = false, sending = false, token = '', widget, retry;
  button.disabled = true;
  const show = (text, error = false) => {
    status.hidden = false;
    status.textContent = text;
    status.style.color = error ? '#efaaaa' : 'var(--text-secondary)';
  };
  const available = () => { button.disabled = sending || !ready || !token; };
  const unavailable = () => { ready = false; token = ''; available(); show('留言投递暂不可用，请通过下方邮箱发送留言。'); };
  const fetchJSON = async (url, options, timeout = 12000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, options ? {...options, signal:controller.signal} : {signal:controller.signal});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '暂未确认投递结果，请稍后重试。');
      return data;
    } finally { clearTimeout(timer); }
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !ready || !token || !form.reportValidity()) return;
    const values = Object.fromEntries(['name','email','subject','message','website'].map(key=>[key,form.elements[key].value.trim()]));
    if (values.website) return;
    if (['name','email','subject','message'].some(key=>!values[key])) { show('请填写完整的留言信息。',true); return; }
    const signature = JSON.stringify(values);
    if (!retry || retry.signature !== signature) retry = {signature, id:crypto.randomUUID()};
    sending = true; available(); button.textContent = '正在提交…'; show('正在发送留言，请稍候…');
    try {
      const result = await fetchJSON(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...values,token,requestId:retry.id})},30000);
      if (result.ok !== true || !result.id) throw new Error('暂未确认投递结果，请稍后重试。');
      form.reset(); retry = null;
      show('留言已提交，我们会通过您填写的邮箱回复。');
    } catch (error) { show((error.name === 'AbortError' ? '暂未确认投递结果，请稍后重试。' : error.message) + ' 留言内容已保留，也可直接发送邮件。',true); }
    finally {
      sending = false; token = ''; button.textContent = '提交留言'; available();
      if (widget !== undefined) window.turnstile.reset(widget);
    }
  });
  show('正在连接留言服务…');
  (async () => {
    try {
      const config = await fetchJSON(endpoint);
      if (!config.ready || typeof config.siteKey !== 'string' || !config.siteKey) { unavailable(); return; }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      const timer = setTimeout(unavailable,20000);
      script.onerror = () => { clearTimeout(timer); unavailable(); };
      script.onload = () => {
        clearTimeout(timer);
        try {
          verification.hidden = false; ready = true;
          show('请完成验证后提交留言。');
          widget = window.turnstile.render(verification,{sitekey:config.siteKey,action:'weave-contact',theme:'auto',
            callback:value=>{token=value;available();show('验证完成，可以提交留言。');},
            'expired-callback':()=>{token='';available();show('验证已过期，请重新验证。');},
            'error-callback':()=>{token='';available();show('验证暂时无法加载，请稍后重试或直接发送邮件。',true);}
          });
        } catch { unavailable(); }
      };
      document.head.appendChild(script);
    } catch { unavailable(); }
  })();
})();
