// ─── Ссылка на видео → адрес встроенного плеера ─────────────────────────────
// Поддерживаются YouTube, Rutube и ВКонтакте (vk.com / vkvideo.ru).
// autoplay — запустить сразу без звука (звук ученик включит в самом плеере).

export function parseVideoUrl(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch (_) { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const path = u.pathname;

  // YouTube: watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, /live/ID
  if (/(^|\.)youtube(-nocookie)?\.com$/.test(host) || host === "youtu.be") {
    const id = host === "youtu.be"
      ? path.slice(1).split("/")[0]
      : u.searchParams.get("v") || (path.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/) || [])[1];
    return id ? { provider: "youtube", id } : null;
  }

  // Rutube: /video/ID/, /shorts/ID, /play/embed/ID; приватные — с ?p=ключ
  if (host.endsWith("rutube.ru")) {
    const id = (path.match(/\/(?:video|shorts|play\/embed)\/(?:private\/)?([a-f0-9]{32})/i) || [])[1];
    return id ? { provider: "rutube", id, key: u.searchParams.get("p") } : null;
  }

  // VK: /video-123_456, ?z=video-123_456, video_ext.php?oid=..&id=..&hash=..
  if (/(^|\.)(vk\.com|vk\.ru|vkvideo\.ru)$/.test(host)) {
    if (path.includes("video_ext.php")) {
      const oid = u.searchParams.get("oid"), id = u.searchParams.get("id");
      return oid && id ? { provider: "vk", oid, id, hash: u.searchParams.get("hash") } : null;
    }
    const m = (path + " " + (u.searchParams.get("z") || "")).match(/video(-?\d+)_(\d+)/);
    return m ? { provider: "vk", oid: m[1], id: m[2], hash: null } : null;
  }
  return null;
}

export function embedUrl(video, { autoplay = false } = {}) {
  if (!video) return null;
  if (video.provider === "youtube") {
    const p = new URLSearchParams({ rel: "0", playsinline: "1", modestbranding: "1" });
    if (autoplay) { p.set("autoplay", "1"); p.set("mute", "1"); p.set("loop", "1"); p.set("playlist", video.id); }
    return `https://www.youtube-nocookie.com/embed/${video.id}?${p}`;
  }
  if (video.provider === "rutube") {
    // автозапуск Rutube включается через postMessage после загрузки плеера (см. VideoShowcase)
    return `https://rutube.ru/play/embed/${video.id}${video.key ? `?p=${encodeURIComponent(video.key)}` : ""}`;
  }
  if (video.provider === "vk") {
    const p = new URLSearchParams({ oid: video.oid, id: video.id, hd: "2" });
    if (video.hash) p.set("hash", video.hash);
    if (autoplay) { p.set("autoplay", "1"); p.set("muted", "1"); }
    return `https://vk.com/video_ext.php?${p}`;
  }
  return null;
}

export const PROVIDER_NAMES = { youtube: "YouTube", rutube: "Rutube", vk: "ВКонтакте" };
