import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mirrors the Netlify `[[redirects]]` for /calendar.ics so local dev/preview
// (`npm run dev`, `npm run preview`) fetch the private Google Calendar feed
// first-party — no third-party CORS proxy needed.
const calendarProxy = {
  "/calendar.ics": {
    target: "https://calendar.google.com",
    changeOrigin: true,
    rewrite: () =>
      "/calendar/ical/2c83e41a2534cd39f11296dd6090bd6ae15486b782adbaf05fae6cd7feb6d63b%40group.calendar.google.com/public/basic.ics",
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: calendarProxy },
  preview: { proxy: calendarProxy },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
