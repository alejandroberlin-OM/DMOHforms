// src/utils/api.js

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

// ── Providers ──────────────────────────────────────────────────────────────
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

// ── Admin PIN ──────────────────────────────────────────────────────────────
export const verifyPin = (pin) =>
  request('/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });

// ── LLM Extraction ─────────────────────────────────────────────────────────
export const extractFields = (notes) =>
  request('/extract', {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });

// ── PDF Generation ─────────────────────────────────────────────────────────
// Calls Python serverless function to fill the actual CCO CBCRP PDF
// Section 2 (PHI) is left blank — physician completes manually
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
