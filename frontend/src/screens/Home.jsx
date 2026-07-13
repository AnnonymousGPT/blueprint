import { useState, useEffect, useMemo } from 'react';
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

export default function Home({
  userProfile,
  stats,
  recentRequests = [],
  onSelectService,
  onSelectRequest,
  onViewAllRequests,
  onBellClick,
  unreadCount = 0,
  onOpenProfile,
  onOpenDocuments,
  onSupportClick,
  setActiveTab
}) {
  const isGuest = userProfile?.isGuest || userProfile?.name === 'Guest';
  const [loading, setLoading] = useState(true);
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');

  // Auto-dismiss loading shimmer after 400ms for snappier V3 load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Capacitor Haptic trigger
  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  // State Machine Priority Engine
  const getDashboardState = () => {
    if (loading) return { type: 'LOADING' };
    if (isGuest || recentRequests.length === 0) return { type: 'EMPTY' };

    // 1. Documents Pending (Highest priority)
    const docsPendingReq = recentRequests.find(r => r.status === 'DOCUMENTS_PENDING');
    if (docsPendingReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'UPLOAD_REQUIRED',
        title: 'Upload Pending Documents',
        desc: 'Additional identity/financial files are needed to file.',
        actionText: 'Upload Now',
        icon: 'upload',
        bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        accentColor: '#fca5a5',
        request: docsPendingReq,
        action: () => onOpenDocuments()
      };
    }

    // 2. Review Required
    const reviewReq = recentRequests.find(r => r.status === 'REVIEW' || r.status === 'Review Stage');
    if (reviewReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'REVIEW_REQUIRED',
        title: 'Review Filing Draft',
        desc: 'Filing calculations draft is ready. Review and approve.',
        actionText: 'Review Draft',
        icon: 'fileText',
        bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        accentColor: '#93c5fd',
        request: reviewReq,
        action: () => onSelectRequest(reviewReq.id)
      };
    }

    // 3. Consultation Matchmaking
    const activeMatchmakingReq = recentRequests.find(r => r.status === 'SUBMITTED' && !r.assignedExpertId);
    if (activeMatchmakingReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'CONSULTATION_REQUIRED',
        title: 'Matching Tax Expert',
        desc: 'Finding a certified CA partner to manage your filing.',
        actionText: 'Track Match',
        icon: 'phone',
        bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentColor: '#5eead4',
        request: activeMatchmakingReq,
        action: () => onSelectRequest(activeMatchmakingReq.id)
      };
    }

    // 4. Verify Profile
    if (!isGuest && (!userProfile?.pan || !userProfile?.email)) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'VERIFY_PROFILE',
        title: 'Verify Profile Identity',
        desc: 'Verify your PAN card to initiate tax match flow.',
        actionText: 'Verify Profile',
        icon: 'user',
        bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        accentColor: '#cbd5e1',
        action: () => onOpenProfile()
      };
    }

    // Default: Standard active case tracking
    return {
      type: 'ACTIVE_CASE',
      request: recentRequests[0]
    };
  };

  const state = getDashboardState();
  const assignedExpert = !isGuest && recentRequests.find(r => r.assignedExpert)?.assignedExpert;

  const categories = [
    {
      title: 'Tax & Compliance',
      items: [
        { id: 'itr', title: 'File ITR', desc: 'Income tax filing' },
        { id: 'gst', title: 'GST Registration', desc: 'Registration & monthly filing' }
      ]
    },
    {
      title: 'Business Growth',
      items: [
        { id: 'business', title: 'Incorporate Business', desc: 'Pvt Ltd, LLP setups' },
        { id: 'dpr', title: 'Business Plan / DPR', desc: 'Investor projections' }
      ]
    },
    {
      title: 'Funding & Govt. Schemes',
      items: [
        { id: 'loan', title: 'Loan Assistance', desc: 'Bank & startup loans' },
        { id: 'schemes', title: 'Govt Schemes', desc: 'Subsidy & grants help' }
      ]
    }
  ];

  const serviceCatalog = categories.flatMap(c => c.items.map(i => ({ ...i, categoryTitle: c.title })));
  const filteredServices = serviceCatalog.filter(s => {
    const q = serviceQuery.toLowerCase();
    const matchCat = serviceCategoryFilter === 'All' || s.categoryTitle === serviceCategoryFilter;
    const matchQuery = s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  // Dynamic Smart Context Compiler
  const smartContextData = useMemo(() => {
    if (loading) return null;
    const activeReq = recentRequests[0];
    if (!activeReq) {
      return {
        title: 'Portfolio secured',
        desc: 'Active advisor matches monitored 24/7',
        icon: 'shield',
        color: '#6366f1',
        bg: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.15)'
      };
    }

    // 1. Pending docs
    if (activeReq.status === 'DOCUMENTS_PENDING') {
      const pendingCount = (activeReq.documents || []).filter(d => d.status === 'PENDING_UPLOAD' || d.status === 'Rejected').length || 3;
      return {
        title: `${pendingCount} documents pending`,
        desc: 'Estimated upload time: 2 minutes',
        icon: 'upload',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.15)'
      };
    }

    // 2. Scheduled consultation call tomorrow/today
    const activeCall = (activeReq.bookings || []).find(b => b.status === 'CONFIRMED' || b.status === 'SCHEDULED');
    if (activeCall) {
      return {
        title: 'Consultation tomorrow',
        desc: `Scheduled at ${activeCall.time || '11:30 AM'}`,
        icon: 'calendar',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.15)'
      };
    }

    // 3. Completed return
    if (activeReq.status === 'COMPLETED') {
      return {
        title: 'ITR successfully filed',
        desc: 'Acknowledgement receipt available',
        icon: 'check',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.15)'
      };
    }

    // Default catch-all
    return {
      title: 'Portfolio secured',
      desc: 'Active advisor matches monitored 24/7',
      icon: 'shield',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.05)',
      border: '1px solid rgba(99, 102, 241, 0.15)'
    };
  }, [loading, recentRequests]);

  // LOADING SHIMMER STATE
  if (state.type === 'LOADING') {
    return (
      <div className="screen-shell" style={{ paddingInline: '16px', gap: 14, paddingTop: 16, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 42 }}>
          <div className="skeleton-container" style={{ width: 120, height: 26, borderRadius: 8 }} />
          <div className="skeleton-container" style={{ width: 34, height: 34, borderRadius: '50%' }} />
        </div>
        <div className="skeleton-container" style={{ height: 110, borderRadius: 20, width: '100%' }} />
        <div className="skeleton-container" style={{ height: 95, borderRadius: 20, width: '100%' }} />
        <div className="skeleton-container" style={{ height: 70, borderRadius: 16, width: '100%' }} />
        <div className="skeleton-container" style={{ height: 60, borderRadius: 16, width: '100%' }} />
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {isGuest ? 'Welcome' : `Hi ${userProfile.name.split(' ')[0]}`} 👋
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, margin: '2px 0 0 0' }}>
            Wealth & Compliance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() => {
              playHaptic();
              onBellClick?.();
            }}
            style={{
              background: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-color)',
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <Icon name="calendar" size={14} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -1,
                  right: -1,
                  width: 12,
                  height: 12,
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '1.5px solid var(--bg-phone)'
                }}
              />
            )}
          </button>

          <button
            type="button"
            aria-label="Open profile settings"
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
              src={userProfile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="Profile"
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
      </div>

      {/* SECTION 1: TODAY'S PRIORITY CARD (EXACTLY ONE MAIN CTA BUTTON) */}
      {state.type === 'ACTION_REQUIRED' ? (
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '14px 16px',
            background: state.bgGradient,
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
                color: state.accentColor,
                padding: '2px 6px',
                borderRadius: 99,
                textTransform: 'uppercase',
                width: 'fit-content'
              }}>
                Today's Priority
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
                {state.title}
              </h2>
            </div>
            <div style={{ opacity: 0.8, color: '#ffffff' }}>
              <Icon name={state.icon} size={30} strokeWidth={1.8} />
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
            {state.actionText}
            <Icon name="chevronRight" size={12} color="#0f172a" strokeWidth={3} />
          </button>
        </div>
      ) : (
        /* Section 1 Alt: Empty welcome hero */
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span style={{
            fontSize: '0.54rem',
            fontWeight: 800,
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            padding: '2px 6px',
            borderRadius: 99,
            textTransform: 'uppercase',
            width: 'fit-content'
          }}>
            Today's Status
          </span>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
            {state.type === 'EMPTY' ? 'Start Compliance Path' : 'All Filings Completed'}
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
            {state.type === 'EMPTY'
              ? 'Match with a certified CA Partner to file taxes and secure subsidy benefits.'
              : 'Our expert advisor partners have verified and completed all filings.'}
          </p>
          <button
            type="button"
            onClick={() => {
              playHaptic('medium');
              if (state.type === 'EMPTY') {
                setShowServiceSearch(true);
              } else {
                onViewAllRequests();
              }
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
            {state.type === 'EMPTY' ? 'Browse Services' : 'View Case History'}
            <Icon name="chevronRight" size={12} color="#0f172a" strokeWidth={3} />
          </button>
        </div>
      )}

      {/* SECTION 2: CURRENT CASE SNAPSHOT (NO CTA BUTTON, CARD TAP ONLY) */}
      {!isGuest && recentRequests.length > 0 ? (
        recentRequests.slice(0, 1).map((req) => (
          <div
            key={req.id}
            className="card animate-scale-in"
            onClick={() => {
              playHaptic();
              onSelectRequest(req.id);
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
            aria-label={`Open status for ${req.serviceName}`}
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
                <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filing Progress</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 950, color: 'var(--primary)' }}>
                  {req.progressPercent || 15}%
                </span>
              </div>
              <div style={{ height: 5, backgroundColor: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${req.progressPercent || 15}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
              <span>ETA: <strong>2 days</strong></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--primary)', fontWeight: 800 }}>
                Details <Icon name="chevronRight" size={10} color="var(--primary)" strokeWidth={3} />
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
          No active filings tracked.
        </div>
      )}

      {/* SECTION 3: YOUR ADVISOR TODAY (NO BUTTON, TAP REDIRECTS TO CHAT) */}
      {!isGuest && (
        assignedExpert ? (
          <div
            className="card animate-scale-in"
            onClick={() => {
              playHaptic();
              onSupportClick();
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
            aria-label={`Chat with advisor CA ${assignedExpert.user?.name}`}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
                  alt={assignedExpert.user?.name}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', border: '1.5px solid var(--bg-card)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  CA {assignedExpert.user?.name || 'Chartered Accountant'}
                </h3>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: 1, fontWeight: 500 }}>
                  {assignedExpert.specialization || 'Tax Advisor'} · Response: &lt;2h
                </span>
              </div>
            </div>

            <Icon name="chevronRight" size={14} color="var(--text-secondary)" strokeWidth={2.5} />
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: '12px 14px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--border-color)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.08)', flexShrink: 0 }}>
              <Icon name="phone" size={16} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>CA Partner Match</h3>
              <p style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', margin: '2px 0 0', fontWeight: 500 }}>
                Assigning a certified expert advisor.
              </p>
            </div>
          </div>
        )
      )}

      {/* SECTION 4: SMART CONTEXT CARD (DYNAMIC COMPILATION DETAILS) */}
      {smartContextData && (
        <div
          className="card"
          style={{
            padding: '12px 14px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: smartContextData.bg,
            border: smartContextData.border,
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ color: smartContextData.color, display: 'flex', flexShrink: 0 }}>
            <Icon name={smartContextData.icon} size={22} color={smartContextData.color} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {smartContextData.title}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {smartContextData.desc}
            </p>
          </div>
        </div>
      )}

      {/* Services Search Modal bottom sheet */}
      {showServiceSearch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 33, 70, 0.42)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowServiceSearch(false)}
        >
          <div
            className="animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '75vh',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid var(--border-color)',
              boxShadow: '0 -20px 60px rgba(7, 33, 70, 0.28)',
              padding: '16px 14px calc(14px + env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Search advisory services</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Select a compliance advisory flow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceSearch(false)}
                aria-label="Close search"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-variant)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="search"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Search ITR, GST, LLP, Loan..."
              className="form-control"
              style={{ width: '100%', borderRadius: 12, padding: '10px 12px', boxSizing: 'border-box' }}
              aria-label="Search items"
            />

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
              {['All', ...categories.map((c) => c.title)].map((title) => {
                const isSelected = serviceCategoryFilter === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setServiceCategoryFilter(title)}
                    style={{
                      flexShrink: 0,
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--secondary)' : 'var(--text-secondary)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {title}
                  </button>
                );
              })}
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '35vh' }}>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setShowServiceSearch(false);
                      onSelectService(service.id);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{service.title}</div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 2 }}>{service.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase' }}>
                      {service.categoryTitle.split(' ')[0]}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                  No services match query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
