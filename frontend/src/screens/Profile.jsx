import { useEffect } from 'react';

export default function Profile({ userProfile, onMenuClick, onLogout, onLoginTrigger, addNotification }) {
  const isGuest = userProfile?.isGuest;

  useEffect(() => {
    const appContent = document.querySelector('.app-content');
    const screenShell = document.querySelector('.screen-shell');
    console.log('--- PROFILE LAYOUT DEBUG ---');
    console.log('window.innerHeight:', window.innerHeight);
    console.log('document.body.scrollHeight:', document.body.scrollHeight);
    if (appContent) {
      console.log('appContent.scrollHeight:', appContent.scrollHeight);
      console.log('appContent.clientHeight:', appContent.clientHeight);
    }
    if (screenShell) {
      console.log('screenShell.height:', screenShell.getBoundingClientRect().height);
      console.log('screenShell computed padding-bottom:', window.getComputedStyle(screenShell).paddingBottom);
      console.log('screenShell computed height:', window.getComputedStyle(screenShell).height);
      const childrenInfo = Array.from(screenShell.children).map((c, i) => {
        return `${i}: <${c.tagName.toLowerCase()}> class="${c.className}" height=${c.getBoundingClientRect().height}`;
      });
      console.log('screenShell children:\n' + childrenInfo.join('\n'));
    }
  }, []);

  const menuItems = [
    { 
      id: 'requests', 
      label: 'Cases', 
      desc: 'View your cases', 
      iconBg: '#FFF2E6', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="M9 14h6M9 18h6"/>
        </svg>
      )
    },
    { 
      id: 'payments', 
      label: 'Billing', 
      desc: 'Payments & invoices', 
      iconBg: '#FEF9C3', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ) 
    },
    { 
      id: 'invoices', 
      label: 'Invoices', 
      desc: 'View all invoices', 
      iconBg: '#EFF6FF', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ) 
    },
    { 
      id: 'saved-docs', 
      label: 'Files', 
      desc: 'Manage your files', 
      iconBg: '#E6F4EA', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ) 
    },
    { 
      id: 'tickets', 
      label: 'Support', 
      desc: 'Help & support center', 
      iconBg: '#FEE2E2', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ) 
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      desc: 'Privacy & security settings', 
      iconBg: '#F3E8FF', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ) 
    }
  ];

  return (
    <div 
      className="screen-shell animate-fade-in-up"
      style={{
        gap: '16px',
        paddingTop: '20px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        flexShrink: 0
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            ACCOUNT
          </span>
          <h3 className="title-accent" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
            Profile
          </h3>
        </div>

        {/* Secure Badge */}
        <div 
          style={{
            backgroundColor: '#EFF6FF',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          SECURE
        </div>
      </div>

      {isGuest ? (
        /* Premium Secure Account card for guest users */
        <div 
          className="card animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, #091E42 0%, #0F2A54 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.15)',
            padding: '24px 20px',
            color: '#ffffff',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
            width: '100%'
          }}
        >
          {/* Centered rings + padlock icon */}
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', width: '68px', height: '68px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1.5" fill="#F59E0B" />
              </svg>
            </div>
            {/* Green check badge overlay */}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #091E42' }}>
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h4 className="title-accent" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Secure account
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px', margin: 0 }}>
              Your data is safe with us.
            </p>
          </div>

          {/* Action button with inline chevron arrow */}
          <button 
            onClick={onLoginTrigger}
            className="btn btn-primary"
            style={{
              backgroundColor: '#2563EB',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              borderRadius: '16px',
              padding: '14px 20px',
              width: '100%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <span style={{ flex: 1, textAlign: 'center', marginLeft: '24px' }}>Sign in or create account</span>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      ) : (
        /* Premium Info Profile Card for authenticated CAs/Clients */
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
            width: '100%'
          }}
        >
          <img 
            src={userProfile.photo} 
            alt={userProfile.name} 
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '3px solid #38BDF8',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          />
          
          <div>
            <h4 className="title-accent" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {userProfile.name}
            </h4>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginTop: '2px' }}>
              {userProfile.email}
            </span>
          </div>

          {/* Credentials Info Grid */}
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
                PAN Number
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff', marginTop: '2px', display: 'block', fontSize: '0.82rem' }}>
                {userProfile.pan || 'NOT SUPPLIED'}
              </span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
              <span style={{ color: '#38BDF8', display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GSTIN
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff', marginTop: '2px', display: 'block', fontSize: '0.82rem' }}>
                {userProfile.gst || 'NOT SUPPLIED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trust Indicators Row */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '6px', 
          width: '100%', 
          marginTop: '4px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}
      >
        {/* SSL Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
            <strong>256-bit</strong><br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>SSL Encryption</span>
          </span>
        </div>

        {/* Data Protected */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
            <strong>Data</strong><br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Protected</span>
          </span>
        </div>

        {/* Privacy Guaranteed */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(124, 58, 237, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
            <strong>Privacy</strong><br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Guaranteed</span>
          </span>
        </div>

        {/* Secure Servers */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
              <rect x="2" y="2" width="20" height="6" rx="2"/>
              <rect x="2" y="9" width="20" height="6" rx="2"/>
              <rect x="2" y="16" width="20" height="6" rx="2"/>
              <path d="M6 5h.01M6 12h.01M6 19h.01"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
            <strong>Secure</strong><br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Servers</span>
          </span>
        </div>
      </div>

      {/* Menu Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => {
              if (isGuest && item.id !== 'privacy') {
                addNotification('Login required to access this feature.', 'error');
                onLoginTrigger();
              } else {
                onMenuClick(item.id, item.label);
              }
            }}
            className="card"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isGuest && item.id !== 'privacy') {
                  addNotification('Login required to access this feature.', 'error');
                  onLoginTrigger();
                } else {
                  onMenuClick(item.id, item.label);
                }
              }
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              cursor: 'pointer',
              borderRadius: '16px',
              border: '1.5px solid rgba(226, 232, 240, 0.8)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(10, 37, 64, 0.02)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-variant)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Colored Circular Icon Container */}
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: item.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {item.icon}
              </div>

              {/* Title and Description */}
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {item.label}
                </h5>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  {item.desc}
                </span>
              </div>
            </div>
            
            {/* Chevron Right arrow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>

      {/* Connection encryption status strip */}
      <div 
        style={{
          backgroundColor: '#F0F9FF',
          border: '1.5px solid #E0F2FE',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: '0.7rem', color: '#0369A1', lineHeight: 1.3 }}>
            Your connection is secured using <strong>256-bit SSL</strong> encryption.
          </span>
        </div>

        {/* Secure badge */}
        <div 
          style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.64rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(21, 128, 61, 0.2)'
          }}
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1.5 4L4 6.5L8.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Secure
        </div>
      </div>

      {/* Logout button for authenticated users */}
      {!isGuest && (
        <button 
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ 
            borderColor: 'var(--error)', 
            color: 'var(--error)', 
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.02)',
            width: '100%',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.02)'}
        >
          🚪 Log out
        </button>
      )}
    </div>
  );
}
