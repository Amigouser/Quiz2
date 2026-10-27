// ─── Сжатие загруженных видео (ffmpeg) ───────────────────────────────────────
// Видео перекодируется в H.264 до 720p — так оно весит в разы меньше и
// играет в любом браузере. Сжимаем по одному файлу за раз, чтобы не
// перегружать сервер. ffmpeg берём из пакета @ffmpeg-installer/ffmpeg
// (ставится вместе с npm install) или из FFMPEG_PATH.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { run, get, all } = require("../db");

const VIDEOS_DIR = path.join(__dirname, "..", "..", "data", "videos");
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

function ffmpegPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try { return require("@ffmpeg-installer/ffmpeg").path; } catch (_) { return "ffmpeg"; }
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath(), args, { windowsHide: true });
    let tail = "";
    p.stderr.on("data", (d) => { tail = (tail + d.toString()).slice(-2000); });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(tail.trim().split("\n").slice(-3).join(" ") || `ffmpeg exit ${code}`))));
  });
}

const safeUnlink = (f) => { try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} };

async function compress(videoId, tmpFile) {
  const out = path.join(VIDEOS_DIR, `${videoId}.mp4`);
  const poster = path.join(VIDEOS_DIR, `${videoId}.jpg`);
  try {
    await runFfmpeg([
      "-y", "-i", tmpFile,
      "-vf", "scale=-2:min(720\\,ih)",          // не выше 720p, пропорции сохраняются
      "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-ac", "2",
      "-movflags", "+faststart",                  // видео начинает играть до полной загрузки
      out,
    ]);
    // обложка — кадр с 1-й секунды (для совсем коротких видео — первый кадр)
    await runFfmpeg(["-y", "-ss", "1", "-i", out, "-frames:v", "1", "-vf", "scale=960:-2", poster])
      .catch(() => runFfmpeg(["-y", "-i", out, "-frames:v", "1", "-vf", "scale=960:-2", poster]));
    // видео удалили, пока оно сжималось — файлы не нужны
    if (!get("SELECT id FROM videos WHERE id = ?", videoId)) { safeUnlink(out); safeUnlink(poster); return; }
    run("UPDATE videos SET status = 'ready', error = NULL, size_final = ?, poster = ? WHERE id = ?",
      fs.statSync(out).size, fs.existsSync(poster) ? `/media/videos/${videoId}.jpg` : null, videoId);
  } catch (e) {
    safeUnlink(out); safeUnlink(poster);
    run("UPDATE videos SET status = 'failed', error = ? WHERE id = ?", String(e.message).slice(0, 500), videoId);
  } finally {
    safeUnlink(tmpFile);
  }
}

// Очередь: один файл за раз
let queue = Promise.resolve();
function enqueue(videoId, tmpFile) {
  queue = queue.then(() => compress(videoId, tmpFile));
}

function removeVideoFiles(videoId) {
  safeUnlink(path.join(VIDEOS_DIR, `${videoId}.mp4`));
  safeUnlink(path.join(VIDEOS_DIR, `${videoId}.jpg`));
}

// Если сервер перезапустился во время сжатия — помечаем такие видео неудачными
function recoverInterrupted() {
  for (const v of all("SELECT id FROM videos WHERE status = 'processing'")) {
    run("UPDATE videos SET status = 'failed', error = 'Сервер перезапустился во время сжатия — загрузи видео ещё раз' WHERE id = ?", v.id);
  }
  for (const f of fs.readdirSync(VIDEOS_DIR)) if (f.startsWith("upload-")) safeUnlink(path.join(VIDEOS_DIR, f));
}

module.exports = { VIDEOS_DIR, enqueue, removeVideoFiles, recoverInterrupted };
