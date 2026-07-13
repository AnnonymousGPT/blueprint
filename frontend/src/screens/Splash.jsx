import { useState } from 'react';

export default function Splash({ onFinish }) {
  const [isPressing, setIsPressing] = useState(false);

  const handleGetStarted = () => {
    onFinish('login');
  };

  const handleSkip = () => {
    onFinish('guest');
  };

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
        backgroundColor: '#020A13', // Ultra-dark luxury navy
        color: '#ffffff',
        padding: '24px 20px 28px',
        textAlign: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Premium Ambient Radial Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '80%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-20%',
          width: '80%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* TOP: Header Bar */}
      <div 
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 1,
          marginBottom: 16
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>B</span>
          </div>
          <span 
            style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: '#ffffff', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase' 
            }}
          >
            Blueprint Advisor
          </span>
        </div>

        {/* Skip button */}
        <button 
          onClick={handleSkip}
          style={{ 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            color: 'rgba(255, 255, 255, 0.5)', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '12px',
            cursor: 'pointer',
            padding: '6px 14px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
        >
          Skip
        </button>
      </div>

      {/* HERO: Glowing glass container with 3D Illustration */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          margin: '12px 0 20px'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 320,
            aspectRatio: '1.2 / 1',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Subtle cyan background glow inside glass */}
          <div
            style={{
              position: 'absolute',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
              zIndex: 0
            }}
          />

          {/* Premium 3D Fintech Logo/Art Container */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16
            }}
          >
            {/* Holographic glowing orb/shield */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.2) 70%)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 3s infinite alternate'
              }}
            >
              {/* Luxury Shield / Consultation Icon */}
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* TYPOGRAPHY: Titles & Specs */}
      <div style={{ zIndex: 1, padding: '0 8px', maxWidth: 360 }}>
        <h1
          style={{
            fontSize: '1.9rem',
            fontWeight: 850,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: 8,
            lineHeight: 1.2
          }}
        >
          On-Demand CA Experts
        </h1>
        <p 
          style={{ 
            fontSize: '0.84rem', 
            color: '#94A3B8', 
            fontWeight: 500, 
            lineHeight: 1.45,
            margin: '0 auto 20px'
          }}
        >
          Book consultations, upload documents securely, and track filings in real time.
        </p>
      </div>

      {/* MIDDLE: Floating glass cards stack */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 1,
          maxWidth: 360,
          marginBottom: 24
        }}
      >
        {/* Card 1: PAN Verified */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>💳</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>PAN Card Validation</span>
          </div>
          <span 
            style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              color: '#10B981', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              padding: '4px 8px', 
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            VERIFIED
          </span>
        </div>

        {/* Card 2: Tax Saved */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>💰</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>Tax Savings Generated</span>
          </div>
          <span 
            style={{ 
              fontSize: '0.82rem', 
              fontWeight: 800, 
              color: '#06B6D4',
              letterSpacing: '0.2px'
            }}
          >
            ₹42,000
          </span>
        </div>

        {/* Card 3: Filing Progress */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>📈</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>Filing Status Tracker</span>
            </div>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#6366f1' }}>75% Done</span>
          </div>
          {/* Glass progress bar */}
          <div 
            style={{ 
              width: '100%', 
              height: 6, 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              borderRadius: 3, 
              overflow: 'hidden' 
            }}
          >
            <div 
              style={{ 
                width: '75%', 
                height: '100%', 
                background: 'linear-gradient(90deg, #6366f1 0%, #06B6D4 100%)', 
                borderRadius: 3 
              }}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM: Sticky Action Button & Trust Indicator */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: 360, 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 14 
        }}
      >
        {/* Large Sticky Cyan CTA */}
        <button
          onClick={handleGetStarted}
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            color: '#020A13',
            border: 'none',
            padding: '16px 20px',
            borderRadius: '16px',
            fontWeight: 850,
            fontSize: '0.94rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transform: isPressing ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          <span>Get Started</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {/* FOOTER: Security Lock indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            color: 'rgba(148, 163, 184, 0.6)',
            fontSize: '0.66rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secure 128-bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
