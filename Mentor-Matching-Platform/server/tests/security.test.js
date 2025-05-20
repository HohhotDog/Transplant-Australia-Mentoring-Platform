// tests/security.test.js

jest.mock('../db');
jest.mock('bcrypt');

const db = require('../db');
const bcrypt = require('bcrypt');
const request = require('supertest');
const express = require('express');
const securityRouter = require('../routes/security');

describe('SecurityRoutes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // simulate session via header
        app.use((req, res, next) => {
            const userId = req.headers['x-session-user'];
            req.session = userId ? { user: { id: Number(userId) } } : {};
            next();
        });
        app.use('/api', securityRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/security-question', () => {
        it('returns 401 if not authenticated', async () => {
            const res = await request(app).get('/api/security-question');
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
        });

        it('returns 500 on database error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('db err')));
            const res = await request(app)
                .get('/api/security-question')
                .set('X-Session-User', '10');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Database error' });
        });

        it('returns 404 if user not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app)
                .get('/api/security-question')
                .set('X-Session-User', '11');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ success: false, message: 'User not found' });
        });

        it('returns 200 with question on success', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_question: 'Favorite color?' })
            );
            const res = await request(app)
                .get('/api/security-question')
                .set('X-Session-User', '12');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                question: 'Favorite color?',
            });
        });
    });

    describe('POST /api/update-password', () => {
        const url = '/api/update-password';
        const validBody = {
            securityAnswer: 'blue',
            currentPassword: 'oldpass',
            newPassword: 'newpass123',
        };

        it('returns 401 if not authenticated', async () => {
            const res = await request(app).post(url).send(validBody);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
        });

        it('returns 400 if missing fields', async () => {
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '20')
                .send({ securityAnswer: 'a', currentPassword: 'b' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, message: 'Missing fields.' });
        });

        it('returns 500 if user fetch fails', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('not found')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '21')
                .send(validBody);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'User not found.' });
        });

        it('returns 403 if security answer incorrect', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash', password_hash: 'phash' })
            );
            bcrypt.compare.mockResolvedValueOnce(false);
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '22')
                .send(validBody);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({
                success: false,
                message: 'Incorrect security answer.',
            });
        });

        it('returns 403 if current password incorrect', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash', password_hash: 'phash' })
            );
            bcrypt.compare
                .mockResolvedValueOnce(true)  // answer correct
                .mockResolvedValueOnce(false); // password incorrect
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '23')
                .send(validBody);
            expect(res.status).toBe(403);
            expect(res.body).toEqual({
                success: false,
                message: 'Incorrect current password.',
            });
        });

        it('returns 400 if new password matches current', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash', password_hash: 'phash' })
            );
            bcrypt.compare
                .mockResolvedValueOnce(true)  // answer correct
                .mockResolvedValueOnce(true)  // current password correct
                .mockResolvedValueOnce(true); // new vs current match
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '24')
                .send(validBody);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                success: false,
                message: 'New password must be different from the current password.',
            });
        });

        it('updates password successfully', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash', password_hash: 'phash' })
            );
            bcrypt.compare
                .mockResolvedValueOnce(true)   // answer correct
                .mockResolvedValueOnce(true)   // current password correct
                .mockResolvedValueOnce(false); // new vs current differ
            bcrypt.hash.mockResolvedValue('newhash');
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '25')
                .send(validBody);
            expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: 'Password updated successfully.',
            });
        });

        it('returns 500 if update run fails', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash', password_hash: 'phash' })
            );
            bcrypt.compare
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            bcrypt.hash.mockResolvedValue('newhash');
            db.run.mockImplementation((sql, params, cb) => cb(new Error('run fail')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '26')
                .send(validBody);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                success: false,
                message: 'Failed to update password.',
            });
        });
    });
});
