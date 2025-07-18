'use client';

import React, { useState, useEffect } from 'react';

interface DebugCountdownProps {
  gameState: {
    current_period: string;
    countdown_seconds: number;
    status: string;
    server_time: string;
    next_draw_time: string;
  } | null;
}

export default function DebugCountdown({ gameState }: DebugCountdownProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    if (!gameState) return;
    
    const updateDebug = () => {
      const now = Date.now();
      const nextDraw = new Date(gameState.next_draw_time).getTime();
      const serverTime = new Date(gameState.server_time).getTime();
      
      const remainingMs = nextDraw - now;
      const remainingSeconds = Math.floor(remainingMs / 1000);
      
      setDebugInfo({
        now: new Date(now).toISOString(),
        nextDraw: gameState.next_draw_time,
        serverTime: gameState.server_time,
        countdown_seconds: gameState.countdown_seconds,
        calculated_remaining: remainingSeconds,
        remaining_ms: remainingMs,
        nextDraw_timestamp: nextDraw,
        now_timestamp: now,
        diff: nextDraw - now
      });
    };
    
    updateDebug();
    const interval = setInterval(updateDebug, 1000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  if (!gameState) return <div>No game state</div>;
  
  return (
    <div className="bg-gray-800 text-white p-4 rounded text-xs font-mono">
      <h3 className="text-sm font-bold mb-2">Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}