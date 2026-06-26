// src/App.jsx
import { useState, useEffect } from 'react';
import { C, EMPTY_FORM, makeUid } from './constants.js';
import { fetchProviders, extractFields } from './utils/api.js';
import { generatePrintHTML } from './utils/printHTML.js';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import Header from './components/Header.jsx';
import StepBar from './components/StepBar.jsx';
import StepProviders from './components/StepProviders.jsx';
import StepNotes from './components/StepNotes.jsx';
import StepReview from './components/StepReview.jsx';

export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [step, setStep] = useState(1);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [notes, setNotes] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [error, setError] = useState('');

  // Show disclaimer every session
  useEffect(() => {
    const accepted = sessionStorage.getItem('dmoh_disclaimer_accepted');
    if (accepted === 'true') setDisclaimerAccepted(true);
  }, []);

  const handleDisclaimerAccept = () => {
    sessionStorage.setItem('dmoh_disclaimer_accepted', 'true');
    setDisclaimerAccepted(true);
  };

  // Load providers from API on mount
  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(err => console.error('Could not load providers:', err))
      .finally(() => setLoadingProviders(false));
  }, []);

  const handleSelectProvider = (p) => {
    setSelectedProvider(p);
    setStep(2);
    setError('');
  };

  const handleExtract = async () => {
    if (!notes.trim()) { setError('Please paste clinical notes first.'); return; }
    setLoading(true); setError('');
    try {
      const { fields } = await extractFields(notes);
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

  const handlePrint = () => {
    const html = generatePrintHTML(selectedProvider, formData);
    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups for this site to download the form.'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedProvider(null);
    setNotes('');
    setFormData({ ...EMPTY_FORM });
    setError('');
  };

  if (loadingProviders) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.bg }}>
      <div style={{ color: C.navy, fontSize: 15, fontWeight: 600 }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: C.bg, minHeight: '100vh', color: C.text }}>
      {!disclaimerAccepted && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

      <Header step={step} onReset={handleReset} />
      <StepBar step={step} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>
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
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `3px solid ${C.navy}`, background: C.white, padding: '14px 24px', textAlign: 'center' }}>
        <div style={{ height: 2, background: C.gold, marginBottom: 10 }} />
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, maxWidth: 700, margin: '0 auto' }}>
          <strong>DMOH Clinical Form Assistant</strong> — Personal Productivity Tool &nbsp;|&nbsp;
          Not an official UHN or Ontario Health product &nbsp;|&nbsp;
          AI-generated content must be verified by the treating physician before submission &nbsp;|&nbsp;
          Data processed under Anthropic BAA &nbsp;|&nbsp; No PHI stored
        </p>
      </footer>
    </div>
  );
}
