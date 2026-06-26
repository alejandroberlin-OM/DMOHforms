// src/components/StepBar.jsx
import { C } from '../constants.js';

const STEPS = ['Select Provider', 'Paste Notes', 'Review & Download'];

export default function StepBar({ step }) {
  return (
    <div style={{
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      padding: '12px 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: done ? C.blue : active ? C.navy : C.border,
                  color: done || active ? C.white : C.muted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                  border: active ? `2px solid ${C.gold}` : 'none',
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{
                  fontSize: 12, whiteSpace: 'nowrap',
                  fontWeight: active ? 700 : 400,
                  color: active ? C.navy : done ? C.blue : C.muted,
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 12px', minWidth: 20,
                  background: done ? C.blue : C.border,
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
