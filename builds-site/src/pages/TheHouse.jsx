import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { styles } from "../ui.js";
const ORG_DEPARTMENTS = [
  {
    id: "literature",
    label: "Literature",
    director: { role: "Director of Literature", name: "Abdullah Usman", photo: "/team/director-literature.jpg" },
    dd: { role: "Deputy Director", name: "Momina Sajid", photo: "/team/dd-literature.jpg" },
    coordinators: [
      { role: "Coordinator, Books Club", name: "Unaisah Hassan", photo: "/team/coordinator-books-club.jpg" },
    ],
  },
  {
    id: "debates",
    label: "Debates",
    director: { role: "Director of Debates", name: "Ayesha Noor", photo: "/team/director-debates.jpg" },
    dd: { role: "Deputy Director", name: "To be announced", photo: "/team/dd-debates.jpg" },
    coordinators: [
      { role: "Coordinator, MUNs", name: "To be announced", photo: "/team/coordinator-muns.jpg" },
      { role: "Coordinator, Debates", name: "Amber Abdullah", photo: "/team/coordinator-debates.jpg" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    director: { role: "Director of Operations", name: "Muhammad Umer Abid", photo: "/team/director-operations.jpg" },
    dd: { role: "Deputy Director", name: "To be announced", photo: "/team/dd-operations.jpg" },
    coordinators: [
      { role: "Media & IT", name: "Abiha Talat", photo: "/team/coordinator-media-it.jpg" },
      { role: "Marketing", name: "Muhammad Gillani", photo: "/team/coordinator-marketing.jpg" },
      { role: "Logistics", name: "Hassan Shakeel", photo: "/team/coordinator-logistics.jpg" },
    ],
  },
];

const BOARD_MEMBERS = Array.from({ length: 7 }, () => "To be announced");
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

function OrgAvatar({ label, photo, size = 48 }) {
  const [errored, setErrored] = useState(false);
  if (photo && !errored) {
    return (
      <img
        src={photo}
        alt={label}
        onError={() => setErrored(true)}
        style={{ width: size, height: size, borderRadius: 6, objectFit: "cover", margin: "0 auto 12px", display: "block", border: "1px solid #E2E6EF" }}
      />
    );
  }
  return (
    <div style={{ ...styles.orgAvatar, width: size, height: size, fontSize: size * 0.34 }}>
      {label.charAt(0)}
    </div>
  );
}

function OrgCard({ role, name, photo, small }) {
  return (
    <div style={small ? styles.orgCardSmall : styles.orgCardBig}>
      <OrgAvatar label={name} photo={photo} size={small ? 88 : 128} />
      <div style={small ? styles.orgRole : styles.orgRoleBig}>{role}</div>
      <div style={small ? styles.orgName : styles.orgNameBig}>{name}</div>
    </div>
  );
}

export default function TheHouse() {
  const [openDept, setOpenDept] = useState(null);
  const [boardOpen, setBoardOpen] = useState(false);
  const toggle = (id) => setOpenDept((cur) => (cur === id ? null : id));
  const activeDept = ORG_DEPARTMENTS.find((d) => d.id === openDept) || null;
  const activeIdx = ORG_DEPARTMENTS.findIndex((d) => d.id === openDept);

  return (
    <section style={styles.section}>
      <div style={styles.sectionEyebrow}>THE HOUSE</div>
      <h2 style={styles.h2}>Cabinet &amp; Wings</h2>
      <p style={{ ...styles.bodyText, maxWidth: 640, marginBottom: 12 }}>
        The Society's structure, top to bottom. Directors sit beneath their wings —
        tap a wing to reveal its deputy directorate and coordinators (opening one
        closes the others), or tap the Board of Directors for its membership.
      </p>

      <div style={styles.orgChart}>
        {/* President */}
        <OrgCard role="President" name="Meerab Zafar" photo="/team/president.jpg" big />
        <div style={styles.orgStem} />
        <div style={styles.orgBar} />

        {/* VP + GS */}
        <div className="org-row-2" style={styles.orgRow2}>
          {/* VP branch — departments live here */}
          <div style={styles.orgCol}>
            <div style={styles.orgStemShort} />
            <OrgCard role="Vice President" name="Dionyria Katlin Fardy" photo="/team/vice-president.jpg" />
            <div style={styles.orgStemShort} />
            <div style={styles.orgBar} />

            {/* Level 3: department buttons — always in an equal-width grid so all three stay level, whichever is expanded */}
            <div className="org-row-3" style={styles.orgRow3}>
              {ORG_DEPARTMENTS.map((dept) => {
                const isOpen = openDept === dept.id;
                return (
                  <div key={dept.id} style={styles.deptCol}>
                    <div style={styles.orgStemShort} />
                    <button
                      style={{ ...styles.deptButton, ...(isOpen ? styles.deptButtonOpen : {}) }}
                      onClick={() => toggle(dept.id)}
                      aria-expanded={isOpen}
                    >
                      <span>{dept.label}</span>
                      <ChevronDown
                        size={16}
                        style={{ transition: "transform 300ms ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                      />
                    </button>
                    <div style={styles.orgStemShort} />
                    <OrgCard role={dept.director.role} name={dept.director.name} photo={dept.director.photo} small />
                  </div>
                );
              })}
            </div>

            {/* Expanded directorate — one shared full-width panel; its content is column-aligned so it opens beneath the selected wing's own director */}
            <div style={{ ...styles.expandWrap, ...(activeDept ? styles.expandWrapOpen : {}) }}>
              <div style={styles.expandInner}>
                {activeDept && (
                  <div className="dir-panel" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 32, width: "100%", maxWidth: 640, margin: "0 auto", alignItems: "start" }}>
                    <div style={{ gridColumn: `${activeIdx + 1} / ${activeIdx + 2}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={styles.orgStemShort} />
                      <OrgCard role={activeDept.dd.role} name={activeDept.dd.name} photo={activeDept.dd.photo} />
                    </div>
                    {activeDept.coordinators.length > 1 && (
                      <div
                        className="dir-panel-coords"
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: 24,
                          justifyContent: activeIdx === 0 ? "flex-start" : activeIdx === 1 ? "center" : "flex-end",
                          flexWrap: "wrap",
                          width: "100%",
                        }}
                      >
                        {activeDept.coordinators.map((c) => (
                          <div key={c.role} style={styles.coordCol}>
                            <div style={styles.orgStemTiny} />
                            <OrgCard role={c.role} name={c.name} photo={c.photo} small />
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDept.coordinators.length === 1 && (
                      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: activeIdx === 0 ? "flex-start" : activeIdx === 1 ? "center" : "flex-end" }}>
                        <OrgCard role={activeDept.coordinators[0].role} name={activeDept.coordinators[0].name} photo={activeDept.coordinators[0].photo} small />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GS branch — no departments here */}
          <div style={styles.orgCol}>
            <div style={styles.orgStemShort} />
            <OrgCard role="General Secretary" name="Muhammad Haris" photo="/team/general-secretary.jpg" />
            <div style={styles.orgStemShort} />
            <button
              type="button"
              style={{ ...styles.boardButton, ...(boardOpen ? styles.boardButtonOpen : {}) }}
              onClick={() => setBoardOpen((v) => !v)}
              aria-expanded={boardOpen}
            >
              <OrgAvatar label="Board of Directors" size={40} />
              <div>
                <div style={styles.orgRole}>Board of Directors</div>
                <div style={styles.boardName}>7 Members</div>
              </div>
              <ChevronDown
                size={16}
                style={{ transition: "transform 300ms ease", transform: boardOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
              />
            </button>
            <div style={{ ...styles.expandWrap, ...(boardOpen ? styles.expandWrapOpen : {}) }}>
              <div style={styles.expandInner}>
                <div style={styles.orgStemShort} />
                {BOARD_MEMBERS.map((name, i) => (
                  <div key={i} className="bod-row" style={styles.boardRow}>
                    <span style={styles.boardIndex}>{ROMAN[i]}</span>
                    <span style={styles.boardName}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 28, lineHeight: 1.6 }}>
        Placeholder names and photos above — send me the real cabinet and I'll drop them in
        (and can wire this section to the Admin panel so you can edit it yourselves).
      </p>
    </section>
  );
}
