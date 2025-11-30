import React from 'react';

const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#paint0_linear)" />
            <path d="M16 24C16 24 22 20 22 14C22 10.6863 19.3137 8 16 8C12.6863 8 10 10.6863 10 14C10 20 16 24 16 24Z" fill="white" />
            <path d="M16 24V14" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 14L19 11" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 18L13 16" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#047857" />
                </linearGradient>
            </defs>
        </svg>
        <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#064e3b',
            letterSpacing: '-0.03em',
            fontFamily: "'Outfit', sans-serif"
        }}>
            GreenHarvest
        </span>
    </div>
);

export default Logo;
