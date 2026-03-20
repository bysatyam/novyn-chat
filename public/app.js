const socketAvailable = typeof io === "function";
const SOCKET_URL = window.location.origin.replace(/\/$/, "");
const socket = socketAvailable ? io(SOCKET_URL) : { on() {}, emit() {}, connected: false };
const authApi = window._novynAuth || null;

const loginCard         = document.getElementById("loginCard");
const chatLayout        = document.getElementById("chatLayout");
const loginForm         = document.getElementById("loginForm");
const usernameInput     = document.getElementById("usernameInput");
const passwordInput     = document.getElementById("passwordInput");
const usernameHint      = document.getElementById("usernameHint");
const usernameSuggestions = document.getElementById("usernameSuggestions");
const meName            = document.getElementById("meName");
const addFriendForm     = document.getElementById("addFriendForm");
const friendInput       = document.getElementById("friendInput");
const friendSuggestions = document.getElementById("friendSuggestions");
const chatLists         = document.querySelectorAll(".chat-list");
const requestList       = document.getElementById("requestList") || chatLists[0] || null;
const friendList        = document.getElementById("friendList") || chatLists[1] || null;
const sidebarSearch     = document.getElementById("sidebarSearchInput")
  || document.getElementById("sidebarSearch");
const activeFriendLabel = document.getElementById("activeFriendLabel");
const activeFriendPresenceLine = document.getElementById("activeFriendPresenceLine");
const activePresence    = document.getElementById("activePresence");
const activeFriendAvatar = document.getElementById("activeFriendAvatar");
const profilePanel      = document.getElementById("profilePanel");
const profilePanelAvatar = document.getElementById("profilePanelAvatar");
const profilePanelName  = document.getElementById("profilePanelName");
const profilePanelHandle = document.getElementById("profilePanelHandle");
const profilePanelStatus = document.getElementById("profilePanelStatus");
const profileStatMessages = document.getElementById("profileStatMessages") || document.getElementById("statMessages");
const profileStatMedia  = document.getElementById("profileStatMedia") || document.getElementById("statMedia");
const profileStatLinks  = document.getElementById("profileStatLinks") || document.getElementById("statLinks");
const profileStatFiles  = document.getElementById("profileStatFiles") || document.getElementById("statFiles");
const removeFriendBtn   = document.getElementById("removeFriendBtn");
const messagesEl        = document.getElementById("messages");
const meAvatar          = document.getElementById("meAvatar");
const infoPanelName     = document.getElementById("infoPanelName");
const infoPanelAvatar   = document.getElementById("infoPanelAvatar");
const infoPanelHandle   = document.getElementById("infoPanelHandle");
const infoPanelStatus   = document.getElementById("infoPanelStatus");
const messageForm       = document.getElementById("messageForm");
const messageInput      = document.getElementById("messageInput");
const attachFileBtn     = document.getElementById("attachFileBtn");
const attachFileInput   = document.getElementById("attachFileInput");
const cameraBtn         = document.getElementById("cameraBtn");
const cameraCaptureInput = document.getElementById("cameraCaptureInput");
const toast             = document.getElementById("toast");
const typingIndicator   = document.getElementById("typingIndicator");
const typingText        = document.getElementById("typingText");
const connectionLabel   = document.getElementById("connectionLabel");
const networkPill       = document.getElementById("networkPill");
const retryFailedBtn    = document.getElementById("retryFailedBtn");
const requestCount      = document.getElementById("requestCount");
const friendCount       = document.getElementById("friendCount");
const onlineCount       = document.getElementById("onlineCount");
const contactsRequestsBtn = document.getElementById("contactsRequestsBtn");
const contactsRequestsPanel = document.getElementById("contactsRequestsPanel");
const contactsRequestsBadge = document.getElementById("contactsRequestsBadge");
const discoverPanel    = document.getElementById("discoverPanel");
const discoverList     = document.getElementById("discoverList");
const discoverEmpty    = document.getElementById("discoverEmpty");
const sendButton        = messageForm ? messageForm.querySelector('button[type="submit"]') : null;
const voiceBtn          = document.getElementById("voiceBtn");
const voiceStatus       = document.getElementById("voiceStatus");
const voiceTimer        = document.getElementById("voiceTimer");
const voiceLabel        = document.getElementById("voiceLabel");
const voiceCancelBtn    = document.getElementById("voiceCancelBtn");
const voiceStopBtn      = document.getElementById("voiceStopBtn");
const voiceProgress     = document.getElementById("voiceProgress");
const voiceProgressBar  = document.getElementById("voiceProgressBar");
const voiceProgressText = document.getElementById("voiceProgressText");
const messageSearchToggle = document.getElementById("messageSearchToggle");
const messageSearchPanel = document.getElementById("messageSearchPanel");
const messageSearchInput = document.getElementById("messageSearchInput");
const messageSearchClear = document.getElementById("messageSearchClear");
const messageSearchPrev  = document.getElementById("messageSearchPrev");
const messageSearchNext  = document.getElementById("messageSearchNext");
const messageSearchCount = document.getElementById("messageSearchCount");
const callButton       = document.querySelector(".chat-header-actions .call-btn");
const videoButton      = document.querySelector(".chat-header-actions .video-btn");
const profileCallBtn   = document.querySelector(".profile-action-btn[data-action='call']");
const profileVideoBtn  = document.querySelector(".profile-action-btn[data-action='video']");
const callModal        = document.getElementById("callModal");
const callBadge        = document.getElementById("callBadge");
const callAvatar       = document.getElementById("callAvatar");
const callMiniAvatar   = document.getElementById("callMiniAvatar");
const callPeerName     = document.getElementById("callPeerName");
const callStatusText   = document.getElementById("callStatusText");
const callDurationText = document.getElementById("callDuration");
const callMuteBtn      = document.getElementById("callMuteBtn");
const callSpeakerBtn   = document.getElementById("callSpeakerBtn");
const callCameraBtn    = document.getElementById("callCameraBtn");
const callFlipBtn      = document.getElementById("callFlipBtn");
const callAcceptBtn    = document.getElementById("callAcceptBtn");
const callRejectBtn    = document.getElementById("callRejectBtn");
const callHangupBtn    = document.getElementById("callHangupBtn");
const callMinimizeBtn  = document.getElementById("callMinimizeBtn");
const callRemoteAudio  = document.getElementById("callRemoteAudio");
const callRemoteVideo  = document.getElementById("callRemoteVideo");
const callLocalVideo   = document.getElementById("callLocalVideo");
const callMini         = document.getElementById("callMini");
const callMiniName     = document.getElementById("callMiniName");
const callMiniStatus   = document.getElementById("callMiniStatus");
const callMiniTime     = document.getElementById("callMiniTime");
const callMiniEnd      = document.getElementById("callMiniEnd");
const callLogList      = document.getElementById("callLogList");
const callHistoryList  = document.getElementById("callHistoryList");
const navRailButtons   = Array.from(document.querySelectorAll(".tab-btn[data-rail], .nav-btn[data-rail]"));
const navSettingsBtn   = document.getElementById("navSettingsBtn");
const settingsPanel    = document.getElementById("settingsPanel");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsAvatar   = document.getElementById("settingsAvatar");
const settingsProfileName = document.getElementById("settingsProfileName");
const settingsProfileHandle = document.getElementById("settingsProfileHandle");
const sidebarBrand = document.querySelector(".app-brand");
const sidebarTopActions = document.querySelector(".sidebar-top-actions");
const callFilterButtons = Array.from(document.querySelectorAll("[data-call-filter]"));
const mobileSidebar     = document.getElementById("mobileSidebar");
const mobileChat        = document.getElementById("mobileChat");
const mobBackBtn        = document.getElementById("mobBackBtn");
const SESSION_KEY       = "novyn-session";
const REMEMBER_KEY      = "novyn-remember";
const MESSAGE_DRAFTS_KEY = "novyn-message-drafts";
const LOGIN_PATH        = "/login.html";
const isDashboardPage   = Boolean(chatLayout) && !document.body.classList.contains("auth-page");
const MOBILE_BP         = 768;
const INCOMING_CALLS_ENABLED = true;

let me           = "";
let activeFriend = "";
let friends      = [];
let hasGreeted   = false;
let requests     = [];
let discoverUsers = [];
let replyTo      = null;
let searchPanelOpen = false;
let friendSearchQuery = "";
let sidebarView = "messages";
let settingsOpen = false;
let callFilter = "all";
let logoutInProgress = false;
if (sidebarSearch) {
  sidebarSearch.value = "";
  sidebarSearch.setAttribute("value", "");
  friendSearchQuery = "";
}
window.addEventListener("pageshow", () => {
  if (!sidebarSearch) return;
  sidebarSearch.value = "";
  sidebarSearch.setAttribute("value", "");
  friendSearchQuery = "";
  renderRequests();
  renderFriends();
  renderCallHistory();
  renderDiscover();
}, { passive: true });

let _clearAttempts = 0;
const _clearSearch = setInterval(() => {
  if (sidebarSearch && sidebarSearch.value) {
    sidebarSearch.value = "";
    sidebarSearch.setAttribute("value", "");
    friendSearchQuery = "";
    renderFriends();
  }
  if (++_clearAttempts >= 10) clearInterval(_clearSearch);
}, 50);
const sidebarBrandHTML = sidebarBrand ? sidebarBrand.innerHTML : "";
const searchState = {
  hits: [],
  index: -1,
  query: "",
};
const friendSuggestState = {
  timer: null,
  lastQuery: "",
};
let myProfile    = { avatarId: "", displayName: "", age: "", gender: "", bio: "" };
let conversationMessages = [];
let pendingUnreadJump = { friendKey: "", count: 0 };
let lastInfoPanelFriendKey = "";
let messageWindowStart = 0;
let messageWindowEnd = 0;
let loadOlderBtn = null;
const MAX_VISIBLE_MESSAGES = 200;
const MESSAGE_WINDOW_PAGE = 80;
const PENDING_RETRY_BASE_MS = 2500;
const PENDING_RETRY_MAX_MS = 20000;
const PENDING_RETRY_TICK_MS = 1500;
const PENDING_RETRY_MAX_ATTEMPTS = 8;
const COMPOSER_MAX_MESSAGE_LENGTH = Number.isFinite(Number(messageInput?.maxLength))
  && Number(messageInput?.maxLength) > 0
  ? Math.floor(Number(messageInput.maxLength))
  : 1000;
const MESSAGE_DRAFT_MAX_LENGTH = COMPOSER_MAX_MESSAGE_LENGTH;
const ATTACHMENT_MAX_SIZE_BYTES = 15 * 1024 * 1024;
const pendingQueue = [];
const pendingQueueByTempId = new Map();
const pendingByTempId = new Map();
let messageDrafts = new Map();
let loadedDraftOwnerKey = "";
let networkStateLabel = "";
let networkStateMode = "";
window._novynProfile = myProfile;

const localTyping = {
  active:    false,
  target:    "",
  timeoutId: null,
};
const scrollState = {
  pinnedToBottom: true,
};
const attachmentUploadState = {
  active: false,
  pendingTempId: "",
  target: "",
};
const cameraCaptureState = {
  stream: null,
  facingMode: "environment",
  opening: false,
};
const EMPTY_CONVERSATION_HINT = "Choose a conversation to start messaging.";
const DELETED_MESSAGE_TEXT = "This message was deleted.";
const CALL_LOG_PREFIX = "__call_log__:";
const CALL_HISTORY_KEY = "novyn-call-history";
const MAX_CALL_HISTORY = 200;

// ─── Utilities ───────────────────────────────────────────────────────────────

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function validateOutgoingMessageText(value, options = {}) {
  const text = String(value || "");
  if (!text.trim()) return "";
  if (text.length <= COMPOSER_MAX_MESSAGE_LENGTH) return text;
  if (options.toast !== false) {
    showToast(`Message too long. Limit is ${COMPOSER_MAX_MESSAGE_LENGTH} characters.`, "error");
  }
  return null;
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024) return `${Math.round(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeAttachmentPayload(rawAttachment, fallbackUrl = "") {
  if (!rawAttachment || typeof rawAttachment !== "object") return null;
  const url = String(rawAttachment.url || fallbackUrl || "").trim();
  if (!url) return null;
  const mime = String(rawAttachment.mime || "").trim().toLowerCase();
  const name = String(rawAttachment.name || "").trim().slice(0, 120);
  const kind = String(rawAttachment.kind || "").trim().toLowerCase() === "image"
    || mime.startsWith("image/")
    ? "image"
    : "file";
  const size = Number.isFinite(Number(rawAttachment.size))
    ? Math.max(0, Math.floor(Number(rawAttachment.size)))
    : 0;
  return {
    url,
    name,
    mime,
    size,
    kind,
  };
}

function getMessageDraftOwnerKey() {
  return normalizeName(me || "");
}

function getMessageDraftStorageKey(ownerKey = getMessageDraftOwnerKey()) {
  const safeOwner = normalizeName(ownerKey || "");
  if (!safeOwner) return "";
  return `${MESSAGE_DRAFTS_KEY}:${safeOwner}`;
}

function ensureMessageDraftsLoaded(force = false) {
  const ownerKey = getMessageDraftOwnerKey();
  if (!ownerKey) {
    loadedDraftOwnerKey = "";
    messageDrafts = new Map();
    return;
  }
  if (!force && loadedDraftOwnerKey === ownerKey) return;

  loadedDraftOwnerKey = ownerKey;
  messageDrafts = new Map();

  const storageKey = getMessageDraftStorageKey(ownerKey);
  if (!storageKey) return;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([friendKey, draft]) => {
      const key = normalizeName(friendKey);
      if (!key) return;
      const value = String(draft || "").slice(0, MESSAGE_DRAFT_MAX_LENGTH);
      if (!value.trim()) return;
      messageDrafts.set(key, value);
    });
  } catch (_) {
    // Ignore local storage parse errors for drafts.
  }
}

function persistMessageDrafts() {
  if (!loadedDraftOwnerKey) return;
  const storageKey = getMessageDraftStorageKey(loadedDraftOwnerKey);
  if (!storageKey) return;

  try {
    if (!messageDrafts.size) {
      localStorage.removeItem(storageKey);
      return;
    }
    const payload = {};
    messageDrafts.forEach((draft, friendKey) => {
      payload[friendKey] = draft;
    });
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (_) {
    // Ignore local storage write errors for drafts.
  }
}

function getMessageDraft(friendUsername) {
  const friendKey = normalizeName(friendUsername);
  if (!friendKey) return "";
  ensureMessageDraftsLoaded();
  return messageDrafts.get(friendKey) || "";
}

function setMessageDraft(friendUsername, value) {
  const friendKey = normalizeName(friendUsername);
  if (!friendKey) return;
  ensureMessageDraftsLoaded();

  const nextValue = String(value || "").slice(0, MESSAGE_DRAFT_MAX_LENGTH);
  const nextTrimmed = nextValue.trim();
  const prev = messageDrafts.get(friendKey) || "";

  if (!nextTrimmed) {
    if (messageDrafts.delete(friendKey)) {
      persistMessageDrafts();
    }
    return;
  }

  if (prev === nextValue) return;
  messageDrafts.set(friendKey, nextValue);
  persistMessageDrafts();
}

function removeMessageDraft(friendUsername) {
  const friendKey = normalizeName(friendUsername);
  if (!friendKey) return;
  ensureMessageDraftsLoaded();
  if (!messageDrafts.delete(friendKey)) return;
  persistMessageDrafts();
}

function renameMessageDraft(oldUsername, newUsername) {
  const oldKey = normalizeName(oldUsername);
  const newKey = normalizeName(newUsername);
  if (!oldKey || !newKey || oldKey === newKey) return;
  ensureMessageDraftsLoaded();
  const oldDraft = messageDrafts.get(oldKey);
  if (!oldDraft) return;
  if (!messageDrafts.get(newKey)) {
    messageDrafts.set(newKey, oldDraft);
  }
  messageDrafts.delete(oldKey);
  persistMessageDrafts();
}

function migrateMessageDraftStoreOwner(oldOwnerKey, newOwnerKey) {
  const prevOwner = normalizeName(oldOwnerKey);
  const nextOwner = normalizeName(newOwnerKey);
  if (!prevOwner || !nextOwner || prevOwner === nextOwner) return;

  const prevStorageKey = getMessageDraftStorageKey(prevOwner);
  const nextStorageKey = getMessageDraftStorageKey(nextOwner);
  if (!prevStorageKey || !nextStorageKey) return;

  try {
    const previousRaw = localStorage.getItem(prevStorageKey);
    if (!previousRaw) return;
    const nextRaw = localStorage.getItem(nextStorageKey);
    if (!nextRaw) {
      localStorage.setItem(nextStorageKey, previousRaw);
    }
    localStorage.removeItem(prevStorageKey);
  } catch (_) {
    // Ignore local storage migration errors for drafts.
  }
}

function persistActiveMessageDraft() {
  if (!activeFriend || !messageInput) return;
  setMessageDraft(activeFriend, messageInput.value);
}

function applyActiveMessageDraft() {
  if (!messageInput) return;
  const draft = activeFriend ? getMessageDraft(activeFriend) : "";
  messageInput.value = draft;
  if (sendButton) {
    sendButton.classList.toggle("ready", draft.trim().length > 0);
  }
}

function isNativePlatform() {
  try {
    return Boolean(
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform()
    );
  } catch (_) {
    return false;
  }
}

function openExternalLink(href) {
  const url = String(href || "").trim();
  if (!url) return;
  const cap = window.Capacitor;
  const browser = cap && cap.Plugins && cap.Plugins.Browser;
  if (browser && typeof browser.open === "function") {
    browser.open({ url });
    return;
  }
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    if (!isNativePlatform()) {
      window.location.href = url;
      return;
    }
    try {
      const base = window.location.origin;
      const resolved = new URL(url, base);
      if (resolved.origin !== base) {
        window.location.href = resolved.href;
      }
    } catch (_) {
      // Ignore URL parsing errors.
    }
  }
}

function buildAttachmentDownloadUrl(fileUrl, fileName = "file") {
  const baseUrl = String(fileUrl || "").trim();
  if (!baseUrl) return "";
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}download=1&name=${encodeURIComponent(fileName || "file")}`;
}

function triggerAttachmentDownload(downloadUrl, fileName = "file") {
  const href = String(downloadUrl || "").trim();
  if (!href || href === "#") return;
  const name = String(fileName || "file").trim() || "file";
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", name);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function buildCapturedPhotoFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `photo-${year}${month}${day}-${hours}${minutes}${seconds}.jpg`;
}

function createCapturedPhotoFile(blob) {
  const name = buildCapturedPhotoFilename();
  try {
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (_) {
    blob.name = name;
    return blob;
  }
}

function stopCameraCaptureStream() {
  const stream = cameraCaptureState.stream;
  cameraCaptureState.stream = null;
  if (!stream || typeof stream.getTracks !== "function") return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (_) {
      // Ignore camera track stop errors.
    }
  });
}

const cameraCaptureModal = (() => {
  const modal = document.createElement("div");
  modal.id = "cameraCaptureModal";
  modal.className = "camera-capture-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Capture photo");
  modal.innerHTML = `
    <div class="camera-capture-backdrop" data-camera-capture-close="1"></div>
    <div class="camera-capture-card">
      <div class="camera-capture-toolbar">
        <span class="camera-capture-title">Capture photo</span>
        <button id="cameraCaptureClose" type="button" class="camera-capture-btn camera-capture-close" aria-label="Close camera">Close</button>
      </div>
      <div class="camera-capture-stage">
        <video id="cameraCaptureVideo" class="camera-capture-video" autoplay playsinline muted></video>
      </div>
      <div class="camera-capture-actions">
        <button id="cameraCaptureSwitch" type="button" class="camera-capture-btn">Switch</button>
        <button id="cameraCaptureTake" type="button" class="camera-capture-btn camera-capture-take">Take photo</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const videoEl = modal.querySelector("#cameraCaptureVideo");
  const closeBtn = modal.querySelector("#cameraCaptureClose");
  const switchBtn = modal.querySelector("#cameraCaptureSwitch");
  const takeBtn = modal.querySelector("#cameraCaptureTake");
  const backdrop = modal.querySelector(".camera-capture-backdrop");
  let lastFocused = null;

  function setButtonsDisabled(isDisabled) {
    const disabled = Boolean(isDisabled);
    if (takeBtn) takeBtn.disabled = disabled;
    if (switchBtn) switchBtn.disabled = disabled;
  }

  async function requestCameraStream(preferredFacing = "environment") {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported in this browser.");
    }
    const attempts = [];
    if (preferredFacing) {
      attempts.push({
        audio: false,
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      attempts.push({
        audio: false,
        video: {
          facingMode: preferredFacing,
        },
      });
    }
    attempts.push({ audio: false, video: true });

    let lastError = null;
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to access camera.");
  }

  async function bindStream(preferredFacing = cameraCaptureState.facingMode) {
    stopCameraCaptureStream();
    const stream = await requestCameraStream(preferredFacing || "environment");
    cameraCaptureState.stream = stream;
    cameraCaptureState.facingMode = preferredFacing || cameraCaptureState.facingMode || "environment";
    if (videoEl) {
      videoEl.srcObject = stream;
      try {
        await videoEl.play();
      } catch (_) {
        // Some browsers may block autoplay until video is visible.
      }
    }
  }

  function close() {
    modal.classList.add("hidden");
    document.body.classList.remove("camera-capture-open");
    stopCameraCaptureStream();
    if (videoEl) {
      try {
        videoEl.pause();
      } catch (_) {}
      videoEl.srcObject = null;
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
    setButtonsDisabled(false);
    cameraCaptureState.opening = false;
  }

  async function open() {
    if (cameraCaptureState.opening) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported in this browser.");
    }
    lastFocused = document.activeElement;
    modal.classList.remove("hidden");
    document.body.classList.add("camera-capture-open");
    setButtonsDisabled(true);
    cameraCaptureState.opening = true;
    try {
      await bindStream(cameraCaptureState.facingMode || "environment");
      setButtonsDisabled(false);
      if (takeBtn) takeBtn.focus();
    } catch (error) {
      close();
      throw error;
    } finally {
      cameraCaptureState.opening = false;
    }
  }

  async function switchFacingMode() {
    if (cameraCaptureState.opening) return;
    const nextFacing = cameraCaptureState.facingMode === "environment" ? "user" : "environment";
    setButtonsDisabled(true);
    cameraCaptureState.opening = true;
    try {
      await bindStream(nextFacing);
      cameraCaptureState.facingMode = nextFacing;
    } finally {
      cameraCaptureState.opening = false;
      if (!modal.classList.contains("hidden")) {
        setButtonsDisabled(false);
      }
    }
  }

  async function capturePhotoAsFile() {
    if (!videoEl || !(videoEl.srcObject instanceof MediaStream)) {
      throw new Error("Camera stream is not ready.");
    }
    const width = Number(videoEl.videoWidth || 0);
    const height = Number(videoEl.videoHeight || 0);
    if (!width || !height) {
      throw new Error("Camera is still loading. Try again.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to capture photo.");
    }
    context.drawImage(videoEl, 0, 0, width, height);
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });
    if (!blob) {
      throw new Error("Unable to capture photo.");
    }
    return createCapturedPhotoFile(blob);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  if (switchBtn) {
    switchBtn.addEventListener("click", async () => {
      try {
        await switchFacingMode();
      } catch (error) {
        console.error(error);
        showToast("Could not switch camera.", "error");
        if (!modal.classList.contains("hidden")) {
          setButtonsDisabled(false);
        }
      }
    });
  }
  if (takeBtn) {
    takeBtn.addEventListener("click", async () => {
      if (!activeFriend) {
        showToast("Choose a friend before sending a photo.", "error");
        return;
      }
      if (attachmentUploadState.active) {
        showToast("Please wait for the current upload to finish.", "info");
        return;
      }
      setButtonsDisabled(true);
      try {
        const capturedPhoto = await capturePhotoAsFile();
        close();
        await uploadAttachmentFromPicker(capturedPhoto);
      } catch (error) {
        console.error(error);
        showToast(String(error?.message || "Unable to capture photo."), "error");
        if (!modal.classList.contains("hidden")) {
          setButtonsDisabled(false);
        }
      }
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", close);
  }
  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-camera-capture-close='1']")) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  });

  return {
    open,
    close,
    isOpen() {
      return !modal.classList.contains("hidden");
    },
  };
})();

const imageViewer = (() => {
  const modal = document.createElement("div");
  modal.id = "imageViewerModal";
  modal.className = "image-viewer-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Image preview");
  modal.innerHTML = `
    <div class="image-viewer-backdrop" data-image-viewer-close="1"></div>
    <div class="image-viewer-card">
      <div class="image-viewer-toolbar">
        <span class="image-viewer-name" id="imageViewerName">Image</span>
        <div class="image-viewer-actions">
          <a id="imageViewerDownload" class="image-viewer-btn" href="#">Download</a>
          <button id="imageViewerClose" type="button" class="image-viewer-btn image-viewer-close" aria-label="Close image preview">Close</button>
        </div>
      </div>
      <div class="image-viewer-stage">
        <img id="imageViewerImg" class="image-viewer-img" alt="Image preview" />
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const imgEl = modal.querySelector("#imageViewerImg");
  const nameEl = modal.querySelector("#imageViewerName");
  const closeBtn = modal.querySelector("#imageViewerClose");
  const downloadEl = modal.querySelector("#imageViewerDownload");
  const backdrop = modal.querySelector(".image-viewer-backdrop");
  let lastFocused = null;

  function close() {
    modal.classList.add("hidden");
    document.body.classList.remove("image-viewer-open");
    if (imgEl) {
      imgEl.removeAttribute("src");
    }
    if (nameEl) {
      nameEl.textContent = "Image";
    }
    if (downloadEl) {
      downloadEl.setAttribute("href", "#");
      downloadEl.removeAttribute("download");
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function open(payload = {}) {
    const src = String(payload.src || "").trim();
    if (!src || !imgEl) return;
    const fileName = String(payload.fileName || "").trim() || "image";
    lastFocused = document.activeElement;
    imgEl.src = src;
    imgEl.alt = fileName;
    if (nameEl) {
      nameEl.textContent = fileName;
    }
    if (downloadEl) {
      downloadEl.setAttribute("href", buildAttachmentDownloadUrl(src, fileName));
      downloadEl.setAttribute("download", fileName);
    }
    modal.classList.remove("hidden");
    document.body.classList.add("image-viewer-open");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  if (downloadEl) {
    downloadEl.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      triggerAttachmentDownload(
        downloadEl.getAttribute("href") || "",
        downloadEl.getAttribute("download") || "image"
      );
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", close);
  }
  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-image-viewer-close='1']")) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  });

  return { open, close };
})();

function canPreviewFileInViewer(fileUrl, mimeType, fileName) {
  const url = String(fileUrl || "").toLowerCase();
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  if (mime === "application/pdf") return true;
  if (/\.pdf($|[?#])/.test(url) || /\.pdf$/.test(name)) return true;
  return false;
}

const fileViewer = (() => {
  const modal = document.createElement("div");
  modal.id = "fileViewerModal";
  modal.className = "image-viewer-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "File preview");
  modal.innerHTML = `
    <div class="image-viewer-backdrop" data-file-viewer-close="1"></div>
    <div class="image-viewer-card">
      <div class="image-viewer-toolbar">
        <span class="image-viewer-name" id="fileViewerName">Attachment</span>
        <div class="image-viewer-actions">
          <a id="fileViewerDownload" class="image-viewer-btn" href="#">Download</a>
          <button id="fileViewerClose" type="button" class="image-viewer-btn image-viewer-close" aria-label="Close file preview">Close</button>
        </div>
      </div>
      <div class="image-viewer-stage">
        <iframe id="fileViewerFrame" class="file-viewer-frame hidden" title="File preview"></iframe>
        <div id="fileViewerFallback" class="file-viewer-fallback hidden">
          <div class="file-viewer-fallback-title">Preview unavailable</div>
          <div class="file-viewer-fallback-sub">Use the download button to open this file.</div>
          <div id="fileViewerMeta" class="file-viewer-meta"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const nameEl = modal.querySelector("#fileViewerName");
  const frameEl = modal.querySelector("#fileViewerFrame");
  const fallbackEl = modal.querySelector("#fileViewerFallback");
  const metaEl = modal.querySelector("#fileViewerMeta");
  const closeBtn = modal.querySelector("#fileViewerClose");
  const downloadEl = modal.querySelector("#fileViewerDownload");
  const backdrop = modal.querySelector(".image-viewer-backdrop");
  let lastFocused = null;

  function close() {
    modal.classList.add("hidden");
    document.body.classList.remove("image-viewer-open");
    if (nameEl) {
      nameEl.textContent = "Attachment";
    }
    if (frameEl) {
      frameEl.classList.add("hidden");
      frameEl.removeAttribute("src");
    }
    if (fallbackEl) {
      fallbackEl.classList.add("hidden");
    }
    if (metaEl) {
      metaEl.textContent = "";
    }
    if (downloadEl) {
      downloadEl.setAttribute("href", "#");
      downloadEl.removeAttribute("download");
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function open(payload = {}) {
    const src = String(payload.src || "").trim();
    if (!src) return;
    const fileName = String(payload.fileName || "").trim() || "Attachment";
    const mime = String(payload.mime || "").trim();
    const size = Number(payload.size);
    const canPreview = canPreviewFileInViewer(src, mime, fileName);

    lastFocused = document.activeElement;
    if (nameEl) {
      nameEl.textContent = fileName;
    }
    if (downloadEl) {
      downloadEl.setAttribute("href", buildAttachmentDownloadUrl(src, fileName));
      downloadEl.setAttribute("download", fileName);
    }

    if (canPreview && frameEl) {
      frameEl.setAttribute("src", src);
      frameEl.classList.remove("hidden");
      if (fallbackEl) fallbackEl.classList.add("hidden");
      if (metaEl) metaEl.textContent = "";
    } else {
      if (frameEl) {
        frameEl.classList.add("hidden");
        frameEl.removeAttribute("src");
      }
      if (fallbackEl) fallbackEl.classList.remove("hidden");
      if (metaEl) {
        const sizeText = formatFileSize(size);
        const typeText = mime || "Unknown file type";
        metaEl.textContent = sizeText ? `${typeText} • ${sizeText}` : typeText;
      }
    }

    modal.classList.remove("hidden");
    document.body.classList.add("image-viewer-open");
    if (closeBtn) closeBtn.focus();
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  if (downloadEl) {
    downloadEl.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      triggerAttachmentDownload(
        downloadEl.getAttribute("href") || "",
        downloadEl.getAttribute("download") || "file"
      );
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", close);
  }
  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-file-viewer-close='1']")) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  });

  return { open, close };
})();

async function openComposerCameraCapture() {
  if (!activeFriend) {
    showToast("Choose a friend before sending a photo.", "error");
    return;
  }
  if (attachmentUploadState.active) {
    showToast("Please wait for the current upload to finish.", "info");
    return;
  }
  if (messageInput?.disabled) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    if (cameraCaptureInput) {
      cameraCaptureInput.value = "";
      cameraCaptureInput.click();
      return;
    }
    showToast("Camera is not supported in this browser.", "error");
    return;
  }

  try {
    await cameraCaptureModal.open();
  } catch (error) {
    console.error(error);
    if (cameraCaptureInput) {
      cameraCaptureInput.value = "";
      cameraCaptureInput.click();
      showToast("Live camera unavailable. Opened image picker instead.", "info");
      return;
    }
    showToast("Unable to open camera.", "error");
  }
}

function setSidebarView(nextView, options = {}) {
  const allowed = ["messages", "calls", "contacts", "discover"];
  const view = allowed.includes(nextView) ? nextView : "messages";
  const prevView = sidebarView;
  sidebarView = view;
  document.body.dataset.rail = view;
  navRailButtons.forEach((btn) => {
    const btnView = btn.dataset.rail || "";
    if (btnView === "settings") return;
    btn.classList.toggle("active", btnView === view);
  });
  if (sidebarBrand) {
    if (view === "messages") {
      sidebarBrand.innerHTML = sidebarBrandHTML || "Novyn";
    } else if (view === "calls") {
      sidebarBrand.textContent = "Calls";
    } else if (view === "contacts") {
      sidebarBrand.textContent = "Contacts";
    } else if (view === "discover") {
      sidebarBrand.textContent = "Discover";
    }
  }
  if (sidebarTopActions) {
    sidebarTopActions.style.display = view === "messages" ? "" : "none";
  }
  if (networkPill) {
    networkPill.style.display = view === "messages" ? "" : "none";
  }
  if (sidebarSearch) {
    if (view === "calls") {
      sidebarSearch.placeholder = "Search calls...";
    } else if (view === "contacts") {
      sidebarSearch.placeholder = "Search contacts...";
    } else if (view === "discover") {
      sidebarSearch.placeholder = "Find people or groups...";
    } else {
      sidebarSearch.placeholder = "Search friends...";
    }
  }
  if (view === "discover") {
    requestDiscoverOnline();
  }
  if (view === "contacts" && prevView !== "contacts") {
    if (sidebarSearch && sidebarSearch.value) sidebarSearch.value = "";
    if (friendSearchQuery) friendSearchQuery = "";
  }
  if (view !== "calls" && callFilter !== "all") {
    setCallFilter("all");
  }
  if (view !== "contacts") {
    setRequestsPanelOpen(false);
  }
  if (!options.silent) {
    renderRequests();
    renderFriends();
    renderCallHistory();
    renderDiscover();
  }
}

function setRequestsPanelOpen(nextState) {
  if (!contactsRequestsPanel || !contactsRequestsBtn) return;
  const isOpen = Boolean(nextState);
  contactsRequestsPanel.classList.toggle("is-open", isOpen);
  contactsRequestsPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  contactsRequestsBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function updateRequestsBadge() {
  if (!contactsRequestsBadge) return;
  const count = requests.length || 0;
  if (count > 0) {
    contactsRequestsBadge.textContent = count > 99 ? "99+" : String(count);
    contactsRequestsBadge.style.display = "";
  } else {
    contactsRequestsBadge.style.display = "none";
  }
}

function setSettingsOpen(nextState) {
  if (!settingsPanel) return;
  settingsOpen = Boolean(nextState);
  document.body.classList.toggle("settings-open", settingsOpen);
  settingsPanel.setAttribute("aria-hidden", settingsOpen ? "false" : "true");
  if (navSettingsBtn) navSettingsBtn.classList.toggle("active", settingsOpen);
  if (settingsOpen) {
    navRailButtons.forEach((btn) => {
      const btnView = btn.dataset.rail || "";
      if (btnView && btnView !== "settings") btn.classList.remove("active");
    });
    document.body.dataset.rail = "settings";
    syncSettingsPanel();
  } else {
    setSidebarView(sidebarView, { silent: true });
  }
}

function clearSidebarSearch() {
  if (!sidebarSearch) return;
  sidebarSearch.value = "";
  friendSearchQuery = "";
}

function showSidebarListOnMobile(options = {}) {
  const usePanels = window._novynPanels && typeof window._novynPanels.show === "function";
  const isMobile = usePanels && typeof window._novynPanels.isMobile === "function"
    ? window._novynPanels.isMobile()
    : window.innerWidth <= MOBILE_BP;
  if (!isMobile) return;
  if (usePanels) {
    window._novynPanels.show("friends", { silent: options.silent !== false });
    return;
  }
  showSidebarOnMobile();
}

function switchRail(nextView, options = {}) {
  const view = String(nextView || "").trim();
  if (!view) return;
  if (view === "settings") {
    setSettingsOpen(true);
    return;
  }
  if (settingsOpen) setSettingsOpen(false);
  setSidebarView(view, options);
  showSidebarListOnMobile({ silent: true });
}

window.switchRail = switchRail;
window._novynOpenSettingsPanel = () => setSettingsOpen(true);
window._novynCloseSettingsPanel = () => setSettingsOpen(false);
window._novynToggleSettingsPanel = () => setSettingsOpen(!settingsOpen);

function syncSettingsPanel() {
  if (!settingsPanel) return;
  const handle = me ? `@${me}` : "@you";
  if (settingsProfileName) settingsProfileName.textContent = getMyDisplayName();
  if (settingsProfileHandle) settingsProfileHandle.textContent = handle;
  if (settingsAvatar) {
    const fallback = (me || "?").slice(0, 2).toUpperCase();
    if (myProfile.avatarId && window._novynAvatarUtils) {
      window._novynAvatarUtils.applyAvatarToEl(settingsAvatar, myProfile.avatarId, fallback);
    } else {
      settingsAvatar.textContent = fallback;
      settingsAvatar.style.background = "";
    }
  }
}

function setCallFilter(nextFilter) {
  const allowed = ["all", "missed", "video"];
  callFilter = allowed.includes(nextFilter) ? nextFilter : "all";
  callFilterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.callFilter === callFilter);
  });
  renderCallHistory();
}

function collectCallHistoryEntries() {
  const entries = [];
  const seen = new Set();
  const pushEntry = (friend, message, log) => {
    if (!friend || !message) return;
    const key = `${normalizeName(friend.username)}|${message.timestamp || ""}|${message.text || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ friend, message, log });
  };

  const cached = readCallHistoryCache();
  cached.forEach((entry) => {
    if (!entry || !entry.text) return;
    const log = parseCallLogPayload(entry.text);
    if (!log) return;
    const friendName = String(entry.friend || "").trim();
    if (!friendName) return;
    const friend = findFriend(friendName) || { username: friendName, displayName: "" };
    pushEntry(friend, {
      text: entry.text,
      timestamp: entry.timestamp || "",
      from: entry.from || friendName,
    }, log);
  });

  friends.forEach((friend) => {
    const rawText = friend?.lastMessage || "";
    if (!rawText) return;
    const log = parseCallLogPayload(rawText);
    if (!log) return;
    pushEntry(friend, {
      text: rawText,
      timestamp: friend.lastTimestamp || "",
      from: friend.lastFrom || friend.username || "",
    }, log);
  });

  if (activeFriend && Array.isArray(conversationMessages)) {
    const friend = findFriend(activeFriend) || { username: activeFriend, displayName: "" };
    conversationMessages.forEach((message) => {
      if (!message) return;
      const log = parseCallLogPayload(message.text);
      if (!log) return;
      pushEntry(friend, message, log);
    });
  }

  return entries;
}

function renderCallHistory() {
  if (!callHistoryList) return;
  callHistoryList.innerHTML = "";

  const query = friendSearchQuery;
  const entries = collectCallHistoryEntries();
  const filtered = entries.filter((entry) => {
    const log = entry.log || parseCallLogPayload(entry.message?.text || "");
    if (!log) return false;
    if (callFilter === "missed") {
      const missedStatuses = ["missed", "declined", "busy", "unavailable", "cancelled"];
      if (!missedStatuses.includes(log.status)) return false;
    }
    if (callFilter === "video") {
      if (log.mediaType && log.mediaType !== "video") return false;
    }
    if (!query) return true;
    const name = getFriendDisplayName(entry.friend || {});
    const handle = entry.friend?.username || "";
    return normalizeSearchText(`${name} ${handle}`).includes(query);
  });

  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.className = "item-card list-empty";
    const rawQuery = sidebarSearch ? sidebarSearch.value.trim() : "";
    empty.textContent = query ? `No calls match "${rawQuery || friendSearchQuery}"` : "No calls yet";
    callHistoryList.appendChild(empty);
    return;
  }

  filtered.sort((a, b) => {
    const aTs = a.message?.timestamp || a.friend?.lastTimestamp || "";
    const bTs = b.message?.timestamp || b.friend?.lastTimestamp || "";
    if (aTs && bTs) return bTs.localeCompare(aTs);
    if (aTs) return -1;
    if (bTs) return 1;
    return 0;
  });

  filtered.forEach((entry) => {
    const friend = entry.friend || {};
    const message = entry.message || {};
    const log = entry.log || parseCallLogPayload(message.text);
    if (!log) return;
    const fromMe = normalizeName(message.from) === normalizeName(me);
    const display = getCallLogDisplay(log, fromMe);
    const timeText = formatFriendTime(message.timestamp || friend.lastTimestamp || "");
    const isBadStatus = ["cancelled", "declined", "missed", "busy", "unavailable"].includes(display.status);
    const isNeutralStatus = display.status === "ended";
    const statusClass = isNeutralStatus ? "neutral" : (isBadStatus ? "bad" : "good");

    const item = document.createElement("li");
    const mediaClass = log.mediaType === "video" ? "video" : "audio";
    item.className = `call-log-item ${display.direction === "incoming" ? "incoming" : "outgoing"} status-${statusClass} ${mediaClass}`;

    const icon = document.createElement("div");
    icon.className = "call-log-item-icon";
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>`;

    const content = document.createElement("div");
    content.className = "call-log-item-content";
    const title = document.createElement("div");
    title.className = "call-log-item-title";
    title.textContent = getFriendDisplayName(friend);
    const subtitle = document.createElement("div");
    subtitle.className = "call-log-item-subtitle";
    subtitle.textContent = display.subtitle;
    const status = document.createElement("div");
    status.className = `call-status-pill ${statusClass}`;
    status.textContent = display.title;
    content.append(title, subtitle, status);

    const time = document.createElement("div");
    time.className = "call-log-item-time";
    time.textContent = timeText || "";

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "call-log-action";
    actionBtn.title = "Call back";
    actionBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>`;
    actionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (friend?.username) {
        setActiveFriend(friend.username);
        setTimeout(() => startVoiceCall(), 240);
      }
    });

    item.addEventListener("click", () => {
      if (friend?.username) setActiveFriend(friend.username);
    });

    item.append(icon, content, time, actionBtn);
    callHistoryList.appendChild(item);
  });
}

function showChatOnMobile() {
  if (!mobileSidebar || !mobileChat) return;
  if (window.innerWidth > MOBILE_BP) return;
  mobileSidebar.setAttribute("data-mob-hidden", "true");
  mobileChat.removeAttribute("data-mob-hidden");
  document.body.classList.add("mob-chat-open");
  document.body.classList.remove("mob-list-open");
}

function showSidebarOnMobile() {
  if (!mobileSidebar || !mobileChat) return;
  if (window.innerWidth > MOBILE_BP) return;
  mobileSidebar.removeAttribute("data-mob-hidden");
  mobileChat.setAttribute("data-mob-hidden", "true");
  document.body.classList.remove("mob-chat-open");
  document.body.classList.add("mob-list-open");
}

function setActiveChatTarget(friendName) {
  if (!socketAvailable || !isDashboardPage) return;
  socket.emit("set_active_chat", friendName || "");
}

function getFriendSearchBlob(friend) {
  const displayName = getFriendDisplayName(friend);
  const bio = friend?.bio || "";
  const username = friend?.username || "";
  const lastMessage = friend?.lastMessage || "";
  const lastFrom = friend?.lastFrom || "";
  const preview = friendPreview(friend);
  return normalizeSearchText(
    `${displayName} ${username} ${bio} ${lastMessage} ${lastFrom} ${preview}`
  );
}

function clearStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (_) {
    // Ignore storage failures.
  }
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch (_) {}
}

function redirectToLogin() {
  if (window.location.pathname === LOGIN_PATH) return;
  window.location.replace(LOGIN_PATH);
}

function prepareLogoutTransition() {
  logoutInProgress = true;
  cameraCaptureModal.close();
  clearStoredSession();
  ensureDashboardSession._pending = null;
  resumeSocketSession._pending = false;
  if (socketAvailable && socket.connected && typeof socket.disconnect === "function") {
    try {
      socket.disconnect();
    } catch (_) {
      // Ignore disconnect failures while navigating away.
    }
  }
}

window._novynPrepareLogout = prepareLogoutTransition;

function refreshAuthSessionSilently() {
  const request = authApi?.refreshSession
    ? authApi.refreshSession()
    : fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      });
  Promise.resolve(request).catch(() => {});
}

function resumeSocketSession(force = false) {
  if (!socketAvailable || !isDashboardPage) return;
  if (!socket.connected) return;
  if (resumeSocketSession._pending && !force) return;
  resumeSocketSession._pending = true;
  socket.emit("resume_session");
}

resumeSocketSession._pending = false;

async function hasValidHttpSession() {
  if (authApi?.hasValidSession) {
    try {
      const result = await authApi.hasValidSession();
      return Boolean(result?.ok);
    } catch (_) {
      return false;
    }
  }

  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (response.ok) return true;
    if (response.status !== 401) return false;
  } catch (_) {
    return false;
  }

  try {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!refreshResponse.ok) return false;
    const retry = await fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    return retry.ok;
  } catch (_) {
    return false;
  }
}

async function ensureDashboardSession(force = false) {
  if (!isDashboardPage) return false;
  if (ensureDashboardSession._pending && !force) {
    return ensureDashboardSession._pending;
  }

  const checkPromise = (async () => {
    const ok = await hasValidHttpSession();
    if (!ok) {
      clearStoredSession();
      redirectToLogin();
      return false;
    }
    if (socket.connected) {
      resumeSocketSession(true);
    }
    return true;
  })();

  ensureDashboardSession._pending = checkPromise;
  try {
    return await checkPromise;
  } finally {
    ensureDashboardSession._pending = null;
  }
}

ensureDashboardSession._pending = null;

if (isDashboardPage) {
  void ensureDashboardSession();
}

function getLocalDateKey(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateSeparatorLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const now = new Date();

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.round((startOfNow - startOfDate) / (24 * 60 * 60 * 1000));

  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatFullTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMessageStatusKey(message) {
  if (message?.failed) return "failed";
  if (message?.pending) return "pending";
  if (message?.seenAt) return "seen";
  if (message?.deliveredAt) return "delivered";
  return "sent";
}

const notificationAudio = {
  context: null,
  unlocked: false,
};
const notificationState = {
  permissionRequested: false,
};
const pushState = {
  publicKey: "",
  inFlight: false,
  lastEndpoint: "",
  lastUser: "",
};

function unlockNotificationAudio() {
  if (notificationAudio.unlocked) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    if (!notificationAudio.context) notificationAudio.context = new AudioCtx();
    const ctx = notificationAudio.context;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    notificationAudio.unlocked = true;
  } catch (_) {
    // Ignore browsers that block audio context creation.
  }
}

function playIncomingPing() {
  const ctx = notificationAudio.context;
  if (!notificationAudio.unlocked || !ctx) return;
  try {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, now);
    oscillator.frequency.exponentialRampToValueAtTime(560, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.17);
  } catch (_) {
    // Ignore transient audio failures.
  }
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  if (notificationState.permissionRequested) return Notification.permission;
  notificationState.permissionRequested = true;
  try {
    return await Notification.requestPermission();
  } catch (_) {
    return Notification.permission;
  }
}

function canSystemNotify() {
  return "Notification" in window && Notification.permission === "granted";
}

function shouldSystemNotify() {
  return document.hidden || !document.hasFocus();
}

function isAppVisible() {
  return !document.hidden && document.hasFocus();
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getPushPublicKey() {
  if (pushState.publicKey) return pushState.publicKey;
  try {
    const res = await fetch("/api/push/public-key", { cache: "no-store" });
    if (!res.ok) return "";
    const data = await res.json();
    pushState.publicKey = String(data?.publicKey || "").trim();
    return pushState.publicKey;
  } catch (_) {
    return "";
  }
}

async function ensurePushSubscription(requestPermission = false) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!socketAvailable || !me) return;
  if (pushState.inFlight) return;

  if (Notification.permission === "default" && requestPermission) {
    await requestNotificationPermission();
  }
  if (Notification.permission !== "granted") return;

  pushState.inFlight = true;
  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration?.pushManager) return;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const publicKey = await getPushPublicKey();
      if (!publicKey) return;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const payload = subscription.toJSON ? subscription.toJSON() : subscription;
    const endpoint = payload?.endpoint || "";
    const userKey = normalizeName(me);
    if (!endpoint) return;
    if (pushState.lastEndpoint === endpoint && pushState.lastUser === userKey) return;
    pushState.lastEndpoint = endpoint;
    pushState.lastUser = userKey;
    socket.emit("push_subscribe", { subscription: payload });
  } catch (err) {
    console.warn("Push subscription failed:", err);
  } finally {
    pushState.inFlight = false;
  }
}

function showSystemNotification(title, options = {}) {
  if (!canSystemNotify()) return false;
  try {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      try {
        window.focus();
      } catch (_) {
        // Ignore focus errors.
      }
    };
    return true;
  } catch (_) {
    return false;
  }
}

function formatNotificationPreview(text, maxLen = 120) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "New message";
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 3)}...`;
}

function notifyIncomingMessage(message, options = {}) {
  if (!message) return;
  if (normalizeName(message.from) === normalizeName(me)) return;
  const isActiveThread =
    activeFriend && normalizeName(message.from) === normalizeName(activeFriend);
  if (!options.force && isActiveThread && isAppVisible()) return;
  const senderName = options.senderName || (() => {
    const sender = findFriend(message.from);
    return sender ? getFriendDisplayName(sender) : message.from;
  })();
  const callPreview = formatCallLogPreview(message.text, false);
  const bodyText = callPreview || formatNotificationPreview(message.text);
  showSystemNotification(`New message from ${senderName}`, {
    body: formatNotificationPreview(bodyText),
    tag: `msg-${normalizeName(message.from) || "unknown"}`,
  });
}

function notifyIncomingCall(from, options = {}) {
  if (!from) return;
  if (!options.force && !shouldSystemNotify()) return;
  const displayName = getCallPeerDisplayName(from);
  const body = options.blocked
    ? `${displayName} tried to call you.`
    : `${displayName} is calling.`;
  showSystemNotification("Incoming call", {
    body,
    tag: `call-${normalizeName(from) || "unknown"}`,
  });
}

function handleUserGesture() {
  unlockNotificationAudio();
  requestNotificationPermission();
  ensurePushSubscription(true);
}

document.addEventListener("pointerdown", handleUserGesture, { passive: true });
document.addEventListener("keydown", handleUserGesture, { passive: true });

/**
 * Smooth-scroll the messages container to the bottom.
 * Uses scrollTo with behavior:'smooth' so it animates instead of jumping.
 * Falls back to instant scroll for initial history load (skipAnimation).
 */
function scrollToBottom(skipAnimation = false) {
  if (!messagesEl) return;
  const maxTop = Math.max(0, messagesEl.scrollHeight - messagesEl.clientHeight);
  if (skipAnimation) {
    messagesEl.scrollTop = maxTop;
    const snap = () => {
      const nextTop = Math.max(0, messagesEl.scrollHeight - messagesEl.clientHeight);
      messagesEl.scrollTop = nextTop;
    };
    requestAnimationFrame(snap);
    setTimeout(snap, 80);
    return;
  }
  messagesEl.scrollTo({
    top:      maxTop,
    behavior: "smooth",
  });
}

/**
 * Returns true when the user is already near the bottom of the message list.
 * We only auto-scroll when they're within 120px of the bottom — if they've
 * scrolled up to read history, we don't yank them back down on new messages.
 */
function isNearBottom() {
  const threshold = 120;
  return (
    messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight <=
    threshold
  );
}

// ─── Network state ────────────────────────────────────────────────────────────

function getFailedPendingTempIds() {
  const failedTempIds = [];
  pendingByTempId.forEach((message, tempId) => {
    if (!message || !message.failed || !tempId) return;
    failedTempIds.push(tempId);
  });
  return failedTempIds;
}

function retryAllFailedMessages() {
  const failedTempIds = getFailedPendingTempIds();
  if (!failedTempIds.length) {
    showToast("No failed messages to retry.", "info");
    return;
  }
  failedTempIds.forEach((tempId) => retryFailedMessage(tempId, { toast: false }));
  const label = failedTempIds.length === 1 ? "message" : "messages";
  showToast(`Retrying ${failedTempIds.length} failed ${label}...`, "info");
}

function renderNetworkState() {
  if (!connectionLabel) return;
  const queuedCount = pendingQueue.length;
  const failedCount = getFailedPendingTempIds().length;
  const queuedSuffix = queuedCount ? ` | ${queuedCount} queued` : "";
  const failedSuffix = failedCount ? ` | ${failedCount} failed` : "";
  connectionLabel.textContent = `${networkStateLabel || ""}${queuedSuffix}${failedSuffix}`;
  if (networkPill) {
    networkPill.classList.remove("connected", "offline");
    if (networkStateMode === "connected") networkPill.classList.add("connected");
    if (networkStateMode === "offline")   networkPill.classList.add("offline");
  }
  if (retryFailedBtn) {
    retryFailedBtn.classList.toggle("hidden", failedCount === 0);
    retryFailedBtn.disabled = failedCount === 0;
    retryFailedBtn.textContent = failedCount > 1 ? `Retry failed (${failedCount})` : "Retry failed";
  }
}

function setNetworkState(label, state) {
  networkStateLabel = label;
  networkStateMode = state;
  renderNetworkState();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message, type = "info") {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden", "error", "success");
  if (type === "error")   toast.classList.add("error");
  if (type === "success") toast.classList.add("success");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

// ─── Username suggestions ─────────────────────────────────────────────────────

function clearUsernameSuggestions() {
  if (!usernameHint || !usernameSuggestions) return;
  usernameHint.textContent = "";
  usernameHint.classList.add("hidden");
  usernameSuggestions.innerHTML = "";
  usernameSuggestions.classList.add("hidden");
}

function showUsernameSuggestions(requested, suggestions) {
  if (!usernameHint || !usernameSuggestions) return;
  const list = Array.isArray(suggestions) ? suggestions.slice(0, 6) : [];

  usernameHint.textContent = `"${requested}" is taken. Try one of these:`;
  usernameHint.classList.remove("hidden");
  usernameSuggestions.innerHTML = "";

  for (const suggestion of list) {
    const btn      = document.createElement("button");
    btn.type       = "button";
    btn.className  = "suggestion-chip";
    btn.textContent = suggestion;
    btn.addEventListener("click", () => {
      usernameInput.value = suggestion;
      usernameInput.focus();
      clearUsernameSuggestions();
    });
    usernameSuggestions.appendChild(btn);
  }

  usernameSuggestions.classList.toggle("hidden", list.length === 0);
}

function clearFriendSuggestions() {
  if (!friendSuggestions) return;
  friendSuggestions.innerHTML = "";
  friendSuggestions.classList.add("hidden");
}

function showFriendSuggestions(requested, suggestions) {
  if (!friendSuggestions) return;
  const list = Array.isArray(suggestions) ? suggestions.slice(0, 8) : [];
  friendSuggestions.innerHTML = "";
  for (const suggestion of list) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "friend-suggestion-item";

    const avatar = document.createElement("span");
    avatar.className = "friend-suggestion-avatar";
    avatar.textContent = suggestion.slice(0, 2).toUpperCase();

    const label = document.createElement("span");
    label.textContent = suggestion;

    btn.append(avatar, label);
    btn.addEventListener("click", () => {
      if (friendInput) {
        friendInput.value = suggestion;
        friendInput.focus();
      }
      clearFriendSuggestions();
    });
    friendSuggestions.appendChild(btn);
  }
  friendSuggestions.classList.toggle("hidden", list.length === 0 || !requested);
}

// ─── Time formatting ──────────────────────────────────────────────────────────

function prettyTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFriendTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return prettyTime(iso);
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatAudioTime(seconds) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function getAudioDuration(audio) {
  if (!audio) return 0;
  const dur = audio.duration;
  if (Number.isFinite(dur) && dur > 0) return dur;
  if (audio.seekable && audio.seekable.length) {
    try {
      const end = audio.seekable.end(audio.seekable.length - 1);
      if (Number.isFinite(end) && end > 0) return end;
    } catch (_) {
      // Ignore seekable errors.
    }
  }
  return 0;
}

const WAVE_BAR_COUNT = 28;
const WAVE_BAR_MIN = 4;
const WAVE_BAR_MAX = 24;

function hashStringToSeed(value) {
  const str = String(value || "");
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWaveform(waveformEl, seed) {
  if (!waveformEl) return;
  const rng = seededRng(seed);
  waveformEl.innerHTML = "";
  for (let i = 0; i < WAVE_BAR_COUNT; i += 1) {
    const bar = document.createElement("span");
    bar.className = "wv-bar pending";
    const height = Math.round(WAVE_BAR_MIN + rng() * (WAVE_BAR_MAX - WAVE_BAR_MIN));
    bar.style.height = `${height}px`;
    waveformEl.appendChild(bar);
  }
}

function updateWaveformProgress(waveformEl, progress) {
  if (!waveformEl) return;
  const bars = waveformEl.querySelectorAll(".wv-bar");
  const played = Math.round(Math.max(0, Math.min(1, progress)) * bars.length);
  bars.forEach((bar, i) => {
    if (i < played) {
      bar.classList.add("played");
      bar.classList.remove("pending");
    } else {
      bar.classList.add("pending");
      bar.classList.remove("played");
    }
  });
}

function formatCallDuration(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildCallLogPayload(status, direction, durationSeconds, mediaType) {
  const safeStatus = String(status || "").trim() || "ended";
  const safeDirection = String(direction || "").trim() || "outgoing";
  const safeDuration = Number.isFinite(durationSeconds) ? Math.max(0, Math.floor(durationSeconds)) : 0;
  const safeMedia = String(mediaType || "").trim() || "audio";
  return `${CALL_LOG_PREFIX}${safeStatus}|${safeDirection}|${safeDuration}|${safeMedia}`;
}

function parseCallLogPayload(rawText) {
  const text = String(rawText || "");
  if (!text.startsWith(CALL_LOG_PREFIX)) return null;
  const body = text.slice(CALL_LOG_PREFIX.length);
  const [status, direction, duration, mediaType] = body.split("|");
  if (!status) return null;
  const seconds = Number.isFinite(Number(duration)) ? Math.max(0, Math.floor(Number(duration))) : 0;
  return {
    status: String(status || "").trim() || "ended",
    direction: String(direction || "").trim() || "outgoing",
    duration: seconds,
    mediaType: String(mediaType || "").trim() || "audio",
  };
}

function getCallHistoryStorageKey() {
  const userKey = normalizeName(me || "");
  return userKey ? `${CALL_HISTORY_KEY}:${userKey}` : CALL_HISTORY_KEY;
}

function readCallHistoryCache() {
  const key = getCallHistoryStorageKey();
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function writeCallHistoryCache(list) {
  const key = getCallHistoryStorageKey();
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_CALL_HISTORY)));
  } catch (_) {}
}

function addCallHistoryEntry(entry) {
  if (!entry || !entry.friend || !entry.text) return false;
  if (!me) return false;
  const list = readCallHistoryCache();
  const entryId = entry.id
    ? String(entry.id)
    : `${normalizeName(entry.friend)}|${entry.timestamp || ""}|${entry.text}`;
  if (list.some((item) => item._id === entryId)) return false;
  list.unshift({
    _id: entryId,
    friend: entry.friend,
    text: entry.text,
    timestamp: entry.timestamp || "",
    from: entry.from || "",
  });
  writeCallHistoryCache(list);
  return true;
}

function cacheCallLogMessage(message) {
  const log = parseCallLogPayload(message?.text);
  if (!log) return false;
  const other = normalizeName(message?.from) === normalizeName(me) ? message?.to : message?.from;
  const friend = String(other || "").trim();
  if (!friend) return false;
  return addCallHistoryEntry({
    id: message.id,
    friend,
    text: message.text,
    timestamp: message.timestamp || "",
    from: message.from || "",
  });
}

function cacheCallLogMessages(messages) {
  if (!Array.isArray(messages)) return;
  messages.forEach((msg) => cacheCallLogMessage(msg));
}

function invertCallDirection(direction) {
  if (direction === "outgoing") return "incoming";
  if (direction === "incoming") return "outgoing";
  return direction || "outgoing";
}

function getCallLogDisplay(log, fromMe) {
  const direction = fromMe ? log.direction : invertCallDirection(log.direction);
  const isVideo = log.mediaType === "video";
  const mediaLabel = isVideo ? "Video call" : "Call";
  const title = direction === "incoming"
    ? (isVideo ? "Incoming video" : "Incoming call")
    : (isVideo ? "Outgoing video" : "Outgoing call");
  let subtitle = mediaLabel;
  let statusLabel = "Ended";
  const isIncoming = direction === "incoming";
  if (log.status === "ended") {
    subtitle = log.duration > 0 ? `${mediaLabel} ended - ${formatCallDuration(log.duration)}` : `${mediaLabel} ended`;
    statusLabel = "Ended";
  } else if (log.status === "cancelled") {
    subtitle = isIncoming ? `Missed ${mediaLabel.toLowerCase()}` : `${mediaLabel} cancelled`;
    statusLabel = "Cancelled";
  } else if (log.status === "declined") {
    subtitle = isIncoming ? `Missed ${mediaLabel.toLowerCase()}` : `${mediaLabel} declined`;
    statusLabel = "Declined";
  } else if (log.status === "missed") {
    subtitle = `Missed ${mediaLabel.toLowerCase()}`;
    statusLabel = "Missed";
  } else if (log.status === "busy") {
    subtitle = isIncoming ? `Missed ${mediaLabel.toLowerCase()}` : "User busy";
    statusLabel = "Busy";
  } else if (log.status === "unavailable") {
    subtitle = isIncoming ? `Missed ${mediaLabel.toLowerCase()}` : "User unavailable";
    statusLabel = "Unavailable";
  }
  return { title, subtitle, direction, status: log.status, statusLabel };
}

function formatCallLogPreview(rawText, fromMe) {
  const log = parseCallLogPayload(rawText);
  if (!log) return "";
  const display = getCallLogDisplay(log, fromMe);
  return `📞 ${display.subtitle}`;
}

function formatLastSeen(iso) {
  if (!iso) return "Offline";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Offline";

  const now = new Date();
  const timeText = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) {
    return `Last seen ${timeText}`;
  }

  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (date.toDateString() === y.toDateString()) {
    return `Last seen yesterday ${timeText}`;
  }

  const dateText = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `Last seen ${dateText}, ${timeText}`;
}

function cleanDisplayName(value) {
  return String(value || "").trim();
}

function getMyDisplayName() {
  const display = cleanDisplayName(myProfile.displayName);
  if (display) return display;
  return me ? `@${me}` : "@you";
}

function renderMyName() {
  if (!meName) return;
  meName.textContent = getMyDisplayName();
  meName.title = me ? `@${me}` : "";
}

function getFriendDisplayName(friend) {
  const fallback = String(friend?.username || "").trim();
  const display = cleanDisplayName(friend?.displayName);
  return display || fallback;
}

function displayDiffersFromUsername(friend) {
  const username = String(friend?.username || "").trim();
  const display = cleanDisplayName(friend?.displayName);
  return Boolean(display) && normalizeName(display) !== normalizeName(username);
}

function getFriendPresenceText(friend) {
  const statusText = friend.online ? "Online now" : formatLastSeen(friend.lastSeenAt);
  const bio = cleanDisplayName(friend?.bio);
  if (bio) {
    const compactBio = bio.length > 48 ? `${bio.slice(0, 45)}...` : bio;
    return `${statusText} · ${compactBio}`;
  }
  if (displayDiffersFromUsername(friend)) {
    return `${statusText} · @${friend.username}`;
  }
  return statusText;
}

function getContactBucket(friend) {
  if (friend?.online) return "online";
  const last = new Date(friend?.lastSeenAt || "");
  if (Number.isNaN(last.getTime())) return "offline";
  const diffMinutes = (Date.now() - last.getTime()) / 60000;
  if (diffMinutes <= 60) return "away";
  return "offline";
}

function syncProfilePanelStats() {
  if (!profileStatMessages || !profileStatMedia || !profileStatLinks || !profileStatFiles) return;
  const messages = Array.isArray(conversationMessages) ? conversationMessages : [];
  const linkRegex = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[\/?#][^\s<]*)?/i;
  const mediaRegex = /\.(png|jpe?g|gif|webp|mp4|mov|webm|mp3|wav|ogg)(\?|#|$)/i;
  const fileRegex = /\.(pdf|zip|rar|7z|docx?|pptx?|xlsx?)(\?|#|$)/i;

  let linkCount = 0;
  let mediaCount = 0;
  let fileCount = 0;

  for (const message of messages) {
    if (message?.deletedAt) continue;
    const text = String(message?.text || "");
    if (!text) continue;
    if (linkRegex.test(text)) linkCount += 1;
    if (mediaRegex.test(text)) mediaCount += 1;
    if (fileRegex.test(text)) fileCount += 1;
  }

  profileStatMessages.textContent = String(messages.length);
  profileStatLinks.textContent = String(linkCount);
  profileStatMedia.textContent = String(mediaCount);
  profileStatFiles.textContent = String(fileCount);
}

function syncCallLogPanel() {
  if (!callLogList) return;
  if (!activeFriend) {
    callLogList.innerHTML = '<div class="call-log-empty">No calls yet</div>';
    return;
  }
  const messages = Array.isArray(conversationMessages) ? conversationMessages : [];
  const logs = messages.filter((msg) => parseCallLogPayload(msg?.text));
  if (!logs.length) {
    callLogList.innerHTML = '<div class="call-log-empty">No calls yet</div>';
    return;
  }

  callLogList.innerHTML = "";
  logs
    .slice(-5)
    .reverse()
    .forEach((message) => {
      const log = parseCallLogPayload(message.text);
      if (!log) return;
      const fromMe = normalizeName(message.from) === normalizeName(me);
      const display = getCallLogDisplay(log, fromMe);

      const item = document.createElement("div");
      item.className = `call-log-item ${display.direction === "incoming" ? "incoming" : "outgoing"}`;

      const icon = document.createElement("div");
      icon.className = "call-log-item-icon";
      icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81 19.79 19.79 0 01.22 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16h-.08z"/></svg>`;

      const content = document.createElement("div");
      content.className = "call-log-item-content";
      const title = document.createElement("div");
      title.className = "call-log-item-title";
      title.textContent = display.title;
      const subtitle = document.createElement("div");
      subtitle.className = "call-log-item-subtitle";
      subtitle.textContent = display.subtitle;
      const status = document.createElement("div");
      const isBadStatus = ["cancelled", "declined", "missed", "busy", "unavailable"].includes(display.status);
      const isNeutralStatus = display.status === "ended";
      const statusClass = isNeutralStatus ? "neutral" : (isBadStatus ? "bad" : "good");
      status.className = `call-status-pill ${statusClass}`;
      status.textContent = display.statusLabel || "Call";
      content.append(title, subtitle, status);

      const time = document.createElement("div");
      time.className = "call-log-item-time";
      time.textContent = prettyTime(message.timestamp);

      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "call-log-action";
      actionBtn.title = "Call back";
      actionBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81 19.79 19.79 0 01.22 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16h-.08z"/></svg>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startVoiceCall();
      });

      item.addEventListener("click", () => startVoiceCall());
      item.append(icon, content, time, actionBtn);
      callLogList.appendChild(item);
    });

  renderCallHistory();
}

function syncProfilePanel(friend) {
  if (!profilePanel || !profilePanelName || !profilePanelAvatar || !profilePanelHandle || !profilePanelStatus) return;

  if (!activeFriend) {
    profilePanelName.textContent = "Select a friend";
    profilePanelHandle.textContent = "@handle";
    profilePanelStatus.textContent = "Offline";
    profilePanelStatus.classList.add("offline");
    profilePanelAvatar.textContent = "?";
    profilePanelAvatar.style.background = "";
    syncProfilePanelStats();
    return;
  }

  const resolvedFriend = friend || findFriend(activeFriend);
  if (!resolvedFriend) {
    profilePanelName.textContent = "Loading...";
    profilePanelHandle.textContent = `@${activeFriend}`;
    profilePanelStatus.textContent = "Loading status...";
    profilePanelStatus.classList.add("offline");
    profilePanelAvatar.textContent = activeFriend.slice(0, 2).toUpperCase();
    profilePanelAvatar.style.background = "";
    syncProfilePanelStats();
    return;
  }

  profilePanelName.textContent = getFriendDisplayName(resolvedFriend);
  profilePanelHandle.textContent = `@${resolvedFriend.username}`;
  profilePanelStatus.textContent = resolvedFriend.online ? "Active now" : formatLastSeen(resolvedFriend.lastSeenAt);
  profilePanelStatus.classList.toggle("offline", !resolvedFriend.online);

  const fallback = resolvedFriend.username.slice(0, 2).toUpperCase();
  if (resolvedFriend.avatarId && window._novynAvatarUtils) {
    window._novynAvatarUtils.applyAvatarToEl(
      profilePanelAvatar,
      resolvedFriend.avatarId,
      fallback
    );
  } else {
    profilePanelAvatar.style.background = "";
    profilePanelAvatar.textContent = fallback;
  }

  syncProfilePanelStats();
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function showTypingIndicator(username) {
  if (!typingIndicator || !typingText) return;
  typingText.textContent = "typing…";
  typingIndicator.classList.remove("hidden");
  // If user is near bottom, scroll down to keep typing dots visible
  if (isNearBottom()) scrollToBottom();
}

function hideTypingIndicator() {
  if (!typingIndicator) return;
  typingIndicator.classList.add("hidden");
}

function emitTyping(isTyping, target = activeFriend) {
  if (!target) return;
  socket.emit("typing", { to: target, isTyping });
}

function clearLocalTypingTimer() {
  if (localTyping.timeoutId) {
    clearTimeout(localTyping.timeoutId);
    localTyping.timeoutId = null;
  }
}

function stopLocalTyping(target = localTyping.target || activeFriend) {
  if (localTyping.active && target) emitTyping(false, target);
  localTyping.active    = false;
  localTyping.target    = "";
  clearLocalTypingTimer();
}

function scheduleLocalTypingStop() {
  clearLocalTypingTimer();
  localTyping.timeoutId = setTimeout(() => stopLocalTyping(), 1200);
}

function markLocalTyping() {
  if (!activeFriend) return;

  // If switched to a different friend while typing, stop the old indicator
  if (
    localTyping.active &&
    localTyping.target &&
    normalizeName(localTyping.target) !== normalizeName(activeFriend)
  ) {
    stopLocalTyping(localTyping.target);
  }

  if (!localTyping.active) emitTyping(true, activeFriend);

  localTyping.active = true;
  localTyping.target = activeFriend;
  scheduleLocalTypingStop();
}

// ─── Messages ─────────────────────────────────────────────────────────────────

function clearMessages() {
  messagesEl.innerHTML = "";
}

function getLastRenderedDateKey() {
  for (let i = messagesEl.children.length - 1; i >= 0; i -= 1) {
    const node = messagesEl.children[i];
    if (!node) continue;
    if (node.classList.contains("message-date-separator") && node.dataset.dateKey) {
      return node.dataset.dateKey;
    }
    if (node.classList.contains("message") && node.dataset.dateKey) {
      return node.dataset.dateKey;
    }
  }
  return "";
}

function appendDateSeparator(iso) {
  const dateKey = getLocalDateKey(iso);
  if (!dateKey) return;

  const previousKey = getLastRenderedDateKey();
  if (previousKey === dateKey) return;

  const separator = document.createElement("div");
  separator.className = "message-date-separator";
  separator.dataset.dateKey = dateKey;
  separator.textContent = formatDateSeparatorLabel(iso);
  messagesEl.appendChild(separator);
}

function getSearchQuery() {
  return normalizeSearchText(messageSearchInput ? messageSearchInput.value : "");
}

function syncMessageSearchUi() {
  const queryActive = Boolean(getSearchQuery());

  if (messageSearchPanel) {
    messageSearchPanel.classList.toggle("hidden", !searchPanelOpen);
  }

  if (messageSearchToggle) {
    messageSearchToggle.classList.toggle("active", queryActive || searchPanelOpen);
    messageSearchToggle.setAttribute("aria-expanded", searchPanelOpen ? "true" : "false");
    messageSearchToggle.title = queryActive ? "Search active" : "Search messages";
  }
}

function openMessageSearchPanel() {
  if (!messageSearchPanel) return;
  searchPanelOpen = true;
  syncMessageSearchUi();
  if (messageSearchInput) {
    messageSearchInput.focus();
    messageSearchInput.select();
  }
}

function closeMessageSearchPanel() {
  searchPanelOpen = false;
  syncMessageSearchUi();
}

function shouldAutoScrollForMessage(message, skipAnimation = false) {
  if (skipAnimation) return true;
  if (getSearchQuery()) return false;

  if (!message) {
    return scrollState.pinnedToBottom || isNearBottom();
  }

  const mine = normalizeName(message.from) === normalizeName(me);
  if (mine) return true;

  return scrollState.pinnedToBottom || isNearBottom();
}

function resetMessageSearch() {
  if (messageSearchInput) messageSearchInput.value = "";
  closeMessageSearchPanel();
  applyMessageSearch();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const source = String(text || "");
  const lower = source.toLowerCase();
  const needle = String(query || "").toLowerCase();
  if (!needle) return escapeHtml(source);
  let result = "";
  let start = 0;
  while (true) {
    const idx = lower.indexOf(needle, start);
    if (idx === -1) {
      result += escapeHtml(source.slice(start));
      break;
    }
    result += escapeHtml(source.slice(start, idx));
    result += `<mark class="msg-highlight">${escapeHtml(source.slice(idx, idx + needle.length))}</mark>`;
    start = idx + needle.length;
  }
  return result;
}

function updateMessageHighlight(row, query) {
  if (!row) return;
  if (row.classList.contains("call-log") || row.classList.contains("message-deleted")) return;
  if (row.dataset.hasAttachment === "1") {
    const body = row.querySelector(".message-body");
    if (body && !body.querySelector(".msg-img, .file-bubble")) {
      const messageId = row.dataset.messageId || "";
      const tempId = row.dataset.clientTempId || "";
      const source = messageId
        ? getConversationMessageById(messageId)
        : (tempId ? pendingByTempId.get(tempId) : null);
      if (source) {
        const replacement = buildMessageElement(source, true);
        row.replaceWith(replacement);
      }
    }
    return;
  }
  const body = row.querySelector(".message-body");
  if (!body || body.querySelector(".audio-card")) return;
  const raw = body.dataset.rawText || row.dataset.messageText || "";
  if (!body.dataset.rawText) body.dataset.rawText = raw;
  if (!query) {
    body.innerHTML = "";
    appendMessageTextWithLinks(body, raw);
    return;
  }
  body.innerHTML = highlightText(raw, query);
}

function clearSearchFocus() {
  for (const hit of searchState.hits) {
    hit.classList.remove("search-focus");
  }
}

function setSearchFocus(index, scroll = true) {
  if (!searchState.hits.length) return;
  clearSearchFocus();
  const safeIndex = Math.max(0, Math.min(searchState.hits.length - 1, index));
  searchState.index = safeIndex;
  const target = searchState.hits[safeIndex];
  if (target) {
    target.classList.add("search-focus");
    if (scroll) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function jumpSearchResult(delta) {
  if (!searchState.hits.length) return;
  const next = searchState.index + delta;
  if (next < 0) {
    setSearchFocus(searchState.hits.length - 1);
  } else if (next >= searchState.hits.length) {
    setSearchFocus(0);
  } else {
    setSearchFocus(next);
  }
}

function updateSearchNavButtons() {
  const hasHits = searchState.hits.length > 0;
  if (messageSearchPrev) messageSearchPrev.disabled = !hasHits;
  if (messageSearchNext) messageSearchNext.disabled = !hasHits;
}

function applyMessageSearch() {
  const query = getSearchQuery();
  const messageNodes = Array.from(messagesEl.querySelectorAll("article.message"));
  let visibleCount = 0;
  const previousQuery = searchState.query;

  searchState.hits = [];
  searchState.query = query;
  if (previousQuery !== query) {
    searchState.index = -1;
    clearSearchFocus();
  }

  for (const row of messageNodes) {
    const searchable = normalizeSearchText(
      row.dataset.searchText || `${row.dataset.messageText || ""} ${row.dataset.messageFrom || ""}`
    );
    const match = !query || searchable.includes(query);
    row.classList.toggle("search-hidden", !match);
    if (match) {
      visibleCount += 1;
      if (query) searchState.hits.push(row);
    }
    updateMessageHighlight(row, query && match ? query : "");
  }

  const separatorNodes = Array.from(messagesEl.querySelectorAll(".message-date-separator"));
  for (const separator of separatorNodes) {
    let hasVisibleMessages = false;
    let cursor = separator.nextElementSibling;
    while (cursor && !cursor.classList.contains("message-date-separator")) {
      if (cursor.classList.contains("message") && !cursor.classList.contains("search-hidden")) {
        hasVisibleMessages = true;
        break;
      }
      cursor = cursor.nextElementSibling;
    }
    separator.classList.toggle("search-hidden", Boolean(query) && !hasVisibleMessages);
  }

  if (messageSearchCount) {
    if (!query) {
      messageSearchCount.classList.add("hidden");
      messageSearchCount.textContent = "";
    } else {
      const total = messageNodes.length;
      messageSearchCount.classList.remove("hidden");
      messageSearchCount.textContent = `${visibleCount}/${total} match${visibleCount === 1 ? "" : "es"}`;
    }
  }

  updateSearchNavButtons();
  syncMessageSearchUi();
}

// ─── Reply UI ─────────────────────────────────────────────────────────────────

const replyBanner = (() => {
  const existing = document.getElementById("replyBanner");
  const banner = existing || document.createElement("div");
  if (!existing) {
    banner.id = "replyBanner";
    banner.className = "reply-banner hidden";
  }
  let preview = banner.querySelector(".reply-preview-text");
  if (!preview) {
    preview = document.createElement("span");
    preview.className = "reply-preview-text";
    banner.appendChild(preview);
  }
  let closeBtn = banner.querySelector(".reply-cancel-btn");
  if (!closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "reply-cancel-btn";
    closeBtn.innerHTML = "✕";
    banner.appendChild(closeBtn);
  }
  closeBtn.addEventListener("click", clearReply);
  banner.addEventListener("click", (e) => {
    if (e.target.closest(".reply-cancel-btn")) return;
    if (replyTo && replyTo.id) focusMessageById(replyTo.id);
  });
  if (!existing && messageForm && messageForm.parentNode) {
    messageForm.parentNode.insertBefore(banner, messageForm);
  }
  return { banner, preview };
})();

function setReply(message) {
  replyTo = { id: message.id, from: message.from, text: message.text };
  const raw = String(message.text || "").replace(/\s+/g, " ").trim();
  const snippet = raw.length > 70 ? `${raw.slice(0, 70)}…` : raw;
  replyBanner.preview.textContent = `Replying: "${snippet}"`;
  replyBanner.banner.dataset.replyId = message.id || "";
  replyBanner.banner.classList.remove("hidden");
  messageInput.focus();
}

function clearReply() {
  replyTo = null;
  replyBanner.banner.classList.add("hidden");
  replyBanner.preview.textContent = "";
  replyBanner.banner.dataset.replyId = "";
}

function getConversationMessageById(messageId) {
  if (!messageId) return null;
  return conversationMessages.find((message) => message?.id === messageId) || null;
}

function getMessagePeerUsername(message) {
  if (!message) return "";
  const from = String(message.from || "").trim();
  const to = String(message.to || "").trim();
  if (!from && !to) return activeFriend || "";
  if (normalizeName(from) === normalizeName(me)) {
    return to || activeFriend || "";
  }
  return from || activeFriend || "";
}

function summarizeMessageForPinnedBar(message) {
  if (!message) return "Pinned message";
  const attachment = normalizeAttachmentPayload(message.attachment, message.text || "");
  if (attachment) {
    const prefix = attachment.kind === "image" ? "Image" : "File";
    const suffix = attachment.name ? `: ${attachment.name}` : "";
    return `${prefix}${suffix}`;
  }
  const raw = String(message.text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Pinned message";
  return raw.length > 96 ? `${raw.slice(0, 96)}...` : raw;
}

function getDisplayNameForReactionUser(rawName) {
  const value = String(rawName || "").trim();
  if (!value) return "";
  const key = normalizeName(value);
  if (key && key === normalizeName(me)) return "You";
  const friend = findFriend(value) || friends.find((entry) => normalizeName(entry?.username) === key);
  if (friend) {
    return cleanDisplayName(friend.displayName) || friend.username || value;
  }
  return value;
}

const messageEditDialog = (() => {
  const modal = document.createElement("div");
  modal.id = "messageEditModal";
  modal.className = "confirm-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="confirm-modal-backdrop"></div>
    <div class="confirm-modal-card settings-modal-card message-edit-card">
      <h3>Edit message</h3>
      <p class="confirm-modal-desc">Update your message for everyone in this chat.</p>
      <textarea id="messageEditInput" class="message-edit-input" maxlength="${COMPOSER_MAX_MESSAGE_LENGTH}" rows="4"></textarea>
      <div class="confirm-modal-btns">
        <button type="button" class="confirm-modal-cancel" data-edit-action="cancel">Cancel</button>
        <button type="button" class="settings-confirm" data-edit-action="save">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector("#messageEditInput");
  const backdrop = modal.querySelector(".confirm-modal-backdrop");
  const cancelBtn = modal.querySelector('[data-edit-action="cancel"]');
  const saveBtn = modal.querySelector('[data-edit-action="save"]');
  let onSave = null;
  let originalText = "";

  function close() {
    modal.style.display = "none";
    onSave = null;
    originalText = "";
    if (input) input.value = "";
  }

  function save() {
    if (!onSave || !input) return;
    if (!String(input.value || "").trim()) {
      showToast("Message cannot be empty.", "error");
      return;
    }
    const validated = validateOutgoingMessageText(input.value);
    if (validated === null || !validated) return;
    if (validated === originalText) {
      close();
      return;
    }
    onSave(validated);
    close();
  }

  if (backdrop) backdrop.addEventListener("click", close);
  if (cancelBtn) cancelBtn.addEventListener("click", close);
  if (saveBtn) saveBtn.addEventListener("click", save);
  if (input) {
    input.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        save();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      close();
    }
  });

  function open(initialText, handler) {
    if (!input) return;
    originalText = String(initialText || "").trim();
    onSave = typeof handler === "function" ? handler : null;
    input.value = originalText;
    modal.style.display = "flex";
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  }

  return { open, close };
})();

const reactionDetailsDialog = (() => {
  const modal = document.createElement("div");
  modal.id = "reactionDetailsModal";
  modal.className = "confirm-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="confirm-modal-backdrop"></div>
    <div class="confirm-modal-card settings-modal-card reaction-details-card">
      <h3>Reactions</h3>
      <div id="reactionDetailsList" class="reaction-details-list"></div>
      <div class="confirm-modal-btns">
        <button type="button" class="settings-confirm" data-reaction-action="close">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const list = modal.querySelector("#reactionDetailsList");
  const closeBtn = modal.querySelector('[data-reaction-action="close"]');
  const backdrop = modal.querySelector(".confirm-modal-backdrop");

  function close() {
    modal.style.display = "none";
    if (list) list.innerHTML = "";
  }

  function open(reactionGroups) {
    if (!list) return;
    list.innerHTML = "";
    reactionGroups.forEach((entry) => {
      const section = document.createElement("section");
      section.className = "reaction-details-group";
      const title = document.createElement("div");
      title.className = "reaction-details-title";
      title.textContent = `${entry.emoji} ${entry.count}`;

      const users = document.createElement("ul");
      users.className = "reaction-details-users";

      entry.users.forEach((name) => {
        const item = document.createElement("li");
        item.textContent = name;
        users.appendChild(item);
      });

      if (entry.extraCount > 0) {
        const item = document.createElement("li");
        item.className = "reaction-details-more";
        item.textContent = `and ${entry.extraCount} more`;
        users.appendChild(item);
      }

      section.append(title, users);
      list.appendChild(section);
    });
    modal.style.display = "flex";
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      close();
    }
  });

  return { open, close };
})();

const messageForwardDialog = (() => {
  const modal = document.createElement("div");
  modal.id = "messageForwardModal";
  modal.className = "confirm-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="confirm-modal-backdrop"></div>
    <div class="confirm-modal-card settings-modal-card message-forward-card">
      <h3>Forward message</h3>
      <p class="confirm-modal-desc">Choose a friend to forward this message to.</p>
      <div id="messageForwardPreview" class="message-forward-preview"></div>
      <div id="messageForwardList" class="message-forward-list"></div>
      <div class="confirm-modal-btns">
        <button type="button" class="confirm-modal-cancel" data-forward-action="cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const list = modal.querySelector("#messageForwardList");
  const preview = modal.querySelector("#messageForwardPreview");
  const cancelBtn = modal.querySelector('[data-forward-action="cancel"]');
  const backdrop = modal.querySelector(".confirm-modal-backdrop");
  let sourceMessage = null;
  let sending = false;

  function close() {
    sending = false;
    modal.style.display = "none";
    if (list) list.innerHTML = "";
    if (preview) preview.textContent = "";
    sourceMessage = null;
  }

  function forwardTo(friendUsername) {
    if (!sourceMessage || !friendUsername || sending) return;
    const attachment = normalizeAttachmentPayload(sourceMessage.attachment, sourceMessage.text || "");
    const payload = {
      to: friendUsername,
      text: String(sourceMessage.text || "").trim(),
    };
    if (attachment) payload.attachment = attachment;
    if (!payload.text) {
      showToast("Nothing to forward.", "error");
      return;
    }
    sending = true;
    if (cancelBtn) cancelBtn.disabled = true;
    const sentTempId = sendMessagePayload(payload, { optimistic: false });
    if (!sentTempId) {
      sending = false;
      if (cancelBtn) cancelBtn.disabled = false;
      return;
    }
    if (socketAvailable && socket.connected) {
      showToast(`Forwarded to @${friendUsername}`, "success");
    }
    close();
  }

  function open(message) {
    if (!list) return;
    sourceMessage = message && typeof message === "object" ? message : null;
    if (!sourceMessage) return;
    list.innerHTML = "";
    sending = false;
    if (cancelBtn) cancelBtn.disabled = false;
    if (preview) {
      preview.textContent = summarizeMessageForPinnedBar(sourceMessage);
    }

    const availableFriends = friends
      .filter((friend) => friend && friend.username)
      .sort((a, b) => getFriendDisplayName(a).localeCompare(getFriendDisplayName(b)));

    if (!availableFriends.length) {
      const empty = document.createElement("div");
      empty.className = "message-forward-empty";
      empty.textContent = "No friends available.";
      list.appendChild(empty);
      modal.style.display = "flex";
      return;
    }

    availableFriends.forEach((friend) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "message-forward-btn";
      const displayName = getFriendDisplayName(friend);
      const nameEl = document.createElement("span");
      nameEl.className = "message-forward-name";
      nameEl.textContent = displayName;
      const handleEl = document.createElement("span");
      handleEl.className = "message-forward-handle";
      handleEl.textContent = `@${friend.username}`;
      btn.append(nameEl, handleEl);
      btn.addEventListener("click", () => forwardTo(friend.username));
      list.appendChild(btn);
    });

    modal.style.display = "flex";
  }

  if (cancelBtn) cancelBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      close();
    }
  });

  return { open, close };
})();

const pinnedMessageBar = (() => {
  const bar = document.createElement("div");
  bar.id = "pinnedMessageBar";
  bar.className = "pinned-message-bar hidden";
  bar.innerHTML = `
    <button type="button" class="pinned-message-main">
      <span class="pinned-message-label">Pinned</span>
      <span class="pinned-message-text"></span>
    </button>
    <button type="button" class="pinned-message-clear" title="Unpin message" aria-label="Unpin message">&times;</button>
  `;

  if (messageSearchPanel && messageSearchPanel.parentNode) {
    if (messageSearchPanel.nextSibling) {
      messageSearchPanel.parentNode.insertBefore(bar, messageSearchPanel.nextSibling);
    } else {
      messageSearchPanel.parentNode.appendChild(bar);
    }
  } else if (messagesEl?.parentNode) {
    messagesEl.parentNode.insertBefore(bar, messagesEl.parentNode.firstChild);
  }

  const mainBtn = bar.querySelector(".pinned-message-main");
  const textEl = bar.querySelector(".pinned-message-text");
  const clearBtn = bar.querySelector(".pinned-message-clear");
  let currentMessageId = "";
  let currentPeer = "";

  function clear() {
    currentMessageId = "";
    currentPeer = "";
    bar.classList.add("hidden");
    if (textEl) textEl.textContent = "";
  }

  function set(message) {
    if (!message?.id) {
      clear();
      return;
    }
    currentMessageId = message.id;
    currentPeer = getMessagePeerUsername(message) || activeFriend || "";
    if (textEl) {
      textEl.textContent = summarizeMessageForPinnedBar(message);
    }
    bar.classList.remove("hidden");
  }

  if (mainBtn) {
    mainBtn.addEventListener("click", () => {
      if (!currentMessageId) return;
      focusMessageById(currentMessageId);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!currentMessageId || !currentPeer) return;
      socket.emit("set_message_pin", {
        messageId: currentMessageId,
        to: currentPeer,
        pinned: false,
      });
    });
  }

  return { set, clear };
})();

function getReactionGroupsForMessage(messageId) {
  const message = getConversationMessageById(messageId);
  if (!message || !message.reactions || typeof message.reactions !== "object") return [];

  const groups = [];
  for (const [emoji, rawEntry] of Object.entries(message.reactions)) {
    if (!rawEntry || typeof rawEntry !== "object") continue;
    const rawCount = Number(rawEntry.count);
    const fromUserKeys = Array.isArray(rawEntry.userKeys) ? rawEntry.userKeys : [];
    const fromUsers = Array.isArray(rawEntry.users) ? rawEntry.users : [];
    const count = Number.isFinite(rawCount) && rawCount > 0
      ? Math.floor(rawCount)
      : Math.max(fromUserKeys.length, fromUsers.length);
    if (!count) continue;

    const uniqueNames = [];
    const seen = new Set();
    const combinedNames = fromUsers.length
      ? fromUsers
      : fromUserKeys.map((name) => getDisplayNameForReactionUser(name));
    combinedNames.forEach((rawName) => {
      const pretty = getDisplayNameForReactionUser(rawName);
      const key = normalizeName(pretty);
      if (!pretty || !key || seen.has(key)) return;
      seen.add(key);
      uniqueNames.push(pretty);
    });

    if (rawEntry.mine && !uniqueNames.some((name) => normalizeName(name) === normalizeName("You"))) {
      uniqueNames.unshift("You");
    }

    groups.push({
      emoji,
      count,
      users: uniqueNames,
      extraCount: Math.max(0, count - uniqueNames.length),
    });
  }

  groups.sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji));
  return groups;
}

function openReactionDetailsForMessage(messageId) {
  const groups = getReactionGroupsForMessage(messageId);
  if (!groups.length) {
    showToast("No reactions yet.", "info");
    return;
  }
  reactionDetailsDialog.open(groups);
}

function syncPinnedMessageBar() {
  if (!activeFriend || !Array.isArray(conversationMessages) || !conversationMessages.length) {
    pinnedMessageBar.clear();
    return;
  }

  const pinned = conversationMessages
    .filter((message) => message && !message.deletedAt && message.pinnedAt)
    .sort((a, b) => {
      const aKey = String(a?.pinnedAt || a?.timestamp || "");
      const bKey = String(b?.pinnedAt || b?.timestamp || "");
      return bKey.localeCompare(aKey);
    });

  if (!pinned.length) {
    pinnedMessageBar.clear();
    return;
  }
  pinnedMessageBar.set(pinned[0]);
}

const messageContextMenu = (() => {
  const menu = document.createElement("div");
  menu.id = "messageContextMenu";
  menu.className = "message-context-menu hidden";
  menu.innerHTML = `
    <button type="button" data-action="copy">Copy</button>
    <button type="button" data-action="reply">Reply</button>
    <button type="button" data-action="forward">Forward</button>
    <button type="button" data-action="react">React</button>
    <button type="button" data-action="reactions">Reactions</button>
    <button type="button" data-action="edit">Edit</button>
    <button type="button" data-action="pin">Pin</button>
    <button type="button" data-action="delete" class="danger">Delete</button>
  `;
  document.body.appendChild(menu);

  let currentMessageEl = null;

  function close() {
    menu.classList.add("hidden");
    currentMessageEl = null;
  }

  function getMessagePeer(msgEl) {
    let target = String(msgEl?.dataset?.messageFrom || "").trim();
    if (normalizeName(target) === normalizeName(me)) {
      target = activeFriend;
    }
    return target;
  }

  function open(msgEl, x, y) {
    if (!msgEl) return;
    currentMessageEl = msgEl;

    const mine = msgEl.classList.contains("me");
    const deleted = msgEl.classList.contains("message-deleted");
    const pending = msgEl.classList.contains("pending");
    const hasAttachment = msgEl.dataset.hasAttachment === "1";
    const isCallLog = msgEl.classList.contains("call-log");
    const hasReactions = Boolean(msgEl.dataset.messageReactions);
    const pinned = Boolean(msgEl.dataset.pinnedAt);
    const messageId = String(msgEl.dataset.messageId || "").trim();
    const deleteBtn = menu.querySelector('[data-action="delete"]');
    const copyBtn = menu.querySelector('[data-action="copy"]');
    const replyBtn = menu.querySelector('[data-action="reply"]');
    const forwardBtn = menu.querySelector('[data-action="forward"]');
    const reactBtn = menu.querySelector('[data-action="react"]');
    const reactionsBtn = menu.querySelector('[data-action="reactions"]');
    const editBtn = menu.querySelector('[data-action="edit"]');
    const pinBtn = menu.querySelector('[data-action="pin"]');

    if (deleteBtn) deleteBtn.classList.toggle("hidden", !mine || deleted || pending || !messageId);
    if (copyBtn) copyBtn.classList.toggle("hidden", deleted);
    if (replyBtn) replyBtn.classList.toggle("hidden", deleted || pending || !messageId);
    if (forwardBtn) forwardBtn.classList.toggle("hidden", deleted || pending || !messageId);
    if (reactBtn) reactBtn.classList.toggle("hidden", deleted || pending || !messageId);
    if (reactionsBtn) reactionsBtn.classList.toggle("hidden", deleted || !messageId || !hasReactions);
    if (editBtn) editBtn.classList.toggle("hidden", !mine || deleted || pending || hasAttachment || isCallLog || !messageId);
    if (pinBtn) {
      pinBtn.classList.toggle("hidden", deleted || pending || !messageId);
      pinBtn.textContent = pinned ? "Unpin" : "Pin";
      pinBtn.dataset.pinState = pinned ? "unpin" : "pin";
    }

    menu.classList.remove("hidden");
    menu.style.left = "0px";
    menu.style.top = "0px";

    const rect = menu.getBoundingClientRect();
    const margin = 8;
    let left = x;
    let top = y;

    if (left + rect.width > window.innerWidth - margin) {
      left = window.innerWidth - rect.width - margin;
    }
    if (top + rect.height > window.innerHeight - margin) {
      top = window.innerHeight - rect.height - margin;
    }
    if (left < margin) left = margin;
    if (top < margin) top = margin;

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  menu.addEventListener("click", async (e) => {
    const actionBtn = e.target.closest("button[data-action]");
    if (!actionBtn || !currentMessageEl) return;

    const action = actionBtn.dataset.action;
    const messageId = currentMessageEl.dataset.messageId;
    const messageText = currentMessageEl.dataset.messageText || "";
    const targetPeer = getMessagePeer(currentMessageEl);

    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(messageText);
        showToast("Message copied");
      } catch (_) {
        showToast("Could not copy message", "error");
      }
      close();
      return;
    }

    if (action === "reply") {
      setReply({
        id: messageId,
        from: currentMessageEl.dataset.messageFrom || "",
        text: messageText,
      });
      close();
      return;
    }

    if (action === "forward") {
      if (!messageId) {
        close();
        return;
      }
      const sourceMessage = getConversationMessageById(messageId);
      close();
      if (!sourceMessage || sourceMessage.deletedAt) return;
      messageForwardDialog.open(sourceMessage);
      return;
    }

    if (action === "react") {
      const reactBtn = currentMessageEl.querySelector('[data-msg-action="react"]');
      if (reactBtn) reactBtn.click();
      close();
      return;
    }

    if (action === "reactions") {
      if (messageId) {
        openReactionDetailsForMessage(messageId);
      }
      close();
      return;
    }

    if (action === "edit") {
      if (!messageId || !targetPeer) {
        close();
        return;
      }
      const sourceMessage = getConversationMessageById(messageId);
      const initialText = String(sourceMessage?.text || "").trim();
      close();
      if (!initialText) return;
      messageEditDialog.open(initialText, (nextText) => {
        socket.emit("edit_message", {
          messageId,
          to: targetPeer,
          text: nextText,
        });
      });
      return;
    }

    if (action === "pin") {
      if (!messageId || !targetPeer) {
        close();
        return;
      }
      const shouldPin = actionBtn.dataset.pinState !== "unpin";
      socket.emit("set_message_pin", {
        messageId,
        to: targetPeer,
        pinned: shouldPin,
      });
      close();
      return;
    }

    if (action === "delete") {
      if (!messageId || !targetPeer) {
        close();
        return;
      }
      socket.emit("delete_message", { messageId, to: targetPeer });
      close();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#messageContextMenu")) close();
  });
  window.addEventListener("resize", close);
  messagesEl.addEventListener("scroll", close, { passive: true });

  messagesEl.addEventListener("contextmenu", (e) => {
    const reactionBtn = e.target.closest(".reaction-btn");
    if (reactionBtn) {
      const reactionMessage = reactionBtn.closest("article.message");
      const reactionMessageId = String(reactionMessage?.dataset?.messageId || "").trim();
      if (reactionMessageId) {
        e.preventDefault();
        openReactionDetailsForMessage(reactionMessageId);
      }
      return;
    }
    const msgEl = e.target.closest("article.message");
    if (!msgEl) return;
    e.preventDefault();
    open(msgEl, e.clientX, e.clientY);
  });

  let longPressTimer = null;
  let longPressTarget = null;
  let longPressStartX = 0;
  let longPressStartY = 0;

  function clearLongPress() {
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressTarget = null;
  }

  messagesEl.addEventListener("pointerdown", (e) => {
    const msgEl = e.target.closest("article.message");
    if (!msgEl) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    longPressTarget = msgEl;
    longPressStartX = e.clientX;
    longPressStartY = e.clientY;
    longPressTimer = setTimeout(() => {
      if (!longPressTarget) return;
      open(longPressTarget, longPressStartX, longPressStartY);
      clearLongPress();
    }, 520);
  });
  messagesEl.addEventListener("pointermove", (e) => {
    if (!longPressTimer) return;
    const dx = Math.abs(e.clientX - longPressStartX);
    const dy = Math.abs(e.clientY - longPressStartY);
    if (dx > 8 || dy > 8) clearLongPress();
  });
  messagesEl.addEventListener("pointerup", clearLongPress);
  messagesEl.addEventListener("pointercancel", clearLongPress);

  return { open, close };
})();

function renderMessagesEmptyState(text) {
  clearMessages();
  messageWindowStart = 0;
  messageWindowEnd = 0;
  loadOlderBtn = null;
  hideTypingIndicator();

  const hint = text || EMPTY_CONVERSATION_HINT;
  let title = "Your inbox is ready";

  if (/loading conversation/i.test(hint)) {
    title = "Opening conversation";
  } else if (/no messages yet/i.test(hint) && activeFriend) {
    title = `Start chatting with @${activeFriend}`;
  }

  const empty = document.createElement("div");
  empty.className = "messages-empty";

  const icon = document.createElement("div");
  icon.className = "messages-empty-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  `;

  const titleEl = document.createElement("p");
  titleEl.className = "messages-empty-title";
  titleEl.textContent = title;

  const sub = document.createElement("p");
  sub.className = "messages-empty-sub";
  sub.textContent = hint;

  empty.append(icon, titleEl, sub);
  messagesEl.appendChild(empty);
  applyMessageSearch();
  syncPinnedMessageBar();
}

function renderMineMessageMeta(metaEl, timeText, statusKey) {
  metaEl.innerHTML = "";
  metaEl.classList.add("mine");
  metaEl.dataset.time = timeText;
  metaEl.dataset.status = statusKey;

  const time = document.createElement("span");
  time.className = "message-meta-time";
  time.textContent = timeText;

  const status = document.createElement("span");
  status.className = `message-status message-status-${statusKey}`;

  if (statusKey === "pending") {
    status.textContent = "…";
    metaEl.append(time, status);
    return;
  }

  if (statusKey === "failed") {
    status.textContent = "!";
    status.title = "Failed to send";
    metaEl.append(time, status);
    return;
  }

  const tickA = document.createElement("span");
  tickA.className = "tick";
  tickA.textContent = "✓";
  status.appendChild(tickA);
  if (statusKey === "seen") {
    const tickB = document.createElement("span");
    tickB.className = "tick";
    tickB.textContent = "✓";
    status.appendChild(tickB);
  }
  metaEl.append(time, status);
}

function renderIncomingMessageMeta(metaEl, message) {
  metaEl.classList.remove("mine");
  metaEl.innerHTML = "";
  const time = prettyTime(message.timestamp);
  metaEl.textContent = time;
}

function appendMessageTextWithLinks(container, text) {
  const raw = String(text || "");
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[\/?#][^\s<]*)?/gi;
  const parts = raw.split(urlRegex);
  const matches = raw.match(urlRegex) || [];
  if (!matches.length) {
    container.textContent = raw;
    return;
  }
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i]) container.appendChild(document.createTextNode(parts[i]));
    if (matches[i]) {
      const link = document.createElement("a");
      link.className = "message-link";
      const href = /^https?:\/\//i.test(matches[i]) ? matches[i] : `https://${matches[i]}`;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = matches[i];
      link.addEventListener("click", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        openExternalLink(href);
      });
      container.appendChild(link);
    }
  }
}

function focusMessageById(messageId) {
  if (!messageId || !messagesEl) return;
  const orig = messagesEl.querySelector(`[data-message-id="${messageId}"]`);
  if (orig) {
    orig.scrollIntoView({ behavior: "smooth", block: "center" });
    orig.classList.add("highlight-flash");
    setTimeout(() => orig.classList.remove("highlight-flash"), 1200);
  }
}

function buildMessageElement(message, skipAnimation = false) {
  const mine = normalizeName(message.from) === normalizeName(me);
  const isDeleted = Boolean(message.deletedAt);
  const rawText = isDeleted ? DELETED_MESSAGE_TEXT : message.text;
  const attachment = !isDeleted ? normalizeAttachmentPayload(message.attachment, rawText) : null;
  const callLog = !isDeleted ? parseCallLogPayload(rawText) : null;
  const displayText = callLog ? formatCallLogPreview(rawText, mine) : rawText;
  const searchableText = attachment ? `${attachment.name || ""} ${attachment.url || rawText || ""}` : displayText;
  const dateKey = getLocalDateKey(message.timestamp);
  const fullTimestamp = formatFullTimestamp(message.timestamp);

  const row       = document.createElement("article");
  row.className   = `message ${mine ? "me" : "them"}${skipAnimation ? " no-anim" : ""}`;
  if (message.id) row.dataset.messageId = message.id;
  if (message.clientTempId) row.dataset.clientTempId = message.clientTempId;
  row.dataset.dateKey = dateKey;
  row.dataset.timestamp = message.timestamp || "";
  row.dataset.tsFull = fullTimestamp;
  if (fullTimestamp) row.title = fullTimestamp;
  row.dataset.messageFrom = message.from;
  row.dataset.messageText = searchableText || "";
  row.dataset.searchText = [
    row.dataset.messageFrom,
    searchableText || "",
    message.replyTo?.text || "",
    message.replyTo?.from || "",
  ].join(" ");
  if (attachment) {
    row.dataset.hasAttachment = "1";
  } else {
    delete row.dataset.hasAttachment;
  }
  if (!isDeleted && message.editedAt) {
    row.dataset.editedAt = String(message.editedAt);
  } else {
    delete row.dataset.editedAt;
  }
  if (!isDeleted && message.pinnedAt) {
    row.dataset.pinnedAt = String(message.pinnedAt);
    row.classList.add("message-pinned");
  } else {
    delete row.dataset.pinnedAt;
  }
  if (isDeleted) {
    row.classList.add("message-deleted");
  }
  if (message.pending) {
    row.classList.add("pending");
  }
  if (message.failed) {
    row.classList.add("failed");
  }
  if (callLog) {
    row.classList.add("call-log");
  }

  if (message.reactions && Object.keys(message.reactions).length) {
    try {
      row.dataset.messageReactions = JSON.stringify(message.reactions);
    } catch (_) {
      // Ignore serialization errors for malformed payloads.
    }
  } else {
    delete row.dataset.messageReactions;
  }

  if (!callLog) {
    const meta        = document.createElement("span");
    meta.className    = "message-meta";
    if (mine) {
      row.dataset.timeLabel = prettyTime(message.timestamp);
      renderMineMessageMeta(meta, row.dataset.timeLabel, getMessageStatusKey(message));
    } else {
      renderIncomingMessageMeta(meta, message);
    }
    if (!isDeleted && message.editedAt) {
      const editedFlag = document.createElement("span");
      editedFlag.className = "message-edited-flag";
      editedFlag.textContent = "edited";
      meta.appendChild(editedFlag);
    }
    if (!isDeleted && message.pinnedAt) {
      const pinnedFlag = document.createElement("span");
      pinnedFlag.className = "message-pinned-flag";
      pinnedFlag.textContent = "pinned";
      meta.appendChild(pinnedFlag);
    }
    row.append(meta);
  }

  if (message.replyTo && !isDeleted) {
    const rq      = document.createElement("div");
    rq.className  = "reply-quote";
    const rt      = document.createElement("span");
    rt.className  = "reply-quote-text";
    rt.textContent = message.replyTo.text.slice(0, 80) + (message.replyTo.text.length > 80 ? "…" : "");
    rq.addEventListener("click", () => {
      focusMessageById(message.replyTo.id);
    });
    rq.append(rt);
    row.append(rq);
  }

  const body        = document.createElement("div");
  body.className    = "message-body";
  if (isDeleted) {
    body.textContent = DELETED_MESSAGE_TEXT;
    body.classList.add("message-body-deleted");
  } else {
    const trimmedText = String(message.text || "").trim();
    const attachmentUrl = attachment?.url || "";
    const isAudio = !attachment && (
      /^\/uploads\/.+\.(webm|wav|mp3|ogg)(\?.*)?$/i.test(trimmedText) ||
      /^https?:\/\/.+\.(webm|wav|mp3|ogg)(\?.*)?$/i.test(trimmedText)
    );
    if (attachment) {
      if (attachment.kind === "image") {
        const img = document.createElement("img");
        img.className = "msg-img";
        img.src = attachmentUrl || trimmedText;
        img.alt = attachment.name || "Image attachment";
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          imageViewer.open({
            src: attachmentUrl || trimmedText,
            fileName: attachment.name || "Image attachment",
          });
        });
        body.appendChild(img);
      } else {
        const fileBubble = document.createElement("div");
        fileBubble.className = "file-bubble";

        const fileIcon = document.createElement("div");
        fileIcon.className = "file-icon";
        fileIcon.textContent = "📎";

        const fileMeta = document.createElement("div");
        fileMeta.className = "file-meta";

        const fileName = document.createElement("div");
        fileName.className = "file-name";
        fileName.textContent = attachment.name || "Attachment";

        const fileSize = document.createElement("div");
        fileSize.className = "file-size";
        const sizeLabel = formatFileSize(attachment.size);
        const typeLabel = attachment.mime || "File";
        fileSize.textContent = sizeLabel ? `${typeLabel} • ${sizeLabel}` : typeLabel;

        const fileUrl = attachmentUrl || trimmedText;
        const downloadUrl = buildAttachmentDownloadUrl(fileUrl, attachment.name || "file");

        const fileDownload = document.createElement("a");
        fileDownload.className = "file-download-link";
        fileDownload.href = downloadUrl;
        fileDownload.textContent = "Download";
        if (attachment.name) {
          fileDownload.setAttribute("download", attachment.name);
        }
        fileDownload.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerAttachmentDownload(downloadUrl, attachment.name || "file");
        });

        fileMeta.append(fileName, fileSize, fileDownload);
        fileBubble.append(fileIcon, fileMeta);
        fileBubble.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          fileViewer.open({
            src: fileUrl,
            fileName: attachment.name || "Attachment",
            mime: attachment.mime || "",
            size: attachment.size || 0,
          });
        });
        body.appendChild(fileBubble);
      }
      body.dataset.rawText = attachment.name || attachmentUrl || message.text || "";
    } else if (callLog) {
      const log = getCallLogDisplay(callLog, mine);
      const card = document.createElement("div");
      card.className = `call-log-card ${log.direction === "incoming" ? "incoming" : "outgoing"}`;

      const icon = document.createElement("div");
      icon.className = "call-log-icon";
      icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81 19.79 19.79 0 01.22 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16h-.08z"/></svg>`;

      const content = document.createElement("div");
      content.className = "call-log-content";
      const title = document.createElement("div");
      title.className = "call-log-title";
      title.textContent = log.title;
      const subtitle = document.createElement("div");
      subtitle.className = "call-log-subtitle";
      subtitle.textContent = log.subtitle;
      const status = document.createElement("div");
      const isBadStatus = ["cancelled", "declined", "missed", "busy", "unavailable"].includes(log.status);
      const isNeutralStatus = log.status === "ended";
      const statusClass = isNeutralStatus ? "neutral" : (isBadStatus ? "bad" : "good");
      status.className = `call-status-pill ${statusClass}`;
      status.textContent = log.statusLabel || "Call";
      content.append(title, subtitle, status);

      const time = document.createElement("div");
      time.className = "call-log-time";
      time.textContent = prettyTime(message.timestamp);

      card.append(icon, content, time);
      body.appendChild(card);
    } else if (isAudio) {
      body.classList.add("message-audio");
      const audioCard = document.createElement("div");
      audioCard.className = "audio-card";

      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "audio-play";
      playBtn.setAttribute("aria-label", "Play voice message");
      playBtn.innerHTML = `
        <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><polygon points="8 5 19 12 8 19 8 5"/></svg>
        <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
      `;

      const waveform = document.createElement("div");
      waveform.className = "audio-waveform";
      const seedValue = message.id || message.clientTempId || message.timestamp || trimmedText;
      buildWaveform(waveform, hashStringToSeed(seedValue));

      const time = document.createElement("span");
      time.className = "audio-time";
      time.textContent = "0:00 / 0:00";

      const audio = document.createElement("audio");
      audio.className = "audio-el";
      audio.preload = "metadata";
      audio.src = trimmedText;
      audio.setAttribute("playsinline", "");

      const syncUI = () => {
        const cur = audio.currentTime || 0;
        const dur = getAudioDuration(audio);
        time.textContent = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
        const pct = dur > 0 ? (cur / dur) : 0;
        updateWaveformProgress(waveform, pct);
      };

      audio.addEventListener("loadedmetadata", syncUI);
      audio.addEventListener("loadeddata", syncUI);
      audio.addEventListener("durationchange", syncUI);
      audio.addEventListener("canplay", syncUI);
      audio.addEventListener("timeupdate", syncUI);
      updateWaveformProgress(waveform, 0);
      audio.addEventListener("ended", () => {
        audioCard.classList.remove("is-playing");
        updateWaveformProgress(waveform, 0);
        syncUI();
      });
      audio.addEventListener("play", () => audioCard.classList.add("is-playing"));
      audio.addEventListener("pause", () => audioCard.classList.remove("is-playing"));

      playBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (audio.paused) {
          if (window._novynAudio && window._novynAudio !== audio) {
            window._novynAudio.pause();
          }
          window._novynAudio = audio;
          audio.play();
        } else {
          audio.pause();
        }
      });

      waveform.addEventListener("pointerdown", (e) => {
        const dur = getAudioDuration(audio);
        if (!Number.isFinite(dur) || dur <= 0) return;
        const rect = waveform.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = Math.max(0, Math.min(dur, pct * dur));
        syncUI();
      });

      audioCard.append(playBtn, waveform, time, audio);
      body.appendChild(audioCard);
      try { audio.load(); } catch (_) {}
    } else {
      appendMessageTextWithLinks(body, message.text);
      body.dataset.rawText = message.text;
    }
  }

  row.append(body);

  if (mine && message.failed && message.clientTempId) {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "message-retry-btn";
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      retryFailedMessage(message.clientTempId);
    });
    row.append(retryBtn);
  }

  return row;
}

function appendMessage(message, skipAnimation = false, withSeparator = true, skipSearch = false) {
  const emptyNode = messagesEl.querySelector(".messages-empty");
  if (emptyNode) emptyNode.remove();
  const preserveTop = messagesEl.scrollTop;
  const shouldAutoScroll = shouldAutoScrollForMessage(message, skipAnimation);

  if (withSeparator) {
    appendDateSeparator(message.timestamp);
  }

  const row = buildMessageElement(message, skipAnimation);

  messagesEl.appendChild(row);
  if (!skipSearch) applyMessageSearch();
  if (shouldAutoScroll) {
    const mine = normalizeName(message.from) === normalizeName(me);
    scrollToBottom(skipAnimation || mine);
    scrollState.pinnedToBottom = true;
  } else {
    messagesEl.scrollTop = preserveTop;
  }

  syncProfilePanelStats();
  syncCallLogPanel();
}

function ensureLoadOlderButton() {
  if (!messagesEl) return null;
  if (!loadOlderBtn) {
    loadOlderBtn = document.createElement("button");
    loadOlderBtn.type = "button";
    loadOlderBtn.className = "messages-load-older hidden";
    loadOlderBtn.textContent = "Load older messages";
    loadOlderBtn.addEventListener("click", loadOlderMessages);
  }
  if (!loadOlderBtn.parentNode) {
    messagesEl.prepend(loadOlderBtn);
  }
  return loadOlderBtn;
}

function updateLoadOlderButton() {
  const btn = ensureLoadOlderButton();
  if (!btn) return;
  btn.classList.toggle("hidden", messageWindowStart <= 0);
}

function setMessageWindowToLatest() {
  messageWindowEnd = conversationMessages.length;
  messageWindowStart = Math.max(0, messageWindowEnd - MAX_VISIBLE_MESSAGES);
}

function renderMessageWindow(options = {}) {
  if (!messagesEl) return;
  const preserveScroll = options.preserveScroll;
  const prevScrollTop = preserveScroll ? messagesEl.scrollTop : 0;
  const prevScrollHeight = preserveScroll ? messagesEl.scrollHeight : 0;
  clearMessages();
  ensureLoadOlderButton();

  if (!Number.isFinite(messageWindowEnd) || messageWindowEnd <= 0) {
    messageWindowEnd = conversationMessages.length;
  }
  messageWindowEnd = Math.min(conversationMessages.length, messageWindowEnd);
  if (messageWindowEnd - messageWindowStart > MAX_VISIBLE_MESSAGES) {
    messageWindowStart = Math.max(0, messageWindowEnd - MAX_VISIBLE_MESSAGES);
  }

  for (let i = messageWindowStart; i < messageWindowEnd; i += 1) {
    const msg = conversationMessages[i];
    if (!msg) continue;
    if (options.withSeparator !== false) appendDateSeparator(msg.timestamp);
    const row = buildMessageElement(msg, true);
    messagesEl.appendChild(row);
  }

  updateLoadOlderButton();
  if (!options.skipSearch) applyMessageSearch();
  if (preserveScroll) {
    const nextHeight = messagesEl.scrollHeight;
    const delta = nextHeight - prevScrollHeight;
    messagesEl.scrollTop = prevScrollTop + delta;
  }
}

function loadOlderMessages() {
  if (messageWindowStart <= 0) return;
  messageWindowStart = Math.max(0, messageWindowStart - MESSAGE_WINDOW_PAGE);
  messageWindowEnd = Math.min(conversationMessages.length, messageWindowStart + MAX_VISIBLE_MESSAGES);
  renderMessageWindow({ preserveScroll: true });
}

function hasNewerMessages() {
  return messageWindowEnd < conversationMessages.length;
}

function showLatestMessages() {
  setMessageWindowToLatest();
  renderMessageWindow();
  scrollToBottom(true);
  scrollState.pinnedToBottom = true;
}

function updateStats() {
  if (requestCount) {
    requestCount.textContent = String(requests.length);
    requestCount.classList.toggle("has-pending", requests.length > 0);
  }
  if (friendCount)  friendCount.textContent  = String(friends.length);
  if (onlineCount) {
    const online = friends.filter((f) => f.online).length;
    onlineCount.textContent = `${online} online`;
  }
}

function syncAttachButtonState() {
  const composerDisabled = Boolean(messageInput?.disabled);
  const disabled = composerDisabled || !activeFriend || attachmentUploadState.active;
  if (attachFileBtn) {
    attachFileBtn.disabled = disabled;
    attachFileBtn.classList.toggle("uploading", attachmentUploadState.active);
    attachFileBtn.setAttribute("aria-busy", attachmentUploadState.active ? "true" : "false");
  }
  if (cameraBtn) {
    cameraBtn.disabled = disabled;
    cameraBtn.classList.toggle("uploading", attachmentUploadState.active);
    cameraBtn.setAttribute("aria-busy", attachmentUploadState.active ? "true" : "false");
  }
}

function setComposerEnabled(isEnabled) {
  messageInput.disabled = !isEnabled;
  if (sendButton) sendButton.disabled = !isEnabled;
  if (voiceBtn) {
    voiceBtn.disabled = !isEnabled;
    if (!isEnabled) resetVoiceState();
  }

  if (!isEnabled) {
    cameraCaptureModal.close();
    stopLocalTyping();
    hideTypingIndicator();
  }

  syncAttachButtonState();
  messageInput.placeholder = "Type a message…";
}

function scrollToUnreadStart() {
  if (!messagesEl) return false;
  if (getSearchQuery()) return false;
  if (!pendingUnreadJump.count) return false;
  if (!activeFriend || normalizeName(activeFriend) !== pendingUnreadJump.friendKey) return false;

  const incoming = Array.from(messagesEl.querySelectorAll("article.message.them"));
  if (!incoming.length) {
    pendingUnreadJump = { friendKey: "", count: 0 };
    return false;
  }

  const index = Math.max(0, incoming.length - pendingUnreadJump.count);
  const target = incoming[index] || incoming[0];
  if (!target) {
    pendingUnreadJump = { friendKey: "", count: 0 };
    return false;
  }

  target.scrollIntoView({ behavior: "auto", block: "start" });
  target.classList.add("highlight-flash");
  setTimeout(() => target.classList.remove("highlight-flash"), 1200);
  scrollState.pinnedToBottom = false;
  pendingUnreadJump = { friendKey: "", count: 0 };
  return true;
}

function renderMessages(messages) {
  conversationMessages = Array.isArray(messages) ? messages.slice() : [];

  if (!conversationMessages.length) {
    renderMessagesEmptyState("No messages yet. Say hello!");
    applyMessageSearch();
    syncPinnedMessageBar();
    syncProfilePanelStats();
    syncCallLogPanel();
    return;
  }

  setMessageWindowToLatest();
  renderMessageWindow({ skipSearch: true });

  // Jump to first unread message when available, otherwise bottom
  const jumpedToUnread = scrollToUnreadStart();
  if (!jumpedToUnread) {
    scrollToBottom(true);
    scrollState.pinnedToBottom = true;
  }
  if (window._novynFAB) window._novynFAB.reset();
  applyMessageSearch();
  syncPinnedMessageBar();
  syncProfilePanelStats();
  syncCallLogPanel();
}

function markConversationMessageDeleted(messageId, deletedAt, replacementText = DELETED_MESSAGE_TEXT) {
  for (const message of conversationMessages) {
    if (message.id !== messageId) continue;
    message.deletedAt = deletedAt || message.deletedAt || new Date().toISOString();
    message.text = replacementText;
    message.editedAt = null;
    message.attachment = null;
    message.pinnedAt = null;
    message.pinnedBy = "";
    message.reactions = {};
    break;
  }
}

function applyDeletedMessageToDom(messageId, replacementText = DELETED_MESSAGE_TEXT) {
  const row = messagesEl.querySelector(`[data-message-id="${messageId}"]`);
  if (!row) return;

  row.classList.add("message-deleted");
  row.classList.remove("message-pinned");
  row.dataset.messageText = replacementText;
  row.dataset.searchText = `${row.dataset.messageFrom || ""} ${replacementText}`;
  delete row.dataset.pinnedAt;
  delete row.dataset.editedAt;
  delete row.dataset.hasAttachment;
  delete row.dataset.messageReactions;

  const body = row.querySelector(".message-body");
  if (body) {
    body.textContent = replacementText;
    body.classList.add("message-body-deleted");
    body.dataset.rawText = replacementText;
  }

  const replyQuote = row.querySelector(".reply-quote");
  if (replyQuote) replyQuote.remove();
  const editedFlag = row.querySelector(".message-edited-flag");
  if (editedFlag) editedFlag.remove();
  const pinnedFlag = row.querySelector(".message-pinned-flag");
  if (pinnedFlag) pinnedFlag.remove();

  const actions = row.querySelector(".msg-actions");
  if (actions) actions.remove();

  const reactions = row.querySelector(".message-reactions");
  if (reactions) reactions.innerHTML = "";
}

function rerenderConversationMessageRow(messageId) {
  if (!messagesEl || !messageId) return;
  const message = getConversationMessageById(messageId);
  if (!message) return;
  const row = messagesEl.querySelector(`[data-message-id="${messageId}"]`);
  if (!row) return;
  const replacement = buildMessageElement(message, true);
  row.replaceWith(replacement);
}

function applyConversationMessageEdit(messageId, text, editedAt) {
  if (!messageId) return false;
  const message = getConversationMessageById(messageId);
  if (!message || message.deletedAt) return false;
  message.text = String(text || message.text || "").trim();
  message.editedAt = editedAt || new Date().toISOString();
  return true;
}

function applyConversationMessagePin(messageId, pinned, pinnedAt, pinnedBy) {
  if (!messageId) return false;
  const message = getConversationMessageById(messageId);
  if (!message || message.deletedAt) return false;
  if (pinned) {
    message.pinnedAt = String(pinnedAt || message.pinnedAt || new Date().toISOString());
    message.pinnedBy = String(pinnedBy || "");
  } else {
    message.pinnedAt = null;
    message.pinnedBy = "";
  }
  return true;
}

function normalizeConversationReactionsPayload(rawReactions) {
  const input = rawReactions && typeof rawReactions === "object" ? rawReactions : {};
  const normalized = {};
  Object.entries(input).forEach(([emoji, rawEntry]) => {
    if (!rawEntry || typeof rawEntry !== "object") return;
    const baseCount = Number(rawEntry.count);
    const userKeys = Array.isArray(rawEntry.userKeys)
      ? rawEntry.userKeys.map((userKey) => normalizeName(userKey)).filter(Boolean)
      : [];
    const users = Array.isArray(rawEntry.users)
      ? rawEntry.users.map((name) => String(name || "").trim()).filter(Boolean)
      : [];
    const count = Number.isFinite(baseCount) && baseCount > 0
      ? Math.floor(baseCount)
      : Math.max(userKeys.length, users.length);
    if (!count) return;
    normalized[emoji] = {
      count,
      mine: Boolean(rawEntry.mine),
      userKeys,
      users,
    };
  });
  return normalized;
}

function applyConversationReactionsUpdate(messageId, reactions) {
  if (!messageId) return;
  const message = getConversationMessageById(messageId);
  if (message) {
    message.reactions = normalizeConversationReactionsPayload(reactions);
  }
  const row = messagesEl ? messagesEl.querySelector(`[data-message-id="${messageId}"]`) : null;
  if (row) {
    const reactionPayload = message?.reactions || normalizeConversationReactionsPayload(reactions);
    if (reactionPayload && Object.keys(reactionPayload).length) {
      try {
        row.dataset.messageReactions = JSON.stringify(reactionPayload);
      } catch (_) {
        delete row.dataset.messageReactions;
      }
    } else {
      delete row.dataset.messageReactions;
    }
  }
}

function requestDiscoverOnline() {
  if (!socket || !socket.emit) return;
  if (!isDashboardPage || !me) return;
  socket.emit("discover_online");
}

function setDiscoverUsers(list) {
  discoverUsers = Array.isArray(list) ? list.slice() : [];
  renderDiscover();
}

function renderDiscover() {
  if (!discoverPanel || !discoverList) return;
  discoverList.innerHTML = "";
  const meKey = normalizeName(me);
  const friendKeys = new Set(friends.map((friend) => normalizeName(friend.username)));
  const requestKeys = new Set(requests.map((name) => normalizeName(name)));
  const query = friendSearchQuery;
  const filtered = discoverUsers.filter((user) => {
    const username = String(user?.username || "").trim();
    if (!username) return false;
    const key = normalizeName(username);
    if (!key || key === meKey) return false;
    if (friendKeys.has(key) || requestKeys.has(key)) return false;
    if (query) {
      const searchBlob = normalizeSearchText(`${user?.displayName || ""} ${username} ${user?.bio || ""}`);
      if (!searchBlob.includes(query)) return false;
    }
    return true;
  });
  if (discoverEmpty) {
    discoverEmpty.style.display = filtered.length ? "none" : "";
  }
  if (!filtered.length) return;

  filtered.forEach((user) => {
    const item = document.createElement("div");
    item.className = "discover-item";

    const avatar = document.createElement("div");
    avatar.className = "discover-avatar";
    const fallback = String(user?.username || "").slice(0, 2).toUpperCase();
    if (user?.avatarId && window._novynAvatarUtils) {
      window._novynAvatarUtils.applyAvatarToEl(avatar, user.avatarId, fallback || "?");
    } else {
      avatar.textContent = fallback || "?";
    }

    const meta = document.createElement("div");
    meta.className = "discover-meta";
    const name = document.createElement("div");
    name.className = "discover-name";
    const displayName = cleanDisplayName(user?.displayName);
    name.textContent = displayName || user?.username || "User";
    const sub = document.createElement("div");
    sub.className = "discover-sub";
    const bio = cleanDisplayName(user?.bio);
    sub.textContent = bio ? `Online now · ${bio}` : "Online now";
    meta.append(name, sub);

    const action = document.createElement("button");
    action.className = "discover-action";
    action.type = "button";
    action.textContent = "Add";
    action.addEventListener("click", () => {
      if (action.disabled) return;
      action.disabled = true;
      action.classList.add("is-disabled");
      action.textContent = "Requested";
      if (user?.username) socket.emit("add_friend", user.username);
    });

    item.append(avatar, meta, action);
    discoverList.appendChild(item);
  });
}


// ─── Requests ────────────────────────────────────────────────────────────────

function renderRequests() {
  if (!requestList) return;
  requestList.innerHTML = "";
  updateStats();
  updateRequestsBadge();

  const query = friendSearchQuery;
  const filteredRequests = query
    ? requests.filter((name) => normalizeSearchText(name).includes(query))
    : requests;

  if (!filteredRequests.length) {
    const empty       = document.createElement("li");
    empty.className   = "item-card list-empty";
    empty.textContent = requests.length
      ? `No requests match "${friendSearchQuery}"`
      : "No pending requests";
    requestList.appendChild(empty);
    return;
  }

  for (const username of filteredRequests) {
    const li      = document.createElement("li");
    li.className  = "request-card";

    const name        = document.createElement("span");
    name.className    = "request-name";
    name.textContent  = username;

    const btn       = document.createElement("button");
    btn.type        = "button";
    btn.className   = "req-btn accept";
    btn.textContent = "Accept";
    btn.addEventListener("click", () => socket.emit("accept_friend", username));

    li.append(name, btn);
    requestList.appendChild(li);
  }
}

// ─── Friends ──────────────────────────────────────────────────────────────────

function friendPreview(friend) {
  if (!friend.lastMessage) {
    const bio = cleanDisplayName(friend?.bio);
    if (bio) return bio;
    return friend.online ? "Online now" : "No messages yet";
  }
  const fromMe = normalizeName(friend.lastFrom) === normalizeName(me);
  const callPreview = formatCallLogPreview(friend.lastMessage, fromMe);
  const previewText = callPreview || friend.lastMessage;
  if (fromMe) {
    return `You: ${previewText}`;
  }
  if (friend.lastFrom) {
    return `${getFriendDisplayName(friend)}: ${previewText}`;
  }
  return previewText;
}

function findFriend(username) {
  return friends.find(
    (friend) => normalizeName(friend.username) === normalizeName(username)
  );
}

function setInfoPanelStatus(text, state) {
  if (!infoPanelStatus) return;
  infoPanelStatus.textContent = text;
  infoPanelStatus.classList.remove("online", "offline", "me");
  if (state) infoPanelStatus.classList.add(state);
}

function applyInfoAvatar(avatarEl, avatarId, fallbackText) {
  if (!avatarEl) return;
  const utils = window._novynAvatarUtils;
  if (utils && avatarId) {
    utils.applyAvatarToEl(avatarEl, avatarId, fallbackText);
    return;
  }
  avatarEl.style.background = "";
  avatarEl.textContent = fallbackText || "?";
}

function maybeResetInfoPanelScroll() {
  if (!document.body || !document.body.classList.contains("info-open")) return;
  const nextKey = activeFriend ? normalizeName(activeFriend) : "me";
  if (!nextKey || nextKey === lastInfoPanelFriendKey) return;
  const inner = document.querySelector(".info-inner");
  if (inner) inner.scrollTop = 0;
  lastInfoPanelFriendKey = nextKey;
}

function syncInfoPanel() {
  if (!infoPanelName || !infoPanelAvatar || !infoPanelHandle || !infoPanelStatus) return;

  if (activeFriend) {
    const friend = findFriend(activeFriend);
    if (!friend) {
      infoPanelName.textContent = "Loading...";
      infoPanelHandle.textContent = "";
      setInfoPanelStatus("● Offline", "offline");
      maybeResetInfoPanelScroll();
      return;
    }

    infoPanelName.textContent = getFriendDisplayName(friend);
    infoPanelHandle.textContent = `@${friend.username}`;
    infoPanelHandle.title = `@${friend.username}`;
    applyInfoAvatar(
      infoPanelAvatar,
      friend.avatarId,
      friend.username.slice(0, 2).toUpperCase()
    );
    setInfoPanelStatus(friend.online ? "● Online" : "● Offline", friend.online ? "online" : "offline");
    infoPanelStatus.title = friend.online ? "Online now" : formatLastSeen(friend.lastSeenAt);
    maybeResetInfoPanelScroll();
    return;
  }

  const myName = getMyDisplayName();
  infoPanelName.textContent = myName;
  infoPanelHandle.textContent = me ? `@${me}` : "@you";
  infoPanelHandle.title = me ? `@${me}` : "@you";
  applyInfoAvatar(infoPanelAvatar, myProfile.avatarId, (me || "You").slice(0, 2).toUpperCase());
  setInfoPanelStatus("● You", "me");
  infoPanelStatus.title = "Your profile";
  maybeResetInfoPanelScroll();
}


function renderActiveFriendPresence() {
  if (document.body) {
    document.body.classList.toggle("friend-selected", Boolean(activeFriend));
  }
  if (!activeFriend) {
    document.body.classList.remove("info-open");
  }
  syncInfoPanel();

  if (!activePresence || !activeFriendAvatar) return;

  if (!activeFriend) {
    activePresence.classList.add("hidden");
    activeFriendAvatar.classList.remove("online");
    activeFriendAvatar.textContent = "?";
    activeFriendAvatar.style.background = "";
    if (activeFriendPresenceLine) {
      activeFriendPresenceLine.textContent = "Select a friend to start chatting";
      activeFriendPresenceLine.classList.remove("online", "offline");
    }
    syncProfilePanel();
    return;
  }

  const friend = findFriend(activeFriend);
  if (!friend) {
    activePresence.classList.add("hidden");
    if (activeFriendPresenceLine) {
      activeFriendPresenceLine.textContent = "Loading contact status...";
      activeFriendPresenceLine.classList.remove("online", "offline");
    }
    syncProfilePanel();
    return;
  }

  activePresence.classList.remove("hidden");
  activeFriendLabel.textContent = getFriendDisplayName(friend);
  activeFriendLabel.title = `@${friend.username}`;

  const fallback = friend.username.slice(0, 2).toUpperCase();
  if (friend.avatarId && window._novynAvatarUtils) {
    window._novynAvatarUtils.applyAvatarToEl(
      activeFriendAvatar,
      friend.avatarId,
      fallback
    );
  } else {
    activeFriendAvatar.style.background = "";
    activeFriendAvatar.textContent = fallback;
  }

  activeFriendAvatar.classList.toggle("online", !!friend.online);
  activeFriendAvatar.title = friend.online
    ? `${friend.username} is online`
    : `${friend.username} is offline`;

  if (activeFriendPresenceLine) {
    const statusText = friend.online ? "Online now" : formatLastSeen(friend.lastSeenAt);
    activeFriendPresenceLine.textContent = statusText;
    activeFriendPresenceLine.classList.toggle("online", !!friend.online);
    activeFriendPresenceLine.classList.toggle("offline", !friend.online);
  }

  syncProfilePanel(friend);
}

function syncRemoveFriendButton() {
  if (!removeFriendBtn) return;
  const hasActive = Boolean(activeFriend);
  removeFriendBtn.classList.toggle("hidden", !hasActive);
  removeFriendBtn.disabled = !hasActive;
  if (hasActive) {
    removeFriendBtn.title = `Unfriend @${activeFriend}`;
    removeFriendBtn.setAttribute("aria-label", `Unfriend ${activeFriend}`);
  } else {
    removeFriendBtn.title = "Unfriend";
    removeFriendBtn.setAttribute("aria-label", "Unfriend");
  }
}

function clearActiveFriendSelection() {
  persistActiveMessageDraft();
  if (activeFriend) stopLocalTyping(activeFriend);
  activeFriend = "";
  pendingUnreadJump = { friendKey: "", count: 0 };
  setActiveChatTarget("");
  conversationMessages = [];
  clearReply();
  resetMessageSearch();
  if (activeFriendLabel) {
    activeFriendLabel.textContent = "Select a conversation";
    activeFriendLabel.title = "";
  }
  if (activeFriendPresenceLine) {
    activeFriendPresenceLine.textContent = "Choose a friend to start messaging";
    activeFriendPresenceLine.classList.remove("online", "offline");
  }
  renderActiveFriendPresence();
  syncRemoveFriendButton();
  setComposerEnabled(false);
  if (messageInput) {
    messageInput.value = "";
  }
  if (sendButton) {
    sendButton.classList.remove("ready");
  }
  renderMessagesEmptyState(EMPTY_CONVERSATION_HINT);
  renderFriends();
}

function setActiveFriend(username) {
  persistActiveMessageDraft();
  if (activeFriend && normalizeName(activeFriend) !== normalizeName(username)) {
    stopLocalTyping(activeFriend);
  }

  if (!username) {
    clearActiveFriendSelection();
    return;
  }

  if (username) {
    const friend = findFriend(username);
    pendingUnreadJump = {
      friendKey: normalizeName(username),
      count: Number(friend?.unreadCount) || 0,
    };
  } else {
    pendingUnreadJump = { friendKey: "", count: 0 };
  }

  activeFriend = username;
  setActiveChatTarget(username);
  conversationMessages = [];
  clearReply();
  resetMessageSearch();
  activeFriendLabel.textContent = "Loading...";
  renderActiveFriendPresence();
  syncRemoveFriendButton();
  setComposerEnabled(true);
  applyActiveMessageDraft();
  renderMessagesEmptyState("Loading conversation…");
  socket.emit("get_history", username);
  renderFriends();

  // Focus input after selecting friend (better UX, especially on desktop)
  if (messageInput) {
    setTimeout(() => messageInput.focus(), 50);
  }
}

function renderFriends() {
  if (!friendList) return;
  friendList.innerHTML = "";
  updateStats();

  const isContactsView = sidebarView === "contacts";
  const isMessagesView = sidebarView === "messages";
  const query = friendSearchQuery;
  const filteredFriends = query
    ? friends.filter((friend) => getFriendSearchBlob(friend).includes(query))
    : friends;
  const sortedFriends = filteredFriends.slice().sort((a, b) => {
    if (sidebarView === "contacts") {
      return getFriendDisplayName(a).localeCompare(getFriendDisplayName(b));
    }
    const aTs = a.lastTimestamp || "";
    const bTs = b.lastTimestamp || "";
    if (aTs && bTs) return bTs.localeCompare(aTs);
    if (aTs) return -1;
    if (bTs) return 1;
    return String(a.username || "").localeCompare(String(b.username || ""));
  });

  if (!sortedFriends.length) {
    const empty       = document.createElement("li");
    empty.className   = "item-card list-empty";
    empty.textContent = friends.length
      ? `No friends match "${friendSearchQuery}"`
      : "No friends yet — add one above";
    friendList.appendChild(empty);
    renderActiveFriendPresence();
    syncRemoveFriendButton();
    return;
  }

  const renderFriendRow = (friend) => {
    const li      = document.createElement("li");
    li.className  = "item-card";

    const btn         = document.createElement("button");
    btn.type          = "button";
    btn.className     = `friend-btn chat-item${normalizeName(activeFriend) === normalizeName(friend.username) ? " active" : ""}`;
    btn.dataset.username = friend.username;

    // Avatar with initials + online dot
    const avatar        = document.createElement("div");
    avatar.className    = `friend-avatar chat-av av-default${friend.online ? " online" : ""}`;
    if (friend.avatarId && window._novynAvatarUtils) {
      window._novynAvatarUtils.applyAvatarToEl(avatar, friend.avatarId, friend.username.slice(0, 2).toUpperCase());
    } else {
      avatar.textContent = friend.username.slice(0, 2).toUpperCase();
    }
    btn.appendChild(avatar);

    const main      = document.createElement("div");
    main.className  = "friend-main chat-info";

    const name        = document.createElement("span");
    name.className    = "friend-name chat-name";
    name.textContent  = getFriendDisplayName(friend);
    if (displayDiffersFromUsername(friend)) {
      name.title = `${getFriendDisplayName(friend)} (@${friend.username})`;
    } else {
      name.title = friend.username;
    }

    const preview = document.createElement("span");
    preview.className = "chat-preview";
    preview.textContent = (isContactsView || isMessagesView) ? getFriendPresenceText(friend) : friendPreview(friend);
    preview.title = preview.textContent;
    if (isContactsView || isMessagesView) {
      preview.classList.toggle("status-online", !!friend.online);
      preview.classList.toggle("status-offline", !friend.online);
    }

    main.append(name, preview);

    if (!isContactsView) {
      const side      = document.createElement("div");
      side.className  = "friend-side chat-right";

      if (!isMessagesView) {
        const timeText = formatFriendTime(friend.lastTimestamp);
        if (timeText) {
          const time = document.createElement("span");
          time.className = "chat-time";
          time.textContent = timeText;
          side.appendChild(time);
        }
      }
      const unreadCount = Number(friend.unreadCount) || 0;
      if (unreadCount > 0) {
        const unread        = document.createElement("span");
        unread.className    = "unread-badge";
        unread.textContent  = unreadCount > 99 ? "99+" : String(unreadCount);
        side.appendChild(unread);
      }

      if (side.childNodes.length) {
        btn.append(main, side);
      } else {
        btn.append(main);
      }
    } else {
      btn.append(main);
    }
    li.appendChild(btn);
    friendList.appendChild(li);
  };

  if (isContactsView) {
    const grouped = { online: [], away: [], offline: [] };
    sortedFriends.forEach((friend) => {
      const bucket = getContactBucket(friend);
      if (grouped[bucket]) grouped[bucket].push(friend);
    });
    const order = ["online", "away", "offline"];
    const labels = { online: "Online", away: "Away", offline: "Offline" };

    order.forEach((bucket) => {
      const list = grouped[bucket];
      if (!list || !list.length) return;
      const label = document.createElement("li");
      label.className = "contact-section-label";
      label.textContent = `${labels[bucket]} — ${list.length}`;
      friendList.appendChild(label);
      list
        .slice()
        .sort((a, b) => getFriendDisplayName(a).localeCompare(getFriendDisplayName(b)))
        .forEach(renderFriendRow);
    });
  } else {
    sortedFriends.forEach(renderFriendRow);
  }

  renderActiveFriendPresence();
  syncRemoveFriendButton();
  renderCallHistory();
}

// ─── Form handlers ────────────────────────────────────────────────────────────

// ─── Login button spinner helpers ────────────────────────────────────────────
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = loginBtn ? loginBtn.querySelector(".login-btn-text") : null;
const loginBtnArrow = loginBtn ? loginBtn.querySelector(".login-btn-arrow") : null;
const loginBtnSpinner = loginBtn ? loginBtn.querySelector(".login-btn-spinner") : null;

function setLoginLoading(isLoading) {
  if (!loginBtn) return;
  loginBtn.disabled = isLoading;
  if (loginBtnText)    loginBtnText.textContent = isLoading ? "Entering…" : "Sign In";
  if (loginBtnArrow)   loginBtnArrow.classList.toggle("hidden", isLoading);
  if (loginBtnSpinner) loginBtnSpinner.classList.toggle("hidden", !isLoading);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Legacy hidden login form is kept only for markup compatibility.
  });
}

// Clear suggestions as soon as the user starts editing
if (usernameInput) usernameInput.addEventListener("input", clearUsernameSuggestions);
if (passwordInput) passwordInput.addEventListener("input", clearUsernameSuggestions);

function requestFriendSuggestions(query) {
  if (!socketAvailable || !query) return;
  socket.emit("friend_search", { query });
}

if (addFriendForm) {
  addFriendForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = friendInput ? friendInput.value.trim() : "";
    if (!val) return;
    if (me && normalizeName(val) === normalizeName(me)) {
      showToast("You can't add yourself!", "error");
      return;
    }
    socket.emit("add_friend", val);
    if (friendInput) friendInput.value = "";
    clearFriendSuggestions();
  });
}

if (friendInput) {
  friendInput.addEventListener("input", () => {
    const val = friendInput.value.trim();
    if (!val || val.length < 2) {
      clearFriendSuggestions();
      friendSuggestState.lastQuery = "";
      if (friendSuggestState.timer) clearTimeout(friendSuggestState.timer);
      return;
    }
    if (friendSuggestState.timer) clearTimeout(friendSuggestState.timer);
    friendSuggestState.timer = setTimeout(() => {
      friendSuggestState.lastQuery = val;
      requestFriendSuggestions(val);
    }, 220);
  });
  friendInput.addEventListener("blur", () => {
    setTimeout(() => {
      clearFriendSuggestions();
    }, 160);
  });
}

if (sidebarSearch) {
  const applyFriendSearch = () => {
    friendSearchQuery = normalizeSearchText(sidebarSearch.value);
    renderRequests();
    renderFriends();
    renderCallHistory();
    renderDiscover();
  };
  sidebarSearch.addEventListener("input", applyFriendSearch);
  sidebarSearch.addEventListener("search", applyFriendSearch);
}

if (navRailButtons.length) {
  navRailButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const view = btn.dataset.rail || "";
      if (!view) return;
      if (view === "settings") {
        if (e) e.stopPropagation();
        setSettingsOpen(!settingsOpen);
        return;
      }
      switchRail(view);
    });
  });
  window.__novynNavBound = true;
}

if (callFilterButtons.length) {
  callFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.callFilter || "all";
      setCallFilter(filter);
    });
  });
}

if (settingsCloseBtn) {
  settingsCloseBtn.addEventListener("click", () => setSettingsOpen(false));
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && settingsOpen) {
    setSettingsOpen(false);
  }
});

if (mobBackBtn) {
  mobBackBtn.addEventListener("click", () => {
    clearActiveFriendSelection();
    showSidebarOnMobile();
  });
}

document.addEventListener("visibilitychange", () => {
  if (!isDashboardPage) return;
  if (document.hidden) {
    cameraCaptureModal.close();
    setActiveChatTarget("");
  } else if (activeFriend) {
    setActiveChatTarget(activeFriend);
  }
});

if (friendList) {
  const handleFriendActivate = (e) => {
    const btn = e.target.closest(".friend-btn");
    if (!btn) return;
    const username = btn.dataset.username;
    if (!username) return;
    e.preventDefault();
    setActiveFriend(username);
    showChatOnMobile();
  };
  friendList.addEventListener("click", handleFriendActivate);
}

// ─── Custom unfriend confirm modal ────────────────────────────────────────────
const unfriendModal  = document.getElementById("unfriendModal");
const unfriendCancel  = document.getElementById("unfriendCancel");
const unfriendConfirm = document.getElementById("unfriendConfirm");
const unfriendModalTitle = document.getElementById("unfriendModalTitle");
const unfriendModalDesc  = document.getElementById("unfriendModalDesc");
let pendingUnfriendTarget = "";
let unfriendFocusReturn = null;
let unfriendTrapCleanup = null;

function getModalFocusable(modal) {
  if (!modal) return [];
  const nodes = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
  return Array.from(nodes).filter((el) => !el.disabled && el.offsetParent !== null);
}

function trapModalFocus(modal) {
  const onKey = (e) => {
    if (e.key !== "Tab") return;
    const focusable = getModalFocusable(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  modal.addEventListener("keydown", onKey);
  return () => modal.removeEventListener("keydown", onKey);
}

function showUnfriendModal(target) {
  pendingUnfriendTarget = target;
  if (unfriendModalTitle) unfriendModalTitle.textContent = `Unfriend @${target}?`;
  if (unfriendModalDesc)  unfriendModalDesc.textContent  = `This will also clear your chat history with @${target}.`;
  if (unfriendModal) {
    unfriendFocusReturn = document.activeElement;
    unfriendModal.style.display = "flex";
    if (unfriendTrapCleanup) unfriendTrapCleanup();
    unfriendTrapCleanup = trapModalFocus(unfriendModal);
    const focusable = getModalFocusable(unfriendModal);
    if (focusable.length) focusable[0].focus();
  }
}
function hideUnfriendModal() {
  if (unfriendModal) unfriendModal.style.display = "none";
  if (unfriendTrapCleanup) {
    unfriendTrapCleanup();
    unfriendTrapCleanup = null;
  }
  if (unfriendFocusReturn && typeof unfriendFocusReturn.focus === "function") {
    unfriendFocusReturn.focus();
  }
  unfriendFocusReturn = null;
  pendingUnfriendTarget = "";
}

if (unfriendCancel)  unfriendCancel.addEventListener("click", hideUnfriendModal);
if (unfriendConfirm) unfriendConfirm.addEventListener("click", () => {
  if (pendingUnfriendTarget) socket.emit("remove_friend", pendingUnfriendTarget);
  hideUnfriendModal();
});
if (unfriendModal) {
  unfriendModal.querySelector(".confirm-modal-backdrop")
    ?.addEventListener("click", hideUnfriendModal);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && unfriendModal && unfriendModal.style.display !== "none") {
    hideUnfriendModal();
  }
});

if (removeFriendBtn) {
  removeFriendBtn.addEventListener("click", () => {
    if (!activeFriend) return;
    showUnfriendModal(activeFriend);
  });
}

function keepComposerFocused() {
  if (!messageInput || messageInput.disabled) return;

  const refocus = () => {
    try {
      messageInput.focus({ preventScroll: true });
    } catch (_) {
      messageInput.focus();
    }
    const caretPos = messageInput.value.length;
    if (typeof messageInput.setSelectionRange === "function") {
      messageInput.setSelectionRange(caretPos, caretPos);
    }
  };

  // First immediate focus, then a delayed pass for mobile keyboards.
  refocus();
  setTimeout(refocus, 40);
}

const voiceState = {
  recorder: null,
  chunks: [],
  stream: null,
  timeout: null,
  isRecording: false,
  uploading: false,
  cancelNext: false,
  startedAt: 0,
  timerId: null,
  pendingTempId: "",
};

const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
const CALL_SIGNAL_RETRY_MS = 2200;
const CALL_SIGNAL_MAX_ATTEMPTS = 8;
const CALL_RING_TIMEOUT_MS = 30000;

function sanitizeIceServerList(input) {
  if (!Array.isArray(input)) return [];
  const normalized = [];
  for (const entry of input) {
    if (!entry || typeof entry !== "object") continue;
    const rawUrls = entry.urls;
    let urls = "";
    if (typeof rawUrls === "string") {
      urls = rawUrls.trim();
    } else if (Array.isArray(rawUrls)) {
      urls = rawUrls.map((value) => String(value || "").trim()).filter(Boolean);
    }
    if (!urls || (Array.isArray(urls) && !urls.length)) continue;
    const server = { urls };
    if (typeof entry.username === "string" && entry.username.trim()) {
      server.username = entry.username.trim();
    }
    if (typeof entry.credential === "string" && entry.credential.length) {
      server.credential = entry.credential;
    }
    if (typeof entry.credentialType === "string" && entry.credentialType.trim()) {
      server.credentialType = entry.credentialType.trim();
    }
    normalized.push(server);
  }
  return normalized;
}

let callIceServers = sanitizeIceServerList(window.NOVYN_ICE_SERVERS);
if (!callIceServers.length) {
  callIceServers = DEFAULT_ICE_SERVERS.slice();
}
let callIceServersReady = false;
let callIceConfigPromise = null;

async function ensureCallIceServers(force = false) {
  if (callIceServersReady && !force) return callIceServers;
  if (callIceConfigPromise && !force) return callIceConfigPromise;

  callIceConfigPromise = (async () => {
    let loadedFromApi = false;
    try {
      let result = null;
      if (authApi?.request) {
        result = await authApi.request("/api/rtc/ice", {
          method: "GET",
          cache: "no-store",
        });
      } else {
        const response = await fetch("/api/rtc/ice", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => ({}));
        result = { ok: response.ok, status: response.status, data };
      }
      if (result?.ok) {
        const remoteServers = sanitizeIceServerList(result?.data?.iceServers);
        if (remoteServers.length) {
          callIceServers = remoteServers;
        }
        loadedFromApi = true;
      }
    } catch (_) {
      // Keep default STUN servers when API lookup fails.
    } finally {
      callIceServersReady = loadedFromApi;
      callIceConfigPromise = null;
    }
    return callIceServers;
  })();

  return callIceConfigPromise;
}

if (isDashboardPage) {
  void ensureCallIceServers();
}

const callState = {
  status: "idle",
  peer: "",
  pc: null,
  localStream: null,
  remoteStream: null,
  pendingOffer: null,
  pendingLocalOffer: null,
  pendingLocalAnswer: null,
  lastRemoteOfferSdp: "",
  lastRemoteAnswerSdp: "",
  pendingCandidates: [],
  isCaller: false,
  inviteAcknowledged: false,
  muted: false,
  speakerOn: true,
  mediaType: "audio",
  videoEnabled: true,
  videoFacing: "user",
  startedAt: 0,
  timerId: null,
  minimized: false,
  logSent: false,
  reconnectTimer: null,
  ringTimeoutTimer: null,
  offerRetryTimer: null,
  answerRetryTimer: null,
  offerRetryCount: 0,
  answerRetryCount: 0,
};

function resetVoiceState() {
  if (voiceState.timeout) clearTimeout(voiceState.timeout);
  voiceState.timeout = null;
  if (voiceState.timerId) clearInterval(voiceState.timerId);
  voiceState.timerId = null;
  if (voiceState.recorder && voiceState.recorder.state !== "inactive") {
    voiceState.recorder.stop();
  }
  if (voiceState.stream) {
    voiceState.stream.getTracks().forEach((t) => t.stop());
  }
  voiceState.recorder = null;
  voiceState.stream = null;
  voiceState.chunks = [];
  voiceState.isRecording = false;
  voiceState.cancelNext = false;
  voiceState.startedAt = 0;
  voiceState.pendingTempId = "";
  if (voiceBtn) {
    voiceBtn.classList.remove("recording");
    voiceBtn.setAttribute("aria-pressed", "false");
    voiceBtn.disabled = messageInput?.disabled;
  }
  if (voiceStatus) voiceStatus.classList.add("hidden");
  if (voiceLabel) voiceLabel.textContent = "Recording...";
  if (voiceTimer) voiceTimer.textContent = "0:00";
  if (voiceProgress) voiceProgress.classList.add("hidden");
  if (voiceProgressBar) voiceProgressBar.style.transform = "scaleX(0)";
  if (voiceProgressText) voiceProgressText.textContent = "Uploading... 0%";
  if (voiceCancelBtn) voiceCancelBtn.disabled = false;
  if (voiceStopBtn) voiceStopBtn.disabled = false;
}

function setAttachmentUploadUiState(isUploading) {
  attachmentUploadState.active = Boolean(isUploading);
  syncAttachButtonState();
}

async function uploadAttachmentFile(file) {
  if (!file) throw new Error("No file selected.");
  const formData = new FormData();
  formData.append("file", file, file.name || `attachment-${Date.now()}`);

  const response = await fetch("/upload-file", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.error || "File upload failed.");
  }

  const attachment = normalizeAttachmentPayload(payload, payload?.url || "");
  if (!attachment) {
    throw new Error("Upload finished but no file URL was returned.");
  }
  return attachment;
}

async function uploadAttachmentFromPicker(file) {
  if (!file) return;
  if (!activeFriend) {
    showToast("Choose a friend before attaching a file.", "error");
    return;
  }
  if (attachmentUploadState.active) {
    showToast("Please wait for the current upload to finish.", "info");
    return;
  }
  if (Number(file.size || 0) > ATTACHMENT_MAX_SIZE_BYTES) {
    showToast("File is too large. Max size is 15 MB.", "error");
    return;
  }

  const targetFriend = activeFriend;
  const tempId = createClientTempId();
  attachmentUploadState.pendingTempId = tempId;
  attachmentUploadState.target = targetFriend;
  setAttachmentUploadUiState(true);

  const pendingLabel = `Uploading ${String(file.name || "file").slice(0, 120)}...`;
  queuePendingMessage(
    { to: targetFriend, text: pendingLabel, clientTempId: tempId },
    { queue: false, updateFriends: false }
  );

  try {
    const attachment = await uploadAttachmentFile(file);
    if (attachmentUploadState.pendingTempId) {
      const pendingTempId = attachmentUploadState.pendingTempId;
      attachmentUploadState.pendingTempId = "";
      updatePendingMessageAttachment(pendingTempId, attachment, attachment.url);
      sendMessagePayload(
        {
          to: targetFriend,
          text: attachment.url,
          attachment,
          clientTempId: pendingTempId,
        },
        { optimistic: false }
      );
    } else {
      sendMessagePayload({ to: targetFriend, text: attachment.url, attachment });
    }
    showToast(attachment.kind === "image" ? "Image sent." : "File sent.", "success");
  } catch (error) {
    console.error(error);
    if (attachmentUploadState.pendingTempId) {
      removePendingMessage(attachmentUploadState.pendingTempId);
    }
    const message = String(error?.message || "File upload failed.");
    showToast(message, "error");
  } finally {
    attachmentUploadState.pendingTempId = "";
    attachmentUploadState.target = "";
    setAttachmentUploadUiState(false);
    if (attachFileInput) {
      attachFileInput.value = "";
    }
    if (cameraCaptureInput) {
      cameraCaptureInput.value = "";
    }
  }
}

async function uploadVoiceBlob(blob) {
  if (!blob || !activeFriend) return;
  const targetFriend = activeFriend;
  voiceState.uploading = true;
  if (voiceStatus) voiceStatus.classList.remove("hidden");
  if (voiceLabel) voiceLabel.textContent = "Uploading...";
  if (voiceProgress) voiceProgress.classList.remove("hidden");
  if (voiceProgressBar) voiceProgressBar.style.transform = "scaleX(0)";
  if (voiceProgressText) voiceProgressText.textContent = "Uploading... 0%";
  if (voiceCancelBtn) voiceCancelBtn.disabled = true;
  if (voiceStopBtn) voiceStopBtn.disabled = true;
  if (targetFriend) {
    const tempId = createClientTempId();
    voiceState.pendingTempId = tempId;
    queuePendingMessage({ to: targetFriend, text: "Uploading voice message...", clientTempId: tempId }, { queue: false, updateFriends: false });
  }
  try {
    const formData = new FormData();
    formData.append("voice", blob, `voice-${Date.now()}.webm`);
    const data = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/upload-voice");
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.max(0, Math.min(1, evt.loaded / evt.total));
        if (voiceProgressBar) voiceProgressBar.style.transform = `scaleX(${pct})`;
        if (voiceProgressText) voiceProgressText.textContent = `Uploading... ${Math.round(pct * 100)}%`;
      };
      xhr.onload = () => {
        const isOk = xhr.status >= 200 && xhr.status < 300;
        let payload = {};
        try { payload = JSON.parse(xhr.responseText || "{}"); } catch (_) {}
        if (!isOk) {
          reject(new Error(payload?.error || "Upload failed"));
          return;
        }
        resolve(payload);
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });
    if (!data?.url) throw new Error("No URL returned");
    if (voiceState.pendingTempId) {
      const tempId = voiceState.pendingTempId;
      voiceState.pendingTempId = "";
      updatePendingMessageText(tempId, data.url);
      const pendingMsg = pendingByTempId.get(tempId);
      if (pendingMsg) {
        friends = friends.map((f) =>
          normalizeName(f.username) === normalizeName(targetFriend)
            ? { ...f, lastMessage: pendingMsg.text, lastFrom: me, lastTimestamp: pendingMsg.timestamp }
            : f
        );
        renderFriends();
      }
      sendMessagePayload({ to: targetFriend, text: data.url, clientTempId: tempId }, { optimistic: false });
    } else {
      sendMessagePayload({ to: targetFriend, text: data.url });
    }
    showToast("Voice message sent", "success");
  } catch (err) {
    console.error(err);
    if (voiceState.pendingTempId) {
      removePendingMessage(voiceState.pendingTempId);
      voiceState.pendingTempId = "";
    }
    showToast("Voice upload failed", "error");
  } finally {
    voiceState.uploading = false;
    if (voiceProgress) voiceProgress.classList.add("hidden");
    if (voiceCancelBtn) voiceCancelBtn.disabled = false;
    if (voiceStopBtn) voiceStopBtn.disabled = false;
    if (voiceStatus) voiceStatus.classList.add("hidden");
  }
}

function stopVoiceRecording(cancelled = false) {
  if (!voiceState.isRecording) return;
  voiceState.isRecording = false;
  voiceState.cancelNext = cancelled;
  if (voiceState.timeout) clearTimeout(voiceState.timeout);
  voiceState.timeout = null;
  if (voiceState.recorder && voiceState.recorder.state !== "inactive") {
    voiceState.recorder.stop();
  }
  if (voiceBtn) {
    voiceBtn.classList.remove("recording");
    voiceBtn.setAttribute("aria-pressed", "false");
  }
}

async function startVoiceRecording() {
  if (!voiceBtn) return;
  if (!activeFriend) {
    showToast("Choose a friend before recording.", "error");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Voice recording not supported in this browser.", "error");
    return;
  }
  if (voiceState.uploading) {
    showToast("Voice upload in progress. Please wait.", "info");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    voiceState.stream = stream;
    voiceState.recorder = recorder;
    voiceState.chunks = [];
    voiceState.isRecording = true;
    voiceState.cancelNext = false;
    voiceState.startedAt = Date.now();

    recorder.ondataavailable = (evt) => {
      if (evt?.data?.size > 0) voiceState.chunks.push(evt.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(voiceState.chunks, { type: "audio/webm" });
      const cancelled = voiceState.cancelNext;
      resetVoiceState();
      if (cancelled) {
        showToast("Recording discarded", "info");
        return;
      }
      await uploadVoiceBlob(blob);
    };

    recorder.start();
    voiceBtn.classList.add("recording");
    voiceBtn.setAttribute("aria-pressed", "true");
    voiceBtn.title = "Stop recording";
    if (voiceStatus) voiceStatus.classList.remove("hidden");
    if (voiceLabel) voiceLabel.textContent = "Recording...";
    if (voiceTimer) voiceTimer.textContent = "0:00";
    if (voiceProgress) voiceProgress.classList.add("hidden");
    if (voiceProgressBar) voiceProgressBar.style.transform = "scaleX(0)";
    if (voiceProgressText) voiceProgressText.textContent = "Uploading... 0%";
    if (voiceCancelBtn) voiceCancelBtn.disabled = false;
    if (voiceStopBtn) voiceStopBtn.disabled = false;

    if (voiceState.timerId) clearInterval(voiceState.timerId);
    voiceState.timerId = setInterval(() => {
      if (!voiceState.startedAt) return;
      const secs = Math.max(0, Math.floor((Date.now() - voiceState.startedAt) / 1000));
      const mins = Math.floor(secs / 60);
      const rem = String(secs % 60).padStart(2, "0");
      if (voiceTimer) voiceTimer.textContent = `${mins}:${rem}`;
    }, 500);

    voiceState.timeout = setTimeout(() => {
      showToast("Recording auto-stopped at 60s", "info");
      stopVoiceRecording();
    }, 60000);
  } catch (err) {
    console.error(err);
    resetVoiceState();
    showToast("Microphone permission blocked.", "error");
  }
}

function getCallPeerDisplayName(peer) {
  if (!peer) return "Friend";
  const friend = findFriend(peer);
  return friend ? getFriendDisplayName(friend) : peer;
}

function getCallStatusLabel() {
  if (callState.status === "outgoing") return "Calling...";
  if (callState.status === "ringing") return "Ringing...";
  if (callState.status === "incoming") return "Incoming call";
  if (callState.status === "connecting") return "Connecting...";
  if (callState.status === "reconnecting") return "Reconnecting...";
  if (callState.status === "active") return "In call";
  return "Call";
}

function getCallDurationSeconds() {
  if (!callState.startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - callState.startedAt) / 1000));
}

function updateCallTimer() {
  if (!callDurationText && !callMiniTime) return;
  if (!callState.startedAt) {
    if (callDurationText) callDurationText.classList.add("hidden");
    if (callMiniTime) callMiniTime.classList.add("hidden");
    return;
  }
  const formatted = formatCallDuration(getCallDurationSeconds());
  if (callDurationText) {
    callDurationText.textContent = formatted;
    callDurationText.classList.remove("hidden");
  }
  if (callMiniTime) {
    callMiniTime.textContent = formatted;
    callMiniTime.classList.remove("hidden");
  }
}

function startCallTimer() {
  if (callState.startedAt) return;
  callState.startedAt = Date.now();
  updateCallTimer();
  callState.timerId = setInterval(updateCallTimer, 1000);
}

function stopCallTimer() {
  if (callState.timerId) clearInterval(callState.timerId);
  callState.timerId = null;
  callState.startedAt = 0;
  if (callDurationText) {
    callDurationText.textContent = "00:00";
    callDurationText.classList.add("hidden");
  }
  if (callMiniTime) {
    callMiniTime.textContent = "00:00";
    callMiniTime.classList.add("hidden");
  }
}

function clearReconnectTimer() {
  if (callState.reconnectTimer) clearTimeout(callState.reconnectTimer);
  callState.reconnectTimer = null;
}

function clearCallRingTimeout() {
  if (callState.ringTimeoutTimer) clearTimeout(callState.ringTimeoutTimer);
  callState.ringTimeoutTimer = null;
}

function clearOfferRetry(preserveOffer = false) {
  if (callState.offerRetryTimer) clearTimeout(callState.offerRetryTimer);
  callState.offerRetryTimer = null;
  callState.offerRetryCount = 0;
  if (!preserveOffer) callState.pendingLocalOffer = null;
}

function clearAnswerRetry(preserveAnswer = false) {
  if (callState.answerRetryTimer) clearTimeout(callState.answerRetryTimer);
  callState.answerRetryTimer = null;
  callState.answerRetryCount = 0;
  if (!preserveAnswer) callState.pendingLocalAnswer = null;
}

function startOutgoingCallTimeout() {
  clearCallRingTimeout();
  callState.ringTimeoutTimer = setTimeout(() => {
    if (!callState.isCaller || !["outgoing", "ringing", "connecting"].includes(callState.status)) return;
    showToast("Call request timed out.", "info");
    maybeSendCallLog("unavailable");
    resetCallState();
  }, CALL_RING_TIMEOUT_MS);
}

function scheduleOfferRetry() {
  if (!callState.pendingLocalOffer || !callState.peer) return;
  if (!["outgoing", "ringing", "connecting"].includes(callState.status)) return;

  if (callState.offerRetryCount >= CALL_SIGNAL_MAX_ATTEMPTS) {
    showToast("Unable to reach your friend right now.", "error");
    maybeSendCallLog("unavailable");
    resetCallState();
    return;
  }

  callState.offerRetryCount += 1;
  if (!callState.inviteAcknowledged) {
    socket.emit("call_invite", { to: callState.peer, type: callState.mediaType });
  }
  socket.emit("call_signal", {
    to: callState.peer,
    type: "offer",
    sdp: callState.pendingLocalOffer,
  });

  if (callState.offerRetryTimer) clearTimeout(callState.offerRetryTimer);
  callState.offerRetryTimer = setTimeout(scheduleOfferRetry, CALL_SIGNAL_RETRY_MS);
}

function startOfferRetry(localDescription) {
  if (!localDescription) return;
  callState.pendingLocalOffer = localDescription;
  clearOfferRetry(true);
  scheduleOfferRetry();
}

function scheduleAnswerRetry() {
  if (!callState.pendingLocalAnswer || !callState.peer) return;
  if (callState.status === "idle" || callState.status === "active") return;

  if (callState.answerRetryCount >= CALL_SIGNAL_MAX_ATTEMPTS) {
    showToast("Couldn't complete call handshake.", "error");
    socket.emit("call_reject", { to: callState.peer });
    resetCallState();
    return;
  }

  callState.answerRetryCount += 1;
  socket.emit("call_signal", {
    to: callState.peer,
    type: "answer",
    sdp: callState.pendingLocalAnswer,
  });

  if (callState.answerRetryTimer) clearTimeout(callState.answerRetryTimer);
  callState.answerRetryTimer = setTimeout(scheduleAnswerRetry, CALL_SIGNAL_RETRY_MS);
}

function startAnswerRetry(localDescription) {
  if (!localDescription) return;
  callState.pendingLocalAnswer = localDescription;
  clearAnswerRetry(true);
  scheduleAnswerRetry();
}

function scheduleReconnectTimeout() {
  if (callState.reconnectTimer) return;
  callState.reconnectTimer = setTimeout(() => {
    if (callState.status !== "reconnecting") return;
    showToast("Call lost.", "info");
    maybeSendCallLog("ended");
    resetCallState();
  }, 8000);
}

function maybeSendCallLog(status) {
  if (!callState.isCaller || !callState.peer || callState.logSent) return;
  const duration = status === "ended" ? getCallDurationSeconds() : 0;
  const payload = buildCallLogPayload(status, "outgoing", duration, callState.mediaType);
  const tempId = createClientTempId();
  const target = callState.peer;
  if (activeFriend && normalizeName(activeFriend) === normalizeName(target)) {
    queuePendingMessage({ to: target, text: payload, clientTempId: tempId }, { queue: false });
  }
  socket.emit("private_message", { to: target, text: payload, clientTempId: tempId });
  callState.logSent = true;
}

function applyVideoState() {
  if (callState.localStream) {
    callState.localStream.getVideoTracks().forEach((track) => {
      track.enabled = callState.videoEnabled;
    });
  }
  if (callLocalVideo) {
    const hasVideo = Boolean(callState.localStream && callState.localStream.getVideoTracks().length);
    callLocalVideo.classList.toggle("hidden", !callState.videoEnabled || !hasVideo);
  }
}

function setCallMinimized(value) {
  callState.minimized = Boolean(value);
  updateCallUi();
}

function updateCallUi() {
  if (!callModal) return;
  const show = callState.status !== "idle" && !callState.minimized;
  callModal.classList.toggle("hidden", !show);
  callModal.setAttribute("aria-hidden", show ? "false" : "true");
  callModal.classList.toggle("video", callState.mediaType === "video");
  if (callPeerName) callPeerName.textContent = getCallPeerDisplayName(callState.peer);
  if (callAvatar) {
    const displayName = getCallPeerDisplayName(callState.peer);
    const trimmed = String(displayName || "").trim();
    callAvatar.textContent = trimmed ? trimmed.slice(0, 2).toUpperCase() : "?";
  }
  if (callMiniAvatar) {
    const displayName = getCallPeerDisplayName(callState.peer);
    const trimmed = String(displayName || "").trim();
    callMiniAvatar.textContent = trimmed ? trimmed.slice(0, 2).toUpperCase() : "?";
  }
  if (callBadge) {
    callBadge.textContent = callState.mediaType === "video" ? "VIDEO CALL" : "VOICE CALL";
  }
  if (callMinimizeBtn) {
    callMinimizeBtn.style.display = callState.status === "incoming" ? "none" : "inline-flex";
    callMinimizeBtn.disabled = callState.status === "idle";
  }

  const statusLabel = getCallStatusLabel();
  if (callStatusText) callStatusText.textContent = statusLabel;
  if (callMiniName) callMiniName.textContent = getCallPeerDisplayName(callState.peer);
  if (callMiniStatus) callMiniStatus.textContent = statusLabel;
  if (callMini) {
    callMini.classList.toggle("hidden", callState.status === "idle" || !callState.minimized);
  }

  if (callAcceptBtn) callAcceptBtn.style.display = callState.status === "incoming" ? "inline-flex" : "none";
  if (callRejectBtn) callRejectBtn.style.display = callState.status === "incoming" ? "inline-flex" : "none";
  if (callHangupBtn) {
    const showHangup = ["outgoing", "ringing", "connecting", "reconnecting", "active"].includes(callState.status);
    callHangupBtn.style.display = showHangup ? "inline-flex" : "none";
    callHangupBtn.textContent = ["outgoing", "ringing"].includes(callState.status) ? "Cancel" : "End call";
  }

  const controlsEnabled = callState.status !== "idle";
  if (callMuteBtn) {
    callMuteBtn.disabled = !controlsEnabled;
    callMuteBtn.classList.toggle("muted", callState.muted);
    callMuteBtn.classList.toggle("active", callState.muted);
    callMuteBtn.setAttribute("aria-pressed", callState.muted ? "true" : "false");
    const label = callMuteBtn.querySelector("span");
    if (label) label.textContent = callState.muted ? "Unmute" : "Mute";
  }
  if (callSpeakerBtn) {
    callSpeakerBtn.disabled = !controlsEnabled;
    callSpeakerBtn.classList.toggle("active", callState.speakerOn);
    callSpeakerBtn.setAttribute("aria-pressed", callState.speakerOn ? "true" : "false");
    const label = callSpeakerBtn.querySelector("span");
    if (label) label.textContent = callState.speakerOn ? "Speaker" : "Speaker off";
  }
  if (callCameraBtn) {
    const showVideo = callState.mediaType === "video";
    const hasLocalVideo = Boolean(callState.localStream && callState.localStream.getVideoTracks().length);
    callCameraBtn.style.display = showVideo ? "inline-flex" : "none";
    callCameraBtn.disabled = !controlsEnabled || !showVideo || !hasLocalVideo;
    callCameraBtn.classList.toggle("active", callState.videoEnabled);
    callCameraBtn.setAttribute("aria-pressed", callState.videoEnabled ? "true" : "false");
    const label = callCameraBtn.querySelector("span");
    if (label) label.textContent = callState.videoEnabled ? "Camera" : "Camera off";
  }
  if (callFlipBtn) {
    const showVideo = callState.mediaType === "video";
    callFlipBtn.style.display = showVideo ? "inline-flex" : "none";
    const hasLocalVideo = Boolean(callState.localStream && callState.localStream.getVideoTracks().length);
    callFlipBtn.disabled = !controlsEnabled || !showVideo || !hasLocalVideo;
  }
  updateCallTimer();
}

function resetCallState() {
  clearCallRingTimeout();
  clearOfferRetry();
  clearAnswerRetry();
  clearReconnectTimer();
  stopCallTimer();
  if (callState.pc) {
    callState.pc.onicecandidate = null;
    callState.pc.ontrack = null;
    callState.pc.onconnectionstatechange = null;
    callState.pc.close();
  }
  if (callState.localStream) {
    callState.localStream.getTracks().forEach((t) => t.stop());
  }
  callState.status = "idle";
  callState.peer = "";
  callState.isCaller = false;
  callState.pc = null;
  callState.localStream = null;
  callState.remoteStream = null;
  callState.pendingOffer = null;
  callState.pendingLocalOffer = null;
  callState.pendingLocalAnswer = null;
  callState.lastRemoteOfferSdp = "";
  callState.lastRemoteAnswerSdp = "";
  callState.pendingCandidates = [];
  callState.muted = false;
  callState.speakerOn = true;
  callState.inviteAcknowledged = false;
  callState.mediaType = "audio";
  callState.videoEnabled = true;
  callState.videoFacing = "user";
  callState.minimized = false;
  callState.logSent = false;
  callState.reconnectTimer = null;
  callState.ringTimeoutTimer = null;
  callState.offerRetryTimer = null;
  callState.answerRetryTimer = null;
  callState.offerRetryCount = 0;
  callState.answerRetryCount = 0;
  if (callRemoteAudio) {
    callRemoteAudio.srcObject = null;
    callRemoteAudio.muted = false;
    callRemoteAudio.volume = 1;
  }
  if (callRemoteVideo) {
    callRemoteVideo.srcObject = null;
    callRemoteVideo.classList.add("hidden");
  }
  if (callLocalVideo) {
    callLocalVideo.srcObject = null;
    callLocalVideo.classList.add("hidden");
  }
  updateCallUi();
}

function applyMuteState() {
  if (callState.localStream) {
    callState.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !callState.muted;
    });
  }
}

function applySpeakerState() {
  if (callRemoteAudio) {
    callRemoteAudio.muted = !callState.speakerOn;
    callRemoteAudio.volume = callState.speakerOn ? 1 : 0;
  }
  if (callRemoteVideo) {
    callRemoteVideo.muted = true;
  }
}

function toggleMute() {
  callState.muted = !callState.muted;
  applyMuteState();
  updateCallUi();
}

function toggleSpeaker() {
  callState.speakerOn = !callState.speakerOn;
  applySpeakerState();
  updateCallUi();
}

function toggleCamera() {
  if (callState.mediaType !== "video") return;
  if (!callState.localStream) return;
  callState.videoEnabled = !callState.videoEnabled;
  applyVideoState();
  updateCallUi();
}

async function switchCamera() {
  if (callState.mediaType !== "video") return;
  if (!navigator.mediaDevices?.getUserMedia) return;
  const nextFacing = callState.videoFacing === "user" ? "environment" : "user";
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: nextFacing },
    });
    const newTrack = newStream.getVideoTracks()[0];
    if (!newTrack) return;
    callState.videoFacing = nextFacing;
    newTrack.enabled = callState.videoEnabled;

    if (!callState.localStream) {
      callState.localStream = new MediaStream();
    }

    const oldTracks = callState.localStream.getVideoTracks();
    oldTracks.forEach((track) => {
      callState.localStream.removeTrack(track);
      track.stop();
    });
    callState.localStream.addTrack(newTrack);

    if (callState.pc) {
      const sender = callState.pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) {
        await sender.replaceTrack(newTrack);
      } else {
        callState.pc.addTrack(newTrack, callState.localStream);
      }
    }

    if (callLocalVideo) {
      callLocalVideo.srcObject = callState.localStream;
      callLocalVideo.classList.toggle("hidden", !callState.videoEnabled);
      callLocalVideo.play().catch(() => {});
    }
  } catch (err) {
    console.error(err);
    showToast("Unable to switch camera.", "error");
  }
}

function createCallPeerConnection() {
  const pc = new RTCPeerConnection({ iceServers: callIceServers });

  pc.onicecandidate = (event) => {
    if (!event.candidate || !callState.peer) return;
    socket.emit("call_signal", {
      to: callState.peer,
      type: "ice",
      candidate: event.candidate,
    });
  };

  pc.ontrack = (event) => {
    if (!callState.remoteStream) {
      callState.remoteStream = new MediaStream();
    }
    callState.remoteStream.addTrack(event.track);
    if (callRemoteAudio) {
      callRemoteAudio.srcObject = callState.remoteStream;
      callRemoteAudio.play().catch(() => {});
      applySpeakerState();
    }
    if (callRemoteVideo) {
      callRemoteVideo.srcObject = callState.remoteStream;
      if (callState.remoteStream.getVideoTracks().length) {
        callRemoteVideo.classList.remove("hidden");
        callRemoteVideo.play().catch(() => {});
      }
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") {
      callState.status = "active";
      clearCallRingTimeout();
      clearOfferRetry();
      clearAnswerRetry();
      clearReconnectTimer();
      startCallTimer();
      updateCallUi();
      return;
    }
    if (pc.connectionState === "disconnected") {
      callState.status = "reconnecting";
      updateCallUi();
      scheduleReconnectTimeout();
      return;
    }
    if (["failed", "closed"].includes(pc.connectionState)) {
      showToast("Call disconnected.", "info");
      maybeSendCallLog("ended");
      resetCallState();
    }
  };

  return pc;
}

function flushPendingCandidates() {
  if (!callState.pc || !callState.pc.remoteDescription) return;
  const pending = callState.pendingCandidates.splice(0, callState.pendingCandidates.length);
  pending.forEach((candidate) => {
    callState.pc.addIceCandidate(candidate).catch(() => {});
  });
}

async function applyRemoteOffer(offer) {
  if (!callState.pc || !offer) return;
  const offerSdpText = typeof offer?.sdp === "string" ? offer.sdp : "";
  if (offerSdpText) callState.lastRemoteOfferSdp = offerSdpText;
  await callState.pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await callState.pc.createAnswer();
  await callState.pc.setLocalDescription(answer);
  startAnswerRetry(callState.pc.localDescription);
  flushPendingCandidates();
}

async function startCall(mediaType = "audio") {
  if (!socketAvailable) {
    showToast("Realtime connection not available.", "error");
    return;
  }
  if (!activeFriend) {
    showToast("Choose a friend first.", "error");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Calling not supported in this browser.", "error");
    return;
  }
  if (!window.RTCPeerConnection) {
    showToast("Calling not supported in this browser.", "error");
    return;
  }
  if (callState.status !== "idle") {
    showToast("You're already in a call.", "error");
    return;
  }

  await ensureCallIceServers();

  callState.peer = activeFriend;
  callState.isCaller = true;
  callState.status = "outgoing";
  callState.mediaType = mediaType === "video" ? "video" : "audio";
  callState.videoEnabled = callState.mediaType === "video";
  callState.videoFacing = "user";
  callState.inviteAcknowledged = false;
  callState.minimized = false;
  callState.logSent = false;
  callState.pendingLocalOffer = null;
  callState.pendingLocalAnswer = null;
  clearOfferRetry();
  clearAnswerRetry();
  stopCallTimer();
  updateCallUi();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callState.mediaType === "video" ? { facingMode: callState.videoFacing } : false,
    });
    callState.localStream = stream;
    callState.pc = createCallPeerConnection();
    stream.getTracks().forEach((track) => callState.pc.addTrack(track, stream));
    applyMuteState();
    applyVideoState();
    if (callLocalVideo) {
      callLocalVideo.srcObject = stream;
      if (stream.getVideoTracks().length) {
        callLocalVideo.classList.remove("hidden");
        callLocalVideo.play().catch(() => {});
      }
    }

    const offer = await callState.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callState.mediaType === "video",
    });
    await callState.pc.setLocalDescription(offer);
    startOutgoingCallTimeout();
    startOfferRetry(callState.pc.localDescription);
  } catch (err) {
    console.error(err);
    showToast("Camera or microphone permission blocked.", "error");
    if (callState.peer) socket.emit("call_cancel", { to: callState.peer });
    resetCallState();
  }
}

function startVoiceCall() {
  startCall("audio");
}

function startVideoCall() {
  startCall("video");
}

async function acceptIncomingCall() {
  if (callState.status !== "incoming") return;
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Calling not supported in this browser.", "error");
    return;
  }
  if (!window.RTCPeerConnection) {
    showToast("Calling not supported in this browser.", "error");
    return;
  }

  await ensureCallIceServers();

  callState.status = "connecting";
  callState.inviteAcknowledged = true;
  clearCallRingTimeout();
  clearOfferRetry();
  clearAnswerRetry();
  updateCallUi();
  socket.emit("call_answer", { to: callState.peer });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callState.mediaType === "video" ? { facingMode: callState.videoFacing } : false,
    });
    callState.localStream = stream;
    callState.pc = createCallPeerConnection();
    stream.getTracks().forEach((track) => callState.pc.addTrack(track, stream));
    applyMuteState();
    applyVideoState();
    if (callLocalVideo) {
      callLocalVideo.srcObject = stream;
      if (stream.getVideoTracks().length) {
        callLocalVideo.classList.remove("hidden");
        callLocalVideo.play().catch(() => {});
      }
    }
    if (callState.pendingOffer) {
      const offer = callState.pendingOffer;
      callState.pendingOffer = null;
      await applyRemoteOffer(offer);
    }
  } catch (err) {
    console.error(err);
    showToast("Camera or microphone permission blocked.", "error");
    socket.emit("call_reject", { to: callState.peer });
    resetCallState();
  }
}

function rejectIncomingCall() {
  if (callState.status !== "incoming") return;
  if (callState.peer) socket.emit("call_reject", { to: callState.peer });
  resetCallState();
}

function hangupCall() {
  if (!callState.peer) {
    resetCallState();
    return;
  }
  const cancelling = ["outgoing", "ringing"].includes(callState.status);
  if (cancelling) {
    socket.emit("call_cancel", { to: callState.peer });
  } else {
    socket.emit("call_end", { to: callState.peer });
  }
  maybeSendCallLog(cancelling ? "cancelled" : "ended");
  resetCallState();
}

async function handleCallSignal(payload) {
  const from = String(payload?.from || "").trim();
  if (!from) return;

  if (!INCOMING_CALLS_ENABLED && callState.status === "idle") {
    socket.emit("call_reject", { to: from });
    return;
  }

  if (callState.status === "idle") {
    callState.peer = from;
    callState.isCaller = false;
    callState.status = "incoming";
    updateCallUi();
  }

  if (normalizeName(from) !== normalizeName(callState.peer)) return;

  if (payload?.type === "offer") {
    if (callState.status === "active") return;
    const incomingOfferSdp = typeof payload?.sdp?.sdp === "string" ? payload.sdp.sdp : "";
    if (
      incomingOfferSdp &&
      incomingOfferSdp === callState.lastRemoteOfferSdp &&
      callState.pendingLocalAnswer
    ) {
      startAnswerRetry(callState.pendingLocalAnswer);
      return;
    }
    callState.pendingOffer = payload.sdp;
    if (callState.pc && callState.status !== "outgoing") {
      const offer = callState.pendingOffer;
      callState.pendingOffer = null;
      await applyRemoteOffer(offer);
    }
    return;
  }

  if (payload?.type === "answer") {
    if (!callState.pc) return;
    const incomingAnswerSdp = typeof payload?.sdp?.sdp === "string" ? payload.sdp.sdp : "";
    if (incomingAnswerSdp && incomingAnswerSdp === callState.lastRemoteAnswerSdp) {
      clearCallRingTimeout();
      clearOfferRetry();
      return;
    }
    await callState.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    if (incomingAnswerSdp) callState.lastRemoteAnswerSdp = incomingAnswerSdp;
    clearCallRingTimeout();
    clearOfferRetry();
    callState.status = "connecting";
    updateCallUi();
    flushPendingCandidates();
    return;
  }

  if (payload?.type === "ice" && payload.candidate) {
    if (callState.pc && callState.pc.remoteDescription) {
      callState.pc.addIceCandidate(payload.candidate).catch(() => {});
    } else {
      callState.pendingCandidates.push(payload.candidate);
    }
  }
}

function createClientTempId() {
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function pendingRetryDelay(attempts) {
  const safeAttempts = Math.max(1, Number(attempts) || 1);
  const backoff = PENDING_RETRY_BASE_MS * Math.pow(1.45, safeAttempts - 1);
  return Math.min(PENDING_RETRY_MAX_MS, Math.round(backoff));
}

function ensurePendingQueueEntry(payload, tempId) {
  if (!payload || !payload.to || !payload.text || !tempId) return null;
  const nextPayload = { ...payload, clientTempId: tempId };
  const existing = pendingQueueByTempId.get(tempId);
  if (existing) {
    existing.payload = nextPayload;
    return existing;
  }

  const entry = {
    tempId,
    payload: nextPayload,
    attempts: 0,
    lastAttemptAt: 0,
    nextAttemptAt: 0,
  };
  pendingQueue.push(entry);
  pendingQueueByTempId.set(tempId, entry);
  return entry;
}

function rerenderPendingMessageRow(tempId) {
  if (!tempId || !messagesEl) return;
  const message = pendingByTempId.get(tempId);
  if (!message) return;
  const row = messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`);
  if (!row) return;
  const replacement = buildMessageElement(message, true);
  row.replaceWith(replacement);
}

function markPendingMessageFailed(tempId, options = {}) {
  if (!tempId) return false;
  const message = pendingByTempId.get(tempId);
  if (!message) {
    // Orphaned queue entries can happen after reloads or reconciliation edge-cases.
    // Drop them so they don't get stuck retrying forever.
    removePendingFromQueue(tempId);
    renderNetworkState();
    return false;
  }
  message.pending = false;
  message.failed = true;
  message.failedAt = new Date().toISOString();
  removePendingFromQueue(tempId);
  rerenderPendingMessageRow(tempId);
  applyMessageSearch();
  renderNetworkState();
  if (options.toast !== false) {
    showToast("Message failed to send. Tap Retry.", "error");
  }
  return true;
}

function retryFailedMessage(tempId, options = {}) {
  if (!tempId) return;
  const message = pendingByTempId.get(tempId);
  if (!message) return;

  message.failed = false;
  message.failedAt = "";
  message.pending = true;

  const payload = {
    to: message.to,
    text: message.text,
    clientTempId: tempId,
  };
  if (message.replyTo) payload.replyTo = message.replyTo;
  if (message.attachment) payload.attachment = message.attachment;

  const entry = ensurePendingQueueEntry(payload, tempId);
  if (!entry) return;
  entry.attempts = 0;
  entry.lastAttemptAt = 0;
  entry.nextAttemptAt = 0;

  rerenderPendingMessageRow(tempId);
  applyMessageSearch();
  if (socketAvailable && socket.connected) {
    sendQueuedMessage(entry);
    if (options.toast !== false) {
      showToast("Retrying message...", "info");
    }
  } else if (options.toast !== false) {
    showToast("Message re-queued. We'll send when online.", "info");
  }
  renderNetworkState();
}

function sendQueuedMessage(entry) {
  if (!entry || !socketAvailable || !socket.connected) return false;
  const pendingMessage = pendingByTempId.get(entry.tempId);
  if (pendingMessage) {
    pendingMessage.failed = false;
    pendingMessage.pending = true;
  }
  socket.emit("private_message", entry.payload);
  entry.attempts += 1;
  entry.lastAttemptAt = Date.now();
  entry.nextAttemptAt = entry.lastAttemptAt + pendingRetryDelay(entry.attempts);
  return true;
}

function removePendingFromQueue(tempId) {
  if (!tempId) return;
  const existing = pendingQueueByTempId.get(tempId);
  if (!existing) return;
  pendingQueueByTempId.delete(tempId);
  const idx = pendingQueue.indexOf(existing);
  if (idx >= 0) pendingQueue.splice(idx, 1);
}

function queuePendingMessage(payload, options = {}) {
  if (!payload || !payload.to || !payload.text) return;
  const shouldQueue = options.queue !== false;
  const shouldUpdateFriends = options.updateFriends !== false;
  const tempId = payload.clientTempId || createClientTempId();
  const timestamp = new Date().toISOString();
  const targetIsActiveThread = Boolean(
    activeFriend && normalizeName(payload.to) === normalizeName(activeFriend)
  );
  const wasAtLatest = targetIsActiveThread ? !hasNewerMessages() : false;

  const message = {
    id: tempId,
    clientTempId: tempId,
    from: me || "You",
    to: payload.to,
    text: payload.text,
    timestamp,
    deliveredAt: null,
    seenAt: null,
    pending: true,
    failed: false,
    replyTo: payload.replyTo || null,
    attachment: normalizeAttachmentPayload(payload.attachment, payload.text),
    reactions: {},
  };

  if (targetIsActiveThread) {
    conversationMessages.push(message);
  }
  if (shouldUpdateFriends) {
    friends = friends.map((f) =>
      normalizeName(f.username) === normalizeName(payload.to)
        ? { ...f, lastMessage: payload.text, lastFrom: me, lastTimestamp: timestamp }
        : f
    );
    renderFriends();
  }
  pendingByTempId.set(tempId, message);
  if (shouldQueue) ensurePendingQueueEntry(payload, tempId);
  renderNetworkState();

  if (targetIsActiveThread && wasAtLatest) {
    messageWindowEnd = conversationMessages.length;
    appendMessage(message);
    if (messagesEl && messagesEl.querySelectorAll("article.message").length > MAX_VISIBLE_MESSAGES) {
      setMessageWindowToLatest();
      renderMessageWindow();
    }
  }
  return tempId;
}

function updatePendingMessageText(tempId, text) {
  if (!tempId) return;
  const msg = pendingByTempId.get(tempId);
  if (!msg) return;
  msg.text = text;
  const row = messagesEl ? messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`) : null;
  if (row) {
    const newRow = buildMessageElement(msg, true);
    row.replaceWith(newRow);
  }
  applyMessageSearch();
}

function updatePendingMessageAttachment(tempId, attachment, fallbackText = "") {
  if (!tempId) return;
  const msg = pendingByTempId.get(tempId);
  if (!msg) return;
  const normalizedAttachment = normalizeAttachmentPayload(attachment, fallbackText || msg.text || "");
  if (!normalizedAttachment) return;
  msg.attachment = normalizedAttachment;
  msg.text = normalizedAttachment.url || fallbackText || msg.text || "";
  const row = messagesEl ? messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`) : null;
  if (row) {
    const newRow = buildMessageElement(msg, true);
    row.replaceWith(newRow);
  }
  applyMessageSearch();
}

function removePendingMessage(tempId) {
  if (!tempId) return;
  pendingByTempId.delete(tempId);
  removePendingFromQueue(tempId);
  const idx = conversationMessages.findIndex((m) => m.clientTempId === tempId || m.id === tempId);
  if (idx >= 0) conversationMessages.splice(idx, 1);
  const row = messagesEl ? messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`) : null;
  if (row) row.remove();
  messageWindowEnd = Math.min(messageWindowEnd, conversationMessages.length);
  applyMessageSearch();
}

function flushPendingQueue(force = false) {
  if (!socketAvailable || !socket.connected) {
    renderNetworkState();
    return;
  }
  if (!pendingQueue.length) {
    renderNetworkState();
    return;
  }
  const now = Date.now();
  const queueSnapshot = pendingQueue.slice();
  let failedAny = false;
  queueSnapshot.forEach((item) => {
    if (item.attempts >= PENDING_RETRY_MAX_ATTEMPTS) {
      if (markPendingMessageFailed(item.tempId, { toast: false })) {
        failedAny = true;
      }
      return;
    }
    if (!force && item.nextAttemptAt > now) return;
    sendQueuedMessage(item);
  });
  if (failedAny) {
    showToast("Some messages failed to send. Tap Retry.", "error");
  }
  renderNetworkState();
}

function sendMessagePayload(payload, options = {}) {
  if (!payload || !payload.to) return;
  const validatedText = validateOutgoingMessageText(payload.text);
  if (validatedText === null || !validatedText) return;
  const outgoingPayload = { ...payload, text: validatedText };
  const normalizedAttachment = normalizeAttachmentPayload(payload.attachment, validatedText);
  if (normalizedAttachment) {
    outgoingPayload.attachment = normalizedAttachment;
  } else if ("attachment" in outgoingPayload) {
    delete outgoingPayload.attachment;
  }
  const tempId = outgoingPayload.clientTempId || createClientTempId();
  let queuedEntry = pendingQueueByTempId.get(tempId);

  if (!socketAvailable || !socket.connected) {
    if (options.optimistic === false) {
      if (pendingByTempId.has(tempId)) {
        queuedEntry = ensurePendingQueueEntry(outgoingPayload, tempId);
        const pendingMessage = pendingByTempId.get(tempId);
        if (pendingMessage) {
          pendingMessage.pending = true;
          pendingMessage.failed = false;
          pendingMessage.text = validatedText;
          pendingMessage.attachment = normalizedAttachment;
        }
        rerenderPendingMessageRow(tempId);
        applyMessageSearch();
      } else {
        queuePendingMessage({ ...outgoingPayload, clientTempId: tempId }, { queue: true });
      }
      renderNetworkState();
      showToast("Message queued. We'll send when you're back online.", "info");
      return tempId;
    }
    queuePendingMessage({ ...outgoingPayload, clientTempId: tempId }, { queue: true });
    showToast("Message queued. We'll send when you're back online.", "info");
    return tempId;
  }

  if (options.optimistic !== false) {
    queuePendingMessage({ ...outgoingPayload, clientTempId: tempId }, { queue: true });
    queuedEntry = pendingQueueByTempId.get(tempId);
  } else {
    queuedEntry = ensurePendingQueueEntry(outgoingPayload, tempId);
    renderNetworkState();
  }
  if (queuedEntry) {
    sendQueuedMessage(queuedEntry);
    renderNetworkState();
  }
  return tempId;
}

function sendActiveMessage() {
  const text = messageInput.value.trim();
  if (!activeFriend) { showToast("Choose a friend first.", "error"); return; }
  if (!text) return;

  if (hasNewerMessages()) {
    showLatestMessages();
  }
  stopLocalTyping();
  const payload = { to: activeFriend, text };
  if (replyTo) payload.replyTo = replyTo;
  const sentTempId = sendMessagePayload(payload);
  if (!sentTempId) return;
  messageInput.value = "";
  removeMessageDraft(activeFriend);
  if (sendButton) sendButton.classList.remove("ready");
  clearReply();

  // Keep scroll pinned to bottom after sending
  scrollToBottom(true);
  scrollState.pinnedToBottom = true;
  keepComposerFocused();
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendActiveMessage();
});
if (retryFailedBtn) {
  retryFailedBtn.addEventListener("click", (event) => {
    event.preventDefault();
    retryAllFailedMessages();
  });
}

if (attachFileBtn && attachFileInput) {
  attachFileBtn.addEventListener("click", () => {
    if (!activeFriend) {
      showToast("Choose a friend before attaching a file.", "error");
      return;
    }
    if (attachmentUploadState.active) {
      showToast("Please wait for the current upload to finish.", "info");
      return;
    }
    attachFileInput.value = "";
    attachFileInput.click();
  });

  attachFileInput.addEventListener("change", async () => {
    const selectedFile = attachFileInput.files && attachFileInput.files[0];
    if (!selectedFile) return;
    await uploadAttachmentFromPicker(selectedFile);
  });
}

if (cameraBtn) {
  cameraBtn.addEventListener("click", () => {
    void openComposerCameraCapture();
  });
}

if (cameraCaptureInput) {
  cameraCaptureInput.addEventListener("change", async () => {
    const selectedPhoto = cameraCaptureInput.files && cameraCaptureInput.files[0];
    if (!selectedPhoto) return;
    await uploadAttachmentFromPicker(selectedPhoto);
  });
}

if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    if (voiceState.isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });
}
if (voiceCancelBtn) {
  voiceCancelBtn.addEventListener("click", () => stopVoiceRecording(true));
}
if (voiceStopBtn) {
  voiceStopBtn.addEventListener("click", () => stopVoiceRecording(false));
}

if (callButton) {
  callButton.addEventListener("click", () => {
    startVoiceCall();
  });
}
if (videoButton) {
  videoButton.addEventListener("click", () => {
    startVideoCall();
  });
}
if (profileCallBtn) {
  profileCallBtn.addEventListener("click", () => {
    startVoiceCall();
  });
}
if (profileVideoBtn) {
  profileVideoBtn.addEventListener("click", () => {
    startVideoCall();
  });
}
if (callMuteBtn) callMuteBtn.addEventListener("click", toggleMute);
if (callSpeakerBtn) callSpeakerBtn.addEventListener("click", toggleSpeaker);
if (callCameraBtn) callCameraBtn.addEventListener("click", toggleCamera);
if (callFlipBtn) callFlipBtn.addEventListener("click", switchCamera);
if (callAcceptBtn) callAcceptBtn.addEventListener("click", acceptIncomingCall);
if (callRejectBtn) callRejectBtn.addEventListener("click", rejectIncomingCall);
if (callHangupBtn) callHangupBtn.addEventListener("click", hangupCall);
if (callMinimizeBtn) callMinimizeBtn.addEventListener("click", () => setCallMinimized(true));
if (callMiniEnd) {
  callMiniEnd.addEventListener("click", (event) => {
    event.stopPropagation();
    hangupCall();
  });
}
if (callMini) {
  callMini.addEventListener("click", (event) => {
    if (callMiniEnd && callMiniEnd.contains(event.target)) return;
    setCallMinimized(false);
  });
}

messageInput.addEventListener("input", () => {
  if (messageInput.value.length > COMPOSER_MAX_MESSAGE_LENGTH) {
    messageInput.value = messageInput.value.slice(0, COMPOSER_MAX_MESSAGE_LENGTH);
  }
  if (sendButton) {
    sendButton.classList.toggle("ready", messageInput.value.trim().length > 0);
  }
  if (!activeFriend) return;
  setMessageDraft(activeFriend, messageInput.value);
  messageInput.value.trim() ? markLocalTyping() : stopLocalTyping();
});

if (messageSearchInput) {
  messageSearchInput.addEventListener("input", applyMessageSearch);
  messageSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      jumpSearchResult(e.shiftKey ? -1 : 1);
    }
  });
}
if (messageSearchPrev) {
  messageSearchPrev.addEventListener("click", () => jumpSearchResult(-1));
}
if (messageSearchNext) {
  messageSearchNext.addEventListener("click", () => jumpSearchResult(1));
}
if (messageSearchToggle) {
  messageSearchToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (searchPanelOpen) {
      closeMessageSearchPanel();
    } else {
      openMessageSearchPanel();
    }
  });
}
if (messageSearchPanel) {
  messageSearchPanel.addEventListener("click", (e) => e.stopPropagation());
}
if (messageSearchClear) {
  messageSearchClear.addEventListener("click", () => {
    if (messageSearchInput) messageSearchInput.value = "";
    applyMessageSearch();
    if (messageSearchInput) messageSearchInput.focus();
  });
}
if (contactsRequestsBtn) {
  contactsRequestsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !contactsRequestsPanel?.classList.contains("is-open");
    setRequestsPanelOpen(next);
  });
}
document.addEventListener("click", () => {
  if (searchPanelOpen) closeMessageSearchPanel();
});
document.addEventListener("click", (e) => {
  if (!contactsRequestsPanel || !contactsRequestsBtn) return;
  if (!contactsRequestsPanel.classList.contains("is-open")) return;
  if (e.target.closest("#contactsRequestsPanel") || e.target.closest("#contactsRequestsBtn")) return;
  setRequestsPanelOpen(false);
});
document.addEventListener("keydown", (e) => {
  const isFindShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f";
  if (isFindShortcut) {
    e.preventDefault();
    openMessageSearchPanel();
    return;
  }

  if (e.key === "Escape" && contactsRequestsPanel?.classList.contains("is-open")) {
    setRequestsPanelOpen(false);
    return;
  }
  if (e.key === "Escape" && searchPanelOpen) {
    if (getSearchQuery()) {
      if (messageSearchInput) messageSearchInput.value = "";
      applyMessageSearch();
      return;
    }
    closeMessageSearchPanel();
  }
});

// Stop typing indicator when input loses focus
if (messageInput) {
  messageInput.addEventListener("blur", () => stopLocalTyping());

  // Allow Shift+Enter to send (optional quality-of-life)
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !messageInput.disabled) {
      e.preventDefault();
      sendActiveMessage();
    }
  });
}

setInterval(() => {
  if (!pendingQueue.length) return;
  flushPendingQueue();
}, PENDING_RETRY_TICK_MS);

// ─── Socket events ────────────────────────────────────────────────────────────

socket.on("register_success", (data) => {
  const previousActiveFriend = activeFriend;
  persistActiveMessageDraft();
  me           = data.username;
  ensureMessageDraftsLoaded(true);
  friends      = data.friends  || [];
  requests     = data.requests || [];
  activeFriend = "";
  setActiveChatTarget("");

  if (data.profile) {
    myProfile.avatarId    = data.profile.avatarId || "";
    myProfile.displayName = data.profile.displayName || "";
    myProfile.age         = data.profile.age || "";
    myProfile.gender      = data.profile.gender || "";
    myProfile.bio         = data.profile.bio || "";
  } else {
    myProfile.avatarId    = "";
    myProfile.displayName = "";
    myProfile.age         = "";
    myProfile.gender      = "";
    myProfile.bio         = "";
  }
  window._novynProfile  = myProfile;
  renderMyName();
  applyMyAvatar();
  syncSettingsPanel();
  clearSidebarSearch();
  if (passwordInput) passwordInput.value = "";
  if (activeFriendLabel) activeFriendLabel.textContent = "Select a friend";
  renderActiveFriendPresence();
  syncRemoveFriendButton();

  if (loginCard) loginCard.classList.add("hidden");
  if (chatLayout) chatLayout.classList.remove("hidden");

  clearUsernameSuggestions();
  setLoginLoading(false);
  resumeSocketSession._pending = false;
  setComposerEnabled(false);
  renderMessagesEmptyState(EMPTY_CONVERSATION_HINT);
  setNetworkState("Connected", "connected");

  renderRequests();
  renderFriends();
  renderDiscover();
  if (sidebarView === "discover") {
    requestDiscoverOnline();
  }
  if (
    previousActiveFriend &&
    friends.some((friend) => normalizeName(friend.username) === normalizeName(previousActiveFriend))
  ) {
    setActiveFriend(previousActiveFriend);
  }
  if (!hasGreeted) {
    hasGreeted = true;
    showToast(`Welcome to Novyn, @${me}! ✨`, "success");
  }
  ensurePushSubscription(false);
});

socket.on("username_unavailable", (data) => {
  const requested   = data?.requested   || "This username";
  const suggestions = data?.suggestions || [];
  showUsernameSuggestions(requested, suggestions);
  resumeSocketSession._pending = false;
  setLoginLoading(false);
  showToast("Username already taken.", "error");
});

socket.on("auth_failed", (data) => {
  const message     = data?.message     || "Authentication failed.";
  const suggestions = data?.suggestions || [];
  resumeSocketSession._pending = false;
  if (isDashboardPage) {
    clearStoredSession();
    if (!logoutInProgress) {
      showToast(message, "error");
    }
    redirectToLogin();
    return;
  }
  if (Array.isArray(suggestions) && suggestions.length) {
    showUsernameSuggestions(usernameInput ? usernameInput.value.trim() || "This username" : "This username", suggestions);
  }
  setLoginLoading(false);
  showToast(message, "error");
});

socket.on("friend_suggestions", (data) => {
  const query = String(data?.query || "").trim();
  const suggestions = data?.suggestions || [];
  if (!friendInput) return;
  const current = friendInput.value.trim();
  if (!query || normalizeSearchText(query) !== normalizeSearchText(current)) return;
  showFriendSuggestions(query, suggestions);
});

socket.on("discover_online", (data) => {
  setDiscoverUsers(data?.users || []);
});

socket.on("friend_request_received", (data) => {
  showToast(`💬 ${data.from} sent you a friend request`);
  if (!requests.includes(data.from)) {
    requests = [...requests, data.from];
    renderRequests();
    renderDiscover();
  }
  playIncomingPing();
});

socket.on("friend_request_sent", (data) => {
  showToast(`✓ Request sent to ${data.to}`, "success");
  const target = String(data?.to || "").trim();
  if (target) {
    discoverUsers = discoverUsers.filter((user) => normalizeName(user?.username) !== normalizeName(target));
    renderDiscover();
  }
});

socket.on("requests_updated", (data) => {
  requests = data.requests || [];
  renderRequests();
  renderDiscover();
});

socket.on("friend_request_accepted", (data) => {
  showToast(`🎉 ${data.by} is now your friend!`, "success");
});

socket.on("friend_list_updated", (data) => {
  friends = data.friends || [];
  friends.forEach((friend) => {
    const rawText = friend?.lastMessage || "";
    if (!rawText) return;
    if (!parseCallLogPayload(rawText)) return;
    addCallHistoryEntry({
      friend: friend.username || "",
      text: rawText,
      timestamp: friend.lastTimestamp || "",
      from: friend.lastFrom || friend.username || "",
    });
  });

  // If current chat partner was removed, reset
  if (activeFriend) {
    const stillThere = friends.some(
      (f) => normalizeName(f.username) === normalizeName(activeFriend)
    );
    if (!stillThere) {
      removeMessageDraft(activeFriend);
      activeFriend                  = "";
      conversationMessages          = [];
      activeFriendLabel.textContent = "Select a friend";
      setComposerEnabled(false);
      if (messageInput) messageInput.value = "";
      if (sendButton) sendButton.classList.remove("ready");
      renderMessagesEmptyState(EMPTY_CONVERSATION_HINT);
      resetMessageSearch();
      renderActiveFriendPresence();
      syncRemoveFriendButton();
    }
  }

  renderFriends();
  renderCallHistory();
  renderDiscover();
  if (sidebarView === "discover") {
    requestDiscoverOnline();
  }
});

socket.on("friend_removed", (data) => {
  const removedUsername = String(data?.username || "").trim();
  const removedKey = normalizeName(removedUsername);
  const activeKey = normalizeName(activeFriend);
  if (removedUsername) removeMessageDraft(removedUsername);

  if (activeFriend && removedKey && activeKey === removedKey) {
    stopLocalTyping(activeFriend);
    activeFriend = "";
    setActiveChatTarget("");
    conversationMessages = [];
    clearReply();
    activeFriendLabel.textContent = "Select a friend";
    setComposerEnabled(false);
    if (messageInput) messageInput.value = "";
    if (sendButton) sendButton.classList.remove("ready");
    hideTypingIndicator();
    renderMessagesEmptyState(EMPTY_CONVERSATION_HINT);
    resetMessageSearch();
    renderActiveFriendPresence();
    syncRemoveFriendButton();
  }

  const actor = String(data?.by || "").trim();
  if (actor && normalizeName(actor) !== normalizeName(me)) {
    showToast(`${actor} removed you from friends.`);
  } else if (removedUsername) {
    showToast(`${removedUsername} removed from friends.`);
  }
});

socket.on("friend_username_changed", (data) => {
  const oldUsername = String(data?.oldUsername || "").trim();
  const newUsername = String(data?.newUsername || "").trim();
  if (!oldUsername || !newUsername) return;
  const oldKey = normalizeName(oldUsername);
  const newKey = normalizeName(newUsername);
  renameMessageDraft(oldUsername, newUsername);

  if (activeFriend && normalizeName(activeFriend) === oldKey) {
    activeFriend = newUsername;
    setActiveChatTarget(activeFriend);
  }

  requests = requests.map((name) =>
    normalizeName(name) === oldKey ? newUsername : name
  );
  friends = friends.map((f) =>
    normalizeName(f.username) === oldKey ? { ...f, username: newUsername } : f
  );

  if (conversationMessages.length) {
    let touched = false;
    for (const msg of conversationMessages) {
      if (normalizeName(msg.from) === oldKey) { msg.from = newUsername; touched = true; }
      if (normalizeName(msg.to) === oldKey) { msg.to = newUsername; touched = true; }
      if (normalizeName(msg.fromKey) === oldKey) { msg.fromKey = newKey; touched = true; }
      if (normalizeName(msg.toKey) === oldKey) { msg.toKey = newKey; touched = true; }
      if (msg.replyTo && normalizeName(msg.replyTo.from) === oldKey) {
        msg.replyTo.from = newUsername;
        touched = true;
      }
    }
    if (touched) renderMessages(conversationMessages);
  }

  renderRequests();
  renderFriends();
  renderActiveFriendPresence();
  syncInfoPanel();
});

socket.on("username_changed", (data) => {
  const oldUsername = String(data?.oldUsername || "").trim();
  const newUsername = String(data?.newUsername || "").trim();
  if (!newUsername) return;
  const oldKey = normalizeName(oldUsername || me);
  const newKey = normalizeName(newUsername);
  persistActiveMessageDraft();
  migrateMessageDraftStoreOwner(oldKey, newKey);
  if (normalizeName(me) === oldKey) {
    me = newUsername;
    ensureMessageDraftsLoaded(true);
    renderMyName();
    applyMyAvatar();
    syncSettingsPanel();
    refreshAuthSessionSilently();
    applyActiveMessageDraft();
  }
  if (conversationMessages.length) {
    let touched = false;
    for (const msg of conversationMessages) {
      if (normalizeName(msg.from) === oldKey) { msg.from = newUsername; touched = true; }
      if (normalizeName(msg.to) === oldKey) { msg.to = newUsername; touched = true; }
      if (normalizeName(msg.fromKey) === oldKey) { msg.fromKey = newKey; touched = true; }
      if (normalizeName(msg.toKey) === oldKey) { msg.toKey = newKey; touched = true; }
      if (msg.replyTo && normalizeName(msg.replyTo.from) === oldKey) {
        msg.replyTo.from = newUsername;
        touched = true;
      }
    }
    if (touched) renderMessages(conversationMessages);
  }
  showToast(`Username updated to @${newUsername}`, "success");
});

socket.on("password_changed", () => {
  showToast("Password updated.", "success");
});

socket.on("history", (data) => {
  if (normalizeName(data.with) !== normalizeName(activeFriend)) return;
  cacheCallLogMessages(data.messages || []);
  renderMessages(data.messages || []);
});

socket.on("private_message", (message) => {
  const tempId = message?.clientTempId || "";
  const isOwnOutgoingMessage = normalizeName(message.from) === normalizeName(me);

  if (tempId && isOwnOutgoingMessage) {
    removePendingFromQueue(tempId);
  }

  if (tempId && pendingByTempId.has(tempId) && isOwnOutgoingMessage) {
    const pendingMessage = pendingByTempId.get(tempId);
    Object.assign(pendingMessage, message, { pending: false, failed: false, clientTempId: tempId });
    pendingByTempId.delete(tempId);
    renderNetworkState();

    const row = messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`);
    if (row) {
      const replacement = buildMessageElement(pendingMessage, true);
      row.replaceWith(replacement);
      applyMessageSearch();
      return;
    }
  }

  if (tempId && isOwnOutgoingMessage) {
    const pendingIndex = conversationMessages.findIndex((entry) => entry?.clientTempId === tempId);
    if (pendingIndex >= 0) {
      const mergedMessage = {
        ...conversationMessages[pendingIndex],
        ...message,
        pending: false,
        failed: false,
        clientTempId: tempId,
      };
      conversationMessages[pendingIndex] = mergedMessage;

      const row = messagesEl ? messagesEl.querySelector(`[data-client-temp-id="${tempId}"]`) : null;
      if (row) {
        const replacement = buildMessageElement(mergedMessage, true);
        row.replaceWith(replacement);
        applyMessageSearch();
      }
      renderNetworkState();
      return;
    }
    renderNetworkState();
  }

  const cachedLog = cacheCallLogMessage(message);
  if (cachedLog) renderCallHistory();

  const other =
    normalizeName(message.from) === normalizeName(me) ? message.to : message.from;
  const isIncoming = normalizeName(message.from) !== normalizeName(me);
  const isActiveThread = activeFriend && normalizeName(other) === normalizeName(activeFriend);

  if (other) {
    friends = friends.map((f) =>
      normalizeName(f.username) === normalizeName(other)
        ? { ...f, lastMessage: message.text, lastFrom: message.from, lastTimestamp: message.timestamp || f.lastTimestamp }
        : f
    );
    renderFriends();
  }

  if (!isActiveThread) {
    // Message is for a different conversation — just show a toast
    if (isIncoming) {
      const sender = findFriend(message.from);
      const senderName = sender ? getFriendDisplayName(sender) : message.from;
      const callPreview = formatCallLogPreview(message.text, false);
      const preview = callPreview || String(message.text || "");
      showToast(`💬 ${senderName}: ${preview.slice(0, 40)}${preview.length > 40 ? "..." : ""}`);
      playIncomingPing();
      notifyIncomingMessage(message, { senderName, force: true });
    }
    return;
  }

  if (isIncoming) {
    hideTypingIndicator();
    playIncomingPing();
    notifyIncomingMessage(message);
  }

  const wasAtLatest = !hasNewerMessages();
  conversationMessages.push(message);
  if (wasAtLatest) {
    messageWindowEnd = conversationMessages.length;
    appendMessage(message);
    if (messagesEl && messagesEl.querySelectorAll("article.message").length > MAX_VISIBLE_MESSAGES) {
      setMessageWindowToLatest();
      renderMessageWindow();
    }
  }
  // Only bump the unread FAB counter for incoming messages, not our own
  if (normalizeName(message.from) !== normalizeName(me)) {
    if (window._novynFAB) window._novynFAB.bump();
  }
});

socket.on("message_status", (payload) => {
  if (!payload?.id || !payload?.with) return;
  if (!activeFriend || normalizeName(payload.with) !== normalizeName(activeFriend)) return;
  for (const message of conversationMessages) {
    if (message.id !== payload.id) continue;
    if (payload.deliveredAt) message.deliveredAt = payload.deliveredAt;
    if (payload.seenAt) message.seenAt = payload.seenAt;
    break;
  }
  const msgEl = messagesEl.querySelector(`[data-message-id="${payload.id}"]`);
  if (!msgEl || !msgEl.classList.contains("me")) return;
  const metaEl = msgEl.querySelector(".message-meta");
  if (!metaEl) return;
  const timeText = msgEl.dataset.timeLabel || prettyTime(msgEl.dataset.timestamp) || "";
  const statusKey = payload.seenAt ? "seen" : payload.deliveredAt ? "delivered" : "sent";
  renderMineMessageMeta(metaEl, timeText, statusKey);
});

socket.on("typing", ({ from, isTyping }) => {
  if (!activeFriend || normalizeName(from) !== normalizeName(activeFriend)) return;
  isTyping ? showTypingIndicator(from) : hideTypingIndicator();
});

socket.on("call_invite", (data) => {
  const from = String(data?.from || "").trim();
  if (!from) return;
  if (!INCOMING_CALLS_ENABLED) {
    socket.emit("call_reject", { to: from });
    showToast(`Missed call from ${getCallPeerDisplayName(from)}.`, "info");
    playIncomingPing();
    notifyIncomingCall(from, { blocked: true });
    return;
  }
  if (callState.status !== "idle") {
    socket.emit("call_reject", { to: from });
    return;
  }
  callState.peer = from;
  callState.isCaller = false;
  callState.status = "incoming";
  callState.mediaType = data?.type === "video" ? "video" : "audio";
  callState.videoEnabled = callState.mediaType === "video";
  callState.videoFacing = "user";
  callState.minimized = false;
  callState.logSent = false;
  stopCallTimer();
  updateCallUi();
  playIncomingPing();
  notifyIncomingCall(from);
});

socket.on("call_ringing", () => {
  if (callState.status === "outgoing") {
    callState.inviteAcknowledged = true;
    callState.status = "ringing";
    updateCallUi();
  }
});

socket.on("call_answer", (data) => {
  if (normalizeName(data?.from) !== normalizeName(callState.peer)) return;
  if (["outgoing", "ringing"].includes(callState.status)) {
    callState.inviteAcknowledged = true;
    clearCallRingTimeout();
    callState.status = "connecting";
    updateCallUi();
  }
});

socket.on("call_reject", (data) => {
  if (normalizeName(data?.from) !== normalizeName(callState.peer)) return;
  showToast(`${getCallPeerDisplayName(callState.peer)} declined the call.`, "info");
  maybeSendCallLog("declined");
  resetCallState();
});

socket.on("call_cancelled", (data) => {
  if (normalizeName(data?.from) !== normalizeName(callState.peer)) return;
  showToast(`${getCallPeerDisplayName(callState.peer)} cancelled the call.`, "info");
  maybeSendCallLog("cancelled");
  resetCallState();
});

socket.on("call_end", (data) => {
  if (normalizeName(data?.from) !== normalizeName(callState.peer)) return;
  showToast("Call ended.", "info");
  maybeSendCallLog("ended");
  resetCallState();
});

socket.on("call_busy", () => {
  showToast("Friend is already on another call.", "error");
  maybeSendCallLog("busy");
  resetCallState();
});

socket.on("call_unavailable", () => {
  showToast("Friend is offline or unavailable.", "error");
  maybeSendCallLog("unavailable");
  resetCallState();
});

socket.on("call_signal", (payload) => {
  handleCallSignal(payload).catch(() => {});
});

socket.on("user_status", ({ username, online, lastSeenAt }) => {
  friends = friends.map((f) =>
    normalizeName(f.username) === normalizeName(username)
      ? { ...f, online, lastSeenAt: lastSeenAt || f.lastSeenAt || "" }
      : f
  );
  renderFriends();
  syncInfoPanel();
});

socket.on("error_message", (data) => {
  showToast(data.message || "Something went wrong", "error");
});

socket.on("connect", () => {
  setNetworkState("Connected", "connected");
  void ensureDashboardSession(true);
  flushPendingQueue(true);
});

socket.on("disconnect", () => {
  stopLocalTyping();
  hideTypingIndicator();
  ensureDashboardSession._pending = null;
  resumeSocketSession._pending = false;
  setNetworkState("Disconnected", "offline");
  if (!logoutInProgress) {
    showToast("Disconnected from server", "error");
  }
  if (callState.status !== "idle") resetCallState();
});

socket.on("connect_error", () => {
  ensureDashboardSession._pending = null;
  resumeSocketSession._pending = false;
  setNetworkState("Connection issue", "offline");
});

// ─── Profile helpers ──────────────────────────────────────────────────────────

function applyMyAvatar() {
  if (!meAvatar) return;
  const utils = window._novynAvatarUtils;
  if (utils && myProfile.avatarId) {
    utils.applyAvatarToEl(meAvatar, myProfile.avatarId, me.slice(0, 2).toUpperCase());
  } else {
    meAvatar.style.background = "";
    meAvatar.textContent = me.slice(0, 2).toUpperCase();
  }
}

socket.on("profile_updated", (data) => {
  myProfile.avatarId    = data.avatarId    || "";
  myProfile.displayName = data.displayName || "";
  myProfile.age         = data.age         || "";
  myProfile.gender      = data.gender      || "";
  myProfile.bio         = data.bio         || "";
  window._novynProfile  = myProfile;
  renderMyName();
  applyMyAvatar();
  syncSettingsPanel();
  syncInfoPanel();
  showToast("Profile updated ✨", "success");
});

socket.on("friend_profile_updated", (data) => {
  friends = friends.map((f) =>
    normalizeName(f.username) === normalizeName(data.username)
      ? { ...f, avatarId: data.avatarId, displayName: data.displayName, bio: data.bio || "" }
      : f
  );
  renderFriends();
  syncInfoPanel();
});

socket.on("reaction_updated", (payload) => {
  if (!payload?.messageId) return;
  applyConversationReactionsUpdate(payload.messageId, payload.reactions);
  if (window._novynReactions) {
    window._novynReactions.applyServerReactions(payload.messageId, payload.reactions);
  }
});

socket.on("message_edited", (payload) => {
  if (!payload?.messageId || !payload?.with) return;
  if (!activeFriend || normalizeName(payload.with) !== normalizeName(activeFriend)) return;
  if (!applyConversationMessageEdit(payload.messageId, payload.text, payload.editedAt)) return;
  rerenderConversationMessageRow(payload.messageId);
  applyMessageSearch();
  syncPinnedMessageBar();
});

socket.on("message_pin_updated", (payload) => {
  if (!payload?.messageId || !payload?.with) return;
  if (!activeFriend || normalizeName(payload.with) !== normalizeName(activeFriend)) return;
  if (!applyConversationMessagePin(payload.messageId, payload.pinned, payload.pinnedAt, payload.pinnedBy)) return;
  rerenderConversationMessageRow(payload.messageId);
  applyMessageSearch();
  syncPinnedMessageBar();
});

socket.on("message_deleted", (payload) => {
  if (!payload?.messageId || !payload?.with) return;
  if (!activeFriend || normalizeName(payload.with) !== normalizeName(activeFriend)) return;

  markConversationMessageDeleted(payload.messageId, payload.deletedAt, payload.text || DELETED_MESSAGE_TEXT);
  applyDeletedMessageToDom(payload.messageId, payload.text || DELETED_MESSAGE_TEXT);
  applyMessageSearch();
  syncPinnedMessageBar();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
setComposerEnabled(false);
renderActiveFriendPresence();
syncRemoveFriendButton();
syncMessageSearchUi();
if (messagesEl) {
  messagesEl.addEventListener("scroll", () => {
    scrollState.pinnedToBottom = isNearBottom();
  }, { passive: true });
}
if (messagesEl && typeof ResizeObserver !== "undefined") {
  const messagesResizeObserver = new ResizeObserver(() => {
    if (!activeFriend) return;
    if (scrollState.pinnedToBottom) scrollToBottom(true);
  });
  messagesResizeObserver.observe(messagesEl);
}
window.addEventListener("resize", () => {
  if (!activeFriend) return;
  if (scrollState.pinnedToBottom) scrollToBottom(true);
}, { passive: true });

window._novynReply = { setReply };
window._novynSocket = socket;
window._novynMe = () => me;
window._novynActiveFriend = () => activeFriend;
window._novynToast = showToast;
window._novynMessageWindow = {
  hasNewer: hasNewerMessages,
  showLatest: showLatestMessages,
  loadOlder: loadOlderMessages,
};
window._novynOpenSettingsPanel = () => setSettingsOpen(true);
window._novynCloseSettingsPanel = () => setSettingsOpen(false);
window._novynUpdateSession = () => {
  refreshAuthSessionSilently();
};
renderMyName();
setSidebarView("messages", { silent: true });
syncSettingsPanel();
setTimeout(applyMyAvatar, 200);

if (!socketAvailable) {
  setNetworkState("Realtime unavailable", "offline");
  showToast("Realtime client failed to load. Open Novyn from your server URL.", "error");
}


