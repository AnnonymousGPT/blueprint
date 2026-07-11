import { useMemo, useRef, useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { TrustStrip } from '../components/UxBlocks';

export default function Booking({ recommendedService, bookingSummary, onBackToWizard, onCompleteBooking, addNotification }) {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [experts, setExperts] = useState([]);
  
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const exps = await api.getExperts();
        setExperts(exps);
        if (exps.length > 0) setSelectedExpert(exps[0]);
      } catch (err) {
        console.error('Failed to fetch experts', err);
      }
    };
    fetchExperts();
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [consultationType, setConsultationType] = useState('Video Call');
  const expertListRef = useRef(null);

  const serviceName = recommendedService || 'Expert Advisory Session';
  const summaryDetails = bookingSummary?.details?.length ? bookingSummary.details.join(', ') : 'Salary, Bank Statement';
  const summaryFor = bookingSummary?.entityType || 'Individual';
  const summaryWhen = bookingSummary?.urgency || 'Urgent';
  const totalAmount = (selectedExpert?.fees || 0) + 99 + Math.round(((selectedExpert?.fees || 0) + 99) * 0.18);

  const expertMeta = {
    'exp-1': '1.4k filings',
    'exp-2': '850 cases',
    'exp-3': '2.1k cases'
  };

  const handleBook = () => {
    if (!selectedExpert) return;
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <button
          type="button"
          onClick={onBackToWizard}
          aria-label="Go back"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
          Book Expert
        </h2>

        <button
          type="button"
          aria-label="Need help"
          onClick={() => addNotification?.('Support help is on the way.', 'info')}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
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

      <div className="card" style={{ 
        padding: '12px 4px', 
        borderColor: 'var(--border-color)', 
        background: '#ffffff',
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
            {serviceName.includes('ITR') ? 'ITR Filing' : 'GST Filing'}
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
            {summaryWhen === 'Urgent' ? '24 Hours' : summaryWhen}
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
            {serviceName.includes('ITR') ? 'From ₹999' : 'From ₹1,499'}
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

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>1. Choose Expert</h3>
          <button
            type="button"
            aria-label="View all experts"
            onClick={() => expertListRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
            style={{ border: 'none', background: 'transparent', color: '#10b981', fontSize: '0.78rem', fontWeight: 800, padding: 0, cursor: 'pointer' }}
          >
            View all
          </button>
        </div>

        <div ref={expertListRef} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
          {experts.map((exp, index) => {
            const isSelected = selectedExpert?.id === exp.id;
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelectedExpert(exp)}
                className="card"
                style={{
                  minWidth: 154,
                  padding: 12,
                  borderRadius: 14,
                  border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: '#ffffff',
                  textAlign: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative'
                }}
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
                  <img src={exp.photo} alt={exp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {exp.name}
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
      </section>

      <section>
        <h3 style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>2. Select Date & Time</h3>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Date</label>
            <input
              type="date"
              className="card"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
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
                WebkitAppearance: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Time</label>
            <input
              type="time"
              className="card"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
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
                WebkitAppearance: 'none'
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>3. Choose Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {[
            {
              type: 'Phone Call',
              icon: (selected) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              )
            },
            {
              type: 'Video',
              icon: (selected) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              )
            },
            {
              type: 'Chat',
              icon: (selected) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )
            }
          ].map((ch) => {
            const isVideo = ch.type === 'Video';
            // map state to match consultationType ('Video Call' vs 'Video')
            const selected = (ch.type === 'Phone Call' && consultationType === 'Phone Call') || 
                             (ch.type === 'Video' && consultationType === 'Video Call') ||
                             (ch.type === 'Chat' && consultationType === 'Chat');
            
            return (
              <button
                key={ch.type}
                type="button"
                onClick={() => setConsultationType(isVideo ? 'Video Call' : ch.type)}
                className="card"
                style={{
                  minHeight: 84,
                  padding: '10px 8px',
                  borderRadius: 14,
                  border: selected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  background: selected ? 'rgba(16, 185, 129, 0.05)' : '#ffffff',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: selected ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  {ch.icon(selected)}
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>{ch.type}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: '10px 16px',
        borderRadius: 12,
        width: '100%',
        border: '1px solid var(--border-color)',
        marginTop: 10
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure Booking
        </div>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Money Back
        </div>
      </div>

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
            background: '#ffffff',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Total Payable</div>
            <div style={{ fontSize: '1.22rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 3 }}>₹{totalAmount}</div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: 2 }}>Taxes included</div>
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
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            Continue
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
