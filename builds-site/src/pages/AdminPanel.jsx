import { useState } from "react";
import { Plus, Pencil, Trash2, LogOut, Download, Settings, Clock } from "lucide-react";
import { styles, fmtDate } from "../ui.js";
export default function AdminPanel({ posts, addPost, updatePost, removePost, submissions, removeSubmission, images, addImage, removeImage, joinWindow, persistJoinWindow, logout }) {
  const [panel, setPanel] = useState("blog");
  const emptyPost = { title: "", author: "", excerpt: "", content: "" };
  const [post, setPost] = useState(emptyPost);
  const [editingPostId, setEditingPostId] = useState(null);
  const [imgCaption, setImgCaption] = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  const [imgError, setImgError] = useState("");
  const [jwDraft, setJwDraft] = useState(joinWindow);
  const [jwSaved, setJwSaved] = useState(false);

  const exportSubmissionsCSV = () => {
    const cols = ["name", "enrollment", "department", "semester", "interests", "email", "whatsapp", "reason", "date"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cellValue = (s, c) => (c === "interests" ? (s.interests || []).join(" & ") : s[c]);
    const rows = [
      cols.join(","),
      ...submissions.map((s) => cols.map((c) => escape(cellValue(s, c))).join(",")),
    ];
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `builds-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startEditPost = (item) => {
    setEditingPostId(item.id);
    setPost({ title: item.title, author: item.author, excerpt: item.excerpt, content: item.content });
  };
  const cancelEditPost = () => { setEditingPostId(null); setPost(emptyPost); };
  const submitPost = (e) => {
    e.preventDefault();
    if (!post.title || !post.content) return;
    if (editingPostId) { updatePost(editingPostId, post); setEditingPostId(null); }
    else addPost({ ...post, date: new Date().toISOString().slice(0, 10) });
    setPost(emptyPost);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError("");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImgPreview(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.onerror = () => setImgError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  const submitImage = (e) => {
    e.preventDefault();
    if (!imgPreview) { setImgError("Choose an image first."); return; }
    addImage({ dataUrl: imgPreview, caption: imgCaption });
    setImgPreview(null);
    setImgCaption("");
  };

  const saveJoinWindow = () => {
    persistJoinWindow(jwDraft);
    setJwSaved(true);
    setTimeout(() => setJwSaved(false), 2500);
  };

  const inputStyle = { ...styles.input, width: "100%" };

  return (
    <section style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={styles.sectionEyebrow}>SECRETARIAT</div>
          <h2 style={styles.h2}>Admin Panel</h2>
        </div>
        <button className="btn-outline" style={styles.btnOutlineSmall} onClick={logout}>
          <LogOut size={15} /> Log out
        </button>
      </div>

      <div style={styles.adminTabs}>
        {[["blog", "Dispatches"], ["gallery", `Gallery (${images.length})`], ["submissions", `Applications (${submissions.length})`], ["settings", "Settings"]].map(([id, label]) => (
          <div key={id} style={{ ...styles.adminTab, ...(panel === id ? styles.adminTabActive : {}) }} onClick={() => setPanel(id)}>
            {label}
          </div>
        ))}
      </div>

      {panel === "blog" && (
        <div style={styles.adminGrid}>
          <form onSubmit={submitPost} style={styles.form}>
            <label style={styles.label}>Title</label>
            <input style={styles.input} value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
            <label style={styles.label}>Author</label>
            <input style={styles.input} value={post.author} onChange={(e) => setPost({ ...post, author: e.target.value })} />
            <label style={styles.label}>Excerpt</label>
            <input style={styles.input} value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} />
            <label style={styles.label}>Full content</label>
            <textarea style={{ ...styles.input, minHeight: 120 }} value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn-maroon" style={{ ...styles.btnPrimary, alignSelf: "flex-start" }}>
                {editingPostId ? <><Pencil size={16} /> Save Changes</> : <><Plus size={16} /> Publish Dispatch</>}
              </button>
              {editingPostId && (
                <span style={styles.cancelEditLink} onClick={cancelEditPost}>Cancel</span>
              )}
            </div>
          </form>
          <div>
            {posts.map((p) => (
              <div key={p.id} style={styles.adminListItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{fmtDate(p.date)} · {p.author}</div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
                  <Pencil size={16} style={{ cursor: "pointer", color: "var(--ink-muted)" }} onClick={() => startEditPost(p)} />
                  <Trash2 size={17} style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => removePost(p.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {panel === "gallery" && (
        <div className="admin-grid" style={styles.adminGrid}>
          <form onSubmit={submitImage} style={styles.form}>
            <label style={styles.label}>Photo</label>
            <input type="file" accept="image/*" style={styles.input} onChange={handleImageSelect} />
            {imgPreview && (
              <img src={imgPreview} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2, border: "1px solid #E2E6EF", marginTop: 4 }} />
            )}
            <label style={styles.label}>Caption</label>
            <input style={styles.input} value={imgCaption} onChange={(e) => setImgCaption(e.target.value)} placeholder="e.g. Annual Championship, Final Round" />
            {imgError && <div style={styles.errorNote}>{imgError}</div>}
            <button className="btn-maroon" style={{ ...styles.btnPrimary, alignSelf: "flex-start" }}>
              <Plus size={16} /> Add to Gallery
            </button>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4, lineHeight: 1.6 }}>
              Photos are resized in your browser before upload to keep things fast — original files never leave your device except as this resized copy.
            </p>
          </form>
          <div>
            {images.length === 0 && <div style={styles.emptyNote}>No photos uploaded yet.</div>}
            {images.map((img) => (
              <div key={img.id} style={styles.adminImageItem}>
                <img src={img.dataUrl} alt={img.caption || "Gallery photo"} style={styles.adminImageThumb} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{img.caption || "Untitled"}</div>
                </div>
                <Trash2 size={17} style={{ cursor: "pointer", color: "var(--accent)", flexShrink: 0 }} onClick={() => removeImage(img.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {panel === "submissions" && (
        <div style={{ marginTop: 24 }}>
          {submissions.length > 0 && (
            <button className="btn-maroon" style={{ ...styles.btnPrimary, marginBottom: 18 }} onClick={exportSubmissionsCSV}>
              <Download size={16} /> Export as CSV (opens in Excel)
            </button>
          )}
          {submissions.length === 0 && <div style={styles.emptyNote}>No applications yet.</div>}
          {submissions.map((s) => (
            <div key={s.id} style={{ ...styles.adminListItem, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name} — {s.department || "—"}{s.semester ? `, ${s.semester} semester` : ""}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>Enrollment: {s.enrollment || "—"}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{s.email} · WhatsApp: {s.whatsapp || "—"}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>
                  Wing: {(s.interests && s.interests.length) ? s.interests.join(" & ") : "—"}
                </div>
                {s.reason && <div style={{ fontSize: 13, marginTop: 6, color: "var(--ink-body)" }}>{s.reason}</div>}
              </div>
              <Trash2 size={17} style={{ cursor: "pointer", color: "var(--accent)", flexShrink: 0, marginTop: 2 }} onClick={() => removeSubmission(s.id)} />
            </div>
          ))}
        </div>
      )}

      {panel === "settings" && (
        <div style={{ marginTop: 24, maxWidth: 480 }}>
          <div style={{ ...styles.pillarCard, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Clock size={18} style={{ color: "var(--accent)" }} />
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Joining Window</div>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-muted)", marginBottom: 18, lineHeight: 1.6 }}>
              Set when the Join page accepts applications. Outside this window, visitors see the next opening date.
            </p>

            <label style={styles.label}>Opens</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input type="date" style={inputStyle} value={jwDraft.openDate}
                onChange={(e) => setJwDraft({ ...jwDraft, openDate: e.target.value })} />
              <input type="time" style={inputStyle} value={jwDraft.openTime}
                onChange={(e) => setJwDraft({ ...jwDraft, openTime: e.target.value })} />
            </div>

            <label style={styles.label}>Closes</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input type="date" style={inputStyle} value={jwDraft.closeDate}
                onChange={(e) => setJwDraft({ ...jwDraft, closeDate: e.target.value })} />
              <input type="time" style={inputStyle} value={jwDraft.closeTime}
                onChange={(e) => setJwDraft({ ...jwDraft, closeTime: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn-maroon" style={styles.btnPrimary} onClick={saveJoinWindow}>
                <Settings size={16} /> Save Schedule
              </button>
              {jwSaved && <div style={styles.successNote}>Schedule saved.</div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
