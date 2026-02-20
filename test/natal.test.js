const { describe, it, before, after, mock } = require('node:test');
const assert = require('node:assert');

// Mock execFile before requiring app
const childProcess = require('node:child_process');
const originalExecFile = childProcess.execFile;

const SAMPLE_OUTPUT = `Astrolog 7.80 chart for Mon Jul 29, 1991  6:23pm (ST Zone 5E)  73:59E 40:44N
Body  Locat. Ret. Lati. Rul.      House  Rul. Veloc.    Placidus Houses

Sun :  5Leo56   + 0:00' (R) [ 7th house] [f] +0.955  -  House cusp  1: 19Cap25
Moon:  7Pis03   + 3:55' (-) [ 2nd house] [X] +12.33  -  House cusp  2:  3Pis34`;

let app;
let request;

describe('POST /api/natal', () => {
  before(async () => {
    // Replace execFile with mock
    childProcess.execFile = (path, args, opts, cb) => {
      cb(null, SAMPLE_OUTPUT, '');
    };
    app = require('../src/app');
    request = (await import('supertest')).default;
  });

  after(() => {
    childProcess.execFile = originalExecFile;
  });

  it('returns chart output for valid input with time', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({
        month: 7, day: 29, year: 1991,
        time: '18:23',
        longitude: -73.9857, latitude: 40.7484,
        timezone: -5,
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.output.includes('Astrolog'));
    assert.ok(res.body.command.includes('-q 7 29 1991 18:23'));
  });

  it('returns chart output for valid input without time', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({
        month: 7, day: 29, year: 1991,
        longitude: -73.9857, latitude: 40.7484,
        timezone: -5,
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.command.includes('-qd 7 29 1991'));
  });

  it('rejects missing month', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({ day: 29, year: 1991, time: '18:23', longitude: 0, latitude: 0, timezone: 0 })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('month'));
  });

  it('rejects invalid month', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({ month: 13, day: 29, year: 1991, time: '18:23', longitude: 0, latitude: 0, timezone: 0 })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('month'));
  });

  it('rejects invalid time format', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({ month: 7, day: 29, year: 1991, time: 'abc', longitude: 0, latitude: 0, timezone: 0 })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('time'));
  });

  it('rejects out-of-range latitude', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({ month: 7, day: 29, year: 1991, longitude: 0, latitude: 91, timezone: 0 })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('latitude'));
  });

  it('rejects out-of-range longitude', async () => {
    const res = await request(app)
      .post('/api/natal')
      .send({ month: 7, day: 29, year: 1991, longitude: 181, latitude: 0, timezone: 0 })
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('longitude'));
  });
});
