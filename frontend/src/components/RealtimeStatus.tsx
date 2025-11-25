"use client";

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { socket } from '../lib/socket';

export default function RealtimeStatus() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const connectHandler = () => setConnected(true);
    const disconnectHandler = () => setConnected(false);
    const pongHandler = (payload: { message: string; received: string }) => setLastMessage(payload.message);

    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);
    socket.on('pong', pongHandler);
    socket.emit('ping', 'frontend-handshake');

    return () => {
      socket.off('connect', connectHandler);
      socket.off('disconnect', disconnectHandler);
      socket.off('pong', pongHandler);
    };
  }, []);

  return (
    <div className="mt-6 flex items-center gap-3 rounded-full border border-stone-200 bg-stone-100 px-4 py-2 text-sm text-stone-600">
      <span className={clsx('size-2 rounded-full', connected ? 'bg-green-500' : 'bg-red-400')} />
      {connected ? 'Realtime channel online' : 'Realtime channel offline'}
      {lastMessage && <span className="text-xs text-stone-500">last ping: {lastMessage}</span>}
    </div>
  );
}



