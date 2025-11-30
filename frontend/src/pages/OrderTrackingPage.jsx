// src/pages/OrderTrackingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import client from '../api/client.js';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const journey = ['Pending', 'Accepted', 'Packed', 'Shipped', 'Delivered'];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const loadOrder = () => client.get(`/api/orders/${id}/track`).then((res) => setOrder(res.data));

  useEffect(() => {
    loadOrder();
    const socket = io(socketUrl);
    socket.emit('join_order', id);
    socket.on('order:update', (payload) => {
      if (payload._id === id) setOrder(payload);
    });
    const interval = setInterval(loadOrder, 5000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [id]);

  if (!order) return <div className="site-wrap">Loading…</div>;

  return (
    <div className="site-wrap">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
        <div>
          <h2 style={{margin:0}}>Order #{order._id.slice(-6)}</h2>
          <p style={{color:'var(--muted)'}}>We’ll notify you whenever a farmer updates the status.</p>
        </div>
        <div className="status-pill" style={{fontWeight:700}}>{order.status}</div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8, marginBottom:12}}>
        {journey.map((state) => {
          const completed = order.timeline.some((entry) => entry.state === state);
          return (
            <div key={state} style={{
              padding:12, borderRadius:10, border: completed ? '1px solid rgba(6,95,70,0.18)' : '1px dashed var(--border)',
              background: completed ? '#ecfdf5' : 'transparent',
              color: completed ? '#065f46' : 'var(--muted)',
              textAlign:'center',
              fontWeight:600
            }}>
              {state}
            </div>
          );
        })}
      </div>

      <ul style={{listStyle:'none', padding:0}}>
        {order.timeline.map((entry) => (
          <li key={entry.timestamp} className="card" style={{padding:12, marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><strong>{entry.state}</strong><span style={{color:'var(--muted)'}}>{new Date(entry.timestamp).toLocaleString()}</span></div>
            <div style={{marginTop:6}}>{entry.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTrackingPage;
