import { useState, useEffect, useRef } from 'react';
import { api } from '../services/apiService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 2.2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (name) {
    case 'back':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'clip':
      return (
        <svg {...common}>
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      );
    case 'dots':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 11 2 2 4-4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'doubleCheck':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m2 12 5 5 10-10" />
          <path d="m7 12 5 5 10-10" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'fileText':
      return (
        <svg {...common}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'mic':
      return (
        <svg {...common}>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case 'send':
      return (
        <svg {...common}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ChatBox({ currentUserId, otherUserId, otherUserName, otherUserPhoto, onClose, addNotification }) {
  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(`chat_history_${otherUserId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      // Ignored
    }

    // Default V4 mockup conversation
    return [
      {
        id: 'mock-1',
        senderId: currentUserId,
        receiverId: otherUserId,
        content: 'Hi Akash, I have uploaded the documents.',
        createdAt: '1:53 PM',
        status: 'READ'
      },
      {
        id: 'mock-2',
        senderId: otherUserId,
        receiverId: currentUserId,
        content: "Great! I'm reviewing them. I'll update you shortly.",
        createdAt: '1:54 PM',
        status: 'READ'
      },
      {
        id: 'mock-3',
        senderId: currentUserId,
        receiverId: otherUserId,
        content: '[ATTACHMENT:PAN_CARD]',
        createdAt: '1:55 PM',
        status: 'READ',
        attachment: {
          type: 'DOCUMENT',
          name: 'PAN Card',
          subtitle: 'Uploaded 2 minutes ago',
          badge: 'Waiting for review',
          badgeStatus: 'warning'
        }
      },
      {
        id: 'mock-4',
        senderId: 'system',
        content: '[SYSTEM_EVENT:CONSULTATION_SCHEDULED]',
        createdAt: '1:56 PM',
        systemEvent: {
          title: 'Consultation scheduled',
          subtitle: 'Tomorrow, 11:30 AM · Telephonic Call'
        }
      },
      {
        id: 'mock-5',
        senderId: otherUserId,
        receiverId: currentUserId,
        content: 'Thanks! PAN looks good. Please upload Form 16 / Salary Slips so we can proceed.',
        createdAt: '1:57 PM',
        status: 'READ'
      },
      {
        id: 'mock-6',
        senderId: currentUserId,
        receiverId: otherUserId,
        content: 'Sure, uploading now.',
        createdAt: '1:58 PM',
        status: 'READ'
      }
    ];
  });

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isTyping, setIsTyping] = useState(true); // Default typing indicator active as in mockup
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Safe Capacitor Haptic trigger
  const playHaptic = async (type = 'light') => {
    try {
      await Haptics.impact({ style: type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  // Analytics event tracker
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    trackEvent('chat_opened', { receiver_id: otherUserId });

    // Poll server for new messages
    const interval = setInterval(fetchMessages, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchMessages = async () => {
    if (navigator.onLine === false) return;

    try {
      const res = await api.getMessages(otherUserId);
      if (res && res.data && res.data.length > 0) {
        // Overlay actual server messages on top of mocked template
        const serverMsgs = res.data.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(prev => {
          const nonMock = prev.filter(m => !m.id.startsWith('mock-'));
          const combined = [...prev.filter(m => m.id.startsWith('mock-')), ...serverMsgs.filter(sm => !nonMock.some(nm => nm.id === sm.id))];
          return combined;
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const syncOfflineQueue = async () => {
    try {
      const queueKey = `chat_sync_queue_${otherUserId}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      if (queue.length === 0) return;

      playHaptic();
      addNotification?.('Syncing offline messages with server...', 'info');

      for (const item of queue) {
        await api.sendMessage(otherUserId, item.content);
      }

      localStorage.removeItem(queueKey);
      fetchMessages();
      addNotification?.('Offline messages synced successfully!', 'success');
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const msgContent = newMessage;
    setNewMessage('');
    playHaptic('medium');

    const tempId = Date.now().toString();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempMsg = {
      id: tempId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: msgContent,
      createdAt: formattedTime,
      status: isOffline ? 'PENDING_SYNC' : 'SENT'
    };

    // Optimistic UI updates
    const updatedMessages = [...messages, tempMsg];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_history_${otherUserId}`, JSON.stringify(updatedMessages));

    trackEvent('message_sent', { length: msgContent.length });

    if (isOffline) {
      const queueKey = `chat_sync_queue_${otherUserId}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      queue.push({ id: tempId, content: msgContent });
      localStorage.setItem(queueKey, JSON.stringify(queue));
      addNotification?.('Message queued offline.', 'info');
      return;
    }

    try {
      setIsTyping(true); // Simulate advisor typing response
      await api.sendMessage(otherUserId, msgContent);
      fetchMessages();
      
      // Auto reply simulation after 4 seconds to make advisor look alive
      setTimeout(() => {
        setIsTyping(false);
        playHaptic('medium');
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, {
          id: `reply-${Date.now()}`,
          senderId: otherUserId,
          receiverId: currentUserId,
          content: 'Got it. I am verifying this declaration now.',
          createdAt: replyTime,
          status: 'READ'
        }]);
        trackEvent('message_received');
      }, 3500);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'FAILED' } : m));
      addNotification?.('Failed to send message.', 'error');
    }
  };

  const handleAttachClick = () => {
    playHaptic();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playHaptic();
    addNotification?.(`Uploading attachment: ${file.name}...`, 'info');

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = `upload-${Date.now()}`;
    const newDocMsg = {
      id: tempId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: '[ATTACHMENT:DOC]',
      createdAt: formattedTime,
      status: 'SENT',
      attachment: {
        type: 'DOCUMENT',
        name: file.name,
        subtitle: 'Uploading now...',
        badge: 'Verifying',
        badgeStatus: 'info'
      }
    };

    setMessages(prev => [...prev, newDocMsg]);

    setTimeout(() => {
      // Simulate success upload status change
      playHaptic('medium');
      setMessages(prev => prev.map(m => m.id === tempId ? {
        ...m,
        attachment: {
          ...m.attachment,
          subtitle: 'Uploaded just now',
          badge: 'Waiting for review',
          badgeStatus: 'warning'
        }
      } : m));
      trackEvent('document_uploaded', { file_name: file.name });
      addNotification?.('Document shared with CA Advisor!', 'success');
    }, 2000);
  };

  const handleCall = () => {
    playHaptic();
    trackEvent('call_started');
    addNotification(`Calling CA Akash Sharma...`, 'info');
  };

  return (
    <div style={styles.container}>
      {/* 1. COMPACT PREMIUM HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              playHaptic();
              onClose();
            }}
            aria-label="Back to dashboard"
            style={styles.backBtn}
          >
            <Icon name="back" size={18} color="#0f172a" strokeWidth={2.5} />
          </button>

          <div style={{ position: 'relative' }}>
            <img
              src={otherUserPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={otherUserName}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
            />
            <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #ffffff' }} />
          </div>

          <div>
            <h3 style={styles.headerTitle}>
              {otherUserName || 'Akash Sharma'}
              <span style={styles.verifiedBadge}>✓</span>
            </h3>
            <span style={styles.headerSub}>{otherUserName?.includes('Support') ? 'Blueprint Support' : 'General Tax Consultant'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>Online</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.6rem' }}>·</span>
              <Icon name="clock" size={10} color="#64748b" />
              <span style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>Responds within 2 hours</span>
            </div>
          </div>
        </div>

        {/* Right side circle buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={handleCall} style={styles.circleActionBtn} aria-label="Call CA Partner">
            <Icon name="phone" size={18} color="#0f172a" />
          </button>
          <button type="button" onClick={handleAttachClick} style={styles.circleActionBtn} aria-label="Attachments">
            <Icon name="clip" size={18} color="#0f172a" />
          </button>
          <button type="button" style={styles.circleActionBtn} aria-label="More options">
            <Icon name="dots" size={18} color="#0f172a" />
          </button>
        </div>
      </div>

      {/* 2. ENCRYPTION BANNER */}
      <div style={styles.encryptionBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="shield" size={14} color="#10b981" />
          <span>Your conversations are end-to-end encrypted</span>
        </div>
        <button type="button" style={styles.learnMoreBtn}>Learn more <Icon name="chevronRight" size={10} color="#0d9488" strokeWidth={3} /></button>
      </div>

      {/* 3. MESSAGES VIEWPORT */}
      <div style={styles.messageList}>
        {/* Date Divider */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBlock: 12 }}>
          <span style={styles.dateDivider}>Today</span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
            // System scheduled consultation card (Mockup 1)
            return (
              <div key={msg.id} style={styles.systemEventCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={styles.systemCardIconContainer}>
                    <Icon name="calendar" size={16} color="#3b82f6" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>
                      {msg.systemEvent?.title || 'Consultation scheduled'}
                    </h4>
                    <p style={{ margin: '1px 0 0', fontSize: '0.64rem', color: '#64748b', fontWeight: 500 }}>
                      {msg.systemEvent?.subtitle}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => addNotification('Opening scheduled call details...', 'info')} style={styles.systemCardViewBtn}>
                  View <Icon name="chevronRight" size={10} color="#3b82f6" strokeWidth={3} />
                </button>
              </div>
            );
          }

          // Outgoing document attachment card
          if (msg.attachment) {
            return (
              <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: 'flex-end' }}>
                <div style={{ ...styles.msgBubble, ...styles.msgBubbleOutgoing, padding: 10, width: '260px' }}>
                  <div style={styles.attachmentCard}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={styles.attachmentIconBox}>
                        <Icon name="fileText" size={16} color="#0d9488" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {msg.attachment.name}
                        </h4>
                        <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 1 }}>
                          {msg.attachment.subtitle}
                        </div>
                      </div>
                    </div>
                    {/* Badge */}
                    <span style={{
                      fontSize: '0.54rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      width: 'fit-content',
                      marginTop: 6,
                      backgroundColor: msg.attachment.badgeStatus === 'warning' ? '#fff7ed' : '#e0f2fe',
                      color: msg.attachment.badgeStatus === 'warning' ? '#ea580c' : '#0284c7'
                    }}>
                      {msg.attachment.badge}
                    </span>
                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBlock: '8px 6px' }} />
                    <button
                      type="button"
                      onClick={() => addNotification('Opening document viewer...', 'info')}
                      style={styles.attachmentViewBtn}
                    >
                      View Document <Icon name="chevronRight" size={10} color="#0d9488" strokeWidth={3} />
                    </button>
                  </div>
                  {/* Inside bubble timestamp/indicators */}
                  <div style={styles.bubbleStatusBox}>
                    <span style={styles.bubbleTime}>{msg.createdAt}</span>
                    <Icon name="doubleCheck" size={12} color="#93c5fd" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                ...styles.msgBubble,
                ...(isMe ? styles.msgBubbleOutgoing : styles.msgBubbleIncoming)
              }}>
                <span style={{ display: 'block', paddingBottom: 2 }}>{msg.content}</span>
                <div style={isMe ? styles.bubbleStatusBox : styles.incomingStatusBox}>
                  <span style={isMe ? styles.bubbleTime : styles.incomingTime}>{msg.createdAt}</span>
                  {isMe && <Icon name="doubleCheck" size={12} color="#93c5fd" strokeWidth={2.5} />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ ...styles.msgWrapper, justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
            <img
              src={otherUserPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={otherUserName}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
            />
            <div style={{ ...styles.msgBubble, ...styles.msgBubbleIncoming, display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px' }}>
              <div className="typing-dots" style={styles.typingDotsContainer}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileAttach}
        aria-hidden="true"
      />

      {/* 4. GLASS FLOATING INPUT BAR */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <div style={styles.inputGlassContainer}>
          <button
            type="button"
            onClick={handleAttachClick}
            style={styles.inputAddBtn}
            aria-label="Add attachment"
          >
            <Icon name="plus" size={18} color="#0d9488" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleAttachClick}
            style={styles.inputAddBtn}
            aria-label="Camera"
          >
            <Icon name="camera" size={18} color="#64748b" />
          </button>

          <input 
            style={styles.input}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            aria-label="Secure message input"
          />

          <button 
            type="submit"
            onClick={(e) => {
              if (!newMessage.trim()) {
                e.preventDefault();
                playHaptic();
                addNotification('Voice note recording started...', 'info');
              } else {
                handleSend(e);
              }
            }}
            style={styles.inputActionCircleBtn}
            aria-label={newMessage.trim() ? "Send message" : "Record voice note"}
          >
            <Icon name={newMessage.trim() ? 'send' : 'mic'} size={16} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '100%',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden'
  },
  header: {
    padding: '10px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#ffffff',
    minHeight: 64,
    zIndex: 10
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none'
  },
  headerTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: '950',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.55rem',
    fontWeight: 900
  },
  headerSub: {
    fontSize: '0.68rem',
    color: '#64748b',
    display: 'block',
    fontWeight: 500
  },
  circleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  encryptionBanner: {
    padding: '8px 16px',
    backgroundColor: '#f0fdf4',
    borderBottom: '1px solid #bbf7d0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.64rem',
    color: '#166534',
    fontWeight: 600
  },
  learnMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#0d9488',
    fontSize: '0.64rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  messageList: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f8fafc',
    paddingBottom: '100px' // offset for floating input bar
  },
  dateDivider: {
    fontSize: '0.66rem',
    color: '#64748b',
    fontWeight: 800,
    backgroundColor: '#e2e8f0',
    padding: '3px 10px',
    borderRadius: 99
  },
  msgWrapper: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    padding: '10px 14px',
    maxWidth: '72%',
    fontSize: '0.84rem',
    lineHeight: '1.45',
    boxShadow: '0 2px 8px rgba(0,0,0,0.015)'
  },
  msgBubbleIncoming: {
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '16px 16px 16px 4px',
    border: '1px solid #e2e8f0'
  },
  msgBubbleOutgoing: {
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    color: '#ffffff',
    borderRadius: '16px 16px 4px 16px'
  },
  incomingStatusBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 3
  },
  incomingTime: {
    fontSize: '0.58rem',
    color: '#94a3b8',
    fontWeight: 500
  },
  bubbleStatusBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    opacity: 0.85
  },
  bubbleTime: {
    fontSize: '0.58rem',
    color: '#e0f2fe',
    fontWeight: 500
  },
  systemEventCard: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  systemCardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(59,130,246,0.06)'
  },
  systemCardViewBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  attachmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  attachmentIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#e6fcf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  attachmentViewBtn: {
    background: 'none',
    border: 'none',
    color: '#0d9488',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    textAlign: 'left'
  },
  typingDotsContainer: {
    display: 'flex',
    gap: 4,
    paddingBlock: 2
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#94a3b8',
    display: 'inline-block',
    animation: 'typing-pulse 1.4s infinite ease-in-out both'
  },
  inputArea: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 20
  },
  inputGlassContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
  },
  inputAddBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    outline: 'none'
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    fontSize: '0.82rem',
    color: '#0f172a',
    paddingInline: 8
  },
  inputActionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    outline: 'none',
    boxShadow: '0 4px 10px rgba(13,148,136,0.2)'
  }
};
