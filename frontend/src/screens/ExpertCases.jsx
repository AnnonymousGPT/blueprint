import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ExpertCases({ requests, onSelectCase }) {
  const [filter, setFilter] = useState('ALL');

  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const getFilteredRequests = () => {
    if (filter === 'PENDING') {
      return requests.filter(r => r.status === 'DOCUMENTS_PENDING' || r.status === 'Submitted');
    }
    if (filter === 'REVIEW') {
      return requests.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'Review Stage' || r.status === 'EXPERT_ASSIGNED');
    }
    if (filter === 'COMPLETED') {
      return requests.filter(r => r.status === 'COMPLETED' || r.status === 'Completed');
    }
    return requests;
  };

  const filtered = getFilteredRequests();

  return (
    <div className="screen-shell animate-fade-in-up" style={{ gap: 16, paddingTop: 16 }}>
      <div>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px' }}>CASE LIST</span>
        <h3 className="title-accent" style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          My Cases
        </h3>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: 'All Cases' },
          { key: 'PENDING', label: 'Pending' },
          { key: 'REVIEW', label: 'Reviewing' },
          { key: 'COMPLETED', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              playHaptic();
              setFilter(tab.key);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              border: '1.5px solid var(--border-color)',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: filter === tab.key ? '#3b82f6' : 'var(--bg-card)',
              color: filter === tab.key ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 36
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cases list view */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            No cases match this status filter.
          </div>
        ) : (
          filtered.map(req => (
            <div
              key={req.id}
              onClick={() => {
                playHaptic();
                onSelectCase(req);
              }}
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {req.serviceName}
                </h4>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: 3 }}>
                  Client: {req.client?.name || 'Advisor Client'}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', display: 'block', marginTop: 4 }}>
                  Assigned on: {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 900,
                  color: req.status === 'DOCUMENTS_PENDING' ? '#ef4444' : '#10b981',
                  backgroundColor: req.status === 'DOCUMENTS_PENDING' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                  padding: '4px 8px',
                  borderRadius: 8
                }}>
                  {req.status}
                </span>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Progress: {req.progressPercent || 0}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
