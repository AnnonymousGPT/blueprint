import { useState, useEffect } from 'react';
import { api } from '../services/apiService';

export default function Cases({ token, user, onNavigate, showNotification }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.getRequests(token);
        setRequests(res.data || []);
      } catch (err) {
        showNotification('Failed to load cases', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token, showNotification]);

  const filters = ['All', 'Urgent', 'In Progress', 'Review', 'Completed'];

  const filteredRequests = requests.filter(req => {
    const clientName = req.client?.name || 'Unknown Client';
    const matchesSearch = clientName.toLowerCase().includes(search.toLowerCase()) || 
                          (req.serviceName && req.serviceName.toLowerCase().includes(search.toLowerCase()));
    
    let matchesFilter = true;
    if (filter === 'Urgent') matchesFilter = req.priority === 'TODAY';
    if (filter === 'In Progress') matchesFilter = req.status === 'IN_PROGRESS' || req.status === 'DOCUMENTS_PENDING';
    if (filter === 'Review') matchesFilter = req.status === 'REVIEW' || req.status === 'UPLOADED' || req.status === 'UNDER_REVIEW';
    if (filter === 'Completed') matchesFilter = req.status === 'COMPLETED';

    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (prio) => {
    if (prio === 'TODAY') return 'badge-error';
    if (prio === 'THIS_WEEK') return 'badge-warning';
    return 'badge-success';
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'badge-success';
    if (['REVIEW', 'UPLOADED', 'UNDER_REVIEW'].includes(status)) return 'badge-warning';
    if (status === 'IN_PROGRESS') return 'badge-info';
    return 'badge'; // default gray
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '32px' }}>
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>My Cases</h2>
        <button 
          onClick={() => onNavigate('notifications')}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          🔔
        </button>
      </div>

      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '12px', fontSize: '1rem' }}>🔍</span>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by client or service..." 
          style={{ paddingLeft: '40px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              borderRadius: '99px',
              whiteSpace: 'nowrap',
              border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border-light)'}`,
              background: filter === f ? 'var(--primary)' : 'white',
              color: filter === f ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filteredRequests.length > 0 ? (
        <div className="flex-col gap-4">
          {filteredRequests.map(req => (
            <div 
              key={req.id} 
              className="card" 
              onClick={() => onNavigate('caseDetail', { requestId: req.id })}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="flex-row gap-2">
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    📋
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{req.serviceName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {req.client?.name || 'Unknown Client'} • {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`badge ${getPriorityColor(req.priority)}`}>
                  {req.priority.replace('_', ' ')}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ color: 'var(--primary)' }}>{req.progressPercent || 0}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--primary)', width: `${req.progressPercent || 0}%`, borderRadius: '3px' }}></div>
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <span className={`badge ${getStatusColor(req.status)}`}>
                  {req.status.replace('_', ' ')}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ₹{req.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h3 style={{ marginBottom: '8px' }}>No cases found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Adjust your filters or check back later.</p>
        </div>
      )}
    </div>
  );
}
