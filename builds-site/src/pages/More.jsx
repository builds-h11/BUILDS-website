import { CalendarDays, ScrollText, Users, Info, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/events", label: "Order Paper", icon: ScrollText },
  { path: "/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/team", label: "The House", icon: Users },
  { path: "/about", label: "About", icon: Info },
  { path: "/login", label: "Secretariat", icon: Lock },
];

const styles = {
  page: {
    padding: "32px 0",
    maxWidth: 480,
    margin: "0 auto",
  },
  eyebrow: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    letterSpacing: 2,
    color: "var(--accent)",
    fontWeight: 600,
    marginBottom: 10,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 34,
    fontWeight: 700,
    color: "var(--ink)",
    margin: "0 0 28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "28px 16px",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
    textDecoration: "none",
    borderRadius: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "var(--brand)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--ink)",
    textAlign: "center",
  },
};

export default function More() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.eyebrow}>EXPLORE</div>
      <h2 style={styles.title}>More</h2>
      <div className="more-grid" style={styles.grid}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              style={styles.card}
              className="more-card"
              onClick={() => navigate(item.path)}
            >
              <div style={styles.iconWrap}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div style={styles.label}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
