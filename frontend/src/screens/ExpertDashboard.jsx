import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ExpertDashboard({ user, requests, onSelectCase, onViewCalendar, onOpenProfile }) {
  const [loading, setLoading] = useState(true);

  // Safe haptics
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const activeCases = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'Completed').length;
  const pendingDocs = requests.filter(r => r.status === 'DOCUMENTS_PENDING' || r.status === 'Submitted').length;
  const totalCompleted = requests.filter(r => r.status === 'COMPLETED' || r.status === 'Completed').length;

  const getStats = () => [
    { title: 'Active Cases', count: activeCases, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { title: 'Pending Reviews', count: pendingDocs, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { title: 'Completed', count: totalCompleted, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { title: 'Today\'s Calls', count: requests.flatMap(r => r.bookings || []).length, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
  ];

  if (loading) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton-container animate-pulse-slow" style={{ height: 40, width: '60%', borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="skeleton-container animate-pulse-slow" style={{ height: 90, borderRadius: 16 }} />
          <div className="skeleton-container animate-pulse-slow" style={{ height: 90, borderRadius: 16 }} />
        </div>
        <div className="skeleton-container animate-pulse-slow" style={{ height: 160, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px' }}>EXPERT PORTAL</span>
          <h3 className="title-accent" style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Welcome, CA {user?.name || 'Partner'}
          </h3>
        </div>
        <button
          onClick={() => {
            playHaptic();
            onOpenProfile?.();
          }}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Open expert profile"
        >
          CA
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {getStats().map((stat, i) => (
          <div 
            key={i}
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1.5px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.title}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color }}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Task card overview */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: 20,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900 }}>Upcoming Consultation Calls</h4>
          <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>Review client consultations booked for today.</p>
        </div>
        <button
          onClick={() => {
            playHaptic();
            onViewCalendar();
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            alignSelf: 'flex-start',
            minHeight: 38
          }}
          aria-label="View expert consultation calendar"
        >
          Open Calendar →
        </button>
      </div>

      {/* Active Case lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h4 style={{ margin: '8px 0 2px', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Assigned Cases
        </h4>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            No active compliance requests assigned to you yet.
          </div>
        ) : (
          requests.slice(0, 3).map(req => (
            <div 
              key={req.id}
              onClick={() => {
                playHaptic();
                onSelectCase(req);
              }}
              style={{
                padding: 14,
                borderRadius: 16,
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {req.serviceName}
                </h5>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  Client: {req.client?.name || 'Advisor Client'}
                </span>
              </div>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: req.status === 'DOCUMENTS_PENDING' ? '#ef4444' : '#10b981',
                backgroundColor: req.status === 'DOCUMENTS_PENDING' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                padding: '4px 8px',
                borderRadius: 8
              }}>
                {req.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
