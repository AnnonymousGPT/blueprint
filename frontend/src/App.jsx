import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import './App.css';
import { Haptics, NotificationType } from '@capacitor/haptics';

// Import Screens
import Login from './screens/Login';
import Home from './screens/Home';
import Wizard from './screens/Wizard';
import Booking from './screens/Booking';
import Payment from './screens/Payment';
import Tracking from './screens/Tracking';
import Documents from './screens/Documents';
import Profile from './screens/Profile';
import Splash from './screens/Splash';
import ExpertDashboard from './screens/ExpertDashboard';
import ExpertCases from './screens/ExpertCases';
import ExpertCaseDetail from './screens/ExpertCaseDetail';
import ExpertCalendar from './screens/ExpertCalendar';
import ExpertProfile from './screens/ExpertProfile';
import ChatBox from './components/ChatBox';

// Import Components
import StatusBar from './components/StatusBar';
import BottomBar from './components/BottomBar';
import Notification from './components/Notification';
import Skeleton from './components/Skeleton';

// Import Static Initial Data
import { 
  initialDocuments,
  api
} from './services/apiService';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // Navigation & Wizard states
  const [activeTab, setActiveTab] = useState('home'); // home, requests, documents, profile
  const [expertActiveTab, setExpertActiveTab] = useState('dashboard'); // dashboard, cases, calendar, profile
  const [selectedExpertRequest, setSelectedExpertRequest] = useState(null); // expert case drill-down detail
  const [activeChatClientUserId, setActiveChatClientUserId] = useState(null); // client chat drawer overlay
  const [activeWizardConfig, setActiveWizardConfig] = useState(null); // when not null, shows Wizard screen
  const [bookingData, setBookingData] = useState(() => {
    try {
      const saved = localStorage.getItem('app_booking_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [paymentData, setPaymentData] = useState(() => {
    try {
      const saved = localStorage.getItem('app_payment_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [trackingRequestId, setTrackingRequestId] = useState(null); // highlights specific request in tracking
  const [forceShowLogin, setForceShowLogin] = useState(false); // forces login screen overlay
  const [showDocumentsOverlay, setShowDocumentsOverlay] = useState(false); // controls documents full-view overlay
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('accessToken');
  });

  const handleSplashFinish = (action) => {
    setShowSplash(false);
    if (action === 'login') {
      setForceShowLogin(true);
    }
  };
  
  // App Global State (Live modifications)
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('app_cached_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('app_cached_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.flatMap(r => r.documents || []);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsInbox, setShowNotificationsInbox] = useState(false);
  const [notificationsHistory, setNotificationsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('app_notifications_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaults = [
      { id: '1', title: 'PAN Card Verified', body: 'Government registry verification successfully completed.', time: '2 hours ago', read: false, type: 'success' },
      { id: '2', title: 'CA Partner Assigned', body: 'CA Akash Kumar has been assigned to prepare your individual ITR.', time: '1 day ago', read: true, type: 'info' },
      { id: '3', title: 'Payment Confirmed', body: 'Tax filing platform receipt generated for INV-883921.', time: '2 days ago', read: true, type: 'success' }
    ];
    try {
      localStorage.setItem('app_notifications_history', JSON.stringify(defaults));
    } catch {}
    return defaults;
  });

  // Simulator controls
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);
  const [simulateErrorState, setSimulateErrorState] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [activePrivacyTab, setActivePrivacyTab] = useState('policy');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Sync theme change on document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const profile = await api.getMe();
          if (profile) {
            setUser(profile);
            const res = await api.getRequests().catch(() => null);
            if (res && res.success && res.requests) {
              setRequests(res.requests);
              localStorage.setItem('app_cached_requests', JSON.stringify(res.requests));
              const allDocs = res.requests.flatMap(r => r.documents || []);
              setDocuments(allDocs);
            }
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
        }
      }
    };
    restoreSession();
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Online / Offline recovery tracking
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addNotification('Network connection restored.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      addNotification('Network connection lost. Sandbox mode active.', 'error');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll for live request status
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (user && !isOffline) {
        try {
          const res = await api.getRequests();
          if (res.success && res.requests) {
            setRequests(res.requests);
            const allDocs = res.requests.flatMap(r => r.documents || []);
            setDocuments(allDocs);
          }
        } catch (e) {
          console.warn('Silent polling fail:', e);
        }
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [user, isOffline]);

  // Helper Stats calculation
  const getStats = () => {
    if (simulateEmptyState) {
      return { activeRequests: 0, documentsUploaded: 0, consultations: 0 };
    }
    return {
      activeRequests: requests.filter(r => r.status !== 'Completed').length,
      documentsUploaded: documents.length,
      consultations: requests.filter(r => r.status === 'Review Stage' || r.status === 'Completed').length + 1
    };
  };

  // State Triggers
  const handleLoginSuccess = async (userData) => {
    setLoading(true);
    try {
      setUser(userData);
      // Fetch initial requests and documents for the user to sync UI
      const requestsRes = await api.getRequests().catch(() => ({ requests: [] }));
      if (requestsRes && requestsRes.requests) {
        setRequests(requestsRes.requests);
        const allDocs = requestsRes.requests.flatMap(r => r.documents || []);
        setDocuments(allDocs);
      }
    } catch (e) {
      console.warn('Initial data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    setActiveWizardConfig(null);
    setBookingData(null);
    setPaymentData(null);
    addNotification('Account logged out successfully.', 'info');
  };

  const handleSelectService = (serviceId) => {
    setActiveWizardConfig({
      serviceId,
      initialStep: 2
    });
  };

  const handleFinishWizard = (wizardAnswers, recommendedServiceName) => {
    if (!wizardAnswers) {
      setActiveWizardConfig(null);
      return;
    }
    const data = {
      serviceName: recommendedServiceName,
      answers: wizardAnswers
    };
    localStorage.setItem('app_booking_data', JSON.stringify(data));
    setBookingData(data);
    setActiveWizardConfig(null);
  };

  const handleCompleteBooking = (selectedDetails) => {
    const data = {
      ...selectedDetails,
      bookingSummary: bookingData?.answers || {}
    };
    localStorage.setItem('app_payment_data', JSON.stringify(data));
    setPaymentData(data);
    localStorage.removeItem('app_booking_data');
    setBookingData(null);
  };

  const handleBackToBooking = () => {
    // Reconstruct bookingData from paymentData properties if going back
    if (paymentData) {
      const data = {
        serviceName: paymentData.serviceName,
        answers: paymentData.bookingSummary || {}
      };
      localStorage.setItem('app_booking_data', JSON.stringify(data));
      setBookingData(data);
    }
    localStorage.removeItem('app_payment_data');
    setPaymentData(null);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Create request in backend
      const requestRes = await api.createRequest(
        paymentData.serviceName, 
        paymentData.expert.id, 
        paymentData.amount
      );
      
      const newReq = requestRes.data;

      // Book appointment in backend
      await api.bookAppointment(
        paymentData.expert, 
        paymentData.date.fullDateString || paymentData.date, 
        paymentData.time, 
        paymentData.channel, 
        newReq.id
      );

      // Re-fetch requests
      const res = await api.getRequests();
      setRequests(res.requests);
      localStorage.setItem('app_cached_requests', JSON.stringify(res.requests));
      
      setTrackingRequestId(newReq.id);
      localStorage.removeItem('app_payment_data');
      setPaymentData(null);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      setActiveTab('requests'); // Redirect to tracking timeline screen!
    } catch (err) {
      console.error('Failed to process booking', err);
      addNotification(err.message || 'Failed to process booking on server.', 'error');
    }
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleSelectRequest = (reqId) => {
    setTrackingRequestId(reqId);
    setActiveTab('requests');
  };

  const handleMenuClick = (menuId, menuLabel) => {
    if (menuId === 'requests') {
      setActiveTab('requests');
    } else if (menuId === 'saved-docs') {
      setActiveTab('documents');
    } else if (menuId === 'privacy') {
      setShowPrivacyModal(true);
    } else {
      addNotification(`Opened ${menuLabel} panel (Prototype Mode)`, 'info');
    }
  };

  const renderPrivacyModal = () => {
    if (!showPrivacyModal) return null;

    const handleDeleteAccount = async () => {
      if (confirmDeleteText !== 'DELETE') {
        addNotification('Please type DELETE to confirm.', 'error');
        return;
      }
      setIsDeletingAccount(true);
      try {
        await api.deleteAccount();
        addNotification('Your account has been permanently deleted.', 'success');
        setShowPrivacyModal(false);
        handleLogout();
      } catch (err) {
        addNotification(err.message || 'Failed to delete account', 'error');
      } finally {
        setIsDeletingAccount(false);
        setConfirmDeleteText('');
      }
    };

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}
      >
        <div 
          className="card animate-scale-in"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="title-accent" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Privacy & Compliance
            </h3>
            <button 
              onClick={() => {
                setShowPrivacyModal(false);
                setActivePrivacyTab('policy');
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '1.25rem', padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '4px', gap: '4px' }}>
            {[
              { id: 'policy', label: 'Privacy' },
              { id: 'terms', label: 'Terms' },
              { id: 'retention', label: 'Retention' },
              { id: 'delete', label: 'Delete User' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePrivacyTab(tab.id)}
                style={{
                  flex: 1, padding: '8px 4px', border: 'none', borderRadius: '10px',
                  fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                  backgroundColor: activePrivacyTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  color: activePrivacyTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activePrivacyTab === 'policy' && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Privacy Policy</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  We value your privacy. Blueprint Advisor collects necessary metadata and files (e.g., PAN, Aadhar, GST registration certificates, and ITR details) exclusively to facilitate professional filing and consultancy services. All transmissions are encrypted using SSL, and files are stored in access-controlled, private storage vaults.
                </p>
              </div>
            )}

            {activePrivacyTab === 'terms' && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Terms of Service</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  By uploading tax files and records, you confirm that you are the rightful owner or authorized representative of the taxpayer profile. Any fraudulent documentation will lead to immediate service termination and reporting to relevant financial authorities.
                </p>
              </div>
            )}

            {activePrivacyTab === 'retention' && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Data Retention & Storage</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Documents and advisory cases are retained for 3 years in our archive systems to assist in case of subsequent tax audits, in compliance with national tax compliance guidelines. Files are automatically purged after this period. You can request deletion of active records earlier by initiating account deletion.
                </p>
              </div>
            )}

            {activePrivacyTab === 'delete' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', margin: 0 }}>Permanently Delete Account</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  This action is irreversible. All your submitted requests, uploaded document copies, active cases, and chat records will be permanently deleted from our servers.
                </p>

                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                    Please type <strong>DELETE</strong> in the box below to confirm:
                  </span>
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                    placeholder="DELETE"
                    style={{
                      width: '100%', padding: '10px', marginTop: '8px', border: '1.5px solid var(--border-color)',
                      borderRadius: '8px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)',
                      fontSize: '0.8rem', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || confirmDeleteText !== 'DELETE'}
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: confirmDeleteText === 'DELETE' ? '#ef4444' : 'transparent',
                    color: confirmDeleteText === 'DELETE' ? '#ffffff' : 'var(--text-tertiary)',
                    borderColor: confirmDeleteText === 'DELETE' ? '#ef4444' : 'var(--border-color)',
                    fontWeight: 800, fontSize: '0.8rem', padding: '12px', cursor: confirmDeleteText === 'DELETE' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isDeletingAccount ? 'Deleting Account...' : '⚠️ Delete My Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationsInbox = () => {
    if (!showNotificationsInbox) return null;

    const handleMarkAllRead = () => {
      const updated = notificationsHistory.map(n => ({ ...n, read: true }));
      setNotificationsHistory(updated);
      try {
        localStorage.setItem('app_notifications_history', JSON.stringify(updated));
      } catch {}
    };

    const handleClose = () => {
      handleMarkAllRead();
      setShowNotificationsInbox(false);
    };

    return (
      <div 
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="animate-fade-in-up"
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: 'var(--bg-card)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            maxHeight: '65%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Notifications Inbox
            </h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 32
                }}
              >
                Mark all read
              </button>
              <button 
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  color: 'var(--text-secondary)',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
            {notificationsHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 10px', fontSize: '0.78rem' }}>
                No notifications yet.
              </div>
            ) : (
              notificationsHistory.map(item => (
                <div 
                  key={item.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    background: item.read ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {item.type === 'success' ? '✅' : '📢'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{item.body}</p>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', display: 'block', marginTop: 4 }}>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const refreshRequests = async () => {
    try {
      const res = await api.getRequests();
      if (res && res.requests) {
        setRequests(res.requests);
        localStorage.setItem('app_cached_requests', JSON.stringify(res.requests));
        if (selectedExpertRequest) {
          const updatedReq = res.requests.find(r => r.id === selectedExpertRequest.id);
          if (updatedReq) setSelectedExpertRequest(updatedReq);
        }
      }
    } catch (e) {
      console.error('Failed to refresh requests:', e);
    }
  };

  const renderBottomBar = () => {
    if (showSplash || forceShowLogin || activeWizardConfig || bookingData || paymentData) return null;

    if (user && user.role === 'EXPERT') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          height: 60,
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          {[
            { key: 'dashboard', label: 'Home', icon: '🏠' },
            { key: 'cases', label: 'Cases', icon: '💼' },
            { key: 'calendar', label: 'Calendar', icon: '📅' },
            { key: 'profile', label: 'Profile', icon: '👤' }
          ].map(tab => {
            const isActive = expertActiveTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSelectedExpertRequest(null);
                  setExpertActiveTab(tab.key);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '0.66rem'
                }}
                aria-label={`Switch to expert ${tab.label} tab`}
              >
                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />;
  };

  const renderExpertAppScreen = () => {
    if (selectedExpertRequest) {
      return (
        <ExpertCaseDetail 
          request={selectedExpertRequest}
          onBack={() => setSelectedExpertRequest(null)}
          onOpenChat={setActiveChatClientUserId}
          addNotification={addNotification}
          onRefresh={refreshRequests}
        />
      );
    }

    switch (expertActiveTab) {
      case 'dashboard':
        return (
          <ExpertDashboard 
            user={user}
            requests={requests}
            onSelectCase={setSelectedExpertRequest}
            onViewCalendar={() => setExpertActiveTab('calendar')}
            onOpenProfile={() => setExpertActiveTab('profile')}
            setExpertActiveTab={setExpertActiveTab}
          />
        );
      case 'cases':
        return (
          <ExpertCases 
            requests={requests}
            onSelectCase={setSelectedExpertRequest}
          />
        );
      case 'calendar':
        return (
          <ExpertCalendar 
            requests={requests}
            addNotification={addNotification}
          />
        );
      case 'profile':
        return (
          <ExpertProfile 
            user={user}
            onLogout={handleLogout}
            addNotification={addNotification}
            theme={theme}
            setTheme={setTheme}
          />
        );
      default:
        return null;
    }
  };

  // Render Inner App Screen Views
  const renderAppScreen = () => {
    if (user && user.role === 'EXPERT') {
      return renderExpertAppScreen();
    }

    if (simulateErrorState) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-phone)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h3 className="title-accent" style={{ color: 'var(--error)' }}>Connection Failed</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unable to connect to the Blueprint Advisor network nodes. Please retry.</p>
          <button className="btn btn-primary" onClick={() => setSimulateErrorState(false)}>Retry connection</button>
        </div>
      );
    }

    if (loading) {
      return (
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-phone)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Skeleton type="home-stats" />
          <Skeleton type="service-grid" />
          <Skeleton type="list" />
        </div>
      );
    }

    // Modal/overlay-like screens that take over navigation
    if (activeWizardConfig) {
      return (
        <Wizard 
          initialServiceId={activeWizardConfig.serviceId}
          initialStep={activeWizardConfig.initialStep}
          onFinishWizard={handleFinishWizard}
        />
      );
    }

    if (bookingData) {
      return (
        <Booking 
          recommendedService={bookingData.serviceName}
          bookingSummary={bookingData.answers}
          addNotification={addNotification}
          onBackToWizard={() => {
            setActiveWizardConfig({
              serviceId: bookingData.answers.serviceType,
              initialStep: 2
            });
            setBookingData(null);
          }}
          onCompleteBooking={handleCompleteBooking}
        />
      );
    }

    if (paymentData) {
      return (
        <Payment 
          bookingData={paymentData}
          onBackToBooking={handleBackToBooking}
          onPaymentSuccess={handlePaymentSuccess}
          addNotification={addNotification}
        />
      );
    }

    if (showDocumentsOverlay) {
      return (
        <Documents 
          requests={simulateEmptyState ? [] : requests}
          documents={simulateEmptyState ? [] : documents}
          onUploadSuccess={handleUploadSuccess}
          addNotification={addNotification}
          setActiveTab={(tab) => {
            if (tab === 'home') setShowDocumentsOverlay(false);
            else {
              setShowDocumentsOverlay(false);
              setActiveTab(tab);
            }
          }}
        />
      );
    }

    // Shell screens driven by Bottom Navigation Tabs
    switch (activeTab) {
      case 'home':
        return (
          <Home 
            userProfile={user || { name: 'Guest', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isGuest: true }} 
            stats={getStats()}
            recentRequests={simulateEmptyState ? [] : requests}
            onSelectService={handleSelectService}
            onSelectRequest={handleSelectRequest}
            onViewAllRequests={() => {
              setTrackingRequestId(null);
              setActiveTab('requests');
            }}
            onBellClick={() => setShowNotificationsInbox(true)}
            unreadCount={notificationsHistory.filter(n => !n.read).length}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenDocuments={() => setShowDocumentsOverlay(true)}
            onSupportClick={() => setActiveTab('chat')}
            setActiveTab={setActiveTab}
          />
        );
      case 'requests':
        return (
          <Tracking 
            requests={simulateEmptyState ? [] : requests}
            documents={simulateEmptyState ? [] : documents}
            selectedRequestId={trackingRequestId}
            onBackToHome={() => setActiveTab('home')}
            setActiveTab={setActiveTab}
            addNotification={addNotification}
            user={user}
          />
        );
      case 'chat':
        const assignedExpert = !simulateEmptyState && requests.find(r => r.assignedExpert)?.assignedExpert;
        const chatPartnerId = assignedExpert?.user?.id || assignedExpert?.userId || 'support';
        const chatPartnerName = assignedExpert?.user?.name || 'Akash Sharma';
        const chatPartnerPhoto = assignedExpert?.user?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80';
        return (
          <div style={{ position: 'relative', height: '100%' }}>
            <ChatBox 
              currentUserId={user?.id || 'guest'}
              otherUserId={chatPartnerId}
              otherUserName={chatPartnerName}
              otherUserPhoto={chatPartnerPhoto}
              onClose={() => setActiveTab('home')}
              addNotification={addNotification}
            />
          </div>
        );
      case 'profile':
        return (
          <Profile 
            userProfile={user || { name: 'Guest', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isGuest: true }}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
            onLoginTrigger={() => setForceShowLogin(true)}
            addNotification={addNotification}
            theme={theme}
            setTheme={setTheme}
          />
        );
      default:
        return null;
    }
  };

  const isMobile = Capacitor.isNativePlatform() || window.innerWidth <= 768;

  if (isMobile) {
    return (
      <div className="native-app-container">
        {/* Offline Recovery Banner */}
        {isOffline && (
          <div 
            style={{
              backgroundColor: 'var(--error)',
              color: '#ffffff',
              padding: '6px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              zIndex: 70,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>📡</span> Running Offline (Local Sandbox Active) • <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsOffline(false)}>Retry</span>
          </div>
        )}

        {/* Dynamic Float Notification Layer */}
        <div className="notification-container" style={{ top: '16px' }}>
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>
        {renderNotificationsInbox()}

        {/* Main interactive screen viewport */}
        <div className="app-content mobile-safe-space">
        {(forceShowLogin || (paymentData && !user)) ? (
            <Login 
              onLoginSuccess={(userData) => {
                handleLoginSuccess(userData);
                setForceShowLogin(false);
              }} 
              addNotification={addNotification} 
              onCancel={() => {
                setForceShowLogin(false);
                setPaymentData(null);
              }}
            />
          ) : (
            renderAppScreen()
          )}
        </div>

        {activeChatClientUserId && user && (
          <ChatBox 
            currentUserId={user.id}
            otherUserId={activeChatClientUserId}
            otherUserName="Advisor Client"
            onClose={() => setActiveChatClientUserId(null)}
            addNotification={addNotification}
          />
        )}
        {/* Bottom Tab Bar */}
        {renderBottomBar()}
        {renderPrivacyModal()}
      </div>
    );
  }

  // Native Platform Bypass for Play Store builds
  if (Capacitor.isNativePlatform()) {
    return (
      <div className="native-app-container">
        {/* Dynamic Float Notification Layer */}
        <div className="notification-container">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>
        {renderNotificationsInbox()}

        {/* Main interactive screen viewport */}
        <div className="app-content" style={{ height: '100vh', width: '100vw', borderRadius: 0, border: 'none', boxShadow: 'none' }}>
          {showSplash ? (
            <Splash onFinish={handleSplashFinish} />
          ) : (forceShowLogin || (paymentData && !user)) ? (
            <Login 
              onLoginSuccess={(userData) => {
                handleLoginSuccess(userData);
                setForceShowLogin(false);
              }} 
              addNotification={addNotification} 
              onCancel={() => {
                setForceShowLogin(false);
                setPaymentData(null);
              }}
            />
          ) : (
            renderAppScreen()
          )}
        </div>

        {activeChatClientUserId && user && (
          <ChatBox 
            currentUserId={user.id}
            otherUserId={activeChatClientUserId}
            otherUserName="Advisor Client"
            onClose={() => setActiveChatClientUserId(null)}
            addNotification={addNotification}
          />
        )}
        {/* Bottom Tab Bar */}
        {renderBottomBar()}
      </div>
    );
  }

  // Outer Wrapper displaying Android Simulator & controls on desktop
  return (
    <div className="desktop-wrapper">
      {/* Visual Controller Box for User Testing */}
      <div className="preview-panel">
        <div className="preview-title">
          <span>💼</span> Blueprint Advisor Live
        </div>
        <p className="preview-desc">
          Interactive Android UI/UX prototype. Experience real loading delays, OTP validation, booking slots, mock payments, and Swiggy timeline tracking.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>THEME SELECTION</span>
          <div className="theme-pill-container">
            <button 
              className={`theme-pill ${theme === 'light' ? 'active' : ''}`} 
              onClick={() => setTheme('light')}
            >
              Light Mode
            </button>
            <button 
              className={`theme-pill ${theme === 'dark' ? 'active' : ''}`} 
              onClick={() => setTheme('dark')}
            >
              Dark Mode
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PROTOTYPE TOGGLES</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => {
                setSimulateEmptyState(prev => !prev);
                addNotification(simulateEmptyState ? 'Restored dummy list data' : 'Simulating empty stats list', 'info');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                backgroundColor: simulateEmptyState ? 'var(--primary-container)' : 'var(--bg-card)',
                color: simulateEmptyState ? 'var(--primary)' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {simulateEmptyState ? '✓ Empty States' : 'Empty States'}
            </button>
            
            <button 
              onClick={() => {
                setSimulateErrorState(prev => !prev);
                addNotification(simulateErrorState ? 'Restored network' : 'Simulating networking error', 'info');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                backgroundColor: simulateErrorState ? 'var(--error-container)' : 'var(--bg-card)',
                color: simulateErrorState ? 'var(--on-error)' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {simulateErrorState ? '✓ Network Error' : 'Network Error'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Mobile Mockup Container */}
      <div className="device-container">
        {/* Android status bar */}
        <StatusBar theme={theme} />
        
        {/* Offline Recovery Banner */}
        {isOffline && (
          <div 
            style={{
              backgroundColor: 'var(--error)',
              color: '#ffffff',
              padding: '6px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              zIndex: 70,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>📡</span> Running Offline (Local Sandbox Active) • <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsOffline(false)}>Retry</span>
          </div>
        )}
        
        {/* Dynamic notch camera island */}
        <div className="camera-notch" />

        {/* Dynamic Float Notification Layer */}
        <div className="notification-container">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>

        {/* Main interactive screen viewport */}
        <div className={`app-content ${(!showSplash && !forceShowLogin && !activeWizardConfig && !bookingData && !paymentData) ? 'has-bottom-bar' : ''}`}>
          {showSplash ? (
            <Splash onFinish={handleSplashFinish} />
          ) : (forceShowLogin || (paymentData && !user)) ? (
            <Login 
              onLoginSuccess={(userData) => {
                handleLoginSuccess(userData);
                setForceShowLogin(false);
              }} 
              addNotification={addNotification} 
              onCancel={() => {
                setForceShowLogin(false);
                setPaymentData(null);
              }}
            />
          ) : (
            renderAppScreen()
          )}
        </div>

        {/* Bottom Tab Bar (Only when not in splash, login or checkout overlays) */}
        {!showSplash && !forceShowLogin && !activeWizardConfig && !bookingData && !paymentData && (
          <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Bottom Android Home indicator bar */}
        <div className="phone-bottom-bar">
          <div className="android-pill" />
        </div>
        {renderPrivacyModal()}
      </div>
    </div>
  );
}
