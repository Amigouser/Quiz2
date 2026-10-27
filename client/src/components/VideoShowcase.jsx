import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { parseVideoUrl, embedUrl } from "../videoEmbed";

// ─── Видео на главной ────────────────────────────────────────────────────────
// Первое видео запускается само без звука, когда блок появляется на экране;
// звук ученик включает в самом плеере. Остальные — обычные плееры ниже.
// Видео бывают двух видов: свой файл (без рекламы) и ссылка на YouTube/Rutube/VK.

// Свой файл: обычный <video>, без чужой рекламы
function FileVideo({ src, poster, title, autoplay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !autoplay) return;
    el.muted = true; // React не всегда ставит muted в DOM, а без него браузер не даст автозапуск
    // играем, только пока видео на экране — не тратим трафик и батарею
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);
  return (
    <div className="lf-video-frame">
      <video ref={ref} src={src} poster={poster || undefined} title={title || "Видео"}
        muted={autoplay} loop={autoplay} playsInline controls preload={autoplay ? "auto" : "metadata"} />
    </div>
  );
}

function VideoFrame({ video, title, autoplay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // плеер грузим, только когда блок доскроллили — главная не тормозит
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Rutube: выключаем звук и запускаем через его postMessage-API
  useEffect(() => {
    if (!visible || !autoplay || video.provider !== "rutube") return;
    const frame = ref.current?.querySelector("iframe");
    const onMessage = (e) => {
      if (e.source !== frame?.contentWindow) return;
      let d = e.data;
      try { d = typeof d === "string" ? JSON.parse(d) : d; } catch (_) { return; }
      if (d?.type === "player:ready") {
        const send = (type) => frame.contentWindow.postMessage(JSON.stringify({ type, data: {} }), "*");
        send("player:mute");
        send("player:play");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [visible, autoplay, video]);

  return (
    <div ref={ref} className="lf-video-frame">
      {visible && (
        <iframe
          src={embedUrl(video, { autoplay })}
          title={title || "Видео"}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}

export function VideoShowcase() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    API.getVideos()
      .then(list => setVideos(list
        .map(v => ({ ...v, parsed: v.kind === "file" ? null : parseVideoUrl(v.url) }))
        .filter(v => v.kind === "file" || v.parsed)))
      .catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  return (
    <div className="lf-videos">
      <div className="lf-videos-title">Видео с уроков</div>
      {videos.map((v, i) => (
        <figure key={v.id} className="lf-video">
          {v.kind === "file"
            ? <FileVideo src={v.url} poster={v.poster} title={v.title} autoplay={i === 0} />
            : <VideoFrame video={v.parsed} title={v.title} autoplay={i === 0} />}
          {v.title && <figcaption>{v.title}</figcaption>}
        </figure>
      ))}
      <div className="lf-videos-hint">Видео идёт без звука — включи звук в плеере 🔊</div>
    </div>
  );
}

export const VIDEO_STYLES = `
  .lf-videos { margin-top: 10px; display: flex; flex-direction: column; gap: 16px; }
  .lf-videos-title {
    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted);
  }
  .lf-video { margin: 0; background: var(--surface); border: 1.5px solid var(--border-soft); border-radius: 20px; overflow: hidden; box-shadow: var(--sh-sm); }
  .lf-video-frame { position: relative; aspect-ratio: 16 / 9; background: #0f2a1e; }
  .lf-video-frame iframe, .lf-video-frame video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; background: #000; }
  .lf-video figcaption { padding: 12px 16px; font-family: var(--f-serif); font-size: 16px; color: var(--text); }
  .lf-videos-hint { font-size: 12px; color: var(--text-muted); text-align: center; }
`;
