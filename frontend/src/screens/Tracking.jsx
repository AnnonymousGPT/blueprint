import { useState } from 'react';
import ChatBox from '../components/ChatBox';

export default function Tracking({ requests, documents = [], selectedRequestId, onBackToHome, setActiveTab, addNotification, user }) {
  const [manualRequestId, setManualRequestId] = useState(null);
  const resolvedRequestId = selectedRequestId || manualRequestId;
  const activeRequest = requests.find((request) => request.id === resolvedRequestId) || requests[0];
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // Interactive Live Chat State
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'expert', text: "Hello Akash, I have started reviewing your taxation fields. Everything looks clean so far.", time: "10:32 AM", read: true },
    { id: 2, sender: 'user', text: "Great. Did you check the Crypto gains declaration too?", time: "10:35 AM", read: true },
    { id: 3, sender: 'expert', text: "Yes, I am verifying that against your transaction statements. I will let you know if I need any more document uploads.", time: "10:36 AM", read: true }
  ]);
  const [inputText, setInputText] = useState('');

  if (!activeRequest) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', backgroundColor: 'var(--bg-phone)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No active requests found</h3>
        <button className="btn btn-primary" onClick={onBackToHome} style={{ marginTop: '16px' }}>Back to home</button>
      </div>
    );
  }

  const expert = activeRequest.assignedExpert;

  const handleAction = (type) => {
    if (type === 'Chat') {
      setShowChat(true);
    } else {
      addNotification(`Calling ${expert.name} via secure proxy dialer...`, 'info');
    }
  };

  const handleDownload = (filename) => {
    addNotification(`Downloading ${filename}...`, 'success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: inputText,
      time: "Just Now",
      read: false
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate expert auto-reply
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'expert',
          text: "Received! Let me verify this and get back to you shortly.",
          time: "Just Now",
          read: true
        }
      ]);
      addNotification(`${expert.name} replied to your message.`, 'info');
    }, 1500);
  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  // Helper active sub-status messages based on progress
  const getSubtaskDetails = (progress) => {
    if (progress >= 80) {
      return {
        task: `${expert?.name || 'Your advisor'} is wrapping up the draft.`,
        eta: "Today, before 5:00 PM"
      };
    }
    if (progress >= 40) {
      return {
        task: `${expert?.name || 'Your advisor'} is checking your files.`,
        eta: "Tomorrow, before noon"
      };
    }
    return {
      task: `Waiting for assignment.`,
      eta: "Within 24 hours"
    };
  };

  const getTimelineSteps = (status, progressPercent) => {
    const steps = [
      { key: 'NEW', title: 'Request Submitted', desc: 'Case received by Blueprint.' },
      { key: 'EXPERT_ASSIGNED', title: 'Expert Assigned', desc: 'A dedicated advisor is on your case.' },
      { key: 'DOCUMENTS_PENDING', title: 'Documents Verification', desc: 'Please upload files for review.' },
      { key: 'IN_PROGRESS', title: 'Work in Progress', desc: 'Your advisor is preparing drafts.' },
      { key: 'REVIEW', title: 'Draft Review', desc: 'Approve or comment on ready drafts.' },
      { key: 'COMPLETED', title: 'Filing Completed', desc: 'Case successfully submitted and closed.' }
    ];

    const currentIdx = steps.findIndex(s => s.key === status);
    
    return steps.map((s, idx) => {
      let stepStatus = 'pending';
      if (status === 'COMPLETED') {
        stepStatus = 'completed';
      } else if (idx < currentIdx) {
        stepStatus = 'completed';
      } else if (idx === currentIdx) {
        stepStatus = 'active';
      } else {
        stepStatus = 'pending';
      }

      return {
        title: s.title,
        desc: s.desc,
        status: stepStatus
      };
    });
  };

  const progress = activeRequest.progressPercent !== undefined ? activeRequest.progressPercent : (activeRequest.progress !== undefined ? activeRequest.progress : 0);
  const timeline = activeRequest.timeline || getTimelineSteps(activeRequest.status, progress);
  const details = getSubtaskDetails(progress);

  // Mocked chat logic removed in favor of ChatBox component
  
  // Render Standard Tracking Mode
  return (
    <div 
      className="screen-shell animate-fade-in-up"
      style={{
        gap: '16px',
        paddingTop: '20px',
        paddingBottom: '160px',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Back Button */}
        <button 
          onClick={onBackToHome}
          aria-label="Back"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Title & Status */}
        <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
          <h3 className="title-accent" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {activeRequest.serviceName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
              Active Stage: <span style={{ color: '#2563EB', fontWeight: 800 }}>{activeRequest.status}</span>
            </span>
          </div>
        </div>

        {/* Menu Button */}
        <button 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          onClick={() => addNotification('Settings menu opened (Prototype Mode)', 'info')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Selector dropdown for other requests (if exists) */}
      {requests.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', padding: '4px 0', width: '100%', flexShrink: 0 }}>
          {requests.map(r => (
            <button
              key={r.id}
              onClick={() => setManualRequestId(r.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeRequest.id === r.id ? 'var(--secondary)' : 'var(--border-color)',
                backgroundColor: activeRequest.id === r.id ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card)',
                color: activeRequest.id === r.id ? 'var(--secondary)' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {r.serviceName}
            </button>
          ))}
        </div>
      )}

      {/* Missing Document Action Banner */}
      {activeRequest.status === 'DOCUMENTS_PENDING' && (
        <div 
          className="card animate-scale-in"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FEF3C7',
            color: '#92400E',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.15rem' }}>📄</span>
            <span style={{ fontSize: '0.76rem', fontWeight: 800 }}>Documents Required</span>
          </div>
          <p style={{ fontSize: '0.7rem', lineHeight: 1.4, margin: 0 }}>
            Your expert has requested additional documents to proceed with the filing.
          </p>
          <button
            onClick={() => {
              addNotification('Navigating to Document Portal...', 'info');
              setActiveTab('documents');
            }}
            className="btn btn-primary"
            style={{
              backgroundColor: '#D97706',
              color: '#ffffff',
              fontSize: '0.7rem',
              padding: '8px 12px',
              borderRadius: '10px',
              width: 'fit-content'
            }}
          >
            Go to Upload Portal
          </button>
        </div>
      )}

      {/* Rejected Document Action Banner */}
      {(() => {
        const rejectedDoc = documents.find(d => d.status === 'Rejected');
        if (!rejectedDoc) return null;
        return (
          <div 
            className="card animate-scale-in"
            style={{
              backgroundColor: 'var(--error-container)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--on-error)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.15rem' }}>⚠️</span>
              <span style={{ fontSize: '0.76rem', fontWeight: 800 }}>Action needed</span>
            </div>
            <p style={{ fontSize: '0.7rem', lineHeight: 1.4, margin: 0 }}>
              Fix one file to continue. <br/>
              <strong>Reason:</strong> {rejectedDoc.reason || "illegible scan"}
            </p>
            <button
              onClick={() => {
                localStorage.setItem('preselectUploadCategory', rejectedDoc.category);
                addNotification(`Navigating to upload ${rejectedDoc.category} copy...`, 'info');
                setActiveTab('documents');
              }}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--error)',
                color: '#ffffff',
                fontSize: '0.7rem',
                padding: '8px 12px',
                borderRadius: '10px',
                width: 'fit-content'
              }}
            >
              Re-upload via Camera
            </button>
          </div>
        );
      })()}

      {/* Overall Progress Card */}
      <div 
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px',
          borderRadius: '20px',
          border: '1.5px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(10, 37, 64, 0.03)',
          width: '100%',
          gap: '12px'
        }}
      >
        {/* Left Circular Progress */}
        <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="76" height="76" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="3.2" />
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="3.2" 
              strokeDasharray={`${progress}, 100`} 
              style={{ transition: 'stroke-dasharray 1s ease-in-out', strokeLinecap: 'round' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
            {progress}%
          </span>
        </div>

        {/* Center Details */}
        <div style={{ flex: 1, paddingLeft: '4px' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Overall Progress
          </span>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '2px', lineHeight: 1.2 }}>
            {activeRequest.serviceName}
          </h4>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block' }}>
            Active Stage: <strong style={{ color: '#2563EB' }}>{activeRequest.status}</strong>
          </span>
        </div>

        {/* Right ITR Document Graphic */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="58" height="66" viewBox="0 0 60 68" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 8px rgba(10, 37, 64, 0.04))' }}>
            <rect x="4" y="4" width="48" height="60" rx="8" fill="#F0F7FF" stroke="#D0E5FF" strokeWidth="1.5" />
            <rect x="12" y="16" width="22" height="4" rx="2" fill="#3B82F6" opacity="0.8" />
            <line x1="12" y1="28" x2="44" y2="28" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="36" x2="38" y2="36" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="44" x2="42" y2="44" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
            <text x="34" y="20" fill="#3B82F6" fontSize="8" fontWeight="900" fontFamily="var(--font-accent)">ITR</text>
            <circle cx="48" cy="52" r="9" fill="#10B981" />
            <path d="M45 52L47 54L51 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Next Action Banner */}
      <div 
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderRadius: '16px',
          border: '1.5px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(10, 37, 64, 0.02)',
          width: '100%',
          gap: '12px'
        }}
      >
        {/* Left Calendar Icon */}
        <div 
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Center Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Next
          </span>
          <h5 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '4px', lineHeight: 1.3 }}>
            {details.task}
          </h5>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{details.eta}</span>
          </div>
        </div>

        {/* Right Reschedule Button */}
        <button
          onClick={() => setShowRescheduleModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1.5px solid #2563EB',
            backgroundColor: 'transparent',
            color: '#2563EB',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-fast)'
          }}
        >
          Reschedule
        </button>
      </div>

      {/* Progress Timeline Section */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
            Progress
          </h4>
          <span 
            onClick={() => addNotification('Viewing full audit logs...', 'info')}
            style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            View all 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>

        <div className="card" style={{ padding: '16px', borderRadius: '20px', border: '1.5px solid rgba(226, 232, 240, 0.8)', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {timeline.map((step, idx) => {
              // Timeline vertical line connection logic
              const isLast = idx === timeline.length - 1;
              const nextStep = !isLast ? timeline[idx + 1] : null;
              
              let lineColor = '#E2E8F0'; // Default line color
              if (nextStep) {
                if (nextStep.status === 'completed') {
                  lineColor = '#10B981'; // Green for next completed
                } else if (nextStep.status === 'active') {
                  lineColor = '#3B82F6'; // Blue leading to active
                }
              }

              // Dynamic step icon based on index/type
              const renderStepIcon = (statusColor) => {
                switch(idx) {
                  case 0: // Request Submitted
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    );
                  case 1: // Expert Assigned
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    );
                  case 2: // Documents Received
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    );
                  case 3: // Work Started
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <polygon points="10 8 16 12 10 16 10 8" fill={statusColor} />
                      </svg>
                    );
                  case 4: // Review Stage
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    );
                  default: // Completed / Final
                    return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    );
                }
              };

              // Determine styling variables based on state
              const statusConfig = step.status === 'completed'
                ? {
                    indicatorDot: (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ),
                    iconBgColor: idx === 1 ? '#E8F0FE' : '#E6F4EA',
                    iconStrokeColor: idx === 1 ? '#1A73E8' : '#137333',
                    badgeText: 'Completed',
                    badgeBg: '#E6F4EA',
                    badgeTextColor: '#137333'
                  }
                : step.status === 'active'
                  ? {
                      indicatorDot: (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2.5px solid #0EA5E9', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0EA5E9' }} />
                        </div>
                      ),
                      iconBgColor: '#E8F0FE',
                      iconStrokeColor: '#1A73E8',
                      badgeText: 'In Progress',
                      badgeBg: '#E8F0FE',
                      badgeTextColor: '#1A73E8'
                    }
                  : {
                      indicatorDot: (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', zIndex: 5 }} />
                      ),
                      iconBgColor: '#F1F3F4',
                      iconStrokeColor: '#9CA3AF',
                      badgeText: 'Pending',
                      badgeBg: '#F1F3F4',
                      badgeTextColor: '#5F6368'
                    };

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                  {/* Left connection line + dot */}
                  <div style={{ width: '24px', display: 'flex', justifyContent: 'center', position: 'relative', height: '100%' }}>
                    {statusConfig.indicatorDot}
                    {!isLast && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '20px',
                          bottom: '-28px',
                          width: '2.5px',
                          backgroundColor: lineColor,
                          zIndex: 1
                        }} 
                      />
                    )}
                  </div>

                  {/* Icon Circle */}
                  <div 
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: statusConfig.iconBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '12px',
                      flexShrink: 0
                    }}
                  >
                    {renderStepIcon(statusConfig.iconStrokeColor)}
                  </div>

                  {/* Text details */}
                  <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: step.status === 'pending' ? 'var(--text-tertiary)' : 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                      {step.title}
                    </h5>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {step.desc}
                    </span>
                  </div>

                  {/* Right Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                    <span 
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: statusConfig.badgeBg,
                        color: statusConfig.badgeTextColor,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {statusConfig.badgeText}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expert Profile Card */}
      {expert && (
        <div style={{ width: '100%' }}>
          <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            Expert
          </h4>
          <div 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              padding: '16px', 
              borderRadius: '20px', 
              border: '1.5px solid rgba(226, 232, 240, 0.8)', 
              backgroundColor: '#FFFFFF' 
            }}
          >
            {/* Expert Info Row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img 
                src={expert.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'} 
                alt={expert.name} 
                style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {expert.name || 'Assigned Advisor'}
                  {/* Blue verified check icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L6 12.5L7.41 11.09L10 13.67L16.59 7.09L18 8.5L10 16.5Z" fill="#3B82F6" />
                  </svg>
                </h5>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  {expert.expert?.specialization || expert.specialization || 'Taxation Specialist'}
                </span>
              </div>
            </div>

            {/* Direct Contacts */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Chat Button */}
              <button 
                onClick={() => handleAction('Chat')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #2563EB',
                  backgroundColor: 'transparent',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat
              </button>

              {/* Call Button */}
              <button 
                onClick={() => handleAction('Call')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #2563EB',
                  backgroundColor: 'transparent',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Deliverables Section */}
      {(activeRequest.deliverables || []).length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Deliverables Uploaded
            </h4>
            <span 
              onClick={() => addNotification('Viewing all deliverables...', 'info')}
              style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              View all 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(activeRequest.deliverables || []).map((file, idx) => (
              <div 
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(226, 232, 240, 0.8)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(10, 37, 64, 0.02)'
                }}
              >
                {/* Red PDF Icon + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="5" y="14" fill="#EF4444" fontSize="8" fontWeight="900" fontFamily="var(--font-accent)">PDF</text>
                  </svg>
                  
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {file}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      Uploaded on 14 Jun, 04:25 PM • 2.4 MB
                    </span>
                  </div>
                </div>
                
                {/* Download Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleDownload(file)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #2563EB',
                      backgroundColor: 'transparent',
                      color: '#2563EB',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    Download
                  </button>

                  <button
                    onClick={() => addNotification('File options menu opened', 'info')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Chat Overlay */}
      {showChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#F8FAFC',
          zIndex: 1000
        }}>
          <ChatBox
            otherUserId={expert.id}
            otherUserName={expert.name}
            currentUserId={user?.id || 'cli-1'}
            onClose={() => setShowChat(false)}
            addNotification={addNotification}
          />
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '340px', padding: '24px', backgroundColor: '#fff', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', fontWeight: 800 }}>Reschedule Call</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>New Date</label>
              <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>New Time</label>
              <input type="time" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                disabled={isRescheduling}
                onClick={() => {
                  if (!rescheduleData.date || !rescheduleData.time) {
                    addNotification('Please select date and time', 'warning');
                    return;
                  }
                  setIsRescheduling(true);
                  setTimeout(() => {
                    addNotification('Call rescheduled successfully', 'success');
                    setShowRescheduleModal(false);
                    setIsRescheduling(false);
                  }, 800);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {isRescheduling ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
