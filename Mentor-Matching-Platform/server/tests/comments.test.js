// tests/comments.test.js

// 1. Mock db before loading the router
jest.resetModules();
jest.mock('../db');

const db = require('../db');
const request = require('supertest');
const express = require('express');
const commentsRouter = require('../routes/comments');

describe('Comments Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/comments', commentsRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/comments/:userId', () => {
        it('should return list of comments', async () => {
            const mockRows = [
                { content: 'Nice work', created_at: '2025-01-10', commenter: 'Alice Smith' },
            ];
            db.all.mockImplementation((sql, params, cb) => {
                expect(params).toEqual(['42', '7']);
                cb(null, mockRows);
            });

            const res = await request(app).get('/api/comments/42').query({ sessionId: '7' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRows);
        });

        it('should 500 on db error', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).get('/api/comments/1').query({ sessionId: '2' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Failed to fetch comments' });
        });
    });

    describe('POST /api/comments/:userId', () => {
        const url = '/api/comments/42';
        const validBody = {
            commenterId: 7,
            content: 'Great session!',
            sessionId: 3,
        };

        it('should 400 if missing fields', async () => {
            const res = await request(app).post(url).send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: 'Commenter ID, content, and session ID are required',
            });
        });

        it('should 404 if target user not found', async () => {
            db.getAsync = jest.fn().mockResolvedValue(null);
            const res = await request(app).post(url).send(validBody);
            expect(db.getAsync).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE id = ?',
                ['42']
            );
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Target user not found' });
        });

        it('should 404 if commenter not found', async () => {
            db.getAsync = jest
                .fn()
                .mockResolvedValueOnce({ id: 42 })   // target exists
                .mockResolvedValueOnce(null);         // commenter missing

            const res = await request(app).post(url).send(validBody);
            expect(db.getAsync).toHaveBeenNthCalledWith(
                2,
                'SELECT id FROM users WHERE id = ?',
                [7]
            );
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Commenter not found' });
        });

        it('should 500 on insert error', async () => {
            db.getAsync = jest.fn().mockResolvedValue({ id: 1 });
            db.runAsync = jest.fn().mockRejectedValue(new Error('insert fail'));

            const res = await request(app).post(url).send(validBody);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Failed to add comment' });
        });

        it('should return the new comment on success', async () => {
            const inserted = {
                id: 99,
                content: 'Nice job',
                created_at: '2025-02-14',
                commenter: 'Bob Jones',
            };

            db.getAsync = jest
                .fn()
                .mockResolvedValueOnce({ id: 42 })           // target user exists
                .mockResolvedValueOnce({ id: 7 });           // commenter exists

            db.runAsync = jest.fn().mockResolvedValue({ lastID: 99 });

            db.getAsync = db.getAsync
                .mockResolvedValueOnce({ id: 42 })           // reused, irrelevant
                .mockResolvedValueOnce({ id: 7 })            // reused, irrelevant
            // final getAsync for inserted comment:
            db.getAsync = jest
                .fn()
                .mockResolvedValueOnce({ id: 42 })            // target
                .mockResolvedValueOnce({ id: 7 })             // commenter
                .mockResolvedValueOnce(inserted);

            const res = await request(app).post(url).send(validBody);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                comment: inserted,
            });
        });
    });
});
