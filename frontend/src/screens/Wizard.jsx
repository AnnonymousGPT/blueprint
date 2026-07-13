import { useMemo, useState, useEffect } from 'react';
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
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Wizard({ initialServiceId, onFinishWizard }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRecalculating, setIsRecalculating] = useState(false);

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

  // Safe Capacitor Haptics
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  // Analytics logger
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  useEffect(() => {
    trackEvent('wizard_screen_viewed');
  }, []);

  const serviceOptions = useMemo(() => ([
    { id: 'itr', label: 'File ITR', desc: 'Income tax filing', icon: 'IT' },
    { id: 'gst', label: 'GST Filing', desc: 'Returns + compliance', icon: 'GS' },
    { id: 'business', label: 'Business Reg', desc: 'Pvt Ltd / LLP', icon: 'BR' },
    { id: 'loan', label: 'Loan Assistance', desc: 'Funding help', icon: 'LN' },
    { id: 'expert', label: 'Talk to Expert', desc: 'Quick consult', icon: 'EX' }
  ]), []);

  // Dynamic Detail questions based on selected serviceType
  const getDetailOptions = (serviceType) => {
    switch (serviceType) {
      case 'itr':
        return [
          'Salary / Form 16',
          'Bank Statements',
          'Capital Gains',
          'Crypto Declarations',
          'Foreign Asset Income'
        ];
      case 'gst':
        return [
          'New GST Registration',
          'Monthly Return filings',
          'Annual Return GSTR-9',
          'GST Notice audit support'
        ];
      case 'business':
        return [
          'Private Limited (Pvt Ltd)',
          'Limited Liability Partnership (LLP)',
          'Sole Proprietorship',
          'MSME Udyam Registration'
        ];
      case 'loan':
        return [
          'Business Expansion Loan',
          'Mudra Scheme Assistance',
          'Startup Grant filing',
          'Project DPR Projections'
        ];
      default:
        return [
          'Income tax audit',
          'Tax planning counsel',
          'GST notice defense',
          'Corporate legal advisory'
        ];
    }
  };

  const [answers, setAnswers] = useState({
    serviceType: initialServiceId || 'itr',
    entityType: initialServiceId === 'business' ? 'Business' : 'Individual',
    urgency: 'Urgent',
    details: initialServiceId === 'business'
      ? ['Private Limited (Pvt Ltd)']
      : ['Salary / Form 16', 'Bank Statements']
  });

  const detailOptions = useMemo(() => getDetailOptions(answers.serviceType), [answers.serviceType]);

  const serviceMeta = {
    itr: {
      individual: { title: 'Individual ITR Filing', eta: '24 Hours', price: 'From ₹999', reason: ['Individual filing', 'Salary & investment review'] },
      business: { title: 'Corporate ITR Filing', eta: '48 Hours', price: 'From ₹1,499', reason: ['Business tax return', 'GST cross-audited'] }
    },
    gst: {
      individual: { title: 'Individual GST Filing', eta: '2-3 Days', price: 'From ₹1,499', reason: ['Returns reconciliation', 'Lumpsum billing check'] },
      business: { title: 'Corporate GST Filing', eta: '2-3 Days', price: 'From ₹1,999', reason: ['Corporate compliance', 'Reconciliation audit ready'] }
    },
    business: {
      individual: { title: 'Business Registration', eta: '5-7 Days', price: 'From ₹4,999', reason: ['Proprietorship setup', 'Immediate PAN generation'] },
      business: { title: 'Corporate Incorporation', eta: '5-7 Days', price: 'From ₹7,499', reason: ['Pvt Ltd / LLP incorporation', 'Authorized capital validation'] }
    },
    loan: {
      individual: { title: 'Personal Loan Setup', eta: '24 Hours', price: 'From ₹499', reason: ['Credit score check', 'Bank documents compile'] },
      business: { title: 'Business Funding Counsel', eta: '48 Hours', price: 'From ₹1,999', reason: ['Startup grant coordination', 'Project DPR prepared'] }
    },
    expert: {
      individual: { title: 'Tax Consultation Slot', eta: 'Instant Slot', price: 'From ₹499', reason: ['Direct CA callback', 'Secure proxy connect'] },
      business: { title: 'Corporate CA Advice', eta: 'Instant Slot', price: 'From ₹999', reason: ['Senior corporate tax partner', 'Business advice call'] }
    }
  };

  const selectedService = serviceOptions.find((item) => item.id === answers.serviceType) || serviceOptions[0];
  const meta = serviceMeta[answers.serviceType]?.[answers.entityType.toLowerCase()] || serviceMeta.itr.individual;

  const toggleDetail = (detail) => {
    playHaptic();
    setAnswers((prev) => {
      const exists = prev.details.includes(detail);
      const updatedDetails = exists
        ? prev.details.filter((item) => item !== detail)
        : [...prev.details, detail];
      
      trackEvent('wizard_step_selected', { field: 'details', value: detail, checked: !exists });
      return {
        ...prev,
        details: updatedDetails
      };
    });
  };

  const setField = (key, value) => {
    playHaptic();
    setIsRecalculating(true);
    trackEvent('wizard_step_selected', { field: key, value });
    
    setAnswers((prev) => {
      // Clear details if serviceType switches to prevent mismatched details
      const details = key === 'serviceType' ? [] : prev.details;
      return { ...prev, [key]: value, details };
    });

    setTimeout(() => {
      setIsRecalculating(false);
    }, 450);
  };

  const summaryItems = [
    { label: 'Service', value: meta.title },
    { label: 'For', value: answers.entityType },
    { label: 'When', value: answers.urgency }
  ];

  const renderServiceIcon = (id, selected) => {
    const bgColor = selected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.03)';
    const iconColor = selected ? '#10b981' : '#64748b';

    switch (id) {
      case 'itr':
        return (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
            margin: '0 auto 10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        );
      case 'gst':
        return (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            fontSize: '0.75rem',
            fontWeight: 900,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            flexShrink: 0,
            margin: '0 auto 10px'
          }}>
            GST
          </div>
        );
      case 'business':
        return (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
            margin: '0 auto 10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        );
      case 'loan':
        return (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
            margin: '0 auto 10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M12 2L2 7h20L12 2z" />
              <line x1="6" y1="11" x2="6" y2="21" />
              <line x1="18" y1="11" x2="18" y2="21" />
            </svg>
          </div>
        );
      default:
        return (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
            margin: '0 auto 10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
        );
    }
  };

  const handleContinue = () => {
    if (isOffline) return;
    playHaptic();
    trackEvent('wizard_completed', { service: meta.title, urgency: answers.urgency });
    onFinishWizard(answers, meta.title);
  };

  return (
    <div className="screen-shell" style={{ gap: 12, paddingBottom: 'calc(240px + env(safe-area-inset-bottom))' }}>
      {/* Top bar control container */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            onFinishWizard(null);
          }}
          aria-label="Cancel consultation selection and go back"
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
          <Icon name="back" size={18} color="var(--text-primary)" />
        </button>

        <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
          <h2 className="title-accent" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Let’s match the right service
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Quick matchmaking advisory wizard.
          </p>
        </div>

        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: '#10b981',
          background: 'var(--bg-card)',
          border: '1.2px solid #10b981',
          borderRadius: 999,
          padding: '5px 12px',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          🪄 AI Match
        </span>
      </div>

      {/* Connection warning banner */}
      {isOffline && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }} role="alert">
          <Icon name="info" size={16} color="#ef4444" />
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
            Offline Mode — Connect to internet to confirm your request.
          </span>
        </div>
      )}

      {/* AI Pick Card container */}
      <div 
        className="card" 
        style={{ 
          padding: 16, 
          borderColor: 'var(--border-color)', 
          background: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-sm)', 
          borderRadius: 18,
          position: 'relative'
        }}
      >
        {isRecalculating && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(8, 15, 30, 0.65)',
            backdropFilter: 'blur(3px)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <span className="spinner-circle" style={{ width: 22, height: 22 }} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.62rem',
              fontWeight: 900,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderRadius: 8,
              padding: '4px 8px',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.4px'
            }}>
              ✦ AI PICK
            </div>
            <div style={{ fontSize: '1.28rem', fontWeight: 900, lineHeight: 1.15, color: 'var(--text-primary)' }}>
              {meta.title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '4px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                ✓ 95% Match
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                🕒 {meta.eta}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {meta.price}
              </span>
            </div>
          </div>

          <div style={{
            width: 72,
            minWidth: 72,
            height: 72,
            borderRadius: 16,
            background: 'rgba(16, 185, 129, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            flexShrink: 0
          }}>
            <span style={{ fontSize: '1.28rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{selectedService.icon}</span>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Match</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
          {meta.reason.map((reason) => (
            <span key={reason} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span> {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Services list */}
      <section aria-labelledby="header-step-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 id="header-step-1" style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>1. What service do you need?</h3>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
          {serviceOptions.map((service) => {
            const selected = answers.serviceType === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setField('serviceType', service.id)}
                className="card"
                style={{
                  minWidth: 122,
                  padding: '12px 10px',
                  borderRadius: 14,
                  border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0
                }}
                aria-label={`Select service type: ${service.label}`}
                aria-pressed={selected}
              >
                {renderServiceIcon(service.id, selected)}
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15 }}>{service.label}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{service.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Entity type selection */}
      <section aria-labelledby="header-step-2">
        <h3 id="header-step-2" style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>2. Who are you?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {[
            { 
              id: 'Individual', 
              title: 'Individual', 
              desc: 'Salaried, freelancer, professional',
              icon: (selected) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )
            },
            { 
              id: 'Business', 
              title: 'Business', 
              desc: 'Startup, company, partnership',
              icon: (selected) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="16" />
                  <line x1="15" y1="22" x2="15" y2="16" />
                  <line x1="9" y1="16" x2="15" y2="16" />
                  <path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
              )
            }
          ].map((item) => {
            const selected = answers.entityType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setField('entityType', item.id)}
                className="card"
                style={{
                  padding: '14px 12px',
                  borderRadius: 14,
                  border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minHeight: 88
                }}
                aria-label={`Select profile type: ${item.title}`}
                aria-pressed={selected}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: selected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.03)',
                      color: selected ? '#10b981' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10
                    }}>
                      {item.icon(selected)}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.3, fontWeight: 500 }}>{item.desc}</div>
                  </div>
                  {selected && (
                    <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.85rem', display: 'flex', marginTop: 2 }}>✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Urgency selection */}
      <section aria-labelledby="header-step-3">
        <h3 id="header-step-3" style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>3. When do you need it?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {[
            { 
              id: 'Urgent', 
              title: 'Urgent', 
              desc: 'Within 48 hours', 
              icon: (selected) => (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )
            },
            { 
              id: 'This Week', 
              title: 'This Week', 
              desc: 'Normal pace', 
              icon: (selected) => (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )
            },
            { 
              id: 'No Rush', 
              title: 'No Rush', 
              desc: 'Flexible', 
              icon: (selected) => (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )
            }
          ].map((item) => {
            const selected = answers.urgency === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setField('urgency', item.id)}
                className="card"
                style={{
                  padding: '12px 10px',
                  borderRadius: 14,
                  border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minHeight: 88
                }}
                aria-label={`Select urgency speed: ${item.title}`}
                aria-pressed={selected}
              >
                <div style={{
                  color: selected ? '#10b981' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  {item.icon(selected)}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ 
                  fontSize: '0.62rem', 
                  color: (selected && item.id === 'Urgent') ? '#10b981' : 'var(--text-secondary)', 
                  marginTop: 4, 
                  lineHeight: 1.3,
                  fontWeight: 500
                }}>{item.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 4: Additional checkboxes */}
      {detailOptions.length > 0 && (
        <section aria-labelledby="header-step-4">
          <h3 id="header-step-4" style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            4. Additional details <span style={{ color: '#10b981', fontWeight: 500 }}>(optional)</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {detailOptions.map((detail) => {
              const selected = answers.details.includes(detail);
              return (
                <button
                  key={detail}
                  type="button"
                  onClick={() => toggleDetail(detail)}
                  className="card"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 40
                  }}
                  role="checkbox"
                  aria-checked={selected}
                  aria-label={`Include: ${detail}`}
                >
                  {selected && <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>}
                  {detail}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Summary selections wrapper */}
      <div className="card" style={{ padding: 14, background: 'var(--bg-surface-variant)', borderColor: 'var(--border-color)', borderRadius: 14 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
          YOUR SELECTION
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {summaryItems.map((item) => (
            <span key={item.label} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: 999 }}>
              {item.value}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Continue bar */}
      <button
        type="button"
        onClick={handleContinue}
        className="btn btn-primary"
        style={{
          width: 'calc(100% - 32px)',
          minHeight: 52,
          borderRadius: 12,
          fontSize: '0.9rem',
          fontWeight: 800,
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 'calc(12px + env(safe-area-inset-bottom))',
          zIndex: 20,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOffline ? 'var(--text-tertiary)' : 'var(--primary)',
          color: '#ffffff',
          border: 'none',
          cursor: isOffline ? 'not-allowed' : 'pointer'
        }}
        disabled={isOffline}
        aria-label="Confirm selection and continue to booking slot page"
      >
        {isOffline ? 'Offline — Reconnect to Continue' : 'Continue to Choose Expert & Time'}
        {!isOffline && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 20 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </div>
  );
}
