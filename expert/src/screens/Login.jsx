import { useState, useRef, useEffect } from 'react';
import { api } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export default function Login({ onLogin, showNotification }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let oauthHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event (Expert):', event, session?.user?.email);
      if (session?.user && session?.user?.email && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !oauthHandled) {
        oauthHandled = true;
        
        const actualToken = session.access_token || session.accessToken || (session as any)?.access_token;
        if (actualToken) {
          localStorage.setItem('accessToken', actualToken);
        }

        if (Capacitor.isNativePlatform()) {
          await Browser.close().catch(() => {});
        }
        setLoading(true);
        try {
          const res = await api.register({
            phone: session.user.phone || session.user.email || `google-${session.user.id}`,
            name: session.user.user_metadata?.full_name || 'Google Expert',
            email: session.user.email,
            role: 'EXPERT',
            specialization: 'General Tax Consultant',
            fees: 1000
          });

          if (res.token || res.accessToken) {
            localStorage.setItem('accessToken', res.token || res.accessToken);
          }

          showNotification('Logged in successfully via Google!', 'success');
          onLogin(res.token || actualToken, res.user);
        } catch (err: any) {
          showNotification(err.message || 'OAuth Sync failed.', 'error');
          oauthHandled = false;
        } finally {
          setLoading(false);
        }
      }
    });

    // Handle deep link callback from OAuth on Android
    let appUrlListener;
    if (Capacitor.isNativePlatform()) {
      appUrlListener = App.addListener('appUrlOpen', async ({ url }) => {
        console.log('App URL opened (Expert):', url);
        if (url.startsWith('com.blueprint.expert://') || url.includes('login-callback')) {
          await Browser.close().catch(() => {});
          setLoading(true);
          
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) {
            console.warn('OAuth exchange error, attempting fragment parse (Expert):', error.message);
            const urlObj = new URL(url.replace('com.blueprint.expert://', 'https://localhost/'));
            const params = new URLSearchParams(urlObj.hash.substring(1) || urlObj.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              localStorage.setItem('accessToken', accessToken);
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (setSessionError) {
                console.error('setSession fallback error (Expert):', setSessionError.message);
                showNotification(setSessionError.message, 'error');
                setLoading(false);
              }
            } else {
              showNotification(error.message, 'error');
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? 'com.blueprint.expert://login-callback'
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
    } catch (err: any) {
      showNotification(err.message || 'Google Auth failed.', 'error');
      setLoading(false);
    }
  };

  // Onboarding States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupSpec, setSignupSpec] = useState('');
  const [signupFees, setSignupFees] = useState('1000');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return showNotification('Please enter a valid 10-digit number', 'error');
    
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      setStep(2);
      if (res && res.devOtp) {
        showNotification(`OTP Code for verification is: ${res.devOtp}`, 'info');
      } else {
        showNotification('OTP sent successfully', 'success');
      }
    } catch (err) {
      showNotification('Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return showNotification('Please enter complete OTP', 'error');

    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otpValue);
      if (res.onboardingRequired) {
        setStep(3);
        showNotification('Complete your expert profile registration', 'info');
      } else if (res.user?.role !== 'EXPERT') {
        showNotification('Unauthorized. Only experts can login here.', 'error');
        setLoading(false);
        return;
      } else {
        onLogin(res.token, res.user);
      }
    } catch (err) {
      showNotification('Invalid OTP. Please try again.', 'error');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupSpec.trim()) {
      return showNotification('Please fill in all required fields.', 'error');
    }

    setLoading(true);
    try {
      const res = await api.register({
        phone,
        name: signupName,
        email: signupEmail || undefined,
        role: 'EXPERT',
        specialization: signupSpec,
        fees: signupFees
      });
      showNotification('Expert registered and logged in successfully!', 'success');
      onLogin(res.token, res.user);
    } catch (err) {
      showNotification(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', background: 'white' }}>
      {step === 1 ? (
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Blueprint Expert</h1>
            <p style={{ color: 'var(--text-muted)' }}>CA Partner Portal</p>
          </div>

          <form onSubmit={handleSendOtp} className="flex-col gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Phone Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ 
                  padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', 
                  borderRadius: '12px', display: 'flex', alignItems: 'center', fontWeight: 600
                }}>
                  +91
                </div>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Enter mobile number" 
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <div style={{ padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>or continue with</div>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f1f5f9', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Google Sign In
          </button>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Test number: 8888888881
          </div>
        </div>
      ) : step === 2 ? (
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <button 
            onClick={() => setStep(1)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginBottom: '24px', cursor: 'pointer' }}
          >
            ← Back
          </button>
          
          <h2 style={{ marginBottom: '8px' }}>Enter Verification Code</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Code sent to +91 {phone.slice(0, 2)}XXXXXX{phone.slice(-2)}
          </p>

          <form onSubmit={handleVerifyOtp} className="flex-col gap-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: '45px', height: '55px', textAlign: 'center', fontSize: '1.5rem',
                    border: '1px solid var(--border-light)', borderRadius: '12px', outline: 'none'
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '24px' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Didn't receive code? </span>
            <button 
              onClick={handleSendOtp}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Test code: 123456
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <button 
            onClick={() => setStep(2)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginBottom: '24px', cursor: 'pointer' }}
          >
            ← Back
          </button>
          
          <h2 style={{ marginBottom: '8px' }}>CA Partner Registration</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Complete your profile to start receiving clients.
          </p>

          <form onSubmit={handleRegister} className="flex-col gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter full name" 
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address (Optional)</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@expert.in" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Specialization</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. GST Registration, Corporate Taxation" 
                value={signupSpec}
                onChange={(e) => setSignupSpec(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Consultation Fee (Rs.)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 1500" 
                value={signupFees}
                onChange={(e) => setSignupFees(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '24px' }}
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete & Login'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
