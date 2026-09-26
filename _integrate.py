import re

p = r'E:\AA\网站\Weave-Lab--wz\index.html'
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 1. Add Cormorant Garamond font after existing Google Fonts link
old_font = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
new_font = old_font + '\n<link href="https://miaoda.feishu.cn/fonts/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">'
assert old_font in s
s = s.replace(old_font, new_font)

# 2. Replace the entire hero section
old_hero_start = '  <!-- Hero Section -->'
old_hero_end = '  </section>\n\n  <!-- About + Research Section -->'
i1 = s.index(old_hero_start)
i2 = s.index(old_hero_end) + len('  </section>')

new_hero = '''  <!-- Hero Section: Weave Light Canvas -->
  <section id="hero" class="hero-immersive hero-weave">
    <canvas id="weave-stage"></canvas>
    <div class="weave-grain"></div>

    <div class="weave-content">
      <span class="weave-label-top">智能体验与服务工程实验室</span>
      <h1 class="weave-title">Weave<span class="weave-line2">Lab</span></h1>
      <p class="weave-sub-en">WEAVING LIGHT INTO REALITY</p>
      <div class="weave-divider"></div>
      <p class="weave-sub-zh">以光为线 · 织缆数字之境</p>
      <a href="#about" class="weave-cta">了解实验室</a>
    </div>

    <div class="weave-scroll-hint">SCROLL</div>
  </section>'''

s = s[:i1] + new_hero + s[i2:]

# 3. Remove hero-particle.js script tag
s = s.replace('  <script src="js/hero-particle.js"></script>\n', '')

# 4. Add weave styles + script before </body>
weave_style_and_script = '''
  <!-- Weave Light Hero (self-contained) -->
  <style>
    .hero-weave { background:#050508; }
    #weave-stage { position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; }
    .weave-grain {
      position:absolute; inset:0; z-index:3; pointer-events:none;
      opacity:0.05; mix-blend-mode:overlay;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .weave-content {
      position:absolute; top:50%; left:10%; transform:translateY(-50%);
      z-index:10; pointer-events:none; user-select:none;
    }
    .weave-label-top {
      font-family:'Noto Sans SC',sans-serif; font-weight:400;
      font-size:11px; letter-spacing:0.35em; color:rgba(255,255,255,0.5);
      text-transform:uppercase; display:block; margin-bottom:18px;
    }
    .weave-title {
      font-family:'Cormorant Garamond','Times New Roman',serif;
      font-weight:400; font-size:clamp(60px,9vw,130px);
      line-height:0.95; letter-spacing:0.02em; color:#fff;
      text-shadow:0 0 40px rgba(180,200,255,0.2);
    }
    .weave-line2 { display:block; margin-top:0.15em; }
    .weave-sub-en {
      margin-top:1.8em; font-family:'Noto Sans SC',sans-serif;
      font-weight:400; font-size:clamp(10px,0.9vw,13px);
      letter-spacing:0.35em; color:rgba(255,255,255,0.55);
      text-transform:uppercase;
    }
    .weave-divider { width:30px; height:1px; background:rgba(255,255,255,0.3); margin-top:14px; }
    .weave-sub-zh {
      margin-top:12px; font-family:'Noto Sans SC',sans-serif;
      font-weight:300; font-size:clamp(10px,0.9vw,13px);
      letter-spacing:0.2em; color:rgba(255,255,255,0.4);
    }
    .weave-cta {
      display:inline-block; margin-top:36px; pointer-events:auto;
      font-family:'Noto Sans SC',sans-serif; font-size:12px;
      letter-spacing:0.2em; color:#fff; border:1px solid rgba(255,255,255,0.4);
      padding:12px 32px; transition:all 0.3s; text-transform:uppercase;
    }
    .weave-cta:hover { background:#fff; color:#000; opacity:1; }
    .weave-scroll-hint {
      position:absolute; bottom:36px; left:10%; z-index:10;
      font-family:'Noto Sans SC',sans-serif; font-size:10px;
      letter-spacing:0.3em; color:rgba(255,255,255,0.3);
      text-transform:uppercase; pointer-events:none;
    }
    .weave-scroll-hint::before {
      content:''; display:block; width:1px; height:24px;
      background:rgba(255,255,255,0.2); margin-bottom:10px;
      animation:weaveScrollPulse 2s ease-in-out infinite;
    }
    @keyframes weaveScrollPulse {
      0%,100% { opacity:0.2; transform:scaleY(0.6); transform-origin:top; }
      50% { opacity:0.6; transform:scaleY(1); transform-origin:top; }
    }
    .weave-content > * {
      opacity:0; transform:translateY(20px);
      animation:weaveFadeUp 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .weave-content > *:nth-child(1){animation-delay:1.9s}
    .weave-content > *:nth-child(2){animation-delay:2.1s}
    .weave-content > *:nth-child(3){animation-delay:2.25s}
    .weave-content > *:nth-child(4){animation-delay:2.35s}
    .weave-content > *:nth-child(5){animation-delay:2.45s}
    .weave-content > *:nth-child(6){animation-delay:2.6s}
    @keyframes weaveFadeUp { to { opacity:1; transform:translateY(0); } }
    @media (max-width:768px) {
      .weave-content{left:8%} .weave-scroll-hint{left:8%}
    }
  </style>
  <script>
  (function() {
    const canvas = document.getElementById('weave-stage');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let W, H;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random(), y: Math.random(),
        r: Math.random()*1.5 + 0.5,
        vx: (Math.random()-0.5)*0.0008,
        vy: (Math.random()-0.5)*0.0008,
        tw: Math.random()*Math.PI*2
      });
    }
    function smoothstep(t){return t*t*(3-2*t);}
    function lerp(a,b,t){return a+(b-a)*t;}
    const PALETTES = [
      [[255,255,255,1],[170,185,255,0.9],[185,145,255,0.8],[205,125,225,0.7]],
      [[255,255,255,1],[190,225,255,0.9],[110,185,255,0.8],[60,130,220,0.7]],
      [[220,235,255,1],[140,170,250,0.9],[150,120,235,0.8],[130,80,200,0.7]]
    ];
    const CYCLE = 18;
    function getPalette(t){
      const c=(t%CYCLE)/CYCLE, seg=c*PALETTES.length;
      const idx=Math.floor(seg), st=smoothstep(seg-idx);
      const c1=PALETTES[idx%PALETTES.length], c2=PALETTES[(idx+1)%PALETTES.length];
      const out=[];
      for(let i=0;i<c1.length;i++){
        out.push([Math.round(lerp(c1[i][0],c2[i][0],st)),Math.round(lerp(c1[i][1],c2[i][1],st)),Math.round(lerp(c1[i][2],c2[i][2],st)),lerp(c1[i][3],c2[i][3],st)]);
      }
      return out;
    }
    function rgba(c){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')';}
    let mainPoints=[], auxCurves=[], elapsed=0;
    function baseMainY(t){return H*0.10+(H*0.95-H*0.10)*smoothstep(t);}
    function buildAll(){
      mainPoints=[]; const N=120;
      for(let i=0;i<N;i++){const t=i/(N-1);mainPoints.push({t:t,baseY:baseMainY,x:t*W,curX:t*W,y:baseMainY(t),curY:baseMainY(t)});}
      auxCurves=[
        {count:100,baseY:function(t){return H*0.35+(H*0.85-H*0.35)*smoothstep(t)+Math.sin(t*Math.PI)*H*0.05;},widths:[30,12,1.5],alphas:[0.03,0.06,0.45],waves:[{freq:4,amp:10,speed:0.9},{freq:8,amp:4,speed:1.5}],mouseRadius:150,mouseForce:30,grayShift:0.3},
        {count:80,baseY:function(t){return H*1.05+(H*0.55-H*1.05)*smoothstep(t);},widths:[20,8,1.2],alphas:[0.03,0.05,0.3],waves:[{freq:5,amp:6,speed:0.6}],mouseRadius:120,mouseForce:20,grayShift:0.5},
        {count:80,baseY:function(t){return H*0.9+(H*0.2-H*0.9)*smoothstep(t)+Math.sin(t*Math.PI)*H*0.03;},widths:[8,0.8],alphas:[0.02,0.2],waves:[{freq:7,amp:5,speed:1.1}],mouseRadius:100,mouseForce:15,grayShift:0.15}
      ];
      var tc=0.76;
      function topY(t){return 0.10+0.85*smoothstep(t);}
      function botY(t){return 0.35+0.50*smoothstep(t)+0.05*Math.sin(t*Math.PI);}
      var kStart=[0.1,0.3,0.5,0.7,0.9], kEnd=[0.46,0.48,0.5,0.52,0.54];
      for(var k=0;k<5;k++){
        (function(ks,ke,phase){
          auxCurves.push({count:100,baseY:function(t){
            var kv;
            if(t<=tc){kv=ks+(0.5-ks)*smoothstep(t/tc);}else{kv=0.5+(ke-0.5)*smoothstep((t-tc)/(1-tc));}
            var bandH=botY(t)-topY(t);
            var wiggle=Math.sin(t*4+elapsed*0.8+phase)*bandH*0.08;
            return H*(topY(t)+bandH*kv+wiggle);
          },widths:[1.2],alphas:[0.35],waves:[],mouseRadius:100,mouseForce:12,grayShift:0.45});
        })(kStart[k],kEnd[k],k*1.3);
      }
      for(const c of auxCurves){
        c.points=[];
        for(let i=0;i<c.count;i++){const t=i/(c.count-1);c.points.push({t:t,baseY:c.baseY,x:t*W,curX:t*W,y:c.baseY(t),curY:c.baseY(t)});}
      }
    }
    function resize(){
      W=hero.clientWidth; H=hero.clientHeight;
      canvas.width=W*dpr; canvas.height=H*dpr;
      canvas.style.width=W+'px'; canvas.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      buildAll();
    }
    function tracePath(pts){
      ctx.beginPath(); ctx.moveTo(pts[0].curX,pts[0].curY);
      for(let i=1;i<pts.length-1;i++){var xc=(pts[i].curX+pts[i+1].curX)/2, yc=(pts[i].curY+pts[i+1].curY)/2; ctx.quadraticCurveTo(pts[i].curX,pts[i].curY,xc,yc);}
      ctx.lineTo(pts[pts.length-1].curX,pts[pts.length-1].curY);
    }
    function updatePts(pts,waves,mr,mf){
      for(const p of pts){
        var t=p.t, ty=p.baseY(t);
        for(const w of waves) ty+=Math.sin(t*w.freq+elapsed*w.speed)*w.amp;
        var tx=t*W;
        if(mouse.active){var dx=p.curX-mouse.x, dy=p.curY-mouse.y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<mr&&d>0.1){var f=1-d/mr; tx+=(dx/d)*f*mf; ty+=(dy/d)*f*mf;}}
        p.curX+=(tx-p.curX)*0.08; p.curY+=(ty-p.curY)*0.08;
      }
    }
    function animate(){
      elapsed+=0.016; ctx.clearRect(0,0,W,H);
      var palette=getPalette(elapsed);
      var reveal=smoothstep(Math.min(elapsed/1.5,1));
      var mainEnd=Math.floor(reveal*(mainPoints.length-1));
      for(const pt of particles){
        pt.x+=pt.vx; pt.y+=pt.vy; pt.tw+=0.02;
        if(pt.x<0)pt.x=1; if(pt.x>1)pt.x=0;
        if(pt.y<0)pt.y=1; if(pt.y>1)pt.y=0;
        var a=(Math.sin(pt.tw)*0.5+0.5)*0.3*reveal;
        ctx.beginPath(); ctx.arc(pt.x*W,pt.y*H,pt.r,0,Math.PI*2);
        ctx.fillStyle='rgba('+palette[1][0]+','+palette[1][1]+','+palette[1][2]+','+a+')'; ctx.fill();
      }
      if(mouse.active&&reveal>=1){
        var mg=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,80);
        mg.addColorStop(0,'rgba('+palette[0][0]+','+palette[0][1]+','+palette[0][2]+',0.15)');
        mg.addColorStop(0.5,'rgba('+palette[1][0]+','+palette[1][1]+','+palette[1][2]+',0.05)');
        mg.addColorStop(1,'rgba('+palette[2][0]+','+palette[2][1]+','+palette[2][2]+',0)');
        ctx.beginPath(); ctx.arc(mouse.x,mouse.y,80,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
      }
      updatePts(mainPoints,[{freq:6,amp:8,speed:1.2},{freq:3,amp:12,speed:0.7},{freq:10,amp:3,speed:2.0}],200,45);
      var segs=[
        {t0:0.00,t1:0.50,w:45,a:0.05,blur:40},{t0:0.15,t1:0.70,w:22,a:0.08,blur:25},
        {t0:0.00,t1:0.38,w:9,a:0.85,blur:12},{t0:0.28,t1:0.60,w:5,a:0.8,blur:8},
        {t0:0.50,t1:0.80,w:2.8,a:0.75,blur:5},{t0:0.70,t1:1.00,w:1.3,a:0.9,blur:3},
        {t0:0.85,t1:1.00,w:0.7,a:1.0,blur:0}
      ];
      function paletteAt(t){
        var seg=t*(palette.length-1), i=Math.floor(seg), f=seg-i;
        var c1=palette[Math.min(i,palette.length-1)], c2=palette[Math.min(i+1,palette.length-1)];
        return [Math.round(lerp(c1[0],c2[0],f)),Math.round(lerp(c1[1],c2[1],f)),Math.round(lerp(c1[2],c2[2],f))];
      }
      for(const s of segs){
        var i0=Math.floor(s.t0*(mainPoints.length-1));
        var i1=Math.min(Math.ceil(s.t1*(mainPoints.length-1)),mainEnd);
        var sub=mainPoints.slice(i0,i1+1);
        if(sub.length<2) continue;
        var cs=paletteAt(s.t0), ce=paletteAt(s.t1);
        var grad=ctx.createLinearGradient(sub[0].curX,0,sub[sub.length-1].curX,0);
        grad.addColorStop(0,'rgba('+cs[0]+','+cs[1]+','+cs[2]+','+s.a+')');
        grad.addColorStop(1,'rgba('+ce[0]+','+ce[1]+','+ce[2]+','+s.a+')');
        ctx.beginPath(); ctx.moveTo(sub[0].curX,sub[0].curY);
        for(var j=1;j<sub.length-1;j++){var xc=(sub[j].curX+sub[j+1].curX)/2,yc=(sub[j].curY+sub[j+1].curY)/2;ctx.quadraticCurveTo(sub[j].curX,sub[j].curY,xc,yc);}
        ctx.lineTo(sub[sub.length-1].curX,sub[sub.length-1].curY);
        ctx.strokeStyle=grad; ctx.lineWidth=s.w; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.shadowBlur=s.blur; ctx.shadowColor=rgba(palette[1]); ctx.stroke();
      }
      if(reveal<1){
        var hp0=mainPoints[mainEnd], hr=60;
        var hg0=ctx.createRadialGradient(hp0.curX,hp0.curY,0,hp0.curX,hp0.curY,hr);
        hg0.addColorStop(0,'rgba(255,255,255,0.95)');
        hg0.addColorStop(0.15,'rgba(255,255,255,0.5)');
        hg0.addColorStop(0.5,'rgba(200,210,255,0.15)');
        hg0.addColorStop(1,'rgba(180,140,255,0)');
        ctx.beginPath(); ctx.arc(hp0.curX,hp0.curY,hr,0,Math.PI*2); ctx.fillStyle=hg0; ctx.fill();
      }
      ctx.shadowBlur=0;
      if(reveal>=1){
        var hp=mainPoints[Math.floor(mainPoints.length*0.55)];
        var hg=ctx.createRadialGradient(hp.curX,hp.curY,0,hp.curX,hp.curY,25);
        hg.addColorStop(0,'rgba('+palette[0][0]+','+palette[0][1]+','+palette[0][2]+',0.9)');
        hg.addColorStop(0.3,'rgba('+palette[1][0]+','+palette[1][1]+','+palette[1][2]+',0.35)');
        hg.addColorStop(1,'rgba('+palette[2][0]+','+palette[2][1]+','+palette[2][2]+',0)');
        ctx.beginPath(); ctx.arc(hp.curX,hp.curY,25,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
      }
      var wraps=[{oy:-8,ox:2,ph:0.0,w:0.8,a:0.5,wa:3},{oy:7,ox:-3,ph:1.5,w:0.6,a:0.35,wa:4},{oy:-3,ox:5,ph:3.0,w:0.5,a:0.25,wa:2}];
      for(const wl of wraps){
        var pts=mainPoints.slice(0,mainEnd+1).map(function(p){
          var t=p.t, wv=Math.sin(t*15+elapsed*3+wl.ph)*wl.wa;
          return {curX:p.curX+wl.ox+Math.cos(t*15+elapsed*3+wl.ph)*2, curY:p.curY+wl.oy+wv};
        });
        var g2=ctx.createLinearGradient(pts[0].curX,0,pts[pts.length-1].curX,0);
        for(var qi=0;qi<palette.length;qi++){var c=palette[qi];g2.addColorStop(qi/(palette.length-1),'rgba('+c[0]+','+c[1]+','+c[2]+','+wl.a+')');}
        ctx.beginPath(); ctx.moveTo(pts[0].curX,pts[0].curY);
        for(var qj=1;qj<pts.length-1;qj++){var qx=(pts[qj].curX+pts[qj+1].curX)/2,qy=(pts[qj].curY+pts[qj+1].curY)/2;ctx.quadraticCurveTo(pts[qj].curX,pts[qj].curY,qx,qy);}
        ctx.lineTo(pts[pts.length-1].curX,pts[pts.length-1].curY);
        ctx.strokeStyle=g2; ctx.lineWidth=wl.w; ctx.lineCap='round';
        ctx.shadowBlur=6; ctx.shadowColor=rgba(palette[2]); ctx.stroke();
      }
      ctx.shadowBlur=0;
      for(const c of auxCurves){
        updatePts(c.points,c.waves,c.mouseRadius,c.mouseForce);
        var visPts=c.points.slice(0,Math.floor(reveal*c.points.length)+1);
        if(visPts.length<2) continue;
        for(let layer=0;layer<c.widths.length;layer++){
          var g3=ctx.createLinearGradient(visPts[0].curX,0,visPts[visPts.length-1].curX,0);
          for(let ai=0;ai<palette.length;ai++){
            var col=palette[ai];
            var r=Math.round(lerp(col[0],120,c.grayShift)), g=Math.round(lerp(col[1],120,c.grayShift)), b=Math.round(lerp(col[2],120,c.grayShift));
            g3.addColorStop(ai/(palette.length-1),'rgba('+r+','+g+','+b+','+c.alphas[layer]+')');
          }
          tracePath(visPts); ctx.strokeStyle=g3; ctx.lineWidth=c.widths[layer]; ctx.lineCap='round'; ctx.lineJoin='round';
          ctx.shadowBlur=layer===c.widths.length-1?0:c.widths[layer]*1.5; ctx.shadowColor=rgba(palette[1]); ctx.stroke();
        }
        ctx.shadowBlur=0;
      }
      requestAnimationFrame(animate);
    }
    hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.active=true;});
    hero.addEventListener('mouseleave',function(){mouse.active=false;mouse.x=-9999;mouse.y=-9999;});
    window.addEventListener('resize',resize);
    resize(); animate();
  })();
  </script>
'''

# Insert before </body>
s = s.replace('</body>', weave_style_and_script + '\n</body>')

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("OK")
