export default function Confetti({ active }) {
  if (!active) return null;

  const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#ec4899', '#a855f7'];

  // Simple deterministic pseudo-random generator based on seed
  const random = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const particles = Array.from({ length: 80 }).map((_, i) => {
    const size = Math.floor(random(i * 7 + 1) * 8) + 6; // 6px - 14px
    const left = random(i * 7 + 2) * 100; // 0% - 100%
    const animationDelay = random(i * 7 + 3) * 2.5; // 0s - 2.5s
    const animationDuration = random(i * 7 + 4) * 2 + 2.5; // 2.5s - 4.5s
    const color = colors[Math.floor(random(i * 7 + 5) * colors.length)];
    const rotate = Math.floor(random(i * 7 + 6) * 360);
    const isRound = random(i * 7 + 7) > 0.5;

    return {
      id: i,
      style: {
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: isRound ? '50%' : '2px',
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`,
        transform: `rotate(${rotate}deg)`,
      }
    };
  });

  return (
    <div className="confetti-canvas-container">
      {particles.map((p) => (
        <div 
          key={p.id} 
          className="confetti-particle" 
          style={p.style} 
        />
      ))}
    </div>
  );
}
