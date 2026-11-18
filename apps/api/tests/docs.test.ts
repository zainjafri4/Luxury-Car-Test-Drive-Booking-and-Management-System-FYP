import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

vi.mock('../src/lib/prisma.js', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      user: { findUnique: vi.fn() },
    },
  };
});

describe('API Documentation & Security Hardening (Phase 6)', () => {
  it('serves OpenAPI documentation JSON at /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('Zain Reserve');
  });

  it('serves Swagger UI HTML at /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('blocks state-changing requests without custom header or json content-type (CSRF)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .set('Content-Type', 'text/plain')
      .send('raw text');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_BLOCKED');
  });

  it('includes security headers from helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});

