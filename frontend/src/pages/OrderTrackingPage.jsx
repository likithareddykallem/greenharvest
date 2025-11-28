import { useEffect, useState } from 'react';
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
    const interval = setInterval(loadOrder, 5000);
    const socket = io(socketUrl);
    socket.emit('join_order', id);
    socket.on('order:update', (payload) => {
      if (payload._id === id) setOrder(payload);
    });
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [id]);

  if (!order) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Order #{order._id.slice(-6)}</h2>
          <p className="container-subtitle">We’ll notify you whenever a farmer updates the status.</p>
        </div>
        <div className="status-pill">{order.status}</div>
      </div>

      <div className="timeline-track">
        {journey.map((state) => {
          const completed = order.timeline.some((entry) => entry.state === state);
          return (
            <div key={state} className={`timeline-step ${completed ? 'done' : ''}`}>
              <span>{state}</span>
            </div>
          );
        })}
      </div>

      <ul className="timeline">
        {order.timeline.map((entry) => (
          <li key={entry.timestamp}>
            <strong>{entry.state}</strong> — {new Date(entry.timestamp).toLocaleString()}
            <div>{entry.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTrackingPage;

