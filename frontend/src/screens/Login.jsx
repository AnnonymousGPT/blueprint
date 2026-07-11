import { useEffect, useRef, useState } from 'react';
import { api } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2.2 }) {
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
          <path d="M15 18 9 12l6-6" />
        </svg>
      );
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.75 2.75 0 1 1 4.7 2c-.9.8-1.7 1.2-1.7 2.5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <rect x="6.5" y="3.5" width="11" height="17" rx="2.8" />
          <path d="M10 18h4" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v5c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-3Z" />
          <path d="m9.5 12.5 2 2 3.5-4" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m20 6-11 11-5-5" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 20V4" />
          <path d="M4 20h16" />
          <path d="m7 14 3-3 3 2 5-6" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialBadge({ letter, bg, fg }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color: fg,
        fontSize: '0.72rem',
        fontWeight: 900,
        flexShrink: 0
      }}
    >
      {letter}
    </span>
  );
}

export default function Login({ onLoginSuccess, addNotification, onCancel }) {
  const [loginMethod, setLoginMethod] = useState('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Onboarding / Signup states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('CLIENT');
  const [signupSpec, setSignupSpec] = useState('');
  const [signupFees, setSignupFees] = useState('1000');

  const otpRefs = useRef([]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.app-content');
    scrollContainer?.scrollTo?.(0, 0);
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo?.(0, 0);

    // Guard to prevent double-calling api.register
    let oauthHandled = false;

    // Listen for Supabase OAuth callbacks — handle SIGNED_IN & INITIAL_SESSION to make sure sessions are captured
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event, session?.user?.email);
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !oauthHandled) {
        oauthHandled = true;
        
        // Close browser on native (after OAuth redirect)
        if (Capacitor.isNativePlatform()) {
          await Browser.close().catch(() => {});
        }
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await api.register({
            phone: session.user.phone || session.user.email || 'Google-User',
            name: session.user.user_metadata?.full_name || 'Google User',
            email: session.user.email,
            role: 'CLIENT'
          });
          
          // Ensure token is stored
          if (res.token || res.accessToken) {
            localStorage.setItem('accessToken', res.token || res.accessToken);
          }
          
          addNotification?.(`Logged in successfully via Google!`, 'success');
          onLoginSuccess?.(res.user);
        } catch (err) {
          setErrorMsg(err.message);
          addNotification?.(err.message, 'error');
          oauthHandled = false; // allow retry on error
          setLoading(false);
        }
      }
    });

    // Handle deep link callback from OAuth on Android
    let appUrlListener;
    if (Capacitor.isNativePlatform()) {
      appUrlListener = App.addListener('appUrlOpen', async ({ url }) => {
        console.log('App URL opened:', url);
        if (url.startsWith('in.blueprintadvisor.app://') || url.includes('login-callback')) {
          await Browser.close().catch(() => {});
          setLoading(true);

          // Standard PKCE flow code exchange
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) {
            console.warn('OAuth exchange error, attempting fragment parse:', error.message);
            
            // Fallback parsing: In case verifier local state was reset due to WebView reload,
            // check if access_token and refresh_token are encoded in url redirect hash/query parameters.
            const urlObj = new URL(url.replace('in.blueprintadvisor.app://', 'https://localhost/'));
            // Parse query or hash fragment
            const params = new URLSearchParams(urlObj.hash.substring(1) || urlObj.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (setSessionError) {
                console.error('setSession fallback error:', setSessionError.message);
                setErrorMsg(setSessionError.message);
                setLoading(false);
              }
            } else {
              setErrorMsg(error.message);
              setLoading(false);
            }
          }
        }
      });
    }

    return () => {
      subscription?.unsubscribe();
      appUrlListener?.then?.(l => l.remove());
    };
  }, []);

  const resetVerification = () => {
    setOtpSent(false);
    setMagicLinkSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMsg('');
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();

    if (phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.sendOtp(phoneNumber);
      setOtpSent(true);
      setOtpCode(['', '', '', '', '', '']);
      if (res && res.devOtp) {
        addNotification?.(`OTP Code for verification is: ${res.devOtp}`, 'info');
      } else {
        addNotification?.('Verification OTP code sent to your phone!', 'success');
      }
    } catch (err) {
      setErrorMsg(err.message);
      addNotification?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = (e) => {
    e.preventDefault();

    if (!emailAddress || !emailAddress.includes('@') || emailAddress.length < 5) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMagicLinkSent(true);
      addNotification?.('Magic link sent to your email!', 'success');
      addNotification?.('Simulation active: Click the button below to continue.', 'info');
    }, 1000);
  };

  const handleSimulateMagicClick = () => {
    setLoading(true);
    setTimeout(() => {
      addNotification?.('Logged in securely via Magic Link!', 'success');
      onLoginSuccess?.({
        name: 'Akash',
        phone: phoneNumber || '+91 98765 43210',
        email: emailAddress || 'akash.fintech@advisor.in',
        pan: 'ABCDE1234F',
        gst: '27AAAAA1111A1Z1',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256'
      });
      setLoading(false);
    }, 900);
  };

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;

    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus?.();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus?.();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    const otp = otpCode.join('');

    if (otp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.verifyOtp(phoneNumber, otp);
      if (res.onboardingRequired) {
        setShowOnboarding(true);
        addNotification?.('Welcome! Please complete your profile registration.', 'info');
      } else {
        addNotification?.(`Welcome back, ${res.user.name || 'User'}!`, 'success');
        onLoginSuccess?.(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message);
      addNotification?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.register({
        phone: phoneNumber,
        name: signupName,
        email: signupEmail || undefined,
        role: signupRole,
        specialization: signupRole === 'EXPERT' ? signupSpec : undefined,
        fees: signupRole === 'EXPERT' ? signupFees : undefined
      });
      addNotification?.(`Account successfully created as ${signupRole}!`, 'success');
      onLoginSuccess?.(res.user);
    } catch (err) {
      setErrorMsg(err.message);
      addNotification?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? 'in.blueprintadvisor.app://login-callback'
        : window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
        }
      });
      if (error) throw error;

      // On native: open in-app browser manually
      if (isNative && data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (err) {
      setErrorMsg(err.message);
      addNotification?.(err.message, 'error');
      setLoading(false);
    }
  };

  const heroArt = (
    <svg className="login-hero-art" viewBox="0 0 180 140" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lg-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6f9ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="lg-lock" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f86ff" />
          <stop offset="100%" stopColor="#1f5ee9" />
        </linearGradient>
      </defs>
      <rect x="10" y="12" width="160" height="112" rx="22" fill="url(#lg-card)" stroke="rgba(37,99,235,0.12)" />
      <rect x="28" y="28" width="56" height="10" rx="5" fill="#d5ddf2" />
      <rect x="28" y="44" width="94" height="7" rx="3.5" fill="#c9d6ee" />
      <rect x="28" y="58" width="72" height="7" rx="3.5" fill="#c9d6ee" />
      <rect x="28" y="72" width="82" height="7" rx="3.5" fill="#c9d6ee" />
      <rect x="116" y="34" width="34" height="34" rx="12" fill="rgba(59,130,246,0.12)" />
      <circle cx="133" cy="49" r="9" fill="#4f86ff" opacity="0.9" />
      <path d="M20 90h16l10 11 12-16h6" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="116" y="70" width="28" height="28" rx="9" fill="url(#lg-lock)" />
      <rect x="120.5" y="79" width="19" height="16" rx="6" fill="#ffffff" opacity="0.18" />
      <path d="M130 74v-4a4 4 0 0 1 8 0v4" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="146" cy="102" r="13" fill="#22c55e" />
      <path d="m141.5 102 3.2 3.2 6-6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const brandSocial = [
    { label: 'Google', letter: 'G', bg: 'rgba(37,99,235,0.08)', fg: '#2563eb' },
    { label: 'Apple', letter: 'A', bg: 'rgba(15,23,42,0.08)', fg: '#111827' },
    { label: 'Microsoft', letter: 'M', bg: 'rgba(34,197,94,0.10)', fg: '#0f766e' }
  ];

  return (
    <div className="screen-shell login-shell animate-fade-in-up">
      <div className="login-topbar">
        <button
          type="button"
          onClick={onCancel}
          className="login-icon-button"
          aria-label="Go back"
        >
          <Icon name="back" size={22} />
        </button>

        <div className="login-top-actions">
          <button
            type="button"
            onClick={() => addNotification?.('Support is on the way.', 'info')}
            className="login-help-button"
          >
            <Icon name="help" size={18} />
            Need help?
          </button>
        </div>
      </div>

      {showOnboarding ? (
        <div className="login-auth-card animate-scale-in">
          <div className="login-otp-header" style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(false);
                setOtpSent(false);
                setOtpCode(['', '', '', '', '', '']);
              }}
              className="login-otp-link"
            >
              <Icon name="back" size={16} />
              Back to Login
            </button>
            <div className="login-otp-heading">Complete Profile</div>
            <div className="login-otp-copy">Register as a Client, Admin or CA Partner to get started.</div>
          </div>

          <form onSubmit={handleRegister} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="login-field">
              <label className="login-field-label">Full Name</label>
              <div className="login-phone-field">
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="login-text-input"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Email Address (Optional)</label>
              <div className="login-phone-field">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="login-text-input"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Choose Role</label>
              <div className="login-method-tabs" style={{ marginBottom: 0, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setSignupRole('CLIENT')}
                  className={`login-method-tab ${signupRole === 'CLIENT' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', height: 38 }}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('EXPERT')}
                  className={`login-method-tab ${signupRole === 'EXPERT' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', height: 38 }}
                >
                  CA Expert
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('ADMIN')}
                  className={`login-method-tab ${signupRole === 'ADMIN' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', height: 38 }}
                >
                  Admin
                </button>
              </div>
            </div>

            {signupRole === 'EXPERT' && (
              <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="login-field">
                  <label className="login-field-label">Specialization</label>
                  <div className="login-phone-field">
                    <input
                      type="text"
                      placeholder="e.g. Corporate Auditing, GST returns"
                      value={signupSpec}
                      onChange={(e) => setSignupSpec(e.target.value)}
                      className="login-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Consultation Fee (Rs.)</label>
                  <div className="login-phone-field">
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={signupFees}
                      onChange={(e) => setSignupFees(e.target.value)}
                      className="login-text-input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && <div className="login-field-note" style={{ color: '#dc2626', textAlign: 'left' }}>{errorMsg}</div>}

            <button type="submit" className="login-cta" disabled={loading}>
              {loading ? (
                <span className="spinner-circle" style={{ width: 20, height: 20 }} />
              ) : (
                <>
                  Register &amp; Login
                  <span className="login-cta-arrow">
                    <Icon name="arrow" size={16} color="#ffffff" />
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : !otpSent && !magicLinkSent ? (
        <>
          <section className="login-hero-card">
            <div className="login-hero-content">
              <div className="login-hero-eyebrow">Welcome back!</div>
              <div className="login-hero-title">Sign in to continue</div>
              <div className="login-hero-copy">Access your documents, cases and expert support.</div>
            </div>
            {heroArt}
          </section>

          <div className="login-brand-lockup">
            <div className="login-brand-mark">
              <Icon name="chart" size={28} color="#ffffff" />
            </div>
            <div className="login-brand-title">Blueprint Advisor</div>
            <div className="login-brand-subtitle">Professional CA &amp; Business Advisory Services</div>
          </div>

          <div className="login-auth-card">
            <div className="login-method-tabs">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  resetVerification();
                }}
                className={`login-method-tab ${loginMethod === 'otp' ? 'active' : ''}`}
              >
                <Icon name="phone" size={18} color={loginMethod === 'otp' ? '#ffffff' : '#64748b'} />
                OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('magic');
                  resetVerification();
                }}
                className={`login-method-tab ${loginMethod === 'magic' ? 'active' : ''}`}
              >
                <Icon name="mail" size={18} color={loginMethod === 'magic' ? '#ffffff' : '#64748b'} />
                Email Link
              </button>
            </div>

            <div className="login-trust-grid">
              <div className="login-trust-card">
                <div className="login-trust-icon">
                  <Icon name="shield" size={18} color="#2563eb" />
                </div>
                <div className="login-trust-heading">100% Secure</div>
                <div className="login-trust-copy">Your data is safe and encrypted</div>
              </div>

              <div className="login-trust-card">
                <div className="login-trust-icon">
                  <Icon name="spark" size={18} color="#2563eb" />
                </div>
                <div className="login-trust-heading">Quick Access</div>
                <div className="login-trust-copy">Login in seconds with OTP</div>
              </div>

              <div className="login-trust-card">
                <div className="login-trust-icon">
                  <Icon name="lock" size={18} color="#2563eb" />
                </div>
                <div className="login-trust-heading">Private &amp; Trusted</div>
                <div className="login-trust-copy">Trusted by 1M+ users across India</div>
              </div>
            </div>

            {loginMethod === 'otp' && !otpSent ? (
              <form onSubmit={handleSendOtp} className="login-form">
                <div className="login-field">
                  <label className="login-field-label">
                    <Icon name="phone" size={18} color="#0f172a" />
                    Mobile Number
                  </label>

                  <div className="login-phone-field">
                    <span className="login-phone-prefix">
                      +91
                      <Icon name="chevronDown" size={12} color="#94a3b8" />
                    </span>
                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="Enter 10 digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="login-text-input"
                    />
                  </div>

                  <div className="login-field-note success">
                    <Icon name="shield" size={14} color="#15803d" />
                    We will send a 6 digit OTP to this number
                  </div>
                </div>

                {errorMsg && <div className="login-field-note" style={{ color: '#dc2626', textAlign: 'left' }}>{errorMsg}</div>}

                <button
                  type="submit"
                  className="login-cta"
                  disabled={loading || phoneNumber.length < 10}
                >
                  {loading ? (
                    <span className="spinner-circle" style={{ width: 20, height: 20 }} />
                  ) : (
                    <>
                      Send OTP
                      <span className="login-cta-arrow">
                        <Icon name="arrow" size={16} color="#ffffff" />
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : loginMethod === 'magic' && !magicLinkSent ? (
              <form onSubmit={handleSendMagicLink} className="login-form">
                <div className="login-field">
                  <label className="login-field-label">
                    <Icon name="mail" size={18} color="#0f172a" />
                    Email Address
                  </label>

                  <div className="login-phone-field">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="login-text-input"
                    />
                  </div>
                </div>

                {errorMsg && <div className="login-field-note" style={{ color: '#dc2626', textAlign: 'left' }}>{errorMsg}</div>}

                <button
                  type="submit"
                  className="login-cta"
                  disabled={loading || !emailAddress.includes('@')}
                >
                  {loading ? (
                    <span className="spinner-circle" style={{ width: 20, height: 20 }} />
                  ) : (
                    <>
                      Send Link
                      <span className="login-cta-arrow">
                        <Icon name="arrow" size={16} color="#ffffff" />
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : null}

            <div className="login-separator">or continue with</div>

            <div className="login-social-grid">
              {brandSocial.map((brand) => (
                <button key={brand.label} type="button" className="login-social-btn" onClick={() => {
                  if (brand.label === 'Google') {
                    handleGoogleLogin();
                  } else {
                    setSignupName(brand.label + " User");
                    setShowOnboarding(true);
                  }
                }}>
                  <SocialBadge {...brand} />
                  {brand.label}
                </button>
              ))}
            </div>

            <div className="login-footer-links">
              By continuing, you agree to our{' '}
              <button type="button" className="login-link" onClick={() => addNotification?.('Terms of Service opened.', 'info')}>
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="login-link" onClick={() => addNotification?.('Privacy Policy opened.', 'info')}>
                Privacy Policy
              </button>
            </div>

            <div className="login-field-note success">
              <Icon name="shield" size={14} color="#15803d" />
              Your security is our priority. We never share your personal information.
            </div>
          </div>
        </>
      ) : magicLinkSent ? (
        <div className="login-auth-card animate-scale-in">
          <div className="login-success-card">
            <div className="login-success-badge">
              <Icon name="mail" size={30} color="#16a34a" />
            </div>
            <div className="login-success-title">Check your inbox</div>
            <div className="login-success-copy">
              We sent a secure passwordless login link to <strong style={{ color: 'var(--text-primary)' }}>{emailAddress}</strong>.
            </div>

            <div
              style={{
                width: '100%',
                border: '1.5px dashed rgba(34,197,94,0.28)',
                background: 'rgba(16,185,129,0.04)',
                borderRadius: 18,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Magic Link Simulation Active
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Click below to simulate opening the magic link from your email.
              </div>
              <button type="button" onClick={() => {
                setShowOnboarding(true);
              }} className="login-cta">
                {loading ? (
                  <span className="spinner-circle" style={{ width: 20, height: 20 }} />
                ) : (
                  <>
                    Open Link
                    <span className="login-cta-arrow">
                      <Icon name="arrow" size={16} color="#ffffff" />
                    </span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMagicLinkSent(false);
                setEmailAddress('');
              }}
              className="login-link"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="login-auth-card animate-scale-in">
          <div className="login-otp-header">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode(['', '', '', '', '', '']);
              }}
              className="login-otp-link"
            >
              <Icon name="back" size={16} />
              Edit Number
            </button>
            <div className="login-otp-heading">Verify Phone</div>
            <div className="login-otp-copy">We sent a 6-digit verification code to +91 {phoneNumber}</div>
          </div>

          <div className="login-otp-grid">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                maxLength="1"
                className="login-otp-box"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {errorMsg && <div className="login-field-note" style={{ color: '#dc2626' }}>{errorMsg}</div>}

          <button
            type="button"
            onClick={handleVerifyOtp}
            className="login-cta"
            disabled={loading || otpCode.some((digit) => digit === '')}
          >
            {loading ? (
              <span className="spinner-circle" style={{ width: 20, height: 20 }} />
            ) : (
              <>
                Verify
                <span className="login-cta-arrow">
                  <Icon name="arrow" size={16} color="#ffffff" />
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendOtp}
            className="login-link"
          >
            Didn&apos;t receive the OTP? Resend OTP
          </button>
        </div>
      )}
    </div>
  );
}
