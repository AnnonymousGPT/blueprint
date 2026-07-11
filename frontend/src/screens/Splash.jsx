import { useEffect } from 'react';

export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#071628',
        color: '#ffffff',
        padding: '24px 0 28px',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 10%, rgba(56,189,248,0.14) 0, rgba(56,189,248,0.14) 8%, transparent 8.5%), radial-gradient(circle at 80% 28%, rgba(14,165,233,0.10) 0, rgba(14,165,233,0.10) 10%, transparent 10.5%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Blueprint Advisor
        </span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7dd3fc' }}>
          CA + Business
        </span>
      </div>

      <div
        className="animate-scale-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          zIndex: 1,
          padding: '0 24px'
        }}
      >
        <div
          style={{
            width: 94,
            height: 94,
            borderRadius: 28,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(14,165,233,0.14)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            <circle cx="18.7" cy="8" r="1.5" fill="var(--secondary)" />
          </svg>
        </div>

        <div>
          <h1
            className="title-accent"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: 6
            }}
          >
            Blueprint Advisor
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.78)', fontWeight: 600, lineHeight: 1.35 }}>
            Compact CA workspace for faster cases, documents, and expert help.
          </p>
        </div>
      </div>

      <div style={{ width: '100%', padding: '0 24px', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            color: 'rgba(255,255,255,0.64)',
            fontSize: '0.68rem',
            fontWeight: 700
          }}
        >
          <span>Secure</span>
          <span>-</span>
          <span>Trusted</span>
          <span>-</span>
          <span>Fast</span>
        </div>

        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid rgba(255,255,255,0.16)',
            borderTopColor: '#7dd3fc',
            borderRadius: '50%',
            margin: '0 auto 12px',
            animation: 'shimmer 0.9s linear infinite'
          }}
        />

        <p style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.62)', fontWeight: 600, letterSpacing: '0.3px' }}>
          Loading your workspace...
        </p>
      </div>
    </div>
  );
}
