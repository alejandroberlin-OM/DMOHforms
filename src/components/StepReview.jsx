// src/components/StepReview.jsx
import { useState } from 'react';
import { C, makeUid } from '../constants.js';

// ── Shared field components ──────────────────────────────────────────────────
function F({ label, field, type = 'text', rows = 2, fd, set }) {
  const base = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {type === 'textarea'
        ? <textarea value={fd[field] || ''} onChange={e => set(field, e.target.value)} rows={rows} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} value={fd[field] || ''} onChange={e => set(field, e.target.value)} style={base} />}
    </div>
  );
}

function S({ label, field, options, fd, set }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      <select value={fd[field] || ''} onChange={e => set(field, e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.white }}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Radio({ name, options, field, fd, set, otherField, otherLabel }) {
  return (
    <div>
      {options.map(o => (
        <label key={o.v} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="radio" name={name} value={o.v} checked={fd[field] === o.v} onChange={() => set(field, o.v)} style={{ marginTop: 2, accentColor: C.navy }} />
          {o.l}
        </label>
      ))}
      {otherField && fd[field] === 'other' && (
        <div style={{ marginTop: 4 }}>
          <input value={fd[otherField] || ''} onChange={e => set(otherField, e.target.value)} placeholder={otherLabel || 'Specify…'} style={{ width: '100%', padding: '7px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        </div>
      )}
    </div>
  );
}

function BoxSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18, padding: '14px 16px', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>{title}</div>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = [
  { id: 's1', label: '§1 Provider' },
  { id: 's2', label: '§2 Patient ⚠' },
  { id: 's3', label: '§3 History' },
  { id: 's4', label: '§4 Treatment' },
  { id: 's5', label: '§5 Rationale' },
  { id: 's67', label: '§6–7 Docs & Consent' },
];

export default function StepReview({ provider, formData, setFormData, onPrint }) {
  const [tab, setTab] = useState('s3');

  const set = (k, v) => setFormData(f => ({ ...f, [k]: v }));
  const fp = { fd: formData, set };
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' };
  const full = { gridColumn: '1/-1' };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: '0 0 2px' }}>Review & Edit Form</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>AI-extracted fields shown below — <strong>review carefully before downloading.</strong></p>
        </div>
        <button
          onClick={onPrint}
          style={{ background: C.navy, color: C.white, border: `2px solid ${C.gold}`, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.target.style.background = C.blue}
          onMouseLeave={e => e.target.style.background = C.navy}
        >
          ⬇ Print / Save PDF
        </button>
      </div>

      {/* AI warning banner */}
      <div style={{ background: '#FEF2F2', border: `1px solid #FCA5A5`, borderRadius: 8, padding: '9px 14px', marginBottom: 16, fontSize: 12, color: '#7B1313', display: 'flex', gap: 8 }}>
        <strong>⚠</strong> AI-generated content — verify all fields before submission. You are responsible for the accuracy of the final form.
      </div>

      {/* Tab bar */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '10px 10px 0 0', display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', fontSize: 12, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
            fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? C.navy : C.muted,
            background: tab === t.id ? C.blueLight : 'transparent',
            borderBottom: tab === t.id ? `3px solid ${C.navy}` : '3px solid transparent',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 22, minHeight: 400 }}>

        {/* ── §1 Provider ── */}
        {tab === 's1' && (
          <div>
            <div style={{ background: C.blueLight, border: `1px solid #BDD6F0`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 10 }}>Auto-filled from selected provider profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
                <div><strong>Name:</strong> Dr. {provider.firstName} {provider.lastName}</div>
                <div><strong>CPSO:</strong> {provider.cpso}</div>
                <div><strong>Specialty:</strong> {provider.specialty}</div>
                <div><strong>Tel:</strong> {provider.tel}</div>
                <div><strong>Fax:</strong> {provider.fax}</div>
                <div><strong>Email:</strong> {provider.email}</div>
                <div style={full}><strong>Hospital:</strong> {provider.hospital}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.muted }}>To change, click "← New Form" and select a different provider.</p>
          </div>
        )}

        {/* ── §2 Patient PHI ── */}
        {tab === 's2' && (
          <div style={{ padding: 24, background: C.amberLight, border: `2px solid ${C.amberBorder}`, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.amber, marginBottom: 10 }}>Section 2 — Patient PHI — Complete Manually</div>
            <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              Patient name, date of birth, OHIN, gender, height, weight, and BSA must be entered <strong>by hand on the printed form</strong>.<br /><br />
              This tool does not process or store patient identifying information.
            </p>
          </div>
        )}

        {/* ── §3 Medical History ── */}
        {tab === 's3' && (
          <div>
            <div style={g2}>
              <div style={full}><F label="a. Cancer Diagnosis (requested indication)" field="cancerDx" type="textarea" rows={2} {...fp} /></div>
              <F label="b. Grade of Cancer" field="grade" {...fp} />
              <F label="c. Cancer Stage" field="stage" {...fp} />
              <S label="Stage Type" field="stageType" options={[{ v: 'Clinical', l: 'Clinical' }, { v: 'Pathological', l: 'Pathological' }]} {...fp} />
              <F label="d. Performance Status Score" field="perfScore" {...fp} />
              <S label="e. Scale" field="perfScale" options={[{ v: 'ECOG', l: 'ECOG' }, { v: 'Karnofsky', l: 'Karnofsky' }]} {...fp} />
              <div style={full}><F label="f. Relevant Comorbidities" field="comorbidities" type="textarea" rows={2} {...fp} /></div>
              <div style={full}><F label="g. Concomitant Medications" field="concomitantMeds" type="textarea" rows={2} {...fp} /></div>
            </div>

            {/* Prior Treatment Table */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>h. Prior Treatment Interventions</div>
            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#EEF3FA' }}>
                    {['Start Date', 'Intervention / Drug', 'Dose', 'Frequency', 'Duration / Cycles', 'Treatment Response', ''].map(h => (
                      <th key={h} style={{ padding: '6px 8px', border: `1px solid ${C.border}`, textAlign: 'left', fontSize: 11, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.priorTx.map((tx, i) => (
                    <tr key={tx.id || i}>
                      {['startDate', 'drug', 'dose', 'freq', 'duration', 'response'].map(k => (
                        <td key={k} style={{ padding: 3, border: `1px solid ${C.border}` }}>
                          <input
                            value={tx[k] || ''}
                            onChange={e => {
                              const upd = formData.priorTx.map((r, ri) => ri === i ? { ...r, [k]: e.target.value } : r);
                              setFormData(f => ({ ...f, priorTx: upd }));
                            }}
                            style={{ width: '100%', border: 'none', padding: '5px 7px', fontSize: 12, fontFamily: 'inherit', outline: 'none', minWidth: k === 'response' ? 180 : 75 }}
                          />
                        </td>
                      ))}
                      <td style={{ padding: 3, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                        <button onClick={() => setFormData(f => ({ ...f, priorTx: f.priorTx.filter((_, ri) => ri !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 15, padding: 2 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setFormData(f => ({ ...f, priorTx: [...f.priorTx, { id: makeUid(), startDate: '', drug: '', dose: '', freq: '', duration: '', response: '' }] }))} style={{ background: 'none', border: `1px dashed ${C.blue}`, color: C.blue, borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>
              + Add Row
            </button>
          </div>
        )}

        {/* ── §4 Treatment ── */}
        {tab === 's4' && (
          <div>
            <div style={g2}>
              <F label="a. Drug — Generic Name" field="drugGeneric" {...fp} />
              <F label="a. Drug — Brand Name" field="drugBrand" {...fp} />
              <F label="b. DIN" field="din" {...fp} />
              <S label="c. Dosage Form" field="dosageForm" options={[{ v: 'IV', l: 'IV' }, { v: 'SC', l: 'SC' }, { v: 'PO', l: 'PO' }, { v: 'Other', l: 'Other' }]} {...fp} />
              <S label="d. Treatment Location" field="txLocation" options={[{ v: 'Hospital/Cancer Centre', l: 'Hospital / Cancer Centre' }, { v: 'Out-patient community', l: 'Out-patient community (e.g. patient\'s home)' }, { v: 'Other', l: 'Other' }]} {...fp} />
              {(formData.txLocation === 'Hospital/Cancer Centre' || formData.txLocation === 'Other') && <F label="Specify" field="txLocationSpec" {...fp} />}
              <div style={full}><F label="e. Planned Treatment Regimen (dose, frequency, route, combinations)" field="plannedRegimen" type="textarea" rows={3} {...fp} /></div>
              <div style={full}><F label="f. Literature Basis & Rationale for Any Modifications" field="regimenRationale" type="textarea" rows={3} {...fp} /></div>
              <F label="g. No. of Cycles" field="durationCycles" {...fp} />
              <F label="g. No. of Months" field="durationMonths" {...fp} />
              <F label="h. Anticipated Start Date" field="startDate" type="date" {...fp} />
              <div />
              <div style={full}><F label="i. Treatment Response Assessment (e.g. CT scan after 8 weeks)" field="responseAssessment" type="textarea" rows={2} {...fp} /></div>
              <div style={full}><F label="j. Stopping Criteria" field="stoppingCriteria" type="textarea" rows={2} {...fp} /></div>
              <F label="k. Treatment Cost (per unit / vial)" field="treatmentCost" {...fp} />
            </div>

            <BoxSection title="l. Previous Funding Applications">
              {[
                { key: 'EAP', label: 'Exceptional Access Program', outKey: 'fundingEAPOut', opts: ['Rejected', 'Re-directed to CBCRP'] },
                { key: 'NDFP', label: 'New Drug Funding Program', outKey: 'fundingNDFPOut', opts: ['Rejected', 'Re-directed to CBCRP'] },
                { key: 'Mfr', label: "Manufacturer's Program (Patient Assistance)", outKey: 'fundingMfrOut', opts: ['Rejected', 'Partial Coverage'] },
              ].map(({ key, label, outKey, opts }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer', minWidth: 260 }}>
                    <input type="checkbox" checked={formData[`funding${key}`] || false} onChange={e => set(`funding${key}`, e.target.checked)} style={{ accentColor: C.navy }} />
                    {label}
                  </label>
                  {formData[`funding${key}`] && (
                    <select value={formData[outKey] || ''} onChange={e => set(outKey, e.target.value)} style={{ fontSize: 12, padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 5 }}>
                      <option value="">— Outcome —</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.fundingHosp || false} onChange={e => set('fundingHosp', e.target.checked)} style={{ accentColor: C.navy }} />
                Hospital Budget — not covered for this indication
              </label>
            </BoxSection>

            <div style={g2}>
              <S label="m. Currently receiving public program funding?" field="currentFunding" options={[{ v: 'No', l: 'No' }, { v: 'Yes', l: 'Yes — specify below' }]} {...fp} />
              {formData.currentFunding === 'Yes' && <F label="Specify drug(s) and program" field="currentFundingDetail" {...fp} />}
            </div>
          </div>
        )}

        {/* ── §5 Rationale ── */}
        {tab === 's5' && (
          <div>
            <BoxSection title="n. Why can't patient access requested drug via clinical trial in Ontario?">
              <Radio name="clinTrialN" field="clinicalTrialN" otherField="clinicalTrialNOther" {...fp} options={[
                { v: 'no_trials', l: 'There are no clinical trials for this drug and the patient\'s type of cancer.' },
                { v: 'assessed_ineligible', l: 'The patient has been assessed and did not meet clinical trial eligibility criteria.' },
                { v: 'other', l: 'Other, specify:' },
              ]} />
            </BoxSection>

            <F label="a. Cancer Incidence (cite references)" field="cancerIncidence" type="textarea" rows={2} {...fp} />
            <F label="b. Estimated Ontario Patients/Year for This Regimen" field="ontarioEstimate" type="textarea" rows={2} {...fp} />
            <F label="c. Rare Clinical Circumstance — Explanation" field="rareCircumstance" type="textarea" rows={3} {...fp} />
            <F label="d. Survival WITHOUT Treatment (months)" field="survivalWithout" type="textarea" rows={2} {...fp} />
            <F label="e. Survival Benefit WITH Treatment" field="survivalWith" type="textarea" rows={2} {...fp} />
            <F label="f. Why Other Treatment Options Are Not Appropriate" field="whyOthersNA" type="textarea" rows={3} {...fp} />
            <F label="g. Expected Benefits vs. Best Supportive Care (survival + QoL)" field="expectedBenefits" type="textarea" rows={3} {...fp} />

            <BoxSection title="h. Why is a clinical trial with another intervention not an option?">
              <Radio name="clinTrialH" field="clinicalTrialH" otherField="clinicalTrialHOther" {...fp} options={[
                { v: 'no_trials_ontario', l: 'A clinical trial in Ontario is not available for this patient\'s type of cancer.' },
                { v: 'inferior', l: 'A clinical trial with another intervention is an inferior option for this patient.' },
                { v: 'assessed_ineligible', l: 'Patient was assessed for clinical trials and is not eligible.' },
                { v: 'not_assessed', l: 'Patient was not assessed for clinical trials but is likely ineligible.' },
                { v: 'other', l: 'Other, specify:' },
              ]} />
            </BoxSection>

            <F label="i. Quality of Life Improvement (specific symptoms expected to improve)" field="qolImprovement" type="textarea" rows={3} {...fp} />
            <F label="j. Published Evidence Summary (trial names, response rates, PFS, OS)" field="publishedEvidence" type="textarea" rows={4} {...fp} />

            <div style={g2}>
              <S label="k. Contraindications to requested drug?" field="contraindications" options={[{ v: 'No', l: 'No' }, { v: 'Yes', l: 'Yes — specify below' }]} {...fp} />
              {formData.contraindications === 'Yes' && <F label="Specify contraindications" field="contraindicationsDetail" {...fp} />}
            </div>

            <F label="l. Safety / Toxicity Profile and Overall Risk for This Patient" field="safetyProfile" type="textarea" rows={3} {...fp} />

            <BoxSection title="m. Was this treatment recommended by another specialist?">
              <Radio name="specRec" field="specialistRec" otherField="specialistRecDetail" {...fp} options={[
                { v: 'No', l: 'No' },
                { v: 'MDC', l: 'Yes — recommended by a Multi-Disciplinary Cancer Conference or equivalent collaborative meeting.' },
                { v: 'Specialist', l: 'Yes — recommended by a specialist who has seen and assessed the patient.' },
                { v: 'Other', l: 'Other, specify:' },
              ]} />
            </BoxSection>

            <F label="n. If Drug NOT Approved — Alternative Treatment Plan" field="ifNotApproved" type="textarea" rows={3} {...fp} />
            <F label="o. Additional Information Supporting This CBCRP Request" field="additionalInfo" type="textarea" rows={4} {...fp} />
          </div>
        )}

        {/* ── §6-7 Docs & Consent ── */}
        {tab === 's67' && (
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 12 }}>§6 Supporting Documentation Checklist</div>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 14px' }}>Mark what you will include when submitting via eClaims. Items 1–4 are required.</p>
            {[
              { k: 'docPublished', l: '1. Published evidence of clinical benefit and tolerability', req: true },
              { k: 'docConsult', l: '2. Consult notes that informed the treatment plan (transplant, surgical, radiation, MDC)', req: true },
              { k: 'docClinicNotes', l: '3. Clinic notes from last two visits (current status, prior therapies, rationale for omitting other interventions)', req: true },
              { k: 'docLabwork', l: '4. Labwork from last two clinic visits', req: true },
              { k: 'docPathology', l: '5. Pathology report', req: false },
              { k: 'docBiopsy', l: '6. Bone marrow biopsy / Aspirate', req: false },
              { k: 'docImaging', l: '7. Imaging reports for last two scans', req: false },
              { k: 'docSAP', l: '8. SAP approval letter (for drugs not approved by Health Canada)', req: false },
              { k: 'docCytogenetic', l: '9. Cytogenetic / Molecular Marker Testing', req: false },
              { k: 'docDecision', l: '10. Decision letters from prior funding programs or patient assistance programs', req: false },
            ].map(({ k, l, req }) => (
              <label key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 9, cursor: 'pointer', padding: '9px 12px', background: formData[k] ? '#EEF6FF' : '#F8FAFC', borderRadius: 7, border: `1px solid ${formData[k] ? C.blue : C.border}`, transition: 'all 0.15s', fontSize: 13 }}>
                <input type="checkbox" checked={formData[k] || false} onChange={e => set(k, e.target.checked)} style={{ marginTop: 1, flexShrink: 0, accentColor: C.navy }} />
                <span>{l} {req && <span style={{ color: C.red, fontWeight: 600, fontSize: 11 }}>— Required</span>}</span>
              </label>
            ))}

            <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, margin: '22px 0 12px' }}>§7 Consents & Approvals</div>
            {[
              { k: 'certifyAccurate', l: 'I certify that the information in this Request Form is true and accurate, to the best of my knowledge.' },
              { k: 'patientConsent', l: 'I confirm that the patient, or relevant substitute decision-maker, has provided express consent for the disclosure and use of their PHI as described in the form.' },
            ].map(({ k, l }) => (
              <label key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: 'pointer', padding: '10px 14px', background: formData[k] ? '#F0FDF4' : '#F8FAFC', borderRadius: 7, border: `1px solid ${formData[k] ? '#86EFAC' : C.border}`, fontSize: 13, transition: 'all 0.15s' }}>
                <input type="checkbox" checked={formData[k] || false} onChange={e => set(k, e.target.checked)} style={{ marginTop: 1, flexShrink: 0, accentColor: C.green }} />
                {l}
              </label>
            ))}
            <div style={{ maxWidth: 220 }}><F label="Date Completed" field="dateCompleted" type="date" {...fp} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
