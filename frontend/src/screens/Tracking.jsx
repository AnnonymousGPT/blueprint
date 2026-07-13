import { useEffect, useState, useMemo, useRef } from 'react';
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
    default:
      return null;
  }
}

export default function Tracking({ requests = [], documents = [], selectedRequestId, onBackToHome, setActiveTab, addNotification, user }) {
  const [manualRequestId, setManualRequestId] = useState(() => {
    return localStorage.getItem('active_workspace_request_id') || null;
  });
  
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [showChat, setShowChat] = useState(false);

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
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
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
      trackEvent('expert_chat_opened', { request_id: activeRequest.id });
      setShowChat(true);
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
    playHaptic();
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
      <div className="screen-shell" style={{ paddingInline: '8px', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, marginTop: 4 }}>
          <div className="skeleton-container animate-pulse-slow" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="skeleton-container animate-pulse-slow" style={{ width: 120, height: 24, borderRadius: 6 }} />
          <div className="skeleton-container animate-pulse-slow" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        </div>
        <div className="skeleton-container animate-pulse-slow" style={{ height: 120, borderRadius: 16 }} />
        <div className="skeleton-container animate-pulse-slow" style={{ height: 160, borderRadius: 16 }} />
        <div className="skeleton-container animate-pulse-slow" style={{ height: 140, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="screen-shell" style={{ gap: 14, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      
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
                  border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                  color: isSelected ? '#10b981' : 'var(--text-secondary)',
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

      {/* Section 1: Outstanding Blockers & Warning Notifications */}
      {blockers.length > 0 && (
        <div className="card" style={{ padding: 12, background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', marginBottom: 4 }}>
            <Icon name="alert" size={16} color="#dc2626" />
            <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>Critical Actions Required</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {blockers.map((bl) => (
              <div key={bl.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>Re-upload {bl.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#dc2626', marginTop: 1 }}>Reason: {bl.rejectionReason}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHaptic();
                    localStorage.setItem('preselectUploadCategory', bl.category);
                    setActiveTab('documents');
                  }}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '6px 12px',
                    borderRadius: 6,
                    minHeight: 32
                  }}
                >
                  Upload File
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Case Overview Progress Wheel */}
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray={`${activeRequest.progressPercent || 30}, 100`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {activeRequest.progressPercent || 30}%
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)' }}>CASE FILING FILLED</span>
          <h4 style={{ margin: '2px 0 0', fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {activeRequest.serviceName}
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Filing Stage: <strong style={{ color: '#10b981' }}>{activeRequest.status}</strong>
          </p>
        </div>
      </div>

      {/* Section 3: Upcoming Consultations */}
      {activeBookings.length > 0 && (
        <section aria-labelledby="upcoming-calls-title" style={{ width: '100%' }}>
          <h3 id="upcoming-calls-title" style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '4px 0 8px' }}>
            Upcoming Consultations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeBookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={b.type === 'VIDEO' ? 'video' : 'phone'} size={14} color="#10b981" />
                    {b.type === 'VIDEO' ? 'Video Review Session' : 'Telephonic consultation'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    📅 {b.date} · 🕒 {b.time}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                    Status: Verified Slot
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleJoinConsultation(b)}
                    className="btn btn-primary"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      minHeight: 34
                    }}
                  >
                    Join
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
                      color: 'var(--text-secondary)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Progress Timeline */}
      <section aria-labelledby="timeline-header-title" style={{ width: '100%' }}>
        <h3 id="timeline-header-title" style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '4px 0 8px' }}>
          Request Timeline
        </h3>
        <div className="card" style={{ padding: 14, background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {timelineSteps.map((step, idx) => {
              const isLast = idx === timelineSteps.length - 1;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={step.key} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  
                  {/* Indicator lines */}
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
                        minHeight: 24,
                        backgroundColor: isCompleted ? '#10b981' : 'var(--border-color)',
                        marginBlock: 2,
                        zIndex: 1
                      }} />
                    )}
                  </div>

                  {/* Stage copy details */}
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 4 }}>
                    <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: isActive || isCompleted ? 900 : 700, color: isActive ? '#10b981' : isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {step.title}
                    </h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.66rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Document Verification Checklist */}
      <section aria-labelledby="checklist-header-title" style={{ width: '100%' }}>
        <h3 id="checklist-header-title" style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '4px 0 8px' }}>
          Document Checklist
        </h3>
        <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {documentChecklist.map((item) => {
              const hasFile = item.uploaded;
              const isRejected = item.status === 'Rejected';
              const isApproved = item.status === 'Approved' || item.status === 'Verified';

              return (
                <div key={item.category} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
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
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                    {hasFile && (
                      <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Uploaded: {item.fileName}
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
                      color: '#10b981',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 4,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    aria-label={`Upload copy for ${item.label}`}
                  >
                    <Icon name="plus" size={14} color="#10b981" />
                    {hasFile ? 'Replace' : 'Upload'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Payment Summary & Tax Invoice */}
      <section aria-labelledby="invoice-header-title" style={{ width: '100%' }}>
        <h3 id="invoice-header-title" style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '4px 0 8px' }}>
          Payment &amp; Invoices
        </h3>
        <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Filing Fee: {formatMoney(activeRequest.amount || 1887)}
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Transaction ID: TXN-{activeRequest.id.slice(-6).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                Invoice Status: PAID
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minHeight: 34
              }}
              aria-label="Download tax receipt invoice"
            >
              <Icon name="download" size={12} color="#ffffff" />
              Invoice
            </button>
          </div>
        </div>
      </section>

      {/* Section 7: Expert details card */}
      {activeRequest.assignedExpert && (
        <section aria-labelledby="expert-header-title" style={{ width: '100%' }}>
          <h3 id="expert-header-title" style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '4px 0 8px' }}>
            Assigned CA Partner
          </h3>
          <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                <img src={activeRequest.assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'} alt={activeRequest.assignedExpert.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                  {activeRequest.assignedExpert.specialization || 'Taxation Expert'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => handleAction('Chat')}
                style={{
                  minHeight: 38,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                aria-label={`Open chat room thread with CA ${activeRequest.assignedExpert.user?.name}`}
              >
                <Icon name="chat" size={14} color="var(--text-primary)" />
                Chat
              </button>
              <button
                type="button"
                onClick={() => handleAction('Call')}
                style={{
                  minHeight: 38,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                aria-label={`Initiate voice call dialer with CA ${activeRequest.assignedExpert.user?.name}`}
              >
                <Icon name="phone" size={14} color="var(--text-primary)" />
                Call Expert
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Chat Drawer Overlay */}
      {showChat && activeRequest.assignedExpert && (
        <div
          onClick={() => setShowChat(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80%'
            }}
          >
            <ChatBox
              otherUserId={activeRequest.assignedExpert.userId || activeRequest.assignedExpert.user?.id}
              otherUserName={activeRequest.assignedExpert.user?.name || 'Chartered Accountant'}
              currentUserId={user?.id || 'client-1'}
              onClose={() => setShowChat(false)}
              addNotification={addNotification}
            />
          </div>
        </div>
      )}

      {/* Reschedule Calendar Modal */}
      {showRescheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '340px', padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', fontWeight: 800 }}>Reschedule Consultation</h3>
            
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
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
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
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {isRescheduling ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
