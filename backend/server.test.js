const request = require('supertest');
const app = require('./server');

// Mock the 'pg' module to prevent actual DB connection attempts
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    connect: jest.fn(() => Promise.resolve(mClient)),
    query: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Backend API Tests', () => {
  // We need to access the mock pool to verify calls or setup return values if needed
  // Note: Since 'pool' is created at top-level in server.js, it uses the mock returned by the factory above.

  test('GET /api/status should return dbConnected: true when DB is healthy', async () => {
    // We don't need to do specific mock setups because the default mock 
    // simply returns a resolved promise for connect(), and query() does nothing/returns undefined 
    // which is enough for the simple 'await client.query(...)' line in the route to pass without error.
    
    const res = await request(app).get('/api/status');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ dbConnected: true });
  });
});
