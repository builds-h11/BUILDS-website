import { Calendar, Clock, MapPin, CalendarPlus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { styles, roman, fmtDate, downloadICS, timeToMinutes } from "../ui.js";

const ORDER_LIMIT = 3;

export default function OrderPaper({ events }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...events]
    .sort((a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time))
    .filter((ev) => new Date(ev.date + "T00:00:00") >= today)
    .slice(0, ORDER_LIMIT);
  return (
    <section style={styles.section}>
      <div style={styles.sectionEyebrow}>UPCOMING EVENTS</div>
      <h2 style={styles.h2}>The Order Paper</h2>
      <p style={{ ...styles.bodyText, maxWidth: 640 }}>
        The next business to come before the House, in order. Every sitting of the session is listed on the BUILDS Calendar.
      </p>
      <div style={{ marginTop: 32 }}>
        {sorted.length === 0 && <div style={styles.emptyNote}>No business currently before the House.</div>}
        {sorted.map((ev, i) => (
          <div key={ev.id} className="ev-card order-item" style={styles.orderItem}>
            <div style={styles.orderNumeral}>{roman[i % roman.length]}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.orderMeta}>
                <span><Calendar size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{fmtDate(ev.date)}</span>
                <span><Clock size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{ev.time}</span>
                <span><MapPin size={13} style={{ marginRight: 5, position: "relative", top: 2 }} />{ev.venue}</span>
              </div>
              <div style={styles.orderTitle}>{ev.title}</div>
              {ev.motion && <div style={styles.orderMotion}>“{ev.motion}”</div>}
              <div style={styles.orderDesc}>{ev.description}</div>
              <button className="btn-outline" style={styles.orderCalBtn} onClick={() => downloadICS(ev)}>
                <CalendarPlus size={14} /> Add to calendar
              </button>
            </div>
          </div>
        ))}
      </div>
      <Link to="/calendar" style={styles.calLink}>
        View the full session calendar <ChevronRight size={14} />
      </Link>
    </section>
  );
}
