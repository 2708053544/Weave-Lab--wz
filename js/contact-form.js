(() => {
  const form = document.querySelector('#studio-contact-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#contact-form-status');
  let sending = false;
  const show = (message, error = false) => {
    status.hidden = false;
    status.textContent = message;
    status.style.color = error ? '#efaaaa' : 'var(--text-secondary)';
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity() || form.elements._honey.value) return;
    const values = Object.fromEntries(['name', 'email', 'subject', 'message'].map(key => [key, form.elements[key].value.trim()]));
    if (Object.values(values).some(value => !value)) {
      show('请填写完整的姓名、邮箱、主题和留言内容。', true);
      return;
    }
    sending = true;
    button.disabled = true;
    button.textContent = '正在提交…';
    show('正在发送留言，请稍候…');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/1016520133@qq.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        signal: controller.signal,
        body: JSON.stringify({...values, _replyto: values.email, _subject: `Weave Lab 留言咨询：${values.subject}`, _template: 'table', _url: 'https://weavelab.website/pages/contact.html', _honey: ''})
      });
      const result = await response.json();
      if (/activat|confirm.*email/i.test(result.message || '')) {
        show('收件邮箱尚需激活，留言未确认发送，内容已保留。请直接发送邮件联系工作室。', true);
        return;
      }
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Submission rejected');
      form.reset();
      show('留言已提交至收信服务，我们会通过您填写的邮箱回复。');
    } catch {
      // A timeout can follow acceptance; do not automatically send the same message again.
      show('留言发送结果未确认，内容已保留。请稍后重试，或通过下方邮箱直接联系。', true);
    } finally {
      clearTimeout(timer);
      sending = false;
      button.disabled = false;
      button.textContent = '提交留言';
    }
  });
})();
