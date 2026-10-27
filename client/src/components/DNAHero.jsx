import React, { useEffect, useRef } from "react";

// ─── Первый экран: 3D-спираль ДНК, которая раскручивается при скролле ──────
// Секция высотой ~3 экрана, внутри — «липкая» сцена на весь экран.
// Прогресс скролла 0→1: интро-надпись гаснет, спираль уезжает вправо,
// появляется основной заголовок с кнопками.

const clamp01 = (t) => Math.max(0, Math.min(1, t));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function DNAHero({ onSignup, onPrograms }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current, canvas = canvasRef.current;
    const intro = introRef.current, hero = heroRef.current;
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // three.js подгружаем отдельно — тексты и кнопки работают сразу
    let dna = null, disposed = false;
    import("./dnaScene")
      .then(({ createDnaScene }) => {
        if (disposed) return;
        try { dna = createDnaScene(canvas, mobile); }
        catch { /* нет WebGL — остаётся градиентный фон и тексты */ }
      })
      .catch(() => {});

    // рисуем только пока секция на экране
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(section);

    let raf;
    const frame = (time) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      const max = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top;
      const p = max > 0 ? clamp01(-top / max) : 0;
      const t1 = easeInOut(clamp01(p / 0.55));

      const introO = 1 - clamp01(p / 0.22);
      const heroO = clamp01((p - 0.3) / 0.25);
      intro.style.opacity = introO;
      hero.style.opacity = heroO;
      hero.style.transform = `translateY(${(1 - heroO) * 30}px)`;
      hero.style.pointerEvents = heroO > 0.5 ? "auto" : "none";

      dna?.render(p, t1, reduceMotion ? 0 : time * 0.00025, window.innerWidth <= 900);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      dna?.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="dna-hero" aria-label="Главный экран">
      <div className="dna-hero-sticky">
        <canvas ref={canvasRef} className="dna-hero-canvas" aria-hidden="true" />

        <div ref={introRef} className="dna-hero-intro">
          <div className="dna-hero-intro-pill">Репетитор по биологии</div>
          <h1 className="dna-hero-intro-title">Биология — это <em>код жизни</em></h1>
          <div className="dna-hero-hint">ЛИСТАЙТЕ ВНИЗ<i /></div>
        </div>

        <div ref={heroRef} className="dna-hero-main">
          <div className="dna-hero-box">
            <div className="dna-hero-pill">ОГЭ · ЕГЭ · ВПР · ОЛИМПИАДЫ</div>
            <h2 className="dna-hero-title">
              Подготовка по <em>биологии</em> без стресса и&nbsp;с&nbsp;интересом
            </h2>
            <p className="dna-hero-tagline">
              Виктория Никитенко — индивидуальные занятия с 5 по 11&nbsp;класс.
              Очно и онлайн. Системно, без зубрёжки, с любовью к предмету.
            </p>
            <div className="dna-hero-actions">
              <button className="lf-hero-btn dna-hero-cta" onClick={onSignup}>
                Записаться на пробное
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </button>
              <button className="lf-hero-btn lf-hero-btn-ghost dna-hero-ghost" onClick={onPrograms}>
                Программы подготовки
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const DNA_HERO_STYLES = `
  .dna-hero { position: relative; height: 300vh; background: #0b2017; }
  .dna-hero-sticky {
    position: sticky; top: 0;
    height: 100vh; height: 100svh;
    overflow: hidden;
    background: radial-gradient(ellipse at 50% 45%, #24563d 0%, #163626 45%, #0b2017 100%);
  }
  .dna-hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

  .dna-hero-intro, .dna-hero-main {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    pointer-events: none;
    color: #fff;
  }
  .dna-hero-intro {
    align-items: center; justify-content: flex-end; text-align: center;
    padding: 0 20px 9vh;
    background: linear-gradient(180deg, transparent 50%, rgba(8,24,16,0.85) 100%);
  }
  .dna-hero-intro-pill {
    font-size: 11px; letter-spacing: 0.22em; font-weight: 700; text-transform: uppercase;
    color: #b7e4c7; border: 1px solid rgba(183,228,199,0.3);
    border-radius: 999px; padding: 6px 16px; margin-bottom: 18px;
  }
  .dna-hero-intro-title {
    font-family: var(--f-serif); font-weight: 500; color: #fff;
    font-size: clamp(36px, 5.4vw, 76px); line-height: 1.04; letter-spacing: -0.02em;
    text-shadow: 0 6px 40px rgba(0,0,0,0.45);
  }
  .dna-hero-intro-title em { color: #74c69d; }
  .dna-hero-hint {
    margin-top: 34px; font-size: 10px; letter-spacing: 0.24em; color: rgba(255,255,255,0.5);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .dna-hero-hint i { width: 1px; height: 40px; background: linear-gradient(180deg, #fff, transparent); }

  .dna-hero-main { justify-content: center; padding: 64px 8vw 0; opacity: 0; }
  .dna-hero-box { max-width: 560px; }
  .dna-hero-pill {
    display: inline-block; font-size: 12px; letter-spacing: 0.14em; font-weight: 700;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    padding: 7px 16px; border-radius: 999px; color: #b7e4c7; margin-bottom: 24px;
  }
  .dna-hero-title {
    font-family: var(--f-serif); font-weight: 500; color: #fff;
    font-size: clamp(34px, 4.4vw, 64px); line-height: 1.06; letter-spacing: -0.02em;
    margin: 0 0 22px;
  }
  .dna-hero-title em { color: #f4a261; }
  .dna-hero-tagline { color: rgba(255,255,255,0.75); font-size: 17px; line-height: 1.6; margin: 0 0 30px; }
  .dna-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .dna-hero-cta { background: #f4a261; color: #1a1f1b; }
  .dna-hero-cta:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(244,162,97,0.35); }

  @media (max-width: 900px) {
    .dna-hero { height: 240vh; }
    .dna-hero-main {
      justify-content: flex-end;
      padding: 0 20px calc(28px + env(safe-area-inset-bottom));
      background: linear-gradient(180deg, transparent 25%, rgba(8,24,16,0.88) 62%);
    }
    .dna-hero-box { max-width: none; }
    .dna-hero-pill { font-size: 10px; margin-bottom: 16px; }
    .dna-hero-title { font-size: clamp(30px, 8.6vw, 46px); margin-bottom: 14px; }
    .dna-hero-tagline { font-size: 15px; margin-bottom: 22px; }
    .dna-hero-actions { flex-direction: column; }
    .dna-hero-actions .lf-hero-btn { width: 100%; justify-content: center; }
  }
  @media (min-width: 641px) and (max-width: 900px) {
    .dna-hero-main { padding: 0 40px calc(48px + env(safe-area-inset-bottom)); }
    .dna-hero-box { max-width: 620px; }
    .dna-hero-actions { flex-direction: row; }
    .dna-hero-actions .lf-hero-btn { width: auto; }
  }
  @media (max-height: 640px) and (max-width: 900px) {
    .dna-hero-tagline { display: none; }
  }
`;
