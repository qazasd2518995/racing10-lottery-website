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
  const [localCountdown, setLocalCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string>('');
  const lastPeriodRef = useRef<string>('');

  // 同步服务器时间
  useEffect(() => {
    if (gameState && gameState.server_time) {
      const serverTimestamp = new Date(gameState.server_time).getTime();
      const localTimestamp = Date.now();
      const offset = serverTimestamp - localTimestamp;
      setServerTimeOffset(offset);
      
      console.log('[倒数同步] 时间偏移:', offset, 'ms');
    }
  }, [gameState?.server_time]);

  // 当期号变化时，重置本地倒数
  useEffect(() => {
    if (gameState && gameState.current_period !== lastPeriodRef.current) {
      lastPeriodRef.current = gameState.current_period;
      setLocalCountdown(gameState.countdown_seconds || 0);
    }
  }, [gameState?.current_period, gameState?.countdown_seconds]);

  // 计算倒数
  const calculateCountdown = () => {
    if (!gameState) return 0;
    
    // 如果有 next_draw_time 和 server_time，使用精确计算
    if (gameState.next_draw_time && gameState.server_time) {
      const correctedNow = Date.now() + serverTimeOffset;
      const nextDrawTimestamp = new Date(gameState.next_draw_time).getTime();
      const remainingMs = nextDrawTimestamp - correctedNow;
      return Math.max(0, Math.floor(remainingMs / 1000));
    }
    
    // 否则直接使用 countdown_seconds
    return Math.max(0, gameState.countdown_seconds || 0);
  };

  // 启动倒数计时器
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!gameState) return;

    // 初始设置倒数
    if (gameState.next_draw_time && gameState.server_time) {
      setCountdown(calculateCountdown());
    } else {
      setCountdown(localCountdown);
    }

    // 每秒更新一次
    intervalRef.current = setInterval(() => {
      // 如果有精确的服务器时间，使用计算方式
      if (gameState.next_draw_time && gameState.server_time) {
        const seconds = calculateCountdown();
        setCountdown(seconds);
        
        if (seconds === 0 && onStatusChange) {
          onStatusChange('drawing');
        }
      } else {
        // 否则使用本地倒数
        setLocalCountdown(prev => {
          const newValue = Math.max(0, prev - 1);
          setCountdown(newValue);
          
          // 当倒数到 0 时，触发状态变更
          if (newValue === 0 && gameState.status === 'betting' && onStatusChange) {
            onStatusChange('drawing');
          }
          
          return newValue;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, serverTimeOffset]); // 移除 localCountdown 依赖以避免重复触发

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