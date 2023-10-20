const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

exports.expiredToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        next();
      } else {
        res.send(401);
      }
    } else {
      res.send("accessToken ancora valido.");
    }
  });
};
