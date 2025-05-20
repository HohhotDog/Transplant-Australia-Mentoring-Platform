// tests/adminRoutes.test.js

// 1. Mock modules before loading the app
jest.mock('../db');
jest.mock('../middlewares/auth', () => ({
    ensureAdmin: (req, res, next) => next(),
    ensureAuthenticated: (req, res, next) => next(),
}));

const db = require('../db');
const request = require('supertest');
const app = require('../app');

describe('Admin API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('GET /api/admin/sessions', () => {
        it('should return aggregated sessions', async () => {
            db.all.mockImplementation((sql, params, cb) => {
                cb(null, [
                    { id: 1, title: 'S1', startDate: '2025-01-01', endDate: '2025-02-01',
                        status: 'active', creator: 'Default Admin',
                        mentorsCount: 2, menteesCount: 3, pendingCount: 1 },
                ]);
            });

            const res = await request(app).get('/api/admin/sessions');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([{
                id: 1,
                title: 'S1',
                timeFrame: '2025-01-01 – 2025-02-01',
                participants: '2 mentors, 3 mentees',
                pendingApplications: 1,
                status: 'active',
                creator: 'Default Admin',
            }]);
        });

        it('should handle db errors', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).get('/api/admin/sessions');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/admin/sessions/:id/applications', () => {
        it('should return applications list', async () => {
            db.all.mockImplementation((sql, params, cb) => {
                expect(params).toEqual(['123']);
                cb(null, [
                    { id: 10, email: 'a@x.com', role: 'mentor', applicationDate: '2025-01-05', status: 'pending' },
                ]);
            });

            const res = await request(app).get('/api/admin/sessions/123/applications');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                { id: 10, email: 'a@x.com', role: 'mentor', applicationDate: '2025-01-05', status: 'pending' },
            ]);
        });

        it('should handle db errors', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('oops')));
            const res = await request(app).get('/api/admin/sessions/1/applications');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/admin/sessions/:sessionId/applications/:id', () => {
        it('should return single application', async () => {
            db.get.mockImplementation((sql, params, cb) => {
                expect(params).toEqual(['5','10']);
                cb(null, { id: 10, userId: 5, email: 'u@x.com', role: 'mentee', applicationDate: '2025-01-10', status: 'approved' });
            });

            const res = await request(app).get('/api/admin/sessions/5/applications/10');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: 10, userId: 5, email: 'u@x.com', role: 'mentee',
                applicationDate: '2025-01-10', status: 'approved'
            });
        });

        it('should return 404 if not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app).get('/api/admin/sessions/5/applications/99');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Application not found' });
        });

        it('should handle errors', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).get('/api/admin/sessions/1/applications/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('PATCH /api/admin/sessions/:sessionId/applications/:id', () => {
        it('should update status when valid', async () => {
            db.run.mockImplementation((sql, params, cb) => cb(null, { changes: 1 }));
            const res = await request(app)
                .patch('/api/admin/sessions/1/applications/2')
                .send({ status: 'approved' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Status updated', status: 'approved' });
        });

        it('should reject invalid status', async () => {
            const res = await request(app)
                .patch('/api/admin/sessions/1/applications/2')
                .send({ status: 'foobar' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid status' });
        });

        

        it('should handle db errors', async () => {
            db.run.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app)
                .patch('/api/admin/sessions/1/applications/2')
                .send({ status: 'approved' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/admin/sessions/:sessionId/participants', () => {
        it('should return mentors and mentees', async () => {
            db.all
                .mockImplementationOnce((sql, params, cb) => cb(null, [
                    { id: 1, email: 'm@x.com', name: 'Mentor One', assigned_mentees: 2, join_date: '2025-01-01' }
                ]))
                .mockImplementationOnce((sql, params, cb) => cb(null, [
                    { id: 2, email: 't@x.com', name: 'Mentee One', matched_date: '2025-01-05', assigned_mentor: 'Mentor One', application_date: '2025-01-02' }
                ]));

            const res = await request(app).get('/api/admin/sessions/7/participants');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                mentors: [{ id: 1, email: 'm@x.com', name: 'Mentor One', assigned_mentees: 2, join_date: '2025-01-01' }],
                mentees: [{ id: 2, email: 't@x.com', name: 'Mentee One', matched_date: '2025-01-05', assigned_mentor: 'Mentor One', application_date: '2025-01-02' }],
            });
        });

        it('should handle mentor query error', async () => {
            db.all.mockImplementation((sql, params, cb) => cb(new Error('mentor fail')));
            const res = await request(app).get('/api/admin/sessions/7/participants');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Failed to fetch mentors' });
        });

        it('should handle mentee query error', async () => {
            db.all
                .mockImplementationOnce((sql, params, cb) => cb(null, []))
                .mockImplementationOnce((sql, params, cb) => cb(new Error('mentee fail')));
            const res = await request(app).get('/api/admin/sessions/7/participants');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Failed to fetch mentees' });
        });
    });

    describe('GET /api/admin/participants/:userId/profile', () => {
        it('should return user profile', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, { email: 'u@x.com', first_name: 'U', last_name: 'X' }));
            const res = await request(app).get('/api/admin/participants/42/profile');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, profile: { email: 'u@x.com', first_name: 'U', last_name: 'X' } });
        });

        it('should 404 if not found', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
            const res = await request(app).get('/api/admin/participants/99/profile');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ success: false, message: 'Profile not found.' });
        });

        it('should handle db errors', async () => {
            db.get.mockImplementation((sql, params, cb) => cb(new Error('fail')));
            const res = await request(app).get('/api/admin/participants/1/profile');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, message: 'Database error' });
        });
    });

    describe('GET /api/admin/participants/:userId/preferences', () => {
        it('should return preferences', async () => {
            db.getAsync = jest.fn().mockResolvedValue({ pref: 'value' });
            const res = await request(app).get('/api/admin/participants/5/preferences');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, preferences: { pref: 'value' } });
        });

        it('should 404 if not found', async () => {
            db.getAsync = jest.fn().mockResolvedValue(undefined);
            const res = await request(app).get('/api/admin/participants/5/preferences');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ success: false, message: 'Preferences not found' });
        });

        it('should handle errors', async () => {
            db.getAsync = jest.fn().mockRejectedValue(new Error('fail'));
            const res = await request(app).get('/api/admin/participants/5/preferences');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'Failed to fetch preferences' });
        });
    });

    describe('GET /api/admin/participants/:userId/match', () => {
        it('should return mentees for a mentor', async () => {
            db.allAsync = jest.fn().mockResolvedValue([{ user_id: 10, name: 'Trainee' }]);
            db.getAsync = jest.fn().mockResolvedValue(null);
            const res = await request(app).get('/api/admin/participants/1/match');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, role: 'mentor', mentees: [{ user_id: 10, name: 'Trainee' }] });
        });

        it('should return mentor for a mentee', async () => {
            db.allAsync = jest.fn().mockResolvedValue([]);
            db.getAsync = jest.fn().mockResolvedValue({ user_id: 2, name: 'MentorName' });
            const res = await request(app).get('/api/admin/participants/2/match');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, role: 'mentee', mentor: { user_id: 2, name: 'MentorName' } });
        });

        it('should 404 if no match', async () => {
            db.allAsync = jest.fn().mockResolvedValue([]);
            db.getAsync = jest.fn().mockResolvedValue(null);
            const res = await request(app).get('/api/admin/participants/3/match');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ success: false, message: 'No match found' });
        });

        it('should handle errors', async () => {
            db.allAsync = jest.fn().mockRejectedValue(new Error('fail'));
            const res = await request(app).get('/api/admin/participants/3/match');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ success: false, error: 'Failed to fetch match' });
        });
    });
});
