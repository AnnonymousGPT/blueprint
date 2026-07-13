import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/apiService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 2.2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (name) {
    case 'back':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'video':
      return (
        <svg {...common}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'cross':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'fileText':
      return (
        <svg {...common}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'chevronUp':
      return (
        <svg {...common}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    default:
      return null;
  }
}

function formatMoney(value) {
  if (value === undefined || value === null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function ExpertCaseDetail({ request, onBack, onOpenChat, addNotification, onRefresh }) {
  const [status, setStatus] = useState(request.status);
  const [progress, setProgress] = useState(request.progressPercent || 0);
  const [documents, setDocuments] = useState(request.documents || []);
  const [saving, setSaving] = useState(false);
  const [activeSubView, setActiveSubView] = useState('workspace'); // 'workspace' | 'timeline' | 'documents' | 'invoices' | 'consultations'
  const [consultationExpanded, setConsultationExpanded] = useState(false);

  // Sync document changes
  useEffect(() => {
    setDocuments(request.documents || []);
    setStatus(request.status);
    setProgress(request.progressPercent || 0);
  }, [request]);

  // Safe haptic trigger
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
      addNotification('Case milestones successfully updated!', 'success');
      onRefresh?.();
      setActiveSubView('workspace');
    } catch (err) {
      addNotification('Failed to update case progress.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDocReview = async (docId, newStatus) => {
    playHaptic(ImpactStyle.Light);
    try {
      await api.updateDocumentStatus(docId, newStatus);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));
      addNotification(`Document marked as ${newStatus.toLowerCase()}!`, 'success');
      onRefresh?.();
    } catch (err) {
      addNotification('Failed to update document status.', 'error');
    }
  };

  const handleDownloadDoc = async (doc) => {
    playHaptic();
    addNotification('Resolving secure download link...', 'info');
    try {
      const res = await api.getDownloadPresignedUrl(doc.id);
      if (res && res.url) {
        window.open(res.url, '_blank');
      } else {
        addNotification('Unable to fetch document.', 'error');
      }
    } catch (err) {
      addNotification('Failed to resolve secure download.', 'error');
    }
  };

  // Compute pending documents for Section 1
  const pendingDocsForReview = useMemo(() => {
    return documents.filter(d => d.status === 'PENDING' || d.status === 'Submitted');
  }, [documents]);

  const docCounts = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter(d => d.status === 'APPROVED' || d.status === 'Verified').length;
    const pending = total - verified;
    return { total, verified, pending };
  }, [documents]);

  // Timeline Config
  const timelineSteps = useMemo(() => {
    const steps = [
      { key: 'NEW', title: 'Request Submitted', desc: 'Case received by Blueprint' },
      { key: 'EXPERT_ASSIGNED', title: 'Expert Assigned', desc: 'Filing details assigned to CA partner' },
      { key: 'DOCUMENTS_PENDING', title: 'Documents Verification', desc: 'Documents checklist completion' },
      { key: 'IN_PROGRESS', title: 'Filing Compilation', desc: 'Advisor compiles calculation sheet' },
      { key: 'REVIEW', title: 'Draft return review', desc: 'Filing Return signature review' },
      { key: 'COMPLETED', title: 'Filing Completed', desc: 'Filing closed successfully' }
    ];

    const currentIdx = steps.findIndex(s => s.key === request.status);

    return steps.map((s, idx) => {
      let stepStatus = 'pending';
      if (request.status === 'COMPLETED') {
        stepStatus = 'completed';
      } else if (idx < currentIdx) {
        stepStatus = 'completed';
      } else if (idx === currentIdx) {
        stepStatus = 'active';
      }

      return { ...s, status: stepStatus };
    });
  }, [request]);

  const activeBookings = useMemo(() => {
    return (request.bookings || []).filter(
      (b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
    );
  }, [request]);

  // State Machine Priority Engine for Advisor Required Action Card
  const getAdvisorAction = () => {
    // 1. Review pending uploaded documents
    if (pendingDocsForReview.length > 0) {
      const doc = pendingDocsForReview[0];
      return {
        title: 'Review Client Document',
        desc: `Client uploaded document "${doc.name}" for verification.`,
        ctaText: 'Verify Document',
        icon: 'upload',
        bg: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        accentColor: '#fca5a5',
        action: () => setActiveSubView('documents')
      };
    }

    // 2. Draft Return Compile Needed
    if (request.status === 'IN_PROGRESS') {
      return {
        title: 'Compile Filing Draft',
        desc: 'All documents verified. Prepare final tax calculations for client approval.',
        ctaText: 'Compile Draft',
        icon: 'fileText',
        bg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        accentColor: '#93c5fd',
        action: () => setActiveSubView('timeline')
      };
    }

    // 3. Consultation call
    if (activeBookings.length > 0) {
      const call = activeBookings[0];
      return {
        title: 'Join Client Consultation',
        desc: `A scheduled call with client ${request.client?.name || 'User'} starts today.`,
        ctaText: 'Join Call',
        icon: 'phone',
        bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentColor: '#5eead4',
        action: () => addNotification(`Joining secure video room for ${request.client?.name}...`, 'success')
      };
    }

    // Default catch
    return {
      title: 'Monitor Filing Milestones',
      desc: 'No urgent tasks. Review and update case progress or check client details.',
      ctaText: 'Update Progress',
      icon: 'check',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accentColor: '#cbd5e1',
      action: () => setActiveSubView('timeline')
    };
  };

  const action = getAdvisorAction();

  // SUB-VIEWS ROUTING

  // 1. TIMELINE & UPDATE MILESTONES SCREEN
  if (activeSubView === 'timeline') {
    return (
      <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setActiveSubView('workspace');
            }}
            aria-label="Back to workspace"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Icon name="back" size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            milestones & Progress
          </h2>
        </div>

        {/* Update progress form */}
        <div className="card" style={{ padding: 14, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>Update Filing Progress</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }} id="lbl-status">Status</label>
            <select
              aria-labelledby="lbl-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.74rem', fontWeight: 800 }}
            >
              <option value="EXPERT_ASSIGNED">Expert Assigned</option>
              <option value="DOCUMENTS_PENDING">Documents Pending</option>
              <option value="IN_PROGRESS">Filing Compilation</option>
              <option value="REVIEW">Draft Return Review</option>
              <option value="COMPLETED">Filing Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              <span>Progress Percentage</span>
              <span>{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)', height: 8 }}
            />
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleUpdateStatus}
            style={{ width: '100%', minHeight: 38, borderRadius: 10, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.74rem', fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving changes...' : 'Save progress updates'}
          </button>
        </div>

        {/* Timeline representation */}
        <div className="card" style={{ padding: 14, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {timelineSteps.map((step, idx) => {
            const isLast = idx === timelineSteps.length - 1;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';

            return (
              <div key={step.key} style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#10b981' : isActive ? 'transparent' : 'var(--border-color)',
                    border: isActive ? '2px solid #10b981' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}>
                    {isCompleted && <span style={{ color: '#fff', fontSize: '0.5rem', fontWeight: 900 }}>✓</span>}
                    {isActive && <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10b981' }} />}
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      backgroundColor: isCompleted ? '#10b981' : 'var(--border-color)',
                      marginBlock: 2
                    }} />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.76rem', fontWeight: isActive || isCompleted ? 900 : 700, color: isActive ? '#10b981' : isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {step.title}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. DETAILED DOCUMENT REVIEW SCREEN
  if (activeSubView === 'documents') {
    return (
      <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setActiveSubView('workspace');
            }}
            aria-label="Back to workspace"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Icon name="back" size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Client submissions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {documents.length > 0 ? (
            documents.map((doc) => {
              const isApproved = doc.status === 'APPROVED' || doc.status === 'Verified';
              const isRejected = doc.status === 'REJECTED' || doc.status === 'Rejected';

              return (
                <div key={doc.id} className="card" style={{ padding: 12, borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)' }}>{doc.name}</h4>
                      <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', display: 'block', marginTop: 1 }}>
                        Category: {doc.category}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.54rem',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: 4,
                      backgroundColor: isApproved ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface-variant)',
                      color: isApproved ? '#10b981' : isRejected ? '#dc2626' : 'var(--text-secondary)'
                    }}>
                      {doc.status || 'PENDING'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', padding: 2 }}
                    >
                      <Icon name="download" size={12} color="var(--primary)" />
                      Download File
                    </button>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleDocReview(doc.id, 'APPROVED')}
                        style={{ padding: '4px 8px', borderRadius: 6, border: 'none', backgroundColor: '#10b981', color: '#fff', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDocReview(doc.id, 'REJECTED')}
                        style={{ padding: '4px 8px', borderRadius: 6, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              No documents submitted by client.
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. INVOICE BILLING DETAIL SCREEN
  if (activeSubView === 'invoices') {
    return (
      <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setActiveSubView('workspace');
            }}
            aria-label="Back to workspace"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Icon name="back" size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Filing Billing & Invoice
          </h2>
        </div>

        <div className="card" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Service Type</span>
            <h4 style={{ margin: '1px 0 0', fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)' }}>{request.serviceName}</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Filing Charge</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(request.amount || 1887)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Invoice Reference</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>TXN-{request.id.slice(-6).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Billing Status</span>
            <span style={{ fontWeight: 800, color: '#10b981' }}>PAID</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. CONSULTATION BOOKINGS SCREEN
  if (activeSubView === 'consultations') {
    return (
      <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setActiveSubView('workspace');
            }}
            aria-label="Back to workspace"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Icon name="back" size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Schedule & Call Logs
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {(request.bookings || []).length > 0 ? (
            request.bookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: 12, borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={12} color="var(--text-secondary)" />
                    {b.type === 'VIDEO' ? 'Video consultation' : 'Telephonic Call'}
                  </span>
                  <span style={{
                    fontSize: '0.54rem',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: 4,
                    backgroundColor: b.status === 'COMPLETED' ? 'rgba(16,185,129,0.08)' : b.status === 'CANCELLED' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
                    color: b.status === 'COMPLETED' ? '#10b981' : b.status === 'CANCELLED' ? '#dc2626' : '#2563eb'
                  }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                  📅 {b.date} · 🕒 {b.time}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
              No consultation sessions logged for this case.
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN COCKPIT VIEW V3 (MAX 5 SECTIONS, NO SCROLL)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px - env(safe-area-inset-bottom))',
        justifyContent: 'space-between',
        paddingInline: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      className="animate-fade-in-up"
    >
      {/* Top Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 44 }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            onBack();
          }}
          aria-label="Back to dashboard list"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Icon name="back" size={18} color="var(--text-primary)" />
        </button>

        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
          Case Workspace
        </h2>

        <div style={{
          borderRadius: 999,
          padding: '4px 10px',
          border: '1px solid rgba(16,185,129,0.25)',
          background: 'rgba(16, 185, 129, 0.05)',
          color: '#10b981',
          fontSize: '0.62rem',
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          ID: {request.id.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* SECTION 1: REQUIRED ACTION CARD (ADVISOR ACTIONS ENGINE) */}
      <div
        className="screen-hero animate-scale-in"
        style={{
          padding: '12px 14px',
          background: action.bg,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontSize: '0.52rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.12)',
              color: action.accentColor,
              padding: '2px 5px',
              borderRadius: 99,
              textTransform: 'uppercase',
              width: 'fit-content'
            }}>
              Required Step
            </span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              {action.title}
            </h3>
          </div>
          <div style={{ opacity: 0.8, color: '#ffffff' }}>
            <Icon name={action.icon} size={28} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#cbd5e1', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
          {action.desc}
        </p>
        <button
          type="button"
          onClick={() => {
            playHaptic('medium');
            action.action();
          }}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
            borderRadius: 10,
            padding: '8px 10px',
            fontSize: '0.74rem',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          {action.ctaText}
          <Icon name="chevronRight" size={12} color="#0f172a" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 2: PROGRESS CARD (TAP REDIRECTS TO TIMELINE SUBVIEW) */}
      <div
        className="card animate-scale-in"
        onClick={() => {
          playHaptic();
          setActiveSubView('timeline');
        }}
        style={{
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 20,
          cursor: 'pointer',
          border: '1px solid var(--border-color)'
        }}
        role="button"
        tabIndex={0}
        aria-label={`Progress is ${request.progressPercent || 30}% complete`}
      >
        <div style={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="48" height="48" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3.2" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeDasharray={`${request.progressPercent || 30}, 100`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.74rem', fontWeight: 950, color: 'var(--text-primary)' }}>
            {request.progressPercent || 30}%
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: '0', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {request.serviceName}
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Stage: <strong style={{ color: 'var(--primary)' }}>{request.status?.replace('_', ' ')}</strong> • ETA: 2d
          </p>
        </div>
        <Icon name="chevronRight" size={14} color="var(--text-secondary)" />
      </div>

      {/* SECTION 3: ASSIGNED EXPERT CARD (CLIENT DETAIL AVATAR - DIRECT CHAT Short) */}
      <div
        className="card"
        onClick={() => {
          playHaptic();
          onOpenChat?.(request.client?.id);
        }}
        style={{
          padding: 12,
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}
        aria-label={`Chat with client ${request.client?.name}`}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--border-color)', flexShrink: 0 }}>
            <img src={request.client?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'} alt={request.client?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Client: {request.client?.name || 'Blueprint User'}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 1 }}>
              Email: {request.client?.email || 'user@example.com'}
            </div>
          </div>
        </div>
        <Icon name="chat" size={16} color="var(--primary)" />
      </div>

      {/* SECTION 4: UPCOMING CONSULTATION CARD (CLICK EXPANDS CONTROLS) */}
      {activeBookings.length > 0 ? (
        <div
          className="card"
          style={{
            padding: 12,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Consultation Scheduled
            </span>
            <button
              type="button"
              onClick={() => {
                playHaptic();
                setConsultationExpanded(!consultationExpanded);
              }}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'inline-flex' }}
              aria-expanded={consultationExpanded}
            >
              <Icon name={consultationExpanded ? 'chevronUp' : 'chevronDown'} size={14} color="var(--text-secondary)" />
            </button>
          </div>

          {activeBookings.slice(0, 1).map((b) => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={12} color="var(--primary)" />
                    {b.type === 'VIDEO' ? 'Video Review' : 'Telephonic Call'}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    📅 {b.date} · 🕒 {b.time}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addNotification(`Launching meeting link for ${b.id}...`, 'success')}
                  style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  Join Call <Icon name="chevronRight" size={10} color="var(--primary)" strokeWidth={3} />
                </button>
              </div>

              {consultationExpanded && (
                <div style={{ padding: 8, background: 'var(--bg-surface-variant)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }} className="animate-fade-in-up">
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Review past schedules:</span>
                  <button
                    type="button"
                    onClick={() => {
                      playHaptic();
                      setActiveSubView('consultations');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    View Call Logs
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 12, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={16} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)' }}>No Calls Scheduled</h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Consultation slots are open for matches.</p>
          </div>
        </div>
      )}

      {/* SECTION 5: DOCUMENTS SUMMARY CARD (TAP REDIRECTS TO DETAILED CHECKLIST SUBVIEW) */}
      <div
        className="card"
        onClick={() => {
          playHaptic();
          setActiveSubView('documents');
        }}
        style={{
          padding: 12,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
          border: '1px solid var(--border-color)'
        }}
        role="button"
        tabIndex={0}
        aria-label={`Documents: ${docCounts.verified} approved, ${docCounts.pending} pending`}
      >
        <div>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Document Status
          </span>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Verified: <strong style={{ color: '#10b981' }}>{docCounts.verified}</strong>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>|</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Unverified: <strong style={{ color: docCounts.pending > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{docCounts.pending}</strong>
            </span>
          </div>
        </div>
        <Icon name="chevronRight" size={14} color="var(--text-secondary)" />
      </div>

      {/* Invoices Access Link */}
      <div style={{ display: 'flex', justifyContent: 'center', height: 20 }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            setActiveSubView('invoices');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.64rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: 2,
            textDecoration: 'underline'
          }}
        >
          View Client Invoices
        </button>
      </div>
    </div>
  );
}
