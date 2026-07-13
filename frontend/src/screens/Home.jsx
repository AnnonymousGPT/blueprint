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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 11 2 2 4-4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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
  recentRequests = [],
  onSelectService,
  onSelectRequest,
  onViewAllRequests,
  onBellClick,
  unreadCount = 2, // Matches red badge "2" in screenshot
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const getDashboardState = () => {
    if (loading) return { type: 'LOADING' };
    if (isGuest || recentRequests.length === 0) return { type: 'EMPTY' };

    const docsPendingReq = recentRequests.find(r => r.status === 'DOCUMENTS_PENDING');
    if (docsPendingReq) {
      return {
        type: 'ACTION_REQUIRED',
        actionType: 'UPLOAD_REQUIRED',
        title: 'Upload Pending Documents',
        desc: 'Additional identity/financial documents are required to continue your filing.',
        actionText: 'Upload Documents',
        icon: 'upload',
        bgGradient: 'linear-gradient(135deg, #7c1515 0%, #b91c1c 100%)',
        accentColor: '#fca5a5',
        request: docsPendingReq,
        action: () => onOpenDocuments()
      };
    }

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div className="skeleton-container" style={{ height: 60, borderRadius: 10 }} />
          <div className="skeleton-container" style={{ height: 60, borderRadius: 10 }} />
          <div className="skeleton-container" style={{ height: 60, borderRadius: 10 }} />
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
        paddingInline: '20px',
        paddingTop: '16px',
        paddingBottom: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#f8fafc'
      }}
      className="animate-fade-in-up"
    >
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            Hi {isGuest ? 'Guest' : userProfile.name.split(' ')[0]} <span style={{ fontSize: '1.4rem' }}>👋</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, margin: '3px 0 0 0' }}>
            We're here to make your compliance easy.
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
              background: '#ffffff',
              border: 'none',
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              color: '#0f172a',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              outline: 'none'
            }}
          >
            <Icon name="calendar" size={18} color="#0f172a" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}
              >
                {unreadCount}
              </span>
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
              display: 'inline-flex',
              outline: 'none'
            }}
          >
            <img
              src={userProfile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="Profile"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            />
          </button>
        </div>
      </div>

      {/* SECTION 1: REQUIRED ACTION CARD */}
      <div
        className="screen-hero animate-scale-in"
        style={{
          padding: '18px 20px',
          background: state.bgGradient || 'linear-gradient(135deg, #7c1515 0%, #b91c1c 100%)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 12px 24px rgba(185, 28, 28, 0.12)',
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
              {state.title || 'Upload Pending Documents'}
            </h2>
          </div>
        </div>

        {/* 3D Red folder graphic asset */}
        <div style={{ position: 'absolute', right: 10, top: 12, width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/red_3d_folder.png" alt="Upload Folder" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: 1.35, fontWeight: 500, paddingRight: '80px' }}>
          {state.desc || 'Additional identity/financial documents are required to continue your filing.'}
        </p>

        <button
          type="button"
          onClick={() => {
            playHaptic('medium');
            if (state.action) state.action();
          }}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#7c1515',
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
            transition: 'transform 0.1s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'none'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'none'}
        >
          {state.actionText || 'Upload Documents'}
          <Icon name="chevronRight" size={14} color="#7c1515" strokeWidth={3} />
        </button>
      </div>

      {/* SECTION 2: CURRENT CASE SNAPSHOT */}
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
              gap: 12,
              padding: 16,
              cursor: 'pointer',
              borderRadius: 24,
              backgroundColor: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)',
              width: '100%',
              boxSizing: 'border-box'
            }}
            role="button"
            tabIndex={0}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                {req.serviceName}
              </span>
              <span style={{
                fontSize: '0.6rem',
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>
                {req.status?.replace('_', ' ')}
              </span>
            </div>

            {/* Progress Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>ETA: <strong>2 days</strong></span>
                <span style={{ fontSize: '0.76rem', fontWeight: 950, color: '#0d9488' }}>
                  {req.progressPercent || 40}% Complete
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${req.progressPercent || 40}%`,
                    height: '100%',
                    backgroundColor: '#0d9488',
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
              <span>ETA: 2 days</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#0d9488', fontWeight: 800 }}>
                View Details <Icon name="chevronRight" size={12} color="#0d9488" strokeWidth={3} />
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="card" style={{ padding: 16, borderRadius: 24, backgroundColor: '#ffffff', textAlign: 'center', fontSize: '0.76rem', color: '#64748b' }}>
          No active filings tracked.
        </div>
      )}

      {/* SECTION 3: YOUR ADVISOR TODAY */}
      {assignedExpert ? (
        <div
          className="card animate-scale-in"
          onClick={() => {
            playHaptic();
            onSupportClick();
          }}
          style={{
            padding: '14px 16px',
            borderRadius: 24,
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box'
          }}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
                alt={assignedExpert.user?.name}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
              <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #ffffff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                {assignedExpert.user?.name || 'Akash Sharma'}
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
                {assignedExpert.specialization || 'General Tax Consultant'}
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
              playHaptic();
              onSupportClick();
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
            <Icon name="mail" size={12} color="#2563eb" />
            Chat
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 14, borderRadius: 24, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', backgroundColor: '#eff6ff' }}>
            <Icon name="phone" size={18} color="#2563eb" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>CA Partner Matching</h3>
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0' }}>We are matching a certified advisor shortly.</p>
          </div>
        </div>
      )}

      {/* SECTION 4: QUICK ACTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: '0.64rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Quick Actions
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <div
            onClick={() => {
              playHaptic();
              onOpenDocuments();
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '12px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 105,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, backgroundColor: '#e2f0fd', color: '#2563eb', flexShrink: 0 }}>
              <Icon name="fileText" size={14} color="#2563eb" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.74rem', fontWeight: 900, color: '#0f172a' }}>Documents</h4>
              <p style={{ margin: '1px 0 0', fontSize: '0.58rem', color: '#64748b' }}>View & upload</p>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
              <Icon name="chevronRight" size={8} color="#64748b" strokeWidth={3} />
            </div>
          </div>

          <div
            onClick={() => {
              playHaptic();
              onSupportClick();
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '12px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 105,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, backgroundColor: '#ebf5ff', color: '#2563eb', flexShrink: 0 }}>
              <Icon name="mail" size={14} color="#2563eb" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.74rem', fontWeight: 900, color: '#0f172a' }}>Messages</h4>
              <p style={{ margin: '1px 0 0', fontSize: '0.58rem', color: '#64748b' }}>Chat with advisor</p>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
              <Icon name="chevronRight" size={8} color="#64748b" strokeWidth={3} />
            </div>
          </div>

          <div
            onClick={() => {
              playHaptic();
              setShowServiceSearch(true);
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '12px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 105,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, backgroundColor: '#fef3c7', color: '#d97706', flexShrink: 0 }}>
              <Icon name="plus" size={14} color="#d97706" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.74rem', fontWeight: 900, color: '#0f172a' }}>New Service</h4>
              <p style={{ margin: '1px 0 0', fontSize: '0.58rem', color: '#64748b' }}>Explore more</p>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
              <Icon name="chevronRight" size={8} color="#64748b" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: SECURITY CARD */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          borderRadius: 20,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Subtle shield badge representation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', backgroundColor: '#e2fdf5', color: '#10b981', flexShrink: 0 }}>
            <Icon name="shield" size={18} color="#10b981" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.76rem', fontWeight: 900, color: '#0f172a' }}>We've got your back</h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: '#64748b', lineHeight: 1.25 }}>
              Your data is 100% secure and compliant with RBI guidelines.
            </p>
          </div>
        </div>
        <Icon name="chevronRight" size={14} color="#64748b" strokeWidth={2.5} />
      </div>

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
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase' }}>
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
