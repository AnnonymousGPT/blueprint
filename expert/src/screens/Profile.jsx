import { useState } from 'react';

export default function Profile({ user, onLogout, showNotification }) {
  return (
    <div style={{ padding: '16px', paddingBottom: '32px' }}>
      
      {/* Profile Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '24px' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', background: '#F0FDFA', 
          fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          👨‍💼
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.name}</h2>
        <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{user.specialization}</div>
        
        <div className="flex-row" style={{ justifyContent: 'center', gap: '8px' }}>
          <span className="badge" style={{ background: '#F1F5F9', color: '#475569' }}>5+ Years Exp</span>
          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>★</span> {user.rating} ({user.reviewsCount})
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{user.casesDone}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cases Done</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>12</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This Month</div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>About</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>✏️ Edit</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Experienced Chartered Accountant specializing in GST, Income Tax, and Corporate Compliance. 
          Dedicated to helping small businesses optimize their tax strategies.
        </p>
      </div>

      {/* Fee Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Consultation Fee</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{user.fees} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ session</span></div>
          </div>
          <button 
            onClick={() => showNotification('Fee update requested', 'info')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Update Fee
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="card" style={{ padding: 0, marginBottom: '24px', overflow: 'hidden' }}>
        {[
          { icon: '📱', label: 'Account Details' },
          { icon: '🔔', label: 'Notification Preferences' },
          { icon: '🎨', label: 'Appearance' },
          { icon: '📊', label: 'Performance Report' },
          { icon: '🆘', label: 'Support' },
          { icon: '📋', label: 'Terms & Conditions' }
        ].map((item, i) => (
          <div 
            key={i} 
            className="flex-row" 
            style={{ 
              padding: '16px', 
              borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => showNotification(`${item.label} coming soon`, 'info')}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '16px' }}>{item.icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
            <span style={{ color: 'var(--border-light)' }}>▶</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="btn btn-outline" 
        style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
      >
        🚪 Log Out
      </button>
      
      <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Blueprint Expert v2.0
      </div>
    </div>
  );
}
