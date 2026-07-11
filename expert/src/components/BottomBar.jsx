export default function BottomBar({ activeTab, onNavigate, unreadCount = 0 }) {
  return (
    <div className="bottom-bar">
      <div 
        className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</div>
        <span>Home</span>
      </div>
      
      <div 
        className={`tab-item ${activeTab === 'cases' ? 'active' : ''}`}
        onClick={() => onNavigate('cases')}
        style={{ position: 'relative' }}
      >
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
        <span>Cases</span>
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '-4px', right: '4px', background: 'var(--error)', 
            color: 'white', borderRadius: '50%', width: '16px', height: '16px', 
            fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      <div 
        className="tab-item"
        onClick={() => onNavigate('cases')}
      >
        <div className="tab-center">+</div>
      </div>

      <div 
        className={`tab-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onNavigate('calendar')}
      >
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>📅</div>
        <span>Schedule</span>
      </div>

      <div 
        className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onNavigate('profile')}
      >
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>👤</div>
        <span>Profile</span>
      </div>
    </div>
  );
}
