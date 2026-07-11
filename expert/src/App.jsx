import { useState, useEffect, useCallback } from 'react';
import './App.css';
import './index.css';
import StatusBar from './components/StatusBar';
import BottomBar from './components/BottomBar';
import Notification from './components/Notification';
import Login from './screens/Login';
import Home from './screens/Home';
// Other screens will be imported here once created
import Cases from './screens/Cases';
import CaseDetail from './screens/CaseDetail';
import Calendar from './screens/Calendar';
import Profile from './screens/Profile';
import Notifications from './screens/Notifications';
import { api } from './services/apiService';
import { getToken, setToken, removeToken } from './services/authService';

function App() {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenParams, setScreenParams] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe(token);
          if (res.data?.role === 'EXPERT') {
            setUser(res.data);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Auth error', err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setCurrentScreen('home');
  };

  const onNavigate = (screen, params = null) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const renderScreen = () => {
    if (loading) {
      return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (!token || !user) {
      return <Login onLogin={handleLogin} showNotification={showNotification} />;
    }

    const props = { token, user, onNavigate, showNotification, onLogout: handleLogout, params: screenParams };

    switch (currentScreen) {
      case 'home':
        return <Home {...props} />;
      case 'cases':
        return <Cases {...props} />;
      case 'caseDetail':
        return <CaseDetail {...props} />;
      case 'calendar':
        return <Calendar {...props} />;
      case 'profile':
        return <Profile {...props} />;
      case 'notifications':
        return <Notifications {...props} />;
      default:
        return <div style={{ padding: '24px' }}>Screen not found: {currentScreen}</div>;
    }
  };

  if (!token || !user) {
    return (
      <div style={{ height: '100vh', width: '100vw' }}>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
        {renderScreen()}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Desktop controls panel */}
      <div className="controls-panel">
        <div className="controls-brand">💼 Blueprint Expert</div>
        <div className="controls-info">CA Partner Portal</div>
        <div className="controls-version">v2.0</div>
      </div>
      
      {/* Phone mockup */}
      <div className="phone-mockup">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          {notification && (
            <Notification 
              message={notification.message} 
              type={notification.type} 
              onClose={() => setNotification(null)} 
            />
          )}
          <StatusBar />
          <div className="screen-container">
            {renderScreen()}
          </div>
          <BottomBar activeTab={currentScreen} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

export default App;
