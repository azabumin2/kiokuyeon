// Small helpers for the admin "site settings" screen (also unit-tested by tools/test_site_settings.mjs).
(function (w) {
  'use strict';
  const ID_RE = /^[A-Za-z0-9_-]{11}$/;
  const HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'];

  // YouTube video ID from a pasted URL (watch, youtu.be, shorts, embed) or a bare 11-character ID; otherwise null.
  function parseYouTubeId(input) {
    const s = String(input || '').trim();
    if (ID_RE.test(s)) return s;
    let u;
    try { u = new URL(s); } catch (e) { return null; }
    if (!HOSTS.includes(u.hostname)) return null;
    let id = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);
      if (m) id = m[1];
    }
    return id && ID_RE.test(id) ? id : null;
  }

  // Whole days from "today" (in Korea time) until a YYYY-MM-DD date; negative once it has passed; null if invalid.
  function daysUntil(dateStr, today) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return null;
    const target = Date.parse(dateStr + 'T00:00:00Z');
    if (Number.isNaN(target)) return null;
    const kst = new Date((today || new Date()).getTime() + 9 * 3600e3).toISOString().slice(0, 10);
    return Math.round((target - Date.parse(kst + 'T00:00:00Z')) / 86400e3);
  }

  w.KS = { parseYouTubeId, daysUntil };
})(window);
