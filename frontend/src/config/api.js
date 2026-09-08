// api.js — Centralized API base URL resolver and fetch wrapper
// Seamlessly connects Netlify frontend to public HTTPS tunnel / local backend server

export const DEFAULT_TUNNEL_URL = 'https://bhumi-sahyog-jaipur.loca.lt';

export function getApiBaseUrl() {
  const custom = localStorage.getItem('bhumi_api_server_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  // If running on local dev server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3001';
  }
  // Default to live public HTTPS tunnel when on Netlify or remote
  return DEFAULT_TUNNEL_URL;
}

export function setApiBaseUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('bhumi_api_server_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('bhumi_api_server_url');
  }
}

/**
 * Intelligent fetch wrapper with tunnel-reminder bypass & multi-endpoint fallback
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const baseUrl = getApiBaseUrl();

  const fetchOptions = {
    ...options,
    headers: {
      'bypass-tunnel-reminder': 'true',
      'Bypass-Tunnel-Reminder': 'true',
      ...(options.headers || {}),
    },
  };

  // 1. Try with configured baseUrl (e.g. HTTPS tunnel or localhost)
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}${cleanEndpoint}`, fetchOptions);
      if (res.ok || res.status < 500) return res;
    } catch (e) {
      // Continue to next fallback
    }
  }

  // 2. Try default HTTPS tunnel if baseUrl was custom and failed
  if (baseUrl !== DEFAULT_TUNNEL_URL) {
    try {
      const resTunnel = await fetch(`${DEFAULT_TUNNEL_URL}${cleanEndpoint}`, fetchOptions);
      if (resTunnel.ok || resTunnel.status < 500) return resTunnel;
    } catch (e) {}
  }

  // 3. Try relative endpoint
  try {
    const res = await fetch(cleanEndpoint, fetchOptions);
    if (res.ok || res.status < 500) return res;
  } catch (e) {}

  // 4. Try direct http://localhost:3001
  try {
    const res = await fetch(`http://localhost:3001${cleanEndpoint}`, fetchOptions);
    if (res.ok || res.status < 500) return res;
  } catch (e) {}

  throw new Error('Backend server is unreachable. Please make sure the backend is running.');
}
