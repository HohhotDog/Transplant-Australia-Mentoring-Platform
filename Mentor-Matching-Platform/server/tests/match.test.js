// tests/match.test.js

// 1. Mock dependencies before loading the router
jest.mock('../utils/matchAlgorithm');
jest.mock('../db');
jest.mock('../middlewares/auth', () => ({
    ensureAuthenticated: (req, res, next) => {
        req.user = { id: 99 };
        next();
    }
}));

const getTopMentorMatchesForMentee = require('../utils/matchAlgorithm');
const db = require('../db');
const request = require('supertest');
const express = require('express');
const matchRouter = require('../routes/match');

describe('match.js routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // mount the router for both endpoints
        app.use('/api/match-mentee', matchRouter);
        app.use('/api', matchRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });


    describe('GET /api/sessions/:sessionId/matches', () => {
        it('returns empty array if no pairs found', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(null, []));
            const res = await request(app).get('/api/sessions/3/matches');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('returns paired other user info', async () => {
            const fakePair = [{
                id: 55,
                session_id: 3,
                mentor_id: 99,
                mentee_id: 42,
                created_at: '2025-05-01 12:00:00'
            }];
            db.all.mockImplementation((sql, params, cb) => {
                expect(params).toEqual([3, 99, 99]);
                cb(null, fakePair);
            });
            db.get.mockImplementation((sql, params, cb) => {
                expect(params).toEqual([42]);
                cb(null, { id: 42, email: 'mentee@example.com' });
            });

            const res = await request(app).get('/api/sessions/3/matches');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    pairId: 55,
                    sessionId: 3,
                    role: 'mentor',
                    other: { id: 42, email: 'mentee@example.com' },
                    createdAt: '2025-05-01 12:00:00'
                }
            ]);
        });

        it('returns 500 on db error fetching pairs', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('bad')));
            const res = await request(app).get('/api/sessions/3/matches');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });

        it('returns 500 on db error fetching other user', async () => {
            const fakePair = [{
                id: 55,
                session_id: 3,
                mentor_id: 99,
                mentee_id: 42,
                created_at: '2025-05-01 12:00:00'
            }];
            db.all.mockImplementation((sql, params, cb) => cb(null, fakePair));
            db.get.mockImplementation((sql, params, cb) => cb(new Error('oops')));
            const res = await request(app).get('/api/sessions/3/matches');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
});
