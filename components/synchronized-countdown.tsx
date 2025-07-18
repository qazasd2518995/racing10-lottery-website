'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SynchronizedCountdownProps {
  gameState: {
    current_period: string;
    countdown_seconds: number;
    status: string;
    server_time: string;
    next_draw_time: string;
  } | null;
  onStatusChange?: (status: 'betting' | 'drawing') => void;
}

export default function SynchronizedCountdown({ 
  gameState,
  onStatusChange 
}: SynchronizedCountdownProps) {
  const [countdown, setCountdown] = useState(0);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string>('');

  // 同步服務器時間
  useEffect(() => {
    if (gameState && gameState.server_time) {
      const serverTimestamp = new Date(gameState.server_time).getTime();
      const localTimestamp = Date.now();
      const offset = serverTimestamp - localTimestamp;
      setServerTimeOffset(offset);
      
      console.log('[倒數同步] 時間偏移:', offset, 'ms');
    }
  }, [gameState?.server_time]);

  // 計算倒數
  const calculateCountdown = () => {
    if (!gameState || !gameState.next_draw_time) {
      return gameState?.countdown_seconds || 0;
    }

    const correctedNow = Date.now() + serverTimeOffset;
    const nextDrawTimestamp = new Date(gameState.next_draw_time).getTime();
    const remainingMs = nextDrawTimestamp - correctedNow;
    
    return Math.max(0, Math.floor(remainingMs / 1000));
  };

  // 啟動倒數計時器
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 立即更新一次
    const newCountdown = calculateCountdown();
    setCountdown(newCountdown);

    // 每100ms更新一次，確保精確
    intervalRef.current = setInterval(() => {
      const seconds = calculateCountdown();
      setCountdown(seconds);

      // 檢查狀態變化
      if (gameState && seconds === 0 && gameState.status !== lastStatusRef.current) {
        lastStatusRef.current = gameState.status;
        if (onStatusChange && (gameState.status === 'betting' || gameState.status === 'drawing')) {
          onStatusChange(gameState.status as 'betting' | 'drawing');
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, serverTimeOffset]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (countdown <= 10) return 'text-red-400';
    if (countdown <= 30) return 'text-yellow-400';
    return 'text-white';
  };

  const getTimerSize = (): string => {
    if (countdown <= 10) return 'text-2xl font-bold';
    return 'text-xl font-semibold';
  };

  const isDrawing = gameState?.status === 'drawing';
  const isBetting = gameState?.status === 'betting';

  // Get status text based on game state
  const getStatusText = () => {
    if (isDrawing) {
      return 'Drawing in progress';
    }
    if (isBetting) {
      if (countdown <= 0) {
        return 'Betting closed';
      }
      if (countdown <= 10) {
        return 'Betting closing soon!';
      }
      return 'Betting open';
    }
    return 'Preparing...';
  };

  // Get timer display text
  const getTimerDisplay = () => {
    if (isDrawing) {
      return formatTime(countdown);
    }
    return formatTime(countdown);
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`countdown-timer ${getTimerColor()} ${getTimerSize()} transition-all duration-300`}>
        {getTimerDisplay()}
      </div>
      
      {/* Progress bar */}
      <div className="w-24 h-1 bg-gray-600 rounded-full mt-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${
            isDrawing ? 'bg-purple-400' :
            countdown <= 10 ? 'bg-red-400' : 
            countdown <= 30 ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ 
            width: isDrawing 
              ? `${Math.max(0, (countdown / 15) * 100)}%`
              : `${Math.max(0, (countdown / 60) * 100)}%` 
          }}
        />
      </div>
      
      {/* Status indicator */}
      <div className="text-xs mt-1 text-gray-300">
        {getStatusText()}
      </div>
    </div>
  );
}