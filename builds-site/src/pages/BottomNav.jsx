import { Home, BookOpen, Image, Users, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/blog", label: "Dispatches", icon: BookOpen },
  { path: "/gallery", label: "Gallery", icon: Image },
  { path: "/join", label: "Join", icon: Users },
  { path: "/more", label: "More", icon: MoreHorizontal },
];

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--surface)",
    borderTop: "1px solid var(--border)",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 0 12px",
    zIndex: 100,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
  },
  link: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    textDecoration: "none",
    color: "var(--ink-muted)",
    fontSize: 10,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    letterSpacing: 0.3,
    padding: "4px 12px",
    transition: "color 0.2s ease",
  },
  linkActive: {
    color: "var(--accent)",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
};

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" style={styles.nav}>
      {navItems.map((item) => {
        const isActive = item.path === "/more"
          ? location.pathname === "/more" || location.pathname === "/calendar" || location.pathname === "/events" || location.pathname === "/team" || location.pathname === "/about" || location.pathname === "/login" || location.pathname === "/admin"
          : item.path === "/blog"
            ? location.pathname.startsWith("/blog")
            : location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            }}
          >
            <span style={styles.iconWrap}>
              <Icon size={20} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
