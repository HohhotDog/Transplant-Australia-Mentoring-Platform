// tests/app.test.js

// Stub all mounted routers before loading app.js
jest.mock('../routes/auth',       () => require('express').Router());
jest.mock('../routes/profile',    () => require('express').Router());
jest.mock('../routes/security',   () => require('express').Router());
jest.mock('../routes/survey',     () => require('express').Router());
jest.mock('../routes/match',      () => require('express').Router());
jest.mock('../routes/sessions',   () => require('express').Router());
jest.mock('../routes/avatar',     () => require('express').Router());
jest.mock('../routes/comments',   () => require('express').Router());
jest.mock('../routes/mentors',    () => require('express').Router());
jest.mock('../routes/matching-pairs', () => require('express').Router());
jest.mock('../routes/admin',      () => require('express').Router());

const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('app.js', () => {
    it('should respond 200 on GET / with welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Transplant Australia backend server!' });
    });

    // Note: /api/questions is protected and questions array isn't defined in app.js,
    // so we only test that it returns 401 when unauthenticated.
    it('should protect GET /api/questions and return 401 if no session', async () => {
        const res = await request(app).get('/api/questions');
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ success: false, message: 'Unauthorized' });
    });
});
