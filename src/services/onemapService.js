import axios from "axios";

// Bases
const ONEMAP_PUBLIC_BASE = "https://developers.onemap.sg"; // Search, reverseGeocode (public variants)
const ONEMAP_SECURE_BASE = "https://www.onemap.gov.sg/api"; // Tokened endpoints
const ONEMAP_TOKEN_URL = "https://www.onemap.gov.sg/api/auth/post/getToken";

// Environment-aware storage (avoids Node crashing on localStorage)
const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const memoryStore = new Map();
const storage = isBrowser
  ? window.localStorage
  : {
      getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
      setItem: (k, v) => memoryStore.set(k, String(v)),
      removeItem: (k) => memoryStore.delete(k),
    };

const tokenStorage = {
  key: "onemap_token",
  expiryKey: "onemap_token_expiry",
  getToken() { return storage.getItem(this.key); },
  getExpiry() { const v = storage.getItem(this.expiryKey); return v ? parseInt(v, 10) : 0; },
  setToken(token, expiryMs) {
    storage.setItem(this.key, token);
    storage.setItem(this.expiryKey, String(expiryMs));
  },
  isTokenExpired() { const exp = this.getExpiry(); return !exp || Date.now() > exp; },
};

// Credentials from env (client or server)
const viteEnv = (typeof import.meta !== "undefined" && import.meta?.env) ? import.meta.env : {};
const PENV = (typeof process !== "undefined" && process?.env) ? process.env : {};
const EMAIL = viteEnv.VITE_ONEMAP_EMAIL || PENV.VITE_ONEMAP_EMAIL || PENV.ONEMAP_EMAIL;
const PASSWORD = viteEnv.VITE_ONEMAP_PASSWORD || PENV.VITE_ONEMAP_PASSWORD || PENV.ONEMAP_PASSWORD;

async function fetchNewToken() {
  try {
    const { data } = await axios.post(ONEMAP_TOKEN_URL, { email: EMAIL, password: PASSWORD }, { timeout: 10000 });
    const { access_token, expiry_timestamp } = data || {};
    if (!access_token || !expiry_timestamp) throw new Error("Token response missing fields");
    const expiryMs = Number(expiry_timestamp) * 1000;
    tokenStorage.setToken(access_token, expiryMs);
    return access_token;
  } catch (err) {
    // why: surface clear errors for monitoring and quick recovery
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error("OneMap getToken failed:", msg);
    throw err;
  }
}

export async function getValidToken() {
  if (tokenStorage.isTokenExpired()) return await fetchNewToken();
  return tokenStorage.getToken();
}

/**
 * Generic OneMap caller
 * @param {string} endpoint - e.g. "/commonapi/search" (public) or "/themesvc/..." (secured)
 * @param {object} params - query params
 * @param {object} options - { authRequired?: boolean, base?: string }
 */
export async function callOneMapAPI(endpoint, params = {}, options = {}) {
  const isPublicSearch = endpoint.startsWith("/commonapi/");

  // Browser CORS workaround: route public search via your server proxy
if (isBrowser && endpoint === "/commonapi/search") {
  const mapped = { postalCode: params.searchVal || params.postalCode }; // <-- map to postalCode
  const { data } = await axios.get("/search-address", { params: mapped, timeout: 15000 });
  return data;
}

  const base = options.base || (isPublicSearch ? ONEMAP_PUBLIC_BASE : ONEMAP_SECURE_BASE);

  const headers = {};
  if (options.authRequired === true || (!isPublicSearch && options.authRequired !== false)) {
    const token = await getValidToken();
    headers["Authorization"] = `Bearer ${token}`; // why: OneMap expects Bearer scheme on secured APIs
  }

  const url = `${base}${endpoint}`;
  const { data } = await axios.get(url, { params, headers, timeout: 15000 });
  return data;
}

// Small helper to normalize LONGITUDE/LONGTITUDE when needed
export function normalizeLon(rec = {}) {
  return rec?.LONGITUDE ?? rec?.LONGTITUDE ?? null;
}