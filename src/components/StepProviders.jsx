// src/components/StepProviders.jsx
import { useState } from 'react';
import { C, EMPTY_PROVIDER, makeUid } from '../constants.js';
import ProviderModal from './ProviderModal.jsx';
import { deleteProvider, verifyPin } from '../utils/api.js';

export default function StepProviders({ providers, setProviders, onSelect }) {
  const [modal, setModal] = useState(null); // null | provider object (new or existing)
  const [deletePin, setDeletePin] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // provider to delete

  const handleDelete = async (provider) => {
    setDeleteError('');
    // First ask for PIN confirmation
    const pin = window.prompt(`Enter admin PIN to remove Dr. ${provider.lastName}:`);
    if (!pin) return;
    try {
      await verifyPin(pin);
      const updated = await deleteProvider(pin, provider.id);
      setProviders(updated);
    } catch (e) {
      alert(e.message || 'Could not delete provider. Check your PIN.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Select Treating Oncologist</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>
          Choose the physician who will sign this CBCRP request. Their credentials auto-fill Section 1 of the form.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {providers.map(p => (
          <div key={p.id} style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column',
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>
                  Dr. {p.firstName} {p.lastName}
                </div>
                <div style={{ fontSize: 12, color: C.blue, marginTop: 2 }}>{p.specialty}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                <button
                  onClick={() => setModal(p)}
                  title="Edit provider"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: 3, lineHeight: 1 }}
                >✎</button>
                <button
                  onClick={() => handleDelete(p)}
                  title="Remove provider"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 14, padding: 3, lineHeight: 1 }}
                >✕</button>
              </div>
            </div>

            {/* Details */}
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8, flex: 1 }}>
              <div>CPSO: <span style={{ color: C.text }}>{p.cpso}</span></div>
              <div>{p.hospital}</div>
              <div>{p.tel}</div>
              {p.fax && <div>Fax: {p.fax}</div>}
            </div>

            {/* Select button */}
            <button
              onClick={() => onSelect(p)}
              style={{
                marginTop: 14, width: '100%', background: C.navy, color: C.white,
                border: 'none', borderRadius: 7, padding: '10px 0',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.target.style.background = C.blue}
              onMouseLeave={e => e.target.style.background = C.navy}
            >
              Select →
            </button>
          </div>
        ))}

        {/* Add provider card */}
        <div
          onClick={() => setModal({ ...EMPTY_PROVIDER, id: makeUid() })}
          style={{
            background: '#EEF6FF', border: `2px dashed ${C.blue}`,
            borderRadius: 10, padding: 18, cursor: 'pointer', minHeight: 180,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#DCEEff'}
          onMouseLeave={e => e.currentTarget.style.background = '#EEF6FF'}
        >
          <div style={{ fontSize: 32, color: C.blue, lineHeight: 1 }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Add Provider</div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>Requires admin PIN</div>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 20, fontSize: 12, color: C.muted, textAlign: 'center' }}>
        Provider list is shared across all users of this tool. Contact your admin to update credentials.
      </p>

      {/* Provider Modal */}
      {modal && (
        <ProviderModal
          provider={modal}
          onSaved={(updated) => { setProviders(updated); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
