import { useEffect, useRef } from 'react';

/** Cycling headline slides — each pairs plain text with a gradient-highlighted
 *  phrase, matching the colors used in the aurora/particle background. */
const SLIDES = [
  { lead: 'Laptops for', accent: 'work & play.', from: '#5cc3ef', to: '#7ac142' },
  { lead: 'Printers that', accent: 'just work.', from: '#7ac142', to: '#f5e13f' },
  { lead: 'Displays that', accent: 'go big.', from: '#f5e13f', to: '#5cc3ef' },
  { lead: 'Gear for', accent: 'every setup.', from: '#5cc3ef', to: '#7ac142' },
];

const TRANS = 'opacity 0.6s cubic-bezier(.2,.7,.2,1), transform 0.6s cubic-bezier(.2,.7,.2,1), filter 0.6s ease';

export default function MotionRevealHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoSlideRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    // ---------- background video ----------
    const v = videoRef.current;
    let vidWatch: ReturnType<typeof setInterval> | undefined;
    if (v) {
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      const kick = () => {
        const p = v.play();
        if (p?.catch) p.catch(() => {});
      };
      const events = ['loadeddata', 'canplay', 'canplaythrough', 'playing', 'stalled', 'waiting', 'suspend', 'pause'];
      events.forEach((ev) => v.addEventListener(ev, kick));
      v.addEventListener('ended', () => {
        v.currentTime = 0;
        kick();
      });
      let last = -1;
      vidWatch = setInterval(() => {
        if (v.readyState >= 2) {
          if (v.paused || v.currentTime === last) kick();
        }
        last = v.currentTime;
      }, 1200);
      try {
        v.load();
      } catch {
        // ignore
      }
      kick();
    }

    // ---------- mouse-following spotlight ----------
    let raf: number | null = null;
    let mx = 0;
    let my = 0;
    const paint = () => {
      raf = null;
      const sp = spotlightRef.current;
      if (!sp) return;
      sp.style.background = `radial-gradient(560px circle at ${mx}px ${my}px, rgba(92,195,239,0.1), rgba(122,193,66,0.05) 34%, transparent 62%)`;
    };
    const onMouseMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    root.addEventListener('mousemove', onMouseMove, { passive: true });

    // ---------- drifting particle canvas ----------
    const cv = canvasRef.current;
    let ctx: CanvasRenderingContext2D | null = null;
    let running = false;
    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string }[] = [];
    let canvasRaf: number | null = null;

    const resize = () => {
      if (!cv) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seedDots = () => {
      const colors = ['#5cc3ef', '#7ac142', '#f5e13f', '#ffffff', '#e11d48'];
      dots = Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.8 + 0.5,
        a: Math.random() * 0.5 + 0.2,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const tick = () => {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.fillStyle = d.c;
        ctx.globalAlpha = d.a;
        ctx.shadowBlur = 8;
        ctx.shadowColor = d.c;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      canvasRaf = requestAnimationFrame(tick);
    };

    if (cv) {
      ctx = cv.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      seedDots();
      running = true;
      canvasRaf = requestAnimationFrame(tick);
    }

    // ---------- headline sequence ----------
    const prep = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(34px)';
      el.style.filter = 'blur(9px)';
    };
    const enter = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.transition = TRANS;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.filter = 'blur(0px)';
    };
    const exit = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.transition = TRANS;
      el.style.opacity = '0';
      el.style.transform = 'translateY(-34px)';
      el.style.filter = 'blur(9px)';
    };

    let inView = false;
    let played = false;

    function resetScene() {
      timers.forEach(clearTimeout);
      timers.length = 0;
      slideRefs.current.forEach((s) => prep(s));
      const wrap = logoWrapRef.current;
      if (wrap) {
        wrap.style.transition = 'none';
        wrap.style.opacity = '0';
        wrap.style.clipPath = 'inset(0 100% 0 0)';
      }
      const shine = shineRef.current;
      if (shine) {
        shine.style.transition = 'none';
        shine.style.left = '-60%';
      }
      const tag = tagRef.current;
      if (tag) {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(12px)';
      }
      const line = lineRef.current;
      if (line) {
        line.style.transition = 'none';
        line.style.width = '0';
      }
    }

    function play() {
      resetScene();
      const headings = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      const IN = 620;
      const HOLD = 1450;
      const step = IN + HOLD;
      let t = 450;

      headings.forEach((el) => {
        const start = t;
        at(start, () => enter(el));
        at(start + step, () => exit(el));
        t += step;
      });

      const logoAt = t;
      at(logoAt, () => {
        enter(logoSlideRef.current);
        const wrap = logoWrapRef.current;
        if (wrap) {
          wrap.style.transition = 'clip-path 1s cubic-bezier(.72,0,.16,1), opacity 0.5s ease';
          wrap.style.opacity = '1';
          wrap.style.clipPath = 'inset(0 0 0 0)';
        }
      });
      at(logoAt + 780, () => {
        const shine = shineRef.current;
        if (shine) {
          shine.style.transition = 'left 0.8s cubic-bezier(.4,0,.2,1)';
          shine.style.left = '150%';
        }
      });
      at(logoAt + 700, () => {
        const line = lineRef.current;
        if (line) {
          line.style.transition = 'width 0.8s cubic-bezier(.4,0,.2,1)';
          line.style.width = 'clamp(120px, 22vw, 300px)';
        }
      });
      at(logoAt + 950, () => {
        const tag = tagRef.current;
        if (tag) {
          tag.style.opacity = '1';
          tag.style.transform = 'none';
        }
      });

      at(logoAt + 3400, () => {
        if (inView) play();
      });
    }

    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              inView = true;
              if (!played) {
                played = true;
                play();
              }
            } else {
              inView = false;
            }
          });
        },
        { threshold: 0.4 },
      );
      io.observe(root);
    } else {
      play();
    }

    return () => {
      running = false;
      if (canvasRaf) cancelAnimationFrame(canvasRaf);
      if (vidWatch) clearInterval(vidWatch);
      timers.forEach(clearTimeout);
      root.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden"
      style={{
        height: '100vh',
        minHeight: 480,
        maxHeight: 940,
        background: '#06070c',
        color: '#eef1f8',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          src="/videos/motion-reveal-bg.mp4"
          autoPlay
          playsInline
          preload="auto"
          muted
          loop
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          ref={auroraRef}
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: 0.78,
            transition: 'opacity 0.6s',
            mixBlendMode: 'screen',
            background:
              'radial-gradient(70% 60% at 18% 28%, rgba(92,195,239,0.18), transparent 60%), radial-gradient(70% 60% at 82% 72%, rgba(122,193,66,0.14), transparent 60%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(6,7,12,0.34)' }} />
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block w-full h-full" style={{ opacity: 0.7 }} />
        <div ref={spotlightRef} aria-hidden className="absolute inset-0 block" style={{ mixBlendMode: 'screen' }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 100%, transparent 34%, rgba(6,7,12,0.55) 78%, rgba(6,7,12,0.92) 100%)',
          }}
        />
      </div>

      {/* Foreground sequence */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center px-6 py-[60px]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.accent}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute w-full flex items-center justify-center px-6"
            style={{ opacity: 0, willChange: 'opacity, transform, filter', transform: 'translateY(-34px)', filter: 'blur(9px)' }}
          >
            <h2
              className="m-0 text-center"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(2.4rem, 7.6vw, 6.4rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.038em',
                color: '#f2f5fc',
                maxWidth: '17ch',
              }}
            >
              {slide.lead}{' '}
              <span style={{ background: `linear-gradient(100deg, ${slide.from}, ${slide.to}) text`, color: 'transparent' }}>
                {slide.accent}
              </span>
            </h2>
          </div>
        ))}

        <div
          ref={logoSlideRef}
          className="absolute w-full flex flex-col items-center justify-center px-6"
          style={{ opacity: 1, willChange: 'opacity, transform, filter', transform: 'translateY(0)', filter: 'blur(0px)' }}
        >
          <div
            ref={logoWrapRef}
            className="relative"
            style={{ opacity: 1, clipPath: 'inset(0)', transition: 'clip-path 1s cubic-bezier(.72,0,.16,1), opacity 0.5s' }}
          >
            <img
              src="/logica-logo-shine.png"
              alt="Logica"
              style={{ display: 'block', height: 'clamp(58px, 9vw, 118px)', width: 'auto', filter: 'drop-shadow(0 8px 34px rgba(0,0,0,0.55))' }}
            />
            <div
              ref={shineRef}
              aria-hidden
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: '-60%',
                width: '42%',
                background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.6), transparent)',
                transform: 'skewX(-18deg)',
                transition: 'left 0.8s cubic-bezier(.4,0,.2,1)',
              }}
            />
          </div>
          <div
            ref={tagRef}
            className="uppercase"
            style={{
              marginTop: 'clamp(20px, 3vh, 34px)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(0.66rem, 1.15vw, 0.86rem)',
              letterSpacing: '0.32em',
              color: 'rgba(238,241,248,0.72)',
              opacity: 0,
              transform: 'translateY(12px)',
              transition: 'opacity 0.7s, transform 0.7s',
            }}
          >
            Tech that just makes sense.
          </div>
          <div
            ref={lineRef}
            style={{
              marginTop: 22,
              width: 0,
              height: 2,
              background: 'linear-gradient(90deg, #5cc3ef, #7ac142 55%, #f5e13f)',
              boxShadow: '0 0 16px rgba(92,195,239,0.6)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
