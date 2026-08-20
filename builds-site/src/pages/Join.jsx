import { Mail, Clock } from "lucide-react";
import { styles } from "../ui.js";

function isJoinWindowOpen(jw) {
  if (!jw || !jw.openDate || !jw.closeDate) return true;
  const now = new Date();
  const open = new Date(jw.openDate + "T" + (jw.openTime || "00:00"));
  const close = new Date(jw.closeDate + "T" + (jw.closeTime || "23:59"));
  return now >= open && now <= close;
}

function formatNextOpen(jw) {
  if (!jw || !jw.openDate) return null;
  const d = new Date(jw.openDate + "T" + (jw.openTime || "09:00"));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    + " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function Join({ joinForm, setJoinForm, submitJoin, joinSent, joinError, joinErrors, joinWindow }) {
  const field = (key) => ({
    ...styles.input,
    ...(joinErrors[key] ? styles.inputError : {}),
  });

  const isOpen = isJoinWindowOpen(joinWindow);

  if (!isOpen) {
    return (
      <section style={{ ...styles.section, maxWidth: 520, textAlign: "center" }}>
        <div style={styles.sectionEyebrow}>MEMBERSHIP</div>
        <h2 style={styles.h2}>Join BUILDS</h2>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "4px solid var(--accent)",
          padding: "32px 28px",
          marginTop: 12,
        }}>
          <Clock size={32} style={{ color: "var(--accent)", marginBottom: 14 }} />
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
            Applications are currently closed
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 16 }}>
            The next joining session will start on
          </p>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--accent)",
          }}>
            {formatNextOpen(joinWindow)}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 14, lineHeight: 1.6 }}>
            Check back then, or follow us on Instagram{" "}
            <a href="https://instagram.com/builds.bseas" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              @builds.bseas
            </a>{" "}
            for updates.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ ...styles.section, maxWidth: 640 }}>
      <div style={styles.sectionEyebrow}>MEMBERSHIP</div>
      <h2 style={styles.h2}>Join BUILDS</h2>
      <p style={styles.bodyText}>
        Fill in the form below and a member of the secretariat will reach out with your
        induction session details.
      </p>
      <form onSubmit={submitJoin} style={styles.form} noValidate>
        <label style={styles.label}>Full name</label>
        <input style={field("name")} value={joinForm.name} autoComplete="name"
          onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })} />
        {joinErrors.name && <div style={styles.fieldError}>{joinErrors.name}</div>}

        <label style={styles.label}>Enrollment number</label>
        <input style={field("enrollment")} value={joinForm.enrollment} placeholder="e.g. 01-222222-111" maxLength={13} autoComplete="off"
          onChange={(e) => setJoinForm({ ...joinForm, enrollment: e.target.value })} />
        {joinErrors.enrollment && <div style={styles.fieldError}>{joinErrors.enrollment}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Department</label>
            <input style={field("department")} value={joinForm.department} placeholder="e.g. BSCS" autoComplete="organization"
              onChange={(e) => setJoinForm({ ...joinForm, department: e.target.value })} />
            {joinErrors.department && <div style={styles.fieldError}>{joinErrors.department}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Semester</label>
            <input style={field("semester")} value={joinForm.semester} placeholder="e.g. 3rd" inputMode="numeric" autoComplete="off"
              onChange={(e) => setJoinForm({ ...joinForm, semester: e.target.value })} />
            {joinErrors.semester && <div style={styles.fieldError}>{joinErrors.semester}</div>}
          </div>
        </div>

        <label style={styles.label}>Email</label>
        <input type="email" style={field("email")} value={joinForm.email} autoComplete="email"
          onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })} />
        {joinErrors.email && <div style={styles.fieldError}>{joinErrors.email}</div>}

        <label style={styles.label}>WhatsApp contact</label>
        <input type="tel" style={field("whatsapp")} value={joinForm.whatsapp} placeholder="e.g. 03001234567" inputMode="tel" autoComplete="tel"
          onChange={(e) => setJoinForm({ ...joinForm, whatsapp: e.target.value })} />
        {joinErrors.whatsapp && <div style={styles.fieldError}>{joinErrors.whatsapp}</div>}

        <label style={styles.label}>Which wing would you like to join?</label>
        <div style={styles.checkRow}>
          {["Debates", "Literature"].map((wing) => (
            <label key={wing} style={styles.checkOption}>
              <input
                type="checkbox"
                checked={joinForm.interests.includes(wing)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...joinForm.interests, wing]
                    : joinForm.interests.filter((w) => w !== wing);
                  setJoinForm({ ...joinForm, interests: next });
                }}
              />
              {wing}
            </label>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: -2 }}>
          Select both if you'd like to be part of both wings.
        </p>
        {joinErrors.interests && <div style={styles.fieldError}>{joinErrors.interests}</div>}

        <label style={styles.label}>Why do you want to join?</label>
        <textarea style={{ ...styles.input, minHeight: 100, resize: "vertical" }} value={joinForm.reason}
          onChange={(e) => setJoinForm({ ...joinForm, reason: e.target.value })} />

        <button type="submit" className="btn-maroon" style={{ ...styles.btnPrimary, marginTop: 8, alignSelf: "flex-start" }}>
          <Mail size={16} /> Submit Application
        </button>
        {joinSent && <div style={styles.successNote}>Thank you — your application has been recorded.</div>}
        {joinError && <div style={styles.errorNote}>{joinError}</div>}
      </form>
    </section>
  );
}
