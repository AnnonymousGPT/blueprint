import { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2.2 }) {
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');

  // Auto-dismiss loading shimmer after 600ms
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Monitor network connection changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Analytics helper
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  useEffect(() => {
    trackEvent('dashboard_viewed');
  }, []);

  // Safe Capacitor Haptic trigger
  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
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
        title: 'Action Needed: Upload Docs',
        desc: 'Additional documents are required to resume your filing progress.',
        actionText: 'Upload Documents',
        icon: 'upload',
        bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        accentColor: '#fca5a5',
        request: docsPendingReq,
        action: () => {
          trackEvent('action_card_clicked', { case_type: docsPendingReq.serviceType, case_status: docsPendingReq.status, expert_assigned: !!docsPendingReq.assignedExpertId, action_type: 'UPLOAD_REQUIRED' });
          onOpenDocuments();
        }
      };
    }

    // 2. Review Required
    const reviewReq = recentRequests.find(r => r.status === 'REVIEW' || r.status === 'Review Stage');
    if (reviewReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'REVIEW_REQUIRED',
        title: 'Review Filing Draft',
        desc: 'Your expert has uploaded your tax filing draft. Please review and approve.',
        actionText: 'Review Draft',
        icon: 'fileText',
        bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        accentColor: '#93c5fd',
        request: reviewReq,
        action: () => {
          trackEvent('action_card_clicked', { case_type: reviewReq.serviceType, case_status: reviewReq.status, expert_assigned: !!reviewReq.assignedExpertId, action_type: 'REVIEW_REQUIRED' });
          onSelectRequest(reviewReq.id);
        }
      };
    }

    // 3. Consultation Needed (if no expert assigned or matchmaking active)
    const activeMatchmakingReq = recentRequests.find(r => r.status === 'SUBMITTED' && !r.assignedExpertId);
    if (activeMatchmakingReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'CONSULTATION_REQUIRED',
        title: 'Assigning Tax Expert',
        desc: 'We are matching your request with a certified Chartered Accountant.',
        actionText: 'Join Matchmaking',
        icon: 'phone',
        bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentColor: '#5eead4',
        request: activeMatchmakingReq,
        action: () => {
          trackEvent('action_card_clicked', { case_type: activeMatchmakingReq.serviceType, case_status: activeMatchmakingReq.status, expert_assigned: false, action_type: 'CONSULTATION_REQUIRED' });
          onSelectRequest(activeMatchmakingReq.id);
        }
      };
    }

    // 4. Incomplete Profile check
    if (!isGuest && (!userProfile?.pan || !userProfile?.email)) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'VERIFY_PROFILE',
        title: 'Complete Profile Details',
        desc: 'Enter your PAN number and email address to activate all tax features.',
        actionText: 'Verify Profile',
        icon: 'user',
        bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        accentColor: '#cbd5e1',
        action: () => {
          trackEvent('action_card_clicked', { case_type: 'none', case_status: 'none', expert_assigned: false, action_type: 'VERIFY_PROFILE' });
          onOpenProfile();
        }
      };
    }

    // Default: Active Case without pending actions
    const latestCase = recentRequests[0];
    return {
      type: 'ACTIVE_CASE',
      request: latestCase
    };
  };

  const state = getDashboardState();

  // Find the single assigned expert
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

  // LOADING SHIMMER STATE
  if (state.type === 'LOADING') {
    return (
      <div className="screen-shell" style={{ paddingInline: '16px', gap: 20, paddingTop: 16 }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45 }}>
          <div className="skeleton-container" style={{ width: 140, height: 28, borderRadius: 8 }} />
          <div className="skeleton-container" style={{ width: 38, height: 38, borderRadius: '50%' }} />
        </div>
        {/* Action Card Skeleton */}
        <div className="skeleton-container" style={{ height: 130, borderRadius: 24, width: '100%' }} />
        {/* Current Case Skeleton */}
        <div className="skeleton-container" style={{ height: 120, borderRadius: 24, width: '100%' }} />
        {/* Expert Card Skeleton */}
        <div className="skeleton-container" style={{ height: 80, borderRadius: 20, width: '100%' }} />
        {/* Quick Actions Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="skeleton-container" style={{ height: 48, borderRadius: 12 }} />
          <div className="skeleton-container" style={{ height: 48, borderRadius: 12 }} />
          <div className="skeleton-container" style={{ height: 48, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell animate-fade-in-up" style={{ paddingInline: '16px', gap: 20, paddingTop: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      {/* Offline Alert */}
      {isOffline && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          role="alert"
        >
          <Icon name="info" size={16} color="#ef4444" />
          <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 600 }}>
            Offline Mode — Viewing cached dashboard snapshot.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isGuest ? 'Welcome' : `Hi ${userProfile.name}`}
            <span>👋</span>
          </h1>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '2px 0 0 0' }}>
            What would you like to do next?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <Icon name="calendar" size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 14,
                  height: 14,
                  paddingInline: 3,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.54rem',
                  fontWeight: 900,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid var(--bg-phone)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Open settings"
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
              alt={userProfile.name || 'User Profile'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          </button>
        </div>
      </div>

      {/* SECTION 1: REQUIRED ACTION CARD */}
      {state.type === 'ACTION_REQUIRED' ? (
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '16px 18px',
            background: state.bgGradient,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontSize: '0.58rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.12)',
                color: state.accentColor,
                padding: '3px 8px',
                borderRadius: 99,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                width: 'fit-content'
              }}>
                Attention Required
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                {state.title}
              </h2>
            </div>
            <div style={{ opacity: 0.8, color: '#ffffff' }}>
              <Icon name={state.icon} size={38} strokeWidth={1.8} />
            </div>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
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
            {state.actionText}
            <Icon name="chevronRight" size={14} color="#0f172a" strokeWidth={3} />
          </button>
        </div>
      ) : (
        /* Section 1 Alt: Standard welcome dashboard hero */
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#5eead4',
            padding: '3px 8px',
            borderRadius: 99,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            width: 'fit-content'
          }}>
            Status Update
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            {state.type === 'EMPTY' ? 'Start Your Compliance Path' : 'All Tasks Completed'}
          </h2>
          <p style={{ fontSize: '0.74rem', color: '#ccfbf1', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
            {state.type === 'EMPTY'
              ? 'Consult a certified Chartered Accountant and start your tax filing process today.'
              : 'Our advisor partners are compiling your compliance document packages. We will notify you of any draft review requests.'}
          </p>
          <button
            type="button"
            onClick={() => {
              playHaptic('medium');
              if (state.type === 'EMPTY') {
                trackEvent('action_card_clicked', { case_type: 'none', case_status: 'none', expert_assigned: false, action_type: 'BOOK_CONSULTATION' });
                onSelectService('itr');
              } else {
                trackEvent('action_card_clicked', { case_type: state.request?.serviceType, case_status: state.request?.status, expert_assigned: !!state.request?.assignedExpertId, action_type: 'VIEW_CASES' });
                onViewAllRequests();
              }
            }}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#0d9488',
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
              gap: 6
            }}
          >
            {state.type === 'EMPTY' ? 'Book Consultation' : 'View Case Status'}
            <Icon name="chevronRight" size={14} color="#0d9488" strokeWidth={3} />
          </button>
        </div>
      )}

      {/* SECTION 2: CURRENT CASE CARD */}
      {!isGuest && recentRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, paddingLeft: 4 }}>
            Current Case
          </h2>
          {recentRequests.slice(0, 1).map((req) => (
            <div
              key={req.id}
              className="card animate-scale-in"
              onClick={() => {
                playHaptic();
                trackEvent('case_opened', { case_type: req.serviceType, case_status: req.status, expert_assigned: !!req.assignedExpertId });
                onSelectRequest(req.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 16,
                cursor: 'pointer',
                borderRadius: 24,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open case status for ${req.serviceName}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {req.serviceName}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-surface-variant)',
                  color: 'var(--text-secondary)',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {req.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Bar & Percentage */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filing Progress</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {req.progressPercent || 15}% Complete
                  </span>
                </div>
                <div style={{ height: 6, backgroundColor: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${req.progressPercent || 15}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 999,
                      transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Estimated Completion:
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {req.status === 'COMPLETED' ? 'Completed' : '2 days'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: ASSIGNED EXPERT CARD */}
      {!isGuest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, paddingLeft: 4 }}>
            Assigned Advisor
          </h2>
          {assignedExpert ? (
            <div
              className="card animate-scale-in"
              style={{
                padding: '14px 16px',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
                    alt={assignedExpert.user?.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid var(--bg-card)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {assignedExpert.user?.name || 'Chartered Accountant'}
                  </h3>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', display: 'block', marginTop: 1 }}>
                    {assignedExpert.specialization || 'Tax Consultant'} • {assignedExpert.experience || '5 Yrs'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                    <Icon name="star" size={10} color="#f59e0b" />
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#f59e0b' }}>
                      {assignedExpert.rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  minHeight: 40,
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--bg-surface-variant)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12
                }}
                onClick={() => {
                  playHaptic();
                  trackEvent('expert_contacted', { case_type: 'none', case_status: 'none', expert_assigned: true, action_type: 'expert_chat' });
                  onSupportClick();
                }}
                aria-label="Send message to expert"
              >
                <Icon name="mail" size={14} color="var(--text-primary)" />
                Chat
              </button>
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: '14px 16px',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.08)' }}>
                  <Icon name="phone" size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Assigning Advisor</h3>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: '2px 0 0', fontWeight: 500 }}>
                    Your advisor will be assigned shortly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: QUICK ACTIONS ROW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, paddingLeft: 4 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              trackEvent('quick_action_clicked', { case_type: 'none', case_status: 'none', expert_assigned: !!assignedExpert, action_type: 'documents' });
              onOpenDocuments();
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '12px 8px',
              cursor: 'pointer',
              minHeight: 80,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Icon name="fileText" size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)' }}>Documents</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHaptic();
              trackEvent('quick_action_clicked', { case_type: 'none', case_status: 'none', expert_assigned: !!assignedExpert, action_type: 'messages' });
              onSupportClick();
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '12px 8px',
              cursor: 'pointer',
              minHeight: 80,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Icon name="mail" size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)' }}>Messages</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHaptic();
              trackEvent('quick_action_clicked', { case_type: 'none', case_status: 'none', expert_assigned: !!assignedExpert, action_type: 'book_service' });
              setShowServiceSearch(true);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '12px 8px',
              cursor: 'pointer',
              minHeight: 80,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Icon name="plus" size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)' }}>New Service</span>
          </button>
        </div>
      </div>

      {/* Services Search bottom sheet modal */}
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
              maxHeight: '85vh',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '28px 28px 0 0',
              border: '1px solid var(--border-color)',
              boxShadow: '0 -20px 60px rgba(7, 33, 70, 0.28)',
              padding: '18px 16px calc(16px + env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Search advisory services</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Pick a service to launch setup process.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceSearch(false)}
                aria-label="Close search view"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-variant)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
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
              style={{ width: '100%', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box' }}
              aria-label="Search items"
            />

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
              {['All', ...categories.map((c) => c.title)].map((title) => {
                const isSelected = serviceCategoryFilter === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setServiceCategoryFilter(title)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--secondary)' : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {title}
                  </button>
                );
              })}
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2, maxHeight: '40vh' }}>
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
                      gap: 12,
                      borderRadius: 18,
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{service.title}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>{service.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {service.categoryTitle}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  No services match your query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
