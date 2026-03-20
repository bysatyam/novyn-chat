(() => {
  function normalizeText(value) {
    return String(value || "").trim();
  }

  async function request(path, options = {}) {
    try {
      const response = await fetch(path, {
        method: options.method || "GET",
        cache: options.cache || "no-store",
        credentials: options.credentials || "same-origin",
        headers: options.headers || (options.body ? { "Content-Type": "application/json" } : undefined),
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      return { ok: false, status: 0, data: { message: "Connection issue. Try again." }, error };
    }
  }

  async function signIn(payload) {
    const identifier = normalizeText(payload?.identifier);
    const password = String(payload?.password || "");
    const remember = Boolean(payload?.remember);
    return request("/api/auth/signin", {
      method: "POST",
      body: { identifier, password, remember },
    });
  }

  async function signUp(payload) {
    const email = normalizeText(payload?.email);
    const password = String(payload?.password || "");
    const name = normalizeText(payload?.name);
    const username = normalizeText(payload?.username);
    const remember = Boolean(payload?.remember);
    return request("/api/auth/signup", {
      method: "POST",
      body: { email, password, name, username, remember },
    });
  }

  async function getSession() {
    return request("/api/auth/session", { method: "GET" });
  }

  async function refreshSession() {
    return request("/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    });
  }

  async function logout() {
    return request("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    });
  }

  async function hasValidSession() {
    const first = await getSession();
    if (first.ok) return { ok: true, data: first.data };
    if (first.status !== 401) return first;

    const refreshed = await refreshSession();
    if (!refreshed.ok) return refreshed;
    return getSession();
  }

  window._novynAuth = {
    request,
    signIn,
    signUp,
    getSession,
    refreshSession,
    logout,
    hasValidSession,
  };
})();

