// src/components/ProviderModal.jsx
// FIX: uses own internal state so parent doesn't re-render on every keystroke
// → no more focus loss when typing

import { useState } from 'react';
import { C } from '../constants.js';
import { verifyPin, saveProvider } from '../utils/api.js';

export default function ProviderModal({ provider, onSaved, onClose }) {
  const isNew = !provider.firstName;

  // ── OWN internal state — parent does NOT re-render on each keystroke ──
  const [form, setForm] = useState({ ...provider });
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Update only local state — no parent callback on keystroke
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.firstName?.trim() && form.lastName?.trim() && form.cpso?.trim();

  const handleVerifyPin = async () => {
    setVerifying(true); setPinError('');
    try {
      await verifyPin(pin);
      setPinVerified(true);
    } catch {
      setPinError('Incorrect PIN. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const updated = await saveProvider(pin, form);
      onSaved(updated); // bubble up only on save
    } catch (e) {
      setSaveError(e.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Field component — reads from local form state, writes to local state
  const F = ({ label, field, ph = '', required = false, colSpan = 1 }) => (
    <div style={{ gridColumn: colSpan > 1 ? `1 / -1` : undefined }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: C.muted,
        display: 'block', marginBottom: 3,
        textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      <input
        value={form[field] || ''}
        onChange={e => set(field, e.target.value)}
        placeholder={ph}
        style={{
          width: '100%', padding: '8px 10px',
          border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 13, fontFamily: 'inherit',
          boxSizing: 'border-box', outline: 'none', color: C.text,
        }}
      />
    </div>
  );

  const Divider = ({ label }) => (
    <div style={{ gridColumn: '1 / -1', marginTop: 6, marginBottom: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
    }}>
      <div style={{
        background: C.white, borderRadius: 12, width: '100%', maxWidth: 560,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ background: C.navy, padding: '14px 20px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>
            {isNew ? 'Add Provider' : `Edit — Dr. ${provider.firstName} ${provider.lastName}`}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ height: 3, background: C.gold }} />

        <div style={{ padding: 22 }}>
          {/* ── PIN Gate ── */}
          {!pinVerified ? (
            <div>
              <div style={{ background: C.blueLight, border: `1px solid ${C.blue}`, borderRadius: 8, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: C.navy }}>
                🔒 Admin access required to manage the provider directory.
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Admin PIN</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                  placeholder="Enter PIN"
                  style={{ flex: 1, padding: '9px 12px', border: `1px solid ${pinError ? C.red : C.border}`, borderRadius: 6, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                />
                <button onClick={handleVerifyPin} disabled={verifying || !pin}
                  style={{ padding: '9px 20px', background: verifying ? C.muted : C.navy, color: C.white, border: 'none', borderRadius: 6, cursor: verifying ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {verifying ? '…' : 'Verify'}
                </button>
              </div>
              {pinError && <p style={{ color: C.red, fontSize: 12, marginTop: 6 }}>{pinError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <button onClick={onClose} style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, cursor: 'pointer', fontSize: 13, color: C.muted }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                <Divider label="Identity & Credentials" />
                <F label="First Name" field="firstName" ph="Sarah" required />
                <F label="Last Name" field="lastName" ph="Chen" required />
                <F label="Specialty / Specialties" field="specialty" ph="Medical Oncology, Hematology" colSpan={2} />
                <F label="CPSO No." field="cpso" ph="123456" required />
                <F label="OHIP Billing No." field="billingNumber" ph="123456" />

                <Divider label="Contact" />
                <F label="Telephone" field="tel" ph="416-555-0101" />
                <F label="Fax" field="fax" ph="416-555-0102" />
                <F label="Email" field="email" ph="dr@uhn.ca" colSpan={2} />

                <Divider label="Hospital / Clinic" />
                <F label="Affiliated Hospital / Cancer Centre" field="hospital" ph="Princess Margaret Cancer Centre" colSpan={2} />
                <F label="Clinic / Office Address" field="address" ph="610 University Ave" colSpan={2} />
                <F label="City" field="city" ph="Toronto" />
                <F label="Postal Code" field="postalCode" ph="M5G 2M9" />

              </div>

              {saveError && <p style={{ color: C.red, fontSize: 12, marginTop: 12 }}>⚠ {saveError}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ padding: '9px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, cursor: 'pointer', fontSize: 13, color: C.muted }}>Cancel</button>
                <button onClick={handleSave} disabled={!valid || saving}
                  style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: valid && !saving ? C.navy : C.muted, color: C.white, cursor: valid && !saving ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700 }}>
                  {saving ? 'Saving…' : 'Save Provider'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
