const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const childProcess = require('node:child_process');
const originalExecFile = childProcess.execFile;

const SAMPLE_TRANSIT = `Astrolog 7.80 chart for Mon Jul 29, 1991  6:23pm (ST Zone 5E)  73:59E 40:44N

Transits at: Fri Feb 20, 2026 12:00am (ST Zone 5E)
  1: trans   Pluto (Aqu) Opp natal (Leo) Sun        - neg 1:39' - power: 237.62
  2: trans   Pluto (Aqu) Con natal [Aqu] Saturn     - pos 0:57' - power: 107.95`;

let app;
let request;

describe('POST /api/transit', () => {
  before(async () => {
    childProcess.execFile = (path, args, opts, cb) => {
      cb(null, SAMPLE_TRANSIT, '');
    };
    app = require('../src/app');
    request = (await import('supertest')).default;
  });

  after(() => {
    childProcess.execFile = originalExecFile;
  });

  const validNatal = {
    month: 7, day: 29, year: 1991,
    time: '18:23',
    longitude: -73.9857, latitude: 40.7484,
    timezone: -5,
  };

  it('returns transit output for a specific date', async () => {
    const res = await request(app)
      .post('/api/transit')
      .send({
        natal: validNatal,
        transit: { month: 2, day: 20, year: 2026 },
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.output.includes('Transits'));
    assert.ok(res.body.command.includes('-T 2 20 2026'));
  });

  it('returns transit output for a whole month', async () => {
    const res = await request(app)
      .post('/api/transit')
      .send({
        natal: validNatal,
        transit: { month: 2, year: 2026 },
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.command.includes('-t 2 2026'));
  });

  it('rejects missing natal object', async () => {
    const res = await request(app)
      .post('/api/transit')
      .send({ transit: { month: 2, year: 2026 } })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('natal'));
  });

  it('rejects missing transit object', async () => {
    const res = await request(app)
      .post('/api/transit')
      .send({ natal: validNatal })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('transit'));
  });

  it('rejects invalid transit month', async () => {
    const res = await request(app)
      .post('/api/transit')
      .send({
        natal: validNatal,
        transit: { month: 0, year: 2026 },
      })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('transit.month'));
  });
});
