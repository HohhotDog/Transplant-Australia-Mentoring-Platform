// tests/survey.test.js

jest.mock('../db');
jest.mock('../utils/matchAlgorithm');

const db = require('../db');
const matchAlgorithm = require('../utils/matchAlgorithm');
const request = require('supertest');
const express = require('express');
const surveyRouter = require('../routes/survey');

describe('survey.js routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // simulate session via header X-Session-User
        app.use((req, res, next) => {
            const uid = req.headers['x-session-user'];
            req.session = uid ? { user: { id: Number(uid) } } : {};
            next();
        });
        app.use('/api', surveyRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('POST /api/save-preferences', () => {
        const url = '/api/save-preferences';
        const valid = {
            sessionId: 1,
            role: 'mentor',
            session_role: 'lead',
            transplantType: ['kidney'],
            transplantYear: 2020,
            goals: ['grow'],
            meetingPref: 'weekly',
            sportsInterest: ['soccer'],
        };

        it('401 if not authenticated', async () => {
            const res = await request(app).post(url).send(valid);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
        });

        it('400 if missing sessionId or role', async () => {
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '5')
                .send({ role: 'mentor' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, error: 'Missing sessionId or role' });
        });

        it('saves preferences successfully', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(42);
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '6')
                .send(valid);
            expect(db.ensureApplicationExists).toHaveBeenCalledWith(6, 1, 'mentor');
            expect(db.getApplicationIdForUser).toHaveBeenCalledWith(6, 1);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('500 on db.run error', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(43);
            db.run.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '7')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'fail' });
        });
    });

    describe('POST /api/save-lifestyle', () => {
        const url = '/api/save-lifestyle';
        const valid = {
            sessionId: 2,
            role: 'mentee',
            answers: {
                physicalExerciseFrequency: 'daily',
                likeAnimals: true,
                likeCooking: false,
                travelImportance: 'high',
                freeTimePreference: 'reading',
                feelOverwhelmed: false,
                activityBarriers: 'none',
                longTermGoals: 'stay healthy',
                stressHandling: 'meditation',
                motivationLevel: 5,
                hadMentor: false,
            }
        };

        it('401 if not authenticated', async () => {
            const res = await request(app).post(url).send(valid);
            expect(res.status).toBe(401);
        });

        it('400 if missing fields', async () => {
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '8')
                .send({ sessionId: 2, role: 'mentee' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, error: 'Missing sessionId, role, or answers' });
        });

        it('saves lifestyle answers', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(99);
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '9')
                .send(valid);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('500 on error saving', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(100);
            db.run.mockImplementation((sql, params, cb) => cb(new Error('oops')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '10')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'oops' });
        });
    });

    describe('POST /api/save-enneagram', () => {
        const url = '/api/save-enneagram';
        const valid = {
            sessionId: 3,
            role: 'mentor',
            topTypes: [1,2],
            allScores: { '1': 5, '2': 3 },
            answers: { q1: 'a', q2: 'b' },
        };

        it('401 if not auth', async () => {
            const res = await request(app).post(url).send(valid);
            expect(res.status).toBe(401);
        });

        it('400 if missing', async () => {
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '11')
                .send({ sessionId:3, role:'mentor' });
            expect(res.status).toBe(400);
        });

        it('saves enneagram answers', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(77);
            db.run.mockImplementation((sql, params, cb) => cb(null));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '12')
                .send(valid);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('500 on error', async () => {
            db.ensureApplicationExists.mockResolvedValue();
            db.getApplicationIdForUser.mockResolvedValue(78);
            db.run.mockImplementation((sql, params, cb) => cb(new Error('err')));
            const res = await request(app)
                .post(url)
                .set('X-Session-User', '13')
                .send(valid);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'err' });
        });
    });

    describe('GET /api/match-mentee', () => {
        const url = '/api/match-mentee';

        it('401 if not auth', async () => {
            const res = await request(app).get(url);
            expect(res.status).toBe(401);
        });

        it('400 if missing sessionId', async () => {
            const res = await request(app)
                .get(url)
                .set('X-Session-User', '14')
                .query({ menteeId: '20' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ success: false, message: 'Missing sessionId' });
        });

        it('formats matches correctly', async () => {
            const raw = [
                { mentor_id: 2, first_name: 'A', last_name: 'B', email: 'ab@x.com', finalScore: 0.5 }
            ];
            matchAlgorithm.mockResolvedValue(raw);
            const res = await request(app)
                .get(url)
                .set('X-Session-User', '15')
                .query({ menteeId:'15', sessionId:'5' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                recommendations: [
                    { mentor_id: 2, name: 'A B', email: 'ab@x.com', finalScore: 0.5 }
                ]
            });
        });

        it('500 on error', async () => {
            matchAlgorithm.mockRejectedValue(new Error('fail'));
            const res = await request(app)
                .get(url)
                .set('X-Session-User', '16')
                .query({ menteeId:'16', sessionId:'6' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'fail' });
        });
    });

    describe('POST /api/mark-submitted', () => {
        const url = '/api/mark-submitted';

        it('401 if not auth', async () => {
            const res = await request(app).post(url).send({ sessionId:1 });
            expect(res.status).toBe(401);
        });

        it('400 if missing sessionId', async () => {
            const res = await request(app)
                .post(url)
                .set('X-Session-User','17')
                .send({});
            expect(res.status).toBe(400);
        });

        it('404 if no application', async () => {
            db.get.mockResolvedValue(null);
            const res = await request(app)
                .post(url)
                .set('X-Session-User','18')
                .send({ sessionId:2 });
            expect(res.status).toBe(404);
        });

        it('marks submitted', async () => {
            db.get.mockResolvedValue({ id: 99 });
            db.run.mockResolvedValue();
            const res = await request(app)
                .post(url)
                .set('X-Session-User','19')
                .send({ sessionId:3 });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('500 on get error', async () => {
            db.get.mockRejectedValue(new Error('err'));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','20')
                .send({ sessionId:4 });
            expect(res.status).toBe(500);
        });

        it('500 on run error', async () => {
            db.get.mockResolvedValue({ id: 100 });
            db.run.mockRejectedValue(new Error('err2'));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','21')
                .send({ sessionId:5 });
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/latest-survey', () => {
        const url = '/api/latest-survey';

        it('returns null data if none', async () => {
            db.getAsync.mockResolvedValue(null);
            const res = await request(app)
                .get(url)
                .set('X-Session-User','22');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, data: null });
        });

        it('returns full survey data', async () => {
            const appRow = { id:10, session_id:3 };
            const prefs = { foo: 'bar' };
            const life = { baz: 'qux' };
            const enne = { quux: 'corge' };
            db.getAsync
                .mockResolvedValueOnce(appRow)
                .mockResolvedValueOnce(prefs)
                .mockResolvedValueOnce(life)
                .mockResolvedValueOnce(enne);
            const res = await request(app)
                .get(url)
                .set('X-Session-User','23');
            expect(res.body).toEqual({
                success: true,
                data: {
                    applicationId: 10,
                    sessionId: 3,
                    preferences: prefs,
                    lifestyle: life,
                    enneagram: enne
                }
            });
        });

        it('500 on error', async () => {
            db.getAsync.mockRejectedValue(new Error('bad'));
            const res = await request(app)
                .get(url)
                .set('X-Session-User','24');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/form-status', () => {
        const url = '/api/form-status';

        it('400 if missing sessionId', async () => {
            const res = await request(app)
                .get(url)
                .set('X-Session-User','25');
            expect(res.status).toBe(400);
        });

        it('false if no applicationId', async () => {
            db.getApplicationIdForUser.mockResolvedValue(null);
            const res = await request(app)
                .get(url)
                .set('X-Session-User','26')
                .query({ sessionId: '7' });
            expect(res.body).toEqual({ success: true, submitted: false });
        });

        it('true if submitted=1', async () => {
            db.getApplicationIdForUser.mockResolvedValue(11);
            db.get.mockImplementation((sql, params, cb) => cb(null, { submitted: 1 }));
            const res = await request(app)
                .get(url)
                .set('X-Session-User','27')
                .query({ sessionId: '8' });
            expect(res.body).toEqual({ success: true, submitted: true });
        });

        it('500 on error', async () => {
            db.getApplicationIdForUser.mockResolvedValue(12);
            db.get.mockImplementation((sql, params, cb) => cb(new Error('err')));
            const res = await request(app)
                .get(url)
                .set('X-Session-User','28')
                .query({ sessionId: '9' });
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/account-save-preferences', () => {
        const url = '/api/account-save-preferences';
        const body = {
            session_role: 'member',
            transplantType: ['heart'],
            transplantYear: 2018,
            goals: ['goalA'],
            meetingPref: 'monthly',
            sportsInterest: ['tennis']
        };

        it('401 if not auth', async () => {
            const res = await request(app).post(url).send(body);
            expect(res.status).toBe(401);
        });

        it('updates existing record', async () => {
            db.get.mockResolvedValue({ id: 5 });
            db.run.mockResolvedValue();
            const res = await request(app)
                .post(url)
                .set('X-Session-User','29')
                .send(body);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('inserts new record', async () => {
            db.get.mockResolvedValue(null);
            db.run.mockResolvedValue();
            const res = await request(app)
                .post(url)
                .set('X-Session-User','30')
                .send(body);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true });
        });

        it('500 on error', async () => {
            db.get.mockResolvedValue(null);
            db.run.mockRejectedValue(new Error('db err'));
            const res = await request(app)
                .post(url)
                .set('X-Session-User','31')
                .send(body);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'db err' });
        });
    });
});
