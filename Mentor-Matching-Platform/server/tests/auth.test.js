// tests/auth.test.js

// 1. Mock db and bcrypt before loading the app
jest.mock('../db');
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const db = require('../db');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../app');

describe('AuthRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('POST /api/register', () => {
        const payload = {
            email: 'user@example.com',
            password: 'secret123',
            securityQuestion: 'Your pet?',
            securityAnswer: 'fluffy',
        };

        it('returns 400 if any field is missing', async () => {
            const res = await request(app).post('/api/register').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, message: 'All fields are required.' });
        });

        it('returns 500 on database error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('DB error')));
            const res = await request(app).post('/api/register').send(payload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Database error.' });
        });

        it('returns 400 if email already registered', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, { id: 1 }));
            const res = await request(app).post('/api/register').send(payload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, message: 'Email already registered.' });
        });

        it('hashes credentials and inserts new user', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            bcrypt.hash
                .mockResolvedValueOnce('hashedPassword')
                .mockResolvedValueOnce('hashedAnswer');
            db.run.mockImplementation((sql, params, cb) => cb.call({ lastID: 42 }, null));

            const res = await request(app).post('/api/register').send(payload);

            expect(bcrypt.hash).toHaveBeenNthCalledWith(1, payload.password, 10);
            expect(bcrypt.hash).toHaveBeenNthCalledWith(2, payload.securityAnswer, 10);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, userId: 42 });
        });
    });

    describe('POST /api/login', () => {
        const creds = { email: 'user@x.com', password: 'pass123' };

        it('returns 400 if missing fields', async () => {
            const res = await request(app).post('/api/login').send({ email: 'a@b' });
            expect(res.status).toBe(400);
        });

        it('returns 500 on db error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).post('/api/login').send(creds);
            expect(res.status).toBe(500);
        });

        it('returns 401 if user not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app).post('/api/login').send(creds);
            expect(res.status).toBe(401);
        });

        it('returns 401 on wrong password', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { id: 1, email: creds.email, password_hash: 'hash', account_type: 'standard' })
            );
            bcrypt.compare.mockResolvedValue(false);
            const res = await request(app).post('/api/login').send(creds);
            expect(res.status).toBe(401);
        });

        it('logs in and returns account_type + avatar_url', async () => {
            // first db.get: user row
            // second db.get: profile row
            db.get
                .mockImplementationOnce((sql, params, cb) =>
                    cb(null, { id: 1, email: creds.email, password_hash: 'hash', account_type: 'standard' })
                )
                .mockImplementationOnce((sql, params, cb) =>
                    cb(null, { profile_picture_url: 'http://img.url/pic.png' })
                );
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app).post('/api/login').send(creds);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: 'Login successful.',
                account_type: 'standard',
                avatar_url: 'http://img.url/pic.png',
            });
        });
    });

    describe('POST /api/forgot-password', () => {
        const payload = {
            email: 'user@x.com',
            securityAnswer: 'fluffy',
            newPassword: 'newpass',
        };

        it('returns 400 if missing fields', async () => {
            const res = await request(app).post('/api/forgot-password').send({ email: 'a@b' });
            expect(res.status).toBe(400);
        });

        it('returns 500 on db error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).post('/api/forgot-password').send(payload);
            expect(res.status).toBe(500);
        });

        it('returns 404 if user not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app).post('/api/forgot-password').send(payload);
            expect(res.status).toBe(404);
        });

        it('returns 403 on wrong security answer', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash' })
            );
            bcrypt.compare.mockResolvedValue(false);
            const res = await request(app).post('/api/forgot-password').send(payload);
            expect(res.status).toBe(403);
        });

        it('resets password on correct answer', async () => {
            db.get.mockImplementation((sql, params, cb) =>
                cb(null, { security_answer_hash: 'hash' })
            );
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('newHash');
            db.run.mockImplementation((sql, params, cb) => cb(null));

            const res = await request(app).post('/api/forgot-password').send(payload);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: 'Password has been reset successfully.',
            });
        });
    });

    describe('Session-based routes', () => {
        const agent = request.agent(app);

        beforeEach(() => {
            jest.clearAllMocks();
            // stub login for session
            db.get
                .mockImplementationOnce((sql, params, cb) => // login user row
                    cb(null, { id: 5, email: 'u@x', password_hash: 'h', account_type: 'std' })
                )
                .mockImplementationOnce((sql, params, cb) => // profile row
                    cb(null, { profile_picture_url: null })
                );
            bcrypt.compare.mockResolvedValue(true);
        });

        it('GET /api/me returns 401 if not logged in', async () => {
            const res = await agent.get('/api/me');
            expect(res.status).toBe(401);
        });

        it('GET /api/me returns user info when logged in', async () => {
            await agent.post('/api/login').send({ email: 'u@x', password: 'p' });
            const res = await agent.get('/api/me');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                id: 5,
                email: 'u@x',
                account_type: 'std',
                avatar_url: null,
            });
        });

        it('POST /api/logout clears session', async () => {
            await agent.post('/api/login').send({ email: 'u@x', password: 'p' });
            const res = await agent.post('/api/logout');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, message: 'Logged out successfully.' });
            // subsequent check-auth should be false
            const chk = await agent.get('/api/check-auth');
            expect(chk.body).toEqual({ isAuthenticated: false });
        });




    });
});
