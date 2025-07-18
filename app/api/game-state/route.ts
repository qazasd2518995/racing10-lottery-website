import { NextRequest, NextResponse } from 'next/server';

const GAME_API_URL = process.env.GAME_API_URL || 'https://racing10-c9ee.onrender.com';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching current game state from main game API...');
    
    // Fetch from main game API
    const response = await fetch(`${GAME_API_URL}/api/game-data`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching to always get fresh data
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Game API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.gameData) {
      return NextResponse.json({
        success: false,
        message: 'No game state found'
      }, { status: 404 });
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