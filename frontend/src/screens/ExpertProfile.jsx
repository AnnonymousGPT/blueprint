import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ExpertProfile({ user, onLogout, addNotification, theme, setTheme }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch {}
  };

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

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    playHaptic(ImpactStyle.Medium);
    setTheme(newTheme);
    addNotification?.(`Theme switched to ${newTheme} mode!`, 'success');
  };

  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16 }}>
      {/* Network Alert Banner */}
      {isOffline && (
        <div 
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box'
          }}
          role="alert"
        >
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>
            Offline Mode — Changes will sync when online.
          </span>
        </div>
      )}

      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingInline: '4px' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            PARTNER ACCOUNT
          </span>
          <h3 className="title-accent" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
            Expert Profile
          </h3>
        </div>

        <div 
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.15)'
          }}
        >
          VERIFIED CA
        </div>
      </div>

      {/* Info Card */}
      <div 
        className="card animate-scale-in" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #091E42 0%, #0F2A54 100%)',
          padding: '24px 20px',
          borderRadius: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.15)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '1.6rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #38bdf8'
        }}>
          CA
        </div>
        
        <div>
          <h4 className="title-accent" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            CA {user?.name}
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginTop: '2px' }}>
            {user?.email}
          </span>
        </div>

        {/* Credentials Grid */}
        <div 
          style={{ 
            width: '100%', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px', 
            marginTop: '8px',
            fontSize: '0.75rem',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <span style={{ color: '#38BDF8', display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Specialization
            </span>
            <span style={{ fontWeight: 800, color: '#ffffff', marginTop: '2px', display: 'block', fontSize: '0.8rem' }}>
              {user?.specialization || 'Income Tax / ITR'}
            </span>
          </div>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <span style={{ color: '#38BDF8', display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consultation Fee
            </span>
            <span style={{ fontWeight: 800, color: '#ffffff', marginTop: '2px', display: 'block', fontSize: '0.8rem' }}>
              ₹{user?.fees || '1,499'}/hr
            </span>
          </div>
        </div>
      </div>

      {/* Theme Switcher Setting Panel */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: '16px',
          border: '1.5px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div>
          <h5 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Appearance Theme
          </h5>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            Choose light or dark mode
          </span>
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--border-color)', borderRadius: '10px', padding: '2px' }}>
          <button 
            type="button"
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: theme === 'light' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              minHeight: 32
            }}
            aria-label="Switch to Light Theme"
          >
            Light
          </button>
          <button 
            type="button"
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              minHeight: 32
            }}
            aria-label="Switch to Dark Theme"
          >
            Dark
          </button>
        </div>
      </div>

      {/* Logout button */}
      <button 
        onClick={() => {
          playHaptic(ImpactStyle.Heavy);
          onLogout();
        }}
        className="btn btn-secondary"
        style={{ 
          borderColor: 'var(--error)', 
          color: 'var(--error)', 
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.02)',
          width: '100%',
          cursor: 'pointer',
          minHeight: 48
        }}
        aria-label="Log out of expert account"
      >
        🚪 Log out
      </button>
    </div>
  );
}
