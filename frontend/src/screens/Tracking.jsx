import { useEffect, useState, useMemo } from 'react';
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
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...common}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      );
    case 'paperplane':
      return (
        <svg {...common}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
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
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'dots':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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

  // V4 Subview Routing
  const [activeSubView, setActiveSubView] = useState('workspace'); // 'workspace' | 'timeline' | 'documents' | 'invoices' | 'consultations'
  const [consultationExpanded, setConsultationExpanded] = useState(true); // Default open consultation as per screenshot
  const [documentsExpanded, setDocumentsExpanded] = useState(true); // Default open documents summary as per screenshot

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Sync network state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setTimeout(() => setLoading(false), 400);

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

  useEffect(() => {
    if (activeRequest?.id) {
      localStorage.setItem('active_workspace_request_id', activeRequest.id);
    }
  }, [activeRequest]);

  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const handleSelectRequest = (reqId) => {
    playHaptic();
    setManualRequestId(reqId);
  };

  const handleAction = (type) => {
    playHaptic();
    if (type === 'Chat') {
      setActiveTab('chat');
    } else {
      addNotification(`Calling CA ${activeRequest?.assignedExpert?.user?.name || 'Advisor'}...`, 'info');
    }
  };

  const handleDownloadInvoice = () => {
    playHaptic();
    addNotification('Downloading GST tax invoice PDF...', 'success');
  };

  const handleJoinConsultation = (booking) => {
    playHaptic('medium');
    addNotification(`Joining secure ${booking.type.toLowerCase()} consultation link...`, 'success');
  };

  // Dynamic Document Checklist builder
  const documentChecklist = useMemo(() => {
    if (!activeRequest) return [];

    const requestName = (activeRequest.serviceName || '').toLowerCase();
    
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

  const blockers = useMemo(() => {
    return documentChecklist.filter(item => item.status === 'Rejected');
  }, [documentChecklist]);

  const docCounts = useMemo(() => {
    const total = documentChecklist.length;
    const uploaded = documentChecklist.filter(d => d.uploaded).length;
    const pending = total - uploaded;
    return { total, uploaded, pending };
  }, [documentChecklist]);

  const activeBookings = useMemo(() => {
    return (activeRequest?.bookings || []).filter(
      (b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
    );
  }, [activeRequest]);

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
          You don't have any ongoing compliance filings.
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
      <div className="screen-shell" style={{ paddingInline: '16px', gap: 14, paddingTop: 16, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 42 }}>
          <div className="skeleton-container" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="skeleton-container" style={{ width: 120, height: 24, borderRadius: 6 }} />
          <div className="skeleton-container" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        </div>
        <div className="skeleton-container" style={{ height: 110, borderRadius: 20 }} />
        <div className="skeleton-container" style={{ height: 90, borderRadius: 20 }} />
        <div className="skeleton-container" style={{ height: 70, borderRadius: 16 }} />
      </div>
    );
  }

  // SUB-VIEWS ROUTING (Scrollable sub-screens for secondary information)
  
  // 1. TIMELINE SCREEN
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
            Filing Stages Timeline
          </h2>
        </div>

        <div className="card animate-scale-in" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { key: 'NEW', title: 'Request Submitted', desc: 'Case received by Blueprint' },
              { key: 'EXPERT_ASSIGNED', title: 'Expert Assigned', desc: 'CA partner is assigned to review' },
              { key: 'DOCUMENTS_PENDING', title: 'Documents Verification', desc: 'Verification checklist completion' },
              { key: 'IN_PROGRESS', title: 'Filing In Progress', desc: 'Advisor is draft compiling' },
              { key: 'REVIEW', title: 'Draft Review', desc: 'Awaiting client approval signature' },
              { key: 'COMPLETED', title: 'Case Completed', desc: 'Successfully filed and closed' }
            ].map((step, idx, steps) => {
              const currentIdx = steps.findIndex(s => s.key === activeRequest.status);
              const isLast = idx === steps.length - 1;
              const isCompleted = activeRequest.status === 'COMPLETED' || idx < currentIdx;
              const isActive = idx === currentIdx;

              return (
                <div key={step.key} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#10b981' : isActive ? 'transparent' : 'var(--border-color)',
                      border: isActive ? '2px solid #10b981' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {isCompleted && <span style={{ color: '#fff', fontSize: '0.54rem', fontWeight: 900 }}>✓</span>}
                      {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />}
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 2,
                        flex: 1,
                        minHeight: 28,
                        backgroundColor: isCompleted ? '#10b981' : 'var(--border-color)',
                        marginBlock: 2,
                        zIndex: 1
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 4 }}>
                    <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: isActive || isCompleted ? 900 : 700, color: isActive ? '#10b981' : isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {step.title}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.66rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
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

  // 2. DOCUMENTS SCREEN
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
            Filing Documents Checklist
          </h2>
        </div>

        <div className="card" style={{ padding: 14, borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {documentChecklist.map((item) => {
              const hasFile = item.uploaded;
              const isRejected = item.status === 'Rejected';
              const isApproved = item.status === 'Approved' || item.status === 'Verified';

              return (
                <div key={item.category} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.label}
                      <span style={{
                        fontSize: '0.54rem',
                        fontWeight: 800,
                        padding: '2px 5px',
                        borderRadius: 4,
                        backgroundColor: isApproved ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface-variant)',
                        color: isApproved ? '#10b981' : isRejected ? '#dc2626' : 'var(--text-secondary)'
                      }}>
                        {isApproved ? 'Verified' : isRejected ? 'Rejected' : hasFile ? 'Verifying' : 'Required'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                    {hasFile && (
                      <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 500, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        File: {item.fileName}
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
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 4,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Icon name="plus" size={12} color="var(--primary)" />
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

  // 3. INVOICES SCREEN
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
            Invoices & Receipts
          </h2>
        </div>

        <div className="card" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Service</span>
            <h4 style={{ margin: '1px 0 0', fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {activeRequest.serviceName}
            </h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Filing Fee</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatMoney(activeRequest.amount || 1887)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Invoice Code</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>TXN-{activeRequest.id.slice(-6).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Payment Status</span>
            <span style={{ fontWeight: 800, color: '#10b981' }}>PAID</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 12,
              fontSize: '0.76rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 40,
              marginTop: 4
            }}
          >
            <Icon name="download" size={14} color="#ffffff" />
            Download Invoice PDF
          </button>
        </div>
      </div>
    );
  }

  // 4. CONSULTATION HISTORY SCREEN
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
            Consultation Log
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {pastBookings.length > 0 ? (
            pastBookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: 12, borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={12} color="var(--text-secondary)" />
                    {b.type === 'VIDEO' ? 'Video consultation' : 'Telephonic consultation'}
                  </span>
                  <span style={{
                    fontSize: '0.54rem',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: 4,
                    backgroundColor: b.status === 'COMPLETED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    color: b.status === 'COMPLETED' ? '#10b981' : '#dc2626'
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
              No historical sessions recorded.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Required Action mapping
  const action = {
    title: blockers.length > 0 
      ? `Upload Rejected ${blockers[0].label}` 
      : activeRequest.status === 'REVIEW' 
        ? 'Review Draft Return' 
        : 'Upload Form 16 / Salary Slips',
    desc: blockers.length > 0 
      ? `Reason: ${blockers[0].rejectionReason || 'Incorrect document format.'}`
      : activeRequest.status === 'REVIEW'
        ? 'Please verify the final tax calculation sheet and approve the return.'
        : 'These documents are required to continue your filing process.',
    ctaText: activeRequest.status === 'REVIEW' ? 'Review Draft' : 'Upload Now',
    icon: activeRequest.status === 'REVIEW' ? 'fileText' : 'upload',
    bg: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
    action: () => {
      setActiveSubView('documents');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px - env(safe-area-inset-bottom))',
        justifyContent: 'space-between',
        paddingInline: '20px',
        paddingTop: '16px',
        paddingBottom: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        gap: 16
      }}
      className="animate-fade-in-up"
    >
      {/* Header bar (Exactly like Mockup 1) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, position: 'relative' }}>
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
            border: 'none',
            background: '#ffffff',
            color: '#0f172a',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            outline: 'none'
          }}
        >
          <Icon name="back" size={20} color="#0f172a" strokeWidth={2.5} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 950, color: '#0f172a' }}>
            Case Workspace
          </h2>
          <div style={{
            fontSize: '0.72rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 2,
            fontWeight: 500
          }}>
            Case ID: 3874FO
            <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
              <Icon name="copy" size={10} color="#64748b" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <Icon name="bell" size={18} color="#0f172a" />
            <span style={{ position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          </button>
          <button
            type="button"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <Icon name="dots" size={18} color="#0f172a" />
          </button>
        </div>
      </div>

      {/* SECTION 1: REQUIRED ACTION CARD */}
      <div
        className="screen-hero animate-scale-in"
        style={{
          padding: '18px 20px',
          background: action.bg,
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '90px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              width: 'fit-content',
              letterSpacing: '0.4px'
            }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ffffff', marginRight: 5, verticalAlign: 'middle' }} />
              ACTION REQUIRED
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              {action.title}
            </h2>
          </div>
        </div>

        {/* Purple 3D folder graphic asset */}
        <div style={{ position: 'absolute', right: 10, top: 12, width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/purple_3d_folder.png" alt="Folder graphic" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: 1.35, fontWeight: 500, paddingRight: '80px' }}>
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
            color: '#4f46e5',
            fontWeight: 800,
            borderRadius: 14,
            padding: '11px',
            fontSize: '0.8rem',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            outline: 'none'
          }}
        >
          {action.ctaText}
          <Icon name="chevronRight" size={14} color="#4f46e5" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 2: PROGRESS CARD WITH STEP TIMELINE */}
      <div
        className="card animate-scale-in"
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 24,
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.01)',
          border: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Progress Circle display */}
          <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3.5"
                strokeDasharray={`${activeRequest.progressPercent || 40}, 100`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.86rem', fontWeight: 950, color: '#0f172a' }}>
              {activeRequest.progressPercent || 40}%
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0', fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                  {activeRequest.serviceName}
                </h4>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                  <span style={{
                    fontSize: '0.58rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {activeRequest.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 500, display: 'block' }}>ETA</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a' }}>2 days</span>
              </div>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Next Step: <strong style={{ color: '#4f46e5' }}>Document Verification</strong>
            </p>
          </div>
        </div>

        {/* Custom Horizontal Step Timeline (Exactly like Mockup 1) */}
        <div style={{ position: 'relative', marginTop: 6, paddingBottom: 4 }}>
          {/* Grey background timeline line */}
          <div style={{ position: 'absolute', top: 13, left: '10%', right: '10%', height: 2, backgroundColor: '#f1f5f9', zIndex: 1 }} />
          {/* Active timeline line */}
          <div style={{ position: 'absolute', top: 13, left: '10%', width: '0%', height: 2, backgroundColor: '#4f46e5', zIndex: 2 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
            {[
              { label: 'Documents Pending', icon: 'fileText', active: true },
              { label: 'Verification', icon: 'shield', active: false },
              { label: 'Review', icon: 'user', active: false },
              { label: 'Drafting', icon: 'pencil', active: false },
              { label: 'Filing', icon: 'paperplane', active: false }
            ].map((step, idx) => (
              <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18%' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: step.active ? '#4f46e5' : '#ffffff',
                  border: step.active ? 'none' : '1px solid #cbd5e1',
                  color: step.active ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}>
                  <Icon name={step.icon} size={13} color={step.active ? '#ffffff' : '#94a3b8'} strokeWidth={2} />
                </div>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: step.active ? 800 : 500,
                  color: step.active ? '#0f172a' : '#94a3b8',
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 1.1,
                  display: 'block'
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
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
            color: '#4f46e5',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            marginTop: 4,
            outline: 'none'
          }}
        >
          View Full Timeline <Icon name="chevronRight" size={10} color="#4f46e5" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 3: ASSIGNED EXPERT CARD */}
      {activeRequest.assignedExpert && (
        <div
          className="card"
          onClick={() => handleAction('Chat')}
          style={{
            padding: 14,
            borderRadius: 24,
            border: 'none',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            width: '100%',
            boxSizing: 'border-box',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={activeRequest.assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
                alt={activeRequest.assignedExpert.user?.name}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
              <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #ffffff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                {activeRequest.assignedExpert.user?.name || 'Akash Sharma'}
                <span style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.55rem',
                  fontWeight: 900
                }}>✓</span>
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: 1, fontWeight: 500 }}>
                {activeRequest.assignedExpert.specialization || 'General Tax Consultant'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  🕒 Responds within <strong style={{ color: '#0d9488' }}>2 hours</strong>
                </span>
                <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  ⭐ <strong style={{ color: '#0f172a' }}>5.0</strong> (128 reviews)
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction('Chat');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              outline: 'none'
            }}
          >
            <Icon name="chat" size={12} color="#2563eb" />
            Chat
          </button>
        </div>
      )}

      {/* SECTION 4: UPCOMING CONSULTATION CARD */}
      {activeBookings.length > 0 && (
        <div
          className="card"
          style={{
            padding: 16,
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.01)'
          }}
        >
          <div
            onClick={() => {
              playHaptic();
              setConsultationExpanded(!consultationExpanded);
            }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>
              Upcoming Consultation
            </span>
            <Icon name={consultationExpanded ? 'chevronUp' : 'chevronDown'} size={16} color="#0d9488" strokeWidth={2.5} />
          </div>

          {consultationExpanded && activeBookings.slice(0, 1).map((b) => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 2 }}>
              {/* Calendar Block (Mockup 1) */}
              <div style={{
                width: 52,
                height: 56,
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e2e8f0',
                flexShrink: 0
              }}>
                <div style={{ backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.52rem', fontWeight: 800, textAlign: 'center', paddingBlock: 2, textTransform: 'uppercase' }}>
                  MAY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 950, color: '#0f172a', lineHeight: 1 }}>17</span>
                  <span style={{ fontSize: '0.52rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 1 }}>FRI</span>
                </div>
              </div>

              {/* Details Column */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.76rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  🕒 11:30 AM - 12:00 PM
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  📞 Telephonic Call
                </span>
                <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: '#0d9488', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 2 }}>
                  📅 Add to calendar
                </button>
              </div>

              {/* Buttons Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleJoinConsultation(b)}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: 8,
                    padding: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3
                  }}
                >
                  📞 Join Call
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playHaptic();
                    setShowRescheduleModal(true);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0d9488',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: 8,
                    padding: '7px',
                    border: '1px solid #0d9488',
                    cursor: 'pointer'
                  }}
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: DOCUMENTS SUMMARY CARD */}
      <div
        className="card"
        style={{
          padding: 16,
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.01)'
        }}
      >
        <div
          onClick={() => {
            playHaptic();
            setDocumentsExpanded(!documentsExpanded);
          }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>
            Documents Summary
          </span>
          <Icon name={documentsExpanded ? 'chevronUp' : 'chevronDown'} size={16} color="#0d9488" strokeWidth={2.5} />
        </div>

        {documentsExpanded && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              {/* Uploaded Info Pill */}
              <div style={{
                backgroundColor: '#e6fcf5',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ color: '#0d9488', fontSize: '0.8rem' }}>✓</span>
                <div>
                  <div style={{ fontSize: '0.54rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Uploaded</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 950, color: '#0f172a' }}>{docCounts.uploaded} / {docCounts.total}</div>
                </div>
              </div>

              {/* Pending Info Pill */}
              <div style={{
                backgroundColor: '#fff7ed',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ color: '#ea580c', fontSize: '0.8rem' }}>🕒</span>
                <div>
                  <div style={{ fontSize: '0.54rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 950, color: '#0f172a' }}>{docCounts.pending}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playHaptic();
                setActiveSubView('documents');
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#0d9488',
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0
              }}
            >
              Manage Documents <Icon name="chevronRight" size={10} color="#0d9488" strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* Center link below Section 5 */}
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
            color: '#4f46e5',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: 2,
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          📄 View Billing & Invoices
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
          <div className="card animate-scale-in" style={{ width: '90%', maxWidth: '320px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>Reschedule Consultation</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }} id="lbl-resched-date">New Date</label>
              <input type="date" aria-labelledby="lbl-resched-date" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }} value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }} id="lbl-resched-time">New Time</label>
              <input type="time" aria-labelledby="lbl-resched-time" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }} value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#64748b', fontWeight: 800, cursor: 'pointer', minHeight: 38 }}>
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
                style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', backgroundColor: '#0d9488', color: '#fff', fontWeight: 800, cursor: 'pointer', minHeight: 38 }}>
                {isRescheduling ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
