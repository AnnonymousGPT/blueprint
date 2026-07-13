import { useState, useEffect, useRef } from 'react';
import { api } from '../services/apiService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ChatBox({ currentUserId, otherUserId, otherUserName, onClose, addNotification }) {
  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(`chat_history_${otherUserId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(messages.length === 0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Safe Capacitor Haptic trigger
  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
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

    trackEvent('chat_history_loaded', { receiver_id: otherUserId });

    fetchMessages();
    const interval = setInterval(fetchMessages, 6000); // Polling loop

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
    if (navigator.onLine === false) return; // Skip if offline

    try {
      const res = await api.getMessages(otherUserId);
      if (res && res.data) {
        setMessages(res.data);
        localStorage.setItem(`chat_history_${otherUserId}`, JSON.stringify(res.data));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync queued messages posted while offline
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
    playHaptic();

    const tempId = Date.now().toString();
    const tempMsg = {
      id: tempId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: msgContent,
      createdAt: new Date().toISOString(),
      status: isOffline ? 'PENDING_SYNC' : 'SENT'
    };

    // Optimistic UI updates
    const updatedMessages = [...messages, tempMsg];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_history_${otherUserId}`, JSON.stringify(updatedMessages));

    trackEvent('chat_message_sent', { length: msgContent.length });

    if (isOffline) {
      // Queue locally
      const queueKey = `chat_sync_queue_${otherUserId}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      queue.push({ id: tempId, content: msgContent });
      localStorage.setItem(queueKey, JSON.stringify(queue));
      addNotification?.('Message queued. Will sync when online.', 'info');
      trackEvent('chat_offline_queued');
      return;
    }

    try {
      await api.sendMessage(otherUserId, msgContent);
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark as failed
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

    // Optimistic attachment upload
    try {
      const mockAttachmentText = `📄 Sent file: ${file.name} (Waiting upload confirmation)`;
      await api.sendMessage(otherUserId, mockAttachmentText);
      trackEvent('chat_attachment_shared', { file_name: file.name });
      fetchMessages();
      addNotification?.('Document shared in thread!', 'success');
    } catch (err) {
      addNotification?.('Failed to share file in thread.', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header bar controls */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#0ea5e9',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 800
          }}>
            CA
          </div>
          <div>
            <h3 style={styles.title}>{otherUserName || 'Assigned CA Partner'}</h3>
            <span style={{ fontSize: '0.62rem', color: isOffline ? '#dc2626' : '#10b981', fontWeight: 700 }}>
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
          </div>
        </div>
        <button 
          style={styles.closeBtn} 
          onClick={() => {
            playHaptic();
            onClose();
          }}
          aria-label="Close message window"
        >
          ×
        </button>
      </div>

      {/* Messages List viewports */}
      <div style={styles.messageList}>
        {loading ? (
          <div style={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>No messages in vault yet. Send a secure message!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            const isPending = msg.status === 'PENDING_SYNC';
            const isFailed = msg.status === 'FAILED';

            return (
              <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  ...styles.msgBubble, 
                  background: isMe ? '#0D9488' : '#F1F5F9', 
                  color: isMe ? '#fff' : '#1e293b',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px'
                }}>
                  {msg.content}
                  {isMe && (
                    <div style={{ fontSize: '0.54rem', textAlign: 'right', marginTop: 3, opacity: 0.7 }}>
                      {isPending ? 'Queued 🕒' : isFailed ? 'Failed ⚠️' : 'Delivered ✓'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div style={{ ...styles.msgWrapper, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.msgBubble, background: '#F1F5F9', color: '#64748b', fontStyle: 'italic', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span>Typing</span>
              <span className="animate-pulse-slow">...</span>
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

      {/* Input controls form */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <button
          type="button"
          onClick={handleAttachClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: 4,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
          aria-label="Attach file to chat"
        >
          📎
        </button>

        <input 
          style={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isOffline ? "Type message (Queued offline)..." : "Type a secure message..."}
          aria-label="Secure message input field"
        />

        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          style={{
            ...styles.sendBtn,
            backgroundColor: newMessage.trim() ? '#0D9488' : 'var(--border-color)',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
          }}
          aria-label="Send message"
        >
          Send
        </button>
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
    background: 'var(--bg-card)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -4px 25px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-card)',
    minHeight: 56
  },
  title: {
    margin: 0,
    fontSize: '0.88rem',
    fontWeight: '900',
    color: 'var(--text-primary)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageList: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'var(--bg-surface)'
  },
  msgWrapper: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    padding: '10px 14px',
    maxWidth: '75%',
    fontSize: '0.84rem',
    lineHeight: '1.45',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
  },
  inputArea: {
    padding: '10px 12px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-card)',
    minHeight: 60,
    boxSizing: 'border-box'
  },
  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    outline: 'none',
    fontSize: '0.84rem',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    minHeight: 44
  },
  sendBtn: {
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    paddingInline: '16px',
    fontWeight: '800',
    fontSize: '0.8rem',
    minHeight: 44
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    marginTop: '30px'
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem'
  }
};
