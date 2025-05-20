// tests/sessions.test.js

jest.mock('../db');
jest.mock('../middlewares/auth', () => ({
    ensureAuthenticated: (req, res, next) => {
        const uid = req.headers['x-session-user'];
        if (uid) req.user = { id: Number(uid) };
        next();
    }
}));

const db = require('../db');
const request = require('supertest');
const express = require('express');
const sessionsRouter = require('../routes/sessions');

describe('sessions.js routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', sessionsRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/my-sessions', () => {
        const url = '/api/my-sessions';



        it('500 on db error', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app)
                .get(url)
                .set('X-Session-User', '5');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });

        it('200 returns user sessions', async () => {
            const rows = [
                { id:1, title:'S1', image:'/img1', description:'D1', startDate:'2025-01-01', endDate:'2025-02-01', role:'mentor', status:'approved' }
            ];
            db.all.mockImplementation((sql, params, cb) => {
                expect(params).toEqual([5]);
                cb(null, rows);
            });
            const res = await request(app)
                .get(url)
                .set('X-Session-User','5');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(rows);
        });
    });

    describe('GET /api/sessions', () => {
        const url = '/api/sessions';

        it('500 on db error', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('err')));
            const res = await request(app).get(url);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });

        it('200 returns all available sessions', async () => {
            const rows = [
                { id:2, title:'S2', image:'/img2', description:'D2', startDate:'2025-03-01', endDate:'2025-04-01' }
            ];
            db.all.mockImplementation((sql, params, cb) => {
                expect(params).toEqual([]);
                cb(null, rows);
            });
            const res = await request(app).get(url);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(rows);
        });
    });

    describe('GET /api/sessions/:id', () => {
        const url = '/api/sessions/7';



        it('500 on db error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('db')));
            const res = await request(app)
                .get(url)
                .set('X-Session-User','8');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });

        it('404 if not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app)
                .get(url)
                .set('X-Session-User','9');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Session not found' });
        });

        it('200 returns session detail', async () => {
            const row = { id:7, title:'S7', image:'/i7', description:'D7', startDate:'2025-05-01', endDate:'2025-06-01' };
            db.get.mockImplementation((sql, params, cb) => {
                expect(params).toEqual(['7']);
                cb(null, row);
            });
            const res = await request(app)
                .get(url)
                .set('X-Session-User','10');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(row);
        });
    });

    describe('POST /api/sessions/:id/apply', () => {
        const url = '/api/sessions/12/apply';



        it('500 on check error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('chk')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','11')
                .send({ role:'mentor' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });

        it('409 if already applied', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, { id: 5 }));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','12')
                .send({ role:'mentor' });
            expect(res.status).toBe(409);
            expect(res.body).toEqual({ error: 'Already applied' });
        });

        it('400 on invalid role', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','13')
                .send({ role:'invalid' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: 'Invalid role. Allowed values are "mentor" or "mentee".'
            });
        });

        it('201 on success', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            db.run.mockImplementation((sql, params, cb) => cb.call({}, null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','14')
                .send({ role:'mentee' });
            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                message: 'Applied successfully',
                sessionId: '12'
            });
        });

        it('500 on insert error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            db.run.mockImplementation((sql, params, cb) => cb(new Error('ins')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','15')
                .send({ role:'mentor' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('DELETE /api/sessions/:id/apply', () => {
        const url = '/api/sessions/20/apply';



        it('500 on delete error', async () => {
            db.run.mockImplementation((sql, params, cb) => cb(new Error('del')));
            const res = await request(app)
                .delete(url)
                .set('X-Session-User','16');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });

        it('404 if no rows deleted', async () => {
            db.run.mockImplementation((sql, params, cb) => cb.call({ changes:0 }, null));
            const res = await request(app)
                .delete(url)
                .set('X-Session-User','17');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Not applied or not found' });
        });

        it('200 on success', async () => {
            db.run.mockImplementation((sql, params, cb) => cb.call({ changes:1 }, null));
            const res = await request(app)
                .delete(url)
                .set('X-Session-User','18');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                message: 'Application cancelled successfully',
                sessionId: '20'
            });
        });
    });
});
