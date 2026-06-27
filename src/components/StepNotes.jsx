// src/components/StepNotes.jsx
// Updated: Added drug name input field for tailored AI extraction
import { C } from '../constants.js';

const PLACEHOLDER = `Example — de-identified notes:

68-year-old male, ECOG PS 1. Metastatic castration-resistant prostate cancer (mCRPC), adenocarcinoma. Prior radical prostatectomy 2018. Biochemical recurrence 2020 — started ADT with Eligard (leuprolide).

Disease course:
— Eligard + Abiraterone: started Jan 2022, PSA nadir 0.3. PSA progression Jan 2023 (PSA 12.4, rising). Radiographic progression on bone scan — new lesions L2, L4, right iliac.
— Docetaxel 75mg/m² q3w × 6 cycles: completed Aug 2023. PSA response nadir 4.1, then rising. Restaging CT Sept 2023: stable visceral disease but new pelvic LN involvement.

Current status: PSA 28.6 (rising). Performance status maintained (ECOG 1). Bone pain managed with analgesia. No visceral crisis.

Germline and somatic testing: BRCA2 pathogenic variant identified on somatic tumor testing (Foundation One CDx). No prior PARP inhibitor exposure.

Comorbidities: Hypertension (Amlodipine 10mg OD — well controlled), Type 2 diabetes (Metformin 1000mg BD — HbA1c 6.8%).

Requesting: Olaparib (Lynparza) 300mg PO BD for BRCA2-mutated mCRPC post-docetaxel.`;

export default function StepNotes({ provider, drugName, setDrugName, notes, setNotes, onExtract, loading, error }) {
  const canExtract = notes.trim().length > 20 && drugName.trim().length > 1;

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

      {/* Drug name field */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>
          Step 1 — What drug are you requesting?
        </h2>
        <p style={{ margin: '0 0 12px', color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
          Enter the drug name first. This tailors the AI extraction — evidence, dosing, survival estimates, and toxicity profile will be specific to this drug.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              value={drugName}
              onChange={e => setDrugName(e.target.value)}
              placeholder="Generic name — e.g. Olaparib, Osimertinib, Venetoclax, Pembrolizumab"
              style={{
                width: '100%', padding: '11px 14px',
                border: `2px solid ${drugName.trim() ? C.navy : C.border}`,
                borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
                boxSizing: 'border-box', outline: 'none', color: C.text,
                transition: 'border-color 0.15s',
              }}
            />
          </div>
          {drugName.trim() && (
            <div style={{
              background: C.blueLight, border: `1px solid ${C.blue}`,
              borderRadius: 8, padding: '11px 14px', fontSize: 13,
              color: C.navy, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              ✓ Requesting: {drugName.trim()}
            </div>
          )}
        </div>
        {!drugName.trim() && (
          <p style={{ fontSize: 12, color: C.amber, marginTop: 6 }}>
            ⚠ Drug name required — the AI uses this to find real trial evidence, dosing, and toxicity data
          </p>
        )}
      </div>

      {/* Notes area */}
      <div style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>
          Step 2 — Paste De-identified Clinical Notes
        </h2>
        <p style={{ margin: '0 0 14px', color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
          Include diagnosis, staging, prior treatments and responses, relevant biomarkers, comorbidities, and clinical rationale.
          The more detail you provide, the better the extraction.
        </p>

        {/* PHI Warning */}
        <div style={{
          background: C.amberLight, border: `1px solid ${C.amberBorder}`,
          borderRadius: '8px 8px 0 0', padding: '9px 14px',
          fontSize: 12, color: C.amber, display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <strong style={{ flexShrink: 0 }}>⚠ PHI CHECK</strong>
          <span>
            Remove before pasting: <strong>patient name · date of birth · OHIN / health card number · address · phone number · MRN</strong>.
            Notes are processed by Anthropic API (BAA in place). No data is stored.
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
      </div>

      {/* Tips */}
      <div style={{ margin: '12px 0 16px', padding: '10px 14px', background: C.blueLight, borderRadius: 8, border: `1px solid #BDD6F0`, fontSize: 12, color: '#1E4D7A', lineHeight: 1.7 }}>
        <strong>Tips for best results:</strong>{' '}
        Include prior treatment dates and specific responses (progression, toxicity) · Staging details · Performance status · Molecular/biomarker results (EGFR, BRCA, PD-L1, etc.) · Any prior funding applications · Why you chose this drug specifically.
        The AI will complete any gaps with clinically appropriate content, but specific detail = better output.
      </div>

      {error && (
        <div style={{ color: C.red, fontSize: 13, margin: '0 0 14px', padding: '10px 14px', background: C.redLight, borderRadius: 7, border: `1px solid #FCA5A5` }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={onExtract}
        disabled={loading || !canExtract}
        style={{
          background: loading ? C.muted : canExtract ? C.navy : C.border,
          color: canExtract || loading ? C.white : C.muted,
          border: 'none', borderRadius: 8,
          padding: '13px 32px', fontSize: 15, fontWeight: 700,
          cursor: loading || !canExtract ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!loading && canExtract) e.target.style.background = C.blue; }}
        onMouseLeave={e => { if (!loading) e.target.style.background = canExtract ? C.navy : C.border; }}
      >
        {loading ? (
          <>
            <span style={{
              display: 'inline-block', width: 17, height: 17,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Extracting & generating form fields…
          </>
        ) : !drugName.trim() ? (
          'Enter drug name above to continue'
        ) : !notes.trim() ? (
          'Paste clinical notes above to continue'
        ) : (
          `Extract & Fill Form for ${drugName} →`
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
