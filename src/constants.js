// src/constants.js
// UHN / Princess Margaret Cancer Centre colour palette + shared state

export const C = {
  navy: '#002B5C',
  navyDark: '#001A3D',
  gold: '#FFD100',
  goldDark: '#C9A800',
  blue: '#0067C5',
  blueLight: '#E8F2FB',
  bg: '#F2F5FA',
  white: '#FFFFFF',
  border: '#CDD5E0',
  text: '#1A2332',
  muted: '#5C6B7A',
  red: '#C0392B',
  redLight: '#FEF2F2',
  green: '#1A6B3C',
  amber: '#92600A',
  amberLight: '#FFFBEB',
  amberBorder: '#FCD34D',
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const EMPTY_FORM = {
  // Section 3
  cancerDx: '', grade: '', stage: '', stageType: 'Clinical',
  perfScore: '', perfScale: 'ECOG',
  comorbidities: '', concomitantMeds: '',
  priorTx: [{ id: uid(), startDate: '', drug: '', dose: '', freq: '', duration: '', response: '' }],
  // Section 4
  drugGeneric: '', drugBrand: '', din: '', dosageForm: 'IV', dosageOther: '',
  txLocation: 'Hospital/Cancer Centre', txLocationSpec: '',
  plannedRegimen: '', regimenRationale: '',
  durationCycles: '', durationMonths: '',
  startDate: '', responseAssessment: '', stoppingCriteria: '', treatmentCost: '',
  fundingEAP: false, fundingEAPOut: '',
  fundingNDFP: false, fundingNDFPOut: '',
  fundingMfr: false, fundingMfrOut: '',
  fundingHosp: false,
  currentFunding: 'No', currentFundingDetail: '',
  // Section 5
  clinicalTrialN: 'no_trials', clinicalTrialNOther: '',
  cancerIncidence: '', ontarioEstimate: '', rareCircumstance: '',
  survivalWithout: '', survivalWith: '',
  whyOthersNA: '', expectedBenefits: '',
  clinicalTrialH: 'no_trials_ontario', clinicalTrialHOther: '',
  qolImprovement: '', publishedEvidence: '',
  contraindications: 'No', contraindicationsDetail: '',
  safetyProfile: '',
  specialistRec: 'No', specialistRecDetail: '',
  ifNotApproved: '', additionalInfo: '',
  // Section 6
  docPublished: false, docConsult: false, docClinicNotes: false, docLabwork: false,
  docPathology: false, docBiopsy: false, docImaging: false, docSAP: false,
  docCytogenetic: false, docDecision: false,
  // Section 7
  certifyAccurate: false, patientConsent: false,
  dateCompleted: new Date().toISOString().slice(0, 10),
};

// Expanded provider fields
export const EMPTY_PROVIDER = {
  id: '',
  firstName: '',
  lastName: '',
  specialty: '',          // e.g. "Medical Oncology, Hematology"
  cpso: '',
  billingNumber: '',      // OHIP billing number
  tel: '',
  fax: '',
  email: '',
  hospital: '',
  address: '',            // Clinic / office address
  city: '',
  province: 'ON',
  postalCode: '',
};

export const makeUid = uid;
