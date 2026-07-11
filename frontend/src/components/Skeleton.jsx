const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--bg-surface-variant) 25%, var(--border-color) 50%, var(--bg-surface-variant) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
};

const ShimmerBlock = ({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', marginBottom = '12px' }) => (
  <div 
    style={{ 
      width, 
      height, 
      borderRadius, 
      marginBottom,
      ...shimmerStyle
    }} 
  />
);

export default function Skeleton({ type }) {

  switch (type) {
    case 'home-stats':
      return (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div className="card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <ShimmerBlock width="40%" height="12px" />
            <ShimmerBlock width="80%" height="24px" marginBottom="0" />
          </div>
          <div className="card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <ShimmerBlock width="40%" height="12px" />
            <ShimmerBlock width="80%" height="24px" marginBottom="0" />
          </div>
          <div className="card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <ShimmerBlock width="40%" height="12px" />
            <ShimmerBlock width="80%" height="24px" marginBottom="0" />
          </div>
        </div>
      );

    case 'service-grid':
      return (
        <div className="service-grid" style={{ marginBottom: '20px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
              <ShimmerBlock width="35px" height="35px" borderRadius="12px" />
              <ShimmerBlock width="70%" height="14px" marginBottom="0" />
            </div>
          ))}
        </div>
      );

    case 'list':
    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <ShimmerBlock width="40px" height="40px" borderRadius="50%" marginBottom="0" />
              <div style={{ flex: 1 }}>
                <ShimmerBlock width="60%" height="14px" />
                <ShimmerBlock width="40%" height="10px" marginBottom="0" />
              </div>
              <ShimmerBlock width="50px" height="20px" borderRadius="12px" marginBottom="0" />
            </div>
          ))}
        </div>
      );
  }
}
