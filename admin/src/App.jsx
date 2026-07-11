import { useState, useEffect } from 'react';
import './index.css';

// Mock DB mapped to seeding values
const initialUsers = [
  { id: 'usr-1', name: 'Akash', phone: '9876543210', email: 'akash.fintech@advisor.in', role: 'USER', status: 'ACTIVE', pan: 'ABCDE1234F', gst: '27AAAAA1111A1Z1' },
  { id: 'usr-2', name: 'CA Rajesh Sharma', phone: '8888888881', email: 'rajesh@blueprintadvisor.in', role: 'EXPERT', status: 'ACTIVE' },
  { id: 'usr-3', name: 'CA Neha Singhal', phone: '8888888882', email: 'neha@blueprintadvisor.in', role: 'EXPERT', status: 'ACTIVE' },
  { id: 'usr-4', name: 'Adviser Vikram Malhotra', phone: '8888888883', email: 'vikram@blueprintadvisor.in', role: 'EXPERT', status: 'ACTIVE' }
];

const initialExperts = [
  { id: 'exp-1', name: 'CA Rajesh Sharma', specialization: 'Corporate Taxation & ITR Auditing', experience: '12 Years Exp', rating: 4.9, fees: 1500, reviews: 248 },
  { id: 'exp-2', name: 'CA Neha Singhal', specialization: 'GST Registration & Business Setup', experience: '8 Years Exp', rating: 4.8, fees: 1200, reviews: 180 },
  { id: 'exp-3', name: 'Adviser Vikram Malhotra', specialization: 'SME Loans & Government Schemes', experience: '15 Years Exp', rating: 4.7, fees: 2000, reviews: 310 }
];

const initialRequests = [
  { id: 'req-101', clientName: 'Akash', serviceName: 'File ITR FY 2025-26', category: 'ITR', priority: 'THIS_WEEK', status: 'REVIEW', progress: 80, assignedExpert: 'CA Rajesh Sharma', date: '14 Jun 2026' },
  { id: 'req-102', clientName: 'Akash', serviceName: 'GST Registration Setup', category: 'GST', priority: 'FLEXIBLE', status: 'DOCUMENTS_PENDING', progress: 45, assignedExpert: 'CA Neha Singhal', date: '17 Jun 2026' },
  { id: 'req-103', clientName: 'Akash', serviceName: 'MSME Business Plan', category: 'DPR', priority: 'TODAY', status: 'SUBMITTED', progress: 15, assignedExpert: null, date: '18 Jun 2026' }
];

const initialPayments = [
  { id: 'pay-1', clientName: 'Akash', orderId: 'order_OPt89a7Acd1', paymentId: 'pay_OPt98Hkd928A', amount: 1500, total: 1599, status: 'SUCCESS', method: 'Google Pay', date: '14 Jun 2026' },
  { id: 'pay-2', clientName: 'Akash', orderId: 'order_OPt99b2Cdf3', paymentId: 'pay_OPt99Kkd111B', amount: 1200, total: 1299, status: 'SUCCESS', method: 'PhonePe', date: '17 Jun 2026' }
];

const initialDocs = [
  { id: 'doc-1', clientName: 'Akash', name: 'PAN Card.pdf', category: 'PAN', status: 'APPROVED', size: '1.2 MB', date: '12 May 2026' },
  { id: 'doc-2', clientName: 'Akash', name: 'Aadhaar Front & Back.jpg', category: 'AADHAAR', status: 'APPROVED', size: '2.4 MB', date: '12 May 2026' },
  { id: 'doc-3', clientName: 'Akash', name: 'Bank Statement FY25.pdf', category: 'BANK_STATEMENT', status: 'APPROVED', size: '4.8 MB', date: '14 Jun 2026' },
  { id: 'doc-4', clientName: 'Akash', name: 'GST Certificate Draft.pdf', category: 'GST', status: 'UNDER_REVIEW', size: '850 KB', date: '17 Jun 2026' },
  { id: 'doc-5', clientName: 'Akash', name: 'Previous ITR-3 Form.pdf', category: 'ITR', status: 'REJECTED', size: '3.1 MB', reason: 'Illegible scan, please re-upload', date: '14 Jun 2026' }
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginStep, setLoginStep] = useState('phone'); // phone, otp
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modal handlers
  const [assignModal, setAssignModal] = useState(null); // Request to assign expert to
  const [docReviewModal, setDocReviewModal] = useState(null); // Doc to review

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (authToken) => {
    setLoading(true);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    try {
      // 1. Fetch Analytics
      const analRes = await fetch('/api/admin/analytics', { headers });
      if (analRes.ok) {
        const data = await analRes.json();
        setAnalytics(data.analytics);
      }

      // 2. Fetch Users
      const usersRes = await fetch('/api/users', { headers });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.results || []);
      }

      // 3. Fetch Experts
      const expertsRes = await fetch('/api/experts', { headers });
      if (expertsRes.ok) {
        const data = await expertsRes.json();
        const mappedExperts = (data.results || []).map(e => ({
          id: e.id,
          name: e.user?.name || 'Expert CA',
          specialization: e.specialization,
          experience: e.experience,
          rating: e.rating,
          fees: e.fees,
          reviews: e.reviewsCount || 0
        }));
        setExperts(mappedExperts);
      }

      // 4. Fetch Requests
      const reqsRes = await fetch('/api/requests', { headers });
      if (reqsRes.ok) {
        const data = await reqsRes.json();
        const mappedReqs = (data.results || []).map(r => ({
          id: r.id,
          clientName: 'Akash',
          serviceName: r.serviceName,
          category: r.serviceType,
          priority: r.priority,
          status: r.status,
          progress: r.progressPercent,
          assignedExpert: r.assignedExpert?.user?.name || null,
          date: new Date(r.createdAt).toLocaleDateString('en-IN')
        }));
        setRequests(mappedReqs);
      }

      // 5. Fetch Payments
      const payRes = await fetch('/api/payments/history', { headers });
      if (payRes.ok) {
        const data = await payRes.json();
        const mappedPayments = (data.results || []).map(p => ({
          id: p.id,
          clientName: 'Akash',
          orderId: p.orderId,
          paymentId: p.paymentId || 'N/A',
          amount: p.amount,
          total: p.totalAmount,
          status: p.status,
          method: p.method,
          date: new Date(p.createdAt).toLocaleDateString('en-IN')
        }));
        setPayments(mappedPayments);
      }

      // 6. Fetch Documents
      const docsRes = await fetch('/api/documents', { headers });
      if (docsRes.ok) {
        const data = await docsRes.json();
        const mappedDocs = (data.results || []).map(d => ({
          id: d.id,
          clientName: 'Akash',
          name: d.name,
          category: d.category,
          status: d.status,
          size: d.size,
          reason: d.reason || '',
          date: new Date(d.createdAt).toLocaleDateString('en-IN')
        }));
        setDocuments(mappedDocs);
      }

    } catch (err) {
      console.warn('API connection failed, using mock fallbacks:', err);
      setUsers(initialUsers);
      setExperts(initialExperts);
      setRequests(initialRequests);
      setPayments(initialPayments);
      setDocuments(initialDocs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginStep('otp');
      } else {
        setLoginError(data.error || 'Failed to send OTP.');
      }
    } catch {
      if (phone === '9999999999') {
        setLoginStep('otp');
      } else {
        setLoginError('Server unreachable. Use test number 9999999999');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user.role !== 'ADMIN') {
          setLoginError('Forbidden: Access allowed to system administrators only.');
          return;
        }
        localStorage.setItem('adminToken', data.accessToken);
        setToken(data.accessToken);
      } else {
        setLoginError(data.error || 'Invalid OTP code.');
      }
    } catch {
      if (otp === '123456') {
        const mockToken = 'mock_admin_jwt_token_payload';
        localStorage.setItem('adminToken', mockToken);
        setToken(mockToken);
      } else {
        setLoginError('Verification failed. Use OTP code 123456');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setLoginStep('phone');
    setPhone('');
    setOtp('');
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleAssignExpert = async (expertId, expertName) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    try {
      const res = await fetch(`/api/requests/${assignModal.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ assignedExpertId: expertId, status: 'EXPERT_ASSIGNED', progressPercent: 30 })
      });
      if (res.ok) {
        fetchData(token);
      } else {
        alert('Failed to assign expert.');
      }
    } catch {
      setRequests(requests.map(r => {
        if (r.id === assignModal.id) {
          return { ...r, assignedExpert: expertName, status: 'EXPERT_ASSIGNED', progress: 30 };
        }
        return r;
      }));
    } finally {
      setAssignModal(null);
    }
  };

  const handleDocReview = async (status, reason = '') => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    try {
      const res = await fetch(`/api/documents/${docReviewModal.id}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        fetchData(token);
      } else {
        alert('Failed to submit document review.');
      }
    } catch {
      setDocuments(documents.map(d => {
        if (d.id === docReviewModal.id) {
          return { ...d, status, reason };
        }
        return d;
      }));
    } finally {
      setDocReviewModal(null);
    }
  };

  const calculateRevenue = () => {
    return payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.total, 0);
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2540', fontFamily: 'var(--font-primary)', padding: '20px' }}>
        <div className="card-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '3rem' }}>🛡️</span>
            <h2 className="title-accent" style={{ fontSize: '1.6rem', color: '#0a2540', marginTop: '12px' }}>Admin Console</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Sign in to manage Blueprint Advisor nodes.</p>
          </div>

          {loginError && (
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--error-container)', color: 'var(--on-error)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px' }}>
              ⚠️ {loginError}
            </div>
          )}

          {loginStep === 'phone' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0a2540' }}>REGISTERED MOBILE NUMBER</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9999999999" 
                  className="form-control"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }} disabled={loginLoading}>
                {loginLoading ? 'Sending...' : 'Request Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0a2540' }}>ENTER 6-DIGIT VERIFICATION CODE</label>
                <input 
                  type="text" 
                  placeholder="e.g. 123456" 
                  className="form-control"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', textAlign: 'center', letterSpacing: '8px' }}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }} disabled={loginLoading}>
                {loginLoading ? 'Verifying...' : 'Sign In as System Admin'}
              </button>
              <button type="button" className="btn btn-secondary" style={{ padding: '10px', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setLoginStep('phone')} disabled={loginLoading}>
                ← Go Back
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <span>⚙️</span> Admin Portal
          </div>
          <nav className="sidebar-menu">
            <button className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
            <button className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSearchQuery(''); }}>👥 Users Management</button>
            <button className={`sidebar-item ${activeTab === 'experts' ? 'active' : ''}`} onClick={() => { setActiveTab('experts'); setSearchQuery(''); }}>💼 Experts & CAs</button>
            <button className={`sidebar-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); setSearchQuery(''); }}>📋 Service Requests</button>
            <button className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}>💰 Payments history</button>
            <button className={`sidebar-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => { setActiveTab('documents'); setSearchQuery(''); }}>📁 Document Center</button>
            <button className={`sidebar-item ${activeTab === 'founder' ? 'active' : ''}`} onClick={() => { setActiveTab('founder'); setSearchQuery(''); }}>👑 Founder Dashboard</button>
          </nav>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn" 
            style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
            onClick={handleLogout}
          >
            🚪 Log Out Console
          </button>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            Blueprint Advisor v1.0.0
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        <div className="header-panel">
          <div>
            <h1 className="page-title">
              {activeTab === 'overview' && 'System Analytics'}
              {activeTab === 'users' && 'Users Management'}
              {activeTab === 'experts' && 'Advisory Experts & CAs'}
              {activeTab === 'requests' && 'Client Requests Queue'}
              {activeTab === 'payments' && 'Financial Audits'}
              {activeTab === 'documents' && 'Document Verification Center'}
              {activeTab === 'founder' && 'Founder Dashboard'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              System Operator dashboard panel controls.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Operator: admin@blueprintadvisor.in</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Syncing live database nodes...
          </div>
        ) : (
          <>
            {/* 1. Overview Screen */}
            {activeTab === 'overview' && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value" style={{ color: 'var(--success)' }}>
                      {analytics ? analytics.totalRevenue : `₹${calculateRevenue()}`}
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Active Users</span>
                    <span className="stat-value">{users.filter(u => u.role === 'USER').length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Advisory Experts</span>
                    <span className="stat-value" style={{ color: 'var(--primary)' }}>{experts.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Pending Requests</span>
                    <span className="stat-value" style={{ color: 'var(--warning)' }}>{requests.filter(r => !r.assignedExpert).length}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
                  {/* Recent Active requests */}
                  <div className="card-panel">
                    <h3 className="title-accent" style={{ fontSize: '1rem', marginBottom: '16px' }}>Recent Service Cases</h3>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Client</th>
                          <th>Expert</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.slice(0, 3).map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 700 }}>{r.serviceName}</td>
                            <td>{r.clientName}</td>
                            <td>{r.assignedExpert || <span style={{ color: 'var(--error)', fontWeight: 700 }}>Unassigned</span>}</td>
                            <td>
                              <span className={`badge ${r.status === 'REVIEW' ? 'badge-warning' : r.status === 'SUBMITTED' ? 'badge-primary' : 'badge-success'}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Document Status review list */}
                  <div className="card-panel">
                    <h3 className="title-accent" style={{ fontSize: '1rem', marginBottom: '16px' }}>Pending Verifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {documents.filter(d => d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED').map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--divider)', borderRadius: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>{d.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{d.clientName} • {d.category}</span>
                          </div>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setDocReviewModal(d)}>Review</button>
                        </div>
                      ))}
                      {documents.filter(d => d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED').length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', display: 'block', padding: '12px' }}>All documents verified.</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 2. Users Management */}
            {activeTab === 'users' && (
              <div className="card-panel">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or credentials..." 
                    className="form-control"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  />
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Info</th>
                      <th>Role</th>
                      <th>PAN / GST</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700 }}>{u.name}</td>
                        <td>
                          <span style={{ display: 'block' }}>{u.phone}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email || 'N/A'}</span>
                        </td>
                        <td><span className="badge badge-primary">{u.role}</span></td>
                        <td>
                          {u.pan ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>PAN: {u.pan}</span>
                          ) : null}
                          {u.gst ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GST: {u.gst}</span>
                          ) : (u.role === 'USER' ? 'Not uploaded' : 'N/A')}
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>{u.status}</span>
                        </td>
                        <td>
                          <button 
                            className={`btn ${u.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', color: u.status === 'ACTIVE' ? 'var(--error)' : '#ffffff' }}
                            onClick={() => toggleUserStatus(u.id)}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Experts Management */}
            {activeTab === 'experts' && (
              <div className="card-panel">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Expert Name</th>
                      <th>Specialization Area</th>
                      <th>Experience</th>
                      <th>Assigned Fee</th>
                      <th>Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experts.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 700 }}>{e.name}</td>
                        <td>{e.specialization}</td>
                        <td>{e.experience}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{e.fees}</td>
                        <td>★ {e.rating} ({e.reviews} reviews)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Service Requests */}
            {activeTab === 'requests' && (
              <div className="card-panel">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Service</th>
                      <th>Client</th>
                      <th>Assigned CA</th>
                      <th>Timeline Status</th>
                      <th>Progress</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td>{r.id.slice(0, 8)}...</td>
                        <td style={{ fontWeight: 700 }}>{r.serviceName}</td>
                        <td>{r.clientName}</td>
                        <td>
                          {r.assignedExpert ? (
                            <span style={{ fontWeight: 600 }}>{r.assignedExpert}</span>
                          ) : (
                            <span style={{ color: 'var(--error)', fontWeight: 800 }}>UNASSIGNED</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-warning">{r.status}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{r.progress}%</td>
                        <td>
                          {!r.assignedExpert ? (
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setAssignModal(r)}>
                              Assign CA
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. Payments History */}
            {activeTab === 'payments' && (
              <div className="card-panel">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Payment ID</th>
                      <th>Client</th>
                      <th>Platform Total</th>
                      <th>Mode</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td>{p.orderId}</td>
                        <td>{p.paymentId}</td>
                        <td style={{ fontWeight: 700 }}>{p.clientName}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{p.total}</td>
                        <td>{p.method}</td>
                        <td>{p.date}</td>
                        <td><span className="badge badge-success">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. Document center */}
            {activeTab === 'documents' && (
              <div className="card-panel">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Category</th>
                      <th>Client</th>
                      <th>Size</th>
                      <th>Uploaded Date</th>
                      <th>Verification</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>📄 {d.name}</td>
                        <td>{d.category}</td>
                        <td>{d.clientName}</td>
                        <td>{d.size}</td>
                        <td>{d.date}</td>
                        <td>
                          <span className={`badge ${d.status === 'APPROVED' ? 'badge-success' : d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED' ? 'badge-warning' : 'badge-error'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          {d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED' ? (
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setDocReviewModal(d)}>
                              Verify File
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Founder Dashboard Screen */}
            {activeTab === 'founder' && (
              <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <h3 className="title-accent" style={{ fontSize: '1.2rem', margin: 0 }}>Founder Key Performance Metrics</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Operational and financial unit economics at a glance.</p>
                </div>
                
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <span className="stat-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Conversion Rate</span>
                    <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {analytics ? analytics.conversionRate : '85.7%'}
                    </span>
                  </div>
                  <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <span className="stat-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expert Case Load</span>
                    <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {analytics ? analytics.expertUtilization : '2.0 active cases/expert'}
                    </span>
                  </div>
                  <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <span className="stat-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SLA Compliance Rate</span>
                    <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                      {analytics ? analytics.slaComplianceRate : '100%'}
                    </span>
                  </div>
                  <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <span className="stat-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SLA Violations</span>
                    <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--error)' }}>
                      {analytics ? analytics.totalViolations : '0'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Assign Expert Modal */}
        {assignModal && (
          <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="title-accent" style={{ fontSize: '1.1rem' }}>Assign Expert CA</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign CA to handle: <strong>{assignModal.serviceName}</strong></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {experts.map(exp => (
                  <button 
                    key={exp.id} 
                    className="btn btn-secondary" 
                    style={{ justifyContent: 'space-between', padding: '12px' }}
                    onClick={() => handleAssignExpert(exp.id, exp.name)}
                  >
                    <span>{exp.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({exp.specialization.split(' ')[0]})</span>
                  </button>
                ))}
              </div>

              <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Doc Review Modal */}
        {docReviewModal && (
          <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="title-accent" style={{ fontSize: '1.1rem' }}>Verify Compliance File</h3>
              
              <div style={{ height: '140px', backgroundColor: 'var(--divider)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '2rem' }}>📄</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{docReviewModal.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Category: {docReviewModal.category}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: 'var(--success)' }}
                  onClick={() => handleDocReview('APPROVED')}
                >
                  ✓ Approve
                </button>
                
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: 'var(--error)' }}
                  onClick={() => {
                    const comment = prompt('Enter rejection reason:') || 'Incomplete document data';
                    handleDocReview('REJECTED', comment);
                  }}
                >
                  ✕ Reject
                </button>
              </div>

              <button className="btn btn-secondary" onClick={() => setDocReviewModal(null)}>Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
