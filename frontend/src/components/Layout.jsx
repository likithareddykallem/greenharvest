// src/components/Layout.jsx
import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

/**
 * Layout wraps pages with header/footer and applies consistent page spacing.
 * Use <main className="page-content"> in pages or Layout will provide padding.
 */
export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

