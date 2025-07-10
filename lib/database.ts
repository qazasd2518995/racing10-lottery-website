import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'dpg-d0e2imc9c44c73che3kg-a.oregon-postgres.render.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bet_game',
  user: process.env.DB_USER || 'bet_game_user',
  password: process.env.DB_PASSWORD || 'Vm4J5g1gymwPfBNcgYfGCe4GEZqCjoIy',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    // Test connection on startup
    pool.connect((err, client, done) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Database connected successfully');
        if (client) done();
      }
    });
  }
  
  return pool;
}

// Interface definitions
export interface DrawRecord {
  id: number;
  period: string;
  result: number[];
  draw_time: Date;
  created_at: Date;
}

export interface GameState {
  id: number;
  current_period: string;
  countdown_seconds: number;
  last_result: number[];
  status: string;
  updated_at: Date;
}

// Database query functions
export async function getCurrentGameState(): Promise<GameState | null> {
  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT current_period, countdown_seconds, last_result, status, updated_at
      FROM game_state 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: 1,
      current_period: row.current_period?.toString() || '',
      countdown_seconds: row.countdown_seconds || 0,
      last_result: Array.isArray(row.last_result) ? row.last_result : JSON.parse(row.last_result || '[]'),
      status: row.status || 'betting',
      updated_at: row.updated_at || new Date()
    };
  } catch (error) {
    console.error('Error fetching game state:', error);
    return null;
  }
}

export async function getLatestDrawRecords(limit = 10): Promise<DrawRecord[]> {
  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT period, result, draw_time, created_at
      FROM draw_records 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);
    
    return result.rows.map(row => ({
      id: 0,
      period: row.period,
      result: Array.isArray(row.result) ? row.result : JSON.parse(row.result || '[]'),
      draw_time: row.draw_time,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching draw records:', error);
    return [];
  }
}

export async function getDrawRecordsByDate(date: string): Promise<DrawRecord[]> {
  const pool = getPool();
  try {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const result = await pool.query(`
      SELECT period, result, draw_time, created_at
      FROM draw_records 
      WHERE draw_time >= $1 AND draw_time < $2
      ORDER BY draw_time DESC
    `, [startDate, endDate]);
    
    return result.rows.map(row => ({
      id: 0,
      period: row.period,
      result: Array.isArray(row.result) ? row.result : JSON.parse(row.result || '[]'),
      draw_time: row.draw_time,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching draw records by date:', error);
    return [];
  }
}

export async function getDrawRecordByPeriod(period: string): Promise<DrawRecord | null> {
  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT period, result, draw_time, created_at
      FROM draw_records 
      WHERE period = $1
    `, [period]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: 0,
      period: row.period,
      result: Array.isArray(row.result) ? row.result : JSON.parse(row.result || '[]'),
      draw_time: row.draw_time,
      created_at: row.created_at
    };
  } catch (error) {
    console.error('Error fetching draw record by period:', error);
    return null;
  }
} 