import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/apiService';
import Confetti from '../components/Confetti';

const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', type: 'upi' },
  { id: 'phonepe', name: 'PhonePe', type: 'upi' },
  { id: 'paytm', name: 'Paytm Wallet', type: 'upi' },
  { id: 'card', name: 'Credit / Debit Card', type: 'card' }
];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatReviewCount(count = 0) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k reviews`;
  }
  return `${count} reviews`;
}

function compactExperience(text = '') {
  return text.replace('Years', 'Yrs').replace('Exp', 'Exp');
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
    case 'edit':
      return (
        <svg {...common}>
          <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />
          <path d="m14 6 3 3" />
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
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m20 6-11 11-5-5" />
        </svg>
      );
    default:
      return null;
  }
}

function PaymentDetailRow({ icon, label, value, onClick }) {
  return (
    <button type="button" className="payment-detail-row" onClick={onClick}>
      <span className="payment-detail-icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="payment-detail-copy">
        <span className="payment-detail-label">{label}</span>
      </span>
      <span className="payment-detail-value">{value}</span>
      <span className="payment-detail-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

function PaymentDocItem({ title, subtitle }) {
  return (
    <div className="payment-doc-item">
      <span className="payment-doc-icon">
        <Icon name="doc" size={18} color="#16a34a" />
      </span>
      <div className="payment-doc-copy">
        <div className="payment-doc-title">{title}</div>
        <div className="payment-doc-subtitle">{subtitle}</div>
      </div>
      <span className="payment-doc-badge">Required</span>
    </div>
  );
}

function PaymentPill({ icon, children, tone = 'neutral' }) {
  return (
    <span className={`payment-pill ${tone === 'success' ? 'success' : ''}`}>
      {icon && <Icon name={icon} size={14} color={tone === 'success' ? '#16a34a' : 'currentColor'} />}
      {children}
    </span>
  );
}

export default function Payment({ bookingData, onBackToBooking, onPaymentSuccess, addNotification }) {
  const [selectedMethod, setSelectedMethod] = useState('Google Pay');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);
  const [companyGst, setCompanyGst] = useState('');
  const [isCorporate, setIsCorporate] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [upiId, setUpiId] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [qrSeconds, setQrSeconds] = useState(179);

  const [gatewayStep, setGatewayStep] = useState(0); // 0 idle, 1 handshake, 2 contacting, 3 auth, 4 verifying
  const [bankOtp, setBankOtp] = useState('');
  const [gatewayStatusText, setGatewayStatusText] = useState('');

  const expert = bookingData?.expert;
  const bookingSummary = bookingData?.bookingSummary || {};
  const serviceName = bookingData?.serviceName || 'Review & Pay';
  const consultationFee = expert?.fees ?? 1500;
  const platformFee = 299;
  const gstAmount = 88;
  const totalAmount = consultationFee + platformFee + gstAmount;

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
      { title: 'Form 16 / Salary Slips', subtitle: 'Latest Form 16 or salary slips' }
    ];
  }, [bookingSummary.details, serviceName]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.app-content');
    scrollContainer?.scrollTo?.(0, 0);
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo?.(0, 0);
  }, []);

  useEffect(() => {
    if (!showMoreOptions || selectedMethod === 'Credit / Debit Card') return undefined;

    const timer = setInterval(() => {
      setQrSeconds((seconds) => (seconds > 0 ? seconds - 1 : 179));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedMethod, showMoreOptions]);

  const formatQrTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    const clean = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let index = 0; index < clean.length; index += 4) {
      parts.push(clean.substring(index, index + 4));
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

  const userProfileName = () => 'Akash Kumar';

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      addNotification?.('Please enter a valid UPI ID format (e.g. name@upi)', 'error');
      return;
    }

    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setUpiVerified(true);
      addNotification?.(`UPI ID verified successfully: ${userProfileName()}`, 'success');
    }, 1200);
  };

  const completeVerification = async () => {
    setGatewayStep(4);
    setGatewayStatusText('Authenticating token signature and finalising transaction...');
    setLoading(true);

    try {
      const res = await api.processPayment(totalAmount, selectedMethod, bookingData?.id);
      setTxnDetails(res);

      setTimeout(() => {
        setSuccess(true);
        setGatewayStep(0);
        addNotification?.('Payment successful! GST invoice generated.', 'success');
      }, 900);
    } catch (err) {
      addNotification?.(err.message, 'error');
      setGatewayStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (showMoreOptions) {
      if (selectedMethod === 'Credit / Debit Card') {
        if (cardNumber.length < 19) {
          addNotification?.('Please enter a valid 16-digit card number.', 'error');
          return;
        }
        if (cardExpiry.length < 5) {
          addNotification?.('Please enter card expiry date in MM/YY format.', 'error');
          return;
        }
        if (cardCvv.length < 3) {
          addNotification?.('Please enter a valid 3-digit CVV code.', 'error');
          return;
        }
        if (!cardHolder.trim()) {
          addNotification?.('Please enter the cardholder name.', 'error');
          return;
        }
      } else if (upiId && !upiVerified) {
        addNotification?.('Please verify your UPI ID before making payment.', 'error');
        return;
      }
    }

    setGatewayStep(1);
    setGatewayStatusText('Establishing secure payment gateway...');

    setTimeout(() => {
      setGatewayStep(2);
      setGatewayStatusText('Contacting banking authorization nodes...');

      setTimeout(() => {
        setGatewayStep(3);
        setGatewayStatusText('Awaiting customer verification...');

        if (selectedMethod === 'Credit / Debit Card') {
          addNotification?.('Sandbox OTP sent. Use 123456.', 'info');
        } else {
          addNotification?.('Payment request sent to UPI app. Approve there.', 'info');
        }
      }, 1200);
    }, 900);
  };

  const handleVerifyOtp = () => {
    if (bankOtp !== '123456') {
      addNotification?.('Invalid secure code. Please enter: 123456', 'error');
      return;
    }
    completeVerification();
  };

  const handleSimulateUpiApprove = () => {
    completeVerification();
  };

  if (success) {
    return (
      <div className="screen-shell payment-success-shell animate-scale-in">
        <Confetti active={success} />

        <div className="payment-success-badge">
          <Icon name="check" size={34} color="#16a34a" />
        </div>

        <h3 className="payment-success-title">Payment confirmed!</h3>
        <p className="payment-success-copy">
          Your appointment is booked with <strong>{expert?.name}</strong>. A GST invoice has been emailed to you.
        </p>

        <div className="payment-success-card">
          <div className="payment-success-row">
            <span>Invoice Number</span>
            <strong>INV-{txnDetails?.transactionId?.slice(-6)?.toUpperCase() || '883921'}</strong>
          </div>
          <div className="payment-success-row">
            <span>Amount Paid</span>
            <strong className="success-amount">{formatMoney(totalAmount)} (GST Inc.)</strong>
          </div>
          <div className="payment-success-row">
            <span>Date & Slot</span>
            <strong>
              {bookingData?.date} · {bookingData?.slot}
            </strong>
          </div>
          <div className="payment-success-row">
            <span>Mode</span>
            <strong>{bookingData?.type}</strong>
          </div>
          {isCorporate && companyGst && (
            <div className="payment-success-row corporate">
              <span>GSTIN Credited</span>
              <strong>{companyGst.toUpperCase()}</strong>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPaymentSuccess(txnDetails)}
          className="payment-success-cta"
        >
          Begin Document Upload
        </button>
      </div>
    );
  }

  const summaryRows = [
    { icon: 'calendar', label: 'Date', value: bookingData?.date || 'Thu, 18 May 2025' },
    { icon: 'clock', label: 'Time', value: bookingData?.slot || '11:00 AM' },
    { icon: 'video', label: 'Mode', value: bookingData?.type || 'Video Call' },
    { icon: 'user', label: 'For', value: bookingSummary?.entityType || 'Individual' },
    { icon: 'bolt', label: 'When', value: bookingSummary?.urgency || 'Urgent' },
    {
      icon: 'file',
      label: 'Additional Details',
      value: (bookingSummary?.details || []).length ? bookingSummary.details.join(', ') : 'Salary, Bank Statement'
    }
  ];

  const reviewPills = [
    { icon: 'check', label: 'Match 95%', tone: 'success' },
    { icon: 'clock', label: '24 Hours' },
    { icon: null, label: 'From ₹999' }
  ];

  return (
    <div className="screen-shell payment-shell animate-fade-in-up">
      {gatewayStep > 0 && (
        <div className="payment-gateway-overlay">
          <div className="payment-gateway-card">
            {gatewayStep !== 3 ? (
              <div className="payment-gateway-loading">
                <div className="spinner-circle payment-spinner" />
                <div>
                  <h4 className="payment-gateway-title">Securing Transaction</h4>
                  <p className="payment-gateway-copy">{gatewayStatusText}</p>
                </div>
              </div>
            ) : (
              <div className="payment-gateway-auth animate-scale-in">
                <div className="payment-gateway-badge">
                  <Icon name="shield" size={16} color="#2563eb" />
                  <span>Razorpay Secure Gateway</span>
                </div>

                {selectedMethod === 'Credit / Debit Card' ? (
                  <div className="payment-auth-block">
                    <h4 className="payment-auth-title">Enter secure OTP code</h4>
                    <p className="payment-auth-copy">
                      We have sent a 6-digit transaction authorization code to your registered mobile number.
                    </p>

                    <div className="payment-sandbox-note">
                      Sandbox code: <strong>123456</strong>
                    </div>

                    <input
                      type="password"
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={bankOtp}
                      onChange={(e) => setBankOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="payment-auth-input"
                    />

                    <button type="button" onClick={handleVerifyOtp} className="payment-auth-button">
                      Verify & Authorize
                    </button>
                  </div>
                ) : (
                  <div className="payment-auth-block">
                    <h4 className="payment-auth-title">Awaiting mobile approval</h4>
                    <p className="payment-auth-copy">
                      Open your <strong>{selectedMethod}</strong> app and approve the pending collect request of{' '}
                      <strong>{formatMoney(totalAmount)}</strong>.
                    </p>

                    <div className="payment-auth-wait">
                      <div className="spinner-circle payment-spinner-small" />
                      <span>Awaiting approval trigger...</span>
                    </div>

                    <button type="button" onClick={handleSimulateUpiApprove} className="payment-auth-button success">
                      Simulate App Approval
                    </button>
                  </div>
                )}

                <button type="button" onClick={() => setGatewayStep(0)} className="payment-auth-cancel">
                  Cancel Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', marginBottom: 4 }}>
        <button
          type="button"
          onClick={onBackToBooking}
          aria-label="Go back to booking"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
          Review & Pay
        </h2>

        <div style={{
          borderRadius: 999,
          padding: '6px 12px',
          border: '1px solid rgba(16,185,129,0.3)',
          background: '#e6fcf5',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        
        {/* Booking & Expert Summary Card */}
        <div className="card" style={{ padding: 12, background: '#ffffff', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {serviceName.includes('ITR') ? 'Individual ITR Filing' : 'GST Filing'}
            </div>
            <button 
              type="button" 
              onClick={onBackToBooking} 
              style={{ border: 'none', background: 'transparent', color: '#10b981', fontSize: '0.78rem', fontWeight: 800, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Edit
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 8 }}>
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
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              📅 {bookingData?.date || 'Thu, 18 May 2025'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              🕒 {bookingData?.slot || '11:00 AM'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              📹 {bookingData?.type || 'Video Call'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              👤 {bookingSummary?.entityType || 'Individual'}
            </span>
          </div>
        </div>

        {/* Required Documents Card */}
        <div className="card" style={{ padding: 10, background: '#ffffff', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>REQUIRED DOCUMENTS</span>
            <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
              🔒 100% Safe
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {requiredDocs.map((doc) => (
              <span key={doc.title} style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 999, backgroundColor: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                📄 {doc.title}
              </span>
            ))}
          </div>
        </div>

        {/* Price Details Card */}
        <div className="card" style={{ padding: 12, background: '#ffffff', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.3px' }}>Price Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>Expert Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(consultationFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>Platform Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(platformFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>GST (18%)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatMoney(gstAmount)}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              <span>Total Payable</span>
              <span style={{ color: '#10b981' }}>{formatMoney(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Mode Selector Card */}
        <div className="card" style={{ padding: 12, background: '#ffffff', borderRadius: 14, borderColor: 'var(--border-color)' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.3px' }}>Select Payment Mode</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {paymentMethods.map((method) => {
              const active = selectedMethod === method.name;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(method.name);
                    setShowMoreOptions(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: active ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                    background: active ? 'rgba(16, 185, 129, 0.05)' : '#ffffff',
                    color: active ? '#10b981' : 'var(--text-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
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

          {/* Inline fields if Card is chosen */}
          {selectedMethod === 'Credit / Debit Card' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.72rem' }}
              />
              <input
                type="text"
                maxLength="19"
                placeholder="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.72rem', fontFamily: 'monospace' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  maxLength="5"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.72rem' }}
                />
                <input
                  type="password"
                  maxLength="3"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.72rem' }}
                />
              </div>
            </div>
          )}

          {/* Inline fields if UPI option is chosen and is not Google Pay */}
          {selectedMethod !== 'Credit / Debit Card' && selectedMethod !== 'Google Pay' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="UPI ID (e.g. name@upi)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setUpiVerified(false);
                  }}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.72rem' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyUpi}
                  disabled={isVerifyingUpi}
                  style={{
                    padding: '0 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: upiVerified ? '#e6fcf5' : 'var(--primary)',
                    color: upiVerified ? '#10b981' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isVerifyingUpi ? '...' : upiVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
              {upiVerified && (
                <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>Linked to {userProfileName()}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Pay Button */}
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
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 52,
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 800,
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer'
          }}
        >
          <span>{loading ? 'Processing...' : `Pay ${formatMoney(totalAmount)}`}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
