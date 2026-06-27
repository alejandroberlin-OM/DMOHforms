// api/extract.js
// Two sequential API calls to avoid JSON truncation:
// Call 1 → Sections 3 & 4 (clinical data + treatment regimen)
// Call 2 → Section 5 (clinical rationale + evidence)
// Results merged before returning to frontend

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes, drugName } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
    return res.status(400).json({ error: 'Clinical notes are required' });
  }

  const drug = (drugName || '').trim() || 'the requested drug';
  const n = notes.trim();

  // ── Shared rules injected into both prompts ────────────────────────────
  const RULES = `
MANDATORY RULES:
1. COMPLETE ALL FIELDS — never leave empty, never write "not specified." If info is missing from notes, generate a realistic clinically appropriate statement based on the cancer type and ${drug}.
2. BE COMPELLING — goal is to OBTAIN FUNDING. Use assertive clinical language. Avoid hedging. Every sentence must justify approval.
3. REAL EVIDENCE ONLY — only reference real published trials by correct name. Never fabricate trial names, authors, or statistics. If uncertain of exact numbers, be accurate and general rather than specific and invented.
4. CONCISE BUT COMPLETE — 2-4 sentences per field maximum. Reviewers value precision. Do not write essays.
5. DRUG-SPECIFIC — tailor every field to ${drug} specifically: its mechanism, its trials, its toxicity profile, its standard dosing.
`;

  // ── CALL 1: Sections 3 & 4 ────────────────────────────────────────────
  const prompt1 = `You are an expert medical writer completing a Canadian CBCRP prior authorization form for ${drug}.
${RULES}

REQUESTED DRUG: ${drug}

Return ONLY valid JSON — no markdown, no explanation.

{
  "cancerDx": "Full diagnosis: histology, molecular subtype, stage as the requested indication",
  "grade": "Cancer grade if applicable, else empty string",
  "stage": "Stage e.g. IV, IIIB",
  "stageType": "Clinical or Pathological",
  "perfScore": "ECOG score as number e.g. 1",
  "perfScale": "ECOG or Karnofsky",
  "comorbidities": "Relevant comorbidities and how they affect ${drug} risk-benefit. 2-3 sentences.",
  "concomitantMeds": "Current medications with doses. Flag relevant drug interactions with ${drug}.",
  "priorTx": [
    {
      "startDate": "Date or approximate timeframe",
      "drug": "Drug name and regimen",
      "dose": "Dose and schedule",
      "freq": "Frequency",
      "duration": "Duration or cycles",
      "response": "Specific response: progression / inadequate response / toxicity requiring discontinuation — be clinical and specific"
    }
  ],
  "drugGeneric": "Generic name of ${drug}",
  "drugBrand": "Brand name of ${drug}",
  "din": "DIN if known else empty",
  "dosageForm": "IV or SC or PO or Other",
  "txLocation": "Hospital/Cancer Centre or Out-patient community or Other",
  "txLocationSpec": "Hospital name if mentioned",
  "plannedRegimen": "Standard approved dosing for ${drug} in this indication. Include dose, frequency, route, combinations. 2-3 sentences.",
  "regimenRationale": "Cite the real published trial that established this regimen. Explain any dose modifications. 2-3 sentences.",
  "durationCycles": "Number of cycles if applicable",
  "durationMonths": "Number of months — based on standard treatment duration for ${drug}",
  "startDate": "Anticipated start date if mentioned, else empty",
  "responseAssessment": "Imaging modality + anatomical areas + timing + assessment criteria (RECIST 1.1 etc.) + disease-specific marker monitoring. 2-3 sentences.",
  "stoppingCriteria": "Two objective measurable criteria: radiographic progression definition + biochemical/marker criteria + intolerable toxicity threshold. 2-3 sentences.",
  "treatmentCost": "Cost per unit if mentioned, else empty",
  "clinicalTrialN": "no_trials or assessed_ineligible or other",
  "clinicalTrialNOther": "Specify if other, else empty"
}

CLINICAL NOTES:
${n}`;

  // ── CALL 2: Section 5 ─────────────────────────────────────────────────
  const prompt2 = `You are an expert medical writer completing Section 5 (Clinical Rationale) of a Canadian CBCRP prior authorization form for ${drug}.
${RULES}

REQUESTED DRUG: ${drug}

Return ONLY valid JSON — no markdown, no explanation.

{
  "cancerIncidence": "Real incidence data for this cancer type in Canada/Ontario. Cite Canadian Cancer Statistics or real registry data if known. 1-2 sentences.",
  "ontarioEstimate": "Estimated Ontario patients per year who would be candidates for ${drug} in this indication. Base on incidence and trial eligibility criteria. 1-2 sentences.",
  "rareCircumstance": "CRITICAL FIELD — compelling specific explanation of why this patient constitutes a rare clinical circumstance. Reference specific molecular findings, treatment history, contraindications, or clinical features making ${drug} uniquely appropriate. 3-4 sentences.",
  "survivalWithout": "Evidence-based survival estimate without treatment, grounded in published natural history data for this cancer type and stage after failure of prior therapies. 1-2 sentences.",
  "survivalWith": "Survival benefit with ${drug} referencing real trial data — trial name, HR, median PFS or OS improvement. REAL DATA ONLY. 2-3 sentences.",
  "whyOthersNA": "Specific compelling explanation of why each available alternative is not appropriate for this patient. Be patient-specific. 3-4 sentences.",
  "expectedBenefits": "Evidence-based expected benefits of ${drug} vs best supportive care — reference real trial data for PFS, OS, QoL outcomes. 2-3 sentences.",
  "clinicalTrialH": "no_trials_ontario or inferior or assessed_ineligible or not_assessed or other",
  "clinicalTrialHOther": "Specify if other, else empty",
  "qolImprovement": "Specific symptoms expected to improve with ${drug} based on its mechanism and published PRO data. Connect to this patient's actual symptom burden. 2-3 sentences.",
  "publishedEvidence": "Key pivotal trial(s) for ${drug} in this indication: trial name, design, population, primary endpoint with results (HR, p-value if known), key secondary endpoints, regulatory approval status. REAL DATA ONLY — never fabricate. 4-6 sentences.",
  "contraindications": "No or Yes",
  "contraindicationsDetail": "Specify if yes, else empty",
  "safetyProfile": "Known toxicity profile of ${drug} specific to this drug and this patient's comorbidities. Reference grade 3-4 AE rates from real trials. Include monitoring plan. 3-4 sentences.",
  "specialistRec": "No or MDC or Specialist or Other",
  "specialistRecDetail": "Specify if Other, else empty",
  "ifNotApproved": "Honest compelling statement of alternative plan if ${drug} not approved. State the realistic alternative and its inferiority. 2-3 sentences.",
  "additionalInfo": "Any additional information strengthening the case — unusual patient features, exceptional circumstances, time-sensitivity. 2-3 sentences or empty if nothing to add."
}

CLINICAL NOTES:
${n}`;

  // ── Helper: call Anthropic ─────────────────────────────────────────────
  async function callClaude(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }
    const data = await response.json();
    const text = (data.content || []).map(c => c.text || '').join('');
    const clean = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  }

  // ── Run both calls sequentially ────────────────────────────────────────
  try {
    const [part1, part2] = await Promise.all([
      callClaude(prompt1),
      callClaude(prompt2),
    ]);

    // Merge both results
    const fields = { ...part1, ...part2 };

    // Ensure priorTx has IDs (frontend needs them for keys)
    if (fields.priorTx) {
      fields.priorTx = fields.priorTx.map((t, i) => ({
        ...t,
        id: t.id || `tx-${i}-${Date.now()}`,
      }));
    }

    return res.status(200).json({ fields });

  } catch (error) {
    console.error('Extract error:', error);
    return res.status(500).json({
      error: 'Failed to process notes. Please try again.',
    });
  }
}
