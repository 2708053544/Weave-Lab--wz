/* ============================================================
   mentors-3d.js — 导师 3D 卡片展示逻辑
   零依赖。两种模式自动识别：
   - 独立整页（body.m3-page）：滚轮/键盘切换卡片
   - 嵌入长页 section（.m3-section）：
     · 鼠标在照片卡片上左右滑动 → 切换老师（同参考视频）
     · 其他位置滚轮一律正常滚动页面，到板块头尾自然衔接上下板块
   进入板块时播放一次进场动画：卡片依次飞入叠好（停在第一位），
   左侧文字逐行浮现。
   换真实老师：只改下面的 TEACHERS 数组
   ============================================================ */

/* ---------------- 数据接口 ---------------- */
const TEACHERS = [
  {
    id: '1',
    name: '张寞轩',
    short: '张',
    title: '讲师 / 创新创业教育导师 / 工作室负责人',
    email: '1016520133@qq.com',
    major: '服务设计与互联网营销 / AI产品与智能交互',
    blog: 'https://blog.weavelab.com/zhangmoxuan',
    photo: '../images/teachers/teacher1.jpg',
    photoPos: 'center top',
    link: 'mentor-detail.html?id=1'
  },
  {
    id: '2',
    name: '刘海斌',
    short: '刘',
    title: '副教授 / 人工智能教育专家',
    email: '#',
    major: '人工智能教育 / 智能硬件 / AI工程化',
    blog: 'https://lhbzx1984.github.io/personal-blog/',
    photo: '../images/teachers/teacher2.png',
    photoPos: 'center top',
    link: 'mentor-detail.html?id=2'
  },
  {
    id: '3',
    name: '边元',
    short: '边',
    title: '助教 / 智能交互设计专业教师',
    email: 'bianyuan0326@163.com',
    major: '工业设计 / 微创手术机器人 / 人机交互',
    blog: 'https://126013.github.io/bianyuan-buke/',
    photo: '../images/teachers/teacher3.png',
    photoPos: 'center top',
    link: 'mentor-detail.html?id=3'
  },
  {
    id: '4',
    name: '苏俊旭',
    short: '苏',
    title: '助教 / 设计实践导师',
    email: '#',
    major: '用户体验 / 产品服务设计',
    blog: 'https://hkh168.github.io/sujunxu-homepage/',
    photo: '../images/teachers/teacher4.png',
    photoPos: 'center top',
    link: 'mentor-detail.html?id=4'
  }
];

/* ---------------- 渲染与交互 ---------------- */
(function () {
  const stack = document.getElementById('m3Stack');
  if (!stack) return; // 页面上没有卡片容器则不执行

  const root = stack.closest('.m3-root');
  const section = root ? root.closest('.m3-section') : null;
  const standalone = !section; // 独立整页 = true
  const stage = stack.closest('.m3-stage');
  const dotsBox = document.getElementById('m3Dots');
  const nameEl = document.getElementById('m3Name');
  const titleEl = document.getElementById('m3Title');
  const emailEl = document.getElementById('m3Email');
  const majorEl = document.getElementById('m3Major');
  const blogEl = document.getElementById('m3Blog');
  const curEl = document.getElementById('m3Cur');
  const hintEl = document.querySelector('.m3-info-hint');

  const total = TEACHERS.length;
  let current = 0;
  let animating = false;

  /* 生成卡片 */
  TEACHERS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'm3-card';
    card.dataset.index = i;
    card.innerHTML = `
      <div class="m3-card-photo">
        <span class="m3-initial">${t.short}</span>
        <img alt="${t.name}" loading="lazy">
      </div>
      <span class="m3-card-badge">Weave Lab</span>
      <div class="m3-card-caption">
        <span class="cap-name">${t.name}</span>
        <span class="cap-idx">0${i + 1} / 0${total}</span>
      </div>`;
    card.addEventListener('click', () => {
      if (i === current) window.location.href = t.link;
    });
    stack.appendChild(card);

    /* 照片加载成功才盖掉占位 */
    const img = card.querySelector('img');
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.src = t.photo;
    img.addEventListener('error', () => img.remove());
    /* 按苏老师为参考，其他三位头部往下移 */
    if (t.photoPos) img.style.objectPosition = t.photoPos;
  });

  /* 生成导航点 */
  TEACHERS.forEach((t, i) => {
    const dot = document.createElement('div');
    dot.className = 'm3-dot';
    dot.dataset.name = t.name;
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
  });

  const cards = Array.from(stack.children);
  const dots = Array.from(dotsBox.children);

  /* 堆叠位置分配 */
  function layout() {
    cards.forEach((card, i) => {
      card.classList.remove('pos-0', 'pos-1', 'pos-2', 'pos-3', 'pos-back', 'out-next', 'out-prev');
      if (i === current) { card.classList.add('pos-0'); return; }
      const depth = (i - current + total) % total;
      if (depth === 1) card.classList.add('pos-1');
      else if (depth === 2) card.classList.add('pos-2');
      else if (depth === 3) card.classList.add('pos-3');
      else card.classList.add('pos-back');
    });
  }

  /* 让博客整行都可以点击 */
  const blogRow = blogEl.closest('.m3-info-row');
  if (blogRow) {
    blogRow.style.cursor = 'pointer';
    blogRow.style.pointerEvents = 'auto';
    blogRow.addEventListener('click', function (e) {
      if (e.target === blogEl) return; /* 避免重复触发 */
      window.open(blogEl.href, '_blank', 'noopener');
    });
  }

  function renderText() {
    const t = TEACHERS[current];
    curEl.textContent = '0' + (current + 1);
    [nameEl, titleEl, emailEl, majorEl, blogEl].forEach(el => {
      el.classList.remove('m3-fade-swap');
      void el.offsetWidth;
      el.classList.add('m3-fade-swap');
    });
    nameEl.textContent = t.name;
    titleEl.textContent = t.title;
    emailEl.textContent = t.email;
    majorEl.textContent = t.major;
    blogEl.textContent = t.blog;
    blogEl.href = t.blog;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(target, direction) {
    if (animating || entrancePlaying) return;
    target = (target + total) % total;
    if (target === current) return;
    animating = true;
    const dir = direction || (target > current ? 1 : -1);

    const leaving = cards[current];
    leaving.classList.remove('pos-0');
    leaving.classList.add(dir > 0 ? 'out-next' : 'out-prev');

    current = target;
    setTimeout(() => {
      layout();
      renderText();
      setTimeout(() => { animating = false; }, 300);
    }, 240);
  }

  const next = () => goTo(current + 1, 1);
  const prev = () => goTo(current - 1, -1);
  const atFirst = () => current === 0;
  const atLast = () => current === total - 1;

  /* 嵌入模式：板块是否占据视口中心 */
  function sectionActive() {
    if (standalone) return true;
    const r = section.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
  }

  /* ============================================================
     进场动画：卡堆原样亮相 → 从最右往最左依次展开，横贯全屏的
     大扇形（每张脸都看得清）→ 再依次收回卡堆（停在第一位）；
     左侧文字逐行慢速浮现。只播一次。
     ============================================================ */
  let entrancePlaying = false;
  let entranceStarted = false;

  function playEntrance() {
    if (entranceStarted) return; /* 只播一次 */
    entranceStarted = true;
    entrancePlaying = true;
    /* 文字/控件由 HTML 上的 m3-booting 类预先隐藏（CSS），收回后再浮现 */

    /* 拉尾特效：每张卡克隆两个"残影"，跟随真卡但晚一点到位 */
    const ghosts = [];
    cards.forEach((card) => {
      for (let g = 2; g >= 1; g--) {
        const gh = card.cloneNode(true);
        gh.classList.add('m3-ghost');
        gh.setAttribute('aria-hidden', 'true');
        gh.style.opacity = g === 1 ? '0.32' : '0.16';
        stack.insertBefore(gh, card);
        ghosts.push({ gh, card, g });
      }
    });

    /* 计算扇形几何：4 张卡横向铺满屏幕且旋转外扩也不出屏 */
    const vw = window.innerWidth;
    const cardW = stage.offsetWidth || vw * 0.3;
    const cardH = cardW * 4 / 3; /* 卡片纵横比 3:4（与 CSS aspect-ratio 一致） */
    const ANG = 9;               /* 相邻卡夹角的一半幅度 */
    const swing = Math.sin(ANG * Math.PI / 180) * cardH * 1.35; /* 旋转使顶部外摆的宽度 */
    const margin = swing * 1.35 + 24; /* 1.35 倍冗余：旋转同时平移卡片中心 */
    const spacing = Math.min((vw - margin * 2 - cardW) / (total - 1), cardW * 0.85);
    const span = spacing * (total - 1);
    const sr = stage.getBoundingClientRect();
    const stageCx = sr.left + sr.width / 2;
    const leftCx = margin + cardW / 2; /* 最左一张的中心 x */
    const mid = (total - 1) / 2;

    /* 阶段1：短暂保持初始卡堆，看清"原本的样子" */
    /* 阶段2：从最右往最左依次展开（老师一在最右先打开） */
    setTimeout(() => {
      cards.forEach((card, i) => {
        const dx = leftCx + (total - 1 - i) * spacing - stageCx;
        const ang = (mid - i) * ANG; /* 最右微微右倾，最左微微左倾 */
        card.style.transformOrigin = '50% 135%';
        card.style.transitionDuration = '0.9s';
        card.style.transitionDelay = (i * 0.16) + 's';
        card.style.transform = `translateX(${dx.toFixed(1)}px) rotate(${ang}deg)`;
        /* 残影跟随同一变换，但更晚到位 → 拖出尾迹 */
        ghosts.forEach(({ gh, card: c, g }) => {
          if (c !== card) return;
          gh.style.transformOrigin = '50% 135%';
          gh.style.transitionDuration = '0.9s';
          gh.style.transitionDelay = `calc(${(i * 0.16).toFixed(2)}s + ${g * 0.09}s)`;
          gh.style.transform = card.style.transform;
        });
      });
    }, 550);

    /* 阶段3：同样从右往左依次收回卡堆（残影同样拖尾跟随） */
    setTimeout(() => {
      cards.forEach(card => { card.style.transform = ''; });
      ghosts.forEach(({ gh, card: c, g }) => {
        gh.style.transitionDelay = `calc(${(cards.indexOf(c) * 0.16).toFixed(2)}s + ${g * 0.09}s)`;
        gh.style.transform = '';
      });
    }, 2300);

    /* 收尾：清掉临时样式与残影，交还给日常切换逻辑 */
    setTimeout(() => {
      cards.forEach(card => {
        card.style.transitionDelay = '';
        card.style.transitionDuration = '';
        card.style.transformOrigin = '';
      });
      ghosts.forEach(({ gh }) => gh.remove());
      entrancePlaying = false;

      /* 所有弹出物收回后，解除隐藏并让文字/控件逐个浮现 */
      root.classList.remove('m3-booting');
      const seq = [
        ['.m3-sec-header', 0.15],
        ['.m3-info-label', 0.35],
        ['#m3Name', 0.6],
        ['#m3Title', 0.85],
        ['.m3-info-hint', 1.1],
        ['.m3-counter', 0.6],
        ['#m3Dots', 0.85],
        ['.m3-arrow.prev', 1.1],
        ['.m3-arrow.next', 1.2]
      ];
      seq.forEach(([sel, delay]) => {
        const el = root.querySelector(sel);
        if (!el) return;
        /* 清掉可能卡死在起始帧的旧 CSS 动画（如 m3-fade-swap），避免压住浮现 */
        el.classList.remove('m3-fade-swap');
        el.getAnimations().forEach(a => a.cancel());
        /* 用 WAAPI 播放：结束后自动停留在 to 状态，不依赖 animationend */
        el.animate(
          [
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          { duration: 1000, delay: delay * 1000, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'both' }
        );
      });
    }, 4200);
  }

  if (standalone) {
    playEntrance();
  } else {
    /* 滚到板块首次占住视口时播放；另设兜底定时器，
       避免 IO 因渲染暂停等原因不触发导致文字永久隐藏 */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && en.intersectionRatio >= 0.45) {
          io.disconnect();
          playEntrance();
        }
      });
    }, { threshold: [0.45] });
    io.observe(section);
    setTimeout(() => playEntrance(), 3000);
  }

  /* ============================================================
     滚轮分区：
     - 嵌入模式：鼠标在照片卡片范围内滚轮=循环切换老师
       （老师4再往下滚回到老师1）；范围外不监听，滚轮正常滚动页面
     - 独立整页：全页滚轮循环切换
     进场动画播放期间不响应。
     ============================================================ */
  let wheelLock = 0;
  function wheelSwitch(e) {
    if (entrancePlaying) { e.preventDefault(); return; }
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return;
    e.preventDefault();
    const now = Date.now();
    if (now - wheelLock < 700) return;
    wheelLock = now;
    e.deltaY > 0 || e.deltaX > 0 ? next() : prev();
  }
  if (standalone) {
    window.addEventListener('wheel', wheelSwitch, { passive: false });
  } else {
    stage.addEventListener('wheel', wheelSwitch, { passive: false });
  }

  /* ============================================================
     触摸：手指按在照片卡片上滑动才切换，其他位置正常滚页面
     ============================================================ */
  let tsX = 0, tsY = 0, hijack = null;
  window.addEventListener('touchstart', (e) => {
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
    hijack = null;
    if (standalone) { hijack = undefined; return; }
    const r = stage.getBoundingClientRect();
    const x = e.touches[0].clientX, y = e.touches[0].clientY;
    const onStage = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (!onStage) hijack = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (hijack === null) {
      if (!sectionActive()) { hijack = false; return; }
      const dy = e.touches[0].clientY - tsY;
      if (Math.abs(dy) < 10) return;
      hijack = true; /* 按在照片上：始终接管并循环切换 */
    }
    if (hijack) e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (hijack === undefined) { /* 独立整页：任意滑动切换 */
      const dx = e.changedTouches[0].clientX - tsX;
      const dy = e.changedTouches[0].clientY - tsY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      if (Math.abs(dx) >= Math.abs(dy)) { dx < 0 ? next() : prev(); }
      else { dy < 0 ? next() : prev(); }
      return;
    }
    if (hijack !== true) return;
    const dx = e.changedTouches[0].clientX - tsX;
    const dy = e.changedTouches[0].clientY - tsY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    if (Math.abs(dx) >= Math.abs(dy)) { dx < 0 ? next() : prev(); }
    else { dy < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------------- 键盘（同样循环切换） ---------------- */
  window.addEventListener('keydown', (e) => {
    if (!sectionActive() || entrancePlaying) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
  });

  /* ---------------- 箭头按钮 / 导航点 ---------------- */
  const prevBtn = document.querySelector('.m3-arrow.prev');
  const nextBtn = document.querySelector('.m3-arrow.next');
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  /* ---------------- 鼠标视差（光晕 + 卡片堆倾斜） ---------------- */
  window.addEventListener('mousemove', (e) => {
    const rect = root.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    document.body.style.setProperty('--mx', mx.toFixed(3));
    document.body.style.setProperty('--my', my.toFixed(3));
  });

  /* ---------------- 提示文案按模式区分 ---------------- */
  if (hintEl) {
    hintEl.textContent = standalone
      ? '滚动切换 · 点击卡片查看详情'
      : '照片上滚动滚轮切换 · 点击卡片查看详情';
  }

  /* 初始渲染 */
  layout();
  renderText();
})();
