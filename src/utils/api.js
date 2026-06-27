// src/utils/api.js
// Updated: extractFields now accepts drugName for tailored AI extraction

const BASE = '/api';
const PROV_KEY = 'dmoh_providers_v2';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── Providers (localStorage) ───────────────────────────────────────────────
export const fetchProviders = async () => {
  try {
    const stored = localStorage.getItem(PROV_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveProvider = async (pin, provider) => {
  await request('/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) });
  const providers = await fetchProviders();
  const exists = providers.find(p => p.id === provider.id);
  const updated = exists
    ? providers.map(p => p.id === provider.id ? provider : p)
    : [...providers, { ...provider, id: Date.now().toString() }];
  localStorage.setItem(PROV_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteProvider = async (pin, id) => {
  await request('/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) });
  const providers = await fetchProviders();
  const updated = providers.filter(p => p.id !== id);
  localStorage.setItem(PROV_KEY, JSON.stringify(updated));
  return updated;
};

// ── Admin PIN ──────────────────────────────────────────────────────────────
export const verifyPin = (pin) =>
  request('/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) });

// ── LLM Extraction ─────────────────────────────────────────────────────────
// drugName is now passed alongside notes for tailored, drug-specific extraction
export const extractFields = (notes, drugName = '') =>
  request('/extract', {
    method: 'POST',
    body: JSON.stringify({ notes, drugName }),
  });

// ── PDF Generation ─────────────────────────────────────────────────────────
export const generatePDF = async (provider, formData) => {
  const res = await fetch(`${BASE}/generate_pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, formData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `PDF generation failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CBCRP_Request_Form_Prefilled.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
