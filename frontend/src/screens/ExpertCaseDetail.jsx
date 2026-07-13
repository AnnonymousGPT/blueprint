import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ExpertCaseDetail({ request, onBack, onOpenChat, addNotification, onRefresh }) {
  const [status, setStatus] = useState(request.status);
  const [progress, setProgress] = useState(request.progressPercent || 0);
  const [documents, setDocuments] = useState(request.documents || []);
  const [saving, setSaving] = useState(false);

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch {}
  };

  const handleUpdateStatus = async () => {
    playHaptic(ImpactStyle.Medium);
    setSaving(true);
    try {
      await api.updateRequestStatus(request.id, status, parseInt(progress, 10));
      addNotification('Case status successfully updated!', 'success');
      onRefresh?.();
    } catch (err) {
      addNotification('Failed to update case status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDocReview = async (docId, newStatus) => {
    playHaptic(ImpactStyle.Light);
    try {
      await api.updateDocumentStatus(docId, newStatus);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));
      addNotification(`Document marked as ${newStatus}!`, 'success');
      onRefresh?.();
    } catch (err) {
      addNotification('Failed to review document.', 'error');
    }
  };

  const handleDownloadDoc = async (doc) => {
    playHaptic();
    addNotification('Generating secure download link...', 'info');
    try {
      const res = await api.getDownloadPresignedUrl(doc.id);
      if (res && res.url) {
        window.open(res.url, '_blank');
      } else {
        addNotification('Could not resolve download URL.', 'error');
      }
    } catch (err) {
      addNotification('Failed to fetch document download link.', 'error');
    }
  };

  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: 8,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)'
          }}
          aria-label="Back to case list"
        >
          ←
        </button>
        <div>
          <h3 className="title-accent" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {request.serviceName}
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Client ID: {request.client?.name || 'Advisor Client'}
          </span>
        </div>
      </div>

      {/* Status Transition Card */}
      <div 
        className="card"
        style={{
          padding: 16,
          borderRadius: 18,
          border: '1.5px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          Update Case Progress
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Filing Stage Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1.5px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 800,
              minHeight: 44
            }}
          >
            <option value="EXPERT_ASSIGNED">Expert Assigned</option>
            <option value="DOCUMENTS_PENDING">Documents Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Progress Percent ({progress}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            style={{ width: '100%', accentColor: '#3b82f6', height: 8 }}
          />
        </div>

        <button
          onClick={handleUpdateStatus}
          disabled={saving}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            minHeight: 44
          }}
        >
          {saving ? 'Saving changes...' : 'Save progress updates'}
        </button>
      </div>

      {/* Document checklist reviews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h4 style={{ margin: '8px 0 2px', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          Client Document Submissions
        </h4>
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            No documents uploaded yet by client.
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              style={{
                padding: 14,
                borderRadius: 16,
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {doc.name}
                </h5>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
                  Category: {doc.category} • Status: {doc.status || 'PENDING'}
                </span>
                <button
                  onClick={() => handleDownloadDoc(doc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: 6,
                    display: 'block'
                  }}
                >
                  Download Secure File
                </button>
              </div>

              {/* Approval options */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleDocReview(doc.id, 'APPROVED')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '6px 10px',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: 32
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDocReview(doc.id, 'REJECTED')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '6px 10px',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: 32
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat call to action */}
      <button
        onClick={() => {
          playHaptic();
          onOpenChat?.(request.client?.id);
        }}
        className="btn btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderColor: '#3b82f6',
          color: '#3b82f6',
          marginTop: 10,
          cursor: 'pointer',
          minHeight: 48
        }}
      >
        💬 Secure Chat with Client
      </button>
    </div>
  );
}
