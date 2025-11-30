// src/components/PaymentModal.jsx
export default function PaymentModal({ visible = false }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1.5rem'
      }} />
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#064e3b',
        marginBottom: '0.5rem'
      }}>Processing Payment</h3>
      <p style={{ color: '#64748b' }}>Please wait while we secure your order...</p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
