import React from 'react';
import { useToastStore } from '../store/toastStore';

const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="toast-close">
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
