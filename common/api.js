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
      localStorage.removeItem('aegis_admin_session');
      localStorage.removeItem('aegis_owner_session');
      localStorage.removeItem('aegis_trustee_session');
    } catch (e) {}
  }

  function setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user && user.role) localStorage.setItem('aegis_auth_role', user.role);
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
      let msg = errorData.detail;
      if (Array.isArray(msg)) {
        msg = msg.join(' ');
      } else if (typeof msg === 'object' && msg !== null) {
        msg = Object.values(msg).flat().join(' ');
      } else if (!msg && typeof errorData === 'object') {
        const vals = Object.values(errorData).flat();
        if (vals.length) msg = vals.join(' ');
      }
      if (!msg && errorData.non_field_errors) msg = errorData.non_field_errors[0];
      const error = new Error(msg || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return null;
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
      if (refreshToken) {
        await apiRequest('/auth/logout/', { method: 'POST', body: { refresh: refreshToken } });
      }
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
    return !!(getAccessToken() || getUser());
  }

  function redirectToAuth() {
    window.location.href = '/AegisVault%20Home/auth.html';
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      redirectToAuth();
      return false;
    }
    return true;
  }

  function getRolePanelUrl(role) {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return '/Admin/Dashboard/admin.html';
      case 'trustee':
        return '/Trustee/dashboard/dashboard.html';
      case 'owner':
      default:
        return '/Owner/dashboard/dashboard.html';
    }
  }

  function syncUserProfileUI() {
    const user = getUser();
    if (!user) return;
    const name = user.name || (user.email ? user.email.split('@')[0] : 'User');
    const parts = name.trim().split(/\s+/);
    const initials = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2)).toUpperCase();
    const firstName = parts[0];

    document.querySelectorAll('.profile-name, .profile-user-fullname, .overview-name').forEach(el => {
      el.textContent = name;
    });
    document.querySelectorAll('.profile-avatar-circle, .avatar-initials, .avatar-text').forEach(el => {
      el.textContent = initials;
    });
    document.querySelectorAll('.profile-email, .user-email').forEach(el => {
      if (user.email) el.textContent = user.email;
    });

    const heroAccent = document.querySelector('.hero-heading .hero-accent');
    if (heroAccent) {
      heroAccent.textContent = firstName + '!';
    }

    // Wire sign out links if present
    document.querySelectorAll('a, button').forEach(el => {
      const txt = (el.textContent || '').trim().toLowerCase();
      if (txt === 'sign out' || txt === 'log out' || txt.includes('sign out')) {
        el.onclick = (e) => {
          e.preventDefault();
          logout().then(() => redirectToAuth());
        };
      }
    });
  }

  // Auto-sync UI when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncUserProfileUI);
  } else {
    setTimeout(syncUserProfileUI, 10);
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
    getRolePanelUrl,
    syncUserProfileUI,

    // Config
    API_BASE,
  };

})();

