// src/components/DisclaimerModal.jsx
import { useState } from 'react';
import { C } from '../constants.js';

export default function DisclaimerModal({ onAccept }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const canProceed = checked1 && checked2;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,26,61,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: C.white, borderRadius: 12, width: '100%', maxWidth: 600,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ background: C.navy, padding: '18px 24px', borderRadius: '12px 12px 0 0' }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            University Health Network · Princess Margaret Cancer Centre
          </div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>
            DMOH Clinical Form Assistant
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
            Personal Productivity Tool — Important Notice
          </div>
        </div>
        <div style={{ height: 4, background: C.gold }} />

        <div style={{ padding: '22px 24px' }}>
          {/* Description */}
          <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, marginBottom: 18 }}>
            This application is an <strong>independent personal productivity tool</strong> created for use by physicians within the Department of Medical Oncology and Hematology (DMOH). It is <strong>not an official product</strong> of University Health Network (UHN), Princess Margaret Cancer Centre, or Ontario Health.
          </p>

          {/* De-identification notice */}
          <div style={{
            background: C.amberLight, border: `1px solid ${C.amberBorder}`,
            borderRadius: 8, padding: '14px 16px', marginBottom: 14,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.amber, marginBottom: 8 }}>
              🔒 De-identification Required
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: '#78350F', margin: 0 }}>
              Clinical notes entered into this tool are sent to Anthropic's API for processing under a Business Associate Agreement (BAA). While Anthropic's BAA provides contractual protection for data handling, <strong>you must de-identify all notes before pasting</strong>. Do not enter: patient name, date of birth, OHIN, health card number, address, or phone number.
            </p>
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', marginBottom: 10, cursor: 'pointer',
              background: checked1 ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${checked1 ? '#86EFAC' : C.border}`,
              borderRadius: 8, transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={checked1}
                onChange={e => setChecked1(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: C.navy }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>
                <strong>I will NOT enter any patient-identifying information</strong> (name, date of birth, OHIN, health card number, address, or phone number) into the clinical notes field. All notes will be de-identified before use.
              </span>
            </label>

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', cursor: 'pointer',
              background: checked2 ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${checked2 ? '#86EFAC' : C.border}`,
              borderRadius: 8, transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={checked2}
                onChange={e => setChecked2(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: C.navy }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>
                <strong>I understand AI-generated content may be incomplete or inaccurate.</strong> I will carefully review and verify all generated content before submitting any form. As the treating physician, I remain solely and fully responsible for the accuracy of any submitted documentation.
              </span>
            </label>
          </div>

          {/* Data processing note */}
          <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 20, padding: '10px 12px', background: '#F8FAFC', borderRadius: 6, border: `1px solid ${C.border}` }}>
            <strong>Data Processing:</strong> De-identified clinical notes are processed by Anthropic (claude-sonnet-4-6) under a BAA. No patient data is stored by this application. Use on personal or professional devices. Continuing constitutes acceptance of these terms.
          </p>

          <button
            onClick={canProceed ? onAccept : undefined}
            disabled={!canProceed}
            style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: 8,
              background: canProceed ? C.navy : C.border,
              color: canProceed ? C.white : C.muted,
              fontSize: 15, fontWeight: 700, cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (canProceed) e.target.style.background = C.navyDark; }}
            onMouseLeave={e => { if (canProceed) e.target.style.background = C.navy; }}
          >
            {canProceed ? 'I Understand — Continue to Form Assistant' : 'Please acknowledge both statements above'}
          </button>
        </div>
      </div>
    </div>
  );
}
