// src/utils/printHTML.js
// Generates a print-ready HTML document replicating the CBCRP form layout
// with UHN / Princess Margaret branding

export function generatePrintHTML(provider, f) {
  const v = (key) => f[key] || '';

  const row = (label, value, isPhiPlaceholder = false) => `
    <tr>
      <td style="width:34%;padding:7px 10px;font-size:11px;color:#444;border:1px solid #ccc;background:#f7f8fa;vertical-align:top;font-weight:500;">${label}</td>
      <td style="padding:7px 10px;font-size:12px;border:1px solid #ccc;vertical-align:top;${isPhiPlaceholder ? 'color:#9B2C2C;font-style:italic;background:#FFF5F5;' : ''}">${value || (isPhiPlaceholder ? '[ COMPLETE MANUALLY — PATIENT PHI ]' : '—')}</td>
    </tr>`;

  const section = (title, content) => `
    <div style="margin-bottom:20px;">
      <div style="background:#002B5C;color:#ffffff;padding:7px 12px;font-size:12px;font-weight:700;letter-spacing:0.3px;">${title}</div>
      <table style="width:100%;border-collapse:collapse;">${content}</table>
    </div>`;

  const priorTxRows = (f.priorTx || []).map(t => `
    <tr>
      ${['startDate', 'drug', 'dose', 'freq', 'duration', 'response']
        .map(k => `<td style="padding:5px 8px;font-size:11px;border:1px solid #ccc;vertical-align:top;">${t[k] || '—'}</td>`)
        .join('')}
    </tr>`).join('') || `<tr><td colspan="6" style="padding:8px;font-size:11px;color:#888;border:1px solid #ccc;text-align:center;">None recorded</td></tr>`;

  const fundingApplied = [
    f.fundingEAP ? `Exceptional Access Program — ${f.fundingEAPOut || 'outcome not specified'}` : null,
    f.fundingNDFP ? `New Drug Funding Program — ${f.fundingNDFPOut || 'outcome not specified'}` : null,
    f.fundingMfr ? `Manufacturer's Program — ${f.fundingMfrOut || 'outcome not specified'}` : null,
    f.fundingHosp ? 'Hospital Budget — not covered for this indication' : null,
  ].filter(Boolean).join('<br>') || 'None applied';

  const clinTrialNMap = {
    no_trials: 'No clinical trials exist for this drug and this type of cancer.',
    assessed_ineligible: 'Patient was assessed and did not meet clinical trial eligibility criteria.',
    other: v('clinicalTrialNOther') || 'Other — see notes',
  };

  const clinTrialHMap = {
    no_trials_ontario: 'No clinical trial is available in Ontario for this type of cancer.',
    inferior: 'A clinical trial with another intervention is an inferior option for this patient.',
    assessed_ineligible: 'Patient was assessed for clinical trials and is not eligible.',
    not_assessed: 'Patient was not assessed for clinical trials but is likely ineligible.',
    other: v('clinicalTrialHOther') || 'Other — see notes',
  };

  const specialistRecMap = {
    No: 'No',
    MDC: 'Yes — recommended by a Multi-Disciplinary Cancer Conference or equivalent collaborative meeting.',
    Specialist: 'Yes — recommended by a specialist who has seen and assessed the patient.',
    Other: `Other: ${v('specialistRecDetail')}`,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CBCRP Request Form — ${provider.lastName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #1A2332; margin: 0; padding: 20px; max-width: 920px; }
    table { width: 100%; border-collapse: collapse; }
    h1 { font-size: 17px; color: #002B5C; margin: 4px 0; }
    h2 { font-size: 13px; color: #444; margin: 2px 0; font-weight: 400; }
    .header-bar { background: #002B5C; color: #fff; padding: 14px 18px; margin-bottom: 0; }
    .gold-bar { background: #FFD100; height: 4px; margin-bottom: 16px; }
    .ai-warning { background: #FEF2F2; border: 2px solid #C0392B; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #7B1313; border-radius: 4px; }
    .phi-notice { background: #FFFBEB; border: 1px solid #FCD34D; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; color: #92600A; border-radius: 4px; }
    .footer { margin-top: 20px; padding: 10px; border-top: 2px solid #002B5C; font-size: 10px; color: #666; }
    .gold-accent { color: #C9A800; font-weight: 700; }
    @media print {
      body { padding: 8px; }
      .ai-warning { border: 2px solid #C0392B !important; }
    }
  </style>
</head>
<body>

  <div class="header-bar">
    <div style="font-size:11px;opacity:0.8;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px;">University Health Network · Princess Margaret Cancer Centre</div>
    <div style="font-weight:700;font-size:15px;">Department of Medical Oncology and Hematology</div>
  </div>
  <div class="gold-bar"></div>

  <div style="text-align:center;margin-bottom:16px;">
    <h1>Case-by-Case Review Program (CBCRP) — Request Form</h1>
    <h2>Ontario Health · Version 5.0 · 11-Jan-2022</h2>
  </div>

  <div class="ai-warning">
    <strong>⚠ AI-GENERATED CONTENT — PHYSICIAN REVIEW REQUIRED BEFORE SUBMISSION</strong><br>
    This form was pre-filled using the DMOH Clinical Form Assistant (personal productivity tool). All fields must be reviewed and verified by the treating physician. The treating physician is solely responsible for the accuracy and completeness of this submission. Patient information in Section 2 must be completed manually.
  </div>

  <div class="phi-notice">
    🔒 <strong>Section 2 (Patient Information) has been intentionally left blank.</strong> Enter patient name, date of birth, OHIN, gender, height, weight, and BSA manually on the printed form before submission.
  </div>

  ${section('Section 1: Applicant Information', `
    ${row('Treating Oncologist', `Dr. ${provider.firstName} ${provider.lastName}`)}
    ${row('Specialty', provider.specialty)}
    ${row('CPSO No.', provider.cpso)}
    ${row('Telephone', provider.tel)}
    ${row('Fax', provider.fax)}
    ${row('Email', provider.email)}
    ${row('Affiliated Hospital / Cancer Centre', provider.hospital)}
  `)}

  ${section('Section 2: Patient Information — ⚠ COMPLETE MANUALLY', `
    ${row('First Name', '', true)}
    ${row('Last Name', '', true)}
    ${row('Date of Birth (MM/DD/YY)', '', true)}
    ${row('OHIN', '', true)}
    ${row('Gender', '', true)}
    ${row('Height (cm) / Weight (kg) / BSA (m²)', '', true)}
  `)}

  ${section('Section 3: Patient Medical History', `
    ${row('a. Cancer Diagnosis (requested indication)', v('cancerDx'))}
    ${row('b. Grade of Cancer', v('grade'))}
    ${row('c. Cancer Stage', `${v('stage')} (${v('stageType')})`)}
    ${row('d/e. Performance Status', `${v('perfScore')} — ${v('perfScale')} scale`)}
    ${row('f. Relevant Comorbidities', v('comorbidities'))}
    ${row('g. Concomitant Medications', v('concomitantMeds'))}
  `)}

  <div style="margin-bottom:20px;">
    <div style="background:#002B5C;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;">h. Prior Treatment Interventions</div>
    <table>
      <thead>
        <tr style="background:#EEF3FA;">
          ${['Start Date','Intervention / Drug','Dose','Frequency','Duration / Cycles','Treatment Response']
            .map(h => `<th style="padding:6px 8px;font-size:11px;border:1px solid #ccc;text-align:left;font-weight:600;">${h}</th>`)
            .join('')}
        </tr>
      </thead>
      <tbody>${priorTxRows}</tbody>
    </table>
  </div>

  ${section('Section 4: Treatment Regimen', `
    ${row('a. Requested Drug — Generic Name', v('drugGeneric'))}
    ${row('a. Requested Drug — Brand Name', v('drugBrand'))}
    ${row('b. DIN', v('din'))}
    ${row('c. Dosage Form', v('dosageForm'))}
    ${row('d. Treatment Location', v('txLocation') + (v('txLocationSpec') ? ` — ${v('txLocationSpec')}` : ''))}
    ${row('e. Planned Treatment Regimen', v('plannedRegimen'))}
    ${row('f. Literature Basis / Rationale for Modifications', v('regimenRationale'))}
    ${row('g. Planned Duration', [v('durationCycles') && `${v('durationCycles')} cycles`, v('durationMonths') && `${v('durationMonths')} months`].filter(Boolean).join(' / ') || '—')}
    ${row('h. Anticipated Start Date', v('startDate'))}
    ${row('i. Treatment Response Assessment', v('responseAssessment'))}
    ${row('j. Stopping Criteria', v('stoppingCriteria'))}
    ${row('k. Treatment Cost (per unit)', v('treatmentCost'))}
    ${row('l. Previous Funding Applications', fundingApplied)}
    ${row('m. Current Public Program Funding', v('currentFunding') === 'Yes' ? `Yes — ${v('currentFundingDetail')}` : 'No')}
  `)}

  <div style="margin-bottom:20px;">
    <div style="background:#002B5C;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;">n. Why can't patient access the requested drug via clinical trial in Ontario?</div>
    <table><tbody>${row('Reason', clinTrialNMap[v('clinicalTrialN')] || '—')}</tbody></table>
  </div>

  ${section('Section 5: Clinical Rationale', `
    ${row('a. Cancer Incidence (with references)', v('cancerIncidence'))}
    ${row('b. Estimated Ontario Patients/Year for This Regimen', v('ontarioEstimate'))}
    ${row('c. Rare Clinical Circumstance', v('rareCircumstance'))}
    ${row('d. Survival WITHOUT Treatment (months)', v('survivalWithout'))}
    ${row('e. Survival Benefit WITH Treatment', v('survivalWith'))}
    ${row('f. Why Other Options Are Not Appropriate', v('whyOthersNA'))}
    ${row('g. Expected Benefits vs. Best Supportive Care', v('expectedBenefits'))}
    ${row('h. Why Clinical Trial With Another Intervention Is Not an Option', clinTrialHMap[v('clinicalTrialH')] || '—')}
    ${row('i. Quality of Life Improvement', v('qolImprovement'))}
    ${row('j. Published Evidence Summary', v('publishedEvidence'))}
    ${row('k. Contraindications', v('contraindications') === 'Yes' ? `Yes — ${v('contraindicationsDetail')}` : 'No')}
    ${row('l. Safety / Toxicity Profile', v('safetyProfile'))}
    ${row('m. Specialist Recommendation', specialistRecMap[v('specialistRec')] || '—')}
    ${row('n. If Drug NOT Approved — Alternative Plan', v('ifNotApproved'))}
    ${row('o. Additional Supporting Information', v('additionalInfo'))}
  `)}

  <div style="margin-top:22px;padding:14px;border:1px solid #ccc;background:#FAFAFA;">
    <strong>Section 7: Consents &amp; Approvals</strong><br><br>
    ☐ &nbsp;I certify that the information in this Request Form is true and accurate, to the best of my knowledge.<br><br>
    ☐ &nbsp;I confirm that the patient, or relevant substitute decision-maker, has provided express consent for the disclosure and use of their PHI.<br><br>
    <table style="width:auto;margin-top:12px;">
      <tr>
        <td style="padding-right:40px;"><strong>Date Completed:</strong> &nbsp;${v('dateCompleted') || '_______________'}</td>
        <td><strong>Signature:</strong> &nbsp;&nbsp;_________________________________________</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <span class="gold-accent">DMOH Clinical Form Assistant</span> — Personal Productivity Tool &nbsp;|&nbsp;
    Not an official UHN product &nbsp;|&nbsp;
    AI-generated content must be verified by the treating physician before submission &nbsp;|&nbsp;
    Submit via eClaims: <strong>OH-CCO_cbcrp@ontariohealth.ca</strong>
  </div>

</body>
</html>`;
}
