import { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import { api } from '../services/apiService';

const statusSteps = ['NEW', 'EXPERT_ASSIGNED', 'DOCUMENTS_PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export default function CaseDetail({ token, user, onNavigate, showNotification, params }) {
  const [req, setReq] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(null); // holds doc object
  const [rejectReason, setRejectReason] = useState('');
  const [updatingDocId, setUpdatingDocId] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

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

  useEffect(() => {
    if (params?.requestId) fetchReq();
  }, [params?.requestId, token, showNotification]);

  // Call timer simulation
  useEffect(() => {
    let interval;
    if (callActive) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading case details...
      </div>
    );
  }
  
  if (!req) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Case not found.</h3>
        <button onClick={() => onNavigate('cases')} className="btn btn-primary" style={{ marginTop: '12px' }}>
          Go back to dashboard
        </button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(req.status);

  const handleUpdateStatus = async (newStatus, progress) => {
    try {
      await api.updateRequest(token, req.id, { status: newStatus, progressPercent: progress });
      setReq(prev => ({ ...prev, status: newStatus, progressPercent: progress }));
      showNotification(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDownloadDoc = async (docId) => {
    try {
      showNotification('Generating secure link...', 'info');
      const res = await api.getDocumentDownloadUrl(token, docId);
      if (res && res.url) {
        window.open(res.url, '_blank');
        showNotification('Opening document...', 'success');
      } else {
        showNotification('Failed to generate download link', 'error');
      }
    } catch (err) {
      console.error('Download error:', err);
      showNotification('Error opening document', 'error');
    }
  };

  const handleDocAction = async (docId, newStatus, reason = '') => {
    try {
      setUpdatingDocId(docId);
      await api.updateDocumentStatus(token, docId, newStatus, reason);
      
      // Update local state
      setReq(prev => {
        const updatedDocs = prev.documents.map(d => 
          d.id === docId ? { ...d, status: newStatus, reason } : d
        );
        return { ...prev, documents: updatedDocs };
      });
      
      showNotification(`Document ${newStatus.toLowerCase()} successfully`, 'success');
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err) {
      showNotification('Failed to update document', 'error');
    } finally {
      setUpdatingDocId(null);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const clientName = req.client?.name || 'Client';
  const bookings = req.bookings || [];

  return (
    <div style={{ paddingBottom: '100px', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Premium Header */}
      <div style={styles.header}>
        <button onClick={() => onNavigate('cases')} style={styles.backBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Case Workspace</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>ID: {req.id.substring(0, 8).toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowChat(true)} style={styles.headerIconBtn}>
            💬
            <span style={styles.pulseDot}></span>
          </button>
          <button onClick={() => setCallActive(true)} style={styles.headerIconBtn}>📞</button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Service Title Card */}
        <div className="card" style={styles.serviceCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <span style={styles.serviceCategory}>TAX SERVICE</span>
              <h2 style={styles.serviceTitle}>{req.serviceName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <span style={{ fontSize: '1rem' }}>👤</span>
                <span style={{ fontWeight: 600 }}>{clientName}</span>
              </div>
            </div>
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 800, fontSize: '0.72rem', padding: '6px 12px', borderRadius: '12px' }}>
              {req.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Stepper */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <h3 style={styles.sectionTitle}>Case Progress Checklist</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {statusSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isWip = req.status === 'IN_PROGRESS' && step === 'IN_PROGRESS';

              let progressMapVal = 20;
              if (step === 'NEW') progressMapVal = 0;
              else if (step === 'EXPERT_ASSIGNED') progressMapVal = 20;
              else if (step === 'DOCUMENTS_PENDING') progressMapVal = 40;
              else if (step === 'IN_PROGRESS') progressMapVal = 60;
              else if (step === 'REVIEW') progressMapVal = 80;
              else if (step === 'COMPLETED') progressMapVal = 100;

              return (
                <div 
                  key={step} 
                  onClick={() => handleUpdateStatus(step, progressMapVal)}
                  style={{
                    ...styles.stepRow,
                    borderColor: isActive ? 'var(--primary)' : 'var(--border-light)',
                    backgroundColor: isActive ? 'var(--primary-light)' : '#FFF'
                  }}
                >
                  <div style={{
                    ...styles.stepDot,
                    backgroundColor: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : '#E5E7EB',
                    color: '#FFF'
                  }}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: isActive ? 'var(--primary-dark)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {step.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {isActive ? 'Active Stage - tap to set progress' : 'Checklist marker'}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {req.progressPercent || progressMapVal}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Document Verification Center */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={styles.sectionTitle}>Uploaded Documents</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {req.documents?.length || 0} Total
            </span>
          </div>

          {(!req.documents || req.documents.length === 0) ? (
            <div style={styles.emptyBox}>
              <span style={{ fontSize: '2.5rem' }}>📂</span>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '8px' }}>Waiting for document uploads</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                Client hasn't uploaded PAN, Form 16, or bank statements yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {req.documents.map(doc => {
                const isUploaded = doc.status === 'UPLOADED';
                const isApproved = doc.status === 'APPROVED';
                const isRejected = doc.status === 'REJECTED';

                return (
                  <div key={doc.id} style={styles.docRow}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div 
                        style={{ ...styles.docIconWrap, cursor: 'pointer' }}
                        onClick={() => handleDownloadDoc(doc.id)}
                        title="Download Document"
                      >
                        📁
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 
                          style={{ ...styles.docName, cursor: 'pointer', color: '#2563EB', textDecoration: 'underline' }}
                          onClick={() => handleDownloadDoc(doc.id)}
                          title="Download/Open Document"
                        >
                          {doc.name}
                        </h4>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Size: {doc.size || '1.2 MB'} • Category: <strong style={{ color: 'var(--primary-dark)' }}>{doc.category}</strong>
                        </span>
                        {isRejected && doc.reason && (
                          <div style={styles.rejectReasonBox}>
                            <strong>Rejection Reason:</strong> {doc.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isUploaded ? (
                        <>
                          <button 
                            disabled={updatingDocId !== null}
                            onClick={() => handleDocAction(doc.id, 'APPROVED')}
                            style={{ ...styles.docActionBtn, backgroundColor: 'var(--success-light)', color: 'var(--success)', border: 'none', cursor: 'pointer' }}
                            title="Approve Document"
                          >
                            ✓
                          </button>
                          <button 
                            disabled={updatingDocId !== null}
                            onClick={() => setShowRejectModal(doc)}
                            style={{ ...styles.docActionBtn, backgroundColor: 'var(--error-light)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}
                            title="Reject Document"
                          >
                            ✗
                          </button>
                        </>
                      ) : (
                        <span 
                          style={{
                            ...styles.docStatusBadge,
                            backgroundColor: isApproved ? 'var(--success-light)' : 'var(--error-light)',
                            color: isApproved ? 'var(--success)' : 'var(--error)'
                          }}
                        >
                          {isApproved ? 'Approved ✓' : 'Rejected ✗'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Appointment details */}
        {bookings.length > 0 && (
          <div className="card" style={{ padding: '20px 16px' }}>
            <h3 style={styles.sectionTitle}>Scheduled Consultation</h3>
            {bookings.map((booking, idx) => (
              <div key={booking.id || idx} style={styles.bookingRow}>
                <div style={styles.bookingIcon}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {booking.type === 'VIDEO' ? 'Video Meeting Room' : 'Direct Phone Consultation'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {booking.date} • {booking.time} • Status: <strong style={{ color: 'var(--success)' }}>{booking.status}</strong>
                  </div>
                </div>
                <button onClick={() => setCallActive(true)} className="btn btn-primary" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem' }}>
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Rejection Modal Overlay */}
      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div className="card animate-scale-in" style={styles.modalContent}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.05rem', fontWeight: 800 }}>Reject Document</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.3 }}>
              Specify why you are rejecting <strong>{showRejectModal.name}</strong>. The client will be notified to re-upload.
            </p>
            <textarea
              style={styles.modalTextarea}
              placeholder="E.g. Scanning blur hai / PDF files cut ho rahi hain..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }} 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
              <button 
                disabled={!rejectReason.trim()}
                onClick={() => handleDocAction(showRejectModal.id, 'REJECTED', rejectReason)} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--error)' }}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Video Call Overlay Portal */}
      {callActive && (
        <div style={styles.callOverlay}>
          <div style={styles.callContent}>
            <div style={styles.callHeader}>
              <span style={styles.callLiveBadge}>LIVE MEETING</span>
              <div style={styles.callTimer}>{formatTime(callTimer)}</div>
            </div>
            
            <div style={styles.callUserWrapper}>
              <div style={styles.avatarLarge}>
                👤
                <div style={styles.voicePulse}></div>
              </div>
              <h2 style={styles.callClientName}>{clientName}</h2>
              <span style={styles.callServiceLabel}>{req.serviceName}</span>
            </div>

            <div style={styles.callWaveform}>
              <div style={{ height: '30px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '50px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '80px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '40px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '60px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '20px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              <div style={{ height: '45px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
            </div>

            <div style={styles.callControls}>
              <button style={{ ...styles.callIconBtn, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}>🎙️</button>
              <button style={{ ...styles.callIconBtn, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}>📷</button>
              <button onClick={() => setCallActive(false)} style={{ ...styles.callIconBtn, backgroundColor: 'var(--error)', border: 'none' }}>
                📞
              </button>
            </div>
          </div>
        </div>
      )}

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

const styles = {
  header: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1.5px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  backBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  headerIconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    position: 'relative',
    cursor: 'pointer'
  },
  pulseDot: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--error)'
  },
  serviceCard: {
    background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
    color: '#FFFFFF',
    padding: '20px',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.15)'
  },
  serviceCategory: {
    fontSize: '0.62rem',
    fontWeight: 800,
    letterSpacing: '1px',
    opacity: 0.8,
    display: 'block'
  },
  serviceTitle: {
    fontSize: '1.18rem',
    fontWeight: 800,
    marginTop: '4px',
    margin: 0,
    lineHeight: 1.2
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  stepDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.72rem'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '24px 16px',
    background: 'var(--bg)',
    borderRadius: '16px',
    marginTop: '12px',
    border: '1.5px dashed var(--border)'
  },
  docRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid var(--border-light)',
    backgroundColor: '#FAFAFA'
  },
  docIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(13,148,136,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0
  },
  docName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  docActionBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.85rem'
  },
  docStatusBadge: {
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: '8px'
  },
  rejectReasonBox: {
    marginTop: '6px',
    padding: '6px 10px',
    backgroundColor: 'var(--error-light)',
    color: 'var(--error)',
    borderRadius: '6px',
    fontSize: '0.68rem',
    lineHeight: 1.3
  },
  bookingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid var(--border-light)',
    backgroundColor: '#FAFAFA',
    marginTop: '12px'
  },
  bookingIcon: {
    fontSize: '1.3rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    width: '90%',
    maxWidth: '340px',
    padding: '20px',
    borderRadius: '20px'
  },
  modalTextarea: {
    width: '100%',
    height: '80px',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    padding: '10px',
    fontSize: '0.78rem',
    outline: 'none',
    resize: 'none'
  },
  callOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1E2E',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  callContent: {
    width: '100%',
    height: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40px 24px',
    position: 'relative'
  },
  callHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  callLiveBadge: {
    fontSize: '0.62rem',
    fontWeight: 900,
    color: '#FFF',
    backgroundColor: 'var(--success)',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '1px'
  },
  callTimer: {
    color: '#FFF',
    fontSize: '1.1rem',
    fontWeight: 700,
    fontFamily: 'monospace'
  },
  callUserWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  avatarLarge: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: '#2D2D44',
    fontSize: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  voicePulse: {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '2px solid rgba(13,148,136,0.3)',
    animation: 'pulse 2s infinite'
  },
  callClientName: {
    color: '#FFF',
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: 0
  },
  callServiceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  callWaveform: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '80px',
    width: '100%'
  },
  callControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    width: '100%'
  },
  callIconBtn: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    color: '#FFF',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  }
};
