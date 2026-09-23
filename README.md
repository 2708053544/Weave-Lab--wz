# Weave Lab 智能体验与服务工程实验室 - 官方网站

## 项目简介
Weave Lab 工作室官方网站，采用简约黑白高级风格设计。

## 在线访问
网站部署在 GitHub Pages：
`https://2708053544.github.io/Weave-Lab--wz/`

## 本地开发

### 环境要求
- 任意现代浏览器（Chrome / Edge / Firefox / Safari）
- Git
- 任意代码编辑器（推荐 VS Code / Trae）

### 克隆项目到本地
```bash
git clone https://github.com/2708053544/Weave-Lab--wz.git
cd Weave-Lab--wz
```

### 启动本地预览
在项目根目录下运行：
```bash
python -m http.server 8000
```
然后打开浏览器访问 `http://localhost:8000/`

### 项目结构
```
├── index.html              # 首页
├── index-premium.html      # 首页高端版备份
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── main.js             # 主交互逻辑
│   ├── hero-particle.js    # 首屏粒子动效
│   └── hero-v2.js          # 首屏动效V2
├── pages/                  # 子页面
│   ├── about.html          # 关于工作室（导师+学生）
│   ├── projects.html       # 项目成果（工作室项目+毕设+获奖）
│   ├── activities.html     # 活动与合作
│   ├── cooperation.html    # 校企合作
│   ├── contact.html        # 联系我们
│   ├── mentor-detail.html  # 导师详情
│   ├── mentors.html        # 导师全屏滚动浏览
│   ├── student-detail.html # 学生详情
│   ├── project-detail.html # 项目详情
│   ├── award-detail.html   # 获奖详情
│   └── activity-detail.html# 活动详情
└── .nojekyll               # GitHub Pages 配置
```

## 如何在其他电脑上继续更新

1. 安装 Git（https://git-scm.com/）
2. 克隆仓库：
   ```bash
   git clone https://github.com/2708053544/Weave-Lab--wz.git
   ```
3. 修改文件后提交：
   ```bash
   git add -A
   git commit -m "描述你的修改内容"
   git push origin main
   ```
4. 推送后 GitHub Pages 会自动更新网站

## 技术栈
- 纯 HTML5 + CSS3 + JavaScript（无框架依赖）
- Canvas 粒子动效
- CSS Grid / Flexbox 响应式布局
- IntersectionObserver 滚动动画
