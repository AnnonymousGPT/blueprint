import { useState, useEffect } from 'react';
import { api } from '../services/apiService';

export default function Home({ token, user, onNavigate, showNotification }) {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [newBookingData, setNewBookingData] = useState({ clientName: '', date: '', time: '', type: 'VIDEO' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await api.getRequests(token);
        const reqs = reqRes.data || [];
        setRequests(reqs);
        
        // Extract all bookings from the requests
        const allBookings = [];
        reqs.forEach(req => {
          if (req.bookings && req.bookings.length > 0) {
            req.bookings.forEach(b => {
              allBookings.push({
                ...b,
                clientName: req.client?.name || 'Unknown Client',
                serviceName: req.serviceName
              });
            });
          }
        });
        setBookings(allBookings);
      } catch (err) {
        showNotification('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, showNotification]);

  const handleSchedule = async () => {
    if (!newBookingData.clientName || !newBookingData.date || !newBookingData.time) {
      showNotification('Please fill all details', 'warning');
      return;
    }
    try {
      setIsBooking(true);
      await api.createBooking(token, {
        ...newBookingData,
        requestId: 'req-custom'
      });
      showNotification('Call scheduled successfully', 'success');
      setShowScheduleModal(false);
      setNewBookingData({ clientName: '', date: '', time: '', type: 'VIDEO' });
      // Refresh bookings
      const bookRes = await api.getBookings(token);
      setBookings(bookRes.data || []);
    } catch (e) {
      showNotification('Failed to schedule call', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading dashboard...</div>;

  const urgentCases = requests.filter(r => r.priority === 'TODAY');
  const pendingReviews = requests.filter(r => ['UPLOADED', 'UNDER_REVIEW'].includes(r.status));
  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]);

  const statRequests = requests.length;
  const statPending = pendingReviews.length;
  const statCalls = todayBookings.length;
  const statCompleted = requests.filter(r => r.status === 'COMPLETED').length;

  return (
    <div className="home-screen-content">
      {/* Header */}
      <div className="home-header">
        <div className="home-header-left">
          <div className="profile-pic-container">
            {/* You can put an img src here if user has one, else a placeholder icon */}
            <div className="profile-pic-placeholder">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#E2E8F0"/>
                <path d="M24 24C27.3137 24 30 21.3137 30 18C30 14.6863 27.3137 12 24 12C20.6863 12 18 14.6863 18 18C18 21.3137 20.6863 24 24 24Z" fill="#94A3B8"/>
                <path d="M34 36C34 30.4772 29.5228 26 24 26C18.4772 26 14 30.4772 14 36" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="online-dot-large"></div>
          </div>
          <div>
            <h2 className="home-greeting">Hello, CA {user?.name || 'Rajesh'} 👋</h2>
            <div className="home-subgreeting">Good morning! You have <span className="text-teal font-semibold">4 tasks</span> today.</div>
          </div>
        </div>
        <div className="home-header-right">
          <button className="icon-btn relative" onClick={() => onNavigate('notifications')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span className="notification-dot"></span>
          </button>
          <div className="status-pill">
            <span className="online-dot-small"></span>
            Online
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <div className="earnings-card">
        {/* Abstract wave background SVG */}
        <div className="earnings-bg-wave">
           <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
             <path d="M0 80 Q 40 60, 80 80 T 160 50 T 240 70 T 300 40 L 300 120 L 0 120 Z" fill="rgba(255,255,255,0.05)" />
             <path d="M0 80 Q 40 60, 80 80 T 160 50 T 240 70 T 300 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
           </svg>
        </div>
        <div className="earnings-content">
          <div className="flex-row justify-between items-start">
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Today's Earnings</div>
            <button className="earnings-view-btn">View Details &gt;</button>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '4px', marginBottom: '8px' }}>₹6,420</div>
          <div style={{ color: '#6EE7B7', fontSize: '12px', fontWeight: 500 }}>+ ₹1,230 (20%) <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>vs yesterday</span></div>
          <div className="earnings-wallet-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M21 12H15a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h6"/><circle cx="17" cy="14" r="1" fill="currentColor"/></svg>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="horizontal-scroll hide-scrollbar stats-row">
        <div className="stat-box" onClick={() => onNavigate('cases')}>
          <div className="stat-box-icon" style={{ color: '#3B82F6', background: '#EFF6FF' }}>📄</div>
          <div className="stat-box-num">{statRequests}</div>
          <div className="stat-box-label">New Requests</div>
          <div className="stat-box-badge badge-blue">3 Urgent</div>
        </div>
        <div className="stat-box" onClick={() => onNavigate('cases')}>
          <div className="stat-box-icon" style={{ color: '#F59E0B', background: '#FFFBEB' }}>🕒</div>
          <div className="stat-box-num">{statPending}</div>
          <div className="stat-box-label">Pending Review</div>
          <div className="stat-box-badge badge-yellow">Review Docs</div>
        </div>
        <div className="stat-box" onClick={() => onNavigate('calendar')}>
          <div className="stat-box-icon" style={{ color: '#8B5CF6', background: '#F5F3FF' }}>📅</div>
          <div className="stat-box-num">{statCalls}</div>
          <div className="stat-box-label">Upcoming Calls</div>
          <div className="stat-box-badge badge-purple">Today</div>
        </div>
        <div className="stat-box" onClick={() => onNavigate('cases')}>
          <div className="stat-box-icon" style={{ color: '#10B981', background: '#ECFDF5' }}>✅</div>
          <div className="stat-box-num">{statCompleted}</div>
          <div className="stat-box-label">Completed</div>
          <div className="stat-box-badge badge-green">This Month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h3 className="section-title">Quick Actions</h3>
        <span className="section-action">View All &gt;</span>
      </div>
      <div className="horizontal-scroll hide-scrollbar actions-row">
        <button className="action-btn">
          <div className="action-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg></div>
          <span className="action-label">Start Review</span>
        </button>
        <button className="action-btn">
          <div className="action-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
          <span className="action-label">Request Docs</span>
        </button>
        <button className="action-btn">
          <div className="action-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <span className="action-label">Call Client</span>
        </button>
        <button className="action-btn" onClick={() => setShowScheduleModal(true)}>
          <div className="action-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <span className="action-label">Schedule Call</span>
        </button>
        <button className="action-btn">
          <div className="action-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18h4"/><path d="M8 18h.01"/></svg></div>
          <span className="action-label">Case Note</span>
        </button>
      </div>

      {/* Today's Schedule */}
      <div className="section-header" style={{ marginTop: '16px' }}>
        <h3 className="section-title">Today's Schedule</h3>
        <span className="section-action" onClick={() => onNavigate('calendar')}>View Calendar &gt;</span>
      </div>
      <div className="schedule-list">
        {todayBookings.length > 0 ? (
          todayBookings.map((booking, idx) => (
            <div key={booking.id || idx} className="schedule-card" style={idx === todayBookings.length - 1 ? { borderBottom: 'none' } : {}}>
              <div className="schedule-icon-box" style={{ color: '#10B981', background: '#ECFDF5' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="schedule-info">
                <div className="schedule-time" style={{ color: '#10B981' }}>{booking.time}</div>
                <div className="schedule-title">{booking.type === 'VIDEO' ? 'Video Call' : 'Call'} with {booking.clientName}</div>
                <div className="schedule-subtitle">{booking.serviceName}</div>
              </div>
              <button className="schedule-pill pill-green">
                Join <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </button>
            </div>
          ))
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No appointments scheduled for today.
          </div>
        )}
      </div>

      {/* SLA Alert */}
      <div className="sla-alert" onClick={() => onNavigate('cases')}>
        <div className="sla-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        </div>
        <div className="sla-text"><span className="font-bold">SLA Alert:</span> {urgentCases.length > 0 ? urgentCases.length : 2} cases are due today</div>
        <div className="sla-link">View Cases &gt;</div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '340px', padding: '24px', position: 'relative' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.2rem' }}>Schedule Call</h3>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Client Name</label>
              <input type="text" className="form-input" value={newBookingData.clientName} onChange={e => setNewBookingData({...newBookingData, clientName: e.target.value})} placeholder="E.g. Rahul Verma" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={newBookingData.date} onChange={e => setNewBookingData({...newBookingData, date: e.target.value})} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={newBookingData.time} onChange={e => setNewBookingData({...newBookingData, time: e.target.value})} />
            </div>
            <div className="flex-row justify-between">
              <button className="btn btn-outline" style={{ flex: 1, marginRight: '8px' }} onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, marginLeft: '8px' }} onClick={handleSchedule} disabled={isBooking}>
                {isBooking ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
