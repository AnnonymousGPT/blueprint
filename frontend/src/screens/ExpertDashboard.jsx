import { useState, useEffect } from 'react';
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
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v5c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-3Z" />
          <path d="m9.5 12.5 2 2 3.5-4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m20 6-11 11-5-5" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <rect x="6.5" y="3.5" width="11" height="17" rx="2.8" />
          <path d="M10 18h4" />
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
    case 'upload':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
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
    default:
      return null;
  }
}

export default function ExpertDashboard({ user, requests = [], onSelectCase, onViewCalendar, onOpenProfile, setExpertActiveTab }) {
  const [loading, setLoading] = useState(true);

  // Auto-dismiss skeleton in 400ms for high performance V3 look
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Safe Capacitor Haptic trigger
  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  // State Machine Priority Engine for Advisor Actions
  const getAdvisorState = () => {
    if (loading) return { type: 'LOADING' };
    if (requests.length === 0) return { type: 'EMPTY' };

    // 1. Verify Client Documents (Highest priority)
    const docsPendingReq = requests.find(r => r.status === 'DOCUMENTS_PENDING');
    if (docsPendingReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'VERIFY_DOCS',
        title: 'Verify Client Documents',
        desc: `Client ${docsPendingReq.client?.name || 'User'} uploaded filing documents. Verify proofs to compile.`,
        actionText: 'Verify Now',
        icon: 'upload',
        bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        accentColor: '#fca5a5',
        request: docsPendingReq,
        action: () => onSelectCase(docsPendingReq)
      };
    }

    // 2. Start Drafting compilation
    const submittedReq = requests.find(r => r.status === 'SUBMITTED' || r.status === 'NEW');
    if (submittedReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'START_DRAFT',
        title: 'Compile Filing Draft',
        desc: `New case assigned for client ${submittedReq.client?.name || 'User'}. Start compilation draft.`,
        actionText: 'Draft Return',
        icon: 'fileText',
        bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        accentColor: '#93c5fd',
        request: submittedReq,
        action: () => onSelectCase(submittedReq)
      };
    }

    // 3. Today's Consultations
    const todayBookingsCount = requests.flatMap(r => r.bookings || []).length;
    if (todayBookingsCount > 0) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'JOIN_CONSULTATION',
        title: 'Client Call Scheduled',
        desc: `You have ${todayBookingsCount} client consultation sessions scheduled for today.`,
        actionText: 'Open Calendar',
        icon: 'calendar',
        bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentColor: '#5eead4',
        action: () => onViewCalendar()
      };
    }

    // Default catch: Review Availability slot schedule
    return {
      type: 'STANDARD',
      title: 'Update Schedule Slots',
      desc: 'Update your calendar availability slots to match with new clients.',
      actionText: 'Configure Slots',
      icon: 'calendar',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accentColor: '#cbd5e1',
      action: () => onViewCalendar()
    };
  };

  const state = getAdvisorState();

  // LOADING SHIMMER STATE
  if (state.type === 'LOADING') {
    return (
      <div className="screen-shell" style={{ paddingInline: '16px', gap: 14, paddingTop: 16, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 42 }}>
          <div className="skeleton-container" style={{ width: 140, height: 26, borderRadius: 8 }} />
          <div className="skeleton-container" style={{ width: 34, height: 34, borderRadius: '50%' }} />
        </div>
        <div className="skeleton-container" style={{ height: 110, borderRadius: 20, width: '100%' }} />
        <div className="skeleton-container" style={{ height: 95, borderRadius: 20, width: '100%' }} />
        <div className="skeleton-container" style={{ height: 70, borderRadius: 16, width: '100%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div className="skeleton-container" style={{ height: 44, borderRadius: 10 }} />
          <div className="skeleton-container" style={{ height: 44, borderRadius: 10 }} />
          <div className="skeleton-container" style={{ height: 44, borderRadius: 10 }} />
        </div>
      </div>
    );
  }

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
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
        <div>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Advisor Portal
          </span>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '1px 0 0' }}>
            Welcome, CA {user?.name?.split(' ')[0] || 'Partner'} 👋
          </h1>
        </div>

        <button
          type="button"
          aria-label="Open advisor settings profile"
          onClick={() => {
            playHaptic();
            onOpenProfile?.();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex'
          }}
        >
          <img
            src={user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
            alt="Advisor profile"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </button>
      </div>

      {/* SECTION 1: REQUIRED ACTION CARD (THE ONLY PROMINENT CTA BUTTON) */}
      <div
        className="screen-hero animate-scale-in"
        style={{
          padding: '14px 16px',
          background: state.bgGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontSize: '0.54rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.12)',
              color: state.accentColor || '#cbd5e1',
              padding: '2px 6px',
              borderRadius: 99,
              textTransform: 'uppercase',
              width: 'fit-content'
            }}>
              Urgent Client Action
            </span>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              {state.title}
            </h2>
          </div>
          <div style={{ opacity: 0.8, color: '#ffffff' }}>
            <Icon name={state.icon || 'calendar'} size={30} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#e2e8f0', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
          {state.desc}
        </p>
        <button
          type="button"
          onClick={() => {
            playHaptic('medium');
            state.action();
          }}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
            borderRadius: 12,
            padding: '10px',
            fontSize: '0.76rem',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          {state.actionText || 'Configure Slots'}
          <Icon name="chevronRight" size={12} color="#0f172a" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 2: CURRENT CASE CARD (NO BUTTON - TAP TRIGGERS SELECT ACTION) */}
      {requests.length > 0 ? (
        requests.slice(0, 1).map((req) => (
          <div
            key={req.id}
            className="card animate-scale-in"
            onClick={() => {
              playHaptic();
              onSelectCase(req);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 14,
              cursor: 'pointer',
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              boxSizing: 'border-box'
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open case verification details for ${req.serviceName}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {req.serviceName}
              </span>
              <span style={{
                fontSize: '0.58rem',
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'var(--bg-surface-variant)',
                color: 'var(--text-secondary)',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                {req.status?.replace('_', ' ')}
              </span>
            </div>

            {/* Progress Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filing Completion</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 950, color: 'var(--primary)' }}>
                  {req.progressPercent || 30}%
                </span>
              </div>
              <div style={{ height: 5, backgroundColor: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${req.progressPercent || 30}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
              <span>Client: <strong>{req.client?.name || 'Blueprint User'}</strong></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--primary)', fontWeight: 800 }}>
                Open Workspace <Icon name="chevronRight" size={10} color="var(--primary)" strokeWidth={3} />
              </span>
            </div>
          </div>
        ))
      ) : (
        <div
          className="card"
          style={{
            padding: 14,
            borderRadius: 20,
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          No client filing cases assigned.
        </div>
      )}

      {/* SECTION 3: ASSIGNED EXPERT CARD (ADVISOR BADGE DETAIL DETAIL DETAILS) */}
      <div
        className="card"
        onClick={() => {
          playHaptic();
          onOpenProfile?.();
        }}
        style={{
          padding: '12px 14px',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box'
        }}
        role="button"
        tabIndex={0}
        aria-label="Open profile settings"
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
              alt="Advisor profile details"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
            />
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', border: '1.5px solid var(--bg-card)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              CA {user?.name || 'Advisor Partner'}
            </h3>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: 1, fontWeight: 500 }}>
              Tax filing specialist • SLA Status: active
            </span>
          </div>
        </div>

        <Icon name="chevronRight" size={14} color="var(--text-secondary)" strokeWidth={2.5} />
      </div>

      {/* SECTION 4: QUICK ACTIONS ROW (ICON ACTION TARGETS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            setExpertActiveTab('cases');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '10px 6px',
            cursor: 'pointer',
            minHeight: 62,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon name="fileText" size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-primary)' }}>Assigned Cases</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playHaptic();
            setExpertActiveTab('calendar');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '10px 6px',
            cursor: 'pointer',
            minHeight: 62,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon name="calendar" size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-primary)' }}>Scheduler</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playHaptic();
            setExpertActiveTab('profile');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '10px 6px',
            cursor: 'pointer',
            minHeight: 62,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon name="user" size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-primary)' }}>Settings</span>
        </button>
      </div>
    </div>
  );
}
