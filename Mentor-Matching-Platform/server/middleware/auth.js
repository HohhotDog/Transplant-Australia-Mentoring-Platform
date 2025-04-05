// server/middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }
  
  module.exports = { isAuthenticated };
  