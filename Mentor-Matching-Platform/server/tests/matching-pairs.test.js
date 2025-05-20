// tests/matching-pairs.test.js

// Mock the db module before loading the router
jest.mock('../db');

const db = require('../db');
const request = require('supertest');
const express = require('express');
const matchingPairsRouter = require('../routes/matching-pairs');

describe('matching-pairs.js', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', matchingPairsRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const url = '/api/matching-pairs';

    it('returns 400 if any field is missing', async () => {
        const res = await request(app).post(url).send({});
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            message: 'Missing sessionId, mentorId or menteeId',
        });
    });

    it('creates a new matching pair when db.run returns lastID', async () => {
        const body = { sessionId: 1, mentorId: 2, menteeId: 3 };
        // Simulate callback this.lastID = 99
        db.run.mockImplementation((sql, params, cb) => {
            cb.call({ lastID: 99 }, null);
        });

        const res = await request(app).post(url).send(body);
        expect(db.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO matching_pairs'),
            [1, 2, 3],
            expect.any(Function)
        );
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            pairId: 99,
            body,
            message: 'Matching pair created',
        });
    });

    it('returns "already exists" when lastID is undefined', async () => {
        const body = { sessionId: 4, mentorId: 5, menteeId: 6 };
        // Simulate callback with no lastID
        db.run.mockImplementation((sql, params, cb) => {
            cb.call({}, null);
        });

        const res = await request(app).post(url).send(body);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            pairId: null,
            body,
            message: 'Matching pair already exists',
        });
    });

    it('returns 500 on database error', async () => {
        const body = { sessionId: 7, mentorId: 8, menteeId: 9 };
        db.run.mockImplementation((sql, params, cb) => {
            cb(new Error('insert fail'));
        });

        const res = await request(app).post(url).send(body);
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'insert fail' });
    });
});
