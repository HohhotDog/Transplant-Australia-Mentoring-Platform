// tests/index.test.js

// Prevent the real server from listening
jest.mock('../app', () => ({
    listen: jest.fn((port, cb) => cb && cb()),
}));

// Mock seed scripts
jest.mock('../scripts/seedSessions',  () => jest.fn());
jest.mock('../scripts/seedAdmin',     () => jest.fn());
jest.mock('../scripts/seedTestUsers', () => jest.fn());

const seedSessions  = require('../scripts/seedSessions');
const seedAdmin     = require('../scripts/seedAdmin');
const seedTestUsers = require('../scripts/seedTestUsers');
const app           = require('../app');

describe('index.js', () => {
    let logSpy;

    beforeAll(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        // Require index.js after mocks so its top‐level code runs once
        require('../index');
    });

    afterAll(() => {
        logSpy.mockRestore();
    });

    it('calls seedSessions, seedAdmin and seedTestUsers once', () => {
        expect(seedSessions).toHaveBeenCalledTimes(1);
        expect(seedAdmin).toHaveBeenCalledTimes(1);
        expect(seedTestUsers).toHaveBeenCalledTimes(1);
    });

    it('starts server on default port 3001', () => {
        expect(app.listen).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Function)
        );
        expect(logSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Server listening on http:\/\/localhost:\d+/)
        );
    });
});
