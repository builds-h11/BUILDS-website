import { useEffect, useState } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { styles } from "../ui.js";
export default function Gallery({ images = [] }) {
  const shots = [
    { label: "Annual Championship, Final Round", shape: "2x1" },
    { label: "Freshers' Open Mic", shape: "1x1" },
    { label: "Adjudicator Training Workshop", shape: "2x2" },
    { label: "Inter-University Delegation", shape: "1x1" },
    { label: "Literary Circle, Weekly Read", shape: "1x2" },
    { label: "Closing Ceremony", shape: "1x1" },
    { label: "Debate Finals, Grand Chamber", shape: "1x1" },
    { label: "Secretariat Inauguration", shape: "1x2" },
    { label: "Alumni Reunion, East Wing", shape: "2x1" },
    { label: "Orientation, New Members", shape: "1x1" },
    { label: "Workshop: Motion & Amendment", shape: "1x2" },
    { label: "Guest Lecture Series", shape: "1x1" },
    { label: "Annual Day Rehearsals", shape: "2x2" },
    { label: "House Session, Winter Term", shape: "1x1" },
    { label: "Buddy Circle Meet", shape: "2x1" },
    { label: "Cultural Evening, Amphitheatre", shape: "1x1" },
    { label: "Outreach: School Debate Clinic", shape: "1x2" },
    { label: "Panel Discussion, Round Table", shape: "2x1" },
    { label: "Election Night, Tally Desk", shape: "1x1" },
    { label: "Reading Society, Archive Hour", shape: "1x2" },
    { label: "Inter-College MUN", shape: "1x1" },
    { label: "Felicitation Ceremony", shape: "2x1" },
    { label: "Mock Parliament, Committee Room", shape: "1x1" },
    { label: "Year-End Review Board", shape: "1x1" },
  ];
  const palette = ["#16233F", "#2C4A82", "#5C6B8C", "#3B4A6B", "#0F1830", "#1B2A4A"];
  const shapeStyle = {
    "1x1": {},
    "2x1": { gridColumn: "span 2" },
    "1x2": { gridRow: "span 2" },
    "2x2": { gridColumn: "span 2", gridRow: "span 2" },
  };
  const hasReal = images.length > 0;
  const tiles = hasReal
    ? images.map((img, i) => ({ id: img.id, label: img.caption, dataUrl: img.dataUrl, color: null, real: true, shape: shots[i % shots.length].shape }))
    : shots.map((s, i) => ({ id: "plate-" + i, label: s.label, dataUrl: null, color: palette[i % palette.length], real: false, shape: s.shape }));
  const [lightbox, setLightbox] = useState(null);
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % tiles.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i + tiles.length - 1) % tiles.length);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, tiles.length]);
  const current = lightbox !== null ? tiles[lightbox] : null;
  return (
    <section style={styles.section}>
      <div style={styles.sectionEyebrow}>FROM THE ARCHIVE</div>
      <h2 style={styles.h2}>Gallery</h2>
      <p style={{ ...styles.bodyText, maxWidth: 640, marginBottom: 8 }}>
        {hasReal
          ? "Moments from the House, added by the secretariat. Click any plate to view it."
          : "Placeholder plates below — the secretariat can upload real event photography from the Admin panel."}
      </p>
      <div className="gallery-grid" style={styles.galleryGrid}>
        {tiles.map((t, i) =>
          t.real ? (
            <div key={t.id} style={{ ...styles.galleryPhotoTile, ...shapeStyle[t.shape], cursor: "pointer" }} onClick={() => setLightbox(i)}>
              <img src={t.dataUrl} alt={t.label || "BUILDS event photo"} style={styles.galleryPhotoImg} />
              {t.label && <div style={styles.galleryPhotoCaption}>{t.label}</div>}
            </div>
          ) : (
            <div key={t.id} style={{ ...styles.galleryTile, background: t.color, ...shapeStyle[t.shape], cursor: "pointer" }} onClick={() => setLightbox(i)}>
              <ImageIcon size={22} color="#FFFFFF" style={{ opacity: 0.7 }} />
              <div style={styles.galleryCaption}>{t.label}</div>
            </div>
          )
        )}
      </div>
      {current && (
        <div style={styles.lightbox} onClick={() => setLightbox(null)}>
          <button style={styles.lightboxClose} onClick={() => setLightbox(null)} aria-label="Close (Esc)">
            <X size={22} />
          </button>
          <button
            style={{ ...styles.lightboxNav, left: 16 }}
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + tiles.length - 1) % tiles.length); }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={26} />
          </button>
          <div style={styles.lightboxStage} onClick={(e) => e.stopPropagation()}>
            {current.real ? (
              <img src={current.dataUrl} alt={current.label || "BUILDS event photo"} style={styles.lightboxImg} />
            ) : (
              <div style={{ ...styles.lightboxPlate, background: current.color }}>
                <ImageIcon size={56} color="#FFFFFF" style={{ opacity: 0.85 }} />
              </div>
            )}
            {current.label && <div style={styles.lightboxCaption}>{current.label}</div>}
          </div>
          <button
            style={{ ...styles.lightboxNav, right: 16 }}
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % tiles.length); }}
            aria-label="Next photo"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </section>
  );
}
