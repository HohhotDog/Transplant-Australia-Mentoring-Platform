// tests/mentors.test.js

// 1. Mock the db module before loading the router
jest.mock('../db');

const db = require('../db');
const request = require('supertest');
const express = require('express');
const mentorsRouter = require('../routes/mentors');

describe('mentors.js routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // mount the mentors router at /api/mentors
        app.use('/api/mentors', mentorsRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/mentors', () => {
        it('should return a list of mentors matching the search term', async () => {
            const mockRows = [
                { id: 1, name: 'Alice Smith', avatar: '/images/alice.png' },
                { id: 2, name: 'Bob Jones', avatar: '/images/bob.jpg' },
            ];
            db.all.mockImplementation((sql, params, cb) => {
                // expect the search parameter to be wrapped in %
                expect(params).toEqual(['%ali%']);
                cb(null, mockRows);
            });

            const res = await request(app)
                .get('/api/mentors')
                .query({ search: 'ali' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRows);
        });

        it('should default to empty search if none provided', async () => {
            const mockRows = [{ id: 3, name: 'Carol White', avatar: null }];
            db.all.mockImplementation((sql, params, cb) => {
                // empty search wraps to %%
                expect(params).toEqual(['%%']);
                cb(null, mockRows);
            });

            const res = await request(app).get('/api/mentors');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRows);
        });

        it('should return 500 if the database errors', async () => {
            db.all.mockImplementation((sql, params, cb) => {
                cb(new Error('db failure'));
            });

            const res = await request(app)
                .get('/api/mentors')
                .query({ search: 'x' });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'db failure' });
        });
    });
});
