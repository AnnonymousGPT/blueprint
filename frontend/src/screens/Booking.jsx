import { useMemo, useRef, useState, useEffect } from 'react';
import { api } from '../services/apiService';
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
          <path d="M15 18l-6-6 6-6" />
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
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v5c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-3Z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'video':
      return (
        <svg {...common}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'document':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Booking({ recommendedService, bookingSummary, onBackToWizard, onCompleteBooking, addNotification }) {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [consultationType, setConsultationType] = useState('Video Call');
  
  const expertListRef = useRef(null);

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

  // Safe Capacitor Haptic trigger
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
    trackEvent('booking_screen_viewed');

    const fetchExperts = async () => {
      try {
        const exps = await api.getExperts();
        setExperts(exps);
        if (exps.length > 0) {
          setSelectedExpert(exps[0]);
        }
      } catch (err) {
        console.error('Failed to fetch experts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isOffline) {
      fetchExperts();
    } else {
      setLoading(false);
    }
  }, [isOffline]);

  const serviceName = recommendedService || 'Expert Advisory Session';
  const summaryFor = bookingSummary?.entityType || 'Individual';
  const summaryWhen = bookingSummary?.urgency || 'Urgent';
  const totalAmount = (selectedExpert?.fees || 0) + 99 + Math.round(((selectedExpert?.fees || 0) + 99) * 0.18);

  const handleSelectExpert = (exp) => {
    playHaptic();
    setSelectedExpert(exp);
    trackEvent('expert_selected', { expert_id: exp.id, name: exp.name });
  };

  const handleSelectMode = (type) => {
    playHaptic();
    setConsultationType(type);
    trackEvent('booking_mode_selected', { mode: type });
  };

  const handleBook = () => {
    if (isOffline) {
      addNotification?.('No Internet Connection. Reconnect to book.', 'error');
      return;
    }
    if (!selectedExpert) {
      addNotification?.('Please choose an expert to continue.', 'warning');
      return;
    }

    playHaptic();
    trackEvent('booking_initiated', {
      expert_id: selectedExpert.id,
      amount: totalAmount,
      channel: consultationType
    });

    onCompleteBooking({
      expert: selectedExpert,
      date: selectedDate,
      time: selectedTime,
      channel: consultationType,
      amount: totalAmount,
      status: 'PAYMENT_PENDING',
      serviceName
    });
  };

  return (
    <div className="screen-shell" style={{ gap: 10, paddingTop: 16, paddingBottom: 'calc(200px + env(safe-area-inset-bottom))' }}>
      {/* Header bar controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            playHaptic();
            onBackToWizard();
          }}
          aria-label="Go back to wizard questionnaire"
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
          Book Expert
        </h2>

        <button
          type="button"
          aria-label="Open support live help chat"
          onClick={() => {
            playHaptic();
            addNotification?.('Connecting Live Advisory Support...', 'success');
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          ?
        </button>
      </div>

      {/* Connection status warning */}
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
            Offline Mode — Check network connection to complete booking.
          </span>
        </div>
      )}

      {/* Selected service metadata overview */}
      <div className="card" style={{ 
        padding: '12px 4px', 
        borderColor: 'var(--border-color)', 
        background: 'var(--bg-card)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon name="document" size={15} color="#10b981" />
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
            {serviceName.includes('ITR') ? 'ITR Filing' : serviceName.includes('GST') ? 'GST Filing' : 'Corporate Reg'}
          </span>
        </div>

        <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
            {summaryWhen === 'Urgent' ? '48 Hours' : summaryWhen}
          </span>
        </div>

        <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.84rem',
            fontWeight: 800
          }}>
            ₹
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
            {selectedExpert ? `₹${selectedExpert.fees}` : 'From ₹999'}
          </span>
        </div>

        <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
            {summaryFor}
          </span>
        </div>
      </div>

      {/* Step 1: CA Experts selection slider */}
      <section aria-labelledby="header-step-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 id="header-step-1" style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>1. Choose Advisor</h3>
        </div>

        {loading ? (
          /* Shimmer skeleton sliders */
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            <div className="skeleton-container animate-pulse-slow" style={{ width: 154, height: 160, borderRadius: 14, flexShrink: 0 }} />
            <div className="skeleton-container animate-pulse-slow" style={{ width: 154, height: 160, borderRadius: 14, flexShrink: 0 }} />
            <div className="skeleton-container animate-pulse-slow" style={{ width: 154, height: 160, borderRadius: 14, flexShrink: 0 }} />
          </div>
        ) : experts.length > 0 ? (
          <div ref={expertListRef} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {experts.map((exp, index) => {
              const isSelected = selectedExpert?.id === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => handleSelectExpert(exp)}
                  className="card"
                  style={{
                    minWidth: 154,
                    padding: 12,
                    borderRadius: 14,
                    border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                  aria-label={`Select CA Expert ${exp.name}`}
                  aria-pressed={isSelected}
                >
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 5
                    }}>
                      ★
                    </div>
                  )}

                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '8px auto 10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-variant)'
                  }}>
                    <img src={exp.user?.photo || exp.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'} alt={exp.name || exp.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {exp.user?.name || exp.name}
                    </h4>
                    {isSelected && (
                      <span style={{ 
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.54rem',
                        fontWeight: 900
                      }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                    {exp.specialization}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#eab308', marginTop: 6, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    ★ <span style={{ color: 'var(--text-primary)', fontSize: '0.74rem', fontWeight: 800 }}>{exp.rating}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty Case state */
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No CA Experts available for this service category currently. Please try again later.
          </div>
        )}
      </section>

      {/* Step 2: Calendar slots selection */}
      <section aria-labelledby="header-step-2">
        <h3 id="header-step-2" style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>2. Select Date & Time</h3>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }} id="label-date-select">Date</label>
            <input
              type="date"
              className="card"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              aria-labelledby="label-date-select"
              aria-required="true"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                fontWeight: 600,
                outline: 'none',
                WebkitAppearance: 'none',
                boxSizing: 'border-box',
                minHeight: 48
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }} id="label-time-select">Time</label>
            <input
              type="time"
              className="card"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              aria-labelledby="label-time-select"
              aria-required="true"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                fontWeight: 600,
                outline: 'none',
                WebkitAppearance: 'none',
                boxSizing: 'border-box',
                minHeight: 48
              }}
            />
          </div>
        </div>
      </section>

      {/* Step 3: Consultation channel mode selection */}
      <section aria-labelledby="header-step-3">
        <h3 id="header-step-3" style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>3. Choose Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {[
            {
              type: 'Phone Call',
              iconName: 'phone'
            },
            {
              type: 'Video Call',
              iconName: 'video'
            },
            {
              type: 'Chat Support',
              iconName: 'chat'
            }
          ].map((ch) => {
            const selected = consultationType === ch.type;
            
            return (
              <button
                key={ch.type}
                type="button"
                onClick={() => handleSelectMode(ch.type)}
                className="card"
                style={{
                  minHeight: 84,
                  padding: '12px 8px',
                  borderRadius: 14,
                  border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: selected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                aria-label={`Select consultation mode: ${ch.type}`}
                aria-pressed={selected}
              >
                <div style={{ color: selected ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Icon name={ch.iconName} size={18} color={selected ? '#10b981' : '#64748b'} />
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>{ch.type}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trust banners */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface-variant)',
        padding: '10px 16px',
        borderRadius: 12,
        width: '100%',
        border: '1px solid var(--border-color)',
        boxSizing: 'border-box',
        marginTop: 10
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          <Icon name="shield" size={16} color="#10b981" />
          Secure Booking
        </div>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          <Icon name="refresh" size={16} color="#10b981" />
          Refund Protection
        </div>
      </div>

      {/* Bottom checkout summary bar */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 'calc(10px + env(safe-area-inset-bottom))',
          zIndex: 20
        }}
      >
        <div
          className="card"
          style={{
            padding: 12,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 10,
            alignItems: 'center',
            borderRadius: 20,
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Total Payable</div>
            <div style={{ fontSize: '1.22rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 3 }}>₹{selectedExpert ? totalAmount : '---'}</div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 2 }}>Taxes & platform fee included</div>
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="btn btn-primary"
            style={{
              minWidth: 154,
              minHeight: 52,
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 800,
              backgroundColor: isOffline ? 'var(--text-tertiary)' : 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isOffline ? 'not-allowed' : 'pointer'
            }}
            disabled={isOffline || !selectedExpert}
            aria-label="Confirm advisor booking slot and continue to payment page"
          >
            {isOffline ? 'Offline' : 'Continue'}
            {!isOffline && <Icon name="arrow" size={18} color="#ffffff" />}
          </button>
        </div>
      </div>
    </div>
  );
}
