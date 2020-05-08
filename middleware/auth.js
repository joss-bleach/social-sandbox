const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "Unauthorised Request." });
  }

  try {
    const decoded = jwt.verify(token, config.get("secretOrKey"));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Unauthorised Request" });
  }
};
