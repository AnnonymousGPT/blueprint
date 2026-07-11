import { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const mockNotifications = [
  { id: 'n1', title: 'New Case Assigned', body: 'Priya Singh — GST Registration has been assigned to you.', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, type: 'case' },
  { id: 'n2', title: 'Document Uploaded', body: 'Rahul Verma uploaded Form 16 for ITR Filing.', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), read: false, type: 'document' },
  { id: 'n3', title: 'Booking Request', body: 'Sunil Mehta requested a video consultation on Jun 19.', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: true, type: 'booking' },
  { id: 'n4', title: 'Payment Received', body: '₹1,887 received from Rahul Verma for ITR Filing.', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), read: true, type: 'payment' },
  { id: 'n5', title: 'SLA Warning', body: 'Case req-107 has not been started within 24 hours.', createdAt: new Date(Date.now() - 26 * 3600000).toISOString(), read: true, type: 'alert' }
];

export default function Notifications({ token, onNavigate, showNotification }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications(token);
        if (res && res.data) {
          setNotifications(res.data.length > 0 ? res.data : mockNotifications);
        }
      } catch (err) {
        setNotifications(mockNotifications);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsAllRead(token);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      showNotification('All marked as read', 'success');
    } catch (err) {
      showNotification('Failed to update notifications', 'error');
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read && !n.id.startsWith('n')) {
        await api.markNotificationRead(token, n.id);
      }
      setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const allRead = notifications.every(n => n.read);

  const getIconForType = (type) => {
    if (type === 'case' || type === 'EXPERT_ASSIGNED') return '📋';
    if (type === 'document' || type === 'DOCS_REQUIRED') return '📄';
    if (type === 'booking' || type === 'REMINDER') return '📅';
    if (type === 'payment' || type === 'PAY_SUCCESS') return '💰';
    if (type === 'alert') return '⚠️';
    return '🔔';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'just now';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return 'some time ago';
    }
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Notifications</div>
        <button 
          onClick={handleMarkAllRead} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Mark All Read
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {notifications.length > 0 ? (
          <div className="flex-col gap-4">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className="card"
                onClick={() => handleNotificationClick(n)}
                style={{ 
                  cursor: 'pointer',
                  borderLeft: !n.read ? '4px solid var(--primary)' : '4px solid transparent',
                  background: !n.read ? 'var(--bg-card)' : '#F8FAFC'
                }}
              >
                <div className="flex-row gap-4" style={{ alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: n.type === 'alert' ? '#FEF2F2' : '#F0FDFA', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {getIconForType(n.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: !n.read ? 700 : 600, color: !n.read ? 'black' : 'var(--text-main)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(n.createdAt)}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {n.body}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {allRead && notifications.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ marginBottom: '8px' }}>All caught up!</h3>
            <p style={{ fontSize: '0.9rem' }}>You have read all your notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
