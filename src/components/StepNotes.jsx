// src/components/StepNotes.jsx
import { C } from '../constants.js';

const PLACEHOLDER = `Example — de-identified notes:

65-year-old patient, ECOG PS 1. Metastatic non-small cell lung carcinoma (NSCLC), EGFR exon 19 deletion, stage IV — pathological staging.

Prior treatments:
— Erlotinib 150mg PO daily × 8 months — disease progression (T790M mutation detected)
— Carboplatin/Pemetrexed × 4 cycles — inadequate response, stopped due to neuropathy

Requesting: Osimertinib (Tagrisso) 80mg PO daily for T790M-positive NSCLC post-erlotinib progression.

Rationale: FLAURA trial demonstrated superior OS vs standard EGFR-TKI (38.6 vs 31.8 months). Patient has failed two prior lines. No clinical trials currently available in Ontario for this specific indication.

Comorbidities: Hypertension (well-controlled on Amlodipine 5mg OD), GERD
Concomitant medications: Amlodipine 5mg OD, Pantoprazole 40mg OD

Estimated survival without treatment: 3–4 months. With osimertinib: potential 6–12 month extension.
No absolute contraindications. Main toxicities: diarrhea, rash, QTc prolongation — manageable.
No compassionate access available. EAP previously rejected.`;

export default function StepNotes({ provider, notes, setNotes, onExtract, loading, error }) {
  return (
    <div>
      {/* Provider badge */}
      <div style={{
        background: '#EEF6FF', border: `1px solid ${C.blue}`,
        borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.navy,
        marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>👤</span>
        <span>Signing as: <strong>Dr. {provider.firstName} {provider.lastName}</strong> · {provider.specialty} · {provider.hospital}</span>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Paste De-identified Clinical Notes</h2>
      <p style={{ margin: '0 0 18px', color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
        Include diagnosis, prior treatments, requested drug, dosing, and clinical rationale.
        Include as much detail as possible for better extraction.
      </p>

      {/* PHI Warning */}
      <div style={{
        background: C.amberLight, border: `1px solid ${C.amberBorder}`,
        borderRadius: '8px 8px 0 0', padding: '9px 14px',
        fontSize: 12, color: C.amber, display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ fontWeight: 700, flexShrink: 0 }}>⚠ PHI CHECK</span>
        <span>
          Before pasting, confirm you have removed: <strong>patient name · date of birth · OHIN / health card number · address · phone number</strong>.
          Notes are sent to Anthropic's API (BAA in place). No data is stored.
        </span>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={PLACEHOLDER}
        style={{
          width: '100%', minHeight: 340, padding: 16,
          border: `1px solid ${C.border}`, borderTop: 'none',
          borderRadius: '0 0 8px 8px', fontSize: 13, lineHeight: 1.75,
          color: C.text, resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box', outline: 'none', background: C.white,
        }}
      />

      {/* Tips */}
      <div style={{ marginTop: 12, padding: '10px 14px', background: C.blueLight, borderRadius: 8, border: `1px solid #BDD6F0`, fontSize: 12, color: '#1E4D7A', lineHeight: 1.7 }}>
        <strong>Tips for best results:</strong> Include prior treatment dates, specific drug names and doses, staging details, performance status, reason other options were ruled out, and any relevant trial names or references.
      </div>

      {error && (
        <div style={{ color: C.red, fontSize: 13, margin: '14px 0', padding: '10px 14px', background: C.redLight, borderRadius: 7, border: `1px solid #FCA5A5` }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={onExtract}
        disabled={loading || !notes.trim()}
        style={{
          marginTop: 16, background: loading ? C.muted : C.navy,
          color: C.white, border: 'none', borderRadius: 8,
          padding: '13px 32px', fontSize: 15, fontWeight: 700,
          cursor: loading || !notes.trim() ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!loading && notes.trim()) e.target.style.background = C.blue; }}
        onMouseLeave={e => { if (!loading) e.target.style.background = C.navy; }}
      >
        {loading ? (
          <>
            <span style={{
              display: 'inline-block', width: 17, height: 17,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Extracting form fields…
          </>
        ) : (
          'Extract & Fill Form →'
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
