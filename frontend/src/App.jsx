import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import './App.css';

// Import Screens
import Login from './screens/Login';
import Home from './screens/Home';
import Wizard from './screens/Wizard';
import Booking from './screens/Booking';
import Payment from './screens/Payment';
import Tracking from './screens/Tracking';
import Documents from './screens/Documents';
import Profile from './screens/Profile';

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
  const [activeWizardConfig, setActiveWizardConfig] = useState(null); // when not null, shows Wizard screen
  const [bookingData, setBookingData] = useState(null); // when not null, shows Booking screen
  const [paymentData, setPaymentData] = useState(null); // when not null, shows Checkout screen
  const [trackingRequestId, setTrackingRequestId] = useState(null); // highlights specific request in tracking
  const [forceShowLogin, setForceShowLogin] = useState(false); // forces login screen overlay
  
  // App Global State (Live modifications)
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Simulator controls
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);
  const [simulateErrorState, setSimulateErrorState] = useState(false);

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
    // Proceed to booking screen
    setBookingData({
      serviceName: recommendedServiceName,
      answers: wizardAnswers
    });
    setActiveWizardConfig(null);
  };

  const handleCompleteBooking = (selectedDetails) => {
    setPaymentData({
      ...selectedDetails,
      bookingSummary: bookingData?.answers || {}
    });
    setBookingData(null);
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
      
      setTrackingRequestId(newReq.id);
      setPaymentData(null);
      setActiveTab('requests'); // Redirect to tracking timeline screen!
    } catch (err) {
      console.error('Failed to process booking', err);
      addNotification('Failed to process booking on server.', 'error');
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
    } else {
      addNotification(`Opened ${menuLabel} panel (Prototype Mode)`, 'info');
    }
  };

  // Render Inner App Screen Views
  const renderAppScreen = () => {
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
          onBackToBooking={() => {
            setBookingData({
              serviceName: paymentData.serviceName,
              answers: paymentData.bookingSummary || {}
            });
            setPaymentData(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          addNotification={addNotification}
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
            recentRequests={simulateEmptyState ? [] : requests.slice(0, 2)}
            onSelectService={handleSelectService}
            onSelectRequest={handleSelectRequest}
            onViewAllRequests={() => {
              setTrackingRequestId(null);
              setActiveTab('requests');
            }}
            onSupportClick={() => addNotification('Connecting live client support chat...', 'success')}
            onOpenProfile={() => setActiveTab('profile')}
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
      case 'documents':
        return (
          <Documents 
            requests={simulateEmptyState ? [] : requests}
            documents={simulateEmptyState ? [] : documents}
            onUploadSuccess={handleUploadSuccess}
            addNotification={addNotification}
            setActiveTab={setActiveTab}
          />
        );
      case 'profile':
        return (
          <Profile 
            userProfile={user || { name: 'Guest', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isGuest: true }}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
            onLoginTrigger={() => setForceShowLogin(true)}
            addNotification={addNotification}
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

        {/* Bottom Tab Bar (Only when not in splash, login or checkout overlays) */}
        {!forceShowLogin && !activeWizardConfig && !bookingData && !paymentData && (
          <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
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
        <div className="app-content">
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

        {/* Bottom Tab Bar (Only when not in splash, login or checkout overlays) */}
        {!forceShowLogin && !activeWizardConfig && !bookingData && !paymentData && (
          <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Bottom Android Home indicator bar */}
        <div className="phone-bottom-bar">
          <div className="android-pill" />
        </div>
      </div>
    </div>
  );
}
