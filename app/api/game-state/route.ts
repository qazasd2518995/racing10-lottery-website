import { NextRequest, NextResponse } from 'next/server';
import { getCurrentGameState } from '@/lib/database';

// Try multiple possible game API URLs
const GAME_API_URLS = [
  process.env.GAME_API_URL,
  'https://fsracing-b8d4.onrender.com',
  'https://racing10-c9ee.onrender.com',
  'http://localhost:3000'
].filter(Boolean);

async function fetchFromGameAPI(url: string): Promise<any> {
  try {
    const response = await fetch(`${url}/api/game-data`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      // Add timeout
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Attempting to fetch game state...');
    
    // Try each API URL in order
    let data = null;
    let lastError = null;
    
    for (const url of GAME_API_URLS) {
      if (!url) continue;
      
      console.log(`Trying API: ${url}`);
      try {
        data = await fetchFromGameAPI(url);
        if (data && data.gameData) {
          console.log(`Successfully fetched from: ${url}`);
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    // If all external APIs fail, fall back to local database
    if (!data || !data.gameData) {
      console.log('All external APIs failed, falling back to local database...');
      
      const gameState = await getCurrentGameState();
      
      if (!gameState) {
        return NextResponse.json({
          success: false,
          message: 'No game state available'
        }, { status: 404 });
      }

      // Return local data in expected format
      const now = new Date();
      const timeRemaining = Math.max(0, gameState.countdown_seconds);
      
      return NextResponse.json({
        success: true,
        data: {
          current_period: gameState.current_period,
          countdown_seconds: timeRemaining,
          last_result: gameState.last_result,
          status: gameState.status,
          server_time: now.toISOString(),
          next_draw_time: new Date(now.getTime() + (timeRemaining * 1000)).toISOString(),
          current_block_height: gameState.current_block_height,
          current_block_hash: gameState.current_block_hash
        }
      });
    }

    // Transform the response to match our format
    return NextResponse.json({
      success: true,
      data: {
        current_period: data.gameData.currentPeriod,
        countdown_seconds: data.gameData.countdownSeconds,
        last_result: data.gameData.lastResult,
        status: data.gameData.status,
        server_time: data.gameData.serverTime || new Date().toISOString(),
        next_draw_time: data.gameData.nextDrawTime || new Date(Date.now() + (data.gameData.countdownSeconds * 1000)).toISOString(),
        current_block_height: null,
        current_block_hash: null
      }
    });
    
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 