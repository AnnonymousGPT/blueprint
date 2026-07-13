import { useEffect, useMemo, useState, useRef } from 'react';
import { api } from '../services/apiService';
import Confetti from '../components/Confetti';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', type: 'upi' },
  { id: 'phonepe', name: 'PhonePe', type: 'upi' },
  { id: 'card', name: 'Credit / Debit Card', type: 'card' },
  { id: 'netbank', name: 'Net Banking', type: 'netbank' }
];

const popularBanks = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' }
];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function Icon({ name, size = 20, strokeWidth = 2.2, color = 'currentColor' }) {
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
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v5c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-3Z" />
          <path d="m9.5 12.5 2 2 3.5-4" />
        </svg>
      );
    case 'doc':
      return (
        <svg {...common}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
          <path d="M14 2v5h5" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case 'video':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="11" height="10" rx="2" />
          <path d="m14 10 5-3v10l-5-3z" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <path d="m13 2-7 9h5l-1 11 7-9h-5z" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
          <path d="M14 2v5h5" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6" />
          <path d="M12 7h.01" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m20 6-11 11-5-5" />
        </svg>
      );
    case 'cross':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Payment({ bookingData, onBackToBooking, onPaymentSuccess, addNotification }) {
  // Payment states: REVIEW | PENDING | SUCCESS | FAILED
  const [paymentState, setPaymentState] = useState('REVIEW');
  const [selectedMethod, setSelectedMethod] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [loading, setLoading] = useState(true);
  const [txnDetails, setTxnDetails] = useState(null);
  const [failureReason, setFailureReason] = useState('');
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Form input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [upiId, setUpiId] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);

  const [bankOtp, setBankOtp] = useState('');
  const [gatewayStatusText, setGatewayStatusText] = useState('');
  
  // Timers and preventions
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const transactionTimeoutRef = useRef(null);
  const hasClickedPayRef = useRef(false);

  const expert = bookingData?.expert;
  const bookingSummary = bookingData?.bookingSummary || {};
  const serviceName = bookingData?.serviceName || 'Review & Pay';
  const consultationFee = expert?.fees ?? 1500;
  const platformFee = 299;
  const gstAmount = 88;
  const totalAmount = consultationFee + platformFee + gstAmount;

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
    } catch (e) {
      console.warn('Haptics skipped:', e);
    }
  };

  // Analytics helper
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  // Listen to network changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Loading Skeleton Shimmer
    const loaderTimer = setTimeout(() => setLoading(false), 600);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(loaderTimer);
      if (transactionTimeoutRef.current) clearInterval(transactionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    trackEvent('payment_screen_viewed');
  }, []);

  // Timer logic for pending transactions
  const startTransactionTimeout = () => {
    setTimeoutSeconds(60);
    if (transactionTimeoutRef.current) clearInterval(transactionTimeoutRef.current);
    transactionTimeoutRef.current = setInterval(() => {
      setTimeoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(transactionTimeoutRef.current);
          handlePaymentFailure('Transaction Timeout. Awaiting authorization took too long.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTransactionTimeout = () => {
    if (transactionTimeoutRef.current) {
      clearInterval(transactionTimeoutRef.current);
      transactionTimeoutRef.current = null;
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    const clean = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    setCardNumber(parts.length > 0 ? parts.join(' ') : clean);
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value;
    const clean = value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (clean.length >= 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      addNotification?.('Enter a valid UPI ID (e.g. name@upi)', 'error');
      return;
    }
    playHaptic('light');
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setUpiVerified(true);
      addNotification?.(`UPI ID Verified: Akash Kumar`, 'success');
    }, 900);
  };

  const handlePay = () => {
    if (isOffline) {
      addNotification?.('No Internet Connection. Reconnect to process payment.', 'error');
      return;
    }

    if (hasClickedPayRef.current) return; // Prevent double payment clicks

    // Validation checks
    if (selectedMethod === 'Credit / Debit Card') {
      if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder.trim()) {
        addNotification?.('Please fill out card details completely.', 'error');
        return;
      }
    } else if (selectedMethod !== 'Google Pay' && selectedMethod !== 'Net Banking' && !upiVerified) {
      addNotification?.('Please verify your UPI ID first.', 'error');
      return;
    }

    hasClickedPayRef.current = true;
    playHaptic('light');
    trackEvent('payment_initiated', { method: selectedMethod });

    setPaymentState('PENDING');
    setGatewayStatusText('Establishing secure transaction channels...');
    startTransactionTimeout();

    setTimeout(() => {
      setGatewayStatusText('Requesting authorization from bank...');
      if (selectedMethod === 'Credit / Debit Card') {
        addNotification?.('Secure code OTP sent. Code is 123456.', 'info');
      } else if (selectedMethod === 'Google Pay' || selectedMethod === 'PhonePe') {
        addNotification?.('Awaiting approval in payment app...', 'info');
      } else if (selectedMethod === 'Net Banking') {
        addNotification?.('Redirecting to secure bank portal...', 'info');
      }
    }, 1200);
  };

  const handlePaymentFailure = (reason) => {
    clearTransactionTimeout();
    hasClickedPayRef.current = false;
    setFailureReason(reason);
    setPaymentState('FAILED');
    playHaptic('error');
    trackEvent('payment_failed', { reason });
  };

  const completePayment = async () => {
    clearTransactionTimeout();
    setGatewayStatusText('Finalising secure transaction booking...');
    try {
      const res = await api.processPayment(totalAmount, selectedMethod, bookingData?.id);
      setTxnDetails(res);
      setPaymentState('SUCCESS');
      playHaptic('success');
      trackEvent('payment_success', { transactionId: res.transactionId });
    } catch (err) {
      handlePaymentFailure(err.message || 'Payment processing failed.');
    }
  };

  const handleVerifyOtp = () => {
    if (bankOtp !== '123456') {
      addNotification?.('Invalid OTP code. Please enter 123456.', 'error');
      return;
    }
    completePayment();
  };

  const handleRetry = () => {
    playHaptic('light');
    trackEvent('payment_retried');
    setPaymentState('REVIEW');
    setBankOtp('');
    hasClickedPayRef.current = false;
  };

  const requiredDocs = useMemo(() => {
    const summaryText = `${serviceName} ${(bookingSummary.details || []).join(' ')}`.toLowerCase();
    if (summaryText.includes('gst') || summaryText.includes('business')) {
      return [
        { title: 'PAN Card', subtitle: 'Clear copy of PAN card' },
        { title: 'Aadhaar Card', subtitle: 'Front & back side' },
        { title: 'Business Proof', subtitle: 'Utility bill, registration or incorporation doc' }
      ];
    }
    return [
      { title: 'PAN Card', subtitle: 'Clear copy of PAN card' },
      { title: 'Aadhaar Card', subtitle: 'Front & back side' },
      { title: 'Form 16 / Salary Slips', subtitle: 'Latest salary slip proof' }
    ];
  }, [bookingSummary.details, serviceName]);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="screen-shell" style={{ paddingInline: '8px', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, marginTop: 4 }}>
          <div className="skeleton-container animate-pulse-slow" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="skeleton-container animate-pulse-slow" style={{ width: 120, height: 24, borderRadius: 6 }} />
          <div className="skeleton-container animate-pulse-slow" style={{ width: 75, height: 30, borderRadius: 15 }} />
        </div>
        <div className="skeleton-container animate-pulse-slow" style={{ height: 110, borderRadius: 16, width: '100%' }} />
        <div className="skeleton-container animate-pulse-slow" style={{ height: 75, borderRadius: 14 }} />
        <div className="skeleton-container animate-pulse-slow" style={{ height: 100, borderRadius: 14 }} />
      </div>
    );
  }

  // State: SUCCESS Screen view
  if (paymentState === 'SUCCESS') {
    return (
      <div className="screen-shell payment-success-shell animate-scale-in">
        <Confetti active={true} />

        <div className="payment-success-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <Icon name="check" size={34} color="#16a34a" />
        </div>

        <h3 className="payment-success-title" style={{ color: 'var(--text-primary)' }}>Payment Confirmed!</h3>
        <p className="payment-success-copy" style={{ color: 'var(--text-secondary)' }}>
          Your appointment is booked with <strong>{expert?.name || 'Chartered Accountant'}</strong>. A GST invoice email is dispatched.
        </p>

        <div className="payment-success-card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="payment-success-row">
            <span style={{ color: 'var(--text-secondary)' }}>Invoice ID</span>
            <strong style={{ color: 'var(--text-primary)' }}>INV-{txnDetails?.transactionId?.slice(-6)?.toUpperCase() || '883921'}</strong>
          </div>
          <div className="payment-success-row">
            <span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
            <strong style={{ color: '#16a34a' }}>{formatMoney(totalAmount)} (GST Inc.)</strong>
          </div>
          <div className="payment-success-row">
            <span style={{ color: 'var(--text-secondary)' }}>Date & Slot</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {bookingData?.date} · {bookingData?.slot || '11:00 AM'}
            </strong>
          </div>
          <div className="payment-success-row">
            <span style={{ color: 'var(--text-secondary)' }}>Channel Mode</span>
            <strong style={{ color: 'var(--text-primary)' }}>{bookingData?.type}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playHaptic();
            onPaymentSuccess(txnDetails);
          }}
          className="payment-success-cta"
        >
          Begin Document Upload
        </button>
      </div>
    );
  }

  // State: FAILED Screen view
  if (paymentState === 'FAILED') {
    return (
      <div className="screen-shell payment-success-shell animate-scale-in" style={{ justifyContent: 'center' }}>
        <div className="payment-success-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <Icon name="cross" size={34} color="#dc2626" />
        </div>

        <h3 className="payment-success-title" style={{ color: 'var(--text-primary)' }}>Payment Failed</h3>
        <p className="payment-success-copy" style={{ color: 'var(--text-secondary)' }}>
          Reason: <strong style={{ color: '#dc2626' }}>{failureReason}</strong>
        </p>

        <div className="payment-success-card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', padding: 16, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.45 }}>
          If money was debited, it will be automatically refunded to your account within 3 business days.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button
            type="button"
            onClick={handleRetry}
            className="payment-success-cta"
            style={{ width: '100%', minHeight: 48 }}
          >
            Retry Payment
          </button>
          <button
            type="button"
            onClick={() => {
              playHaptic('light');
              onBackToBooking();
            }}
            className="payment-success-cta"
            style={{ width: '100%', minHeight: 48, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            Cancel &amp; Return
          </button>
        </div>
      </div>
    );
  }

  // State: PENDING Screen view
  if (paymentState === 'PENDING') {
    return (
      <div className="screen-shell payment-success-shell animate-scale-in" style={{ justifyContent: 'center' }}>
        <div className="payment-gateway-card" style={{ background: 'var(--bg-card)', border: 'none', boxShadow: 'none' }}>
          <div className="payment-gateway-loading" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="spinner-circle payment-spinner" style={{ margin: '0 auto' }} />
            <div>
              <h4 className="payment-gateway-title" style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>Processing Transaction</h4>
              <p className="payment-gateway-copy" style={{ color: 'var(--text-secondary)' }}>{gatewayStatusText}</p>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Transaction expires in {timeoutSeconds}s
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 20, paddingTop: 16, width: '100%' }}>
            {selectedMethod === 'Credit / Debit Card' ? (
              <div className="payment-auth-block" style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 8 }} id="label-otp-enter">Enter Code</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="password"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={bankOtp}
                    onChange={(e) => setBankOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    aria-labelledby="label-otp-enter"
                    aria-required="true"
                    inputmode="numeric"
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.86rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="btn btn-primary"
                    style={{ padding: '0 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800 }}
                  >
                    Verify
                  </button>
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                  Demo secure code: <strong style={{ color: 'var(--text-primary)' }}>123456</strong>
                </div>
              </div>
            ) : (
              <div className="payment-auth-block" style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                  A secure request has been sent to your <strong>{selectedMethod}</strong> handle. Approve the payment request of {formatMoney(totalAmount)}.
                </p>
                <button
                  type="button"
                  onClick={completePayment}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: 48, borderRadius: 10, fontSize: '0.82rem', fontWeight: 800 }}
                >
                  Simulate UPI Approval
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handlePaymentFailure('Transaction cancelled by user.')}
            className="payment-auth-cancel"
            style={{ marginTop: 24, width: '100%' }}
          >
            Cancel Payment
          </button>
        </div>
      </div>
    );
  }

  // State: Default REVIEW Screen view
  return (
    <div className="screen-shell payment-shell animate-fade-in-up">
      {/* Header bar controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => {
            playHaptic('light');
            trackEvent('payment_cancelled');
            onBackToBooking();
          }}
          aria-label="Go back to booking"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Icon name="back" size={20} color="var(--text-primary)" />
        </button>

        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
          Review & Pay
        </h2>

        <div style={{
          borderRadius: 999,
          padding: '6px 12px',
          border: '1px solid rgba(16,185,129,0.3)',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          fontSize: '0.68rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap'
        }}>
          🔒 Secure
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box'
        }} role="alert">
          <Icon name="info" size={16} color="#ef4444" />
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
            Offline Mode — Check network connection to continue.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        
        {/* Booking details card */}
        <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {serviceName.includes('ITR') ? 'Individual ITR Filing' : serviceName.includes('GST') ? 'GST Return filing' : 'Corporate Reg'}
            </div>
            <button 
              type="button" 
              onClick={() => {
                playHaptic('light');
                onBackToBooking();
              }} 
              style={{ border: 'none', background: 'transparent', color: '#10b981', fontSize: '0.78rem', fontWeight: 800, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Edit
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
              <img src={expert?.photo} alt={expert?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {expert?.name}
                <span style={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5rem',
                  fontWeight: 900
                }}>✓</span>
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expert?.specialization}</div>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#eab308', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
              ★ <span>{expert?.rating || '4.9'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              📅 {bookingData?.date || 'Thu, 18 May 2025'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              🕒 {bookingData?.slot || '11:00 AM'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-variant)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              📹 {bookingData?.type || 'Video Call'}
            </span>
          </div>
        </div>

        {/* Required Documents Card */}
        <div className="card" style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>REQUIRED DOCUMENTS</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {requiredDocs.map((doc) => (
              <span key={doc.title} style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 999, backgroundColor: 'var(--bg-card)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                📄 {doc.title}
              </span>
            ))}
          </div>
        </div>

        {/* Price Breakdown Card */}
        <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.3px' }}>Price Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>CA Advisor Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(consultationFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>Advisory Platform Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(platformFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>Integrated GST (18%)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(gstAmount)}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              <span>Total Payable</span>
              <span style={{ color: '#10b981' }}>{formatMoney(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment mode selector details */}
        <div className="card" style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.3px' }}>Select Payment Mode</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {paymentMethods.map((method) => {
              const active = selectedMethod === method.name;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    playHaptic('light');
                    setSelectedMethod(method.name);
                    trackEvent('payment_method_selected', { method: method.name });
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: active ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                    background: active ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                    color: active ? '#10b981' : 'var(--text-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 40
                  }}
                >
                  <span style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: active ? '#10b981' : 'transparent',
                    border: active ? 'none' : '1px solid var(--text-secondary)'
                  }} />
                  {method.name}
                </button>
              );
            })}
          </div>

          {/* Conditional field render for Net Banking */}
          {selectedMethod === 'Net Banking' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 4 }} id="label-bank-select">Choose Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                aria-labelledby="label-bank-select"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  minHeight: 44
                }}
              >
                {popularBanks.map((bank) => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional field render for Cards */}
          {selectedMethod === 'Credit / Debit Card' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                aria-label="Cardholder Name"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.76rem', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                maxLength="19"
                placeholder="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                aria-label="Card Number"
                inputmode="numeric"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.76rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  maxLength="5"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  aria-label="Card Expiration Date"
                  inputmode="numeric"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.76rem', boxSizing: 'border-box' }}
                />
                <input
                  type="password"
                  maxLength="3"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  aria-label="Security CVV Code"
                  inputmode="numeric"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.76rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* Conditional field render for non-automatic UPI handles */}
          {selectedMethod !== 'Credit / Debit Card' && selectedMethod !== 'Google Pay' && selectedMethod !== 'Net Banking' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="UPI ID (e.g. name@upi)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setUpiVerified(false);
                  }}
                  aria-label="UPI Identification Address"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.76rem', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyUpi}
                  disabled={isVerifyingUpi}
                  style={{
                    padding: '0 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: upiVerified ? 'rgba(16, 185, 129, 0.08)' : 'var(--primary)',
                    color: upiVerified ? '#10b981' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: 75
                  }}
                >
                  {isVerifyingUpi ? '...' : upiVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
              {upiVerified && (
                <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>Linked to Akash Kumar</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Pay Trigger bottom bar */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 'calc(10px + env(safe-area-inset-bottom))',
          zIndex: 20
        }}
      >
        <button
          type="button"
          onClick={handlePay}
          disabled={isOffline}
          style={{
            width: '100%',
            minHeight: 52,
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 800,
            backgroundColor: isOffline ? 'var(--text-tertiary)' : 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: 'var(--shadow-lg)',
            cursor: isOffline ? 'not-allowed' : 'pointer'
          }}
          aria-label={`Confirm payment of ${formatMoney(totalAmount)}`}
        >
          <span>{isOffline ? 'Offline' : `Pay ${formatMoney(totalAmount)}`}</span>
          {!isOffline && <Icon name="arrow" size={18} color="#ffffff" />}
        </button>
      </div>
    </div>
  );
}
