import { useEffect, useState, useMemo } from 'react';
import ChatBox from '../components/ChatBox';
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
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
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
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
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

export default function Tracking({ requests = [], documents = [], selectedRequestId, onBackToHome, setActiveTab, addNotification, user }) {
  const [manualRequestId, setManualRequestId] = useState(() => {
    return localStorage.getItem('active_workspace_request_id') || null;
  });
  
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // V2 Navigation States
  const [activeSubView, setActiveSubView] = useState('workspace'); // 'workspace' | 'timeline' | 'documents' | 'invoices' | 'consultations'
  const [consultationExpanded, setConsultationExpanded] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Sync network state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Loading simulator
    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  const resolvedRequestId = selectedRequestId || manualRequestId;
  const activeRequest = useMemo(() => {
    return requests.find((request) => request.id === resolvedRequestId) || requests[0];
  }, [requests, resolvedRequestId]);

  // Persist selected Request ID to preserve workspace across refreshes
  useEffect(() => {
    if (activeRequest?.id) {
      localStorage.setItem('active_workspace_request_id', activeRequest.id);
    }
  }, [activeRequest]);

  // Safe Capacitor haptic triggers
  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  // Analytics event logger
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  useEffect(() => {
    if (activeRequest) {
      trackEvent('workspace_viewed', { request_id: activeRequest.id, status: activeRequest.status });
    }
  }, [activeRequest]);

  const handleSelectRequest = (reqId) => {
    playHaptic();
    setManualRequestId(reqId);
  };

  const handleAction = (type) => {
    playHaptic();
    if (type === 'Chat') {
      trackEvent('expert_contacted', { request_id: activeRequest.id });
      setActiveTab('chat');
    } else {
      trackEvent('expert_call_dialed', { request_id: activeRequest.id });
      addNotification(`Calling CA ${activeRequest?.assignedExpert?.user?.name || 'Advisor'}...`, 'info');
    }
  };

  const handleDownloadInvoice = () => {
    playHaptic();
    trackEvent('invoice_downloaded', { request_id: activeRequest.id });
    addNotification('Downloading GST tax invoice PDF...', 'success');
  };

  const handleJoinConsultation = (booking) => {
    playHaptic('medium');
    trackEvent('consultation_joined', { booking_id: booking.id, type: booking.type });
    addNotification(`Joining secure ${booking.type.toLowerCase()} consultation link...`, 'success');
  };

  // Dynamic Document Checklist builder
  const documentChecklist = useMemo(() => {
    if (!activeRequest) return [];

    const requestName = (activeRequest.serviceName || '').toLowerCase();
    
    // Choose dynamic checklist schema based on request type
    const checklistTemplate = (requestName.includes('gst') || requestName.includes('business'))
      ? [
          { category: 'PAN', label: 'PAN Card', desc: 'Verify PAN registry' },
          { category: 'AADHAAR', label: 'Aadhaar Card', desc: 'Identity verification' },
          { category: 'GST', label: 'GST Certificate', desc: 'GST Registration proof' },
          { category: 'BUSINESS', label: 'Utility / Rent Bill', desc: 'Proof of Business place' }
        ]
      : [
          { category: 'PAN', label: 'PAN Card', desc: 'Verify PAN registry' },
          { category: 'AADHAAR', label: 'Aadhaar Card', desc: 'Identity verification' },
          { category: 'ITR', label: 'Form 16 / Salary Slips', desc: 'Income proofs declaration' },
          { category: 'BANK_STATEMENT', label: '12 Months Bank Statements', desc: 'Assess audit declarations' }
        ];

    // Map each template to actual uploaded documents relation
    return checklistTemplate.map((item) => {
      const matchedFile = (activeRequest.documents || []).find(
        (doc) => (doc.category || '').toUpperCase() === item.category
      );

      return {
        ...item,
        uploaded: !!matchedFile,
        fileName: matchedFile?.name || null,
        status: matchedFile?.status || 'PENDING_UPLOAD',
        rejectionReason: matchedFile?.reason || null
      };
    });
  }, [activeRequest]);

  // Compute blockers
  const blockers = useMemo(() => {
    return documentChecklist.filter(item => item.status === 'Rejected');
  }, [documentChecklist]);

  // Document Counts
  const docCounts = useMemo(() => {
    const total = documentChecklist.length;
    const uploaded = documentChecklist.filter(d => d.uploaded).length;
    const pending = total - uploaded;
    return { total, uploaded, pending };
  }, [documentChecklist]);

  // Timeline Config
  const timelineSteps = useMemo(() => {
    if (!activeRequest) return [];
    
    const steps = [
      { key: 'NEW', title: 'Request Submitted', desc: 'Case received by Blueprint' },
      { key: 'EXPERT_ASSIGNED', title: 'Expert Assigned', desc: 'CA partner is assigned to review' },
      { key: 'DOCUMENTS_PENDING', title: 'Documents Verification', desc: 'Verification checklist completion' },
      { key: 'IN_PROGRESS', title: 'Filing In Progress', desc: 'Advisor is draft compiling' },
      { key: 'REVIEW', title: 'Draft Review', desc: 'Awaiting client approval signature' },
      { key: 'COMPLETED', title: 'Case Completed', desc: 'Successfully filed and closed' }
    ];

    const currentIdx = steps.findIndex(s => s.key === activeRequest.status);

    return steps.map((s, idx) => {
      let stepStatus = 'pending';
      if (activeRequest.status === 'COMPLETED') {
        stepStatus = 'completed';
      } else if (idx < currentIdx) {
        stepStatus = 'completed';
      } else if (idx === currentIdx) {
        stepStatus = 'active';
      }

      return { ...s, status: stepStatus };
    });
  }, [activeRequest]);

  // Check active upcoming calls/bookings
  const activeBookings = useMemo(() => {
    return (activeRequest?.bookings || []).filter(
      (b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
    );
  }, [activeRequest]);

  // Past Bookings for Consultation History
  const pastBookings = useMemo(() => {
    return (activeRequest?.bookings || []).filter(
      (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED'
    );
  }, [activeRequest]);

  // Empty state handling
  if (!activeRequest && !loading) {
    return (
      <div className="screen-shell" style={{ gap: 16, height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingInline: 20 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          color: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          📁
        </div>
        <h3 style={{ margin: '12px 0 6px', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          No Active Filings
        </h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 16 }}>
          You don't have any ongoing compliance filings. Start a dynamic tax match to partner with an advisor.
        </p>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            setActiveTab('home');
          }}
          className="btn btn-primary"
          style={{ minHeight: 44, borderRadius: 10, paddingInline: 24, fontSize: '0.82rem', fontWeight: 800 }}
        >
          Match with Advisor
        </button>
      </div>
    );
  }

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="screen-shell" style={{ paddingInline: '16px', gap: 16, paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45 }}>
          <div className="skeleton-container" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="skeleton-container" style={{ width: 120, height: 24, borderRadius: 6 }} />
          <div className="skeleton-container" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        </div>
        <div className="skeleton-container" style={{ height: 110, borderRadius: 24 }} />
        <div className="skeleton-container" style={{ height: 110, borderRadius: 24 }} />
        <div className="skeleton-container" style={{ height: 75, borderRadius: 20 }} />
      </div>
    );
  }

  // 1. TIMELINE SCREEN SUB-VIEW
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
            aria-label="Back to case details"
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
            Filing Timeline
          </h2>
        </div>

        <div className="card animate-scale-in" style={{ padding: 18, borderRadius: 24, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {timelineSteps.map((step, idx) => {
              const isLast = idx === timelineSteps.length - 1;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={step.key} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#10b981' : isActive ? 'transparent' : 'var(--border-color)',
                      border: isActive ? '2.2px solid #10b981' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {isCompleted && <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                      {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />}
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 2,
                        flex: 1,
                        minHeight: 32,
                        backgroundColor: isCompleted ? '#10b981' : 'var(--border-color)',
                        marginBlock: 3,
                        zIndex: 1
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 6 }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: isActive || isCompleted ? 900 : 700, color: isActive ? '#10b981' : isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {step.title}
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. DOCUMENTS SCREEN SUB-VIEW
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
            aria-label="Back to case details"
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
            Compliance Documents
          </h2>
        </div>

        <div className="card" style={{ padding: 16, borderRadius: 24, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {documentChecklist.map((item) => {
              const hasFile = item.uploaded;
              const isRejected = item.status === 'Rejected';
              const isApproved = item.status === 'Approved' || item.status === 'Verified';

              return (
                <div key={item.category} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.label}
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: isApproved ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface-variant)',
                        color: isApproved ? '#10b981' : isRejected ? '#dc2626' : 'var(--text-secondary)'
                      }}>
                        {isApproved ? 'Verified' : isRejected ? 'Rejected' : hasFile ? 'Verifying' : 'Required'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                    {hasFile && (
                      <div style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 500, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        Uploaded: {item.fileName}
                      </div>
                    )}
                    {isRejected && item.rejectionReason && (
                      <div style={{ fontSize: '0.62rem', color: '#dc2626', fontWeight: 600, marginTop: 2 }}>
                        Reason: {item.rejectionReason}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playHaptic();
                      localStorage.setItem('preselectUploadCategory', item.category);
                      setActiveTab('documents');
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 6,
                      minHeight: 36,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    aria-label={`Upload copy for ${item.label}`}
                  >
                    <Icon name="plus" size={14} color="var(--primary)" />
                    {hasFile ? 'Replace' : 'Upload'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. INVOICES SCREEN SUB-VIEW
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
            aria-label="Back to case details"
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
            Billing & Invoices
          </h2>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 24, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filing Service Code</span>
            <h4 style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {activeRequest.serviceName}
            </h4>
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-color)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filing Fee</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatMoney(activeRequest.amount || 1887)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Transaction ID</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              TXN-{activeRequest.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Status</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.08)' }}>
              PAID
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 14,
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 44,
              marginTop: 8
            }}
          >
            <Icon name="download" size={14} color="#ffffff" />
            Download PDF Invoice
          </button>
        </div>
      </div>
    );
  }

  // 4. CONSULTATION HISTORY SCREEN SUB-VIEW
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
            aria-label="Back to case details"
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
            Consultation Log
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {pastBookings.length > 0 ? (
            pastBookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: 14, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={14} color="var(--text-secondary)" />
                    {b.type === 'VIDEO' ? 'Video consultation' : 'Telephonic consultation'}
                  </span>
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: b.status === 'COMPLETED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    color: b.status === 'COMPLETED' ? '#10b981' : '#dc2626'
                  }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  📅 {b.date} · 🕒 {b.time}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              No historical sessions recorded.
            </div>
          )}
        </div>
      </div>
    );
  }

  // State machine priority builder for Section 1
  const getRequiredAction = () => {
    // 1. Documents Rejected/Blocker (Highest priority)
    if (blockers.length > 0) {
      const firstBlocker = blockers[0];
      return {
        title: `Upload Rejected ${firstBlocker.label}`,
        desc: `Reason: ${firstBlocker.rejectionReason || 'Incorrect document format.'}`,
        ctaText: 'Upload Now',
        icon: 'alert',
        bg: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        accentColor: '#fca5a5',
        action: () => {
          trackEvent('primary_action_clicked', { request_id: activeRequest.id, action_type: 'DOCUMENTS_REJECTED' });
          setActiveSubView('documents');
        }
      };
    }

    // 2. Documents Required
    if (activeRequest.status === 'DOCUMENTS_PENDING') {
      const pendingDoc = documentChecklist.find(d => !d.uploaded);
      return {
        title: `Upload ${pendingDoc?.label || 'Form 16 / Proofs'}`,
        desc: 'Filing verification requires additional identity or financial proof.',
        ctaText: 'Upload Now',
        icon: 'plus',
        bg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        accentColor: '#93c5fd',
        action: () => {
          trackEvent('primary_action_clicked', { request_id: activeRequest.id, action_type: 'DOCUMENTS_PENDING' });
          setActiveSubView('documents');
        }
      };
    }

    // 3. Draft Review Required
    if (activeRequest.status === 'REVIEW') {
      return {
        title: 'Review Draft Return',
        desc: 'Please verify the final tax calculation sheet and approve the return.',
        ctaText: 'Review Draft',
        icon: 'fileText',
        bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentColor: '#5eead4',
        action: () => {
          trackEvent('primary_action_clicked', { request_id: activeRequest.id, action_type: 'REVIEW_DRAFT' });
          // Open Draft preview logic
          addNotification('Opening final tax declaration draft return...', 'info');
        }
      };
    }

    // 4. Consultation Call Starting Soon
    if (activeBookings.length > 0) {
      const nextBooking = activeBookings[0];
      return {
        title: 'Join Consultation',
        desc: `Join your certified expert call on ${nextBooking.date} at ${nextBooking.time}.`,
        ctaText: 'Join Call',
        icon: 'phone',
        bg: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        accentColor: '#cbd5e1',
        action: () => {
          trackEvent('primary_action_clicked', { request_id: activeRequest.id, action_type: 'JOIN_CALL' });
          handleJoinConsultation(nextBooking);
        }
      };
    }

    // Default Case: No blocking task
    return {
      title: 'Filing In Progress',
      desc: 'Our CA partners are analyzing documents. We will notify you when a draft is ready.',
      ctaText: 'View Timeline',
      icon: 'check',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accentColor: '#94a3b8',
      action: () => {
        trackEvent('primary_action_clicked', { request_id: activeRequest.id, action_type: 'VIEW_TIMELINE' });
        setActiveSubView('timeline');
      }
    };
  };

  const action = getRequiredAction();

  // MAIN WORKSPACE VIEW (MAX 5 SECTIONS)
  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 14, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      
      {/* Top Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            onBackToHome();
          }}
          aria-label="Back to home dashboard"
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
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Icon name="back" size={20} color="var(--text-primary)" />
        </button>

        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
          Case Workspace
        </h2>

        <div style={{
          borderRadius: 999,
          padding: '6px 12px',
          border: '1px solid rgba(16,185,129,0.3)',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          fontSize: '0.68rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap'
        }}>
          📁 Case ID: {activeRequest.id.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box'
        }} role="alert">
          <Icon name="info" size={16} color="#ef4444" />
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
            Viewing offline cached details. Updates will sync online.
          </span>
        </div>
      )}

      {/* Case Selector Tabs */}
      {requests.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', width: '100%', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {requests.map((r) => {
            const isSelected = activeRequest.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRequest(r.id)}
                aria-pressed={isSelected}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isSelected ? '1.5px solid var(--secondary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--primary-container)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--secondary)' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: 38
                }}
              >
                {r.serviceName}
              </button>
            );
          })}
        </div>
      )}

      {/* SECTION 1: REQUIRED ACTION CARD */}
      <div
        className="screen-hero animate-scale-in"
        style={{
          padding: '16px 18px',
          background: action.bg,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.12)',
              color: action.accentColor,
              padding: '3px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              width: 'fit-content'
            }}>
              Attention Required
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              {action.title}
            </h3>
          </div>
          <div style={{ opacity: 0.8, color: '#ffffff' }}>
            <Icon name={action.icon} size={36} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
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
            borderRadius: 14,
            padding: '12px',
            fontSize: '0.8rem',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {action.ctaText}
          <Icon name="chevronRight" size={14} color="#0f172a" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 2: PROGRESS CARD */}
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, width: '100%', boxSizing: 'border-box', borderRadius: 24 }}>
        <div style={{ position: 'relative', width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="62" height="62" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.2"
              strokeDasharray={`${activeRequest.progressPercent || 30}, 100`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.86rem', fontWeight: 950, color: 'var(--text-primary)' }}>
            {activeRequest.progressPercent || 30}%
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: '0', fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {activeRequest.serviceName}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 8px', marginTop: 4 }}>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Milestone: <strong style={{ color: 'var(--primary)' }}>{activeRequest.status}</strong>
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              ETA: <strong>2 days</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setActiveSubView('timeline');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 0 0 0',
              color: 'var(--primary)',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            View Full Timeline <Icon name="chevronRight" size={10} color="var(--primary)" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* SECTION 3: ASSIGNED EXPERT CARD */}
      {activeRequest.assignedExpert ? (
        <div className="card" style={{ padding: 14, borderRadius: 24, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--border-color)', flexShrink: 0 }}>
              <img src={activeRequest.assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'} alt={activeRequest.assignedExpert.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {activeRequest.assignedExpert.user?.name || 'Chartered Accountant'}
                <span style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5rem',
                  fontWeight: 900
                }}>✓</span>
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 1 }}>
                {activeRequest.assignedExpert.specialization || 'Taxation Expert'} • SLA: &lt;2h
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAction('Chat')}
            style={{
              minHeight: 38,
              paddingInline: 16,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-variant)',
              color: 'var(--text-primary)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            aria-label={`Open chat room thread with CA ${activeRequest.assignedExpert.user?.name}`}
          >
            <Icon name="chat" size={14} color="var(--text-primary)" />
            Chat
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 14, borderRadius: 24, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" size={18} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)' }}>Assigning Advisor</h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Your matched expert will verify the files shortly.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: UPCOMING CONSULTATION CARD */}
      {activeBookings.length > 0 && (
        <div className="card" style={{ padding: 14, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consultation Scheduled
            </span>
            <button
              type="button"
              onClick={() => {
                playHaptic();
                setConsultationExpanded(!consultationExpanded);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                display: 'inline-flex'
              }}
              aria-expanded={consultationExpanded}
              aria-label="Toggle consultation details"
            >
              <Icon name={consultationExpanded ? 'chevronUp' : 'chevronDown'} size={16} color="var(--text-secondary)" />
            </button>
          </div>

          {activeBookings.slice(0, 1).map((b) => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={14} color="var(--primary)" />
                    {b.type === 'VIDEO' ? 'Video Review Session' : 'Telephonic Call'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    📅 {b.date} · 🕒 {b.time}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJoinConsultation(b)}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    minHeight: 36
                  }}
                >
                  Join
                </button>
              </div>

              {/* Collapsible content area */}
              {consultationExpanded && (
                <div className="animate-fade-in-up" style={{ padding: 10, background: 'var(--bg-surface-variant)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                    <strong>Prep instructions:</strong> Please prepare a digital copy of your PAN card, Form 16, and bank logs.
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        playHaptic();
                        setActiveSubView('consultations');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      History Logs
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playHaptic();
                        setShowRescheduleModal(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Reschedule Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: DOCUMENTS SUMMARY CARD */}
      <div className="card" style={{ padding: 14, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', boxSizing: 'border-box' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Checklist Status
          </span>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Uploaded: <strong style={{ color: '#10b981' }}>{docCounts.uploaded} / {docCounts.total}</strong>
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>|</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Pending: <strong>{docCounts.pending}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playHaptic();
            trackEvent('documents_opened', { request_id: activeRequest.id });
            setActiveSubView('documents');
          }}
          style={{
            minHeight: 38,
            paddingInline: 14,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-surface-variant)',
            color: 'var(--text-primary)',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Manage Documents
        </button>
      </div>

      {/* Section 6 Alt/Secondary: Invoice Access card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
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
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: 4,
            textDecoration: 'underline'
          }}
        >
          View Billing & Invoices
        </button>
      </div>

      {/* Reschedule Calendar Modal */}
      {showRescheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7,33,70,0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card animate-scale-in" style={{ width: '90%', maxWidth: '340px', padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Reschedule Consultation</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }} id="lbl-resched-date">New Date</label>
              <input type="date" aria-labelledby="lbl-resched-date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', boxSizing: 'border-box' }} value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }} id="lbl-resched-time">New Time</label>
              <input type="time" aria-labelledby="lbl-resched-time" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', boxSizing: 'border-box' }} value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer', minHeight: 40 }}>
                Cancel
              </button>
              <button 
                type="button"
                disabled={isRescheduling}
                onClick={() => {
                  if (!rescheduleData.date || !rescheduleData.time) {
                    addNotification('Please select date and time', 'warning');
                    return;
                  }
                  setIsRescheduling(true);
                  setTimeout(() => {
                    addNotification('Call rescheduled successfully', 'success');
                    setShowRescheduleModal(false);
                    setIsRescheduling(false);
                  }, 800);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 800, cursor: 'pointer', minHeight: 40 }}>
                {isRescheduling ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
