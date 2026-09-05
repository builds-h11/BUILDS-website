# Connecting Firebase (free backend)

This site uses Firebase for two things:
- **Firestore** — the database. Events, blog posts, gallery photos, and join
  applications all live here so every visitor sees the same content.
- **Authentication** — real login for the Secretariat/admin panel, instead
  of a password hardcoded in the JavaScript.

Both are on Firebase's free "Spark" plan — no credit card required, and a
club site's traffic won't come close to the free limits.

## 1. Create the project

1. Go to **console.firebase.google.com**, sign in with a Google account.
2. **Add project** → name it (e.g. `builds-website`) → Analytics can be
   turned off, not needed → **Create project**.

## 2. Register a web app

1. On the project overview page, click the **`</>`** icon.
2. Nickname it `builds-web`. Leave "Firebase Hosting" unchecked (this
   project deploys via Vercel/Netlify instead).
3. Click **Register app** — copy the `firebaseConfig` object shown.
4. Paste those six values into `src/firebase.js` in this project, replacing
   the `"REPLACE_ME"` placeholders. These values identify your project and
   are safe to have in the code — they are not secret keys. Real access
   control happens in the Firestore rules below and in who has a login in
   Authentication.

## 3. Turn on Firestore

1. Left sidebar → **Build → Firestore Database → Create database**.
2. Pick a region close to your users (e.g. `asia-south1` for Pakistan) →
   **production mode** → **Create**.
3. Go to the **Rules** tab, replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /kv_shared/{docId} {
         // Anyone can read the public site content.
         allow read: if true;

         // Anyone can *create* a join application (submission key prefix).
         // This is required so unauthenticated applicants can submit the
         // Join form — the old `request.auth != null` write rule rejected
         // every application with a "something went wrong" error.
         // Only the create case is opened up; the keys themselves are
         // unguessable (timestamp-based), so this adds no practical risk.
         allow create: if docId >= 'builds:submissions:app:'
           && docId < 'builds:submissions:app:\uf8ff';

         // Only a signed-in admin may edit or delete anything (and admins
         // may also manage submissions from the Secretariat panel).
         allow update, delete: if request.auth != null;
       }
     }
   }
   ```

   → **Publish**. This means: anyone can read (so the public site works),
   anyone can submit a join application, but only a signed-in admin can
   manage content or delete submissions.

## 4. Turn on Authentication

1. Left sidebar → **Build → Authentication → Get started**.
2. Enable the **Email/Password** provider.
3. Go to the **Users** tab → **Add user** for each office-bearer who should
   have admin access. Whatever email/password you set here is what they'll
   use to log into the site's "Secretariat" panel.

## 5. Run it

```bash
npm install
npm run dev
```

Open the site, click **Secretariat**, sign in with a user you created in
step 4. Add an event or upload a gallery photo, then open the site in a
different browser (or incognito window) — it should show up there too.
That confirms data is really shared via Firestore and not stuck in one
browser's local storage.

## Free tier limits (Spark plan, as of writing)

- Firestore: 1 GiB stored, 50k reads/day, 20k writes/day — a club site
  with a handful of admins and a few hundred visitors a day won't get
  close to this.
- Authentication: unlimited email/password users.

If the society ever outgrows this (unlikely), Firebase's next tier is
pay-as-you-go, not a hard paywall — nothing breaks, you'd just start being
billed for usage past the free quota.

## Adding/removing admins later

Firebase Console → Authentication → Users → Add user (or delete one to
revoke access). No code changes needed.
