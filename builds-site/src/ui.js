/* Shared helpers + styles for the BUILDS site.
   Extracted from App.jsx so route chunks stay small. */


export function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function eventStartDate(ev) {
  const [y, mo, d] = (ev.date || "2026-01-01").split("-").map(Number);
  let h = 0, m = 0;
  const t = (ev.time || "").trim().split(/\s*[-–—]\s*/)[0].trim();
  const m2 = t.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (m2) {
    h = parseInt(m2[1], 10);
    m = m2[2] ? parseInt(m2[2], 10) : 0;
    if (m2[3] && m2[3].toLowerCase() === "pm" && h < 12) h += 12;
    if (m2[3] && m2[3].toLowerCase() === "am" && h === 12) h = 0;
  }
  return new Date(Date.UTC(y, mo - 1, d, h, m));
}

export function nextUpcomingEvent(events) {
  if (!events.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.find((ev) => new Date(ev.date + "T00:00:00") >= today) || sorted[0];
}

export function icsTimestamp(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export function downloadICS(ev) {
  const start = eventStartDate(ev);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const esc = (s) => (s || "").replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
  const description = ev.motion
    ? `Motion: ${ev.motion}${ev.description ? " — " + ev.description : ""}`
    : (ev.description || "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BUILDS//Order Paper//EN",
    "BEGIN:VEVENT",
    `UID:builds-${ev.id}@builds-website`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(start)}`,
    `DTEND:${icsTimestamp(end)}`,
    `SUMMARY:${esc(ev.title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(ev.venue)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `builds-${(ev.title || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// Urdu/Arabic-script Unicode ranges — used to auto-detect Urdu dispatches
// and switch them to a proper Nastaliq font instead of the Latin serif.
const URDU_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
export function isUrduText(text = "") {
  return URDU_SCRIPT_RE.test(text);
}
export function urduStyle(text) {
  return isUrduText(text)
    ? { fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl", textAlign: "right", lineHeight: 2.2 }
    : {};
}

export const PATH_TITLES = {
  "/": "Home",
  "/about": "About",
  "/events": "Order Paper",
  "/calendar": "Calendar",
  "/blog": "Dispatches",
  "/team": "The House",
  "/gallery": "Gallery",
  "/join": "Join",
  "/more": "More",
  "/login": "Secretariat Login",
  "/admin": "Secretariat",
};

const serif = "'Playfair Display', Georgia, serif";
const body = "'Source Serif 4', Georgia, serif";
const utility = "'Inter', sans-serif";

export const styles = {
  page: { background: "var(--bg)", color: "var(--ink-body)", minHeight: "100vh", fontFamily: body },
  header: { position: "sticky", top: 0, zIndex: 20, background: "var(--bg)" },
  headerInner: { maxWidth: 1080, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brandRow: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  logoImg: { height: 44, width: "auto", display: "block" },
  footerBrandRow: { display: "flex", alignItems: "center", gap: 14 },
  footerLogoChip: { background: "#FFFFFF", padding: "8px 10px", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" },
  footerLogoImg: { height: 28, width: "auto", display: "block" },
  crest: { width: 40, height: 40, borderRadius: "50%", border: "2px solid #16233F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 700, fontSize: 18, color: "#16233F" },
  brandName: { fontFamily: serif, fontWeight: 700, fontSize: 20, letterSpacing: 0.5, color: "#16233F" },
  brandSub: { fontFamily: utility, fontSize: 11, letterSpacing: 0.4, color: "#5B6478", textTransform: "uppercase" },
  navDesktop: { display: "flex", gap: 28, alignItems: "center" },
  navLink: { fontFamily: utility, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", color: "var(--ink)", fontWeight: 500, textDecoration: "none" },
  hamburger: { display: "none", background: "none", border: "none", color: "var(--ink)", cursor: "pointer" },
  themeToggle: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer", flexShrink: 0 },
  themeMenuWrap: { position: "relative", marginLeft: 12, flexShrink: 0 },
  themeMenu: { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 12px 32px rgba(0,0,0,0.2)", minWidth: 168, padding: 6, zIndex: 50 },
  themeMenuOption: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, cursor: "pointer", color: "var(--ink)", fontFamily: utility, fontSize: 13.5, fontWeight: 500 },
  themeMenuOptionActive: { background: "var(--border)" },
  navMobile: { display: "flex", flexDirection: "column", background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "8px 24px 16px" },
  navMobileLink: { fontFamily: utility, fontSize: 14, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, color: "var(--ink)", padding: "14px 0", borderBottom: "1px solid var(--border)", cursor: "pointer", textDecoration: "none", display: "block" },
  headerRule: { height: 1, background: "var(--border)", maxWidth: 1080, margin: "0 auto" },
  main: { maxWidth: 1080, margin: "0 auto", padding: "0 24px" },

  hero: { padding: "72px 0 40px", maxWidth: 680 },
  heroEyebrow: { fontFamily: utility, fontSize: 12, letterSpacing: 2, color: "var(--accent)", fontWeight: 600, marginBottom: 18 },
  heroTitle: { fontFamily: serif, fontWeight: 700, fontSize: "clamp(36px, 6vw, 58px)", lineHeight: 1.08, color: "var(--ink)", margin: 0 },
  heroLede: { fontSize: 18, lineHeight: 1.7, color: "var(--ink-secondary)", marginTop: 24, maxWidth: 520 },
  heroBtnRow: { display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" },
  btnPrimary: { background: "var(--accent)", color: "#FFFFFF", border: "none", padding: "13px 24px", fontFamily: utility, fontSize: 13.5, letterSpacing: 0.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderRadius: 2 },
  btnOutline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)", padding: "13px 24px", fontFamily: utility, fontSize: 13.5, letterSpacing: 0.5, fontWeight: 600, cursor: "pointer", borderRadius: 2 },
  btnOutlineSmall: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)", padding: "9px 16px", fontFamily: utility, fontSize: 12.5, letterSpacing: 0.5, fontWeight: 600, cursor: "pointer", borderRadius: 2, display: "flex", alignItems: "center", gap: 6 },

  rule: { height: 1, background: "var(--border)", margin: "0 0" },
  ruleThin: { height: 1, background: "var(--border)", margin: "28px 0" },

  section: { padding: "56px 0" },
  sectionEyebrow: { fontFamily: utility, fontSize: 12, letterSpacing: 2, color: "var(--accent)", fontWeight: 600, marginBottom: 10 },
  h2: { fontFamily: serif, fontSize: 34, fontWeight: 700, color: "var(--ink)", margin: "0 0 20px" },
  bodyText: { fontSize: 16.5, lineHeight: 1.85, color: "var(--ink-secondary)", marginBottom: 16 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 },

  constitutionBox: { background: "var(--surface)", border: "1px solid var(--border)", borderRight: "4px solid var(--accent)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 10, height: "100%" },
  aboutGrid: { display: "grid", gridTemplateColumns: "1fr 400px", gap: 40, alignItems: "start" },
  constitutionEyebrow: { fontFamily: utility, fontSize: 11, letterSpacing: 2, color: "var(--accent)", fontWeight: 600 },
  constitutionTitle: { fontFamily: serif, fontSize: 20, fontWeight: 700, color: "var(--ink)" },
  constitutionText: { fontSize: 14.5, lineHeight: 1.75, color: "var(--ink-secondary)", margin: 0 },
  constitutionBtn: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)", padding: "11px 20px", fontFamily: utility, fontSize: 13, letterSpacing: 0.5, fontWeight: 600, cursor: "pointer", borderRadius: 2, alignSelf: "flex-start", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4 },

  nextEventCard: { background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "4px solid var(--accent)", padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" },
  nextEventDate: { fontFamily: utility, fontSize: 12, letterSpacing: 1, color: "var(--accent)", fontWeight: 600, marginBottom: 6 },
  nextEventTitle: { fontFamily: serif, fontWeight: 700, fontSize: 22, color: "var(--ink)" },
  nextEventMotion: { fontSize: 14.5, color: "var(--ink-muted)", marginTop: 8, display: "flex", alignItems: "center" },

  pillarsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 8 },
  pillarCard: { background: "var(--surface)", border: "1px solid var(--border)", padding: 26 },
  pillarIcon: { width: 40, height: 40, borderRadius: "50%", background: "var(--brand)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  pillarTitle: { fontFamily: serif, fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 8 },
  pillarBody: { fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-muted)" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  statBlock: { textAlign: "center" },
  statNum: { fontFamily: serif, fontSize: 32, fontWeight: 700, color: "var(--accent)" },
  statLabel: { fontFamily: utility, fontSize: 11.5, letterSpacing: 0.5, color: "var(--ink-muted)", textTransform: "uppercase", marginTop: 4 },

  orderItem: { display: "flex", gap: 22, background: "var(--surface)", border: "1px solid var(--border)", padding: "26px 28px", marginBottom: 18 },
  orderNumeral: { fontFamily: serif, fontSize: 28, fontWeight: 700, color: "var(--ink-muted)", minWidth: 40 },
  orderMeta: { display: "flex", gap: 18, fontFamily: utility, fontSize: 12, color: "var(--ink-muted)", marginBottom: 8, flexWrap: "wrap" },
  orderTitle: { fontFamily: serif, fontWeight: 700, fontSize: 21, color: "var(--ink)", marginBottom: 6 },
  orderMotion: { fontSize: 15, fontStyle: "italic", color: "var(--accent)", marginBottom: 8 },
  orderDesc: { fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-muted)" },
  orderCalBtn: { marginTop: 14, background: "transparent", color: "var(--ink)", border: "1px solid var(--border)", padding: "7px 14px", fontFamily: utility, fontSize: 12, letterSpacing: 0.5, fontWeight: 600, cursor: "pointer", borderRadius: 2, display: "flex", alignItems: "center", gap: 7 },
  calLink: { fontFamily: utility, fontSize: 13.5, fontWeight: 600, color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8 },

  calMonth: { marginBottom: 14 },
  calMonthHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", userSelect: "none" },
  calMonthHeadOpen: { borderLeft: "4px solid var(--accent)", paddingLeft: 15 },
  calMonthTitle: { fontFamily: serif, fontWeight: 700, fontSize: 20, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 },
  calMonthYear: { fontFamily: utility, fontSize: 12, letterSpacing: 1.5, color: "var(--ink-faint)", fontWeight: 600 },
  calNowBadge: { fontFamily: utility, fontSize: 10, letterSpacing: 1, fontWeight: 700, color: "var(--accent)", border: "1px solid var(--accent)", padding: "2px 6px", borderRadius: 2, marginLeft: 4 },
  calMonthRight: { display: "flex", alignItems: "center", gap: 12 },
  calMonthCount: { fontFamily: utility, fontSize: 12.5, color: "var(--ink-muted)", letterSpacing: 0.4 },
  calMonthChevron: { color: "var(--ink-muted)", display: "flex", alignItems: "center" },
  calGridHead: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderBottom: "none", marginTop: 12 },
  calGridHeadCell: { background: "var(--surface)", fontFamily: utility, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600, textAlign: "center", padding: "8px 0" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderTop: "none", marginBottom: 14 },
  calDay: { background: "var(--surface)", minHeight: 84, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, alignItems: "stretch" },
  calDayBlank: { background: "var(--surface)", minHeight: 84 },
  calDayNum: { fontFamily: utility, fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", lineHeight: 1.2 },
  calDayNumToday: { background: "var(--accent)", color: "#FFFFFF", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: utility, fontSize: 12, fontWeight: 700 },
  calDayPast: { opacity: 0.5 },
  calEventChip: { fontFamily: serif, fontSize: 12, lineHeight: 1.35, color: "var(--ink)", border: "1px solid var(--border)", borderLeft: "2px solid var(--accent)", background: "var(--surface)", padding: "3px 6px", borderRadius: 2, cursor: "pointer", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textAlign: "left" },
  calEventChipSelected: { borderLeftColor: "var(--brand)", color: "var(--accent)", background: "var(--border)" },
  calDetail: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap", background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "4px solid var(--brand)", padding: "18px 22px", marginBottom: 14 },
  calDetailMeta: { display: "flex", gap: 16, flexWrap: "wrap", fontFamily: utility, fontSize: 12, color: "var(--ink-muted)", alignItems: "center", marginBottom: 6 },
  calDetailTitle: { fontFamily: serif, fontWeight: 700, fontSize: 20, color: "var(--ink)", marginBottom: 6 },
  calDetailMotion: { fontSize: 15, fontStyle: "italic", color: "var(--accent)", marginBottom: 8 },
  calDetailEvent: { borderTop: "1px solid var(--border)", padding: "16px 0 4px", marginTop: 14 },
  calYearGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start", marginTop: 32 },
  calYearMonth: { background: "var(--surface)", border: "1px solid var(--border)", borderTop: "3px solid var(--accent)", display: "flex", flexDirection: "column" },
  calYearMonthHead: { display: "flex", alignItems: "baseline", gap: 8, padding: "12px 14px 2px" },
  calYearMonthName: { fontFamily: serif, fontWeight: 700, fontSize: 17, color: "var(--ink)" },
  calYearMonthYear: { fontFamily: utility, fontSize: 11, letterSpacing: 1, color: "var(--ink-faint)", fontWeight: 600 },
  calMonthHeadRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "6px 6px 0" },
  calMonthHeadCell: { fontFamily: utility, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600, textAlign: "center", padding: "4px 0" },
  calMonthGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 6px 10px" },
  calDayCell: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 32 },
  calDayBtn: { cursor: "pointer", userSelect: "none" },
  calDayBtnSel: { background: "var(--success-bg)" },
  calDayNum: { fontFamily: utility, fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", lineHeight: 1 },
  calDayNumToday: { background: "#FFFFFF", color: "var(--brand)", border: "1px solid var(--border)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontFamily: utility, fontSize: 12, fontWeight: 700, lineHeight: 1 },
  calDayNumTodayEvent: { boxShadow: "0 0 0 1px var(--success-border)" },
  calDayNumEvent: { border: "1.5px solid var(--cal-event)", color: "var(--cal-event)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontFamily: utility, fontSize: 12, fontWeight: 700, lineHeight: 1 },
  calDayNumWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  calEventDot: { width: 5, height: 5, borderRadius: "50%", background: "var(--cal-event)", marginTop: 2 },


  postGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 },
  searchRow: { position: "relative", marginBottom: 24, maxWidth: 420 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", pointerEvents: "none" },
  searchInput: { width: "100%", border: "1px solid var(--border)", background: "var(--surface)", padding: "11px 14px 11px 38px", fontSize: 15, color: "var(--ink-body)", borderRadius: 2 },
  postCard: { background: "var(--surface)", border: "1px solid var(--border)", padding: 26, cursor: "pointer" },
  postMeta: { fontFamily: utility, fontSize: 11.5, letterSpacing: 0.5, color: "var(--accent)", marginBottom: 10, textTransform: "uppercase" },
  postTitle: { fontFamily: serif, fontWeight: 700, fontSize: 20, color: "var(--ink)", marginBottom: 10 },
  postExcerpt: { fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-muted)", marginBottom: 14 },
  readMore: { fontFamily: utility, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 4 },
  backLink: { fontFamily: utility, fontSize: 13, color: "var(--accent)", cursor: "pointer", marginBottom: 20, fontWeight: 600, textDecoration: "none", display: "inline-block" },

  teamGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  teamCard: { background: "#FFFFFF", border: "1px solid #E2E6EF", padding: 24, textAlign: "center" },
  teamAvatar: { width: 56, height: 56, borderRadius: "50%", background: "#16233F", color: "#FFFFFF", fontFamily: serif, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" },
  teamRole: { fontFamily: utility, fontSize: 11.5, letterSpacing: 0.5, color: "#2C4A82", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 },
  teamName: { fontFamily: serif, fontSize: 17, fontWeight: 700, color: "#16233F" },

  orgChart: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 28 },
  orgAvatar: { borderRadius: 6, background: "var(--brand)", color: "#FFFFFF", fontFamily: serif, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", flexShrink: 0 },
  orgCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "18px 16px", textAlign: "center", width: "100%", maxWidth: 220, boxShadow: "0 2px 6px rgba(22,35,63,0.05)" },
  orgCardBig: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "26px 24px", textAlign: "center", width: "100%", maxWidth: 280, boxShadow: "0 4px 14px rgba(22,35,63,0.08)" },
  orgCardStatic: { background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "50%", width: 96, height: 96, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto", padding: 8 },
  orgRole: { fontFamily: utility, fontSize: 10.5, letterSpacing: 0.4, color: "var(--accent)", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 },
  orgRoleBig: { fontFamily: utility, fontSize: 12, letterSpacing: 0.6, color: "var(--accent)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 },
  orgName: { fontFamily: serif, fontSize: 14.5, fontWeight: 700, color: "var(--ink)" },
  orgNameBig: { fontFamily: serif, fontSize: 19, fontWeight: 700, color: "var(--ink)" },

  orgStem: { width: 1, height: 26, background: "var(--border)" },
  orgStemShort: { width: 1, height: 18, background: "var(--border)", margin: "0 auto" },
  orgStemTiny: { width: 1, height: 12, background: "var(--border)", margin: "0 auto" },
  orgBar: { height: 1, background: "var(--border)", width: "min(560px, 70%)" },
  orgBarSmall: { height: 1, background: "var(--border)", width: "80%", margin: "0 auto" },

  orgRow2: { display: "flex", gap: 100, justifyContent: "center", flexWrap: "wrap" },
  orgRow3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 32, width: "100%", maxWidth: 640, margin: "0 auto", alignItems: "start" },
  orgCol: { display: "flex", flexDirection: "column", alignItems: "center" },
  deptCol: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" },

  deptButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--brand)", color: "#FFFFFF", border: "none", borderRadius: 4, padding: "14px 16px", fontFamily: utility, fontSize: 13.5, fontWeight: 600, letterSpacing: 0.5, cursor: "pointer", boxShadow: "0 2px 8px rgba(22,35,63,0.15)", width: "100%" },
  deptButtonOpen: { background: "var(--brand-hover)" },

  expandWrap: { display: "grid", gridTemplateRows: "0fr", opacity: 0, transition: "grid-template-rows 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease", width: "100%" },
  expandWrapOpen: { gridTemplateRows: "1fr", opacity: 1 },
  expandInner: { overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" },

  coordRow: { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginTop: 0, width: "100%" },
  coordCol: { display: "flex", flexDirection: "column", alignItems: "center" },

  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 },
  galleryTile: { aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  galleryCaption: { fontFamily: utility, fontSize: 12, color: "#FFFFFF", textAlign: "center", opacity: 0.9 },
  galleryPhotoTile: { position: "relative", aspectRatio: "4/3", overflow: "hidden", border: "1px solid var(--border)", borderRadius: 2 },
  galleryPhotoImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  galleryPhotoCaption: { position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(transparent, rgba(15,24,48,0.82))", color: "#FFFFFF", fontFamily: utility, fontSize: 11.5, padding: "20px 12px 10px", textAlign: "center" },
  lightbox: { position: "fixed", inset: 0, background: "rgba(4,8,16,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" },
  lightboxStage: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, maxWidth: "min(1100px, 90vw)" },
  lightboxImg: { maxWidth: "100%", maxHeight: "78vh", objectFit: "contain", border: "1px solid var(--border)", borderRadius: 4 },
  lightboxPlate: { width: 320, height: 240, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 },
  lightboxCaption: { color: "#E6E9F2", fontFamily: utility, fontSize: 13, letterSpacing: 0.4 },
  lightboxClose: { position: "absolute", top: 18, right: 18, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 },
  lightboxNav: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 },

  form: { display: "flex", flexDirection: "column", gap: 6, marginTop: 20 },
  label: { fontFamily: utility, fontSize: 12, letterSpacing: 0.5, color: "var(--ink)", fontWeight: 600, marginTop: 12, textTransform: "uppercase" },
  checkRow: { display: "flex", gap: 20, marginTop: 4 },
  checkOption: { display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--ink-body)", fontFamily: body, cursor: "pointer" },
  input: { border: "1px solid var(--border)", background: "var(--surface)", padding: "11px 14px", fontSize: 15, color: "var(--ink-body)", borderRadius: 2 },
  inputError: { borderColor: "#E05555" },
  fieldError: { color: "#E05555", fontSize: 12.5, marginTop: 4, fontWeight: 500 },
  successNote: { background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success-text)", padding: "10px 14px", fontSize: 14, marginTop: 12, borderRadius: 2 },
  errorNote: { color: "var(--accent)", fontSize: 13, marginTop: 6 },
  emptyNote: { fontFamily: utility, fontSize: 14, color: "var(--ink-faint)", fontStyle: "italic" },

  adminTabs: { display: "flex", gap: 8, marginTop: 28, marginBottom: 8, flexWrap: "wrap" },
  adminTab: { fontFamily: utility, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, padding: "9px 16px", border: "1px solid var(--border)", cursor: "pointer", color: "var(--ink-muted)" },
  adminTabActive: { background: "var(--brand)", color: "#FFFFFF", borderColor: "var(--brand)" },
  adminGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 24, alignItems: "start" },
  adminListItem: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", padding: "14px 18px", marginBottom: 10 },
  cancelEditLink: { fontFamily: utility, fontSize: 12.5, fontWeight: 600, color: "var(--ink-muted)", cursor: "pointer" },
  adminImageItem: { display: "flex", alignItems: "center", gap: 14, background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 14px", marginBottom: 10 },
  adminImageThumb: { width: 56, height: 56, objectFit: "cover", borderRadius: 2, flexShrink: 0 },

  footer: { background: "#16233F", marginTop: 60 },
  footerInner: { maxWidth: 1080, margin: "0 auto", padding: "48px 24px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 },
  footerCols: { display: "flex", gap: 60, flexWrap: "wrap" },
  footerHead: { fontFamily: utility, fontSize: 11.5, letterSpacing: 1, color: "#5C6B8C", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 },
  footerLink: { fontFamily: utility, fontSize: 13.5, color: "#E2E6EF", marginBottom: 8, cursor: "pointer", textDecoration: "none", display: "block" },
  footerSocialLink: { fontFamily: utility, fontSize: 13.5, color: "#E2E6EF", marginBottom: 8, display: "flex", alignItems: "center", gap: 7, textDecoration: "none" },
  footerWhatsappBtn: { fontFamily: utility, fontSize: 13, fontWeight: 600, letterSpacing: 0.3, color: "#16233F", background: "#FFFFFF", display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", padding: "9px 14px", borderRadius: 3, marginTop: 6 },
  footerBottom: { borderTop: "1px solid #2C3A5C", textAlign: "center", padding: "18px 0", fontFamily: utility, fontSize: 12, color: "#7C8399" },
};