# Weave Lab 留言邮件后端

## 当前收信通道（2026-10-23）

正式联系页使用 FormSubmit 的原生 POST 表单，收件人为 `1016520133@qq.com`。
保留服务方默认 reCAPTCHA 和隐藏诱捕字段；姓名、邮箱、主题、留言内容均随邮件发送。
`email` 字段用于 Reply-To，收到留言后点击“回复”即可回复访客。
首次使用须由邮箱所有者点击 FormSubmit 邮件中的 Activate Form；未经激活不能视为已接通。
正式表单不再加载 `js/contact-form.js`，因此不会因未配置 Resend/Turnstile 而禁用提交按钮。

## 保留的 Resend 后端

网站地址为 https://weavelab.website/，继续使用 GitHub Pages；接口为 https://weave-lab-contact.pages.dev/api/contact。
收件人固定为 1016520133@qq.com。访客邮箱作为 Reply-To，直接回复邮件即可回复留言者。

## 生产配置

Cloudflare → Workers & Pages → weave-lab-contact → Settings → Variables and Secrets → Production：

- `RESEND_API_KEY`：Secret。新 Resend 发信密钥，至少允许所选发信域名。
- `TURNSTILE_SECRET_KEY`：Secret。工作室 Turnstile 小组件私密密钥。
- `TURNSTILE_SITE_KEY`：Secret（站点密钥本身是公开的，这里使用 Secret 类型以便直接在控制台配置）。工作室 Turnstile 小组件公开站点密钥。
- `CONTACT_FROM`：Text。默认 `Weave Lab <hello@weavelab.website>`；须与新 Resend 密钥所属账号中已验证的域名一致，若不同请改为自己的已验证域名。

Turnstile 新组件：名称 Weave Lab 留言；主机名 `weavelab.website`；模式 Managed。
不要把 API 密钥或 Turnstile 私密密钥放进 GitHub、前端、截图或聊天。
保存后告诉我，再重新部署后端。CONTACT_FROM 由 wrangler.toml 管理；若新 Resend 密钥使用其他发信域名，提供已验证域名名称即可，不要提供私密密钥。

GET /api/contact 的 ready:true 只证明变量齐全，不证明域名验证、邮件投递或 QQ 收件成功。
缺少任意必要配置时返回 ready:false，不接受发信请求；前端提供直接邮件入口。

## 验证

`node --test mail-backend/test/backend.test.mjs`

需要从正式联系页完成真实 Turnstile 验证后发出测试留言，并核对 Resend 投递状态和 QQ 收件箱。
接口不会接受访客指定收件邮箱；校验请求来源、验证 hostname/action、请求大小和表单字段。
