export function fetchMySessions() {
    return new Promise(resolve =>
      setTimeout(() => resolve(require('../mocks/my-sessions.json')), 300)
    );
  }
  