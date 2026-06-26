// api/extract.js
// Serverless function — runs on Vercel, keeps ANTHROPIC_API_KEY secret

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes } = req.body;
  if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
    return res.status(400).json({ error: 'Clinical notes are required' });
  }

  const prompt = `You are completing a Cancer Care Ontario CBCRP (Case-by-Case Review Program) request form.
Extract ONLY non-PHI clinical information from the de-identified notes below.
Return ONLY valid JSON — no markdown, no explanation, no preamble.

{
  "cancerDx": "full cancer diagnosis / requested indication",
  "grade": "cancer grade e.g. Grade 3, or empty string",
  "stage": "stage e.g. IV",
  "stageType": "Clinical or Pathological",
  "perfScore": "performance status score number e.g. 1",
  "perfScale": "ECOG or Karnofsky",
  "comorbidities": "list of relevant comorbidities",
  "concomitantMeds": "list of concomitant medications with doses",
  "priorTx": [{"startDate":"","drug":"intervention name","dose":"","freq":"","duration":"","response":"describe: adequate/inadequate/progression/toxicity/etc"}],
  "drugGeneric": "generic name of requested drug",
  "drugBrand": "brand name if mentioned",
  "din": "DIN if mentioned, else empty string",
  "dosageForm": "IV or SC or PO or Other",
  "txLocation": "Hospital/Cancer Centre or Out-patient community or Other",
  "txLocationSpec": "name of hospital or specify if Other",
  "plannedRegimen": "dose, frequency, route of administration, any combinations",
  "regimenRationale": "literature basis and rationale for any dose or frequency modifications",
  "durationCycles": "number of cycles planned",
  "durationMonths": "number of months planned",
  "startDate": "anticipated start date if mentioned, else empty",
  "responseAssessment": "how response will be assessed e.g. CT scan after 8 weeks",
  "stoppingCriteria": "criteria to determine therapy is ineffective for this patient",
  "treatmentCost": "cost per unit or vial if mentioned, else empty",
  "clinicalTrialN": "no_trials or assessed_ineligible or other",
  "clinicalTrialNOther": "specify if other",
  "cancerIncidence": "incidence of this cancer type with references if inferable",
  "ontarioEstimate": "estimated number of patients per year in Ontario who could be treated",
  "rareCircumstance": "explanation of why this patient has a rare clinical circumstance",
  "survivalWithout": "best estimate of how long patient will live without treatment in months",
  "survivalWith": "how much longer patient is expected to live with treatment e.g. 3-6 additional months",
  "whyOthersNA": "why other treatment options drug or non-drug are not appropriate",
  "expectedBenefits": "expected benefits of requested therapy vs best supportive care re survival and QoL",
  "clinicalTrialH": "no_trials_ontario or inferior or assessed_ineligible or not_assessed or other",
  "clinicalTrialHOther": "specify if other",
  "qolImprovement": "how treatment will improve QoL and which symptoms expected to improve",
  "publishedEvidence": "summary of published evidence: trial names, response rates, PFS, OS data",
  "contraindications": "No or Yes",
  "contraindicationsDetail": "details if yes, else empty",
  "safetyProfile": "safety and toxicity profile and overall risk for this patient",
  "specialistRec": "No or MDC or Specialist or Other",
  "specialistRecDetail": "details if Other, else empty",
  "ifNotApproved": "alternative treatment plan if drug is not approved",
  "additionalInfo": "any additional supporting information for the CBCRP request"
}

Clinical notes (de-identified — no PHI):
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
        max_tokens: 6000,
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
