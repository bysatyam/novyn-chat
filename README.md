# Novyn Chat

A minimal web chat app with:
- Username + password authentication
- Add friends (send/accept requests)
- Real-time one-to-one chat
- Online/offline status
- Typing indicator
- Message status (`sent`, `delivered`, `seen`)
- Unread counts + last message preview
- Managed MongoDB persistence (optional)
- Configurable message retention window (`CHAT_RETENTION_DAYS`)

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

To test real-time chat, open two browser windows (or different devices) and login with different accounts.

## Password reset email setup

Forgot-password uses email reset codes. Configure SMTP in `.env`:

- `SMTP_HOST` (for example: `smtp.resend.com`)
- `SMTP_PORT` (usually `587` for STARTTLS or `465` for SSL)
- `SMTP_SECURE` (`true` for SSL/465, `false` for STARTTLS/587)
- `SMTP_USER` (SMTP username)
- `SMTP_PASS` (SMTP password/app password)
- `SMTP_FROM` (sender, for example: `Novyn <no-reply@example.com>`)
- `SMTP_REPLY_TO` (optional support email)
- `PASSWORD_RESET_EMAIL_SUBJECT` (optional custom subject line)
- `EMAIL_CHANGE_EMAIL_SUBJECT` (optional custom subject for change-email verification)

If SMTP is not configured, production resets are disabled. In non-production, reset codes are logged to the server console for local testing.

### Resend quick config

For Resend (recommended for Render), use:

- `SMTP_HOST=smtp.resend.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=resend`
- `SMTP_PASS=your_resend_api_key`
- `SMTP_FROM=Novyn <onboarding@resend.dev>` (testing) or your verified domain sender

`SMTP_PASS` is your Resend API key, and `SMTP_FROM` should use a verified sender domain in production.

## Android app workflow (Capacitor)

The project now includes a native Android shell in `android/` (Capacitor).

1. Install deps:

```bash
npm install
```

2. Sync web + native plugins into Android:

```bash
npm run android:sync
```

3. Open Android Studio:

```bash
npm run android:open
```

4. Build/run from Android Studio on an emulator or real device.

Useful commands:

- `npm run android:run` - run directly with Capacitor CLI
- `npm run cap:sync` - sync all platforms
- `npm run android:add` - add Android platform (one-time)

If `android:sync` shows a Windows/OneDrive `EPERM` delete error, run this fallback copy command after sync:

```bash
npm run android:copy-web
```

Mobile UX upgrades included:

- edge-swipe gestures between chat list and active chat on phones
- swipe-to-reply action on chat messages
- pull-to-refresh in the message list to fetch latest history
- haptic feedback on successful swipe gestures (native + fallback vibration)
- native Android back-button handling through Capacitor App plugin
- native status bar styling synced with app theme (light/dark)
- polished Android splash screen theming and launch timing

## Database setup (MongoDB)

Set these environment variables:

- `MONGODB_URI`: your MongoDB connection string
- `MONGODB_DB` (optional): database name (default: `novyn`)
- `CHAT_RETENTION_DAYS` (optional): number of days to keep chat history (default: `30`)
- `MONGODB_USERS_COLLECTION` (optional): users collection (default: `users`)
- `MONGODB_CONVERSATIONS_COLLECTION` (optional): conversation metadata collection (default: `conversations`)
- `MONGODB_MESSAGES_COLLECTION` (optional): messages collection (default: `messages`)
- `RTC_ICE_SERVERS_JSON` (optional): JSON array/object of WebRTC ICE servers
- `RTC_STUN_URLS` (optional): comma-separated STUN URLs (used when `RTC_ICE_SERVERS_JSON` is not set)
- `RTC_TURN_URL` (optional): TURN URL (for example `turn:turn.example.com:3478`)
- `RTC_TURN_USERNAME` (optional): TURN username
- `RTC_TURN_CREDENTIAL` (optional): TURN password/credential
- `RTC_TURN_CREDENTIAL_TYPE` (optional): TURN credential type (default: `password`)

If `MONGODB_URI` is not set, the app falls back to local file storage at `data/chat-state.json`.

If you have an older single-document Mongo state (`chat_state`), the server auto-migrates it into split collections on startup.

## Deploy so it works from any location

You can deploy this Node app to services like Render, Railway, Fly.io, or a VPS.

1. Push this folder to GitHub.
2. Create a new Web Service on your host.
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Expose port from `PORT` environment variable (already supported in `server.js`).
6. Add env vars:
   - `MONGODB_URI`
   - `MONGODB_DB` (optional)
   - `CHAT_RETENTION_DAYS` (optional, e.g. `30`)
   - `RTC_ICE_SERVERS_JSON` or `RTC_STUN_URLS`/`RTC_TURN_*` (optional, for production-grade calling)
   - `UPLOAD_TOKEN_SECRET` (recommended, stable secret for signed `/uploads/*` URLs)
   - `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` (optional but recommended for persistent media)
   - `UPLOADS_DIR` (optional local-media path; use a mounted persistent disk path on hosting providers)

After deployment, anyone can access your public URL and chat in real time.

## Media upload persistence (Render and similar hosts)

By default, if Cloudinary is not configured, uploads are stored in a local `uploads/` folder on the server. On Render, that local filesystem is ephemeral, so files can disappear after restart/redeploy.

Use one of these options in production:

1. Cloudinary (recommended): set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
2. Persistent disk: mount a disk and set `UPLOADS_DIR` to that mount path (for example `/var/data/uploads` on Render), and keep `UPLOAD_TOKEN_SECRET` stable.

Without one of the above, old image/file messages may show as broken links after redeploy.

## Important note

This app prunes old messages automatically based on `CHAT_RETENTION_DAYS`. Friend lists and account data are preserved; only chat history older than your configured days is removed.
