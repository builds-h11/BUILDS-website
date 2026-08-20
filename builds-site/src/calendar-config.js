/* BUILDS calendar connection — the Order Paper and BUILDS Calendar page are
   read from the Google Calendar iCal feed below. The feed works while the
   calendar is private (secret link), so the site falls back to seed events
   only if CALENDAR_ICS_URL is left empty.

   calendar.google.com feeds don't send CORS headers, so the browser routes
   the request through CALENDAR_ICS_PROXY. You can point CALENDAR_ICS_URL at a
   same-origin path (e.g. "/calendar.ics" proxied by Netlify) to avoid the
   third-party proxy. */

export const CALENDAR_ID = "2c83e41a2534cd39f11296dd6090bd6ae15486b782adbaf05fae6cd7feb6d63b@group.calendar.google.com";
export const CALENDAR_API_KEY = "";
export const CALENDAR_ICS_URL = "https://calendar.google.com/calendar/ical/2c83e41a2534cd39f11296dd6090bd6ae15486b782adbaf05fae6cd7feb6d63b%40group.calendar.google.com/public/basic.ics";
export const CALENDAR_ICS_PROXY = "https://api.allorigins.win/raw?url=";
export const CALENDAR_ICS_LOCAL_PATH = "/calendar.ics";
