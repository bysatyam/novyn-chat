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
