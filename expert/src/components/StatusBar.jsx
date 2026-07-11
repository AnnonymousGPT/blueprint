import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar">
      <div className="time">{time}</div>
      <div className="icons flex-row gap-2">
        <span>📶</span>
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>
  );
}
