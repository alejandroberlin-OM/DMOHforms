// src/utils/api.js
// Thin wrappers around the Vercel API routes

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Providers
export const fetchProviders = () => request('/providers');

export const saveProvider = (pin, provider) =>
  request('/providers', {
    method: 'POST',
    body: JSON.stringify({ pin, provider }),
  });

export const deleteProvider = (pin, id) =>
  request('/providers', {
    method: 'DELETE',
    body: JSON.stringify({ pin, id }),
  });

// Admin PIN
export const verifyPin = (pin) =>
  request('/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });

// LLM Extraction
export const extractFields = (notes) =>
  request('/extract', {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
