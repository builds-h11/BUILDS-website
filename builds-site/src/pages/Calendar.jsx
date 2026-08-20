import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, CalendarPlus } from "lucide-react";
import { styles, fmtDate, downloadICS } from "../ui.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n) => String(n).padStart(2, "0");

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function monthKey(m) {
  return `${new Date().getFullYear()}-${pad(m + 1)}`;
}

function buildCells(year, m, byMonth) {
  const byDay = {};
  for (const ev of byMonth[monthKey(m)] || []) {
    const d = parseInt((ev.date || "").split("-")[2], 10);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(ev);
  }
  const lead = (new Date(year, m, 1).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth(year, m); d++) cells.push({ month: m, d, events: byDay[d] || [] });
  return cells;
}

function DayCell({ cell, year, today, selectedDate, onSelect }) {
  const dateObj = new Date(year, cell.month, cell.d);
  const isPast = dateObj < today;
  const isToday = dateObj.getTime() === today.getTime();
  const hasEvents = cell.events.length > 0;
  const iso = `${year}-${pad(cell.month + 1)}-${pad(cell.d)}`;
  const isSel = selectedDate === iso;

  const numStyle = isToday
    ? { ...styles.calDayNumToday, ...(hasEvents ? styles.calDayNumTodayEvent : {}) }
    : hasEvents
      ? styles.calDayNumEvent
      : styles.calDayNum;

  if (!hasEvents) {
    return (
      <div className="cal-day-cell" style={isPast ? { ...styles.calDayCell, ...styles.calDayPast } : styles.calDayCell}>
        <div style={numStyle}>{cell.d}</div>
      </div>
    );
  }

  return (
    <div
      className="cal-day-cell cal-day-btn"
      role="button"
      tabIndex={0}
      aria-expanded={isSel}
      onClick={() => onSelect(isSel ? null : { date: iso, events: cell.events })}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(isSel ? null : { date: iso, events: cell.events }); } }}
      title={cell.events.map((ev) => `${ev.title}${ev.time ? " · " + ev.time : ""}`).join("\n")}
      style={{
        ...styles.calDayCell,
        ...styles.calDayBtn,
        ...(isPast ? styles.calDayPast : {}),
        ...(isSel ? styles.calDayBtnSel : {}),
      }}
    >
      <div style={styles.calDayNumWrap}>
        <div className={hasEvents ? "cal-day-num-event" : undefined} style={numStyle}>{cell.d}</div>
        {isToday && <div style={styles.calEventDot} />}
      </div>
    </div>
  );
}

export default function Calendar({ events }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = now.getFullYear();
  const [selected, setSelected] = useState(null);

  const byMonth = {};
  for (const ev of events) {
    const k = (ev.date || "").slice(0, 7);
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(ev);
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionEyebrow}>THE SESSION · {year}</div>
      <h2 style={styles.h2}>BUILDS Calendar</h2>
      <p style={{ ...styles.bodyText, maxWidth: 640 }}>
        The {year} session at a glance — all twelve months, every date. Days that hold a sitting are
        ringed in green; today is ringed in white. Click a green day to open its notice.
      </p>
      <div className="cal-year-grid" style={styles.calYearGrid}>
        {MONTHS.map((m, i) => (
          <div key={m} className="cal-year-month" style={styles.calYearMonth}>
            <div style={styles.calYearMonthHead}>
              <span style={styles.calYearMonthName}>{m}</span>
              <span style={styles.calYearMonthYear}>{year}</span>
            </div>
            <div style={styles.calMonthHeadRow}>
              {WEEKDAYS.map((d) => <div key={d} style={styles.calMonthHeadCell}>{d}</div>)}
            </div>
            <div style={styles.calMonthGrid}>
              {buildCells(year, i, byMonth).map((cell, idx) =>
                cell === null
                  ? <div key={`b${idx}`} style={styles.calDayCell} />
                  : <DayCell key={`${i}-${cell.d}`} cell={cell} year={year} today={today} selectedDate={selected && selected.date} onSelect={setSelected} />
              )}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={styles.calDetail}>
          <div style={{ flex: 1 }}>
            <div style={styles.calDetailMeta}>
              <span><CalendarIcon size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{fmtDate(selected.date)}</span>
              <span>{selected.events.length} {selected.events.length === 1 ? "sitting" : "sittings"}</span>
            </div>
            {selected.events.map((ev) => (
              <div key={ev.id} style={styles.calDetailEvent}>
                <div style={styles.calDetailTitle}>{ev.title}</div>
                <div style={styles.calDetailMeta}>
                  {ev.time && <span><Clock size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{ev.time}</span>}
                  {ev.venue && <span><MapPin size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{ev.venue}</span>}
                </div>
                {ev.motion && <div style={styles.calDetailMotion}>“{ev.motion}”</div>}
                {ev.description && <div style={styles.orderDesc}>{ev.description}</div>}
                <button className="btn-outline" style={styles.orderCalBtn} onClick={() => downloadICS(ev)}>
                  <CalendarPlus size={14} /> Add to calendar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
