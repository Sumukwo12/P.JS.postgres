import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;
    let mouse = { x: -999, y: -999 };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove  = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onTouch = (e) => {
      if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });

    const orbs = [
      { x:150, y:200, vx:.3,  vy:.2,  r:280, h:24,  a:.20 },
      { x:650, y:280, vx:-.25,vy:.28, r:320, h:195, a:.17 },
      { x:380, y:480, vx:.2,  vy:-.22,r:240, h:32,  a:.15 },
      { x:880, y:160, vx:-.18,vy:.2,  r:220, h:265, a:.13 },
      { x:280, y:680, vx:.25, vy:-.15,r:200, h:45,  a:.12 },
      { x:1050,y:550, vx:-.2, vy:.18, r:180, h:210, a:.11 },
    ];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 900,
      vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
      s: Math.random()*2.2+.5, a: Math.random()*.55+.2, p: Math.random()*Math.PI*2,
    }));
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#08080e'; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid
      ctx.strokeStyle = 'rgba(249,115,22,.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 55) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 55) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        const dx = mouse.x - o.x, dy = mouse.y - o.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 480) { o.x += dx*.001; o.y += dy*.001; }
        const W = canvas.width, H = canvas.height;
        if (o.x < -o.r) o.x = W+o.r; if (o.x > W+o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H+o.r; if (o.y > H+o.r) o.y = -o.r;
        const pulse = o.a + Math.sin(t*.8 + o.x*.01)*.04;
        const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
        g.addColorStop(0, `hsla(${o.h},90%,62%,${pulse})`);
        g.addColorStop(.4,`hsla(${o.h},90%,55%,${pulse*.55})`);
        g.addColorStop(1, `hsla(${o.h},90%,50%,0)`);
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });

      if (mouse.x > -900) {
        const mg = ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,170);
        mg.addColorStop(0,'rgba(249,115,22,.15)'); mg.addColorStop(1,'rgba(249,115,22,0)');
        ctx.beginPath(); ctx.arc(mouse.x,mouse.y,170,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
      }

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.p += .03;
        if (p.x<0) p.x=canvas.width; if (p.x>canvas.width) p.x=0;
        if (p.y<0) p.y=canvas.height; if (p.y>canvas.height) p.y=0;
        const pa = p.a*(0.7+Math.sin(p.p)*.3);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,175,70,${pa})`; ctx.fill();
      });

      // vignette
      const vg = ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,Math.max(canvas.width,canvas.height)*.75);
      vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.4)');
      ctx.fillStyle=vg; ctx.fillRect(0,0,canvas.width,canvas.height);

      t += .007;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
