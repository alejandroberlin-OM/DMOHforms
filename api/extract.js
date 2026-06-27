// api/extract.js
// Vercel serverless function — calls Anthropic API with physician's de-identified notes
// Includes comprehensive prompt rules to generate compelling, complete, evidence-based forms

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes, drugName } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
    return res.status(400).json({ error: 'Clinical notes are required' });
  }

  const drug = (drugName || '').trim() || 'the requested drug';

  const prompt = `You are an expert medical writer helping a Canadian oncologist complete a Case-by-Case Review Program (CBCRP) prior authorization form for Ontario Health. Your goal is to generate a compelling, complete, evidence-based form that will maximize the likelihood of funding approval.

REQUESTED DRUG: ${drug}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES — FOLLOW EVERY ONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — COMPLETE ALL FIELDS
Every field must contain a substantive, clinically appropriate answer. Never leave a field empty, never write "not specified," "unknown," or "N/A" in a text field. If the clinical notes do not explicitly address a field, generate a realistic and clinically appropriate statement based on:
  - The cancer type, stage, and clinical context described
  - The known mechanism, evidence base, and standard use of ${drug}
  - Standard Canadian oncology practice for this indication
The reviewer should never see a blank or vague field.

RULE 2 — BE COMPELLING AND GOAL-ORIENTED
The purpose of this form is to OBTAIN FUNDING. Ontario Health reviewers read dozens of applications — yours must stand out as clinically rigorous and well-justified. Write every field as if it is part of a legal argument for why this patient deserves access to ${drug}:
  - Use assertive, confident clinical language ("demonstrates," "requires," "is expected to") — avoid hedging ("may," "might," "possibly," "could")
  - Front-load the strongest clinical justification in each field
  - Be concise but complete — every sentence should add value
  - Frame everything from the patient's perspective: what happens to this patient without this drug?
  - Anticipate and preemptively address likely objections (why other drugs won't work, why a trial isn't an option, why this is urgent)

RULE 3 — REAL EVIDENCE ONLY — NO FABRICATED DATA
When completing the published evidence field (5j) and survival estimates (5d, 5e):
  - ONLY reference real, published clinical trials with their correct names (e.g., FLAURA, MONARCH-3, KEYNOTE-189, COU-AA-302, TITAN, ARCHES, ENZAMET, etc.)
  - Include real, accurate efficacy data (overall response rate, progression-free survival, overall survival) from those trials
  - If you know the pivotal trial data for ${drug} in this indication with confidence, include specific numbers
  - If you are not certain of the exact statistics, write a compelling evidence summary using the trial name and general findings WITHOUT inventing specific numbers
  - NEVER fabricate trial names, author names, journal names, or statistics — invented references will discredit the entire application
  - It is better to be accurate and general than invented and specific

RULE 4 — TAILOR EVERYTHING TO ${drug}
Every section should be specific to ${drug} in this exact indication:
  - Survival estimates should reflect published data for ${drug} in this cancer type
  - Evidence summary should reference the actual pivotal trial(s) for ${drug}
  - Safety/toxicity profile should reflect the known adverse effects of ${drug} specifically
  - Why other options are not appropriate should explain why alternatives to ${drug} are inadequate for this specific patient

RULE 5 — PRIOR TREATMENT TABLE
  - List all prior treatments in chronological order (earliest first)
  - Be specific about treatment response using clinical language:
    "Disease progression after X cycles with rising [marker]"
    "Discontinued after X months due to Grade 3 [toxicity]"
    "Inadequate response — best response stable disease, then progression at restaging"
  - Each documented treatment failure directly strengthens the case for ${drug}
  - Include dates where available; if not available, use approximate timeframes

RULE 6 — RARE CIRCUMSTANCE (field: rareCircumstance)
This is one of the most scrutinized fields by CBCRP reviewers. It must:
  - Explain specifically why this patient's situation constitutes a rare clinical circumstance
  - Reference specific features: unusual mutation/biomarker, rare histology, treatment-refractory disease after multiple lines, specific contraindications to standard therapies, unique comorbidities that limit options
  - Be patient-specific and compelling — not generic
  - Connect directly to why ${drug} is the only or best remaining option

RULE 7 — SURVIVAL ESTIMATES (fields: survivalWithout, survivalWith)
  - For "without treatment": ground in published natural history data for this specific cancer type and stage. Example: "Without further systemic therapy, based on published natural history data for [indication] after failure of prior lines, median OS is approximately X months."
  - For "with treatment": reference the survival benefit observed in the pivotal trial for ${drug}. Example: "Based on the [Trial Name] trial, ${drug} demonstrated a median PFS of X months versus Y months with comparator (HR X.XX), representing a Z% reduction in risk of progression."
  - If exact numbers are uncertain, give ranges based on the general evidence base rather than fabricating specific figures

RULE 8 — STOPPING CRITERIA (field: stoppingCriteria)
Must be objective, specific, and measurable. Include at least two of:
  - Radiographic progression (e.g., "Progressive disease as defined by RECIST 1.1 criteria on imaging")
  - Biochemical/marker progression (e.g., "PSA rise ≥25% above nadir confirmed on two consecutive measurements ≥3 weeks apart")
  - Clinical deterioration (e.g., "Significant decline in performance status to ECOG ≥3 attributable to disease progression")
  - Intolerable toxicity (e.g., "Grade 3-4 toxicity requiring permanent discontinuation per institutional guidelines")

RULE 9 — TREATMENT RESPONSE ASSESSMENT (field: responseAssessment)
Must specify:
  - The imaging modality and specific anatomical areas (e.g., "CT scan of chest, abdomen and pelvis")
  - The timing (e.g., "after 2 cycles — approximately 6-8 weeks from initiation")
  - The criteria for assessment (e.g., "per RECIST 1.1 criteria")
  - Any disease-specific markers (PSA, CEA, CA-125, LDH, M-protein, etc.) and frequency

RULE 10 — QUALITY OF LIFE (field: qolImprovement)
Be specific about symptoms expected to improve. Do not be generic. Connect to this patient's actual symptom burden and the mechanism by which ${drug} addresses it.

RULE 11 — IF NOT APPROVED (field: ifNotApproved)
Be honest but compelling. State the realistic alternative: best supportive care, an inferior treatment option, or clinical trial (if available). Make clear what the consequence is for this patient if ${drug} is not funded.

RULE 12 — DO NOT FABRICATE FUNDING HISTORY
Only mark funding sources (EAP, NDFP, Manufacturer's program, Hospital budget) as applied if the clinical notes explicitly mention prior applications. Do not invent prior funding attempts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON. No markdown formatting, no code blocks, no preamble, no explanation.

{
  "cancerDx": "Full cancer diagnosis including histology, molecular subtype, and stage as the requested indication — be specific",
  "grade": "Cancer grade if applicable (e.g., Grade 3, high-grade) or empty string if not applicable",
  "stage": "Cancer stage (e.g., IV, IIIB) — be specific",
  "stageType": "Clinical or Pathological",
  "perfScore": "ECOG performance status score as a number (0, 1, 2, etc.)",
  "perfScale": "ECOG or Karnofsky",
  "comorbidities": "List of relevant comorbidities with clinical context — how do they affect treatment decisions or risk-benefit calculation for ${drug}",
  "concomitantMeds": "List of current medications with doses where known — flag any relevant drug interactions with ${drug}",
  "priorTx": [
    {
      "startDate": "Approximate date or timeframe",
      "drug": "Treatment name including drug and regimen",
      "dose": "Dose and schedule",
      "freq": "Frequency of administration",
      "duration": "Duration or number of cycles",
      "response": "Specific clinical response using assertive language: progression, inadequate response, toxicity requiring discontinuation, etc."
    }
  ],
  "drugGeneric": "Generic name of ${drug}",
  "drugBrand": "Brand name of ${drug}",
  "din": "DIN if known, else empty string",
  "dosageForm": "IV or SC or PO or Other",
  "txLocation": "Hospital/Cancer Centre or Out-patient community or Other",
  "txLocationSpec": "Specific hospital or cancer centre name if mentioned",
  "plannedRegimen": "Specific dose, frequency, route, and any combination partners — use the approved/standard dosing for ${drug} in this indication",
  "regimenRationale": "Cite the published evidence basis for this regimen. Reference the specific trial(s) that established this dosing. Explain any modifications from standard dosing with clinical justification.",
  "durationCycles": "Number of cycles planned if applicable",
  "durationMonths": "Number of months planned — base on standard treatment duration for this drug/indication",
  "startDate": "Anticipated start date if mentioned, else empty string",
  "responseAssessment": "Specific imaging modality, timing, anatomical areas, assessment criteria (RECIST 1.1, Cheson, etc.) and disease-specific marker monitoring schedule",
  "stoppingCriteria": "Two or more objective, measurable stopping criteria including radiographic progression definition, biochemical/marker criteria where applicable, and intolerable toxicity threshold",
  "treatmentCost": "Cost per unit or vial if mentioned or known, else empty string",
  "clinicalTrialN": "no_trials or assessed_ineligible or other",
  "clinicalTrialNOther": "Specify if other",
  "cancerIncidence": "Incidence of this specific cancer type in Canada or Ontario — cite real published statistics or cancer registry data if known (e.g., Canadian Cancer Statistics 2023, SEER data). If uncertain, provide a reasonable estimate with appropriate qualifier.",
  "ontarioEstimate": "Estimated number of Ontario patients per year who would be candidates for ${drug} in this specific indication — base on incidence data and treatment eligibility criteria from pivotal trials",
  "rareCircumstance": "Compelling, specific explanation of why this patient's situation constitutes a rare clinical circumstance. Reference specific molecular/biomarker findings, treatment history, contraindications, or clinical features that make this case unusual and ${drug} uniquely appropriate.",
  "survivalWithout": "Evidence-based estimate of survival without further treatment, grounded in published natural history data for this cancer type and stage after failure of prior therapies",
  "survivalWith": "Evidence-based estimate of survival benefit with ${drug}, referencing specific trial data (trial name, HR, median PFS/OS improvement) — do not fabricate statistics",
  "whyOthersNA": "Specific, compelling explanation of why each available alternative treatment option is not appropriate for this patient — include drug class alternatives, clinical trial options, and supportive care. Be patient-specific.",
  "expectedBenefits": "Evidence-based description of expected benefits of ${drug} compared to best supportive care — reference trial data for PFS, OS, and quality of life outcomes. Connect to this patient's specific clinical situation.",
  "clinicalTrialH": "no_trials_ontario or inferior or assessed_ineligible or not_assessed or other",
  "clinicalTrialHOther": "Specify if other",
  "qolImprovement": "Specific symptoms expected to improve with ${drug} based on its mechanism of action and published patient-reported outcome data from trials — connect to this patient's actual symptom burden",
  "publishedEvidence": "Summary of the key pivotal trial(s) supporting ${drug} for this indication. Include: trial name, design, patient population, primary endpoint results (with HR and p-value if known), key secondary endpoints, and regulatory approval status. REAL DATA ONLY — never fabricate trial names or statistics.",
  "contraindications": "No or Yes",
  "contraindicationsDetail": "If yes, specify contraindications and how they will be managed",
  "safetyProfile": "Known toxicity profile of ${drug} specific to this drug and this patient's comorbidities and prior treatment history — reference grade 3-4 adverse event rates from pivotal trials where known. Include monitoring plan.",
  "specialistRec": "No or MDC or Specialist or Other",
  "specialistRecDetail": "Details if Other",
  "ifNotApproved": "Honest and compelling statement of the treatment plan if ${drug} is not approved — state the realistic alternative and its inferiority compared to ${drug} for this patient. Make the consequence clear.",
  "additionalInfo": "Any additional information that strengthens the case — unusual patient features, exceptional clinical circumstances, time-sensitivity, or other factors that support approval of ${drug}"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DE-IDENTIFIED CLINICAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${notes.trim()}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const text = (data.content || []).map(c => c.text || '').join('');
    const clean = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ fields: parsed });
  } catch (error) {
    console.error('Extract error:', error);
    return res.status(500).json({ error: 'Failed to process notes. Please try again.' });
  }
}
