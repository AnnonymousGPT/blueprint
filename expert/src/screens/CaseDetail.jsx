import { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import { api } from '../services/apiService';

const statusSteps = ['SUBMITTED', 'EXPERT_ASSIGNED', 'DOCUMENTS_PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export default function CaseDetail({ token, user, onNavigate, showNotification, params }) {
  const [req, setReq] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReq = async () => {
      try {
        const res = await api.getRequests(token);
        const found = res.data?.find(r => r.id === params?.requestId);
        if (found) setReq(found);
      } catch (err) {
        showNotification('Failed to load case details', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (params?.requestId) fetchReq();
  }, [params?.requestId, token, showNotification]);

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (!req) return <div style={{ padding: '24px' }}>Case not found. <button onClick={() => onNavigate('cases')}>Go back</button></div>;

  const currentStepIndex = statusSteps.indexOf(req.status);
  
  const handleUpdateStatus = async (newStatus, progress) => {
    try {
      await api.updateRequest(token, req.id, { status: newStatus, progress });
      setReq({ ...req, status: newStatus, progress });
      showNotification(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const getPriorityColorText = (prio) => {
    if (prio === 'TODAY') return 'var(--error)';
    if (prio === 'THIS_WEEK') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => onNavigate('cases')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700 }}>Case Details</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.id.toUpperCase()}</div>
        </div>
        <div className="flex-row gap-2">
          <button onClick={() => setShowChat(true)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>💬</button>
          <button style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}>📞</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Service Info Card */}
        <div className="card" style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', marginBottom: '24px' }}>
          <div className="flex-row gap-4">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              📁
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', color: 'var(--primary-dark)' }}>{req.serviceName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>👤 {req.client?.name || 'Client'}</div>
              <div style={{ fontSize: '0.85rem', color: req.priority === 'TODAY' ? 'var(--error)' : 'var(--text-muted)' }}>
                📅 Due: {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#92400E' }}>
                {req.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', left: '20px', right: '20px', height: '2px', background: 'var(--border-light)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '12px', left: '20px', width: `${(Math.max(0, currentStepIndex - 1) / 4) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s' }}></div>
            
            {[
              { label: 'Assigned', icon: '👤' },
              { label: 'Docs', icon: '📄' },
              { label: 'WIP', icon: '⚙️' },
              { label: 'Review', icon: '👀' },
              { label: 'Done', icon: '✅' }
            ].map((step, idx) => {
              const stepIndex = idx + 1; // Map UI steps to backend status steps
              const isCompleted = currentStepIndex > stepIndex;
              const isActive = currentStepIndex === stepIndex;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '40px' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: isCompleted ? 'var(--primary)' : isActive ? 'var(--primary)' : 'white',
                    border: `2px solid ${isCompleted || isActive ? 'var(--primary)' : 'var(--border-light)'}`,
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', marginBottom: '8px'
                  }}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Grid */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px 8px' }}>
          <div className="grid-2 gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="flex-col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>3 Docs</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Uploaded</div>
            </div>
            <div className="flex-col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🔴</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: getPriorityColorText(req.priority) }}>
                {req.priority.split('_')[0]}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Priority</div>
            </div>
            <div className="flex-col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📅</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Today</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due Date</div>
            </div>
            <div className="flex-col" style={{ alignItems: 'center', textAlign: 'center', gridColumn: '1 / span 3', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
               <div>
                 <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{(req.client?.name || 'Client').split(' ')[0]}</div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Client</div>
               </div>
               <div>
                 <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{req.amount}</div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paid</div>
               </div>
               <div>
                 <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.serviceId}</div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Service ID</div>
               </div>
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Next Action</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            onClick={() => handleUpdateStatus('IN_PROGRESS', 50)}
            className="btn btn-outline"
            style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px' }}
          >
            <span style={{ fontSize: '1.5rem' }}>▶️</span>
            <span>Continue Work</span>
          </button>
          <button 
            onClick={() => handleUpdateStatus('DOCUMENTS_PENDING', 20)}
            className="btn btn-outline"
            style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px' }}
          >
            <span style={{ fontSize: '1.5rem' }}>📥</span>
            <span>Request Docs</span>
          </button>
          <button 
            onClick={() => onNavigate('calendar')}
            className="btn btn-outline"
            style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', borderColor: 'var(--warning)', color: 'var(--warning)' }}
          >
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <span>Schedule Call</span>
          </button>
          <button 
            onClick={() => handleUpdateStatus('COMPLETED', 100)}
            className="btn btn-outline"
            style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px' }}
          >
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <span>Mark Complete</span>
          </button>
        </div>
      </div>
      {/* ChatBox Overlay */}
      {showChat && (
        <ChatBox 
          currentUserId={user?.id}
          otherUserId={req?.clientId || req?.userId} 
          onClose={() => setShowChat(false)}
          addNotification={showNotification}
          token={token}
        />
      )}
    </div>
  );
}
