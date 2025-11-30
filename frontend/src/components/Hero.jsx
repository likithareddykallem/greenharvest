import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-block site-wrap">
      <div className="hero-block__media" style={{flex:'0 0 52%', minHeight:240}}>
        <img src="/images/hero-farm.jpg" alt="Farm hero" />
      </div>

      <div className="hero-block__body">
        <div className="hero-eyebrow">Direct from farmers</div>
        <h1 className="hero-title">Fresh, traceable produce — from local farms to your table.</h1>
        <p className="hero-sub">GreenHarvest connects restaurants, retailers and households directly with trusted farmers. Transparent certifications, fair payouts, and reliable deliveries — all in one marketplace.</p>

        <div style={{marginTop:'1rem', display:'flex', gap:'0.6rem'}}>
          <Link to="/catalog" className="btn-primary">Browse catalog</Link>
          <Link to="/register" className="btn-secondary">Sell with us</Link>
        </div>
      </div>
    </section>
  );
}
