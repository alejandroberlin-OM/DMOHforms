// src/pages/Landing.jsx
import { useState } from 'react';
import { C } from '../constants.js';
import StepProviders from '../components/StepProviders.jsx';

const FORMS = [
  {
    id: 'cbcrp',
    title: 'CBCRP Request Form',
    subtitle: 'Ontario Health · Cancer Care Ontario',
    description: 'Case-by-Case Review Program — funding request for cancer drugs not covered by standard programs.',
    icon: '📋',
    available: true,
    pages: '7 pages · Sections 1–7',
  },
  {
    id: 'wsib',
    title: 'WSIB / Insurance Letter',
    subtitle: 'Workplace Safety & Insurance Board',
    description: 'Medical letters and documentation for workplace injury claims and insurance coverage requests.',
    icon: '🏥',
    available: false,
  },
  {
    id: 'eap',
    title: 'EAP Request',
    subtitle: 'Ontario Ministry of Health',
    description: 'Exceptional Access Program — funding requests for drugs not listed on the Ontario Drug Benefit formulary.',
    icon: '💊',
    available: false,
  },
  {
    id: 'referral',
    title: 'Specialist Referral Letter',
    subtitle: 'General',
    description: 'AI-assisted referral letters with clinical context pre-populated from de-identified notes.',
    icon: '✉️',
    available: false,
  },
];

export default function Landing({ onSelectForm, providers, setProviders }) {
  const [showProviders, setShowProviders] = useState(false);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #003D7A 100%)`,
        color: C.white, padding: '36px 24px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
          University Health Network · Princess Margaret Cancer Centre
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>
          DMOH Form Assistant
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, margin: '0 auto', maxWidth: 500, lineHeight: 1.6 }}>
          AI-assisted clinical form completion for the Department of Medical Oncology and Hematology.
          De-identified notes in → pre-filled forms out.
        </p>
        <div style={{ marginTop: 16, display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Personal productivity tool', 'PHI never enters AI', 'Anthropic BAA in place'].map(t => (
            <span key={t} style={{ fontSize: 11, background: 'rgba(255,209,0,0.15)', border: '1px solid rgba(255,209,0,0.3)', color: C.gold, borderRadius: 20, padding: '3px 10px' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Form selector */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Select a Form</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 18px' }}>
            Choose the form you need to complete. The AI will extract relevant fields from your de-identified clinical notes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {FORMS.map(form => (
              <div key={form.id}
                onClick={form.available ? () => onSelectForm(form.id) : undefined}
                style={{
                  background: C.white,
                  border: `1px solid ${form.available ? C.border : C.border}`,
                  borderRadius: 10, padding: 18,
                  cursor: form.available ? 'pointer' : 'default',
                  opacity: form.available ? 1 : 0.55,
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (form.available) { e.currentTarget.style.boxShadow = `0 4px 18px rgba(0,43,92,0.12)`; e.currentTarget.style.borderColor = C.navy; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
              >
                {!form.available && (
                  <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, background: C.border, color: C.muted, borderRadius: 10, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Coming Soon
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 10 }}>{form.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 3 }}>{form.title}</div>
                <div style={{ fontSize: 11, color: C.blue, marginBottom: 8, fontWeight: 500 }}>{form.subtitle}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: form.available ? 14 : 0 }}>{form.description}</div>
                {form.available && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{form.pages}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Start →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Provider management section */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, margin: '0 0 3px' }}>⚕ Provider Directory</h2>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                {providers.length} provider{providers.length !== 1 ? 's' : ''} registered · Shared across all forms
              </p>
            </div>
            <button
              onClick={() => setShowProviders(!showProviders)}
              style={{ background: showProviders ? C.navy : C.white, color: showProviders ? C.white : C.navy, border: `1px solid ${C.navy}`, borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {showProviders ? 'Hide Providers ▲' : 'Manage Providers ▼'}
            </button>
          </div>

          {showProviders && (
            <StepProviders
              providers={providers}
              setProviders={setProviders}
              onSelect={null}
              landingMode={true}
            />
          )}

          {!showProviders && providers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {providers.map(p => (
                <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: C.text }}>
                  <strong>Dr. {p.firstName} {p.lastName}</strong>
                  <span style={{ color: C.muted, marginLeft: 8 }}>{p.specialty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <div style={{ marginTop: 32, padding: '14px 16px', background: C.blueLight, border: `1px solid #BDD6F0`, borderRadius: 8, fontSize: 11, color: '#1E4D7A', lineHeight: 1.7 }}>
          <strong>Personal Productivity Tool — Not an official UHN product.</strong> AI-generated content must be reviewed and verified by the treating physician before submission. Patient PHI must never be entered into clinical notes fields. Data processed by Anthropic under BAA. No patient data is stored by this application.
        </div>
      </div>
    </div>
  );
}
