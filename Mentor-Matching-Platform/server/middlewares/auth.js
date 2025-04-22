// middlewares/auth.js

/**
 * ensureAuthenticated middleware
 * Verifies that the user is logged in before allowing access to protected routes.
 * This example assumes you store user info in req.session.user (session-based auth).
 */
function ensureAuthenticated(req, res, next) {
    // Check if the user is logged in
    if (req.session && req.session.user) {
      // User is logged in, attach user info to the request object
      req.user = req.session.user;
      return next();
    }
  
    // User is not logged in, return 401 Unauthorized
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  module.exports = { ensureAuthenticated };
  