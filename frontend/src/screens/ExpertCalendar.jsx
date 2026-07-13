import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ExpertCalendar({ requests, addNotification }) {
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const getAppointments = () => {
    return requests.flatMap(req => {
      const bookings = req.bookings || [];
      return bookings.map(b => ({
        ...b,
        serviceName: req.serviceName,
        clientName: req.client?.name || 'Advisor Client'
      }));
    });
  };

  const appointments = getAppointments();

  const handleLaunchCall = (call) => {
    playHaptic();
    addNotification('Launching secure Zoom Video room...', 'success');
    window.open('https://zoom.us', '_blank');
  };

  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16 }}>
      <div>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px' }}>SCHEDULER</span>
        <h3 className="title-accent" style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          My Calendar
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            No video consultations scheduled yet.
          </div>
        ) : (
          appointments.map(call => (
            <div
              key={call.id}
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Consultation: {call.serviceName}
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: 3 }}>
                  Client: {call.clientName}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#3b82f6', fontWeight: 800, display: 'block', marginTop: 6 }}>
                  📅 {new Date(call.scheduledAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleLaunchCall(call)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 40
                }}
              >
                Join Call
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
