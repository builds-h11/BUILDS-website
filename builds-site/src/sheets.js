// Join applications are mirrored to the society's Google Sheet through an
// Apps Script Web App bound to that sheet. Paste the deployed /exec URL
// below (setup steps are in the chat summary / FIREBASE_SETUP.md style).
// Leave it empty to disable sheet syncing — Firestore stays the primary store.

export const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwK59hQg2j9hoi3zgVpmZe-OZy6sOhaPdDje1ElrMJ_ZNb4ZcjFzsW988lU8mY3RsoB/exec";

const payloadFor = (entry) => {
  const acts = (entry.activities || []).filter((a) => a !== "Other");
  if ((entry.activities || []).includes("Other")) {
    const other = (entry.activityOther || "").trim();
    acts.push(other ? `Other: ${other}` : "Other");
  }
  return {
    name: entry.name,
    enrollment: entry.enrollment,
    department: entry.department,
    semester: entry.semester,
    email: entry.email,
    whatsapp: entry.whatsapp,
    wings: (entry.interests || []).join(", "),
    activities: acts.join(", "),
    reason: entry.reason,
    submittedAt: entry.date,
  };
};

export async function sendApplicationToSheet(entry) {
  if (!SHEETS_ENDPOINT) return false;
  try {
    // text/plain avoids the CORS preflight, which Apps Script does not answer;
    // no-cors keeps the browser happy with the opaque redirect Apps Script returns.
    await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadFor(entry)),
    });
    return true;
  } catch (e) {
    console.error("sheet sync failed", e);
    return false;
  }
}
