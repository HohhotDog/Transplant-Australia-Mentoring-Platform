// tests/avatar.test.js

// 1. Mock db, auth middleware, and multer before loading the app
jest.resetModules();
jest.mock('../db');
jest.mock('../middlewares/auth', () => ({
    ensureAuthenticated: (req, res, next) => {
        req.user = { id: 42 };
        next();
    },
}));
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            // simulate file upload
            req.file = { filename: 'test-avatar.jpg' };
            next();
        },
    });
    multer.diskStorage = () => {}; // stub out storage
    return multer;
});

const db = require('../db');
const request = require('supertest');
const express = require('express');
const avatarRouter = require('../routes/avatar');

describe('Avatar Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', avatarRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });



    it('should update existing profile when db.run changes > 0', async () => {
        // First run: update returns this.changes = 1
        db.run.mockImplementationOnce((sql, params, cb) =>
            cb.call({ changes: 1 }, null)
        );

        const res = await request(app)
            .post('/api/profile/avatar')
            .attach('avatar', Buffer.from(''), 'avatar.png');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            url: '/images/test-avatar.jpg',
        });
        expect(db.run).toHaveBeenCalledTimes(1);
    });

    it('should insert profile when update affects 0 rows', async () => {
        // First run: no rows updated
        db.run
            .mockImplementationOnce((sql, params, cb) =>
                cb.call({ changes: 0 }, null)
            )
            // Second run: insert succeeds
            .mockImplementationOnce((sql, params, cb) => cb(null));

        const res = await request(app)
            .post('/api/profile/avatar')
            .attach('avatar', Buffer.from(''), 'avatar.png');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            url: '/images/test-avatar.jpg',
        });
        expect(db.run).toHaveBeenCalledTimes(2);
    });

    it('should return 500 on database error', async () => {
        db.run.mockImplementationOnce((sql, params, cb) =>
            cb(new Error('failure'))
        );

        const res = await request(app)
            .post('/api/profile/avatar')
            .attach('avatar', Buffer.from(''), 'avatar.png');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Database update failed',
        });
    });
});
