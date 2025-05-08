/**
 * ensureAuthenticated middleware
 * Verifies that the user is logged in before allowing access to protected routes.
 */
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
}

/**
 * ensureAdmin middleware
 * Verifies that the user is logged in and has admin privileges.
 */
function ensureAdmin(req, res, next) {

    console.log("👀 Session check:", req.session?.user);
    if (req.session && req.session.user && req.session.user.account_type === 1) {
        req.user = req.session.user;
        return next();
    }
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
}

module.exports = {
    ensureAuthenticated,
    ensureAdmin
};
