// api.js — Centralized API base URL resolver and fetch wrapper
// Seamlessly connects Netlify frontend to Render Cloud API & local tunnels

export const DEFAULT_RENDER_URL = 'https://bhumi-sahyog.onrender.com';
export const DEFAULT_TUNNEL_URL = 'https://bhumi-sahyog-jaipur.loca.lt';

/**
 * Clean & sanitize user-entered API URL
 * Handles brackets e.g. ]https://..., trailing slashes, /api suffixes, spaces, quotes
 */
export function cleanApiUrl(url) {
  if (!url) return '';
  let cleaned = String(url).trim();
  // Strip leading/trailing brackets, quotes, backticks
  cleaned = cleaned.replace(/^[\[\]"'`\s]+|[\[\]"'`\s]+$/g, '');
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Strip trailing /api if user appended it
  cleaned = cleaned.replace(/\/api$/, '');
  
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    if (cleaned.startsWith('localhost') || cleaned.startsWith('127.0.0.1')) {
      cleaned = 'http://' + cleaned;
    } else {
      cleaned = 'https://' + cleaned;
    }
  }
  return cleaned;
}

export function getApiBaseUrl() {
  const custom = localStorage.getItem('bhumi_api_server_url');
  if (custom && custom.trim()) {
    const cleaned = cleanApiUrl(custom);
    if (cleaned) return cleaned;
  }
  // If running on local dev server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3001';
  }
  // Default to live Render cloud backend on Netlify / production
  return DEFAULT_RENDER_URL;
}

export function setApiBaseUrl(url) {
  const cleaned = cleanApiUrl(url);
  if (cleaned) {
    localStorage.setItem('bhumi_api_server_url', cleaned);
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

  const candidateUrls = Array.from(new Set([
    baseUrl,
    DEFAULT_RENDER_URL,
    DEFAULT_TUNNEL_URL,
    '',
    'http://localhost:3001',
  ])).filter(Boolean);

  for (const host of candidateUrls) {
    try {
      const url = host ? `${host}${cleanEndpoint}` : cleanEndpoint;
      const res = await fetch(url, fetchOptions);
      if (res.ok || res.status < 500) {
        return res;
      }
    } catch (e) {
      // Continue to next fallback host
    }
  }

  throw new Error('Backend server is unreachable. Please make sure the backend is running.');
}
