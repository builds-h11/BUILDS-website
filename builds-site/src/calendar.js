/* Reads the BUILDS calendar from its Google Calendar iCal feed and maps it
   to the shape the Order Paper / Calendar pages expect:
     { id, title, date, time, venue, motion, description }
   Convention: the FIRST LINE of the event description is shown as the motion
   (the italic line in quotes); any following lines become the description.

   Google's calendar.google.com feed does not send CORS headers, so the fetch
   is routed through a small CORS proxy (CALENDAR_ICS_PROXY) when the feed is
   an absolute URL. Same-origin paths (e.g. "/calendar.ics" via a Netlify
   redirect) are fetched directly. */

import { CALENDAR_ICS_URL, CALENDAR_ICS_PROXY, CALENDAR_ICS_LOCAL_PATH } from "./calendar-config.js";

const WEEKDAYS = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtHm(d) {
  const min = d.getMinutes();
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad2(min)} ${ampm}`;
}

function unescapeICS(s) {
  return (s || "").replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

function decodeEntities(s) {
  return (s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

/* Google Calendar stores rich-text descriptions as HTML. Convert block
   elements to line breaks, strip the tags, and decode entities so the text
   reads cleanly (and the first paragraph becomes the motion). */
function htmlToText(s) {
  return decodeEntities(
    (s || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  );
}

/* ---------- ICS text → VEVENT maps ---------- */

function unfold(text) {
  return text.replace(/\r?\n[ \t]/g, "");
}

function parseVEvents(text) {
  const events = [];
  let cur = null;
  for (const line of unfold(text).split(/\r?\n/)) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const parts = head.split(";");
    const key = parts[0].toUpperCase();
    const tzid = parts.find((p) => /^TZID=/i.test(p))?.slice(5);
    if (!cur[key]) cur[key] = [];
    cur[key].push({ value, tzid });
  }
  return events;
}

function firstProp(ev, name) {
  return ev[name] && ev[name].length ? ev[name][0] : null;
}

/* ---------- date/time helpers ---------- */

function icsToLocal(raw, tzid) {
  const dt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(raw);
  if (dt) {
    const [, y, mo, d, h, mi, s, z] = dt;
    const utc = z || (tzid && tzid.toUpperCase() === "UTC");
    const local = utc
      ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
      : new Date(+y, +mo - 1, +d, +h, +mi, +s);
    return { date: dateStr(local), time: fmtHm(local) };
  }
  const dd = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  if (dd) return { date: `${dd[1]}-${dd[2]}-${dd[3]}`, time: "" };
  return null;
}

function parseRRule(str) {
  const out = {};
  for (const part of str.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return out;
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function nthWeekdayOfMonth(y, mo, dow, n) {
  const total = new Date(y, mo + 1, 0).getDate();
  if (n > 0) {
    let d = 1;
    while (new Date(y, mo, d).getDay() !== dow) d++;
    return d + (n - 1) * 7;
  }
  let d = total;
  while (new Date(y, mo, d).getDay() !== dow) d--;
  return d + (n + 1) * 7;
}

/* Expands an RRULE into concrete day instances, bounded by `horizon`.
   Supports FREQ=DAILY/WEEKLY/MONTHLY/YEARLY, INTERVAL, COUNT, UNTIL,
   BYDAY (incl. "1MO" / "-1FR" ordinals) and BYMONTH/BYMONTHDAY. */
function expandInstances({ startDate, rrule, exdates, horizon }) {
  const res = [];
  const freq = rrule.FREQ || "DAILY";
  const interval = Math.max(1, parseInt(rrule.INTERVAL, 10) || 1);
  const count = parseInt(rrule.COUNT, 10);
  const maxN = count || Infinity;
  const untilStr = rrule.UNTIL ? icsToLocal(rrule.UNTIL).date : null;
  const byday = (rrule.BYDAY || "").split(",").filter(Boolean);
  const bymonth = (rrule.BYMONTH || "").split(",").filter(Boolean).map(Number);
  const bymonthday = (rrule.BYMONTHDAY || "").split(",").filter(Boolean).map(Number);
  const startDow = new Date(startDate.y, startDate.m, startDate.d).getDay();
  const dayKey = (y, mo, d) => `${y}-${pad2(mo + 1)}-${pad2(d)}`;
  const pastEnd = (y, mo, d) => {
    const k = dayKey(y, mo, d);
    if (untilStr && k > untilStr) return true;
    if (horizon && new Date(y, mo, d) > horizon) return true;
    return false;
  };
  const emit = (y, mo, d) => {
    if (res.length >= maxN) return false;
    if (exdates.has(dayKey(y, mo, d))) return false;
    if (pastEnd(y, mo, d)) return false;
    res.push({ y, m: mo, d });
    return true;
  };

  if (freq === "DAILY") {
    let cur = new Date(startDate.y, startDate.m, startDate.d);
    while (res.length < maxN) {
      if (pastEnd(cur.getFullYear(), cur.getMonth(), cur.getDate())) break;
      emit(cur.getFullYear(), cur.getMonth(), cur.getDate());
      cur = addDays(cur, interval);
    }
  } else if (freq === "WEEKLY") {
    const days = byday.length
      ? [...new Set(byday.map((b) => WEEKDAYS[b.replace(/[^A-Z]/g, "")]))].sort((a, b) => a - b)
      : [startDow];
    let wk = addDays(new Date(startDate.y, startDate.m, startDate.d), -startDow);
    while (res.length < maxN) {
      if (pastEnd(wk.getFullYear(), wk.getMonth(), wk.getDate())) break;
      for (const dow of days) {
        const cand = addDays(wk, dow);
        if (cand < new Date(startDate.y, startDate.m, startDate.d)) continue;
        emit(cand.getFullYear(), cand.getMonth(), cand.getDate());
      }
      wk = addDays(wk, 7 * interval);
    }
  } else if (freq === "MONTHLY") {
    let curY = startDate.y, curM = startDate.m;
    while (res.length < maxN) {
      if (pastEnd(curY, curM, 1)) break;
      const daysInMo = new Date(curY, curM + 1, 0).getDate();
      if (byday.length) {
        for (const b of byday) {
          const m = /^(-?\d+)?([A-Z]{2})$/.exec(b);
          if (!m) continue;
          const ord = m[1] ? parseInt(m[1], 10) : null;
          const dow = WEEKDAYS[m[2]];
          if (ord !== null) {
            const dd = nthWeekdayOfMonth(curY, curM, dow, ord);
            if (dd >= 1 && dd <= daysInMo) emit(curY, curM, dd);
          } else {
            for (let d = 1; d <= daysInMo; d++) {
              if (res.length >= maxN) break;
              if (new Date(curY, curM, d).getDay() === dow) emit(curY, curM, d);
            }
          }
        }
      } else {
        const dm = bymonthday.length ? bymonthday[0] : startDate.d;
        emit(curY, curM, Math.min(Math.max(dm, 1), daysInMo));
      }
      curM += interval;
      curY += Math.floor(curM / 12);
      curM = ((curM % 12) + 12) % 12;
    }
  } else if (freq === "YEARLY") {
    let curY = startDate.y;
    while (res.length < maxN) {
      if (pastEnd(curY, 0, 1)) break;
      const months = bymonth.length ? bymonth : [startDate.m + 1];
      for (const mo of months) {
        const daysInMo = new Date(curY, mo, 0).getDate();
        if (byday.length) {
          for (const b of byday) {
            const m = /^(-?\d+)?([A-Z]{2})$/.exec(b);
            if (!m) continue;
            const ord = m[1] ? parseInt(m[1], 10) : null;
            const dow = WEEKDAYS[m[2]];
            if (ord !== null) {
              const dd = nthWeekdayOfMonth(curY, mo - 1, dow, ord);
              if (dd >= 1 && dd <= daysInMo) emit(curY, mo - 1, dd);
            } else {
              for (let d = 1; d <= daysInMo; d++) {
                if (res.length >= maxN) break;
                if (new Date(curY, mo - 1, d).getDay() === dow) emit(curY, mo - 1, d);
              }
            }
          }
        } else {
          const dm = bymonthday.length ? bymonthday[0] : startDate.d;
          emit(curY, mo - 1, Math.min(Math.max(dm, 1), daysInMo));
        }
      }
      curY += interval;
    }
  }
  return res;
}

/* ---------- feed → app events ---------- */

export function parseICS(text) {
  const now = new Date();
  const horizon = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
  const out = [];

  for (const vevent of parseVEvents(text)) {
    const status = firstProp(vevent, "STATUS")?.value?.toUpperCase();
    if (status === "CANCELLED") continue;

    const start = firstProp(vevent, "DTSTART");
    if (!start) continue;
    const parsed = icsToLocal(start.value, start.tzid);
    if (!parsed) continue;

    const descLines = htmlToText(unescapeICS(firstProp(vevent, "DESCRIPTION")?.value || ""))
      .split("\n").map((l) => l.trim()).filter(Boolean);
    const title = htmlToText(unescapeICS(firstProp(vevent, "SUMMARY")?.value || "Untitled event")).trim() || "Untitled event";
    const venue = htmlToText(unescapeICS(firstProp(vevent, "LOCATION")?.value || "")).trim();
    const uid = firstProp(vevent, "UID")?.value || `${title}-${parsed.date}`;

    const exdates = new Set();
    for (const p of vevent.EXDATE || []) {
      for (const v of p.value.split(",")) {
        const t = icsToLocal(v.trim(), p.tzid);
        if (t) exdates.add(t.date);
      }
    }

    const rruleProp = firstProp(vevent, "RRULE");
    const instances = rruleProp
      ? expandInstances({
          startDate: { y: +parsed.date.slice(0, 4), m: +parsed.date.slice(5, 7) - 1, d: +parsed.date.slice(8, 10) },
          rrule: parseRRule(rruleProp.value),
          exdates,
          horizon,
        })
      : [{ y: +parsed.date.slice(0, 4), m: +parsed.date.slice(5, 7) - 1, d: +parsed.date.slice(8, 10) }];

    for (const inst of instances) {
      out.push({
        id: `${uid}-${inst.y}-${pad2(inst.m + 1)}-${pad2(inst.d)}`,
        title,
        date: `${inst.y}-${pad2(inst.m + 1)}-${pad2(inst.d)}`,
        time: parsed.time,
        venue,
        motion: descLines[0] || "",
        description: descLines.slice(1).join(" "),
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendar feed ${res.status}`);
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Not an iCal feed");
  return text;
}

/* Tries the same-origin endpoint first (in production Netlify proxies
   /calendar.ics → Google so there is no third party involved). Falls back to
   the CORS proxy with retries — this covers local dev, where vite preview
   returns the SPA page (not iCal) for /calendar.ics. A relative
   CALENDAR_ICS_URL is always fetched directly (useful for testing). */
async function fetchFeed() {
  if (!CALENDAR_ICS_URL) return null;
  const isExternal = /^https?:\/\//i.test(CALENDAR_ICS_URL);
  const attempts = [];
  if (!isExternal) {
    attempts.push(CALENDAR_ICS_URL);
  } else {
    if (CALENDAR_ICS_LOCAL_PATH) attempts.push(CALENDAR_ICS_LOCAL_PATH);
    if (CALENDAR_ICS_PROXY) attempts.push(CALENDAR_ICS_PROXY + encodeURIComponent(CALENDAR_ICS_URL));
  }
  let lastErr;
  for (const endpoint of attempts) {
    for (let t = 0; t < 3; t++) {
      try {
        return await fetchText(endpoint);
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 600 * (t + 1)));
      }
    }
  }
  throw lastErr;
}

/* Upcoming events only — powers the Order Paper and the home-page card. */
export async function fetchCalendarEvents() {
  const text = await fetchFeed();
  if (text === null) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateStr(today);
  return parseICS(text).filter((e) => e.date >= todayStr);
}

/* The whole current session — every event from Jan 1 of the current year
   up to the parse horizon — powers the BUILDS Calendar. Keeps past years out
   but lets future session years (e.g. 2027) show once they have events. */
export async function fetchYearEvents() {
  const text = await fetchFeed();
  if (text === null) return null;
  const start = `${new Date().getFullYear()}-01-01`;
  return parseICS(text).filter((e) => e.date >= start);
}
