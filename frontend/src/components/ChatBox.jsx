import { useState, useEffect, useRef } from 'react';
import { api } from '../services/apiService';

export default function ChatBox({ currentUserId, otherUserId, onClose, addNotification }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [otherUserId]);

  const fetchMessages = async () => {
    try {
      // Assuming api.getMessages is implemented in apiService.js
      const res = await api.getMessages(otherUserId);
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgContent = newMessage;
    setNewMessage('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content: msgContent,
      createdAt: new Date().toISOString()
    }]);
    
    try {
      await api.sendMessage(otherUserId, msgContent);
      fetchMessages();
    } catch (error) {
      addNotification('Failed to send message', 'error');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Messages</h3>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>
      
      <div style={styles.messageList}>
        {loading ? (
          <div style={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>No messages yet. Say hi!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} style={{...styles.msgWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.msgBubble, background: isMe ? '#0D9488' : '#F1F5F9', color: isMe ? '#fff' : '#333'}}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          style={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" style={styles.sendBtn}>Send</button>
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
    height: '60%',
    background: '#fff',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden'
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F8FAFC'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748B'
  },
  messageList: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  msgWrapper: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    padding: '10px 14px',
    borderRadius: '16px',
    maxWidth: '75%',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    outline: 'none',
    fontSize: '14px'
  },
  sendBtn: {
    background: '#0D9488',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    padding: '0 16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: '20px'
  },
  loading: {
    textAlign: 'center',
    color: '#94A3B8'
  }
};
