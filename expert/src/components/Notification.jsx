import { useEffect } from 'react';

export default function Notification({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      background: 'white',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${colors[type]}`,
      zIndex: 1000,
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div className="flex-row gap-2">
        <span>{icons[type]}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        ✕
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
