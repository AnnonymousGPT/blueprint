import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="phone-status-bar">
      <span>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Signal Icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 22h20V2L2 22z" />
        </svg>
        {/* Wifi Icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21l-12-12c4.1-4.1 10.9-4.1 15 0l-3 3c-2.5-2.5-6.5-2.5-9 0l9 9z" />
        </svg>
        {/* Battery Icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2-2h-3V1h-4v2H3a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5z" />
        </svg>
      </div>
    </div>
  );
}
