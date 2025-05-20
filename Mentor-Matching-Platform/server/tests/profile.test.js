// tests/profile.test.js

jest.mock('../db');

const db = require('../db');
const request = require('supertest');
const express = require('express');
const profileRouter = require('../routes/profile');

describe('ProfileRoutes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // inject session for authenticated routes
        app.use((req, res, next) => {
            req.session = req.headers['x-session-user']
                ? { user: { id: Number(req.headers['x-session-user']) } }
                : {};
            next();
        });
        app.use('/api', profileRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/profile', () => {
        it('returns 401 if not authenticated', async () => {
            const res = await request(app).get('/api/profile');
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
        });

        it('returns 404 if profile missing', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            const res = await request(app)
                .get('/api/profile')
                .set('X-Session-User', '5');
            expect(db.get).toHaveBeenCalledWith(
                expect.stringContaining('FROM users u'),
                [5],
                expect.any(Function)
            );
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                success: false,
                message: 'Incomplete or missing profile. Please complete your profile.',
            });
        });

        it('returns 404 if profile incomplete', async () => {
            const incomplete = {
                email: 'a@b.com',
                first_name: 'A',
                last_name: '',
                date_of_birth: '2000-01-01',
                address: 'X',
                city_suburb: 'Y',
                state: 'Z',
                postal_code: '12345',
                gender: 'F',
                aboriginal_or_torres_strait_islander: 'No',
                language_spoken_at_home: 'English',
                living_situation: 'Home',
            };
            db.get.mockImplementation((sql, params, cb) => cb(null, incomplete));
            const res = await request(app)
                .get('/api/profile')
                .set('X-Session-User', '7');
            expect(res.status).toBe(404);
        });

        it('returns 200 with profile if complete', async () => {
            const complete = {
                email: 'u@x.com',
                first_name: 'U',
                last_name: 'X',
                date_of_birth: '1990-05-05',
                address: '123 St',
                city_suburb: 'City',
                state: 'State',
                postal_code: '0000',
                gender: 'M',
                aboriginal_or_torres_strait_islander: 'No',
                language_spoken_at_home: 'English',
                living_situation: 'Own home',
            };
            db.get.mockImplementation((sql, params, cb) => cb(null, complete));
            const res = await request(app)
                .get('/api/profile')
                .set('X-Session-User', '8');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, profile: complete });
        });

        it('returns 500 on DB error', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app)
                .get('/api/profile')
                .set('X-Session-User', '9');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Database error' });
        });
    });

    describe('POST /api/profile', () => {
        const valid = {
            first_name: 'A',
            last_name: 'B',
            date_of_birth: '1980-01-01',
            address: 'Addr',
            city_suburb: 'City',
            state: 'ST',
            postal_code: '1000',
            gender: 'F',
            aboriginal_or_torres_strait_islander: 'No',
            language_spoken_at_home: 'English',
            living_situation: 'Rent',
            profile_picture_url: '/img.png',
            bio: 'Hello',
            phone_number: '123456',
        };

        it('returns 401 if not authenticated', async () => {
            const res = await request(app).post('/api/profile').send(valid);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
        });

        it('returns 400 for future DOB', async () => {
            const payload = { ...valid, date_of_birth: '3000-01-01' };
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '10')
                .send(payload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                success: false,
                message: 'Invalid date of birth. It must be a valid past date.',
            });
        });

        it('updates existing profile', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, { user_id: 11 }));
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '11')
                .send(valid);
            expect(db.get).toHaveBeenCalledWith(
                'SELECT * FROM profiles WHERE user_id = ?',
                [11],
                expect.any(Function)
            );
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('creates new profile if none exists', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '12')
                .send(valid);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('returns 500 on DB error checking', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '13')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Database error' });
        });

        it('returns 500 on DB error updating', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, { user_id: 14 }));
            db.run.mockImplementation((sql, params, cb) => cb(new Error('upd fail')));
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '14')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Failed to update profile.' });
        });

        it('returns 500 on DB error inserting', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, null));
            db.run.mockImplementation((sql, params, cb) => cb(new Error('ins fail')));
            const res = await request(app)
                .post('/api/profile')
                .set('X-Session-User', '15')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Failed to create profile.' });
        });
    });
});
