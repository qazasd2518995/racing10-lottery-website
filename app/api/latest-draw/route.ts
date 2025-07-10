import { NextRequest, NextResponse } from 'next/server';
import { getLatestDrawRecords } from '@/lib/database';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching latest draw result...');
    
    const drawRecords = await getLatestDrawRecords(1);
    
    if (drawRecords.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No draw results found'
      }, { status: 404 });
    }
    
    const latest = drawRecords[0];
    
    return NextResponse.json({
      success: true,
      data: {
        issue: latest.period,
        date: dayjs(latest.draw_time).format('YYYY-MM-DD HH:mm:ss'),
        numbers: latest.result,
        timestamp: latest.draw_time.getTime()
      }
    });
    
  } catch (error) {
    console.error('Error fetching latest draw:', error);
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