import { useState, useEffect } from 'react';

export default function Home({
  userProfile,
  stats,
  recentRequests,
  onSelectService,
  onSelectRequest,
  onViewAllRequests,
  onSupportClick,
  onOpenProfile
}) {
  const isGuest = userProfile?.isGuest || userProfile?.name === 'Guest';
  const [activeDot, setActiveDot] = useState(0);
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');

  // Dynamic slides for the premium Hero Carousel
  const carouselSlides = [
    {
      title: "Simple Tax Filing",
      desc: "File ITR, GST, and compliance with CAs.",
      tag: "Tax & Compliance",
      bgGradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      textColor: "#ffffff",
      descColor: "#ccfbf1",
      tagColor: "#5eead4",
      tagBg: "rgba(20, 184, 166, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#0d9488",
      illustration: (
        <svg width="78" height="78" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))' }}>
          <circle cx="60" cy="60" r="45" fill="rgba(255,255,255,0.08)" />
          <rect x="38" y="28" width="44" height="64" rx="6" fill="#ffffff" />
          <path d="M48 40h24v4H48zm0 12h24v4H48zm0 12h16v4H48z" fill="#cbd5e1" />
          <rect x="62" y="66" width="30" height="30" rx="15" fill="#f8fafc" stroke="#0d9488" strokeWidth="2.2" />
          <path d="M71 81l4 4 8-8" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: "Launch Your Startup",
      desc: "Pvt Ltd, LLP, and local setups.",
      tag: "Business Growth",
      bgGradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      textColor: "#ffffff",
      descColor: "#e0f2fe",
      tagColor: "#7dd3fc",
      tagBg: "rgba(14, 165, 233, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#0ea5e9",
      illustration: (
        <svg width="78" height="78" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))' }}>
          <circle cx="60" cy="60" r="45" fill="rgba(255,255,255,0.08)" />
          <path d="M60 25c12 12 12 32 12 46h-24c0-14 0-34 12-46z" fill="#ffffff" />
          <path d="M48 71c0-8-6-10-8-12l4 12h4zM72 71c0-8 6-10 8-12l-4 12h-4z" fill="#7dd3fc" />
          <path d="M60 67c0 8-4 20-4 20s4-4 4-12 4 12 4 12-4-12-4-20z" fill="#ef4444" />
        </svg>
      )
    },
    {
      title: "Govt Subsidies & Loans",
      desc: "Mudra loans, grants, and subsidies.",
      tag: "Funding & Schemes",
      bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      textColor: "#ffffff",
      descColor: "#ffedd5",
      tagColor: "#fdba74",
      tagBg: "rgba(249, 115, 22, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#ea580c",
      illustration: (
        <svg width="78" height="78" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))' }}>
          <circle cx="60" cy="60" r="45" fill="rgba(255,255,255,0.08)" />
          <path d="M35 85h50v6H35zm5-40h5v35h-5zm12 0h5v35h-5zm12 0h5v35h-5zm12 0h5v35h-5zM32 40l28-15 28 15v5H32z" fill="#ffffff" />
          <circle cx="60" cy="62" r="8" fill="#fdba74" />
        </svg>
      )
    },
    {
      title: "Track Your Files Live",
      desc: "Check application progress live.",
      tag: "Real-time Status",
      bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      textColor: "#ffffff",
      descColor: "#f3e8ff",
      tagColor: "#d8b4fe",
      tagBg: "rgba(139, 92, 246, 0.18)",
      btnColor: "#ffffff",
      btnTextColor: "#6d28d9",
      illustration: (
        <svg width="78" height="78" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))' }}>
          <circle cx="60" cy="60" r="45" fill="rgba(255,255,255,0.08)" />
          <rect x="36" y="32" width="48" height="56" rx="6" fill="#ffffff" />
          <circle cx="50" cy="46" r="4" fill="#8b5cf6" />
          <circle cx="50" cy="60" r="4" fill="#8b5cf6" />
          <circle cx="50" cy="74" r="4" fill="#cbd5e1" />
          <line x1="50" y1="50" x2="50" y2="56" stroke="#8b5cf6" strokeWidth="2.2" />
          <line x1="50" y1="64" x2="50" y2="70" stroke="#cbd5e1" strokeWidth="2.2" />
          <rect x="58" y="44" width="20" height="4.5" rx="2" fill="#8b5cf6" />
          <rect x="58" y="58" width="16" height="4.5" rx="2" fill="#8b5cf6" />
          <rect x="58" y="72" width="12" height="4.5" rx="2" fill="#cbd5e1" />
        </svg>
      )
    }
  ];

  // Carousel slide auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  // Typing search placeholder animation state
  const searchPlaceholders = [
    'Search "File ITR"...',
    'Search "Pvt Ltd setup"...',
    'Search "GST Filing"...',
    'Search "Govt Schemes"...'
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(searchPlaceholders[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  useEffect(() => {
    setCurrentPlaceholder(searchPlaceholders[placeholderIdx]);
  }, [placeholderIdx, searchPlaceholders]);

  // Badge mapping helper function for Option 2 Service cards
  const getServiceBadge = (serviceId) => {
    switch (serviceId) {
      case 'schemes':
        return (
          <span style={{
            position: 'absolute',
            top: -6,
            left: 10,
            fontSize: '0.45rem',
            fontWeight: 800,
            backgroundColor: '#ffe4e6',
            color: '#db2777',
            padding: '1.5px 5.5px',
            borderRadius: 5,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            ⚡ SUBSIDY READY
          </span>
        );
      default:
        return null;
    }
  };

  const categories = [
    {
      title: 'Tax & Compliance',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6', marginRight: 6, flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      items: [
        {
          id: 'itr',
          title: 'File ITR',
          desc: 'Income tax filing',
          icon: (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#e6fcf5',
              border: '1.5px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '0.6rem',
              fontWeight: 850,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              flexShrink: 0
            }}>
              NEW
            </div>
          ),
          btnColor: '#3b82f6'
        },
        {
          id: 'gst',
          title: 'GST & Tax',
          desc: 'Reg & filing support',
          icon: (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="#d1fae5"/>
              <path d="M12 10C12 8.89543 12.8954 8 14 8H22L28 14V30C28 31.1046 27.1046 32 26 32H14C12.8954 32 12 31.1046 12 30V10Z" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5"/>
              <path d="M22 8V14H28" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="14" y="24" fill="#047857" fontSize="7.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">GST</text>
              <rect x="21.5" y="21.5" width="7" height="8" rx="1.5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2"/>
              <line x1="23.5" y1="23.5" x2="26.5" y2="23.5" stroke="#10b981" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="23.5" cy="26.5" r="0.6" fill="#10b981"/>
              <circle cx="26.5" cy="26.5" r="0.6" fill="#10b981"/>
              <circle cx="23.5" cy="28" r="0.6" fill="#10b981"/>
              <circle cx="26.5" cy="28" r="0.6" fill="#10b981"/>
            </svg>
          ),
          btnColor: '#10b981'
        }
      ]
    },
    {
      title: 'Business Growth',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f97316', marginRight: 6, flexShrink: 0 }}>
          <path d="M22 2s-1 2-1 4-3 0-4-3-3-4-3-4 1 2 2 4 4 1 6-1z" />
          <path d="M14 10l-4 4" />
          <path d="M10 14l-2 4-2-2 4-2" />
          <path d="M14 10l4-2 2 2-2 4" />
        </svg>
      ),
      items: [
        {
          id: 'business',
          title: 'Start Business',
          desc: 'Pvt Ltd, LLP, Startup',
          icon: (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="#ffedd5"/>
              <rect x="12" y="18" width="16" height="13" rx="3" fill="#f97316" fillOpacity="0.15" stroke="#f97316" strokeWidth="1.5"/>
              <path d="M10 18L13 12H27L30 18" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="17" y="23" width="6" height="8" stroke="#f97316" strokeWidth="1.2" fill="#ffedd5"/>
              <circle cx="25" cy="23.5" r="1" fill="#f97316"/>
            </svg>
          ),
          btnColor: '#f97316'
        },
        {
          id: 'dpr',
          title: 'Business Plan / DPR',
          desc: 'Investor projections',
          icon: (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="#f3e8ff"/>
              <rect x="11" y="11" width="18" height="18" rx="4" fill="#8b5cf6" fillOpacity="0.15" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="15" y1="24" x2="15" y2="18" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="20" y1="24" x2="20" y2="15" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="25" y1="24" x2="25" y2="21" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M14 17L19 13.5L25 17" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          btnColor: '#8b5cf6'
        }
      ]
    },
    {
      title: 'Funding & Govt. Schemes',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#db2777', marginRight: 6, flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M12 2L2 7h20L12 2z" />
          <line x1="6" y1="11" x2="6" y2="21" />
          <line x1="18" y1="11" x2="18" y2="21" />
        </svg>
      ),
      items: [
        {
          id: 'loan',
          title: 'Loan Assistance',
          desc: 'Bank & startup loans',
          icon: (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="#ccfbf1"/>
              <rect x="11" y="15" width="18" height="13" rx="3" fill="#0d9488" fillOpacity="0.15" stroke="#0d9488" strokeWidth="1.5"/>
              <path d="M14 15V12C14 11.4477 14.4477 11 15 11H25C25.5523 11 26 11.4477 26 12V15" stroke="#0d9488" strokeWidth="1.5"/>
              <circle cx="24" cy="21.5" r="1.5" fill="#0d9488"/>
            </svg>
          ),
          btnColor: '#10b981'
        },
        {
          id: 'schemes',
          title: 'Govt Schemes',
          desc: 'Subsidy & grants help',
          icon: (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="#ffe4e6"/>
              <path d="M12 17L20 11L28 17H12Z" fill="#db2777" fillOpacity="0.15" stroke="#db2777" strokeWidth="1.5" strokeLinejoin="round"/>
              <line x1="15" y1="18" x2="15" y2="27" stroke="#db2777" strokeWidth="1.5"/>
              <line x1="20" y1="18" x2="20" y2="27" stroke="#db2777" strokeWidth="1.5"/>
              <line x1="25" y1="18" x2="25" y2="27" stroke="#db2777" strokeWidth="1.5"/>
              <rect x="11" y="27" width="18" height="3" rx="1" fill="#db2777"/>
            </svg>
          ),
          btnColor: '#db2777'
        }
      ]
    }
  ];

  const serviceCatalog = categories.flatMap((category) =>
    category.items.map((service) => ({
      ...service,
      categoryTitle: category.title
    }))
  );

  const filteredServices = serviceCatalog.filter((service) => {
    const query = serviceQuery.trim().toLowerCase();
    const matchesCategory = serviceCategoryFilter === 'All' || service.categoryTitle === serviceCategoryFilter;
    const matchesQuery = !query || [
      service.title,
      service.desc,
      service.categoryTitle
    ].join(' ').toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const openServiceSearch = (categoryTitle = 'All') => {
    setServiceCategoryFilter(categoryTitle);
    setServiceQuery('');
    setShowServiceSearch(true);
  };

  const handleSelectCatalogService = (serviceId) => {
    setShowServiceSearch(false);
    onSelectService(serviceId);
  };


  return (
    <div className="screen-shell animate-fade-in-up" style={{ paddingInline: '4px', gap: 16 }}>
      {/* Header Container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 4, paddingHorizontal: 4 }}>
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
            How can we help you today?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search services pill */}
          <button
            type="button"
            onClick={() => openServiceSearch()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-color)',
              borderRadius: 99,
              padding: '6px 12px',
              width: 190,
              height: 40,
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            aria-label="Search services"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{currentPlaceholder}</span>
          </button>

          {/* Notification bell */}
          <button style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: 5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)'
          }} onClick={() => onSupportClick()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 6,
              height: 6,
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              border: '1.5px solid var(--bg-phone)'
            }}/>
          </button>

          {/* User profile avatar */}
          <button
            type="button"
            onClick={() => onOpenProfile?.()}
            aria-label="Open profile"
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
              alt={userProfile.name}
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

      {/* Illustrated Hero Banner */}
      <div 
        className="screen-hero animate-scale-in" 
        style={{ 
          padding: '10px 16px', 
          background: carouselSlides[activeDot].bgGradient,
          borderRadius: 20,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          minHeight: 106,
          transition: 'background 0.5s ease-in-out',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Banner Details (Left) */}
        <div style={{ flex: 1, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ 
            fontSize: '0.55rem', 
            fontWeight: 800, 
            background: carouselSlides[activeDot].tagBg, 
            color: carouselSlides[activeDot].tagColor, 
            padding: '3px 8px', 
            borderRadius: 99, 
            textTransform: 'uppercase', 
            letterSpacing: '0.6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {carouselSlides[activeDot].tag}
          </span>
          <h3 className="title-accent" style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 4, color: carouselSlides[activeDot].textColor, lineHeight: 1.15, marginBottom: 2 }}>
            {carouselSlides[activeDot].title}
          </h3>
          <p style={{ fontSize: '0.68rem', color: carouselSlides[activeDot].descColor, margin: '0 0 6px 0', lineHeight: 1.2, fontWeight: 500, maxWidth: '90%' }}>
            {carouselSlides[activeDot].desc}
          </p>
          <button
            type="button"
            onClick={() => openServiceSearch()}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: carouselSlides[activeDot].btnColor, 
              color: carouselSlides[activeDot].btnTextColor, 
              fontWeight: 800, 
              borderRadius: 99,
              padding: '4px 10px',
              fontSize: '0.66rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Explore all <span style={{ fontSize: '0.72rem', fontWeight: 900, marginLeft: 2 }}>&rsaquo;</span>
          </button>
        </div>

        {/* Dynamic Illustration SVG (Right) */}
        <div style={{ flexShrink: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {carouselSlides[activeDot].illustration}
        </div>
      </div>

      {/* Carousel dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: -8, marginBottom: 2 }}>
        {[0, 1, 2, 3].map((dot) => (
          <span
            key={dot}
            onClick={() => setActiveDot(dot)}
            style={{
              width: dot === activeDot ? 12 : 5,
              height: 5,
              borderRadius: 99,
              backgroundColor: dot === activeDot ? '#0ea5e9' : 'var(--border-color)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      {/* Live Case Card (Conditional) */}
      {!isGuest && recentRequests.length > 0 && (
        <div
          className="card animate-scale-in"
          onClick={() => onSelectRequest(recentRequests[0].id)}
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderColor: 'rgba(14, 165, 233, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 14,
            cursor: 'pointer',
            borderRadius: 18,
            marginTop: 4
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live case
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ID: {recentRequests[0].id}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{recentRequests[0].serviceName}</h5>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
                Stage: <strong style={{ color: 'var(--secondary)' }}>{recentRequests[0].status}</strong>
              </span>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {recentRequests[0].progress}%
            </span>
          </div>

          <div style={{ height: 6, backgroundColor: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${recentRequests[0].progress}%`, height: '100%', backgroundColor: 'var(--secondary)', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {/* Summary stats for signed in user */}
      {!isGuest && (
        <div style={{ marginTop: 2 }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, paddingHorizontal: 4 }}>
            Summary
          </h4>
          <div className="responsive-grid-3" style={{ gap: 8 }}>
            {/* Active Requests */}
            <div className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>Active Requests</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>{stats.activeRequests}</span>
              </div>
            </div>

            {/* Documents */}
            <div className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>Documents</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>{stats.documentsUploaded}</span>
              </div>
            </div>

            {/* Consultations */}
            <div className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>Consultations</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>{stats.consultations}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Categories grids */}
      <div id="home-service-catalog">
      {categories.map((cat, catIdx) => (
        <div key={catIdx} style={{ marginTop: 6 }}>
          {/* Category Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 }}>
            <h4 style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-accent)'
            }}>
              {cat.icon}
              {cat.title}
            </h4>
            <button
              type="button"
              onClick={() => openServiceSearch(cat.title)}
              style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0ea5e9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', padding: 0 }}
              aria-label={`View all ${cat.title} services`}
            >
              View all <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>&rsaquo;</span>
            </button>
          </div>

          {/* Grid list of cards */}
          <div className="responsive-grid-2" style={{ gap: 8 }}>
            {cat.items.map((srv) => (
              <div
                key={srv.id}
                className="card"
                onClick={() => onSelectService(srv.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                  gap: 6,
                  minHeight: 62,
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
              >
                {getServiceBadge(srv.id)}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {/* Styled large SVG icon */}
                  <div style={{ transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="service-icon-wrapper">
                    {srv.icon}
                  </div>
                  
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>{srv.title}</h5>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: 1.25, fontWeight: 500 }}>{srv.desc}</p>
                  </div>
                </div>

                {/* Circular Action Button */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-variant)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      {/* Talk to Expert Card */}
      <div style={{ marginTop: 4 }}>
        <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, paddingHorizontal: 4 }}>
          Expert
        </h4>
        <div
          className="card animate-scale-in"
          onClick={() => onSelectService('expert')}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 16,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            gap: 10,
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
            {/* Custom headset icon inside circle */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: 'rgba(13, 148, 136, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(13, 148, 136, 0.1)',
                flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </div>
            
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Talk to expert</h5>
                <span className="animate-pulse-slow" style={{ 
                  fontSize: '0.52rem', 
                  fontWeight: 800, 
                  padding: '1.5px 5.5px', 
                  borderRadius: 999, 
                  backgroundColor: 'var(--primary)', 
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.2)'
                }}>
                  ⚡ Fastest help
                </span>
              </div>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', margin: '2px 0 2px 0', fontWeight: 500 }}>Chat or call with experts</p>
              
              {/* Overlapping avatars stack */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                {[
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80'
                ].map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="Expert"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '1px solid #ffffff',
                      objectFit: 'cover',
                      marginLeft: idx > 0 ? -5 : 0,
                      zIndex: 5 - idx
                    }}
                  />
                ))}
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  border: '1px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.4rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginLeft: -5,
                  zIndex: 1
                }}>
                  +2
                </div>
              </div>
            </div>
          </div>
          
          {/* Book Consultation Button */}
          <button
            type="button"
            onClick={() => onSelectService('expert')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.7rem',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(13,148,136,0.15)'
            }}
          >
            Book Consultation <span style={{ fontSize: '0.72rem', fontWeight: 900 }}>&rsaquo;</span>
          </button>
        </div>
      </div>

      {/* Recent requests list (Signed-in only) */}
      {!isGuest && recentRequests.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Recent
            </h4>
            <button
              type="button"
              onClick={() => onViewAllRequests?.()}
              style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
              aria-label="View all recent requests"
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentRequests.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="card"
                onClick={() => onSelectRequest(req.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderRadius: 16
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{req.serviceName}</h5>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>
                    ID: {req.id} • {req.date}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 8,
                      fontSize: '0.63rem',
                      fontWeight: 700,
                      backgroundColor: (req.status === 'Completed' || req.status === 'Review Stage') ? '#e6fcf5' : 'var(--primary-container)',
                      color: (req.status === 'Completed' || req.status === 'Review Stage') ? '#10b981' : 'var(--primary)'
                    }}
                  >
                    {req.status}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-tertiary)' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Box */}
      <button
        type="button"
        onClick={onSupportClick}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 14px', 
          marginTop: 10, 
          marginBottom: 16,
          borderRadius: 16,
          border: '1px solid rgba(14, 165, 233, 0.16)',
          backgroundColor: 'rgba(14, 165, 233, 0.03)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {/* Lightbulb icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/>
          <line x1="9" y1="18" x2="15" y2="18"/>
          <line x1="10" y1="22" x2="14" y2="22"/>
        </svg>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Stuck somewhere? <strong style={{ color: '#0ea5e9' }}>Chat Live Support</strong>
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0ea5e9', marginLeft: 2 }}>&rsaquo;</span>
      </button>

      {showServiceSearch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 33, 70, 0.42)',
            backdropFilter: 'blur(8px)',
            zIndex: 80,
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
              maxHeight: '88vh',
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
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Search services</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Pick a service and continue the flow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceSearch(false)}
                aria-label="Close service search"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-variant)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="search"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Search by service, category, or keyword"
              className="form-control"
              style={{ width: '100%', borderRadius: 14, padding: '12px 14px' }}
            />

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {['All', ...categories.map((category) => category.title)].map((categoryTitle) => {
                const isSelected = serviceCategoryFilter === categoryTitle;
                return (
                  <button
                    key={categoryTitle}
                    type="button"
                    onClick={() => setServiceCategoryFilter(categoryTitle)}
                    style={{
                      flexShrink: 0,
                      padding: '9px 12px',
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
                    {categoryTitle}
                  </button>
                );
              })}
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectCatalogService(service.id)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      {service.icon}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>{service.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>{service.desc}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {service.categoryTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Continue
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  No services match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
