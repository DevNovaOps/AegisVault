/**
 * AegisVault — Shared API Client
 * Central fetch wrapper with JWT token management, automatic refresh,
 * and error handling. Used by Owner, Trustee, and Admin panels.
 *
 * Usage:
 *   import: <script src="../../common/api.js"></script>
 *   call:   AegisAPI.get('/owner/dashboard/kpis')
 *            .then(data => ...)
 *            .catch(err => ...)
 */
(function () {
  'use strict';

  const API_BASE = 'http://127.0.0.1:8000/api/v1';

  // ─── Token Storage ──────────────────────────────────────────────────
  const TOKEN_KEY = 'aegis_access_token';
  const REFRESH_KEY = 'aegis_refresh_token';
  const USER_KEY = 'aegis_user';

  function getAccessToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }

  function getRefreshToken() {
    try { return localStorage.getItem(REFRESH_KEY); } catch (e) { return null; }
  }

  function setTokens(access, refresh) {
    try {
      if (access) localStorage.setItem(TOKEN_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    } catch (e) {}
  }

  function clearTokens() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('aegis_auth_role');
    } catch (e) {}
  }

  function setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.role) localStorage.setItem('aegis_auth_role', user.role);
    } catch (e) {}
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ─── Token Refresh ──────────────────────────────────────────────────
  let refreshPromise = null;

  async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    refreshPromise = fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Token refresh failed');
      return res.json();
    })
    .then(data => {
      setTokens(data.access, null);
      refreshPromise = null;
      return data.access;
    })
    .catch(err => {
      refreshPromise = null;
      clearTokens();
      throw err;
    });

    return refreshPromise;
  }

  // ─── Core Request ───────────────────────────────────────────────────
  async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
    }

    let response = await fetch(url, fetchOptions);

    // Auto-refresh on 401
    if (response.status === 401 && getRefreshToken()) {
      try {
        const newToken = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...fetchOptions, headers });
      } catch (refreshErr) {
        // Refresh failed — redirect to auth
        clearTokens();
        redirectToAuth();
        throw new Error('Session expired. Please sign in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  }

  // ─── Convenience Methods ────────────────────────────────────────────
  const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
    patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
  };

  // ─── Auth Methods ──────────────────────────────────────────────────
  async function login(email, password, role, extras = {}) {
    const payload = { email, password, role, ...extras };
    const data = await apiRequest('/auth/login/', { method: 'POST', body: payload });
    if (data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }

  async function register(payload) {
    const data = await apiRequest('/auth/register/', { method: 'POST', body: payload });
    if (data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      await apiRequest('/auth/logout/', { method: 'POST', body: { refresh: refreshToken } });
    } catch (e) {
      // Logout endpoint failures are non-blocking
    }
    clearTokens();
  }

  async function getCurrentUser() {
    const data = await api.get('/auth/me/');
    if (data.user) setUser(data.user);
    return data;
  }

  // ─── Auth Guards ────────────────────────────────────────────────────
  function isAuthenticated() {
    return !!getAccessToken();
  }

  function redirectToAuth() {
    // Compute relative path to auth.html from any panel location
    const path = window.location.pathname.replace(/\\/g, '/');
    let authPath = '../../auth.html';
    if (path.includes('/Admin/')) authPath = '../../auth.html';
    if (path.includes('/Trustee/')) authPath = '../../auth.html';
    if (path.includes('/Owner/')) authPath = '../../auth.html';
    window.location.href = authPath;
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      redirectToAuth();
      return false;
    }
    return true;
  }

  // ─── Public API ─────────────────────────────────────────────────────
  window.AegisAPI = {
    // Core request
    request: apiRequest,
    get: api.get,
    post: api.post,
    put: api.put,
    patch: api.patch,
    delete: api.delete,

    // Auth
    login,
    register,
    logout,
    getCurrentUser,

    // Token management
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getUser,
    setUser,
    isAuthenticated,
    requireAuth,
    redirectToAuth,

    // Config
    API_BASE,
  };

})();
