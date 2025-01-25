import axios from "axios";

const ONEMAP_TOKEN_API = "https://www.onemap.gov.sg/api/auth/post/getToken";

const tokenStorage = {
  key: "onemap_token",
  expiryKey: "onemap_token_expiry",

  getToken() {
    return localStorage.getItem(this.key);
  },

  getExpiry() {
    return parseInt(localStorage.getItem(this.expiryKey), 10);
  },

  setToken(token, expiry) {
    localStorage.setItem(this.key, token);
    localStorage.setItem(this.expiryKey, expiry.toString()); // Store expiry as timestamp
  },

  isTokenExpired() {
    const expiry = this.getExpiry();
    if (!expiry) return true; // No expiry means no valid token
    return Date.now() > expiry;
  },
};

const fetchNewToken = async () => {
  try {
    const response = await axios.post(ONEMAP_TOKEN_API, {
      email: import.meta.env.VITE_ONEMAP_EMAIL,
      password: import.meta.env.VITE_ONEMAP_PASSWORD,
    });

    const { access_token, expiry_timestamp } = response.data;

    if (!access_token || !expiry_timestamp) {
      throw new Error("Missing access_token or expiry_timestamp in API response.");
    }

    // Convert expiry from Unix seconds to milliseconds
    const expiryDateMs = expiry_timestamp * 1000;

    // Store the new token and its expiry
    tokenStorage.setToken(access_token, expiryDateMs);

    console.log(
      `New token fetched. Expires at: ${new Date(expiryDateMs).toLocaleString(
        "en-SG",
        { timeZone: "Asia/Singapore" }
      )}`
    );

    return access_token;
  } catch (error) {
    console.error("Error fetching new token:", error.message);
    throw error;
  }
};

const getValidToken = async () => {
  if (tokenStorage.isTokenExpired()) {
    console.log("Token expired. Fetching a new token...");
    return await fetchNewToken();
  }
  return tokenStorage.getToken();
};

/**
 * Perform an authenticated API call to OneMap
 * Automatically ensures a valid token is used for the call.
 * 
 * @param {string} endpoint - The OneMap API endpoint (relative to the base API URL).
 * @param {object} params - Query parameters for the API call.
 * @returns {Promise<object>} - The API response data.
 */
const callOneMapAPI = async (endpoint, params = {}) => {
  try {
    const token = await getValidToken();
    const apiUrl = `${ONEMAP_TOKEN_API.replace("/auth/post/getToken", "")}${endpoint}`;

    const response = await axios.get(apiUrl, {
      params,
      headers: { Authorization: token },
    });

    return response.data;
  } catch (error) {
    console.error(`Error calling OneMap API (${endpoint}):`, error.message);
    throw error;
  }
};

export { callOneMapAPI, fetchNewToken, getValidToken };
