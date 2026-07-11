import { useEffect } from 'react';

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getThemeStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: 'var(--success)',
          color: 'var(--on-success)',
          backgroundColor: 'var(--success-container)',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )
        };
      case 'error':
        return {
          borderColor: 'var(--error)',
          color: 'var(--on-error)',
          backgroundColor: 'var(--error-container)',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )
        };
      case 'warning':
        return {
          borderColor: 'var(--warning)',
          color: 'var(--on-warning)',
          backgroundColor: 'var(--warning-container)',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )
        };
      default:
        return {
          borderColor: 'var(--primary)',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-surface-variant)',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )
        };
    }
  };

  const style = getThemeStyles();

  return (
    <div 
      className="notification-toast" 
      style={{ 
        borderLeftColor: style.borderColor,
        backgroundColor: style.backgroundColor
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: style.color }}>
        {style.icon}
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{message}</span>
      </div>
      <button 
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          padding: '4px',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
