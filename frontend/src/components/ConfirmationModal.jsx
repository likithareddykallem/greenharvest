import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.5 }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
