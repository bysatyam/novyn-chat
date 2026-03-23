const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const path = require("path");
const http = require("http");
const express = require("express");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const { Server } = require("socket.io");
const webpush = require("web-push");
const { cloudinary, hasCloudinaryConfig } = require("./cloudinary");

const app = express();
const server = http.createServer(app);
app.use(express.json({ limit: "64kb" }));
app.use("/api/auth", createIpRateLimiter("auth-api", 80, 15 * 60 * 1000));
app.use("/upload-voice", createIpRateLimiter("voice-upload", 40, 15 * 60 * 1000));
app.use("/upload-file", createIpRateLimiter("file-upload", 40, 15 * 60 * 1000));
app.use((req, res, next) => {
  ensureCsrfCookie(req, res);
  next();
});

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const uploadVoice = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
});
const uploadFile = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});
const uploadTokenSecret =
  process.env.UPLOAD_TOKEN_SECRET ||
  process.env.CLOUDINARY_API_SECRET ||
  "dev-secret";

if (!process.env.UPLOAD_TOKEN_SECRET && !process.env.CLOUDINARY_API_SECRET) {
  console.warn(
    "UPLOAD_TOKEN_SECRET is not set. Using an insecure dev secret for upload links."
  );
}

const VAPID_SUBJECT = toDisplayName(process.env.VAPID_SUBJECT) || "mailto:admin@novyn.local";
const VAPID_PUBLIC_KEY = toDisplayName(process.env.VAPID_PUBLIC_KEY);
const VAPID_PRIVATE_KEY = toDisplayName(process.env.VAPID_PRIVATE_KEY);
let vapidKeys = null;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  vapidKeys = { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY };
} else {
  try {
    vapidKeys = webpush.generateVAPIDKeys();
    console.warn("VAPID keys are not set. Generated temporary keys for this session.");
    console.warn(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.warn(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  } catch (err) {
    console.warn("Failed to generate VAPID keys. Push notifications disabled.", err);
    vapidKeys = null;
  }
}

const pushEnabled = Boolean(vapidKeys?.publicKey && vapidKeys?.privateKey);
if (pushEnabled) {
  webpush.setVapidDetails(VAPID_SUBJECT, vapidKeys.publicKey, vapidKeys.privateKey);
}

function signUploadToken(filename) {
  return crypto.createHmac("sha256", uploadTokenSecret).update(filename).digest("hex");
}

function withUploadToken(rawUrl) {
  const text = toDisplayName(rawUrl);
  if (!text || !text.startsWith("/uploads/")) return text;
  const [base, hash] = text.split("#");
  const [pathOnly, queryString = ""] = String(base || "").split("?");
  const filename = path.basename(pathOnly || "");
  if (!filename) return text;
  const token = signUploadToken(filename);
  const params = new URLSearchParams(queryString || "");
  params.set("token", token);
  const serialized = params.toString();
  const nextBase = serialized ? `${pathOnly}?${serialized}` : pathOnly;
  return `${nextBase}${hash ? `#${hash}` : ""}`;
}

function sanitizeAttachmentName(name) {
  const cleaned = String(name || "")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "file";
  return cleaned.slice(0, 120);
}

function resolveAttachmentKind(mime) {
  const lower = String(mime || "").toLowerCase();
  return lower.startsWith("image/") ? "image" : "file";
}

function resolveUploadExtension(mime, originalName, fallbackExt = ".bin") {
  const extMap = {
    "audio/webm": ".webm",
    "audio/wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
    "audio/mp4": ".m4a",
    "audio/aac": ".aac",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/x-rar-compressed": ".rar",
    "application/x-7z-compressed": ".7z",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  };
  const ext = extMap[String(mime || "").toLowerCase()] || path.extname(originalName || "") || fallbackExt;
  return ext.startsWith(".") ? ext : `.${ext}`;
}

function sanitizeMessageAttachment(rawAttachment, fallbackUrl = "") {
  if (!rawAttachment || typeof rawAttachment !== "object") return null;

  const rawUrl = toDisplayName(rawAttachment.url || fallbackUrl);
  let normalizedUrl = rawUrl;
  if (
    normalizedUrl
    && !/^(?:https?:)?\/\//i.test(normalizedUrl)
    && !/^data:/i.test(normalizedUrl)
    && !/^blob:/i.test(normalizedUrl)
  ) {
    if (normalizedUrl.startsWith("uploads/")) {
      normalizedUrl = `/${normalizedUrl}`;
    } else if (
      !normalizedUrl.includes("/")
      && /^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|gif|webp|bmp|svg|mp4|mov|webm|mp3|wav|ogg|m4a|aac|pdf|txt|csv|zip|rar|7z|docx?|pptx?|xlsx?)(?:[?#].*)?$/i.test(normalizedUrl)
    ) {
      normalizedUrl = `/uploads/${normalizedUrl}`;
    }
  }

  const url = withUploadToken(normalizedUrl);
  if (!url) return null;

  const mime = toDisplayName(rawAttachment.mime).toLowerCase().slice(0, 120);
  const fallbackName = path.basename(String(url).split("?")[0] || "file");
  const name = sanitizeAttachmentName(rawAttachment.name || fallbackName || "file");
  const kind = String(rawAttachment.kind || "").toLowerCase() === "image" || mime.startsWith("image/")
    ? "image"
    : "file";
  const numericSize = Number(rawAttachment.size);
  const size = Number.isFinite(numericSize) ? Math.max(0, Math.floor(numericSize)) : 0;

  return {
    url,
    name,
    mime,
    size,
    kind,
  };
}

app.get("/uploads/:file", (req, res) => {
  const filename = path.basename(req.params.file || "");
  const token = String(req.query.token || "");
  if (!filename || token !== signUploadToken(filename)) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  if (String(req.query.download || "") === "1") {
    const downloadName = sanitizeAttachmentName(req.query.name || filename);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
  }
  res.sendFile(filePath);
});

app.post(
  "/upload-voice",
  requireCsrf,
  (req, res, next) => {
    uploadVoice.single("voice")(req, res, (err) => {
      if (!err) {
        next();
        return;
      }
      if (err?.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "Voice file is too large." });
        return;
      }
      res.status(400).json({ error: "Invalid upload payload." });
    });
  },
  async (req, res) => {
    if (!req.file?.path) {
      res.status(400).json({ error: "No voice file uploaded." });
      return;
    }

    const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(req.headers.cookie), {
      allowRefreshFallback: true,
    });
    if (!auth.userKey) {
      fs.unlink(req.file.path, () => {});
      res.status(401).json({ error: "Sign in required." });
      return;
    }

    const mime = String(req.file.mimetype || "").toLowerCase();
    if (!ALLOWED_VOICE_MIME.has(mime)) {
      fs.unlink(req.file.path, () => {});
      res.status(415).json({ error: "Unsupported voice format." });
      return;
    }

    try {
      if (hasCloudinaryConfig) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          folder: "novyn_voice",
        });

        fs.unlink(req.file.path, () => {});
        res.json({ url: result.secure_url });
        return;
      }

      const extMap = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/ogg": ".ogg",
        "audio/mp4": ".m4a",
        "audio/aac": ".aac",
      };
      const ext = extMap[mime] || path.extname(req.file.originalname || "") || ".webm";
      const safeExt = ext.startsWith(".") ? ext : `.${ext}`;
      const filename = `voice-${Date.now()}-${crypto.randomBytes(3).toString("hex")}${safeExt}`;
      const destPath = path.join(uploadsDir, filename);
      fs.renameSync(req.file.path, destPath);
      const token = signUploadToken(filename);
      res.json({ url: `/uploads/${filename}?token=${token}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

app.post(
  "/upload-file",
  requireCsrf,
  (req, res, next) => {
    uploadFile.single("file")(req, res, (err) => {
      if (!err) {
        next();
        return;
      }
      if (err?.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File is too large." });
        return;
      }
      res.status(400).json({ error: "Invalid upload payload." });
    });
  },
  async (req, res) => {
    if (!req.file?.path) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(req.headers.cookie), {
      allowRefreshFallback: true,
    });
    if (!auth.userKey) {
      fs.unlink(req.file.path, () => {});
      res.status(401).json({ error: "Sign in required." });
      return;
    }

    const mime = String(req.file.mimetype || "").toLowerCase();
    if (!ALLOWED_FILE_MIME.has(mime)) {
      fs.unlink(req.file.path, () => {});
      res.status(415).json({ error: "Unsupported file type." });
      return;
    }

    const attachmentName = sanitizeAttachmentName(req.file.originalname || "file");
    const kind = resolveAttachmentKind(mime);
    const size = Math.max(0, Number(req.file.size) || 0);

    try {
      if (hasCloudinaryConfig && kind === "image") {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "novyn_files",
        });
        fs.unlink(req.file.path, () => {});
        res.json({
          url: result.secure_url,
          name: attachmentName,
          mime,
          size,
          kind,
        });
        return;
      }

      const ext = resolveUploadExtension(mime, attachmentName, ".bin");
      const filename = `file-${Date.now()}-${crypto.randomBytes(3).toString("hex")}${ext}`;
      const destPath = path.join(uploadsDir, filename);
      fs.renameSync(req.file.path, destPath);
      const token = signUploadToken(filename);
      res.json({
        url: `/uploads/${filename}?token=${token}`,
        name: attachmentName,
        mime,
        size,
        kind,
      });
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      console.error(error);
      res.status(500).json({ error: "File upload failed." });
    }
  }
);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(",") : "*",
  },
});

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }
  if (req.path !== "/index.html") {
    next();
    return;
  }

  const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(req.headers.cookie), {
    allowRefreshFallback: true,
  });
  const user = auth.userKey ? users.get(auth.userKey) : null;
  if (!user || !user.isRegistered) {
    res.redirect(302, "/login.html");
    return;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), {
    index: false,
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    },
  })
);

app.get("/api/push/public-key", (req, res) => {
  if (!pushEnabled) {
    res.status(503).json({ error: "Push notifications are not configured." });
    return;
  }
  res.json({ publicKey: vapidKeys.publicKey });
});

app.get("/api/rtc/ice", (req, res) => {
  const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(req.headers.cookie), {
    allowRefreshFallback: true,
  });
  const user = auth.userKey ? users.get(auth.userKey) : null;
  const authenticated = Boolean(user?.isRegistered);
  res.json({
    iceServers: getRtcIceServersForClient(authenticated),
    authenticated,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/api/stats", (req, res) => {
  const totalUsers = Array.from(users.values()).filter((user) => user?.isRegistered).length;
  const onlineCount = onlineUsers.size;
  const now = Date.now();
  const newUsersToday = Array.from(users.values()).filter((user) => {
    if (!user?.isRegistered) return false;
    if (!user.createdAt) return false;
    const created = Date.parse(user.createdAt);
    if (!Number.isFinite(created)) return false;
    return now - created <= 24 * 60 * 60 * 1000;
  }).length;
  let messageCount = 0;
  conversations.forEach((messages) => {
    if (Array.isArray(messages)) {
      messageCount += messages.length;
    }
  });
  res.json({
    users: totalUsers,
    online: onlineCount,
    messages: messageCount,
    newUsersToday,
  });
});


const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "chat-state.json");
const ABUSE_REPORT_FILE = path.join(DATA_DIR, "abuse-reports.log");
const MONGODB_URI = toDisplayName(process.env.MONGODB_URI);
const MONGODB_DB = toDisplayName(process.env.MONGODB_DB) || "novyn";
const MONGODB_LEGACY_COLLECTION = toDisplayName(process.env.MONGODB_COLLECTION) || "chat_state";
const MONGODB_USERS_COLLECTION = toDisplayName(process.env.MONGODB_USERS_COLLECTION) || "users";
const MONGODB_CONVERSATIONS_COLLECTION =
  toDisplayName(process.env.MONGODB_CONVERSATIONS_COLLECTION) || "conversations";
const MONGODB_MESSAGES_COLLECTION = toDisplayName(process.env.MONGODB_MESSAGES_COLLECTION) || "messages";
const CHAT_RETENTION_DAYS = Math.max(
  1,
  Number.isFinite(Number(process.env.CHAT_RETENTION_DAYS))
    ? Math.floor(Number(process.env.CHAT_RETENTION_DAYS))
    : 30
);
const MIN_PASSWORD_LENGTH = 4;
const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";
const DELETED_MESSAGE_TEXT = "This message was deleted.";
const CALL_LOG_PREFIX = "__call_log__:";
const PASSWORD_RESET_CODE_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_RESET_MAX_PER_WINDOW = 3;
const PASSWORD_RESET_RESEND_COOLDOWN_MS = 30 * 1000;
const PASSWORD_RESET_LOG_CODES = process.env.NODE_ENV !== "production";
const MAX_MESSAGE_LENGTH = 1000;
const MAX_GROUP_NAME_LENGTH = 48;
const MAX_GROUP_MEMBERS = 48;
const GROUP_ID_PREFIX = "grp_";
const GROUP_CONVERSATION_PREFIX = "__group__:";
const SCHEDULE_MIN_DELAY_MS = 30 * 1000;
const SCHEDULE_MAX_DELAY_MS = 45 * 24 * 60 * 60 * 1000;
const ALLOWED_VOICE_MIME = new Set([
  "audio/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
]);
const ALLOWED_FILE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const DEFAULT_RTC_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
const RTC_ICE_SERVERS_JSON = toDisplayName(process.env.RTC_ICE_SERVERS_JSON);
const RTC_STUN_URLS = toDisplayName(process.env.RTC_STUN_URLS);
const RTC_TURN_URL = toDisplayName(process.env.RTC_TURN_URL);
const RTC_TURN_USERNAME = toDisplayName(process.env.RTC_TURN_USERNAME);
const RTC_TURN_CREDENTIAL = toDisplayName(process.env.RTC_TURN_CREDENTIAL);
const RTC_TURN_CREDENTIAL_TYPE = toDisplayName(process.env.RTC_TURN_CREDENTIAL_TYPE) || "password";
const RTC_ICE_SERVERS = resolveRtcIceServers();
const AUTH_SECRET =
  toDisplayName(process.env.AUTH_SECRET) ||
  toDisplayName(process.env.UPLOAD_TOKEN_SECRET) ||
  "dev-auth-secret";
const AUTH_ACCESS_COOKIE = "novyn_at";
const AUTH_REFRESH_COOKIE = "novyn_rt";
const AUTH_CSRF_COOKIE = "novyn_csrf";
const AUTH_CSRF_HEADER = "x-novyn-csrf";
const AUTH_CSRF_TOKEN_BYTES = 24;
const AUTH_ACCESS_TTL_MS = 15 * 60 * 1000;
const AUTH_REFRESH_REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_REFRESH_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const AUTH_ALIAS_TTL_MS = AUTH_REFRESH_REMEMBER_TTL_MS;
const AUTH_COOKIE_SECURE = process.env.NODE_ENV === "production";

if (!process.env.AUTH_SECRET && !process.env.UPLOAD_TOKEN_SECRET) {
  console.warn("AUTH_SECRET is not set. Using an insecure dev secret for auth tokens.");
}

const users = new Map();
const onlineUsers = new Map();
const conversations = new Map();
const groups = new Map();
const scheduledMessages = new Map();
const scheduledMessageTimers = new Map();
const activeCalls = new Map();
const passwordResetTokens = new Map();
const passwordResetByUser = new Map();
const passwordResetRate = new Map();
const refreshSessions = new Map();
const refreshByUser = new Map();
const authUserAliases = new Map();
const httpRateLimits = new Map();

let mongoClient = null;
let mongoLegacyCollection = null;
let mongoUsersCollection = null;
let mongoConversationsCollection = null;
let mongoMessagesCollection = null;

let persistTimer = null;
let persistInFlight = Promise.resolve();

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function toDisplayName(name) {
  return String(name || "").trim();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeHandleInput(handle) {
  const cleaned = normalizeName(handle).replace(/[^a-z0-9_]/g, "");
  return cleaned.slice(0, 24);
}

function normalizeChatKind(value) {
  return toDisplayName(value).toLowerCase() === "group" ? "group" : "friend";
}

function normalizeGroupId(value) {
  const raw = normalizeName(value).replace(/[^a-z0-9_-]/g, "");
  return raw.slice(0, 48);
}

function getGroupConversationKey(groupId) {
  return `${GROUP_CONVERSATION_PREFIX}${normalizeGroupId(groupId)}`;
}

function isGroupConversationKey(value) {
  return toDisplayName(value).startsWith(GROUP_CONVERSATION_PREFIX);
}

function getGroupIdFromConversationKey(value) {
  if (!isGroupConversationKey(value)) return "";
  return normalizeGroupId(toDisplayName(value).slice(GROUP_CONVERSATION_PREFIX.length));
}

function createGroupId(seed = "group") {
  const cleanedSeed = normalizeName(seed).replace(/[^a-z0-9]/g, "").slice(0, 14) || "group";
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${GROUP_ID_PREFIX}${cleanedSeed}_${suffix}`;
}

function createGroupRecord(name, ownerKey, memberKeys = []) {
  const owner = normalizeName(ownerKey);
  const members = new Set(memberKeys.map(normalizeName).filter(Boolean));
  if (owner) members.add(owner);
  return {
    id: "",
    name: toDisplayName(name).slice(0, MAX_GROUP_NAME_LENGTH) || "Group chat",
    ownerKey: owner,
    admins: new Set(owner ? [owner] : []),
    members,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function parseIceUrls(rawValue) {
  const value = toDisplayName(rawValue);
  if (!value) return [];
  return value
    .split(",")
    .map((item) => toDisplayName(item))
    .filter(Boolean);
}

function normalizeIceServerEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const rawUrls = entry.urls;
  let urls = "";
  if (typeof rawUrls === "string") {
    urls = toDisplayName(rawUrls);
  } else if (Array.isArray(rawUrls)) {
    urls = rawUrls.map((item) => toDisplayName(item)).filter(Boolean);
  }

  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    return null;
  }

  const normalized = { urls };
  const username = toDisplayName(entry.username);
  if (username) normalized.username = username;
  if (entry.credential !== undefined && entry.credential !== null) {
    normalized.credential = String(entry.credential);
  }
  const credentialType = toDisplayName(entry.credentialType);
  if (credentialType) normalized.credentialType = credentialType;

  return normalized;
}

function cloneIceServerEntry(entry, options = {}) {
  const includeSensitive = options.includeSensitive !== false;
  const cloned = {
    urls: Array.isArray(entry.urls) ? entry.urls.slice() : entry.urls,
  };
  if (includeSensitive && entry.username) cloned.username = entry.username;
  if (includeSensitive && entry.credential !== undefined) cloned.credential = entry.credential;
  if (includeSensitive && entry.credentialType) cloned.credentialType = entry.credentialType;
  return cloned;
}

function resolveRtcIceServers() {
  if (RTC_ICE_SERVERS_JSON) {
    try {
      const parsed = JSON.parse(RTC_ICE_SERVERS_JSON);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = list.map((entry) => normalizeIceServerEntry(entry)).filter(Boolean);
      if (normalized.length) {
        return normalized;
      }
    } catch (err) {
      console.warn("RTC_ICE_SERVERS_JSON is invalid. Falling back to RTC_STUN_URLS/RTC_TURN_*.");
    }
  }

  const configured = [];
  const stunUrls = parseIceUrls(RTC_STUN_URLS);
  stunUrls.forEach((url) => {
    configured.push({ urls: url });
  });

  const turnUrl = toDisplayName(RTC_TURN_URL);
  if (turnUrl || RTC_TURN_USERNAME || RTC_TURN_CREDENTIAL) {
    if (turnUrl && RTC_TURN_USERNAME && RTC_TURN_CREDENTIAL) {
      configured.push({
        urls: turnUrl,
        username: RTC_TURN_USERNAME,
        credential: RTC_TURN_CREDENTIAL,
        credentialType: RTC_TURN_CREDENTIAL_TYPE,
      });
    } else {
      console.warn(
        "TURN config is incomplete. Set RTC_TURN_URL, RTC_TURN_USERNAME, and RTC_TURN_CREDENTIAL together."
      );
    }
  }

  const normalizedConfigured = configured
    .map((entry) => normalizeIceServerEntry(entry))
    .filter(Boolean);
  if (normalizedConfigured.length) {
    return normalizedConfigured;
  }

  return DEFAULT_RTC_ICE_SERVERS.map((entry) => cloneIceServerEntry(entry));
}

function getRtcIceServersForClient(authenticated) {
  if (authenticated) {
    return RTC_ICE_SERVERS.map((entry) => cloneIceServerEntry(entry, { includeSensitive: true }));
  }
  const publicEntries = RTC_ICE_SERVERS
    .filter((entry) => !entry.username && entry.credential === undefined)
    .map((entry) => cloneIceServerEntry(entry, { includeSensitive: false }));
  if (publicEntries.length) {
    return publicEntries;
  }
  return DEFAULT_RTC_ICE_SERVERS.map((entry) =>
    cloneIceServerEntry(entry, { includeSensitive: false })
  );
}

function createPasswordSecret(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("hex");

  return {
    passwordSalt: salt,
    passwordHash: hash,
  };
}

function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) {
    return false;
  }

  const expected = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(hash, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function nowIso() {
  return new Date().toISOString();
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input) {
  const safe = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = safe.length % 4;
  const padded = pad ? `${safe}${"=".repeat(4 - pad)}` : safe;
  return Buffer.from(padded, "base64");
}

function parseCookies(rawCookieHeader) {
  const header = String(rawCookieHeader || "");
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch (_) {
      out[key] = value;
    }
  }
  return out;
}

function safeTimingEqual(left, right) {
  const leftText = String(left || "");
  const rightText = String(right || "");
  if (!leftText || !rightText) return false;
  const leftBuffer = Buffer.from(leftText);
  const rightBuffer = Buffer.from(rightText);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createCsrfToken() {
  return crypto.randomBytes(AUTH_CSRF_TOKEN_BYTES).toString("hex");
}

function ensureCsrfCookie(req, res) {
  if (!res || typeof res.cookie !== "function") return "";
  const cookies = parseCookies(req?.headers?.cookie);
  const existing = toDisplayName(cookies[AUTH_CSRF_COOKIE]);
  const token = existing || createCsrfToken();
  if (!existing) {
    res.cookie(AUTH_CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: AUTH_COOKIE_SECURE,
      path: "/",
    });
  }
  return token;
}

function isSameOriginRequest(req) {
  const host = toDisplayName(req?.headers?.host).toLowerCase();
  if (!host) return false;

  const source = toDisplayName(req?.headers?.origin || req?.headers?.referer).toLowerCase();
  if (!source) {
    const fetchSite = toDisplayName(req?.headers?.["sec-fetch-site"]).toLowerCase();
    if (!fetchSite) return true;
    return fetchSite === "same-origin" || fetchSite === "same-site";
  }

  try {
    const parsed = new URL(source);
    return parsed.host.toLowerCase() === host;
  } catch (_) {
    return false;
  }
}

function requireCsrf(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }

  ensureCsrfCookie(req, res);

  const cookies = parseCookies(req?.headers?.cookie);
  const cookieToken = toDisplayName(cookies[AUTH_CSRF_COOKIE]);
  const headerToken = toDisplayName(req?.headers?.[AUTH_CSRF_HEADER]);
  if (!cookieToken || !headerToken || !safeTimingEqual(cookieToken, headerToken)) {
    res.status(403).json({ error: "Invalid CSRF token." });
    return;
  }

  if (!isSameOriginRequest(req)) {
    res.status(403).json({ error: "Cross-site request blocked." });
    return;
  }

  next();
}

function createAuthToken(kind, userKey, ttlMs, extra = {}) {
  const now = Date.now();
  const payload = {
    sub: normalizeName(userKey),
    kind: toDisplayName(kind),
    iat: now,
    exp: now + Math.max(1000, Number(ttlMs) || 0),
    ...extra,
  };
  const headerPart = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const body = `${headerPart}.${payloadPart}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest();
  return `${body}.${toBase64Url(signature)}`;
}

function verifyAuthToken(rawToken, expectedKind) {
  const token = String(rawToken || "");
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, sigPart] = parts;
  if (!headerPart || !payloadPart || !sigPart) return null;

  const body = `${headerPart}.${payloadPart}`;
  const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest();
  let actualSig = null;
  try {
    actualSig = fromBase64Url(sigPart);
  } catch (_) {
    return null;
  }
  if (actualSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(actualSig, expectedSig)) return null;

  let payload = null;
  try {
    payload = JSON.parse(fromBase64Url(payloadPart).toString("utf8"));
  } catch (_) {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  if (expectedKind && payload.kind !== expectedKind) return null;
  const subjectKey = normalizeName(payload.sub);
  if (!subjectKey) return null;
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;
  return payload;
}

function linkAuthAlias(oldKey, newKey) {
  const prev = normalizeName(oldKey);
  const next = normalizeName(newKey);
  if (!prev || !next || prev === next) return;
  authUserAliases.set(prev, {
    newKey: next,
    expiresAt: Date.now() + AUTH_ALIAS_TTL_MS,
  });
}

function resolveCurrentUserKey(rawKey) {
  let key = normalizeName(rawKey);
  const seen = new Set();
  while (key && !seen.has(key)) {
    seen.add(key);
    if (users.has(key)) return key;
    const alias = authUserAliases.get(key);
    if (!alias) break;
    if (Date.now() > alias.expiresAt) {
      authUserAliases.delete(key);
      break;
    }
    key = normalizeName(alias.newKey);
  }
  return "";
}

function trackRefreshSession(userKey, jti, expiresAt, remember) {
  const key = normalizeName(userKey);
  const tokenId = toDisplayName(jti);
  if (!key || !tokenId) return;
  refreshSessions.set(tokenId, {
    userKey: key,
    expiresAt: Number(expiresAt) || 0,
    remember: Boolean(remember),
  });
  if (!refreshByUser.has(key)) {
    refreshByUser.set(key, new Set());
  }
  refreshByUser.get(key).add(tokenId);
}

function revokeRefreshSession(rawTokenId) {
  const tokenId = toDisplayName(rawTokenId);
  if (!tokenId) return false;
  const existing = refreshSessions.get(tokenId);
  if (!existing) return false;
  refreshSessions.delete(tokenId);
  const ownerSet = refreshByUser.get(existing.userKey);
  if (ownerSet) {
    ownerSet.delete(tokenId);
    if (!ownerSet.size) refreshByUser.delete(existing.userKey);
  }
  return true;
}

function moveRefreshSessionsToUser(oldUserKey, nextUserKey) {
  const oldKey = normalizeName(oldUserKey);
  const newKey = normalizeName(nextUserKey);
  if (!oldKey || !newKey || oldKey === newKey) return;
  const tokenSet = refreshByUser.get(oldKey);
  if (!tokenSet || !tokenSet.size) return;
  if (!refreshByUser.has(newKey)) {
    refreshByUser.set(newKey, new Set());
  }
  const nextSet = refreshByUser.get(newKey);
  for (const tokenId of tokenSet) {
    const entry = refreshSessions.get(tokenId);
    if (entry) entry.userKey = newKey;
    nextSet.add(tokenId);
  }
  refreshByUser.delete(oldKey);
}

function pruneExpiredAuthState() {
  const now = Date.now();
  for (const [oldKey, alias] of authUserAliases.entries()) {
    if (!alias || Number(alias.expiresAt) <= now) {
      authUserAliases.delete(oldKey);
    }
  }
  for (const [tokenId, entry] of refreshSessions.entries()) {
    if (!entry || Number(entry.expiresAt) <= now) {
      revokeRefreshSession(tokenId);
    }
  }
}

function issueAuthTokensForUser(userKey, remember) {
  const key = normalizeName(userKey);
  if (!key) return null;
  const persistent = Boolean(remember);
  const refreshTtl = persistent ? AUTH_REFRESH_REMEMBER_TTL_MS : AUTH_REFRESH_SESSION_TTL_MS;
  const refreshTokenId = crypto.randomBytes(16).toString("hex");
  const accessToken = createAuthToken("access", key, AUTH_ACCESS_TTL_MS);
  const refreshToken = createAuthToken("refresh", key, refreshTtl, {
    jti: refreshTokenId,
    remember: persistent ? 1 : 0,
  });
  trackRefreshSession(key, refreshTokenId, Date.now() + refreshTtl, persistent);
  return { accessToken, refreshToken, remember: persistent };
}

function applyAuthCookies(res, issuedTokens) {
  if (!res || !issuedTokens?.accessToken || !issuedTokens?.refreshToken) return;
  const shared = {
    httpOnly: true,
    sameSite: "lax",
    secure: AUTH_COOKIE_SECURE,
    path: "/",
  };
  res.cookie(AUTH_ACCESS_COOKIE, issuedTokens.accessToken, {
    ...shared,
    maxAge: AUTH_ACCESS_TTL_MS,
  });
  const refreshOptions = {
    ...shared,
  };
  if (issuedTokens.remember) {
    refreshOptions.maxAge = AUTH_REFRESH_REMEMBER_TTL_MS;
  }
  res.cookie(AUTH_REFRESH_COOKIE, issuedTokens.refreshToken, refreshOptions);
  const csrfOptions = {
    sameSite: "lax",
    secure: AUTH_COOKIE_SECURE,
    path: "/",
  };
  if (issuedTokens.remember) {
    csrfOptions.maxAge = AUTH_REFRESH_REMEMBER_TTL_MS;
  }
  res.cookie(AUTH_CSRF_COOKIE, createCsrfToken(), csrfOptions);
}

function clearAuthCookies(res) {
  if (!res) return;
  const shared = {
    httpOnly: true,
    sameSite: "lax",
    secure: AUTH_COOKIE_SECURE,
    path: "/",
  };
  const csrfShared = {
    sameSite: "lax",
    secure: AUTH_COOKIE_SECURE,
    path: "/",
  };
  res.clearCookie(AUTH_ACCESS_COOKIE, shared);
  res.clearCookie(AUTH_REFRESH_COOKIE, shared);
  res.clearCookie(AUTH_CSRF_COOKIE, csrfShared);
}

function getAuthCookiesFromHeader(rawCookieHeader) {
  const cookies = parseCookies(rawCookieHeader);
  return {
    accessToken: toDisplayName(cookies[AUTH_ACCESS_COOKIE]),
    refreshToken: toDisplayName(cookies[AUTH_REFRESH_COOKIE]),
  };
}

function resolveUserFromAuthCookies(authCookies, options = {}) {
  pruneExpiredAuthState();
  const allowRefreshFallback = options.allowRefreshFallback !== false;

  const accessPayload = verifyAuthToken(authCookies?.accessToken, "access");
  if (accessPayload) {
    const resolved = resolveCurrentUserKey(accessPayload.sub);
    if (resolved) {
      return { userKey: resolved, via: "access" };
    }
  }

  if (!allowRefreshFallback) {
    return { userKey: "" };
  }

  const refreshPayload = verifyAuthToken(authCookies?.refreshToken, "refresh");
  if (!refreshPayload?.jti) {
    return { userKey: "" };
  }

  const session = refreshSessions.get(refreshPayload.jti);
  if (!session) return { userKey: "" };
  if (Date.now() > Number(session.expiresAt)) {
    revokeRefreshSession(refreshPayload.jti);
    return { userKey: "" };
  }

  const resolved = resolveCurrentUserKey(session.userKey || refreshPayload.sub);
  if (!resolved) {
    revokeRefreshSession(refreshPayload.jti);
    return { userKey: "" };
  }

  session.userKey = resolved;
  return {
    userKey: resolved,
    via: "refresh",
    remember: Boolean(session.remember),
    refreshTokenId: toDisplayName(refreshPayload.jti),
  };
}

function readRememberFlag(value) {
  if (typeof value === "boolean") return value;
  const text = toDisplayName(value).toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "on";
}

function createIpRateLimiter(bucket, maxRequests, windowMs) {
  const safeBucket = toDisplayName(bucket) || "default";
  const max = Math.max(1, Number(maxRequests) || 1);
  const windowDuration = Math.max(1000, Number(windowMs) || 1000);
  return (req, res, next) => {
    const ip = toDisplayName(req.ip || req.socket?.remoteAddress || "unknown");
    const now = Date.now();
    const key = `${safeBucket}:${ip}`;
    const current = httpRateLimits.get(key);
    const active =
      current && now <= Number(current.resetAt)
        ? current
        : { count: 0, resetAt: now + windowDuration };
    active.count += 1;
    httpRateLimits.set(key, active);
    if (active.count > max) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

function pruneHttpRateLimits() {
  const now = Date.now();
  for (const [key, entry] of httpRateLimits.entries()) {
    if (!entry || Number(entry.resetAt) <= now) {
      httpRateLimits.delete(key);
    }
  }
}

function createUserRecord(username) {
  return {
    username: toDisplayName(username),
    email: "",
    friends: new Set(),
    groups: new Set(),
    requests: new Set(),
    unread: new Map(),
    blockedUsers: new Set(),
    mutedUsers: new Set(),
    pushSubs: [],
    isRegistered: false,
    passwordSalt: "",
    passwordHash: "",
    avatarId: "",
    age: "",
    gender: "",
    displayName: "",
    bio: "",
    createdAt: "",
    lastSeenAt: "",
  };
}

function serializeState() {
  return {
    users: Array.from(users.entries()).map(([key, user]) => ({
      key,
      username: user.username,
      email: toDisplayName(user.email),
      friends: Array.from(user.friends),
      groups: Array.from(user.groups || []),
      requests: Array.from(user.requests),
      unread: Array.from(user.unread.entries()),
      blockedUsers: Array.from(user.blockedUsers || []),
      mutedUsers: Array.from(user.mutedUsers || []),
      pushSubs: Array.isArray(user.pushSubs) ? user.pushSubs : [],
      isRegistered: Boolean(user.isRegistered),
      passwordSalt: toDisplayName(user.passwordSalt),
      passwordHash: toDisplayName(user.passwordHash),
      avatarId: toDisplayName(user.avatarId),
      age: toDisplayName(user.age),
      gender: toDisplayName(user.gender),
      displayName: toDisplayName(user.displayName),
      bio: toDisplayName(user.bio),
      createdAt: toDisplayName(user.createdAt),
      lastSeenAt: toDisplayName(user.lastSeenAt),
    })),
    conversations: Array.from(conversations.entries()).map(([key, messages]) => ({
      key,
      messages,
    })),
    groups: Array.from(groups.values()).map((group) => ({
      id: group.id,
      name: group.name,
      ownerKey: group.ownerKey,
      admins: Array.from(group.admins || []),
      members: Array.from(group.members || []),
      createdAt: group.createdAt || "",
      updatedAt: group.updatedAt || "",
    })),
    scheduledMessages: Array.from(scheduledMessages.values()).map((entry) => ({
      id: entry.id,
      fromKey: entry.fromKey,
      toType: normalizeChatKind(entry.toType),
      toKey: entry.toKey,
      text: toDisplayName(entry.text),
      attachment: entry.attachment || null,
      replyTo: entry.replyTo || null,
      sendAt: entry.sendAt,
      createdAt: entry.createdAt,
      clientTempId: toDisplayName(entry.clientTempId),
    })),
  };
}

async function persistFileNow() {
  const payload = JSON.stringify(serializeState(), null, 2);
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(DATA_FILE, payload, "utf8");
}

function hasMongoStorage() {
  return Boolean(mongoUsersCollection && mongoConversationsCollection && mongoMessagesCollection);
}

async function bulkWriteInChunks(collection, operations, chunkSize = 500) {
  if (!collection || !Array.isArray(operations) || operations.length === 0) return;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const chunk = operations.slice(i, i + chunkSize);
    // Keep unordered writes to tolerate individual bad docs without aborting the batch.
    await collection.bulkWrite(chunk, { ordered: false });
  }
}

function buildConversationDoc(entry, snapshotId, updatedAt) {
  const key = toDisplayName(entry?.key);
  if (!key) return null;
  const [userA = "", userB = ""] = key.split("::");
  const messages = Array.isArray(entry?.messages) ? entry.messages : [];
  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  return {
    _id: key,
    userA,
    userB,
    messageCount: messages.length,
    lastTimestamp: toDisplayName(lastMessage?.timestamp),
    snapshotId,
    updatedAt,
  };
}

function buildMessageDoc(conversationKey, rawMessage, orderIndex, snapshotId, updatedAt) {
  const key = toDisplayName(conversationKey);
  if (!key) return null;
  const message = hydrateMessage(rawMessage);
  const messageId = toDisplayName(message.id) || `${Date.now()}-${orderIndex}`;
  const messageDocId = `${key}::${messageId}`;
  return {
    _id: messageDocId,
    conversationKey: key,
    messageId,
    timestamp: toDisplayName(message.timestamp),
    message,
    snapshotId,
    updatedAt,
  };
}

async function persistMongoNow() {
  if (!hasMongoStorage()) {
    return;
  }

  const state = serializeState();
  const snapshotId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const updatedAt = new Date();

  const userOps = state.users
    .filter((entry) => normalizeName(entry?.key || entry?.username))
    .map((entry) => {
      const key = normalizeName(entry.key || entry.username);
      return {
        updateOne: {
          filter: { _id: key },
          update: {
            $set: {
              username: toDisplayName(entry.username),
              email: normalizeEmail(entry.email),
              friends: Array.isArray(entry.friends) ? entry.friends : [],
              groups: Array.isArray(entry.groups) ? entry.groups : [],
              requests: Array.isArray(entry.requests) ? entry.requests : [],
              unread: Array.isArray(entry.unread) ? entry.unread : [],
              blockedUsers: Array.isArray(entry.blockedUsers) ? entry.blockedUsers : [],
              mutedUsers: Array.isArray(entry.mutedUsers) ? entry.mutedUsers : [],
              pushSubs: Array.isArray(entry.pushSubs) ? entry.pushSubs : [],
              isRegistered: Boolean(entry.isRegistered),
              passwordSalt: toDisplayName(entry.passwordSalt),
              passwordHash: toDisplayName(entry.passwordHash),
              avatarId: toDisplayName(entry.avatarId),
              age: toDisplayName(entry.age),
              gender: toDisplayName(entry.gender),
              displayName: toDisplayName(entry.displayName),
              bio: toDisplayName(entry.bio),
              createdAt: toDisplayName(entry.createdAt),
              lastSeenAt: toDisplayName(entry.lastSeenAt),
              snapshotId,
              updatedAt,
            },
          },
          upsert: true,
        },
      };
    });
  await bulkWriteInChunks(mongoUsersCollection, userOps);
  await mongoUsersCollection.deleteMany({ snapshotId: { $ne: snapshotId } });

  const conversationOps = [];
  let messageOrder = 0;
  let pendingMessageOps = [];

  for (const entry of state.conversations) {
    const conversationDoc = buildConversationDoc(entry, snapshotId, updatedAt);
    if (conversationDoc) {
      conversationOps.push({
        updateOne: {
          filter: { _id: conversationDoc._id },
          update: { $set: conversationDoc },
          upsert: true,
        },
      });
    }

    const key = toDisplayName(entry?.key);
    const messages = Array.isArray(entry?.messages) ? entry.messages : [];
    for (const rawMessage of messages) {
      const messageDoc = buildMessageDoc(key, rawMessage, messageOrder++, snapshotId, updatedAt);
      if (!messageDoc) continue;
      pendingMessageOps.push({
        updateOne: {
          filter: { _id: messageDoc._id },
          update: { $set: messageDoc },
          upsert: true,
        },
      });
      if (pendingMessageOps.length >= 500) {
        await bulkWriteInChunks(mongoMessagesCollection, pendingMessageOps);
        pendingMessageOps = [];
      }
    }
  }

  await bulkWriteInChunks(mongoConversationsCollection, conversationOps);
  await mongoConversationsCollection.deleteMany({ snapshotId: { $ne: snapshotId } });
  if (pendingMessageOps.length) {
    await bulkWriteInChunks(mongoMessagesCollection, pendingMessageOps);
  }
  await mongoMessagesCollection.deleteMany({ snapshotId: { $ne: snapshotId } });

  if (mongoLegacyCollection) {
    await mongoLegacyCollection.updateOne(
      { _id: "main" },
      {
        $set: {
          _id: "main",
          migratedToCollections: true,
          updatedAt,
          retentionDays: CHAT_RETENTION_DAYS,
          groups: state.groups || [],
          scheduledMessages: state.scheduledMessages || [],
        },
      },
      { upsert: true }
    );
  }
}

async function persistNow() {
  if (hasMongoStorage()) {
    await persistMongoNow();
    return;
  }

  await persistFileNow();
}

function schedulePersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistInFlight = persistInFlight
      .then(() => persistNow())
      .catch((err) => {
        console.error("Failed to persist chat state:", err);
      });
  }, 180);
}

function createResetToken() {
  const value = Math.floor(100000 + Math.random() * 900000);
  return String(value);
}

function createResetTokenId() {
  return crypto.randomBytes(12).toString("hex");
}

function createResetTokenHash(token, salt) {
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${toDisplayName(token)}:${toDisplayName(salt)}`)
    .digest("hex");
}

function dropPasswordResetTokenById(tokenId) {
  const id = toDisplayName(tokenId);
  if (!id) return;
  const entry = passwordResetTokens.get(id);
  if (!entry) return;
  passwordResetTokens.delete(id);
  if (entry.userKey && passwordResetByUser.get(entry.userKey) === id) {
    passwordResetByUser.delete(entry.userKey);
  }
}

function pruneExpiredPasswordResetTokens() {
  const now = Date.now();
  for (const [tokenId, entry] of passwordResetTokens.entries()) {
    if (!entry || Number(entry.expiresAt) <= now) {
      dropPasswordResetTokenById(tokenId);
    }
  }
  for (const [userKey, rate] of passwordResetRate.entries()) {
    if (!rate || now - Number(rate.windowStartedAt || 0) > PASSWORD_RESET_WINDOW_MS) {
      passwordResetRate.delete(userKey);
    }
  }
}

function canIssuePasswordReset(userKey) {
  const key = normalizeName(userKey);
  if (!key) {
    return { allowed: false, message: "Please wait before requesting another code." };
  }
  const now = Date.now();
  const state = passwordResetRate.get(key) || {
    windowStartedAt: now,
    sentCount: 0,
    lastSentAt: 0,
  };

  if (now - state.windowStartedAt > PASSWORD_RESET_WINDOW_MS) {
    state.windowStartedAt = now;
    state.sentCount = 0;
  }
  if (now - state.lastSentAt < PASSWORD_RESET_RESEND_COOLDOWN_MS) {
    return { allowed: false, message: "Please wait before requesting another code." };
  }
  if (state.sentCount >= PASSWORD_RESET_MAX_PER_WINDOW) {
    return { allowed: false, message: "Too many reset requests. Try again later." };
  }
  return { allowed: true, state };
}

function markPasswordResetIssued(userKey, state) {
  const key = normalizeName(userKey);
  if (!key || !state) return;
  const now = Date.now();
  state.sentCount = Number(state.sentCount || 0) + 1;
  state.lastSentAt = now;
  if (!state.windowStartedAt) state.windowStartedAt = now;
  passwordResetRate.set(key, state);
}

function dispatchPasswordResetCode(user, code) {
  const email = normalizeEmail(user?.email);
  if (!email) return false;
  if (PASSWORD_RESET_LOG_CODES) {
    console.log(`[Password reset code] ${email}: ${code}`);
  }
  return true;
}

function normalizePushSubscription(raw) {
  const endpoint = toDisplayName(raw?.endpoint);
  const keys = raw?.keys || {};
  const p256dh = toDisplayName(keys.p256dh);
  const auth = toDisplayName(keys.auth);
  if (!endpoint || !p256dh || !auth) return null;
  return {
    endpoint,
    keys: { p256dh, auth },
    expirationTime:
      raw?.expirationTime === null || raw?.expirationTime === undefined
        ? null
        : raw.expirationTime,
  };
}

function upsertPushSubscription(user, raw) {
  if (!user) return false;
  const normalized = normalizePushSubscription(raw);
  if (!normalized) return false;
  if (!Array.isArray(user.pushSubs)) user.pushSubs = [];
  const existingIndex = user.pushSubs.findIndex((sub) => sub.endpoint === normalized.endpoint);
  if (existingIndex >= 0) {
    user.pushSubs[existingIndex] = normalized;
    return true;
  }
  user.pushSubs.push(normalized);
  return true;
}

function removePushSubscription(user, endpoint) {
  if (!user || !Array.isArray(user.pushSubs) || !endpoint) return false;
  const before = user.pushSubs.length;
  user.pushSubs = user.pushSubs.filter((sub) => sub.endpoint !== endpoint);
  return user.pushSubs.length !== before;
}

function detachSubscriptionFromAll(endpoint, exceptKey) {
  if (!endpoint) return false;
  let changed = false;
  for (const [key, user] of users.entries()) {
    if (exceptKey && key === exceptKey) continue;
    if (removePushSubscription(user, endpoint)) {
      changed = true;
    }
  }
  return changed;
}

function formatPushBody(text, fallback = "New message") {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  if (cleaned.length <= 120) return cleaned;
  return `${cleaned.slice(0, 117)}...`;
}

async function sendPushToUser(userKey, payload) {
  if (!pushEnabled || !userKey) return;
  const user = users.get(userKey);
  if (!user || !Array.isArray(user.pushSubs) || user.pushSubs.length === 0) return;

  const body = JSON.stringify(payload || {});
  const remaining = [];
  let changed = false;

  for (const sub of user.pushSubs) {
    try {
      await webpush.sendNotification(sub, body);
      remaining.push(sub);
    } catch (err) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) {
        changed = true;
        continue;
      }
      console.warn("Push notification failed:", status || err?.message || err);
      remaining.push(sub);
    }
  }

  if (changed) {
    user.pushSubs = remaining;
    schedulePersist();
  }
}

async function appendAbuseReport(entry) {
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.appendFile(ABUSE_REPORT_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (err) {
    console.warn("Failed to persist abuse report:", err?.message || err);
  }
}

function hydrateMessage(rawMessage) {
  const message = rawMessage || {};
  const from = toDisplayName(message.from);
  const to = toDisplayName(message.to);
  const fromKey = normalizeName(message.fromKey || from);
  const toType = normalizeChatKind(message.toType || (message.groupId ? "group" : "friend"));
  const toKey = toType === "group"
    ? normalizeGroupId(message.groupId || message.toKey || to)
    : normalizeName(message.toKey || to);
  const seenBy = Array.isArray(message.seenBy)
    ? Array.from(new Set(message.seenBy.map(normalizeName).filter(Boolean)))
    : [];

  const hydrated = {
    id: toDisplayName(message.id) || createMessageId(),
    from: from || fromKey,
    to: to || toKey,
    fromKey,
    toKey,
    toType,
    groupId: toType === "group" ? toKey : "",
    text: withUploadToken(message.text),
    timestamp: toDisplayName(message.timestamp) || nowIso(),
    deliveredAt: toDisplayName(message.deliveredAt) || null,
    seenAt: toDisplayName(message.seenAt) || null,
    deletedAt: toDisplayName(message.deletedAt) || null,
    editedAt: toDisplayName(message.editedAt) || null,
    pinnedAt: toDisplayName(message.pinnedAt) || null,
    pinnedBy: toDisplayName(message.pinnedBy) || "",
    reactions: message.reactions || {},
  };
  if (toType === "group") {
    hydrated.seenBy = seenBy.length ? seenBy : (fromKey ? [fromKey] : []);
  }
  const attachment = sanitizeMessageAttachment(message.attachment, hydrated.text);
  if (attachment) hydrated.attachment = attachment;
  if (hydrated.deletedAt && !hydrated.text) {
    hydrated.text = DELETED_MESSAGE_TEXT;
  }
  if (message.replyTo && message.replyTo.id) {
    hydrated.replyTo = {
      id: toDisplayName(message.replyTo.id),
      from: toDisplayName(message.replyTo.from),
      text: toDisplayName(message.replyTo.text),
    };
  }
  return hydrated;
}

function applyLoadedState(parsed) {
  users.clear();
  conversations.clear();
  groups.clear();
  scheduledMessages.clear();
  for (const timer of scheduledMessageTimers.values()) {
    clearTimeout(timer);
  }
  scheduledMessageTimers.clear();

  for (const entry of parsed?.users || []) {
    const key = normalizeName(entry?.key || entry?.username);
    if (!key) continue;

    const user = createUserRecord(entry.username || key);
    user.friends = new Set((entry.friends || []).map(normalizeName).filter(Boolean));
    user.groups = new Set((entry.groups || []).map(normalizeGroupId).filter(Boolean));
    user.requests = new Set((entry.requests || []).map(normalizeName).filter(Boolean));
    user.blockedUsers = new Set((entry.blockedUsers || []).map(normalizeName).filter(Boolean));
    user.mutedUsers = new Set((entry.mutedUsers || []).map(normalizeName).filter(Boolean));
    user.isRegistered = Boolean(entry.isRegistered);
    user.passwordSalt = toDisplayName(entry.passwordSalt);
    user.passwordHash = toDisplayName(entry.passwordHash);
    user.email = normalizeEmail(entry.email);
    user.avatarId = toDisplayName(entry.avatarId);
    user.age = toDisplayName(entry.age);
    user.gender = toDisplayName(entry.gender);
    user.displayName = toDisplayName(entry.displayName);
    user.bio = toDisplayName(entry.bio);
    user.createdAt = toDisplayName(entry.createdAt);
    user.lastSeenAt = toDisplayName(entry.lastSeenAt);
    user.pushSubs = Array.isArray(entry.pushSubs)
      ? entry.pushSubs.filter((sub) => sub && sub.endpoint && sub.keys)
      : [];

    for (const unreadEntry of entry.unread || []) {
      if (!Array.isArray(unreadEntry) || unreadEntry.length < 2) continue;
      const friendKey = normalizeName(unreadEntry[0]);
      if (!friendKey) continue;
      const count = Number(unreadEntry[1]);
      user.unread.set(friendKey, Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0);
    }

    users.set(key, user);
  }

  for (const entry of parsed?.conversations || []) {
    const key = toDisplayName(entry?.key);
    if (!key) continue;
    const messages = Array.isArray(entry.messages)
      ? entry.messages
          .map(hydrateMessage)
          .filter((message) => message.fromKey && message.toKey && (message.text || message.attachment))
      : [];
    conversations.set(key, messages);
  }

  for (const entry of parsed?.groups || []) {
    const id = normalizeGroupId(entry?.id);
    if (!id) continue;
    const ownerKey = normalizeName(entry?.ownerKey);
    const members = new Set((entry?.members || []).map(normalizeName).filter((memberKey) => users.has(memberKey)));
    if (!members.size) continue;
    const group = createGroupRecord(entry?.name || id, ownerKey, Array.from(members));
    group.id = id;
    group.createdAt = toDisplayName(entry?.createdAt) || group.createdAt;
    group.updatedAt = toDisplayName(entry?.updatedAt) || group.updatedAt;
    group.ownerKey = members.has(ownerKey) ? ownerKey : Array.from(members)[0];
    group.admins = new Set(
      (entry?.admins || [])
        .map(normalizeName)
        .filter((adminKey) => members.has(adminKey))
    );
    if (!group.admins.size && group.ownerKey) group.admins.add(group.ownerKey);
    group.members = members;
    groups.set(id, group);
  }

  for (const group of groups.values()) {
    for (const memberKey of group.members) {
      const user = users.get(memberKey);
      if (!user) continue;
      if (!(user.groups instanceof Set)) user.groups = new Set();
      user.groups.add(group.id);
      if (!(user.unread instanceof Map)) user.unread = new Map();
      if (!user.unread.has(group.id)) user.unread.set(group.id, 0);
    }
  }

  for (const user of users.values()) {
    if (!(user.groups instanceof Set)) continue;
    for (const groupKey of Array.from(user.groups)) {
      if (!groups.has(normalizeGroupId(groupKey))) {
        user.groups.delete(groupKey);
        user.unread?.delete(groupKey);
      }
    }
  }

  for (const rawEntry of parsed?.scheduledMessages || []) {
    const id = toDisplayName(rawEntry?.id) || createMessageId();
    const fromKey = normalizeName(rawEntry?.fromKey);
    const toType = normalizeChatKind(rawEntry?.toType || (rawEntry?.toType === "group" ? "group" : "friend"));
    const toKey = toType === "group"
      ? normalizeGroupId(rawEntry?.toKey)
      : normalizeName(rawEntry?.toKey);
    const text = withUploadToken(rawEntry?.text);
    const sendAt = toDisplayName(rawEntry?.sendAt);
    if (!fromKey || !toKey || !text || !sendAt) continue;
    const when = Date.parse(sendAt);
    if (!Number.isFinite(when)) continue;
    const attachment = sanitizeMessageAttachment(rawEntry?.attachment, text);
    const replyTo = rawEntry?.replyTo && rawEntry.replyTo.id
      ? {
          id: toDisplayName(rawEntry.replyTo.id),
          from: toDisplayName(rawEntry.replyTo.from),
          text: toDisplayName(rawEntry.replyTo.text),
        }
      : null;
    scheduledMessages.set(id, {
      id,
      fromKey,
      toType,
      toKey,
      text,
      attachment: attachment || null,
      replyTo,
      sendAt: new Date(when).toISOString(),
      createdAt: toDisplayName(rawEntry?.createdAt) || nowIso(),
      clientTempId: toDisplayName(rawEntry?.clientTempId || ""),
    });
  }
}

async function loadStateFromFile() {
  if (!fs.existsSync(DATA_FILE)) {
    return false;
  }

  try {
    const raw = await fsp.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    applyLoadedState(parsed);
    return true;
  } catch (err) {
    console.error("Failed to load persisted chat state from file:", err);
    return false;
  }
}

function toSerializedUserEntry(doc) {
  const key = normalizeName(doc?._id || doc?.key || doc?.username);
  if (!key) return null;
  return {
    key,
    username: toDisplayName(doc?.username || key),
    email: normalizeEmail(doc?.email),
    friends: Array.isArray(doc?.friends) ? doc.friends : [],
    groups: Array.isArray(doc?.groups) ? doc.groups : [],
    requests: Array.isArray(doc?.requests) ? doc.requests : [],
    unread: Array.isArray(doc?.unread) ? doc.unread : [],
    blockedUsers: Array.isArray(doc?.blockedUsers) ? doc.blockedUsers : [],
    mutedUsers: Array.isArray(doc?.mutedUsers) ? doc.mutedUsers : [],
    pushSubs: Array.isArray(doc?.pushSubs) ? doc.pushSubs : [],
    isRegistered: Boolean(doc?.isRegistered),
    passwordSalt: toDisplayName(doc?.passwordSalt),
    passwordHash: toDisplayName(doc?.passwordHash),
    avatarId: toDisplayName(doc?.avatarId),
    age: toDisplayName(doc?.age),
    gender: toDisplayName(doc?.gender),
    displayName: toDisplayName(doc?.displayName),
    bio: toDisplayName(doc?.bio),
    createdAt: toDisplayName(doc?.createdAt),
    lastSeenAt: toDisplayName(doc?.lastSeenAt),
  };
}

function toSerializedMessageEntry(doc) {
  if (doc?.message && typeof doc.message === "object") {
    return doc.message;
  }
  return {
    id: toDisplayName(doc?.messageId || doc?.id),
    from: toDisplayName(doc?.from),
    to: toDisplayName(doc?.to),
    fromKey: normalizeName(doc?.fromKey),
    toKey: normalizeName(doc?.toKey),
    toType: normalizeChatKind(doc?.toType),
    groupId: normalizeGroupId(doc?.groupId),
    text: toDisplayName(doc?.text),
    timestamp: toDisplayName(doc?.timestamp),
    deliveredAt: toDisplayName(doc?.deliveredAt),
    seenAt: toDisplayName(doc?.seenAt),
    deletedAt: toDisplayName(doc?.deletedAt),
    editedAt: toDisplayName(doc?.editedAt),
    pinnedAt: toDisplayName(doc?.pinnedAt),
    pinnedBy: toDisplayName(doc?.pinnedBy),
    reactions: doc?.reactions || {},
    replyTo: doc?.replyTo || undefined,
    attachment: doc?.attachment || undefined,
    seenBy: Array.isArray(doc?.seenBy) ? doc.seenBy : undefined,
  };
}

async function loadStateFromMongoCollections() {
  if (!hasMongoStorage()) return false;

  const [userDocs, conversationDocs, messageDocs, legacyDoc] = await Promise.all([
    mongoUsersCollection.find({}, { projection: { snapshotId: 0, updatedAt: 0 } }).toArray(),
    mongoConversationsCollection.find({}, { projection: { _id: 1 } }).toArray(),
    mongoMessagesCollection
      .find({}, { projection: { _id: 0, snapshotId: 0, updatedAt: 0 } })
      .sort({ conversationKey: 1, timestamp: 1, messageId: 1 })
      .toArray(),
    mongoLegacyCollection
      ? mongoLegacyCollection.findOne(
          { _id: "main" },
          { projection: { groups: 1, scheduledMessages: 1 } }
        )
      : null,
  ]);

  if (!userDocs.length && !conversationDocs.length && !messageDocs.length) {
    return false;
  }

  const messageMap = new Map();
  for (const doc of messageDocs) {
    const conversationKey = toDisplayName(doc?.conversationKey);
    if (!conversationKey) continue;
    if (!messageMap.has(conversationKey)) {
      messageMap.set(conversationKey, []);
    }
    messageMap.get(conversationKey).push(toSerializedMessageEntry(doc));
  }

  const conversationKeySet = new Set();
  for (const doc of conversationDocs) {
    const key = toDisplayName(doc?._id);
    if (key) conversationKeySet.add(key);
  }
  for (const key of messageMap.keys()) {
    conversationKeySet.add(key);
  }

  const parsed = {
    users: userDocs.map(toSerializedUserEntry).filter(Boolean),
    conversations: Array.from(conversationKeySet)
      .sort()
      .map((key) => ({
        key,
        messages: messageMap.get(key) || [],
      })),
    groups: Array.isArray(legacyDoc?.groups) ? legacyDoc.groups : [],
    scheduledMessages: Array.isArray(legacyDoc?.scheduledMessages) ? legacyDoc.scheduledMessages : [],
  };

  applyLoadedState(parsed);
  return true;
}

async function loadStateFromLegacyMongoDocument() {
  if (!mongoLegacyCollection) return false;
  const doc = await mongoLegacyCollection.findOne({ _id: "main" });
  if (!doc?.state) return false;
  applyLoadedState(doc.state);
  return true;
}

async function ensureMongoIndexes() {
  if (!hasMongoStorage()) return;
  await Promise.all([
    mongoUsersCollection.createIndex({ email: 1 }, { name: "email_idx" }),
    mongoConversationsCollection.createIndex({ updatedAt: -1 }, { name: "updated_at_idx" }),
    mongoMessagesCollection.createIndex(
      { conversationKey: 1, timestamp: 1, messageId: 1 },
      { name: "conversation_time_idx" }
    ),
    mongoMessagesCollection.createIndex({ messageId: 1 }, { name: "message_id_idx" }),
  ]);
}

async function initializeMongo() {
  if (!MONGODB_URI) {
    return;
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DB);
    mongoLegacyCollection = db.collection(MONGODB_LEGACY_COLLECTION);
    mongoUsersCollection = db.collection(MONGODB_USERS_COLLECTION);
    mongoConversationsCollection = db.collection(MONGODB_CONVERSATIONS_COLLECTION);
    mongoMessagesCollection = db.collection(MONGODB_MESSAGES_COLLECTION);
    await ensureMongoIndexes();
    console.log(`Connected to MongoDB database: ${MONGODB_DB}`);
  } catch (err) {
    mongoClient = null;
    mongoLegacyCollection = null;
    mongoUsersCollection = null;
    mongoConversationsCollection = null;
    mongoMessagesCollection = null;
    console.error("Failed to connect MongoDB, falling back to local file storage:", err);
  }
}

async function loadState() {
  await initializeMongo();
  let loaded = false;

  if (hasMongoStorage()) {
    try {
      loaded = await loadStateFromMongoCollections();
      if (!loaded) {
        loaded = await loadStateFromLegacyMongoDocument();
        if (loaded) {
          await persistMongoNow();
          console.log("Migrated legacy chat_state Mongo document into split collections.");
        }
      }
      if (!loaded) {
        const loadedFromFile = await loadStateFromFile();
        if (loadedFromFile) {
          loaded = true;
          await persistMongoNow();
          console.log("Migrated local file state into split Mongo collections.");
        }
      }
    } catch (err) {
      console.error("Failed to load chat state from MongoDB collections, trying local file:", err);
    }
  }

  if (!loaded) {
    loaded = await loadStateFromFile();
  }

  if (loaded) {
    const pruned = pruneExpiredMessages();
    if (pruned) {
      await persistNow();
      console.log(`Pruned expired messages older than ${CHAT_RETENTION_DAYS} day(s).`);
    }
  }
}

function getOrCreateUser(username) {
  const key = normalizeName(username);
  if (!users.has(key)) {
    users.set(key, createUserRecord(username));
    schedulePersist();
  }
  return users.get(key);
}

function isUsernameTaken(username) {
  const existing = users.get(normalizeName(username));
  return Boolean(existing?.isRegistered);
}

function findUserByEmail(email) {
  const key = normalizeEmail(email);
  if (!key) return null;
  for (const user of users.values()) {
    if (normalizeEmail(user?.email) === key) return user;
  }
  return null;
}

function isEmailTaken(email) {
  const existing = findUserByEmail(email);
  return Boolean(existing?.isRegistered);
}

function pickAvailableUsername(seed) {
  const base = normalizeHandleInput(seed);
  if (base && !isUsernameTaken(base)) return base;
  const suggestions = buildUsernameSuggestions(base || "user", 1);
  if (suggestions.length) return suggestions[0];
  return `user${Date.now().toString().slice(-4)}`;
}

function buildUsernameSuggestions(requestedName, count = 5) {
  const raw = normalizeName(requestedName).replace(/[^a-z0-9_]/g, "") || "user";
  const maxBaseLength = 24;
  const suggestions = [];
  let suffix = 1;

  while (suggestions.length < count && suffix < 10000) {
    const suffixText = String(suffix);
    const availableLength = maxBaseLength - suffixText.length;
    const base = raw.slice(0, Math.max(1, availableLength));
    const candidate = `${base}${suffixText}`;

    if (!isUsernameTaken(candidate)) {
      suggestions.push(candidate);
    }

    suffix += 1;
  }

  return suggestions;
}

function buildFriendSearchSuggestions(query, me, limit = 6) {
  const needle = normalizeName(query).replace(/[^a-z0-9_]/g, "");
  if (!needle) return [];
  const meKey = me ? normalizeName(me.username) : "";
  const meBlockedUsers = me?.blockedUsers instanceof Set ? me.blockedUsers : new Set();
  const results = [];

  users.forEach((user) => {
    if (!user?.isRegistered) return;
    const name = user.username || "";
    const key = normalizeName(name);
    if (!key || key === meKey) return;
    if (meBlockedUsers.has(key)) return;
    if (user?.blockedUsers instanceof Set && user.blockedUsers.has(meKey)) return;
    if (!key.includes(needle)) return;
    results.push(name);
  });

  results.sort((a, b) => {
    const aKey = normalizeName(a);
    const bKey = normalizeName(b);
    const aStarts = aKey.startsWith(needle);
    const bStarts = bKey.startsWith(needle);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.localeCompare(b);
  });

  const filtered = [];
  for (const name of results) {
    const key = normalizeName(name);
    if (!key || !meKey) {
      filtered.push(name);
      continue;
    }
    const friend = users.get(key);
    if (me.friends.has(key)) continue;
    if (me.requests.has(key)) continue;
    if (friend?.requests?.has(meKey)) continue;
    filtered.push(name);
    if (filtered.length >= limit) break;
  }
  return filtered.slice(0, limit);
}

function isBlockedBy(user, otherKey) {
  if (!user) return false;
  if (!(user.blockedUsers instanceof Set)) {
    user.blockedUsers = new Set();
  }
  return user.blockedUsers.has(normalizeName(otherKey));
}

function isMutedBy(user, otherKey) {
  if (!user) return false;
  if (!(user.mutedUsers instanceof Set)) {
    user.mutedUsers = new Set();
  }
  return user.mutedUsers.has(normalizeName(otherKey));
}

function usersAreBlocked(userAKey, userBKey) {
  const aKey = normalizeName(userAKey);
  const bKey = normalizeName(userBKey);
  if (!aKey || !bKey) return false;
  const userA = users.get(aKey);
  const userB = users.get(bKey);
  if (!userA || !userB) return false;
  return isBlockedBy(userA, bKey) || isBlockedBy(userB, aKey);
}

function getGroup(groupId) {
  const key = normalizeGroupId(groupId);
  if (!key) return null;
  return groups.get(key) || null;
}

function isGroupMember(group, userKey) {
  if (!group || !(group.members instanceof Set)) return false;
  return group.members.has(normalizeName(userKey));
}

function getGroupMemberUsernames(group) {
  if (!group || !(group.members instanceof Set)) return [];
  const names = [];
  for (const memberKey of group.members) {
    const user = users.get(memberKey);
    if (user?.username) names.push(user.username);
  }
  return names;
}

function getGroupMemberRole(group, memberKey) {
  const key = normalizeName(memberKey);
  if (!group || !key || !isGroupMember(group, key)) return "member";
  const ownerKey = normalizeName(group.ownerKey);
  if (ownerKey && key === ownerKey) return "owner";
  if (group.admins instanceof Set && group.admins.has(key)) return "admin";
  return "member";
}

function buildGroupInfoForViewer(group, viewerKey) {
  const viewer = normalizeName(viewerKey);
  if (!group || !viewer || !isGroupMember(group, viewer)) return null;
  const members = [];
  for (const memberKey of group.members || []) {
    const user = users.get(memberKey);
    const username = user?.username || memberKey;
    const role = getGroupMemberRole(group, memberKey);
    members.push({
      username,
      displayName: user?.displayName || "",
      avatarId: user?.avatarId || "",
      online: onlineUsers.has(memberKey),
      lastSeenAt: user?.lastSeenAt || "",
      role,
      isOwner: role === "owner",
      isAdmin: role === "owner" || role === "admin",
    });
  }

  members.sort((a, b) => {
    const roleRank = (role) => (role === "owner" ? 3 : role === "admin" ? 2 : 1);
    const delta = roleRank(b.role) - roleRank(a.role);
    if (delta !== 0) return delta;
    return normalizeName(a.username).localeCompare(normalizeName(b.username));
  });

  const ownerUser = users.get(normalizeName(group.ownerKey));
  const viewerUser = users.get(viewer);
  const viewerRole = getGroupMemberRole(group, viewer);

  return {
    id: group.id,
    name: group.name || group.id,
    owner: ownerUser?.username || group.ownerKey || "",
    createdAt: group.createdAt || "",
    updatedAt: group.updatedAt || "",
    members,
    me: {
      username: viewerUser?.username || viewer,
      role: viewerRole,
      isOwner: viewerRole === "owner",
      isAdmin: viewerRole === "owner" || viewerRole === "admin",
    },
  };
}

function emitGroupInfoToMember(memberKey, group) {
  const normalizedMemberKey = normalizeName(memberKey);
  if (!normalizedMemberKey || !group) return;
  const memberSocket = onlineUsers.get(normalizedMemberKey);
  if (!memberSocket) return;
  const payload = buildGroupInfoForViewer(group, normalizedMemberKey);
  if (!payload) return;
  io.to(memberSocket).emit("group_info", { group: payload });
}

function getConversationKeyForTarget(userKey, targetKey, targetType = "friend") {
  const kind = normalizeChatKind(targetType);
  if (kind === "group") {
    return getGroupConversationKey(targetKey);
  }
  return getConversationKey(userKey, targetKey);
}

function getConversationKey(userA, userB) {
  const a = normalizeName(userA);
  const b = normalizeName(userB);
  return [a, b].sort().join("::");
}

function findMessageByClientTempId(conversationKey, senderKey, targetKey, clientTempId, targetType = "friend") {
  const tempId = toDisplayName(clientTempId);
  if (!tempId) return null;
  const safeConversationKey = toDisplayName(conversationKey);
  if (!safeConversationKey) return null;
  const conversation = conversations.get(safeConversationKey);
  if (!Array.isArray(conversation) || conversation.length === 0) return null;

  const fromKey = normalizeName(senderKey);
  const kind = normalizeChatKind(targetType);
  const normalizedTarget = kind === "group" ? normalizeGroupId(targetKey) : normalizeName(targetKey);
  for (let i = conversation.length - 1; i >= 0; i -= 1) {
    const message = conversation[i];
    if (!message || toDisplayName(message.clientTempId) !== tempId) continue;
    const messageFromKey = normalizeName(message.fromKey || message.from);
    const messageToKey = normalizeName(message.toKey || message.to);
    if (messageFromKey !== fromKey) continue;
    if (kind === "group") {
      const messageGroupId = normalizeGroupId(message.groupId || message.toKey || message.to);
      if (normalizeChatKind(message.toType) === "group" && messageGroupId === normalizedTarget) {
        return message;
      }
      continue;
    }
    if (messageToKey === normalizedTarget) {
      return message;
    }
  }
  return null;
}

function normalizeReplyPayload(rawReply) {
  if (!rawReply || typeof rawReply !== "object" || !rawReply.id) return null;
  return {
    id: toDisplayName(rawReply.id),
    from: toDisplayName(rawReply.from),
    text: toDisplayName(rawReply.text),
  };
}

function resolveChatTargetForUser(userKey, rawTo, rawType, options = {}) {
  const me = users.get(normalizeName(userKey));
  if (!me) {
    return { ok: false, message: "Account not found." };
  }

  let chatType = normalizeChatKind(rawType);
  const toName = toDisplayName(rawTo);
  const friendKey = normalizeName(toName);
  const possibleGroupId = normalizeGroupId(rawTo);
  const inferGroup = options.inferGroup === true;
  if (inferGroup && chatType === "friend" && possibleGroupId && me.groups?.has(possibleGroupId)) {
    chatType = "group";
  }

  if (chatType === "group") {
    const groupId = normalizeGroupId(rawTo);
    const group = groups.get(groupId);
    if (!group || !isGroupMember(group, userKey)) {
      return { ok: false, message: "You are not a member of that group." };
    }
    return {
      ok: true,
      type: "group",
      me,
      group,
      targetKey: group.id,
      targetLabel: group.name || group.id,
      conversationKey: getGroupConversationKey(group.id),
    };
  }

  let resolvedFriendKey = friendKey;
  let friend = users.get(resolvedFriendKey);
  if ((!friend || !me.friends.has(resolvedFriendKey)) && me.friends instanceof Set) {
    for (const candidateKey of me.friends) {
      const normalizedCandidateKey = normalizeName(candidateKey);
      const candidate = users.get(normalizedCandidateKey);
      if (!candidate) continue;
      const candidateUserKey = normalizeName(candidate.username || normalizedCandidateKey);
      const candidateDisplayKey = normalizeName(candidate.displayName);
      if (candidateUserKey !== friendKey && candidateDisplayKey !== friendKey) continue;
      resolvedFriendKey = normalizedCandidateKey;
      friend = candidate;
      break;
    }
  }

  if (!friend || !me.friends.has(resolvedFriendKey)) {
    return { ok: false, message: "You can message only your friends." };
  }

  return {
    ok: true,
    type: "friend",
    me,
    friend,
    targetKey: resolvedFriendKey,
    targetLabel: friend.username || toName,
    conversationKey: getConversationKey(userKey, resolvedFriendKey),
  };
}

function createStoredMessage(params = {}) {
  const chatType = normalizeChatKind(params.toType);
  const timestamp = toDisplayName(params.timestamp) || nowIso();
  const message = {
    id: toDisplayName(params.id) || createMessageId(),
    from: toDisplayName(params.from) || normalizeName(params.fromKey),
    to: toDisplayName(params.to) || "",
    fromKey: normalizeName(params.fromKey),
    toKey: chatType === "group" ? normalizeGroupId(params.toKey) : normalizeName(params.toKey),
    toType: chatType,
    groupId: chatType === "group" ? normalizeGroupId(params.groupId || params.toKey) : "",
    text: withUploadToken(params.text),
    timestamp,
    deliveredAt: toDisplayName(params.deliveredAt) || null,
    seenAt: toDisplayName(params.seenAt) || null,
    deletedAt: null,
    editedAt: null,
    pinnedAt: null,
    pinnedBy: "",
    reactions: {},
  };
  if (chatType === "group") {
    message.seenBy = Array.isArray(params.seenBy)
      ? Array.from(new Set(params.seenBy.map(normalizeName).filter(Boolean)))
      : [normalizeName(params.fromKey)];
  }
  const attachment = sanitizeMessageAttachment(params.attachment, message.text);
  if (attachment) message.attachment = attachment;
  const replyTo = normalizeReplyPayload(params.replyTo);
  if (replyTo) message.replyTo = replyTo;
  const temp = toDisplayName(params.clientTempId).slice(0, 64);
  if (temp) message.clientTempId = temp;
  return message;
}

function deliverFriendMessage(params = {}) {
  const fromKey = normalizeName(params.fromKey);
  const toKey = normalizeName(params.toKey);
  const text = withUploadToken(params.text);
  const clientTempId = toDisplayName(params.clientTempId).slice(0, 64);
  if (!fromKey || !toKey || !text) {
    return { ok: false, message: "Invalid message payload." };
  }

  const me = users.get(fromKey);
  const friend = users.get(toKey);
  if (!me || !friend || !me.friends.has(toKey)) {
    return { ok: false, message: "You can message only your friends." };
  }
  if (usersAreBlocked(fromKey, toKey)) {
    return { ok: false, code: "blocked", friend };
  }

  const conversationKey = getConversationKey(fromKey, toKey);
  if (clientTempId) {
    const existing = findMessageByClientTempId(conversationKey, fromKey, toKey, clientTempId, "friend");
    if (existing) {
      return { ok: true, existing: true, message: existing, me, friend };
    }
  }

  const recipientSocketId = onlineUsers.get(toKey);
  const recipientSocket = recipientSocketId ? io.sockets.sockets.get(recipientSocketId) : null;
  const recipientViewing = Boolean(
    recipientSocket &&
    recipientSocket.data?.activeChatKind === "friend" &&
    normalizeName(recipientSocket.data?.activeChatWith) === fromKey
  );

  const timestamp = toDisplayName(params.timestamp) || nowIso();
  const message = createStoredMessage({
    id: params.id,
    from: me.username,
    to: friend.username,
    fromKey,
    toKey,
    toType: "friend",
    text,
    timestamp,
    deliveredAt: recipientSocketId ? timestamp : null,
    seenAt: recipientViewing ? timestamp : null,
    attachment: params.attachment,
    replyTo: params.replyTo,
    clientTempId,
  });

  const conversation = conversations.get(conversationKey) || [];
  conversation.push(message);
  conversations.set(conversationKey, conversation);
  runRetentionMaintenance();

  recipientViewing ? setUnreadCount(friend, fromKey, 0) : incrementUnread(friend, fromKey);

  const senderSocketId = onlineUsers.get(fromKey);
  if (senderSocketId) {
    io.to(senderSocketId).emit("private_message", message);
  }
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("private_message", message);
  } else if (!isMutedBy(friend, fromKey)) {
    const bodyText = formatPushBody(text);
    void sendPushToUser(toKey, {
      type: "message",
      title: `New message from ${me.username}`,
      body: bodyText,
      tag: `msg-${fromKey}`,
      url: `/?source=push&chat=${encodeURIComponent(me.username)}`,
      icon: "/icons/icon-192.png",
      badge: "/icons/novyn-badge.svg",
    });
  }

  emitMessageStatus(message);
  emitFriendList(fromKey);
  emitFriendList(toKey);
  schedulePersist();
  return { ok: true, existing: false, message, me, friend };
}

function deliverGroupMessage(params = {}) {
  const fromKey = normalizeName(params.fromKey);
  const groupId = normalizeGroupId(params.groupId || params.toKey);
  const text = withUploadToken(params.text);
  const clientTempId = toDisplayName(params.clientTempId).slice(0, 64);
  if (!fromKey || !groupId || !text) {
    return { ok: false, message: "Invalid group message payload." };
  }
  const me = users.get(fromKey);
  const group = groups.get(groupId);
  if (!me || !group || !isGroupMember(group, fromKey)) {
    return { ok: false, message: "You are not a member of that group." };
  }

  const conversationKey = getGroupConversationKey(groupId);
  if (clientTempId) {
    const existing = findMessageByClientTempId(conversationKey, fromKey, groupId, clientTempId, "group");
    if (existing) {
      return { ok: true, existing: true, message: existing, me, group };
    }
  }

  const timestamp = toDisplayName(params.timestamp) || nowIso();
  const message = createStoredMessage({
    id: params.id,
    from: me.username,
    to: group.name || group.id,
    fromKey,
    toKey: group.id,
    toType: "group",
    groupId: group.id,
    text,
    timestamp,
    deliveredAt: timestamp,
    seenAt: null,
    seenBy: [fromKey],
    attachment: params.attachment,
    replyTo: params.replyTo,
    clientTempId,
  });

  const conversation = conversations.get(conversationKey) || [];
  conversation.push(message);
  conversations.set(conversationKey, conversation);
  group.updatedAt = nowIso();
  runRetentionMaintenance();

  let seenByChanged = false;
  for (const memberKey of group.members) {
    const member = users.get(memberKey);
    if (!member) continue;
    const memberSocketId = onlineUsers.get(memberKey);
    const memberSocket = memberSocketId ? io.sockets.sockets.get(memberSocketId) : null;
    const viewingSameGroup = Boolean(
      memberSocket &&
      memberSocket.data?.activeChatKind === "group" &&
      normalizeGroupId(memberSocket.data?.activeChatWith) === group.id
    );

    if (memberKey === fromKey || viewingSameGroup) {
      setUnreadCount(member, group.id, 0);
      if (memberKey !== fromKey && !message.seenBy.includes(memberKey)) {
        message.seenBy.push(memberKey);
        seenByChanged = true;
      }
    } else {
      incrementUnread(member, group.id);
    }

    if (memberSocketId) {
      io.to(memberSocketId).emit("private_message", message);
    } else if (memberKey !== fromKey) {
      const bodyText = formatPushBody(text);
      void sendPushToUser(memberKey, {
        type: "message",
        title: `New message in ${group.name}`,
        body: `${me.username}: ${bodyText}`,
        tag: `grp-${group.id}`,
        url: `/?source=push&chat=${encodeURIComponent(group.id)}&kind=group`,
        icon: "/icons/icon-192.png",
        badge: "/icons/novyn-badge.svg",
      });
    }

    emitFriendList(memberKey);
  }

  if (seenByChanged) {
    emitGroupMessageStatus(group, message);
  }

  schedulePersist();
  return { ok: true, existing: false, message, me, group };
}

function setCallPair(userKey, peerKey, status) {
  activeCalls.set(userKey, { peerKey, status });
  activeCalls.set(peerKey, { peerKey: userKey, status });
}

function clearCallPair(userKey) {
  const state = activeCalls.get(userKey);
  if (!state) return null;
  const peerKey = state.peerKey;
  activeCalls.delete(userKey);
  if (peerKey) activeCalls.delete(peerKey);
  return peerKey;
}

function applyUsernameChange(userKey, newUsername) {
  const oldKey = normalizeName(userKey);
  const user = users.get(oldKey);
  if (!user) {
    return { ok: false, message: "User not found." };
  }

  const desired = toDisplayName(newUsername);
  if (!desired) {
    return { ok: false, message: "Username is required." };
  }

  const newKey = normalizeName(desired);
  if (!newKey) {
    return { ok: false, message: "Invalid username." };
  }

  const oldUsername = user.username || oldKey;
  const sameKey = newKey === oldKey;
  if (sameKey && desired === oldUsername) {
    return { ok: false, message: "That's already your username." };
  }

  if (!sameKey) {
    const existing = users.get(newKey);
    if (existing) {
      return { ok: false, message: "That username is already taken." };
    }
  }

  if (activeCalls.has(oldKey)) {
    return { ok: false, message: "End your call before changing username." };
  }

  if (!sameKey) {
    users.delete(oldKey);
    users.set(newKey, user);
  }

  user.username = desired;
  user.isRegistered = true;

  if (!sameKey && onlineUsers.has(oldKey)) {
    const socketId = onlineUsers.get(oldKey);
    onlineUsers.delete(oldKey);
    onlineUsers.set(newKey, socketId);
  }

  if (!sameKey) {
    users.forEach((other) => {
      if (!other || other === user) return;
      if (other.friends.has(oldKey)) {
        other.friends.delete(oldKey);
        other.friends.add(newKey);
      }
      if (other.requests.has(oldKey)) {
        other.requests.delete(oldKey);
        other.requests.add(newKey);
      }
      if (other.unread.has(oldKey)) {
        const count = other.unread.get(oldKey);
        other.unread.delete(oldKey);
        other.unread.set(newKey, count);
      }
      if (other.blockedUsers instanceof Set && other.blockedUsers.has(oldKey)) {
        other.blockedUsers.delete(oldKey);
        other.blockedUsers.add(newKey);
      }
      if (other.mutedUsers instanceof Set && other.mutedUsers.has(oldKey)) {
        other.mutedUsers.delete(oldKey);
        other.mutedUsers.add(newKey);
      }
    });
    for (const group of groups.values()) {
      let touched = false;
      if (group.ownerKey === oldKey) {
        group.ownerKey = newKey;
        touched = true;
      }
      if (group.members instanceof Set && group.members.has(oldKey)) {
        group.members.delete(oldKey);
        group.members.add(newKey);
        touched = true;
      }
      if (group.admins instanceof Set && group.admins.has(oldKey)) {
        group.admins.delete(oldKey);
        group.admins.add(newKey);
        touched = true;
      }
      if (touched) {
        group.updatedAt = nowIso();
      }
    }
    for (const scheduled of scheduledMessages.values()) {
      if (scheduled.fromKey === oldKey) {
        scheduled.fromKey = newKey;
      }
      if (scheduled.toType === "friend" && scheduled.toKey === oldKey) {
        scheduled.toKey = newKey;
      }
      if (scheduled.replyTo && normalizeName(scheduled.replyTo.from) === oldKey) {
        scheduled.replyTo.from = desired;
      }
    }
    moveRefreshSessionsToUser(oldKey, newKey);
    linkAuthAlias(oldKey, newKey);
  }

  const nextConversations = new Map();
  conversations.forEach((messages, key) => {
    const [a, b] = key.split("::");
    const containsOld = a === oldKey || b === oldKey;
    const newA = a === oldKey ? newKey : a;
    const newB = b === oldKey ? newKey : b;
    const nextKey = containsOld ? getConversationKey(newA, newB) : key;

    if (containsOld) {
      for (const msg of messages) {
        if (normalizeName(msg.fromKey) === oldKey) {
          msg.fromKey = newKey;
          msg.from = desired;
        }
        if (normalizeName(msg.toKey) === oldKey) {
          msg.toKey = newKey;
          msg.to = desired;
        }
        if (msg.replyTo && normalizeName(msg.replyTo.from) === oldKey) {
          msg.replyTo.from = desired;
        }
        if (Array.isArray(msg.seenBy) && msg.seenBy.length) {
          msg.seenBy = Array.from(
            new Set(
              msg.seenBy.map((entry) => (normalizeName(entry) === oldKey ? newKey : normalizeName(entry)))
            )
          );
        }
      }
    }

    if (nextConversations.has(nextKey)) {
      nextConversations.set(nextKey, nextConversations.get(nextKey).concat(messages));
    } else {
      nextConversations.set(nextKey, messages);
    }
  });
  conversations.clear();
  nextConversations.forEach((value, key) => conversations.set(key, value));

  return {
    ok: true,
    oldKey,
    newKey,
    oldUsername,
    newUsername: desired,
  };
}

function getRetentionCutoffMs() {
  return Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function getMessageTimestampMs(message) {
  const value = Date.parse(toDisplayName(message?.timestamp));
  return Number.isNaN(value) ? Date.now() : value;
}

function recomputeUnreadFromConversations() {
  for (const user of users.values()) {
    const entries = [];
    for (const friendKey of user.friends) {
      entries.push([friendKey, 0]);
    }
    for (const groupKey of user.groups || []) {
      entries.push([normalizeGroupId(groupKey), 0]);
    }
    user.unread = new Map(entries);
  }

  for (const [conversationKey, messages] of conversations.entries()) {
    const groupId = getGroupIdFromConversationKey(conversationKey);
    const isGroup = Boolean(groupId);
    for (const message of messages) {
      if (!message) continue;
      if (isGroup || normalizeChatKind(message.toType) === "group") {
        const group = groups.get(groupId || normalizeGroupId(message.groupId || message.toKey));
        if (!group) continue;
        const seenBy = Array.isArray(message.seenBy) ? message.seenBy.map(normalizeName) : [];
        for (const memberKey of group.members) {
          if (memberKey === normalizeName(message.fromKey)) continue;
          if (seenBy.includes(memberKey)) continue;
          const member = users.get(memberKey);
          if (!member || !member.groups.has(group.id)) continue;
          const current = member.unread.get(group.id) || 0;
          member.unread.set(group.id, current + 1);
        }
        continue;
      }
      if (message.seenAt) continue;
      const recipient = users.get(message.toKey);
      if (!recipient || !recipient.friends.has(message.fromKey)) continue;
      const current = recipient.unread.get(message.fromKey) || 0;
      recipient.unread.set(message.fromKey, current + 1);
    }
  }
}

function pruneExpiredMessages() {
  const cutoffMs = getRetentionCutoffMs();
  let changed = false;

  for (const [key, messages] of conversations.entries()) {
    const filtered = messages.filter((message) => getMessageTimestampMs(message) >= cutoffMs);
    if (filtered.length !== messages.length) {
      changed = true;
    }

    if (!filtered.length) {
      if (messages.length) {
        changed = true;
      }
      conversations.delete(key);
      continue;
    }

    if (filtered.length !== messages.length) {
      conversations.set(key, filtered);
    }
  }

  if (changed) {
    recomputeUnreadFromConversations();
  }

  return changed;
}

function runRetentionMaintenance() {
  pruneExpiredAuthState();
  pruneHttpRateLimits();
  pruneExpiredPasswordResetTokens();
  const pruned = pruneExpiredMessages();
  if (!pruned) {
    return;
  }

  schedulePersist();
  for (const userKey of onlineUsers.keys()) {
    emitFriendList(userKey);
  }
}

function startRetentionMaintenanceLoop() {
  const intervalMs = 60 * 60 * 1000;
  const timer = setInterval(runRetentionMaintenance, intervalMs);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

function getUnreadCount(user, friendKey) {
  return user?.unread?.get(normalizeName(friendKey)) || 0;
}

function setUnreadCount(user, friendKey, value) {
  if (!user) return false;
  const key = normalizeName(friendKey);
  const safeValue = Math.max(0, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0);
  const hasKey = user.unread.has(key);
  const previous = hasKey ? user.unread.get(key) : null;

  if (hasKey && previous === safeValue) {
    return false;
  }

  user.unread.set(key, safeValue);
  return true;
}

function incrementUnread(user, friendKey) {
  const current = getUnreadCount(user, friendKey);
  return setUnreadCount(user, friendKey, current + 1);
}

function initializeUnreadPair(userAKey, userBKey) {
  const userA = getOrCreateUser(userAKey);
  const userB = getOrCreateUser(userBKey);

  const changedA = setUnreadCount(userA, userBKey, getUnreadCount(userA, userBKey));
  const changedB = setUnreadCount(userB, userAKey, getUnreadCount(userB, userAKey));

  if (changedA || changedB) {
    schedulePersist();
  }
}

function getConversationSummaryByKey(conversationKey) {
  const key = toDisplayName(conversationKey);
  if (!key) {
    return {
      lastMessage: "",
      lastTimestamp: null,
      lastFrom: "",
    };
  }
  const messages = conversations.get(key) || [];

  if (!messages.length) {
    return {
      lastMessage: "",
      lastTimestamp: null,
      lastFrom: "",
    };
  }

  const message = messages[messages.length - 1];
  const text = message.deletedAt ? DELETED_MESSAGE_TEXT : toDisplayName(message.text);
  const compact = text.length > 52 ? `${text.slice(0, 49)}...` : text;

  return {
    lastMessage: compact,
    lastTimestamp: message.timestamp || null,
    lastFrom: message.from || "",
  };
}

function getConversationSummary(userKey, friendKey) {
  return getConversationSummaryByKey(getConversationKey(userKey, friendKey));
}

function getGroupConversationSummary(groupId) {
  return getConversationSummaryByKey(getGroupConversationKey(groupId));
}

function normalizeSearchFilter(filter) {
  const value = toDisplayName(filter).toLowerCase();
  if (value === "media") return "media";
  if (value === "links") return "links";
  if (value === "files") return "files";
  if (value === "unread") return "unread";
  return "all";
}

function messageHasLink(message) {
  const text = toDisplayName(message?.text);
  if (!text) return false;
  return /(?:https?:\/\/|www\.)[^\s<]+/i.test(text);
}

function messageHasMedia(message) {
  const attachment = sanitizeMessageAttachment(message?.attachment, message?.text);
  if (attachment?.kind === "image") return true;
  const text = toDisplayName(message?.text);
  if (!text) return false;
  return /\.(png|jpe?g|gif|webp|svg|mp4|mov|webm)(\?|#|$)/i.test(text);
}

function messageHasFile(message) {
  const attachment = sanitizeMessageAttachment(message?.attachment, message?.text);
  if (attachment?.kind === "file") return true;
  const text = toDisplayName(message?.text);
  if (!text) return false;
  return /\.(pdf|zip|rar|7z|docx?|pptx?|xlsx?|txt|csv)(\?|#|$)/i.test(text);
}

function messageMatchesSearchFilter(message, filter, userKey) {
  if (filter === "media") return messageHasMedia(message);
  if (filter === "links") return messageHasLink(message);
  if (filter === "files") return messageHasFile(message);
  if (filter === "unread") {
    if (normalizeChatKind(message?.toType) === "group") {
      const viewerKey = normalizeName(userKey);
      const fromKey = normalizeName(message?.fromKey || message?.from);
      const seenBy = Array.isArray(message?.seenBy)
        ? message.seenBy.map(normalizeName)
        : [];
      return fromKey !== viewerKey && !seenBy.includes(viewerKey);
    }
    const toKey = normalizeName(message?.toKey || message?.to);
    return toKey === normalizeName(userKey) && !toDisplayName(message?.seenAt);
  }
  return true;
}

function buildGlobalSearchResults(userKey, options = {}) {
  const key = normalizeName(userKey);
  const user = users.get(key);
  if (!user) return [];

  const rawQuery = toDisplayName(options.query);
  const query = normalizeName(rawQuery);
  const filter = normalizeSearchFilter(options.filter);
  const maxResults = Math.max(1, Math.min(250, Number(options.limit) || 80));
  const hits = [];

  function pushHit(chatKind, withValue, withDisplayName, message, extraSearchable = "") {
    if (!message || message.deletedAt) return;
    if (!messageMatchesSearchFilter(message, filter, key)) return;
    const attachment = sanitizeMessageAttachment(message.attachment, message.text);
    const searchable = normalizeName(
      `${message.text || ""} ${message.from || ""} ${message.to || ""} ${attachment?.name || ""} ${extraSearchable}`
    );
    if (query && !searchable.includes(query)) return;

    const text = toDisplayName(message.text);
    const preview = text.length > 140 ? `${text.slice(0, 137)}...` : text;
    const fromKey = normalizeName(message.fromKey || message.from);
    const isGroup = chatKind === "group";
    const seenBy = Array.isArray(message.seenBy) ? message.seenBy.map(normalizeName) : [];
    const unread = isGroup
      ? fromKey !== key && !seenBy.includes(key)
      : normalizeName(message.toKey || message.to) === key && !toDisplayName(message.seenAt);
    hits.push({
      messageId: toDisplayName(message.id),
      kind: isGroup ? "group" : "friend",
      with: withValue,
      withDisplayName: toDisplayName(withDisplayName),
      from: toDisplayName(message.from),
      mine: fromKey === key,
      text: preview,
      timestamp: toDisplayName(message.timestamp),
      unread,
      hasAttachment: Boolean(attachment),
      attachmentKind: attachment?.kind || "",
    });
  }

  for (const friendKey of user.friends) {
    const friend = users.get(friendKey);
    if (!friend) continue;
    if (isBlockedBy(user, friendKey) || isBlockedBy(friend, key)) continue;

    const conversationKey = getConversationKey(key, friendKey);
    const messages = conversations.get(conversationKey) || [];
    if (!Array.isArray(messages) || !messages.length) continue;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      pushHit("friend", friend.username || friendKey, friend.displayName || friend.username || friendKey, message);
    }
  }

  for (const groupId of user.groups || []) {
    const group = groups.get(normalizeGroupId(groupId));
    if (!group || !isGroupMember(group, key)) continue;
    const conversationKey = getGroupConversationKey(group.id);
    const messages = conversations.get(conversationKey) || [];
    if (!Array.isArray(messages) || !messages.length) continue;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      pushHit(
        "group",
        group.id,
        group.name || group.id,
        message,
        `${group.name || ""} ${group.id || ""}`
      );
    }
  }

  hits.sort((a, b) => toDisplayName(b.timestamp).localeCompare(toDisplayName(a.timestamp)));
  return hits.slice(0, maxResults);
}

function buildFriendList(forUser) {
  const userKey = normalizeName(forUser);
  const user = users.get(userKey);
  if (!user) return [];

  const friendKeys = Array.from(user.friends || []);
  const validFriendKeys = Array.from(
    new Set(
      friendKeys
        .map((friendKey) => normalizeName(friendKey))
        .filter((friendKey) => users.has(friendKey))
    )
  );
  if (validFriendKeys.length !== friendKeys.length) {
    user.friends = new Set(validFriendKeys);
    schedulePersist();
  }

  const directList = validFriendKeys.map((friendKey) => {
    const friend = users.get(friendKey);
    const summary = getConversationSummary(userKey, friendKey);

    return {
      username: friend?.username || friendKey,
      kind: "friend",
      groupId: "",
      online: onlineUsers.has(friendKey),
      unreadCount: getUnreadCount(user, friendKey),
      lastMessage: summary.lastMessage,
      lastTimestamp: summary.lastTimestamp,
      lastFrom: summary.lastFrom,
      avatarId: friend?.avatarId || "",
      displayName: friend?.displayName || "",
      bio: friend?.bio || "",
      lastSeenAt: friend?.lastSeenAt || "",
      muted: isMutedBy(user, friendKey),
      blockedByMe: isBlockedBy(user, friendKey),
      blockedYou: isBlockedBy(friend, userKey),
      memberCount: 2,
      onlineCount: onlineUsers.has(friendKey) ? 1 : 0,
    };
  });

  const groupList = Array.from(user.groups || [])
    .map((groupKey) => groups.get(normalizeGroupId(groupKey)))
    .filter((group) => group && isGroupMember(group, userKey))
    .map((group) => {
      const summary = getGroupConversationSummary(group.id);
      let onlineCount = 0;
      for (const memberKey of group.members) {
        if (memberKey === userKey) continue;
        if (onlineUsers.has(memberKey)) onlineCount += 1;
      }
      return {
        username: group.id,
        kind: "group",
        groupId: group.id,
        online: onlineCount > 0,
        unreadCount: getUnreadCount(user, group.id),
        lastMessage: summary.lastMessage,
        lastTimestamp: summary.lastTimestamp,
        lastFrom: summary.lastFrom,
        avatarId: "",
        displayName: group.name || group.id,
        bio: `${group.members.size} member${group.members.size === 1 ? "" : "s"}`,
        lastSeenAt: "",
        muted: false,
        blockedByMe: false,
        blockedYou: false,
        memberCount: group.members.size,
        onlineCount,
      };
    });

  const list = directList.concat(groupList);

  list.sort((a, b) => {
    if (a.lastTimestamp && b.lastTimestamp) {
      return b.lastTimestamp.localeCompare(a.lastTimestamp);
    }
    if (a.lastTimestamp) return -1;
    if (b.lastTimestamp) return 1;
    const aName = a.displayName || a.username;
    const bName = b.displayName || b.username;
    return aName.localeCompare(bName);
  });

  return list;
}

function buildDiscoverOnlineList(forUser, limit = 20) {
  const userKey = normalizeName(forUser);
  const me = users.get(userKey);
  if (!me) return [];

  const exclude = new Set([userKey, ...me.friends, ...me.requests]);
  const list = [];

  for (const onlineKey of onlineUsers.keys()) {
    if (exclude.has(onlineKey)) continue;
    const user = users.get(onlineKey);
    if (!user || !user.isRegistered) continue;
    if (isBlockedBy(me, onlineKey) || isBlockedBy(user, userKey)) continue;
    list.push({
      username: user.username || onlineKey,
      displayName: user.displayName || "",
      avatarId: user.avatarId || "",
      bio: user.bio || "",
      lastSeenAt: user.lastSeenAt || "",
    });
  }

  list.sort((a, b) => a.username.localeCompare(b.username));
  return list.slice(0, limit);
}

function emitFriendList(username) {
  const userKey = normalizeName(username);
  const socketId = onlineUsers.get(userKey);
  if (!socketId) return;

  io.to(socketId).emit("friend_list_updated", {
    friends: buildFriendList(userKey),
  });
}

function emitRequests(username) {
  const userKey = normalizeName(username);
  const socketId = onlineUsers.get(userKey);
  if (!socketId) return;

  const user = users.get(userKey);
  if (!user) return;

  const requests = Array.from(user.requests).map((requesterKey) => {
    const requester = users.get(requesterKey);
    return requester?.username || requesterKey;
  });

  io.to(socketId).emit("requests_updated", { requests });
}

function emitSafetyState(username) {
  const userKey = normalizeName(username);
  const socketId = onlineUsers.get(userKey);
  if (!socketId) return;
  const user = users.get(userKey);
  if (!user) return;

  io.to(socketId).emit("safety_state_updated", {
    blocked: Array.from(user.blockedUsers || [])
      .map((targetKey) => users.get(targetKey)?.username || targetKey),
    muted: Array.from(user.mutedUsers || [])
      .map((targetKey) => users.get(targetKey)?.username || targetKey),
  });
}

function emitStatusToFriends(username, isOnline) {
  const userKey = normalizeName(username);
  const user = users.get(userKey);
  if (!user) return;

  for (const friendKey of user.friends) {
    const friendSocket = onlineUsers.get(friendKey);
    if (!friendSocket) continue;

    io.to(friendSocket).emit("user_status", {
      username: user.username,
      online: isOnline,
      lastSeenAt: user.lastSeenAt || null,
    });
  }
}

function emitMessageStatus(message) {
  if (!message?.id) return;
  if (normalizeChatKind(message?.toType) === "group") return;

  const senderSocket = onlineUsers.get(message.fromKey);
  const receiverSocket = onlineUsers.get(message.toKey);

  const senderPayload = {
    id: message.id,
    with: message.to,
    deliveredAt: message.deliveredAt || null,
    seenAt: message.seenAt || null,
  };

  const receiverPayload = {
    id: message.id,
    with: message.from,
    deliveredAt: message.deliveredAt || null,
    seenAt: message.seenAt || null,
  };

  if (senderSocket) {
    io.to(senderSocket).emit("message_status", senderPayload);
  }

  if (receiverSocket) {
    io.to(receiverSocket).emit("message_status", receiverPayload);
  }
}

function emitGroupMessageStatus(group, message) {
  if (!group || !message?.id) return;
  const groupId = normalizeGroupId(group.id || message.groupId || message.toKey);
  if (!groupId) return;
  const seenBy = Array.isArray(message.seenBy)
    ? Array.from(new Set(message.seenBy.map(normalizeName).filter(Boolean)))
    : [];
  const payload = {
    id: message.id,
    with: groupId,
    toType: "group",
    groupId,
    deliveredAt: message.deliveredAt || null,
    seenAt: message.seenAt || null,
    seenBy,
    seenCount: Math.max(0, seenBy.length - 1),
    memberCount: Math.max(0, Number(group.members?.size || 0)),
  };
  for (const memberKey of group.members || []) {
    const socketId = onlineUsers.get(normalizeName(memberKey));
    if (!socketId) continue;
    io.to(socketId).emit("message_status", payload);
  }
}

function markUndeliveredAsDelivered(userKey) {
  let changed = false;

  for (const conversation of conversations.values()) {
    for (const message of conversation) {
      if (message.toKey === userKey && !message.deliveredAt) {
        message.deliveredAt = nowIso();
        changed = true;
        emitMessageStatus(message);
      }
    }
  }

  if (changed) {
    schedulePersist();
  }
}

function markConversationAsSeen(viewerKey, targetKey, targetType = "friend") {
  const chatType = normalizeChatKind(targetType);
  if (chatType === "group") {
    const groupId = normalizeGroupId(targetKey);
    const viewer = users.get(viewerKey);
    const group = groups.get(groupId);
    if (!viewer || !group || !isGroupMember(group, viewerKey)) return;
    const key = getGroupConversationKey(groupId);
    const conversation = conversations.get(key) || [];
    const unreadChanged = setUnreadCount(viewer, groupId, 0);
    let seenChanged = false;
    const touchedMessages = [];
    for (const message of conversation) {
      if (!message || normalizeName(message.fromKey) === viewerKey) continue;
      if (!Array.isArray(message.seenBy)) message.seenBy = [];
      if (!message.seenBy.includes(viewerKey)) {
        message.seenBy.push(viewerKey);
        seenChanged = true;
        touchedMessages.push(message);
      }
    }
    if (unreadChanged || seenChanged) {
      schedulePersist();
    }
    if (seenChanged) {
      for (const message of touchedMessages) {
        emitGroupMessageStatus(group, message);
      }
    }
    if (unreadChanged) {
      emitFriendList(viewerKey);
    }
    return;
  }

  const friendKey = normalizeName(targetKey);
  const key = getConversationKey(viewerKey, friendKey);
  const conversation = conversations.get(key) || [];
  const viewer = users.get(viewerKey);

  const unreadChanged = setUnreadCount(viewer, friendKey, 0);
  let statusChanged = false;

  for (const message of conversation) {
    if (message.toKey === viewerKey && message.fromKey === friendKey && !message.seenAt) {
      const seenAt = nowIso();
      if (!message.deliveredAt) {
        message.deliveredAt = seenAt;
      }
      message.seenAt = seenAt;
      statusChanged = true;
      emitMessageStatus(message);
    }
  }

  if (unreadChanged || statusChanged) {
    schedulePersist();
  }

  if (unreadChanged) {
    emitFriendList(viewerKey);
  }
}

function removeFriendship(userAKey, userBKey) {
  const aKey = normalizeName(userAKey);
  const bKey = normalizeName(userBKey);
  const userA = users.get(aKey);
  const userB = users.get(bKey);

  if (!userA || !userB) {
    return false;
  }

  const wereFriends = userA.friends.has(bKey) || userB.friends.has(aKey);
  if (!wereFriends) {
    return false;
  }

  userA.friends.delete(bKey);
  userB.friends.delete(aKey);

  userA.requests.delete(bKey);
  userB.requests.delete(aKey);

  userA.unread.delete(bKey);
  userB.unread.delete(aKey);
  if (userA.mutedUsers instanceof Set) userA.mutedUsers.delete(bKey);
  if (userB.mutedUsers instanceof Set) userB.mutedUsers.delete(aKey);

  const conversationKey = getConversationKey(aKey, bKey);
  conversations.delete(conversationKey);

  return true;
}

function revokeAllRefreshSessionsForUser(rawUserKey) {
  const userKey = normalizeName(rawUserKey);
  if (!userKey) return;
  const tokenSet = refreshByUser.get(userKey);
  if (!tokenSet || !tokenSet.size) return;
  for (const tokenId of Array.from(tokenSet)) {
    revokeRefreshSession(tokenId);
  }
}

function emitGroupListUpdatesForUser(username) {
  const userKey = normalizeName(username);
  const user = users.get(userKey);
  if (!user || !(user.groups instanceof Set)) return;
  const touchedMembers = new Set();
  for (const groupKey of user.groups) {
    const group = groups.get(normalizeGroupId(groupKey));
    if (!group) continue;
    for (const memberKey of group.members) {
      touchedMembers.add(memberKey);
    }
  }
  for (const memberKey of touchedMembers) {
    emitFriendList(memberKey);
  }
}

function buildRegisterSuccessPayload(userKey, user) {
  return {
    username: user.username,
    email: user.email || "",
    friends: buildFriendList(userKey),
    requests: Array.from(user.requests).map((requesterKey) => {
      const requester = users.get(requesterKey);
      return requester?.username || requesterKey;
    }),
    safety: {
      blocked: Array.from(user.blockedUsers || [])
        .map((targetKey) => users.get(targetKey)?.username || targetKey),
      muted: Array.from(user.mutedUsers || [])
        .map((targetKey) => users.get(targetKey)?.username || targetKey),
    },
    profile: {
      avatarId: user.avatarId || "",
      age: user.age || "",
      gender: user.gender || "",
      displayName: user.displayName || "",
      bio: user.bio || "",
    },
  };
}

function finalizeSocketAuthentication(socket, user) {
  if (!socket || !user?.username) return false;
  user.lastSeenAt = "";
  const userKey = normalizeName(user.username);

  socket.data.userKey = userKey;
  socket.data.activeChatWith = null;
  socket.data.activeChatKind = "friend";

  const previousSocketId = onlineUsers.get(userKey);
  onlineUsers.set(userKey, socket.id);

  if (previousSocketId && previousSocketId !== socket.id) {
    const previousSocket = io.sockets.sockets.get(previousSocketId);
    if (previousSocket) {
      previousSocket.emit("error_message", {
        message: "You were signed out because this account logged in elsewhere.",
      });
      previousSocket.disconnect(true);
    }
  }

  markUndeliveredAsDelivered(userKey);
  socket.emit("register_success", buildRegisterSuccessPayload(userKey, user));
  emitStatusToFriends(userKey, true);
  emitFriendList(userKey);
  emitGroupListUpdatesForUser(userKey);
  emitSafetyState(userKey);
  schedulePersist();
  return true;
}

function allowSocketAction(socket, key, maxPerWindow, windowMs) {
  if (!socket || !key) return false;
  const max = Math.max(1, Number(maxPerWindow) || 1);
  const windowDuration = Math.max(1000, Number(windowMs) || 1000);
  if (!socket.data.rateBuckets) {
    socket.data.rateBuckets = {};
  }
  const now = Date.now();
  const bucket = socket.data.rateBuckets[key] || {
    count: 0,
    windowStartedAt: now,
  };
  if (now - bucket.windowStartedAt > windowDuration) {
    bucket.windowStartedAt = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  socket.data.rateBuckets[key] = bucket;
  return bucket.count <= max;
}

function clearScheduledMessageTimer(messageId) {
  const id = toDisplayName(messageId);
  if (!id) return;
  const timer = scheduledMessageTimers.get(id);
  if (timer) clearTimeout(timer);
  scheduledMessageTimers.delete(id);
}

function normalizeScheduledSendAt(rawValue) {
  const value = toDisplayName(rawValue);
  if (!value) {
    return { ok: false, message: "Choose a date and time for scheduled send." };
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return { ok: false, message: "Scheduled time is invalid." };
  }
  const delay = timestamp - Date.now();
  if (delay < SCHEDULE_MIN_DELAY_MS) {
    return { ok: false, message: "Choose a time at least 30 seconds in the future." };
  }
  if (delay > SCHEDULE_MAX_DELAY_MS) {
    return { ok: false, message: "Scheduled time is too far in the future." };
  }
  return { ok: true, sendAt: new Date(timestamp).toISOString() };
}

function toScheduledMessageSummary(entry) {
  if (!entry) return null;
  const toType = normalizeChatKind(entry.toType);
  const toKey = toType === "group" ? normalizeGroupId(entry.toKey) : normalizeName(entry.toKey);
  const toLabel = toType === "group"
    ? (groups.get(toKey)?.name || toKey)
    : (users.get(toKey)?.username || toKey);
  return {
    id: entry.id,
    toType,
    to: toKey,
    toLabel,
    text: toDisplayName(entry.text),
    sendAt: toDisplayName(entry.sendAt),
    createdAt: toDisplayName(entry.createdAt),
    hasAttachment: Boolean(entry.attachment),
    replyTo: entry.replyTo || null,
  };
}

function listScheduledMessagesForUser(userKey, options = {}) {
  const key = normalizeName(userKey);
  if (!key) return [];
  const filterType = options.toType ? normalizeChatKind(options.toType) : "";
  const filterTo = filterType === "group"
    ? normalizeGroupId(options.to)
    : normalizeName(options.to);
  const list = [];
  for (const entry of scheduledMessages.values()) {
    if (!entry || normalizeName(entry.fromKey) !== key) continue;
    const entryType = normalizeChatKind(entry.toType);
    const entryTo = entryType === "group" ? normalizeGroupId(entry.toKey) : normalizeName(entry.toKey);
    if (filterType && entryType !== filterType) continue;
    if (filterTo && entryTo !== filterTo) continue;
    const summary = toScheduledMessageSummary(entry);
    if (summary) list.push(summary);
  }
  list.sort((a, b) => toDisplayName(a.sendAt).localeCompare(toDisplayName(b.sendAt)));
  return list;
}

function emitScheduledMessagesUpdated(userKey, options = {}) {
  const key = normalizeName(userKey);
  const socketId = onlineUsers.get(key);
  if (!socketId) return;
  io.to(socketId).emit("scheduled_messages_updated", {
    toType: options.toType ? normalizeChatKind(options.toType) : "",
    to: toDisplayName(options.to || ""),
    messages: listScheduledMessagesForUser(key, options),
  });
}

function deliverScheduledMessageById(messageId) {
  const id = toDisplayName(messageId);
  if (!id) return;
  clearScheduledMessageTimer(id);
  const entry = scheduledMessages.get(id);
  if (!entry) return;

  const sendAtMs = Date.parse(entry.sendAt);
  if (Number.isFinite(sendAtMs) && sendAtMs > Date.now() + 500) {
    queueScheduledMessageDelivery(id);
    return;
  }

  let result = null;
  if (normalizeChatKind(entry.toType) === "group") {
    result = deliverGroupMessage({
      fromKey: entry.fromKey,
      groupId: entry.toKey,
      text: entry.text,
      attachment: entry.attachment,
      replyTo: entry.replyTo,
      timestamp: nowIso(),
    });
  } else {
    result = deliverFriendMessage({
      fromKey: entry.fromKey,
      toKey: entry.toKey,
      text: entry.text,
      attachment: entry.attachment,
      replyTo: entry.replyTo,
      timestamp: nowIso(),
    });
  }

  scheduledMessages.delete(id);

  const senderSocket = onlineUsers.get(entry.fromKey);
  if (senderSocket) {
    if (result?.ok) {
      io.to(senderSocket).emit("scheduled_message_sent", {
        id,
        toType: normalizeChatKind(entry.toType),
        to: entry.toKey,
        messageId: result.message?.id || "",
      });
    } else {
      io.to(senderSocket).emit("scheduled_message_failed", {
        id,
        toType: normalizeChatKind(entry.toType),
        to: entry.toKey,
        reason: result?.message || "Could not deliver scheduled message.",
      });
    }
  }

  emitScheduledMessagesUpdated(entry.fromKey, { toType: entry.toType, to: entry.toKey });
  schedulePersist();
}

function queueScheduledMessageDelivery(messageId) {
  const id = toDisplayName(messageId);
  if (!id) return;
  const entry = scheduledMessages.get(id);
  if (!entry) return;

  clearScheduledMessageTimer(id);
  const sendAtMs = Date.parse(entry.sendAt);
  if (!Number.isFinite(sendAtMs)) {
    scheduledMessages.delete(id);
    return;
  }
  const delay = sendAtMs - Date.now();
  if (delay <= 0) {
    setImmediate(() => deliverScheduledMessageById(id));
    return;
  }
  const maxDelay = 2_147_000_000;
  const timeoutDelay = Math.min(maxDelay, delay);
  const timer = setTimeout(() => {
    if (timeoutDelay < delay) {
      queueScheduledMessageDelivery(id);
      return;
    }
    deliverScheduledMessageById(id);
  }, timeoutDelay);
  scheduledMessageTimers.set(id, timer);
}

function queueAllScheduledMessages() {
  for (const messageId of scheduledMessages.keys()) {
    queueScheduledMessageDelivery(messageId);
  }
}

function authenticateSigninPayload(payload) {
  const identifier = toDisplayName(payload?.identifier || payload?.email || payload?.username || "");
  const password = toDisplayName(payload?.password || "");
  const isEmail = identifier.includes("@");

  if (!identifier) {
    return { ok: false, status: 400, message: "Email or username is required.", suggestions: [] };
  }
  if (!password) {
    return { ok: false, status: 400, message: "Password is required.", suggestions: [] };
  }

  if (isEmail) {
    const user = findUserByEmail(identifier);
    if (!user || !user.isRegistered) {
      return { ok: false, status: 401, message: "Email doesn't exist. Sign up.", suggestions: [] };
    }
    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return { ok: false, status: 401, message: "Incorrect password.", suggestions: [] };
    }
    return { ok: true, user };
  }

  const userKey = normalizeName(identifier);
  const user = users.get(userKey);
  const suggestions = buildUsernameSuggestions(identifier);
  if (!user || !user.isRegistered) {
    return {
      ok: false,
      status: 401,
      message: "Username doesn't exist. Sign up.",
      suggestions,
    };
  }

  if (!user.passwordSalt || !user.passwordHash) {
    const secret = createPasswordSecret(password);
    user.passwordSalt = secret.passwordSalt;
    user.passwordHash = secret.passwordHash;
    user.isRegistered = true;
    schedulePersist();
  } else if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return { ok: false, status: 401, message: "Incorrect password.", suggestions };
  }

  return { ok: true, user };
}

function authenticateSignupPayload(payload) {
  const email = normalizeEmail(payload?.email || "");
  const displayName = toDisplayName(payload?.name || payload?.displayName || "");
  const usernameInput = toDisplayName(payload?.username || "");
  const password = toDisplayName(payload?.password || "");

  if (!email) {
    return { ok: false, status: 400, message: "Email is required to sign up." };
  }
  if (isEmailTaken(email)) {
    return { ok: false, status: 409, message: "Email already registered. Sign in." };
  }
  if (!displayName) {
    return { ok: false, status: 400, message: "Name is required to sign up." };
  }
  const requestedHandle = normalizeHandleInput(usernameInput);
  if (!requestedHandle) {
    return { ok: false, status: 400, message: "Username is required." };
  }
  if (isUsernameTaken(requestedHandle)) {
    return { ok: false, status: 409, message: "This username is taken." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters in password.`,
    };
  }

  const user = getOrCreateUser(requestedHandle);
  const secret = createPasswordSecret(password);
  user.passwordSalt = secret.passwordSalt;
  user.passwordHash = secret.passwordHash;
  user.isRegistered = true;
  user.email = email;
  user.displayName = displayName;
  if (!user.createdAt) {
    user.createdAt = nowIso();
  }
  schedulePersist();

  return { ok: true, user };
}

app.post("/api/auth/signin", createIpRateLimiter("auth-signin", 25, 15 * 60 * 1000), requireCsrf, (req, res) => {
  const result = authenticateSigninPayload(req.body || {});
  if (!result.ok) {
    res.status(result.status || 401).json({
      message: result.message || "Authentication failed.",
      suggestions: result.suggestions || [],
    });
    return;
  }
  const remember = readRememberFlag(req.body?.remember);
  const userKey = normalizeName(result.user.username);
  const tokens = issueAuthTokensForUser(userKey, remember);
  if (!tokens) {
    res.status(500).json({ message: "Unable to create session." });
    return;
  }
  applyAuthCookies(res, tokens);
  res.json({
    username: result.user.username,
    email: result.user.email || "",
  });
});

app.post("/api/auth/signup", createIpRateLimiter("auth-signup", 12, 60 * 60 * 1000), requireCsrf, (req, res) => {
  const result = authenticateSignupPayload(req.body || {});
  if (!result.ok) {
    res.status(result.status || 400).json({ message: result.message || "Unable to sign up." });
    return;
  }
  const remember = readRememberFlag(req.body?.remember);
  const userKey = normalizeName(result.user.username);
  const tokens = issueAuthTokensForUser(userKey, remember);
  if (!tokens) {
    res.status(500).json({ message: "Unable to create session." });
    return;
  }
  applyAuthCookies(res, tokens);
  res.json({
    username: result.user.username,
    email: result.user.email || "",
  });
});

app.get("/api/auth/session", (req, res) => {
  const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(req.headers.cookie), {
    allowRefreshFallback: false,
  });
  if (!auth.userKey) {
    res.status(401).json({ message: "Not signed in." });
    return;
  }
  const user = users.get(auth.userKey);
  if (!user || !user.isRegistered) {
    clearAuthCookies(res);
    res.status(401).json({ message: "Session expired." });
    return;
  }
  res.json({
    authenticated: true,
    username: user.username,
    email: user.email || "",
  });
});

app.post("/api/auth/refresh", createIpRateLimiter("auth-refresh", 120, 15 * 60 * 1000), requireCsrf, (req, res) => {
  const cookies = getAuthCookiesFromHeader(req.headers.cookie);
  const refreshPayload = verifyAuthToken(cookies.refreshToken, "refresh");
  if (!refreshPayload?.jti) {
    clearAuthCookies(res);
    res.status(401).json({ message: "Session expired." });
    return;
  }
  const session = refreshSessions.get(refreshPayload.jti);
  if (!session || Date.now() > Number(session.expiresAt)) {
    revokeRefreshSession(refreshPayload.jti);
    clearAuthCookies(res);
    res.status(401).json({ message: "Session expired." });
    return;
  }
  const userKey = resolveCurrentUserKey(session.userKey || refreshPayload.sub);
  const user = userKey ? users.get(userKey) : null;
  if (!user || !user.isRegistered) {
    revokeRefreshSession(refreshPayload.jti);
    clearAuthCookies(res);
    res.status(401).json({ message: "Session expired." });
    return;
  }

  const remember = Boolean(session.remember);
  revokeRefreshSession(refreshPayload.jti);
  const tokens = issueAuthTokensForUser(userKey, remember);
  if (!tokens) {
    clearAuthCookies(res);
    res.status(500).json({ message: "Unable to refresh session." });
    return;
  }
  applyAuthCookies(res, tokens);
  res.json({ ok: true });
});

app.post("/api/auth/logout", createIpRateLimiter("auth-logout", 120, 15 * 60 * 1000), requireCsrf, (req, res) => {
  const cookies = getAuthCookiesFromHeader(req.headers.cookie);
  const refreshPayload = verifyAuthToken(cookies.refreshToken, "refresh");
  if (refreshPayload?.jti) {
    revokeRefreshSession(refreshPayload.jti);
  }
  clearAuthCookies(res);
  res.json({ ok: true });
});

io.use((socket, next) => {
  const auth = resolveUserFromAuthCookies(getAuthCookiesFromHeader(socket.handshake?.headers?.cookie), {
    allowRefreshFallback: true,
  });
  if (auth.userKey) {
    socket.data.userKey = auth.userKey;
  }
  next();
});

io.on("connection", (socket) => {
  socket.on("resume_session", () => {
    const userKey = resolveCurrentUserKey(socket.data.userKey);
    if (!userKey) {
      socket.emit("auth_failed", { message: "Session expired. Please sign in again." });
      return;
    }
    const user = users.get(userKey);
    if (!user || !user.isRegistered) {
      socket.emit("auth_failed", { message: "Session expired. Please sign in again." });
      return;
    }
    finalizeSocketAuthentication(socket, user);
  });
  socket.on("register", (payload) => {
    const isStringPayload = typeof payload === "string";
    const raw = payload || {};
    const mode = isStringPayload ? "" : toDisplayName(raw?.mode || "").toLowerCase();
    const modeNormalized = mode === "signup" ? "signup" : "signin";
    const email = isStringPayload ? "" : normalizeEmail(raw?.email || "");
    const displayName = isStringPayload ? "" : toDisplayName(raw?.name || raw?.displayName || "");
    const usernameInput = isStringPayload ? toDisplayName(payload) : toDisplayName(raw?.username);
    const password = toDisplayName(isStringPayload ? "" : raw?.password);

    let user = null;

    if (email) {
      const existingByEmail = findUserByEmail(email);
      const wantsSignup = modeNormalized === "signup";
      const wantsSignin = !wantsSignup;

      if (wantsSignin) {
        if (!existingByEmail || !existingByEmail.isRegistered) {
          socket.emit("auth_failed", { message: "Email doesn't exist. Sign up." });
          return;
        }
        if (!password) {
          socket.emit("auth_failed", { message: "Password is required." });
          return;
        }
        if (!verifyPassword(password, existingByEmail.passwordSalt, existingByEmail.passwordHash)) {
          socket.emit("auth_failed", { message: "Incorrect password." });
          return;
        }
        user = existingByEmail;
      } else {
        if (isEmailTaken(email)) {
          socket.emit("auth_failed", { message: "Email already registered. Sign in." });
          return;
        }
        if (!displayName) {
          socket.emit("auth_failed", { message: "Name is required to sign up." });
          return;
        }
        const requestedHandle = normalizeHandleInput(usernameInput);
        if (!requestedHandle) {
          socket.emit("auth_failed", { message: "Username is required." });
          return;
        }
        if (isUsernameTaken(requestedHandle)) {
          socket.emit("auth_failed", { message: "This username is taken." });
          return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          socket.emit("auth_failed", {
            message: `Use at least ${MIN_PASSWORD_LENGTH} characters in password.`,
          });
          return;
        }
        const username = requestedHandle;
        user = getOrCreateUser(username);
        const secret = createPasswordSecret(password);
        user.passwordSalt = secret.passwordSalt;
        user.passwordHash = secret.passwordHash;
        user.isRegistered = true;
        user.email = email;
        user.displayName = displayName;
        if (!user.createdAt) {
          user.createdAt = nowIso();
        }
      }
    } else {
      const wantsSignup = modeNormalized === "signup";
      const username = usernameInput;
      const userKey = normalizeName(username);

      if (wantsSignup) {
        socket.emit("auth_failed", { message: "Email is required to sign up." });
        return;
      }

      if (!username) {
        socket.emit("auth_failed", { message: "Username is required." });
        return;
      }

      const existing = users.get(userKey);
      const usernameExists = Boolean(existing?.isRegistered);
      const suggestions = buildUsernameSuggestions(username);

      if (!usernameExists) {
        socket.emit("auth_failed", {
          message: "Username doesn't exist. Sign up.",
          suggestions,
        });
        return;
      }

      if (!password) {
        socket.emit("auth_failed", {
          message: "Password is required.",
          suggestions,
        });
        return;
      }

      if (!existing.passwordSalt || !existing.passwordHash) {
        const secret = createPasswordSecret(password);
        existing.passwordSalt = secret.passwordSalt;
        existing.passwordHash = secret.passwordHash;
      } else if (!verifyPassword(password, existing.passwordSalt, existing.passwordHash)) {
        socket.emit("auth_failed", {
          message: "Incorrect password.",
          suggestions,
        });
        return;
      }

      existing.username = username;
      existing.lastSeenAt = "";
      user = existing;
    }

    if (!user) {
      socket.emit("error_message", { message: "Unable to authenticate." });
      return;
    }

    finalizeSocketAuthentication(socket, user);
  });
  socket.on("request_password_reset", (payload) => {
    pruneExpiredPasswordResetTokens();
    const identifier = toDisplayName(payload?.identifier || payload?.email || payload);
    const genericSentMessage = "If an account exists, a reset code has been sent.";
    if (!identifier) {
      socket.emit("password_reset_sent", { message: genericSentMessage });
      return;
    }

    const isEmail = identifier.includes("@");
    const user = isEmail ? findUserByEmail(identifier) : users.get(normalizeName(identifier));
    if (!user || !user.isRegistered) {
      socket.emit("password_reset_sent", { message: genericSentMessage });
      return;
    }

    const userKey = normalizeName(user.username);
    const rate = canIssuePasswordReset(userKey);
    if (!rate.allowed) {
      socket.emit("password_reset_failed", { message: rate.message });
      return;
    }

    const existingTokenId = passwordResetByUser.get(userKey);
    if (existingTokenId) dropPasswordResetTokenById(existingTokenId);

    const token = createResetToken();
    const salt = crypto.randomBytes(8).toString("hex");
    const tokenHash = createResetTokenHash(token, salt);
    const tokenId = createResetTokenId();
    const expiresAt = Date.now() + PASSWORD_RESET_CODE_TTL_MS;
    passwordResetTokens.set(tokenId, {
      userKey,
      salt,
      tokenHash,
      expiresAt,
      attemptsLeft: PASSWORD_RESET_MAX_ATTEMPTS,
    });
    passwordResetByUser.set(userKey, tokenId);
    markPasswordResetIssued(userKey, rate.state);
    dispatchPasswordResetCode(user, token);

    socket.emit("password_reset_sent", {
      message: genericSentMessage,
    });
  });

  socket.on("reset_password", (payload) => {
    pruneExpiredPasswordResetTokens();
    const identifier = toDisplayName(payload?.identifier || payload?.email || payload?.username || "");
    const token = toDisplayName(payload?.token || "");
    const newPassword = toDisplayName(payload?.newPassword || "");
    if (!identifier || !token || !newPassword) {
      socket.emit("password_reset_failed", { message: "Email/username, reset code, and new password are required." });
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      socket.emit("password_reset_failed", {
        message: `Use at least ${MIN_PASSWORD_LENGTH} characters in password.`,
      });
      return;
    }
    const isEmail = identifier.includes("@");
    const user = isEmail ? findUserByEmail(identifier) : users.get(normalizeName(identifier));
    if (!user || !user.isRegistered) {
      socket.emit("password_reset_failed", { message: "Invalid or expired reset code." });
      return;
    }

    const userKey = normalizeName(user.username);
    const tokenId = passwordResetByUser.get(userKey);
    const entry = tokenId ? passwordResetTokens.get(tokenId) : null;
    if (!entry || entry.userKey !== userKey) {
      socket.emit("password_reset_failed", { message: "Invalid or expired reset code." });
      return;
    }

    if (Date.now() > Number(entry.expiresAt)) {
      dropPasswordResetTokenById(tokenId);
      socket.emit("password_reset_failed", { message: "Reset code expired. Request a new one." });
      return;
    }

    if (!Number.isFinite(Number(entry.attemptsLeft)) || Number(entry.attemptsLeft) <= 0) {
      dropPasswordResetTokenById(tokenId);
      socket.emit("password_reset_failed", { message: "Too many attempts. Request a new code." });
      return;
    }

    const expectedHash = createResetTokenHash(token, entry.salt);
    if (expectedHash !== entry.tokenHash) {
      entry.attemptsLeft = Math.max(0, Number(entry.attemptsLeft) - 1);
      if (entry.attemptsLeft <= 0) {
        dropPasswordResetTokenById(tokenId);
        socket.emit("password_reset_failed", { message: "Too many attempts. Request a new code." });
        return;
      }
      socket.emit("password_reset_failed", {
        message: `Invalid reset code. ${entry.attemptsLeft} attempt(s) left.`,
      });
      return;
    }

    const secret = createPasswordSecret(newPassword);
    user.passwordSalt = secret.passwordSalt;
    user.passwordHash = secret.passwordHash;
    user.isRegistered = true;
    revokeAllRefreshSessionsForUser(userKey);

    dropPasswordResetTokenById(tokenId);
    schedulePersist();

    socket.emit("password_reset_success", { message: "Password updated. Please sign in." });
  });

  socket.on("push_subscribe", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey || !pushEnabled) return;
    const subscription = payload?.subscription || payload;
    const endpoint = toDisplayName(subscription?.endpoint);
    if (!endpoint) return;
    const detached = detachSubscriptionFromAll(endpoint, userKey);
    const user = users.get(userKey);
    const updated = upsertPushSubscription(user, subscription);
    if (updated || detached) {
      schedulePersist();
    }
  });

  socket.on("push_unsubscribe", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const endpoint = toDisplayName(payload?.endpoint);
    if (!endpoint) return;
    const user = users.get(userKey);
    if (removePushSubscription(user, endpoint)) {
      schedulePersist();
    }
  });

  socket.on("friend_search", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const me = users.get(userKey);
    if (!me) return;
    const query = toDisplayName(payload?.query || payload);
    if (!query) {
      socket.emit("friend_suggestions", { query: "", suggestions: [] });
      return;
    }
    const suggestions = buildFriendSearchSuggestions(query, me, 8);
    socket.emit("friend_suggestions", { query, suggestions });
  });

  socket.on("discover_online", () => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const list = buildDiscoverOnlineList(userKey, 30);
    socket.emit("discover_online", { users: list });
  });

  socket.on("global_search_messages", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "global_search_messages", 90, 60 * 1000)) {
      socket.emit("error_message", { message: "Search rate limit reached. Slow down a bit." });
      return;
    }

    const query = toDisplayName(payload?.query || "").slice(0, 120);
    const filter = normalizeSearchFilter(payload?.filter);
    const limit = Math.max(1, Math.min(250, Number(payload?.limit) || 80));
    const results = buildGlobalSearchResults(userKey, { query, filter, limit });
    socket.emit("global_search_results", {
      query,
      filter,
      results,
    });
  });

  socket.on("set_mute", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const me = users.get(userKey);
    if (!me) return;

    const targetName = toDisplayName(payload?.username || payload?.target || payload);
    const targetKey = normalizeName(targetName);
    if (!targetKey || targetKey === userKey) {
      socket.emit("error_message", { message: "Select a valid user." });
      return;
    }
    const target = users.get(targetKey);
    if (!target || !target.isRegistered || !me.friends.has(targetKey)) {
      socket.emit("error_message", { message: "You can mute only friends." });
      return;
    }

    if (!(me.mutedUsers instanceof Set)) me.mutedUsers = new Set();
    const muted = payload?.muted !== false;
    const changed = muted ? !me.mutedUsers.has(targetKey) : me.mutedUsers.has(targetKey);
    if (muted) {
      me.mutedUsers.add(targetKey);
    } else {
      me.mutedUsers.delete(targetKey);
    }

    if (changed) {
      emitFriendList(userKey);
      emitSafetyState(userKey);
      schedulePersist();
    }

    socket.emit("mute_updated", {
      username: target.username || targetName,
      muted,
    });
  });

  socket.on("set_block", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const me = users.get(userKey);
    if (!me) return;

    const targetName = toDisplayName(payload?.username || payload?.target || payload);
    const targetKey = normalizeName(targetName);
    if (!targetKey || targetKey === userKey) {
      socket.emit("error_message", { message: "Select a valid user." });
      return;
    }
    const target = users.get(targetKey);
    if (!target || !target.isRegistered) {
      socket.emit("error_message", { message: "User not found." });
      return;
    }

    if (!(me.blockedUsers instanceof Set)) me.blockedUsers = new Set();
    if (!(me.mutedUsers instanceof Set)) me.mutedUsers = new Set();

    const blocked = payload?.blocked !== false;
    let changed = blocked ? !me.blockedUsers.has(targetKey) : me.blockedUsers.has(targetKey);
    if (blocked) {
      me.blockedUsers.add(targetKey);
      if (me.mutedUsers.delete(targetKey)) changed = true;
      const removedRequestA = me.requests.delete(targetKey);
      const removedRequestB = target.requests.delete(userKey);
      if (removedRequestA) emitRequests(userKey);
      if (removedRequestB) emitRequests(targetKey);
      if (removedRequestA || removedRequestB) changed = true;

      if (socket.data.activeChatWith === targetKey) {
        socket.data.activeChatWith = null;
      }
      socket.emit("typing", {
        from: target.username || targetKey,
        isTyping: false,
      });
      const targetSocketId = onlineUsers.get(targetKey);
      if (targetSocketId) {
        io.to(targetSocketId).emit("typing", {
          from: me.username || userKey,
          isTyping: false,
        });
      }

      const active = activeCalls.get(userKey);
      if (active && active.peerKey === targetKey) {
        clearCallPair(userKey);
        const targetSocketId = onlineUsers.get(targetKey);
        if (targetSocketId) {
          io.to(targetSocketId).emit("call_end", { from: me.username || userKey });
        }
        socket.emit("call_end", { from: target.username || targetKey });
      }
    } else {
      if (me.blockedUsers.delete(targetKey)) changed = true;
    }

    if (changed) {
      emitFriendList(userKey);
      emitSafetyState(userKey);
      const targetSocketId = onlineUsers.get(targetKey);
      if (targetSocketId) {
        emitFriendList(targetKey);
      }
      schedulePersist();
    }

    socket.emit("block_updated", {
      username: target.username || targetName,
      blocked,
    });
  });

  socket.on("report_user", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "report_user", 20, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Report rate limit reached. Try again later." });
      return;
    }

    const me = users.get(userKey);
    if (!me) return;
    const targetName = toDisplayName(payload?.username || payload?.target || payload);
    const targetKey = normalizeName(targetName);
    if (!targetKey || targetKey === userKey) {
      socket.emit("error_message", { message: "Select a valid user to report." });
      return;
    }
    const target = users.get(targetKey);
    if (!target || !target.isRegistered) {
      socket.emit("error_message", { message: "User not found." });
      return;
    }

    const category = toDisplayName(payload?.category || "other").slice(0, 30).toLowerCase();
    const reason = toDisplayName(payload?.reason || "").slice(0, 240);
    const details = toDisplayName(payload?.details || "").slice(0, 500);
    const report = {
      id: `rpt_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
      reporter: me.username || userKey,
      reporterKey: userKey,
      target: target.username || targetKey,
      targetKey,
      category: category || "other",
      reason,
      details,
      createdAt: nowIso(),
      source: "socket",
    };
    void appendAbuseReport(report);
    socket.emit("report_submitted", {
      reportId: report.id,
      username: target.username || targetName,
    });
  });

  socket.on("add_friend", (rawFriendName) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const friendName = toDisplayName(rawFriendName);
    const friendKey = normalizeName(friendName);

    if (!friendName) {
      socket.emit("error_message", { message: "Friend username is required." });
      return;
    }

    if (friendKey === userKey) {
      socket.emit("error_message", { message: "You cannot add yourself." });
      return;
    }

    const me = users.get(userKey);
    if (!me) {
      socket.emit("error_message", { message: "Please reconnect and try again." });
      return;
    }

    const friend = getOrCreateUser(friendName);

    if (isBlockedBy(me, friendKey)) {
      socket.emit("error_message", { message: `Unblock @${friend.username || friendName} before sending a request.` });
      return;
    }
    if (isBlockedBy(friend, userKey)) {
      socket.emit("error_message", { message: "Unable to send request to this user." });
      return;
    }

    if (me.friends.has(friendKey)) {
      socket.emit("error_message", { message: "Already friends." });
      return;
    }

    if (me.requests.has(friendKey)) {
      me.requests.delete(friendKey);
      me.friends.add(friendKey);
      friend.friends.add(userKey);
      initializeUnreadPair(userKey, friendKey);

      emitFriendList(userKey);
      emitFriendList(friendKey);
      emitRequests(userKey);

      const friendSocket = onlineUsers.get(friendKey);
      if (friendSocket) {
        io.to(friendSocket).emit("friend_request_accepted", {
          by: me.username,
        });
      }

      socket.emit("friend_request_accepted", { by: friend.username });
      schedulePersist();
      return;
    }

    if (friend.requests.has(userKey)) {
      socket.emit("error_message", { message: "Friend request already sent." });
      return;
    }

    friend.requests.add(userKey);
    socket.emit("friend_request_sent", { to: friend.username });

    const friendSocket = onlineUsers.get(friendKey);
    if (friendSocket) {
      io.to(friendSocket).emit("friend_request_received", {
        from: me.username,
      });
      emitRequests(friendKey);
    }

    schedulePersist();
  });

  socket.on("change_username", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const user = users.get(userKey);
    if (!user) {
      socket.emit("username_change_failed", { message: "User not found." });
      return;
    }

    const currentPassword = toDisplayName(payload?.currentPassword || payload?.password);
    const desired = toDisplayName(payload?.newUsername);

    if (!currentPassword || !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
      socket.emit("username_change_failed", { message: "Incorrect password." });
      return;
    }

    const result = applyUsernameChange(userKey, desired);
    if (!result.ok) {
      socket.emit("username_change_failed", { message: result.message || "Unable to change username." });
      return;
    }

    socket.data.userKey = result.newKey;

    // Update any sockets that had the old key as active chat
    onlineUsers.forEach((socketId) => {
      const friendSocket = io.sockets.sockets.get(socketId);
      if (friendSocket?.data?.activeChatWith === result.oldKey) {
        friendSocket.data.activeChatWith = result.newKey;
      }
    });

    // Notify the user first
    socket.emit("username_changed", {
      oldUsername: result.oldUsername,
      newUsername: result.newUsername,
    });

    const impacted = new Set();
    users.forEach((other, otherKey) => {
      if (!other || otherKey === result.newKey) return;
      if (
        other.friends.has(result.newKey)
        || other.requests.has(result.newKey)
        || other.unread.has(result.newKey)
        || (other.blockedUsers instanceof Set && other.blockedUsers.has(result.newKey))
        || (other.mutedUsers instanceof Set && other.mutedUsers.has(result.newKey))
      ) {
        impacted.add(otherKey);
      }
    });

    impacted.forEach((key) => {
      const socketId = onlineUsers.get(key);
      if (socketId) {
        io.to(socketId).emit("friend_username_changed", {
          oldUsername: result.oldUsername,
          newUsername: result.newUsername,
        });
      }
    });

    impacted.forEach((key) => {
      emitFriendList(key);
      emitRequests(key);
    });

    emitFriendList(result.newKey);
    emitRequests(result.newKey);
    emitStatusToFriends(result.newKey, true);
    schedulePersist();
  });

  socket.on("change_password", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const user = users.get(userKey);
    if (!user) {
      socket.emit("password_change_failed", { message: "User not found." });
      return;
    }

    const currentPassword = toDisplayName(payload?.currentPassword || payload?.password);
    const nextPassword = toDisplayName(payload?.newPassword);

    if (!currentPassword || !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
      socket.emit("password_change_failed", { message: "Incorrect password." });
      return;
    }
    if (!nextPassword || nextPassword.length < MIN_PASSWORD_LENGTH) {
      socket.emit("password_change_failed", {
        message: `Use at least ${MIN_PASSWORD_LENGTH} characters in password.`,
      });
      return;
    }

    const secret = createPasswordSecret(nextPassword);
    user.passwordSalt = secret.passwordSalt;
    user.passwordHash = secret.passwordHash;
    revokeAllRefreshSessionsForUser(userKey);
    schedulePersist();

    socket.emit("password_changed");
  });

  socket.on("accept_friend", (rawFriendName) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const friendName = toDisplayName(rawFriendName);
    const friendKey = normalizeName(friendName);

    const me = users.get(userKey);
    const friend = users.get(friendKey);

    if (!me || !friend || !me.requests.has(friendKey)) {
      socket.emit("error_message", { message: "No pending request from this user." });
      return;
    }
    if (usersAreBlocked(userKey, friendKey)) {
      socket.emit("error_message", { message: "Friend request cannot be accepted while one of you is blocked." });
      return;
    }

    me.requests.delete(friendKey);
    me.friends.add(friendKey);
    friend.friends.add(userKey);
    initializeUnreadPair(userKey, friendKey);

    emitRequests(userKey);
    emitFriendList(userKey);
    emitFriendList(friendKey);

    socket.emit("friend_request_accepted", { by: friend.username });

    const friendSocket = onlineUsers.get(friendKey);
    if (friendSocket) {
      io.to(friendSocket).emit("friend_request_accepted", { by: me.username });
    }

    schedulePersist();
  });

  socket.on("remove_friend", (rawFriendName) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const friendName = toDisplayName(rawFriendName);
    const friendKey = normalizeName(friendName);

    const me = users.get(userKey);
    const friend = users.get(friendKey);

    if (!me || !friend || !me.friends.has(friendKey)) {
      socket.emit("error_message", { message: "This user is not in your friends list." });
      return;
    }

    const removed = removeFriendship(userKey, friendKey);
    if (!removed) {
      socket.emit("error_message", { message: "Could not remove friend. Try again." });
      return;
    }

    if (socket.data.activeChatWith === friendKey) {
      socket.data.activeChatWith = null;
    }

    const friendSocketId = onlineUsers.get(friendKey);
    if (friendSocketId) {
      const friendSocket = io.sockets.sockets.get(friendSocketId);
      if (friendSocket && friendSocket.data.activeChatWith === userKey) {
        friendSocket.data.activeChatWith = null;
      }
    }

    socket.emit("typing", {
      from: friend.username,
      isTyping: false,
    });

    if (friendSocketId) {
      io.to(friendSocketId).emit("typing", {
        from: me.username,
        isTyping: false,
      });
    }

    emitFriendList(userKey);
    emitFriendList(friendKey);
    emitRequests(userKey);
    emitRequests(friendKey);

    socket.emit("friend_removed", {
      username: friend.username,
      by: me.username,
    });

    if (friendSocketId) {
      io.to(friendSocketId).emit("friend_removed", {
        username: me.username,
        by: me.username,
      });
    }

    schedulePersist();
  });

  socket.on("get_history", (rawTarget) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    let targetName = rawTarget;
    let targetType = "friend";
    if (rawTarget && typeof rawTarget === "object") {
      targetName = rawTarget.to || rawTarget.username || rawTarget.groupId || "";
      targetType = rawTarget.kind || rawTarget.type || rawTarget.toType || "friend";
    }
    const resolved = resolveChatTargetForUser(userKey, targetName, targetType, { inferGroup: true });
    if (!resolved.ok) {
      socket.emit("error_message", { message: resolved.message || "Unable to open this chat." });
      return;
    }

    runRetentionMaintenance();
    socket.data.activeChatWith = resolved.targetKey;
    socket.data.activeChatKind = resolved.type;
    markConversationAsSeen(userKey, resolved.targetKey, resolved.type);

    const messages = conversations.get(resolved.conversationKey) || [];

    socket.emit("history", {
      with: resolved.targetKey,
      withLabel: resolved.targetLabel,
      messages,
      kind: resolved.type,
      toType: resolved.type,
      to: resolved.targetKey,
      memberCount: resolved.type === "group" ? resolved.group.members.size : 2,
    });
  });

  socket.on("clear_chat", (rawTarget) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "clear_chat", 60, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Clear chat rate limit reached. Try again later." });
      return;
    }

    let targetName = rawTarget;
    let targetType = "friend";
    if (rawTarget && typeof rawTarget === "object") {
      targetName = rawTarget.to || rawTarget.username || rawTarget.groupId || "";
      targetType = rawTarget.kind || rawTarget.type || rawTarget.toType || "friend";
    }

    const resolved = resolveChatTargetForUser(userKey, targetName, targetType, { inferGroup: true });
    if (!resolved.ok) {
      socket.emit("error_message", { message: resolved.message || "Unable to clear this chat." });
      return;
    }
    if (resolved.type === "group") {
      const role = getGroupMemberRole(resolved.group, userKey);
      if (role !== "owner" && role !== "admin") {
        socket.emit("error_message", { message: "Only group admins can clear group chat." });
        return;
      }
    }

    conversations.delete(resolved.conversationKey);

    const affectedUsers = new Set();
    if (resolved.type === "group") {
      const groupId = resolved.group.id;
      for (const memberKey of resolved.group.members) {
        const normalizedMemberKey = normalizeName(memberKey);
        const member = users.get(normalizedMemberKey);
        if (!member) continue;
        setUnreadCount(member, groupId, 0);
        affectedUsers.add(normalizedMemberKey);
      }
    } else {
      const me = users.get(userKey);
      const friend = users.get(resolved.targetKey);
      if (me) setUnreadCount(me, resolved.targetKey, 0);
      if (friend) setUnreadCount(friend, userKey, 0);
      affectedUsers.add(userKey);
      affectedUsers.add(resolved.targetKey);
    }

    const payload = {
      to: resolved.targetKey,
      with: resolved.targetKey,
      toType: resolved.type,
      kind: resolved.type,
      by: resolved.me?.username || userKey,
    };

    for (const targetKey of affectedUsers) {
      emitFriendList(targetKey);
      const targetSocketId = onlineUsers.get(targetKey);
      if (targetSocketId) {
        io.to(targetSocketId).emit("chat_cleared", payload);
      }
    }

    schedulePersist();
  });

  socket.on("set_active_chat", (rawTarget) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    let targetName = rawTarget;
    let targetType = "friend";
    if (rawTarget && typeof rawTarget === "object") {
      targetName = rawTarget.to || rawTarget.username || rawTarget.groupId || "";
      targetType = rawTarget.kind || rawTarget.type || rawTarget.toType || "friend";
    }
    const cleanTarget = toDisplayName(targetName);
    if (!cleanTarget) {
      socket.data.activeChatWith = null;
      socket.data.activeChatKind = "friend";
      return;
    }

    const resolved = resolveChatTargetForUser(userKey, cleanTarget, targetType, { inferGroup: true });
    if (!resolved.ok) {
      socket.data.activeChatWith = null;
      socket.data.activeChatKind = "friend";
      return;
    }

    socket.data.activeChatWith = resolved.targetKey;
    socket.data.activeChatKind = resolved.type;
  });

  socket.on("private_message", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "private_message", 40, 60 * 1000)) {
      socket.emit("error_message", { message: "Message rate limit reached. Slow down a bit." });
      return;
    }

    const text = withUploadToken(payload?.text);
    const attachment = sanitizeMessageAttachment(payload?.attachment, text);
    const clientTempId = String(payload?.clientTempId || "").trim();
    const safeClientTempId = clientTempId.slice(0, 64);
    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const replyTo = normalizeReplyPayload(payload?.replyTo);

    if (!text) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      socket.emit("error_message", { message: `Message too long. Limit is ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    if (toType === "group") {
      const result = deliverGroupMessage({
        fromKey: userKey,
        groupId: to,
        text,
        attachment,
        replyTo,
        clientTempId: safeClientTempId,
      });
      if (!result.ok) {
        socket.emit("error_message", { message: result.message || "Unable to send message to this group." });
        return;
      }
      if (result.existing) {
        socket.emit("private_message", result.message);
      }
      return;
    }

    const result = deliverFriendMessage({
      fromKey: userKey,
      toKey: to,
      text,
      attachment,
      replyTo,
      clientTempId: safeClientTempId,
    });
    if (!result.ok) {
      if (result.code === "blocked" && safeClientTempId) {
        socket.emit("delivery_blocked", {
          clientTempId: safeClientTempId,
          to: result.friend?.username || to,
          reason: "blocked",
        });
      }
      socket.emit("error_message", { message: result.message || "Unable to send message." });
      return;
    }
    if (result.existing) {
      socket.emit("private_message", result.message);
      emitMessageStatus(result.message);
    }
  });

  socket.on("schedule_message", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "schedule_message", 60, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Scheduling rate limit reached. Try again later." });
      return;
    }

    const to = toDisplayName(payload?.to);
    const requestedType = normalizeChatKind(payload?.toType || "friend");
    const text = withUploadToken(payload?.text);
    const attachment = sanitizeMessageAttachment(payload?.attachment, text);
    const replyTo = normalizeReplyPayload(payload?.replyTo);
    const sendAtValidation = normalizeScheduledSendAt(payload?.sendAt);
    if (!sendAtValidation.ok) {
      socket.emit("error_message", { message: sendAtValidation.message });
      return;
    }
    if (!text) {
      socket.emit("error_message", { message: "Cannot schedule an empty message." });
      return;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      socket.emit("error_message", { message: `Message too long. Limit is ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    const resolved = resolveChatTargetForUser(userKey, to, requestedType, { inferGroup: true });
    if (!resolved.ok) {
      socket.emit("error_message", { message: resolved.message || "Unable to schedule for this chat." });
      return;
    }
    if (resolved.type === "friend" && usersAreBlocked(userKey, resolved.targetKey)) {
      socket.emit("error_message", { message: "Messaging is blocked with this user." });
      return;
    }

    const entryId = createMessageId();
    const entry = {
      id: entryId,
      fromKey: userKey,
      toType: resolved.type,
      toKey: resolved.targetKey,
      text,
      attachment: attachment || null,
      replyTo: replyTo || null,
      sendAt: sendAtValidation.sendAt,
      createdAt: nowIso(),
      clientTempId: toDisplayName(payload?.clientTempId || ""),
    };
    scheduledMessages.set(entryId, entry);
    queueScheduledMessageDelivery(entryId);

    socket.emit("scheduled_message_created", {
      message: toScheduledMessageSummary(entry),
    });
    emitScheduledMessagesUpdated(userKey, { toType: entry.toType, to: entry.toKey });
    schedulePersist();
  });

  socket.on("list_scheduled_messages", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const toType = normalizeChatKind(payload?.toType || "friend");
    const to = toDisplayName(payload?.to || "");
    emitScheduledMessagesUpdated(userKey, {
      toType: to ? toType : "",
      to,
    });
  });

  socket.on("cancel_scheduled_message", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const id = toDisplayName(payload?.id || payload?.messageId || payload);
    if (!id) return;
    const entry = scheduledMessages.get(id);
    if (!entry || normalizeName(entry.fromKey) !== normalizeName(userKey)) {
      socket.emit("error_message", { message: "Scheduled message not found." });
      return;
    }
    scheduledMessages.delete(id);
    clearScheduledMessageTimer(id);
    socket.emit("scheduled_message_cancelled", { id });
    emitScheduledMessagesUpdated(userKey, { toType: entry.toType, to: entry.toKey });
    schedulePersist();
  });

  socket.on("typing", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "typing", 120, 60 * 1000)) return;

    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const isTyping = Boolean(payload?.isTyping);

    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      const me = users.get(userKey);
      if (!me || !group || !isGroupMember(group, userKey)) {
        return;
      }
      for (const memberKey of group.members) {
        if (memberKey === userKey) continue;
        const memberSocket = onlineUsers.get(memberKey);
        if (!memberSocket) continue;
        io.to(memberSocket).emit("typing", {
          from: me.username,
          isTyping,
          toType: "group",
          to: group.id,
        });
      }
      return;
    }

    const toKey = normalizeName(to);
    const me = users.get(userKey);
    if (!me || !me.friends.has(toKey)) {
      return;
    }
    if (usersAreBlocked(userKey, toKey)) {
      return;
    }

    const friendSocket = onlineUsers.get(toKey);
    if (friendSocket) {
      io.to(friendSocket).emit("typing", {
        from: me.username,
        isTyping,
        toType: "friend",
      });
    }
  });

  socket.on("voice_activity", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "voice_activity", 200, 60 * 1000)) return;

    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const isSpeaking = Boolean(payload?.isSpeaking);
    const me = users.get(userKey);
    if (!me) return;

    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      if (!group || !isGroupMember(group, userKey)) {
        return;
      }
      for (const memberKey of group.members) {
        if (memberKey === userKey) continue;
        const memberSocket = onlineUsers.get(memberKey);
        if (!memberSocket) continue;
        io.to(memberSocket).emit("voice_activity", {
          from: me.username,
          isSpeaking,
          toType: "group",
          to: group.id,
        });
      }
      return;
    }

    const toKey = normalizeName(to);
    if (!toKey || !me.friends.has(toKey)) {
      return;
    }
    if (usersAreBlocked(userKey, toKey)) {
      return;
    }

    const friendSocket = onlineUsers.get(toKey);
    if (friendSocket) {
      io.to(friendSocket).emit("voice_activity", {
        from: me.username,
        isSpeaking,
        toType: "friend",
        to: me.username,
      });
    }
  });

  socket.on("call_invite", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (normalizeChatKind(payload?.toType) === "group") {
      socket.emit("error_message", { message: "Group calls are not available yet." });
      return;
    }

    const to = toDisplayName(payload?.to);
    const toKey = normalizeName(to);
    if (!toKey) return;

    const me = users.get(userKey);
    const friend = users.get(toKey);
    if (!me || !friend || !me.friends.has(toKey)) {
      socket.emit("error_message", { message: "You can call only friends." });
      return;
    }
    if (usersAreBlocked(userKey, toKey)) {
      socket.emit("call_blocked", { to: friend.username || toKey });
      return;
    }

    if (activeCalls.has(userKey) || activeCalls.has(toKey)) {
      socket.emit("call_busy", { to: friend.username });
      return;
    }

    const friendSocketId = onlineUsers.get(toKey);
    if (!friendSocketId) {
      socket.emit("call_unavailable", { to: friend.username });
      return;
    }

    setCallPair(userKey, toKey, "ringing");
    io.to(friendSocketId).emit("call_invite", {
      from: me.username,
      type: payload?.type || "audio",
    });
    socket.emit("call_ringing", { to: friend.username });
  });

  socket.on("call_answer", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const toKey = normalizeName(payload?.to);
    const state = activeCalls.get(userKey);
    if (!state || (toKey && state.peerKey !== toKey)) return;

    const peerKey = state.peerKey;
    setCallPair(userKey, peerKey, "active");

    const peerSocketId = onlineUsers.get(peerKey);
    if (peerSocketId) {
      io.to(peerSocketId).emit("call_answer", {
        from: users.get(userKey)?.username || userKey,
      });
    }
  });

  socket.on("call_reject", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const toKey = normalizeName(payload?.to);
    const state = activeCalls.get(userKey);
    if (!state || (toKey && state.peerKey !== toKey)) return;

    const peerKey = clearCallPair(userKey);
    if (!peerKey) return;

    const peerSocketId = onlineUsers.get(peerKey);
    if (peerSocketId) {
      io.to(peerSocketId).emit("call_reject", {
        from: users.get(userKey)?.username || userKey,
      });
    }
  });

  socket.on("call_cancel", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const toKey = normalizeName(payload?.to);
    const state = activeCalls.get(userKey);
    if (!state || (toKey && state.peerKey !== toKey)) return;

    const peerKey = clearCallPair(userKey);
    if (!peerKey) return;

    const peerSocketId = onlineUsers.get(peerKey);
    if (peerSocketId) {
      io.to(peerSocketId).emit("call_cancelled", {
        from: users.get(userKey)?.username || userKey,
      });
    }
  });

  socket.on("call_end", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const toKey = normalizeName(payload?.to);
    const state = activeCalls.get(userKey);
    if (!state || (toKey && state.peerKey !== toKey)) return;

    const peerKey = clearCallPair(userKey);
    if (!peerKey) return;

    const peerSocketId = onlineUsers.get(peerKey);
    if (peerSocketId) {
      io.to(peerSocketId).emit("call_end", {
        from: users.get(userKey)?.username || userKey,
      });
    }
  });

  socket.on("call_signal", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const toKey = normalizeName(payload?.to);
    if (!toKey) return;

    const state = activeCalls.get(userKey);
    if (!state || state.peerKey !== toKey) return;

    const friendSocketId = onlineUsers.get(toKey);
    if (!friendSocketId) return;

    const me = users.get(userKey);
    io.to(friendSocketId).emit("call_signal", {
      from: me?.username || userKey,
      type: payload?.type,
      sdp: payload?.sdp || null,
      candidate: payload?.candidate || null,
    });
  });

  socket.on("update_profile", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const user = users.get(userKey);
    if (!user) return;
    if (payload?.avatarId !== undefined) user.avatarId = toDisplayName(payload.avatarId).slice(0, 32);
    if (payload?.age !== undefined) user.age = toDisplayName(payload.age).slice(0, 3);
    if (payload?.gender !== undefined) user.gender = toDisplayName(payload.gender).slice(0, 20);
    if (payload?.displayName !== undefined) user.displayName = toDisplayName(payload.displayName).slice(0, 32);
    if (payload?.bio !== undefined) user.bio = toDisplayName(payload.bio).slice(0, 120);
    socket.emit("profile_updated", {
      avatarId: user.avatarId, age: user.age, gender: user.gender, displayName: user.displayName, bio: user.bio,
    });
    for (const friendKey of user.friends) {
      const friendSocket = onlineUsers.get(friendKey);
      if (friendSocket) {
        io.to(friendSocket).emit("friend_profile_updated", {
          username: user.username, avatarId: user.avatarId, displayName: user.displayName, bio: user.bio,
        });
      }
    }
    schedulePersist();
  });

  socket.on("react", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "react", 120, 60 * 1000)) return;
    const messageId = toDisplayName(payload?.messageId);
    const emoji = toDisplayName(payload?.emoji);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const to = toDisplayName(payload?.to);
    if (!messageId || !emoji || !to) return;
    const me = users.get(userKey);
    if (!me) return;
    let convKey = "";
    let recipients = [];
    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      if (!group || !isGroupMember(group, userKey)) return;
      convKey = getGroupConversationKey(group.id);
      recipients = Array.from(group.members);
    } else {
      const toKey = normalizeName(to);
      if (!me.friends.has(toKey)) return;
      convKey = getConversationKey(userKey, toKey);
      recipients = [userKey, toKey];
    }
    const conv = conversations.get(convKey) || [];
    const message = conv.find((m) => m.id === messageId);
    if (!message) return;
    if (message.deletedAt) return;
    if (!message.reactions) message.reactions = {};
    if (!message.reactions[emoji]) message.reactions[emoji] = { count: 0, userKeys: [] };
    const entry = message.reactions[emoji];
    const alreadyIdx = entry.userKeys.indexOf(userKey);
    if (alreadyIdx >= 0) {
      entry.userKeys.splice(alreadyIdx, 1);
      entry.count = Math.max(0, entry.count - 1);
    } else {
      entry.userKeys.push(userKey);
      entry.count++;
    }
    function buildReactionPayload(forUserKey) {
      const out = {};
      for (const [em, data] of Object.entries(message.reactions)) {
        if (!data || data.count <= 0) continue;
        const userKeys = Array.isArray(data.userKeys) ? data.userKeys : [];
        const usersList = userKeys
          .map((key) => users.get(key)?.username || key)
          .map((name) => toDisplayName(name))
          .filter(Boolean);
        out[em] = {
          count: data.count,
          mine: userKeys.includes(forUserKey),
          userKeys,
          users: usersList,
        };
      }
      return out;
    }
    const uniqueRecipients = Array.from(new Set(recipients.map(normalizeName).filter(Boolean)));
    for (const targetKey of uniqueRecipients) {
      const targetSocket = onlineUsers.get(targetKey);
      if (!targetSocket) continue;
      io.to(targetSocket).emit("reaction_updated", {
        messageId,
        reactions: buildReactionPayload(targetKey),
      });
    }
    schedulePersist();
  });

  socket.on("get_group_info", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "get_group_info", 180, 60 * 1000)) return;
    const groupId = normalizeGroupId(payload?.groupId || payload?.to || payload);
    const group = groups.get(groupId);
    if (!group || !isGroupMember(group, userKey)) {
      socket.emit("error_message", { message: "Group not found." });
      return;
    }
    const groupInfo = buildGroupInfoForViewer(group, userKey);
    if (!groupInfo) return;
    socket.emit("group_info", { group: groupInfo });
  });

  socket.on("create_group", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "create_group", 20, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Group creation rate limit reached. Try again later." });
      return;
    }
    const me = users.get(userKey);
    if (!me) return;

    const requestedName = toDisplayName(payload?.name || payload?.title || "").slice(0, MAX_GROUP_NAME_LENGTH);
    const name = requestedName || `${me.username}'s group`;
    const requestedMembers = Array.isArray(payload?.members) ? payload.members : [];
    const memberKeys = new Set([userKey]);
    for (const rawMember of requestedMembers) {
      const memberKey = normalizeName(rawMember);
      if (!memberKey || memberKey === userKey) continue;
      if (!me.friends.has(memberKey)) continue;
      if (!users.get(memberKey)?.isRegistered) continue;
      memberKeys.add(memberKey);
      if (memberKeys.size >= MAX_GROUP_MEMBERS) break;
    }

    if (memberKeys.size < 2) {
      socket.emit("error_message", { message: "Add at least one friend to create a group." });
      return;
    }

    let groupId = createGroupId(name);
    while (groups.has(groupId)) {
      groupId = createGroupId(name);
    }

    const group = createGroupRecord(name, userKey, Array.from(memberKeys));
    group.id = groupId;
    groups.set(group.id, group);

    for (const memberKey of group.members) {
      const member = users.get(memberKey);
      if (!member) continue;
      if (!(member.groups instanceof Set)) member.groups = new Set();
      member.groups.add(group.id);
      setUnreadCount(member, group.id, 0);
      emitFriendList(memberKey);
      emitGroupInfoToMember(memberKey, group);
      const memberSocket = onlineUsers.get(memberKey);
      if (memberSocket) {
        io.to(memberSocket).emit("group_created", {
          group: {
            id: group.id,
            name: group.name,
            owner: users.get(group.ownerKey)?.username || group.ownerKey,
            members: getGroupMemberUsernames(group),
            createdAt: group.createdAt,
          },
        });
      }
    }

    schedulePersist();
  });

  socket.on("add_group_members", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "add_group_members", 40, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Too many group updates. Try again later." });
      return;
    }
    const groupId = normalizeGroupId(payload?.groupId || payload?.to || payload?.group);
    const group = groups.get(groupId);
    const me = users.get(userKey);
    if (!group || !me || !isGroupMember(group, userKey)) {
      socket.emit("error_message", { message: "Group not found." });
      return;
    }
    if (!(group.admins instanceof Set) || !group.admins.has(userKey)) {
      socket.emit("error_message", { message: "Only group admins can add members." });
      return;
    }

    const requestedMembers = Array.isArray(payload?.members) ? payload.members : [];
    const added = [];
    for (const rawMember of requestedMembers) {
      const memberKey = normalizeName(rawMember);
      if (!memberKey || group.members.has(memberKey)) continue;
      if (!me.friends.has(memberKey)) continue;
      const member = users.get(memberKey);
      if (!member?.isRegistered) continue;
      if (group.members.size >= MAX_GROUP_MEMBERS) break;
      group.members.add(memberKey);
      if (!(member.groups instanceof Set)) member.groups = new Set();
      member.groups.add(group.id);
      setUnreadCount(member, group.id, 0);
      added.push(member.username || memberKey);
    }

    if (!added.length) {
      socket.emit("error_message", { message: "No members were added." });
      return;
    }

    group.updatedAt = nowIso();
    const allMembers = Array.from(group.members);
    for (const memberKey of allMembers) {
      emitFriendList(memberKey);
      emitGroupInfoToMember(memberKey, group);
      const memberSocket = onlineUsers.get(memberKey);
      if (memberSocket) {
        io.to(memberSocket).emit("group_members_added", {
          groupId: group.id,
          groupName: group.name,
          added,
          by: me.username,
          members: getGroupMemberUsernames(group),
        });
      }
    }
    schedulePersist();
  });

  socket.on("remove_group_member", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "remove_group_member", 40, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Too many group updates. Try again later." });
      return;
    }
    const groupId = normalizeGroupId(payload?.groupId || payload?.to || payload?.group);
    const group = groups.get(groupId);
    const me = users.get(userKey);
    if (!group || !me || !isGroupMember(group, userKey)) {
      socket.emit("error_message", { message: "Group not found." });
      return;
    }
    if (!(group.admins instanceof Set) || !group.admins.has(userKey)) {
      socket.emit("error_message", { message: "Only group admins can remove members." });
      return;
    }

    const targetName = toDisplayName(payload?.username || payload?.member || payload?.target).replace(/^@+/, "");
    const targetKey = normalizeName(targetName);
    const targetUser = users.get(targetKey);
    if (!targetKey || !targetUser || !group.members.has(targetKey)) {
      socket.emit("error_message", { message: "Member not found in this group." });
      return;
    }
    if (targetKey === userKey) {
      socket.emit("error_message", { message: "Use Leave to exit this group." });
      return;
    }
    if (normalizeName(group.ownerKey) === targetKey) {
      socket.emit("error_message", { message: "Group owner cannot be removed." });
      return;
    }
    const targetIsAdmin = group.admins instanceof Set && group.admins.has(targetKey);
    if (targetIsAdmin && normalizeName(group.ownerKey) !== userKey) {
      socket.emit("error_message", { message: "Only owner can remove another admin." });
      return;
    }

    group.members.delete(targetKey);
    if (group.admins instanceof Set) group.admins.delete(targetKey);
    targetUser.groups?.delete(group.id);
    targetUser.unread?.delete(group.id);
    group.updatedAt = nowIso();

    const remainingMembers = Array.from(group.members);
    const removedUsername = targetUser.username || targetKey;
    const actorName = me.username || userKey;

    emitFriendList(targetKey);
    for (const memberKey of remainingMembers) {
      emitFriendList(memberKey);
      emitGroupInfoToMember(memberKey, group);
      const memberSocket = onlineUsers.get(memberKey);
      if (memberSocket) {
        io.to(memberSocket).emit("group_member_removed", {
          groupId: group.id,
          groupName: group.name || group.id,
          username: removedUsername,
          by: actorName,
        });
      }
    }

    const targetSocketId = onlineUsers.get(targetKey);
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (
        targetSocket &&
        targetSocket.data?.activeChatKind === "group" &&
        normalizeGroupId(targetSocket.data?.activeChatWith) === group.id
      ) {
        targetSocket.data.activeChatWith = null;
        targetSocket.data.activeChatKind = "friend";
        io.to(targetSocketId).emit("group_left", {
          groupId: group.id,
          groupName: group.name || group.id,
          reason: "removed",
        });
      }
      io.to(targetSocketId).emit("group_member_removed", {
        groupId: group.id,
        groupName: group.name || group.id,
        username: removedUsername,
        by: actorName,
      });
    }

    schedulePersist();
  });

  socket.on("set_group_member_role", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "set_group_member_role", 50, 60 * 60 * 1000)) {
      socket.emit("error_message", { message: "Too many role updates. Try again later." });
      return;
    }
    const groupId = normalizeGroupId(payload?.groupId || payload?.to || payload?.group);
    const group = groups.get(groupId);
    const me = users.get(userKey);
    if (!group || !me || !isGroupMember(group, userKey)) {
      socket.emit("error_message", { message: "Group not found." });
      return;
    }
    if (normalizeName(group.ownerKey) !== userKey) {
      socket.emit("error_message", { message: "Only group owner can change roles." });
      return;
    }

    const targetName = toDisplayName(payload?.username || payload?.member || payload?.target).replace(/^@+/, "");
    const targetKey = normalizeName(targetName);
    if (!targetKey || !group.members.has(targetKey)) {
      socket.emit("error_message", { message: "Member not found in this group." });
      return;
    }
    if (targetKey === normalizeName(group.ownerKey)) {
      socket.emit("error_message", { message: "Owner role cannot be changed." });
      return;
    }

    const requestedRole = normalizeName(payload?.role || "");
    const makeAdmin = requestedRole === "admin";
    if (!(group.admins instanceof Set)) group.admins = new Set();
    const alreadyAdmin = group.admins.has(targetKey);
    if (makeAdmin === alreadyAdmin) {
      socket.emit("error_message", {
        message: makeAdmin ? "Member is already an admin." : "Member is already not an admin.",
      });
      return;
    }

    if (makeAdmin) group.admins.add(targetKey);
    else group.admins.delete(targetKey);
    group.updatedAt = nowIso();

    const role = makeAdmin ? "admin" : "member";
    const targetUser = users.get(targetKey);
    const changedUsername = targetUser?.username || targetKey;
    const actorName = me.username || userKey;

    for (const memberKey of group.members) {
      emitFriendList(memberKey);
      emitGroupInfoToMember(memberKey, group);
      const memberSocket = onlineUsers.get(memberKey);
      if (!memberSocket) continue;
      io.to(memberSocket).emit("group_member_role_updated", {
        groupId: group.id,
        groupName: group.name || group.id,
        username: changedUsername,
        role,
        by: actorName,
      });
    }

    schedulePersist();
  });

  socket.on("leave_group", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    const groupId = normalizeGroupId(payload?.groupId || payload?.to || payload);
    const group = groups.get(groupId);
    const me = users.get(userKey);
    if (!group || !me || !isGroupMember(group, userKey)) {
      socket.emit("error_message", { message: "Group not found." });
      return;
    }

    group.members.delete(userKey);
    if (group.admins instanceof Set) {
      group.admins.delete(userKey);
    }
    me.groups?.delete(group.id);
    me.unread?.delete(group.id);

    const memberName = me.username || userKey;
    const remainingMembers = Array.from(group.members);
    if (!remainingMembers.length) {
      groups.delete(group.id);
      conversations.delete(getGroupConversationKey(group.id));
      for (const [id, entry] of scheduledMessages.entries()) {
        if (entry.toType === "group" && normalizeGroupId(entry.toKey) === group.id) {
          scheduledMessages.delete(id);
          const timer = scheduledMessageTimers.get(id);
          if (timer) clearTimeout(timer);
          scheduledMessageTimers.delete(id);
        }
      }
    } else {
      if (group.ownerKey === userKey) {
        group.ownerKey = remainingMembers[0];
      }
      if (!(group.admins instanceof Set)) {
        group.admins = new Set();
      }
      if (!group.admins.size && group.ownerKey) {
        group.admins.add(group.ownerKey);
      }
      group.updatedAt = nowIso();
    }

    if (
      socket.data?.activeChatKind === "group" &&
      normalizeGroupId(socket.data?.activeChatWith) === groupId
    ) {
      socket.data.activeChatWith = null;
      socket.data.activeChatKind = "friend";
      socket.emit("group_left", { groupId, groupName: group.name || groupId, reason: "left" });
    }

    emitFriendList(userKey);
    for (const memberKey of remainingMembers) {
      emitFriendList(memberKey);
      emitGroupInfoToMember(memberKey, group);
      const memberSocket = onlineUsers.get(memberKey);
      if (memberSocket) {
        io.to(memberSocket).emit("group_member_left", {
          groupId,
          groupName: group.name || groupId,
          username: memberName,
        });
      }
    }
    schedulePersist();
  });

  socket.on("edit_message", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "edit_message", 50, 60 * 1000)) {
      socket.emit("error_message", { message: "Edit rate limit reached. Slow down a bit." });
      return;
    }

    const messageId = toDisplayName(payload?.messageId);
    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const nextText = withUploadToken(payload?.text);
    if (!messageId || !to || !nextText) return;

    if (nextText.length > MAX_MESSAGE_LENGTH) {
      socket.emit("error_message", { message: `Message too long. Limit is ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    const me = users.get(userKey);
    if (!me) return;
    let conversationKey = "";
    let emitTargets = [];
    let withLabel = "";
    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      if (!group || !isGroupMember(group, userKey)) {
        socket.emit("error_message", { message: "You can edit messages only in active group chats." });
        return;
      }
      conversationKey = getGroupConversationKey(group.id);
      emitTargets = Array.from(group.members);
      withLabel = group.id;
    } else {
      const toKey = normalizeName(to);
      const friend = users.get(toKey);
      if (!friend || !me.friends.has(toKey)) {
        socket.emit("error_message", { message: "You can edit messages only in active friend chats." });
        return;
      }
      conversationKey = getConversationKey(userKey, toKey);
      emitTargets = [userKey, toKey];
      withLabel = toKey;
    }

    const conversation = conversations.get(conversationKey) || [];
    const message = conversation.find((entry) => entry.id === messageId);
    if (!message) {
      socket.emit("error_message", { message: "Message not found." });
      return;
    }

    if (message.fromKey !== userKey) {
      socket.emit("error_message", { message: "You can edit only your own messages." });
      return;
    }
    if (message.deletedAt) {
      socket.emit("error_message", { message: "Deleted messages cannot be edited." });
      return;
    }
    if (message.attachment) {
      socket.emit("error_message", { message: "Attachment messages cannot be edited." });
      return;
    }
    if (String(message.text || "").startsWith(CALL_LOG_PREFIX)) {
      socket.emit("error_message", { message: "Call log messages cannot be edited." });
      return;
    }

    if (toDisplayName(message.text) === nextText) {
      return;
    }

    message.text = nextText;
    message.editedAt = nowIso();

    const uniqueTargets = Array.from(new Set(emitTargets.map(normalizeName).filter(Boolean)));
    for (const targetKey of uniqueTargets) {
      const targetSocket = onlineUsers.get(targetKey);
      if (!targetSocket) continue;
      const withValue = toType === "group"
        ? withLabel
        : (targetKey === userKey ? users.get(withLabel)?.username || to : me.username);
      io.to(targetSocket).emit("message_edited", {
        messageId: message.id,
        with: withValue,
        toType,
        text: message.text,
        editedAt: message.editedAt,
        by: me.username,
      });
    }

    if (toType === "group") {
      for (const targetKey of uniqueTargets) {
        emitFriendList(targetKey);
      }
    } else {
      emitFriendList(userKey);
      emitFriendList(withLabel);
    }
    schedulePersist();
  });

  socket.on("set_message_pin", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;
    if (!allowSocketAction(socket, "set_message_pin", 80, 60 * 1000)) return;

    const messageId = toDisplayName(payload?.messageId);
    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    const shouldPin = Boolean(payload?.pinned);
    if (!messageId || !to) return;

    const me = users.get(userKey);
    if (!me) return;
    let conversationKey = "";
    let emitTargets = [];
    let withLabel = "";
    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      if (!group || !isGroupMember(group, userKey)) {
        socket.emit("error_message", { message: "You can pin messages only in active group chats." });
        return;
      }
      conversationKey = getGroupConversationKey(group.id);
      emitTargets = Array.from(group.members);
      withLabel = group.id;
    } else {
      const toKey = normalizeName(to);
      const friend = users.get(toKey);
      if (!friend || !me.friends.has(toKey)) {
        socket.emit("error_message", { message: "You can pin messages only in active friend chats." });
        return;
      }
      conversationKey = getConversationKey(userKey, toKey);
      emitTargets = [userKey, toKey];
      withLabel = toKey;
    }

    const conversation = conversations.get(conversationKey) || [];
    const message = conversation.find((entry) => entry.id === messageId);
    if (!message) {
      socket.emit("error_message", { message: "Message not found." });
      return;
    }
    if (message.deletedAt) {
      socket.emit("error_message", { message: "Deleted messages cannot be pinned." });
      return;
    }

    if (shouldPin) {
      message.pinnedAt = nowIso();
      message.pinnedBy = me.username;
    } else {
      message.pinnedAt = null;
      message.pinnedBy = "";
    }

    const uniqueTargets = Array.from(new Set(emitTargets.map(normalizeName).filter(Boolean)));
    for (const targetKey of uniqueTargets) {
      const targetSocket = onlineUsers.get(targetKey);
      if (!targetSocket) continue;
      const withValue = toType === "group"
        ? withLabel
        : (targetKey === userKey ? users.get(withLabel)?.username || to : me.username);
      io.to(targetSocket).emit("message_pin_updated", {
        messageId: message.id,
        with: withValue,
        toType,
        pinned: shouldPin,
        pinnedAt: message.pinnedAt,
        pinnedBy: message.pinnedBy,
        by: me.username,
      });
    }

    if (toType === "group") {
      for (const targetKey of uniqueTargets) {
        emitFriendList(targetKey);
      }
    }
    schedulePersist();
  });

  socket.on("delete_message", (payload) => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const messageId = toDisplayName(payload?.messageId);
    const to = toDisplayName(payload?.to);
    const toType = normalizeChatKind(payload?.toType || "friend");
    if (!messageId || !to) return;

    const me = users.get(userKey);
    if (!me) return;
    let conversationKey = "";
    let emitTargets = [];
    let withLabel = "";
    if (toType === "group") {
      const groupId = normalizeGroupId(to);
      const group = groups.get(groupId);
      if (!group || !isGroupMember(group, userKey)) {
        socket.emit("error_message", { message: "You can delete messages only in active group chats." });
        return;
      }
      conversationKey = getGroupConversationKey(group.id);
      emitTargets = Array.from(group.members);
      withLabel = group.id;
    } else {
      const toKey = normalizeName(to);
      const friend = users.get(toKey);
      if (!friend || !me.friends.has(toKey)) {
        socket.emit("error_message", { message: "You can delete messages only in active friend chats." });
        return;
      }
      conversationKey = getConversationKey(userKey, toKey);
      emitTargets = [userKey, toKey];
      withLabel = toKey;
    }

    const conversation = conversations.get(conversationKey) || [];
    const message = conversation.find((entry) => entry.id === messageId);
    if (!message) {
      socket.emit("error_message", { message: "Message not found." });
      return;
    }

    if (message.fromKey !== userKey) {
      socket.emit("error_message", { message: "You can delete only your own messages." });
      return;
    }

    if (message.deletedAt) {
      return;
    }

    message.deletedAt = nowIso();
    message.text = DELETED_MESSAGE_TEXT;
    message.editedAt = null;
    message.attachment = null;
    message.pinnedAt = null;
    message.pinnedBy = "";
    message.reactions = {};
    if (Array.isArray(message.seenBy)) {
      message.seenBy = [normalizeName(message.fromKey || message.from)];
    }

    const uniqueTargets = Array.from(new Set(emitTargets.map(normalizeName).filter(Boolean)));
    for (const targetKey of uniqueTargets) {
      const targetSocket = onlineUsers.get(targetKey);
      if (!targetSocket) continue;
      const withValue = toType === "group"
        ? withLabel
        : (targetKey === userKey ? users.get(withLabel)?.username || to : me.username);
      io.to(targetSocket).emit("message_deleted", {
        messageId: message.id,
        with: withValue,
        toType,
        text: message.text,
        deletedAt: message.deletedAt,
        by: me.username,
      });
    }

    if (toType === "group") {
      for (const targetKey of uniqueTargets) {
        emitFriendList(targetKey);
      }
    } else {
      emitFriendList(userKey);
      emitFriendList(withLabel);
    }
    schedulePersist();
  });

  socket.on("disconnect", () => {
    const userKey = socket.data.userKey;
    if (!userKey) return;

    const existingSocketId = onlineUsers.get(userKey);
    if (existingSocketId === socket.id) {
      const user = users.get(userKey);
      if (user) {
        for (const friendKey of user.friends) {
          const friendSocket = onlineUsers.get(friendKey);
          if (friendSocket) {
            io.to(friendSocket).emit("typing", {
              from: user.username,
              isTyping: false,
              toType: "friend",
            });
          }
        }
        for (const groupKey of user.groups || []) {
          const group = groups.get(normalizeGroupId(groupKey));
          if (!group) continue;
          for (const memberKey of group.members) {
            if (memberKey === userKey) continue;
            const memberSocket = onlineUsers.get(memberKey);
            if (!memberSocket) continue;
            io.to(memberSocket).emit("typing", {
              from: user.username,
              isTyping: false,
              toType: "group",
              to: group.id,
            });
          }
        }

        user.lastSeenAt = nowIso();
      }

      const callPeerKey = clearCallPair(userKey);
      if (callPeerKey) {
        const peerSocketId = onlineUsers.get(callPeerKey);
        if (peerSocketId) {
          io.to(peerSocketId).emit("call_end", {
            from: user?.username || userKey,
          });
        }
      }

      onlineUsers.delete(userKey);
      emitStatusToFriends(userKey, false);
      emitGroupListUpdatesForUser(userKey);
      schedulePersist();
    }
  });
});

async function closeStorage() {
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch (err) {
      console.error("Failed closing MongoDB connection:", err);
    } finally {
      mongoClient = null;
      mongoLegacyCollection = null;
      mongoUsersCollection = null;
      mongoConversationsCollection = null;
      mongoMessagesCollection = null;
    }
  }
}

async function shutdown() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  for (const timer of scheduledMessageTimers.values()) {
    clearTimeout(timer);
  }
  scheduledMessageTimers.clear();

  try {
    await persistInFlight.catch(() => {});
    await persistNow();
  } catch (err) {
    console.error("Failed to persist state during shutdown:", err);
  } finally {
    await closeStorage();
    process.exit(0);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function bootstrap() {
  await loadState();
  queueAllScheduledMessages();
  startRetentionMaintenanceLoop();

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    const usingMongo = hasMongoStorage();
    console.log(
      `Chat app running on http://localhost:${PORT} | retention=${CHAT_RETENTION_DAYS} day(s) | storage=${usingMongo ? "mongodb(collections)" : "file"}`
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
