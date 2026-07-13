import { useState, useEffect, useRef } from 'react';
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
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
    case 'history':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L21 8" />
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
  onOpenProfile
}) {
  const isGuest = userProfile?.isGuest || userProfile?.name === 'Guest';
  const [activeDot, setActiveDot] = useState(0);
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Auto-dismiss loading shimmer after 700ms
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
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
    trackEvent('home_screen_viewed');
  }, []);

  // Safe Capacitor Haptic trigger
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  // Carousel Slides for empty/guest welcome experience
  const carouselSlides = [
    {
      title: "Simple Tax Filing",
      desc: "File ITR, GST, and compliance with certified experts.",
      tag: "Tax & Compliance",
      bgGradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      textColor: "#ffffff",
      descColor: "#ccfbf1",
      tagColor: "#5eead4",
      tagBg: "rgba(20, 184, 166, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#0d9488"
    },
    {
      title: "Launch Your Startup",
      desc: "Incorporate Pvt Ltd, LLP, and local setups quickly.",
      tag: "Business Growth",
      bgGradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      textColor: "#ffffff",
      descColor: "#e0f2fe",
      tagColor: "#7dd3fc",
      tagBg: "rgba(14, 165, 233, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#0ea5e9"
    },
    {
      title: "Govt Subsidies & Loans",
      desc: "Secure Mudra loans, grants, and subsidies.",
      tag: "Funding & Schemes",
      bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      textColor: "#ffffff",
      descColor: "#ffedd5",
      tagColor: "#fdba74",
      tagBg: "rgba(249, 115, 22, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#ea580c"
    }
  ];

  useEffect(() => {
    if (isGuest || recentRequests.length === 0) {
      const timer = setInterval(() => {
        setActiveDot((prev) => (prev + 1) % carouselSlides.length);
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [recentRequests.length, isGuest]);

  // Typing search placeholder animation
  const searchPlaceholders = [
    'Search "File ITR"...',
    'Search "Pvt Ltd setup"...',
    'Search "GST Filing"...',
    'Search "Govt Schemes"...'
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic next actions based on request status
  const getDynamicAction = () => {
    if (isGuest) {
      return {
        type: 'WELCOME',
        title: 'Ready to secure your taxes?',
        desc: 'Consult a verified CA and start your tax filing path today.',
        actionText: 'Book Consultation',
        action: () => onSelectService('expert')
      };
    }

    // Find requests requiring uploads
    const pendingDocRequest = recentRequests.find(r => r.status === 'DOCUMENTS_PENDING');
    if (pendingDocRequest) {
      return {
        type: 'DOCS_PENDING',
        title: 'Action Needed: Upload Docs',
        desc: `Your filing for ${pendingDocRequest.serviceName} is blocked. Upload pending documents now.`,
        actionText: 'Upload Documents',
        action: () => {
          trackEvent('action_card_clicked', { task_type: 'UPLOAD', request_id: pendingDocRequest.id });
          onSelectRequest(pendingDocRequest.id);
        }
      };
    }

    // Find requests in review stage
    const reviewRequest = recentRequests.find(r => r.status === 'REVIEW' || r.status === 'Review Stage');
    if (reviewRequest) {
      return {
        type: 'REVIEW_PENDING',
        title: 'Filing Draft Ready',
        desc: `Please review and approve the draft for ${reviewRequest.serviceName} prepared by your expert.`,
        actionText: 'Review Draft',
        action: () => {
          trackEvent('action_card_clicked', { task_type: 'REVIEW', request_id: reviewRequest.id });
          onSelectRequest(reviewRequest.id);
        }
      };
    }

    // Default welcome state or caught up state
    if (recentRequests.length > 0) {
      return {
        type: 'ALL_CAUGHT_UP',
        title: 'All actions completed!',
        desc: 'Our CA partners are processing your compliance forms.',
        actionText: 'View Case Status',
        action: () => onViewAllRequests()
      };
    }

    return null;
  };

  const nextAction = getDynamicAction();

  // Find assigned CA expert
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

  // Renders the Loading Skeleton Layout
  if (loading) {
    return (
      <div className="screen-shell" style={{ paddingInline: '8px', gap: 16 }}>
        {/* Header Shimmer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, marginTop: 4 }}>
          <div className="skeleton-container animate-pulse-slow" style={{ width: 120, height: 24, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton-container animate-pulse-slow" style={{ width: 140, height: 38, borderRadius: 20 }} />
            <div className="skeleton-container animate-pulse-slow" style={{ width: 34, height: 34, borderRadius: '50%' }} />
          </div>
        </div>
        {/* Banner Shimmer */}
        <div className="skeleton-container animate-pulse-slow" style={{ height: 110, borderRadius: 20, width: '100%' }} />
        {/* Statistics Grid Shimmer */}
        <div className="responsive-grid-3" style={{ gap: 8 }}>
          <div className="skeleton-container animate-pulse-slow" style={{ height: 50, borderRadius: 14 }} />
          <div className="skeleton-container animate-pulse-slow" style={{ height: 50, borderRadius: 14 }} />
          <div className="skeleton-container animate-pulse-slow" style={{ height: 50, borderRadius: 14 }} />
        </div>
        {/* Case List Shimmer */}
        <div className="skeleton-container animate-pulse-slow" style={{ height: 120, borderRadius: 18 }} />
        {/* Expert Shimmer */}
        <div className="skeleton-container animate-pulse-slow" style={{ height: 75, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="screen-shell animate-fade-in-up" style={{ paddingInline: '4px', gap: 16 }}>
      {/* Offline Mode Banner */}
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
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
            Offline Mode — Viewing cached dashboard snapshot.
          </span>
        </div>
      )}

      {/* Header Container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, marginTop: 4, paddingHorizontal: 4 }}>
        <div>
          <h2
            className="title-accent"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isGuest ? 'Hello Guest' : `Hello ${userProfile.name}`}
            <span style={{ fontSize: '1.25rem' }}>👋</span>
          </h2>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '3px 0 0 0' }}>
            {isOffline ? 'You are offline.' : 'Your tax dashboard is up to date.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search trigger button */}
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setShowServiceSearch(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-color)',
              borderRadius: 99,
              padding: '6px 12px',
              width: 175,
              height: 40,
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            aria-label="Search advisory services"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {searchPlaceholders[placeholderIdx]}
            </span>
          </button>

          {/* Support Ticket / Live chat link */}
          <button
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
            aria-label="Open notifications inbox"
            onClick={() => {
              playHaptic();
              onBellClick?.();
            }}
          >
            <Icon name="bell" size={20} color="var(--text-primary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
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

          {/* Profile photo trigger */}
          <button
            type="button"
            onClick={() => {
              playHaptic();
              onOpenProfile?.();
            }}
            aria-label="Open profile configuration"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              marginLeft: 2,
              display: 'inline-flex'
            }}
          >
            <img
              src={userProfile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={userProfile.name || 'User Profile'}
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

      {/* Dynamic Next Action Banner */}
      {nextAction ? (
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '16px',
            background: nextAction.type === 'DOCS_PENDING'
              ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)'
              : nextAction.type === 'REVIEW_PENDING'
              ? 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            minHeight: 106,
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle design element */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '0.55rem',
              fontWeight: 800,
              background: nextAction.type === 'DOCS_PENDING' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
              color: nextAction.type === 'DOCS_PENDING' ? '#fca5a5' : '#93c5fd',
              padding: '3px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name="shield" size={8} color={nextAction.type === 'DOCS_PENDING' ? '#fca5a5' : '#93c5fd'} />
              Required Action
            </span>
            <h3 className="title-accent" style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 4, color: '#ffffff', lineHeight: 1.15, marginBottom: 2 }}>
              {nextAction.title}
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.25, fontWeight: 500 }}>
              {nextAction.desc}
            </p>
            <button
              type="button"
              onClick={() => {
                playHaptic();
                nextAction.action();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: 99,
                padding: '6px 12px',
                fontSize: '0.66rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {nextAction.actionText}
              <Icon name="chevronRight" size={12} color="#0f172a" />
            </button>
          </div>
          <div style={{ flexShrink: 0, zIndex: 2, opacity: 0.9 }}>
            {nextAction.type === 'DOCS_PENDING' ? (
              <Icon name="upload" size={48} color="#ef4444" strokeWidth={1.8} />
            ) : (
              <Icon name="check" size={48} color="#22c55e" strokeWidth={1.8} />
            )}
          </div>
        </div>
      ) : (
        /* Guest Welcome Banner Carousel */
        <div
          className="screen-hero animate-scale-in"
          style={{
            padding: '16px',
            background: carouselSlides[activeDot].bgGradient,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: 110,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span style={{
            fontSize: '0.55rem',
            fontWeight: 800,
            background: carouselSlides[activeDot].tagBg,
            color: carouselSlides[activeDot].tagColor,
            padding: '3px 8px',
            borderRadius: 99,
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {carouselSlides[activeDot].tag}
          </span>
          <h3 className="title-accent" style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 4, color: '#ffffff', marginBottom: 2 }}>
            {carouselSlides[activeDot].title}
          </h3>
          <p style={{ fontSize: '0.68rem', color: carouselSlides[activeDot].descColor, margin: '0 0 10px 0', fontWeight: 500 }}>
            {carouselSlides[activeDot].desc}
          </p>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              setShowServiceSearch(true);
            }}
            style={{
              backgroundColor: '#ffffff',
              color: carouselSlides[activeDot].btnTextColor,
              fontWeight: 800,
              borderRadius: 99,
              padding: '6px 12px',
              fontSize: '0.66rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Approaching Compliance Deadlines Timeline */}
      {!isGuest && (
        <div style={{ marginTop: 2 }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, paddingHorizontal: 4 }}>
            Approaching Deadlines
          </h4>
          <div className="card" style={{ padding: '12px 14px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
                <Icon name="calendar" size={14} color="#ef4444" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>GST Monthly Return Filing</div>
                <div style={{ fontSize: '0.64rem', color: '#ef4444', fontWeight: 600 }}>Due: 20th of this month</div>
              </div>
              <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 800 }}>Urgents</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.08)' }}>
                <Icon name="calendar" size={14} color="#f97316" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>ITR Return Submission (FY 2025-26)</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Target: 31st July 2026</div>
              </div>
              <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 6, backgroundColor: 'var(--bg-surface-variant)', color: 'var(--text-secondary)', fontWeight: 700 }}>Milestone</span>
            </div>
          </div>
        </div>
      )}

      {/* Active / Recent Cases Section */}
      {!isGuest && recentRequests.length > 0 && (
        <div style={{ marginTop: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingHorizontal: 4 }}>
            <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Active Cases
            </h4>
            <button
              type="button"
              onClick={onViewAllRequests}
              style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
              aria-label="View all service requests"
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentRequests.slice(0, 2).map((req) => (
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
                  padding: 12,
                  cursor: 'pointer',
                  borderRadius: 18
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open case status for ${req.serviceName}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {req.status === 'DOCUMENTS_PENDING' ? '⚠️ Missing Docs' : 'Live Status'}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    ID: {req.id.substring(0, 8)}...
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{req.serviceName}</h5>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
                      Stage: <strong style={{ color: 'var(--secondary)' }}>{req.status.replace('_', ' ')}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    {req.progressPercent || 15}%
                  </span>
                </div>

                <div style={{ height: 5, backgroundColor: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${req.progressPercent || 15}%`, height: '100%', backgroundColor: 'var(--secondary)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary stats count */}
      {!isGuest && (
        <div style={{ marginTop: 2 }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, paddingHorizontal: 4 }}>
            Case Analytics
          </h4>
          <div className="responsive-grid-3" style={{ gap: 8 }}>
            <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 14 }}>
              <Icon name="shield" size={16} color="var(--primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Cases</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>{stats.activeRequests}</span>
              </div>
            </div>
            <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 14 }}>
              <Icon name="upload" size={16} color="var(--primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Documents</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>{stats.documentsUploaded}</span>
              </div>
            </div>
            <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 14 }}>
              <Icon name="check" size={16} color="var(--primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Consultations</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>{stats.consultations}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Expert profile card */}
      {!isGuest && assignedExpert ? (
        <div style={{ marginTop: 2 }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, paddingHorizontal: 4 }}>
            Assigned Advisor
          </h4>
          <div
            className="card"
            style={{
              padding: '12px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={assignedExpert.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}
                  alt={assignedExpert.user?.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <span style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', border: '1.5px solid #ffffff' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {assignedExpert.user?.name || 'Chartered Accountant'}
                </h5>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: 1 }}>
                  {assignedExpert.specialization || 'Tax Consultant'} • {assignedExpert.experience || '5 Yrs Exp'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <Icon name="star" size={10} color="#f59e0b" />
                  <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#f59e0b' }}>
                    {assignedExpert.rating?.toFixed(1) || '5.0'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  minHeight: 48,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--bg-surface-variant)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10
                }}
                onClick={() => {
                  playHaptic();
                  trackEvent('expert_chat_clicked', { expert_id: assignedExpert.id });
                  onSupportClick();
                }}
                aria-label="Send message to expert"
              >
                <Icon name="mail" size={14} color="var(--text-primary)" />
                Chat
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CA Matchmaking Widget */
        <div style={{ marginTop: 2 }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, paddingHorizontal: 4 }}>
            Advisory Partner
          </h4>
          <div
            className="card"
            style={{
              padding: '12px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.08)' }}>
                <Icon name="phone" size={18} color="var(--primary)" />
              </div>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Consult CA Expert</h5>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', margin: '2px 0 0', fontWeight: 500 }}>
                  Get matching in 60s for direct consultation.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                minHeight: 48,
                padding: '0 14px',
                fontSize: '0.72rem',
                fontWeight: 800,
                borderRadius: 10
              }}
              onClick={() => {
                playHaptic();
                onSelectService('expert');
              }}
              aria-label="Book a Chartered Accountant slot"
            >
              Book CA
            </button>
          </div>
        </div>
      )}

      {/* Services shortcuts grid */}
      <div>
        <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, paddingHorizontal: 4 }}>
          Our Services
        </h4>
        <div className="responsive-grid-2" style={{ gap: 8 }}>
          {categories.map((cat) =>
            cat.items.map((item) => (
              <div
                key={item.id}
                className="card"
                onClick={() => {
                  playHaptic();
                  onSelectService(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  minHeight: 58
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open service detail for ${item.title}`}
              >
                <div>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{item.title}</h5>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: '1px 0 0', fontWeight: 500 }}>{item.desc}</p>
                </div>
                <Icon name="chevronRight" size={14} color="var(--text-tertiary)" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Chat Support link */}
      <button
        type="button"
        onClick={() => {
          playHaptic();
          onSupportClick();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 14px',
          marginTop: 4,
          marginBottom: 16,
          borderRadius: 16,
          border: '1px solid rgba(14, 165, 233, 0.16)',
          backgroundColor: 'rgba(14, 165, 233, 0.03)',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Stuck somewhere? <strong style={{ color: '#0ea5e9' }}>Chat Live Support</strong>
        </span>
        <Icon name="chevronRight" size={14} color="#0ea5e9" />
      </button>

      {/* Services Bottom Sheet search modal */}
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
