import { useEffect, useRef, useState } from 'react';
import { api } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

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
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');

  // Strict state machine state
  // IDLE | SENDING_OTP | OTP_SEND_FAILED | OTP_SENT | VERIFYING_OTP | OTP_INVALID | REGISTRATION_REQUIRED | REGISTERING | AUTHENTICATED | ERROR
  const [authState, setAuthState] = useState('IDLE');

  // Offline status state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // OTP Cooldown counter state
  const [cooldown, setCooldown] = useState(0);

  // Onboarding / Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('CLIENT');
  const [signupSpec, setSignupSpec] = useState('');
  const [signupFees, setSignupFees] = useState('1000');

  const otpRefs = useRef([]);
  const cooldownTimerRef = useRef(null);
  const oauthWatchdogRef = useRef(null);

  // Safe Capacitor Haptic trigger
  const playHaptic = async (type) => {
    try {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err) {
      console.warn('Haptic feedback unavailable:', err);
    }
  };

  // Analytics event logger
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  // OTP Resend Cooldown Counter logic
  const startCooldown = () => {
    setCooldown(60);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Google OAuth cancellation watchdog (20 seconds)
  const startOAuthWatchdog = () => {
    if (oauthWatchdogRef.current) clearTimeout(oauthWatchdogRef.current);
    oauthWatchdogRef.current = setTimeout(async () => {
      if (authState === 'SENDING_OTP' || authState === 'VERIFYING_OTP') {
        setAuthState('IDLE');
        setErrorMsg('Google Sign-In cancelled.');
        playHaptic('error');
        trackEvent('oauth_cancelled', { reason: 'watchdog_timeout' });
        addNotification?.('Google Sign-In cancelled.', 'error');
        if (Capacitor.isNativePlatform()) {
          await Browser.close().catch(() => {});
        }
      }
    }, 20000);
  };

  const clearOAuthWatchdog = () => {
    if (oauthWatchdogRef.current) {
      clearTimeout(oauthWatchdogRef.current);
      oauthWatchdogRef.current = null;
    }
  };

  // Connection and Session Listeners
  useEffect(() => {
    trackEvent('login_screen_viewed');

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleSessionExpired = () => {
      addNotification?.('Your session has expired. Please sign in again.', 'warning');
      setAuthState('IDLE');
      playHaptic('error');
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);

    const scrollContainer = document.querySelector('.app-content');
    scrollContainer?.scrollTo?.(0, 0);
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo?.(0, 0);

    // Guard to prevent double execution
    let oauthHandled = false;

    // Listen for Supabase OAuth redirect callbacks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event, session?.user?.email);
      
      if (session?.user && session?.user?.email && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !oauthHandled) {
        oauthHandled = true;
        clearOAuthWatchdog();
        
        const actualToken = session?.access_token || session?.accessToken;
        if (actualToken) {
          localStorage.setItem('accessToken', actualToken);
        }
        
        if (Capacitor.isNativePlatform()) {
          await Browser.close().catch(() => {});
        }
        setAuthState('VERIFYING_OTP');
        setErrorMsg('');
        try {
          const res = await api.register({
            phone: session.user.phone || session.user.email || `google-${session.user.id}`,
            name: session.user.user_metadata?.full_name || 'Google User',
            email: session.user.email,
            role: 'CLIENT'
          });
          
          if (res.token || res.accessToken) {
            localStorage.setItem('accessToken', res.token || res.accessToken);
          }
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          
          setAuthState('AUTHENTICATED');
          playHaptic('success');
          trackEvent('google_login_success', { userId: res.user?.id });
          addNotification?.(`Logged in successfully via Google!`, 'success');
          onLoginSuccess?.(res.user);
        } catch (err) {
          setAuthState('ERROR');
          setErrorMsg(err.message);
          playHaptic('error');
          trackEvent('google_login_failed', { error: err.message });
          addNotification?.(err.message, 'error');
          oauthHandled = false;
        }
      }
    });

    // Handle deep link callback from OAuth on Android
    let appUrlListener;
    if (Capacitor.isNativePlatform() || !!window.Capacitor) {
      appUrlListener = App.addListener('appUrlOpen', async ({ url }) => {
        console.log('App URL opened:', url);
        if (url.startsWith('in.blueprintadvisor.app://') || url.includes('login-callback')) {
          await Browser.close().catch(() => {});
          setAuthState('VERIFYING_OTP');
          clearOAuthWatchdog();

          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) {
            console.warn('OAuth exchange error, attempting fragment parse:', error.message);
            const urlObj = new URL(url.replace('in.blueprintadvisor.app://', 'https://localhost/'));
            const params = new URLSearchParams(urlObj.hash.substring(1) || urlObj.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken);
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (setSessionError) {
                setAuthState('ERROR');
                setErrorMsg(setSessionError.message);
                playHaptic('error');
              }
            } else {
              setAuthState('ERROR');
              setErrorMsg(error.message);
              playHaptic('error');
            }
          }
        }
      });
    }

    return () => {
      subscription?.unsubscribe();
      appUrlListener?.then?.(l => l.remove());
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth_session_expired', handleSessionExpired);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // Autofocus the first OTP box when verification code is sent
  useEffect(() => {
    if (authState === 'OTP_SENT') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 50);
    }
  }, [authState]);

  const resetVerification = () => {
    setMagicLinkSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMsg('');
    setAuthState('IDLE');
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();

    if (isOffline) {
      addNotification?.('No Internet Connection. Please reconnect and try again.', 'error');
      return;
    }

    if (phoneNumber.length < 10) {
      setAuthState('ERROR');
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      playHaptic('error');
      return;
    }

    setAuthState('SENDING_OTP');
    setErrorMsg('');
    trackEvent('otp_send_clicked', { phone: phoneNumber });

    try {
      const res = await api.sendOtp(phoneNumber);
      setAuthState('OTP_SENT');
      playHaptic('light');
      trackEvent('otp_sent_success');
      startCooldown();
      setOtpCode(['', '', '', '', '', '']);
      if (res && res.devOtp) {
        addNotification?.(`OTP Code for verification is: ${res.devOtp}`, 'info');
      } else {
        addNotification?.('Verification OTP code sent to your phone!', 'success');
      }
    } catch (err) {
      setAuthState('OTP_SEND_FAILED');
      setErrorMsg(err.message);
      playHaptic('error');
      trackEvent('otp_sent_failed', { error: err.message });
      addNotification?.(err.message, 'error');
    }
  };

  const handleSendMagicLink = (e) => {
    e.preventDefault();

    if (isOffline) {
      addNotification?.('No Internet Connection. Please reconnect and try again.', 'error');
      return;
    }

    if (!emailAddress || !emailAddress.includes('@') || emailAddress.length < 5) {
      setAuthState('ERROR');
      setErrorMsg('Please enter a valid email address.');
      playHaptic('error');
      return;
    }

    setAuthState('SENDING_OTP');
    setErrorMsg('');
    setTimeout(() => {
      setAuthState('IDLE');
      setMagicLinkSent(true);
      addNotification?.('Magic link sent to your email!', 'success');
      addNotification?.('Simulation active: Click the button below to continue.', 'info');
    }, 1000);
  };

  const handleSimulateMagicClick = () => {
    setAuthState('VERIFYING_OTP');
    setTimeout(() => {
      setAuthState('AUTHENTICATED');
      addNotification?.('Logged in securely via Magic Link!', 'success');
      onLoginSuccess?.({
        name: 'Akash',
        phone: phoneNumber || '+91 98765 43210',
        email: emailAddress || 'akash.fintech@advisor.in',
        pan: 'ABCDE1234F',
        gst: '27AAAAA1111A1Z1',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256'
      });
    }, 900);
  };

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;

    const next = [...otpCode];
    // Take only the last digit entered (handles standard mobile keypress and autofill values)
    next[index] = value.substring(value.length - 1);
    setOtpCode(next);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus?.();
    }

    // Auto verify if all boxes filled
    const fullOtp = next.join('');
    if (fullOtp.length === 6 && !next.some(d => d === '')) {
      executeVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpCode[index] === '' && index > 0) {
        const next = [...otpCode];
        next[index - 1] = '';
        setOtpCode(next);
        otpRefs.current[index - 1]?.focus?.();
      } else {
        const next = [...otpCode];
        next[index] = '';
        setOtpCode(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasteData.length >= 6) {
      const digits = pasteData.substring(0, 6).split('');
      setOtpCode(digits);
      otpRefs.current[5]?.focus?.();
      executeVerifyOtp(pasteData.substring(0, 6));
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    const otp = otpCode.join('');

    if (otp.length < 6) {
      setAuthState('ERROR');
      setErrorMsg('Please enter all 6 digits of the verification code.');
      playHaptic('error');
      return;
    }

    await executeVerifyOtp(otp);
  };

  const executeVerifyOtp = async (otp) => {
    if (isOffline) {
      addNotification?.('No Internet Connection. Please reconnect and try again.', 'error');
      return;
    }

    setAuthState('VERIFYING_OTP');
    setErrorMsg('');
    trackEvent('otp_verify_clicked');

    try {
      const res = await api.verifyOtp(phoneNumber, otp);
      if (res.onboardingRequired) {
        setAuthState('REGISTRATION_REQUIRED');
        trackEvent('registration_started');
        addNotification?.('Welcome! Please complete your profile registration.', 'info');
      } else {
        setAuthState('AUTHENTICATED');
        playHaptic('success');
        trackEvent('otp_verified_success');
        addNotification?.(`Welcome back, ${res.user.name || 'User'}!`, 'success');
        onLoginSuccess?.(res.user);
      }
    } catch (err) {
      setAuthState('OTP_INVALID');
      setErrorMsg(err.message);
      playHaptic('error');
      trackEvent('otp_verified_failed', { error: err.message });
      addNotification?.(err.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();

    if (isOffline) {
      addNotification?.('No Internet Connection. Please reconnect and try again.', 'error');
      return;
    }

    if (!signupName.trim()) {
      setAuthState('ERROR');
      setErrorMsg('Please enter your full name.');
      playHaptic('error');
      return;
    }

    setAuthState('REGISTERING');
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
      setAuthState('AUTHENTICATED');
      playHaptic('success');
      trackEvent('registration_completed', { role: signupRole });
      addNotification?.(`Account successfully created as ${signupRole}!`, 'success');
      onLoginSuccess?.(res.user);
    } catch (err) {
      setAuthState('REGISTRATION_REQUIRED');
      setErrorMsg(err.message);
      playHaptic('error');
      addNotification?.(err.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    if (isOffline) {
      addNotification?.('No Internet Connection. Please reconnect and try again.', 'error');
      return;
    }

    setAuthState('SENDING_OTP');
    setErrorMsg('');
    trackEvent('google_login_started');
    startOAuthWatchdog();

    try {
      const isNative = Capacitor.isNativePlatform() || 
                       !!window.Capacitor || 
                       window.location.protocol === 'capacitor:' || 
                       /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
                        
      const redirectTo = isNative
        ? 'in.blueprintadvisor.app://login-callback'
        : window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          queryParams: isNative ? {
            access_type: 'offline',
            prompt: 'consent'
          } : undefined
        }
      });
      if (error) throw error;

      if (isNative && data?.url) {
        let targetUrl = data.url;
        if (targetUrl.includes('response_type=code')) {
          targetUrl = targetUrl.replace('response_type=code', 'response_type=token');
        }
        await Browser.open({ url: targetUrl, windowName: '_self' });
      }
    } catch (err) {
      clearOAuthWatchdog();
      setAuthState('ERROR');
      setErrorMsg(err.message);
      playHaptic('error');
      trackEvent('google_login_failed', { error: err.message });
      addNotification?.(err.message, 'error');
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

  const isLoading = authState === 'SENDING_OTP' || authState === 'VERIFYING_OTP' || authState === 'REGISTERING';
  const isOtpCodeView = authState === 'OTP_SENT' || authState === 'VERIFYING_OTP' || authState === 'OTP_INVALID';
  const isRegisterView = authState === 'REGISTRATION_REQUIRED' || authState === 'REGISTERING';

  return (
    <div className="screen-shell login-shell animate-fade-in-up">
      <div className="login-topbar">
        <button
          type="button"
          onClick={onCancel}
          className="login-icon-button"
          aria-label="Go back"
          disabled={isLoading}
        >
          <Icon name="back" size={22} />
        </button>

        <div className="login-top-actions">
          <button
            type="button"
            onClick={() => addNotification?.('Support is on the way.', 'info')}
            className="login-help-button"
            disabled={isLoading}
          >
            <Icon name="help" size={18} />
            Need help?
          </button>
        </div>
      </div>

      {isRegisterView ? (
        <div className="login-auth-card animate-scale-in">
          <div className="login-otp-header" style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => {
                setAuthState('IDLE');
                setOtpCode(['', '', '', '', '', '']);
              }}
              className="login-otp-link"
              disabled={isLoading}
            >
              <Icon name="back" size={16} />
              Back to Login
            </button>
            <div className="login-otp-heading">Complete Profile</div>
            <div className="login-otp-copy">Register as a Client, Admin or CA Partner to get started.</div>
          </div>

          <form onSubmit={handleRegister} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="login-field">
              <label className="login-field-label" id="label-signup-name">Full Name</label>
              <div className="login-phone-field">
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="login-text-input"
                  required
                  aria-labelledby="label-signup-name"
                  aria-required="true"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label" id="label-signup-email">Email Address (Optional)</label>
              <div className="login-phone-field">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="login-text-input"
                  aria-labelledby="label-signup-email"
                  disabled={isLoading}
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
                  style={{ flex: 1, fontSize: '0.78rem', height: 48 }}
                  aria-label="Register as Client"
                  disabled={isLoading}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('EXPERT')}
                  className={`login-method-tab ${signupRole === 'EXPERT' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', height: 48 }}
                  aria-label="Register as CA Expert"
                  disabled={isLoading}
                >
                  CA Expert
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('ADMIN')}
                  className={`login-method-tab ${signupRole === 'ADMIN' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', height: 48 }}
                  aria-label="Register as Admin"
                  disabled={isLoading}
                >
                  Admin
                </button>
              </div>
            </div>

            {signupRole === 'EXPERT' && (
              <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="login-field">
                  <label className="login-field-label" id="label-signup-spec">Specialization</label>
                  <div className="login-phone-field">
                    <input
                      type="text"
                      placeholder="e.g. Corporate Auditing, GST returns"
                      value={signupSpec}
                      onChange={(e) => setSignupSpec(e.target.value)}
                      className="login-text-input"
                      required
                      aria-labelledby="label-signup-spec"
                      aria-required="true"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label" id="label-signup-fees">Consultation Fee (Rs.)</label>
                  <div className="login-phone-field">
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={signupFees}
                      onChange={(e) => setSignupFees(e.target.value)}
                      className="login-text-input"
                      required
                      aria-labelledby="label-signup-fees"
                      aria-required="true"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && <div className="login-field-note" style={{ color: '#dc2626', textAlign: 'left' }}>{errorMsg}</div>}

            <button type="submit" className="login-cta" style={{ height: 48 }} disabled={isLoading}>
              {isLoading ? (
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
      ) : !isOtpCodeView && !magicLinkSent ? (
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
                style={{ height: 48 }}
                aria-label="Use phone OTP login method"
                disabled={isLoading}
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
                style={{ height: 48 }}
                aria-label="Use email magic link login method"
                disabled={isLoading}
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

            {loginMethod === 'otp' && !isOtpCodeView ? (
              <form onSubmit={handleSendOtp} className="login-form">
                <div className="login-field">
                  <label className="login-field-label" id="label-phone-input">
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
                      aria-labelledby="label-phone-input"
                      aria-required="true"
                      aria-invalid={authState === 'ERROR' ? 'true' : 'false'}
                      disabled={isLoading}
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
                  style={{ height: 48 }}
                  disabled={isLoading || phoneNumber.length < 10}
                >
                  {isLoading ? (
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
                  <label className="login-field-label" id="label-email-input">
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
                      aria-labelledby="label-email-input"
                      aria-required="true"
                      aria-invalid={authState === 'ERROR' ? 'true' : 'false'}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {errorMsg && <div className="login-field-note" style={{ color: '#dc2626', textAlign: 'left' }}>{errorMsg}</div>}

                <button
                  type="submit"
                  className="login-cta"
                  style={{ height: 48 }}
                  disabled={isLoading || !emailAddress.includes('@')}
                >
                  {isLoading ? (
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
                <button
                  key={brand.label}
                  type="button"
                  className="login-social-btn"
                  style={{ height: 48 }}
                  aria-label={`Log in with ${brand.label}`}
                  onClick={() => {
                    if (brand.label === 'Google') {
                      handleGoogleLogin();
                    } else {
                      setSignupName(brand.label + " User");
                      setAuthState('REGISTRATION_REQUIRED');
                    }
                  }}
                  disabled={isLoading}
                >
                  <SocialBadge {...brand} />
                  {brand.label}
                </button>
              ))}
            </div>

            <div className="login-footer-links">
              By continuing, you agree to our{' '}
              <button
                type="button"
                className="login-link"
                onClick={() => addNotification?.('Terms of Service opened.', 'info')}
                disabled={isLoading}
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="login-link"
                onClick={() => addNotification?.('Privacy Policy opened.', 'info')}
                disabled={isLoading}
              >
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
              <button
                type="button"
                onClick={handleSimulateMagicClick}
                className="login-cta"
                style={{ height: 48 }}
                disabled={isLoading}
              >
                {isLoading ? (
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
              disabled={isLoading}
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
                setAuthState('IDLE');
                setOtpCode(['', '', '', '', '', '']);
              }}
              className="login-otp-link"
              disabled={isLoading}
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
                onPaste={index === 0 ? handlePaste : undefined}
                autocomplete="one-time-code"
                inputmode="numeric"
                aria-label={`OTP Digit ${index + 1}`}
                aria-required="true"
                aria-invalid={authState === 'OTP_INVALID' ? 'true' : 'false'}
                disabled={isLoading}
              />
            ))}
          </div>

          {errorMsg && <div className="login-field-note" style={{ color: '#dc2626' }}>{errorMsg}</div>}

          <button
            type="button"
            onClick={handleVerifyOtp}
            className="login-cta"
            style={{ height: 48 }}
            disabled={isLoading || otpCode.some((digit) => digit === '')}
          >
            {isLoading ? (
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
            disabled={isLoading || cooldown > 0}
            aria-label={cooldown > 0 ? `Resend OTP in ${cooldown} seconds` : 'Resend OTP'}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown} seconds` : "Didn't receive the OTP? Resend OTP"}
          </button>
        </div>
      )}

      {isOffline && (
        <div className="login-offline-overlay animate-fade-in" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 15, 30, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 24,
          textAlign: 'center'
        }}>
          <div className="login-success-card" style={{ maxWidth: 320 }}>
            <div className="login-success-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Icon name="shield" size={30} color="#ef4444" />
            </div>
            <div className="login-success-title" style={{ color: '#ffffff' }}>No Internet Connection</div>
            <div className="login-success-copy" style={{ color: '#94a3b8', marginBottom: 20 }}>
              Please reconnect and try again.
            </div>
            <button
              type="button"
              onClick={() => setIsOffline(!navigator.onLine)}
              className="login-cta"
              style={{ width: '100%', height: 48 }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
