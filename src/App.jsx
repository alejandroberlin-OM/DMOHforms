// src/App.jsx
// Updated: manages drugName state, passes to StepNotes and extractFields
import { useState, useEffect } from 'react';
import { C, EMPTY_FORM, makeUid } from './constants.js';
import { fetchProviders, extractFields, generatePDF } from './utils/api.js';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import Header from './components/Header.jsx';
import StepBar from './components/StepBar.jsx';
import StepProviders from './components/StepProviders.jsx';
import StepNotes from './components/StepNotes.jsx';
import StepReview from './components/StepReview.jsx';
import Landing from './pages/Landing.jsx';

export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [page, setPage] = useState('landing');
  const [step, setStep] = useState(1);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [drugName, setDrugName] = useState('');       // ← new: drug name state
  const [notes, setNotes] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('dmoh_disclaimer_v2') === 'true') {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    sessionStorage.setItem('dmoh_disclaimer_v2', 'true');
    setDisclaimerAccepted(true);
  };

  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(err => console.error('Could not load providers:', err))
      .finally(() => setLoadingProviders(false));
  }, []);

  const handleSelectForm = (formId) => {
    if (formId === 'cbcrp') setPage('cbcrp');
  };

  const handleSelectProvider = (p) => {
    setSelectedProvider(p);
    setStep(2);
    setError('');
  };

  // Pass drugName to extractFields — AI uses it to tailor the entire form
  const handleExtract = async () => {
    if (!notes.trim()) { setError('Please paste clinical notes first.'); return; }
    if (!drugName.trim()) { setError('Please enter the requested drug name first.'); return; }
    setLoading(true); setError('');
    try {
      const { fields } = await extractFields(notes, drugName);
      setFormData({
        ...EMPTY_FORM,
        ...fields,
        priorTx: fields.priorTx?.length
          ? fields.priorTx.map(t => ({ ...t, id: makeUid() }))
          : EMPTY_FORM.priorTx,
      });
      setStep(3);
    } catch (e) {
      setError(e.message || 'Extraction failed — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true); setPdfError('');
    try {
      await generatePDF(selectedProvider, formData);
    } catch (e) {
      setPdfError(e.message || 'PDF generation failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReset = () => {
    setPage('landing');
    setStep(1);
    setSelectedProvider(null);
    setDrugName('');
    setNotes('');
    setFormData({ ...EMPTY_FORM });
    setError('');
    setPdfError('');
  };

  if (loadingProviders) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.bg }}>
      <div style={{ color: C.navy, fontSize: 15, fontWeight: 600 }}>Loading…</div>
    </div>
  );

  const isFormPage = page !== 'landing';

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: C.bg, minHeight: '100vh', color: C.text }}>
      {!disclaimerAccepted && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

      <Header step={isFormPage ? step : 0} onReset={handleReset} showBack={isFormPage} />
      {isFormPage && <StepBar step={step} />}

      <main>
        {page === 'landing' && (
          <Landing
            onSelectForm={handleSelectForm}
            providers={providers}
            setProviders={setProviders}
          />
        )}

        {page === 'cbcrp' && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>
            {step === 1 && (
              <StepProviders
                providers={providers}
                setProviders={setProviders}
                onSelect={handleSelectProvider}
              />
            )}
            {step === 2 && (
              <StepNotes
                provider={selectedProvider}
                drugName={drugName}
                setDrugName={setDrugName}
                notes={notes}
                setNotes={setNotes}
                onExtract={handleExtract}
                loading={loading}
                error={error}
              />
            )}
            {step === 3 && (
              <StepReview
                provider={selectedProvider}
                formData={formData}
                setFormData={setFormData}
                onDownloadPDF={handleDownloadPDF}
                pdfLoading={pdfLoading}
                pdfError={pdfError}
              />
            )}
          </div>
        )}
      </main>

      <footer style={{ borderTop: `3px solid ${C.navy}`, background: C.white, padding: '12px 24px' }}>
        <div style={{ height: 2, background: C.gold, marginBottom: 10 }} />
        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.7, maxWidth: 700, margin: '0 auto' }}>
          <strong>DMOH Form Assistant</strong> — Personal Productivity Tool &nbsp;|&nbsp;
          Not an official UHN or Ontario Health product &nbsp;|&nbsp;
          AI content must be verified by treating physician before submission &nbsp;|&nbsp;
          Anthropic BAA in place &nbsp;|&nbsp; No PHI stored
        </p>
      </footer>
    </div>
  );
}
