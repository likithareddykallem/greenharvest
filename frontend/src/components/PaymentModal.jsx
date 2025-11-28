const PaymentModal = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <h3>Processing payment…</h3>
        <p>This takes about 3 seconds.</p>
      </div>
    </div>
  );
};

export default PaymentModal;

