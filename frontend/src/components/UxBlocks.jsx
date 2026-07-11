export function StepProgress({ step, totalSteps, label = 'Progress' }) {
  const safeStep = Math.max(1, Math.min(step, totalSteps));
  const percentage = ((safeStep - 1) / (totalSteps - 1 || 1)) * 100;

  return (
    <div aria-label={`${label} step progress`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Step {safeStep} of {totalSteps}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.06)' }}>
        <div
          role="progressbar"
          aria-valuenow={safeStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'var(--secondary)',
            borderRadius: 999,
            transition: 'width var(--transition-normal)'
          }}
        />
      </div>
    </div>
  );
}

export function TrustStrip({ items = [] }) {
  return (
    <div className="card trust-strip muted-card" style={{ padding: '10px 12px', gap: 8 }}>
      {items.map((item) => (
        <div key={item} className="trust-chip">
          <span aria-hidden="true" style={{ color: 'var(--success)' }}>✓</span>
          {item}
        </div>
      ))}
    </div>
  );
}

export function WhatNext({ title = 'What happens next', items = [] }) {
  return (
    <div className="card muted-card" style={{ padding: 14 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.55, display: 'grid', gap: 6 }}>
        {items.map((it, idx) => (
          <li key={`${idx}-${it}`}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function StickyHelpButton({ onClick, label = 'Need help?', sticky = false }) {
  return (
    <button
      onClick={onClick}
      className={sticky ? 'btn sticky-action' : 'btn'}
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(12px)',
        minHeight: '48px',
        position: sticky ? 'sticky' : 'static',
        width: '100%',
        margin: sticky ? 0 : '12px 0 8px',
        bottom: sticky ? 'calc(var(--bottom-nav-space) - 208px)' : 'auto'
      }}
    >
      {label}
    </button>
  );
}

export function PricingBreakdown({ lines, totalLabel = 'Total Payable', totalValue }) {
  return (
    <div className="card summary-banner" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
      {lines.map((line) => (
        <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{line.label}</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>{line.value}</span>
        </div>
      ))}
      <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '2px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem' }}>
        <span style={{ fontWeight: 800 }}>{totalLabel}</span>
        <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{totalValue}</span>
      </div>
    </div>
  );
}
