import { Calendar, FileText, Users, Info, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/events", label: "Order Paper", icon: FileText, desc: "View upcoming debates & events" },
  { path: "/calendar", label: "Calendar", icon: Calendar, desc: "Monthly event schedule" },
  { path: "/team", label: "The House", icon: Users, desc: "Meet our executive committee" },
  { path: "/about", label: "About", icon: Info, desc: "Learn about BUILDS" },
  { path: "/login", label: "Secretariat", icon: Lock, desc: "Admin access" },
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
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "18px 20px",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    textDecoration: "none",
  },
  cardHover: {
    borderColor: "var(--accent)",
    boxShadow: "0 4px 12px rgba(22,35,63,0.08)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "var(--brand)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 17,
    fontWeight: 700,
    color: "var(--ink)",
    marginBottom: 2,
  },
  desc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12.5,
    color: "var(--ink-muted)",
  },
};

export default function More() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.eyebrow}>EXPLORE</div>
      <h2 style={styles.title}>More</h2>
      <div style={styles.grid}>
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
                <Icon size={20} />
              </div>
              <div>
                <div style={styles.label}>{item.label}</div>
                <div style={styles.desc}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
