const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, "secret", (err, user) => {
    if (err) {
        console.log(err)
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};