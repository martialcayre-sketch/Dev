import request from 'supertest';

// Ensure functions index initializes admin before importing the app
beforeAll(async () => {
  // Point to emulators if available
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:5003';
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:5004';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST =
    process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:5005';
  // Import index to trigger admin.initializeApp()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../index');
});

describe('HTTP API (Functions) basic integration', () => {
  it('GET /health returns ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { expressApp } = require('../../http/app');
    const res = await request(expressApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.status', 'ok');
    expect(res.headers).toHaveProperty('x-request-id');
  });

  it('GET /api/health returns ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { expressApp } = require('../../http/app');
    const res = await request(expressApp).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.status', 'ok');
    expect(res.headers).toHaveProperty('x-request-id');
  });

  it('GET /catalog/questionnaires returns list', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { expressApp } = require('../../http/app');
    const res = await request(expressApp).get('/catalog/questionnaires');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.questionnaires');
    expect(Array.isArray(res.body.data.questionnaires)).toBe(true);
  });
});
