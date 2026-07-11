import { useState, useEffect } from 'react';
import { api } from '../services/apiService';

export default function Calendar({ token, user, onNavigate, showNotification }) {


  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.getBookings(token);
        setBookings(res.data || []);
      } catch (err) {
        showNotification('Failed to load schedule', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token, showNotification]);

  const selectedBookings = bookings.filter(b => b.date === selectedDate);
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startPadding = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: startPadding });

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper for mock client initials
  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Helper for consistent avatar colors
  const getAvatarBg = (name) => {
    const hash = (name || '').split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = ['#0F766E', '#0369A1', '#4338CA', '#B45309', '#BE185D', '#6D28D9'];
    return colors[hash % colors.length];
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '40px', fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif' }}>
      {/* Premium Header */}
      <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            Schedule Planner
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage client advisory timings & calls
          </p>
        </div>
        <button 
          onClick={() => showNotification('Availability settings opening...', 'info')}
          aria-label="Calendar Settings"
          style={{ 
            background: '#F1F5F9', 
            border: 'none', 
            fontSize: '1.15rem', 
            cursor: 'pointer', 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
        >
          ⚙️
        </button>
      </div>

      {/* Modern Month Selector Navigator */}
      <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <button 
          onClick={handlePrevMonth}
          style={{ 
            background: '#FFFFFF', 
            border: '1px solid var(--border-light)', 
            borderRadius: '12px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            padding: '10px 16px', 
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          &larr;
        </button>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          {monthNames[month]} {year}
        </div>
        <button 
          onClick={handleNextMonth}
          style={{ 
            background: '#FFFFFF', 
            border: '1px solid var(--border-light)', 
            borderRadius: '12px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            padding: '10px 16px', 
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          &rarr;
        </button>
      </div>

      {/* Grid Calendar Card */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '28px', 
          padding: '20px 12px', 
          borderRadius: '24px', 
          border: '1.5px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 8px 30px rgba(10, 37, 64, 0.04)' 
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '12px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <div key={i} style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
          {/* Padding blocks */}
          {paddingArray.map((_, index) => (
            <div key={`pad-${index}`} style={{ height: '36px' }} />
          ))}
          {/* Day blocks */}
          {days.map(d => {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = selectedDate === dateString;
            const hasBooking = bookings.some(b => b.date === dateString);
            
            // Check if isToday
            const systemTodayStr = new Date().toISOString().split('T')[0];
            const isSystemToday = systemTodayStr === dateString;

            return (
              <div 
                key={d} 
                onClick={() => setSelectedDate(dateString)}
                style={{ 
                  height: '38px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: isSelected ? 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : isSystemToday ? 'var(--primary)' : 'var(--text-primary)',
                  borderRadius: '10px',
                  fontWeight: isSelected || isSystemToday ? 800 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: isSystemToday && !isSelected ? '1.5px solid rgba(13, 148, 136, 0.3)' : '1.5px solid transparent',
                  boxShadow: isSelected ? '0 6px 16px rgba(13, 148, 136, 0.3)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{d}</span>
                {hasBooking && (
                  <div style={{ 
                    width: '5px', 
                    height: '5px', 
                    background: isSelected ? '#FFFFFF' : 'var(--primary)', 
                    borderRadius: '50%', 
                    position: 'absolute',
                    bottom: '4px'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Section */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            Appointments
          </h3>
          <span style={{ fontSize: '0.72rem', background: '#F1F5F9', padding: '4px 10px', borderRadius: '20px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            {formattedSelectedDate}
          </span>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: 'auto', marginBottom: '12px' }} />
            <span>Syncing Schedule...</span>
          </div>
        ) : selectedBookings.length > 0 ? (
          <div className="flex-col gap-4" style={{ position: 'relative', paddingLeft: '8px' }}>
            {/* Left timeline accent rule bar */}
            <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '0px', width: '2px', background: 'var(--border-light)', zIndex: 0 }} />

            {selectedBookings.map(bk => (
              <div 
                key={bk.id} 
                className="card animate-scale-in"
                style={{ 
                  padding: '16px', 
                  borderRadius: '20px',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                  position: 'relative',
                  background: '#FFFFFF',
                  zIndex: 1
                }}
              >
                {/* Timeline node dot connector */}
                <div style={{ 
                  position: 'absolute', 
                  left: '-13px', 
                  top: '24px', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: bk.status === 'CONFIRMED' ? 'var(--success)' : 'var(--warning)', 
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 0 0 2px rgba(226, 232, 240, 0.6)'
                }} />

                <div className="flex-row gap-4" style={{ alignItems: 'center' }}>
                  {/* Client Avatar initials */}
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    background: getAvatarBg(bk.clientName), 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.9rem', 
                    fontWeight: 700 
                  }}>
                    {getInitials(bk.clientName)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {bk.clientName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🕒 {bk.time}</span>
                      <span>•</span>
                      <span>{bk.type === 'VIDEO' ? '🎥 Video Call' : '📞 Phone Call'}</span>
                    </div>
                  </div>

                  <div>
                    <span 
                      className={`badge`} 
                      style={{ 
                        background: bk.status === 'CONFIRMED' ? 'var(--success-container)' : 'var(--warning-container)', 
                        color: bk.status === 'CONFIRMED' ? 'var(--success)' : 'var(--warning)',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {bk.status}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  {bk.status === 'PENDING' ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '10px' }}
                    >
                      Confirm Session
                    </button>
                  ) : bk.roomUrl || bk.type === 'VIDEO' ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => showNotification(`Connecting to secure WebRTC consultation room: ${bk.id}`, 'info')}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        fontSize: '0.78rem', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        border: 'none',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      🎥 Join Consultation Room
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="card" 
            style={{ 
              textAlign: 'center', 
              padding: '36px 20px', 
              borderRadius: '24px', 
              border: '1.5px dashed var(--border-light)', 
              background: 'rgba(248, 250, 252, 0.4)' 
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>☕</div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Booked Appointments</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You are completely free on this date.</p>
          </div>
        )}
      </div>

      <button 
        className="btn btn-outline" 
        style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700 }}
        onClick={() => showNotification('Availability settings opening...', 'info')}
      >
        Adjust Availability Settings
      </button>
    </div>
  );
}
