// src/components/Header.jsx
import { C } from '../constants.js';

export default function Header({ step, onReset }) {
  return (
    <header>
      <div style={{
        background: C.navy, color: C.white,
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        {/* Monogram / Logo placeholder */}
        <div style={{
          width: 42, height: 42, background: C.gold,
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>PM</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
            University Health Network · Princess Margaret Cancer Centre
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>
            Dept. of Medical Oncology and Hematology
          </div>
          <div style={{ fontSize: 11, opacity: 0.65, marginTop: 1 }}>
            CBCRP Clinical Form Assistant — Personal Productivity Tool
          </div>
        </div>

        {step > 1 && (
          <button
            onClick={onReset}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: C.white, borderRadius: 6,
              padding: '7px 16px', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            ← New Form
          </button>
        )}
      </div>
      {/* Gold accent bar */}
      <div style={{ height: 4, background: C.gold }} />
    </header>
  );
}
