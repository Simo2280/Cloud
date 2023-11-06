const userModel = require('../models/userModel');
const refreshModel = require('../models/refreshModel');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginController(req, res) {
  try {

    const result = await userModel.find({email: req.headers["email"], role: req.headers["role"] }).exec();

      if (result.length === 0) {
        return res.sendStatus(401);
      }

      const comparePassword = await bcrypt.compare(
        req.headers["password"],
        result[0].password
      );

      if (comparePassword === true) {
        const accessToken = jwt.sign(
          { email: req.headers["email"], role: req.headers.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
          { email: req.headers["email"], role: req.headers.role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        try {
          const existingRefreshToken = await refreshModel.findOne({ email: req.headers["email"] }).exec();

          if (existingRefreshToken) {
            await refreshModel.updateOne({ email: req.headers.email }, { refreshToken: refreshToken });
          } else {
            console.log("a")
            const doc = new refreshModel({ email: req.headers.email, refreshToken: refreshToken });
            await doc.save();
          }
        } catch (error) {
          return res.sendStatus(500);
        }

        const response = {
          accessToken,
        };

        res.cookie("refreshToken", refreshToken, {
          path: "/refresh",
          sameSite: true,
          httpOnly: true,
        });

        res.json(response);
      } else {
        return res.sendStatus(401);
      }
    } catch (error) {
        console.log(error)
      res.sendStatus(400);
    }
}

async function logoutController(req, res) {
    try {

        const email = req.user.email;
        const result = await refreshModel.findOneAndDelete({ email });
  
        if (result) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        console.log(error)
        res.sendStatus(400);
      }
}

async function refreshController(req, res) {
    try {

        const refreshToken = req.cookies.refreshToken;
  
        if (!refreshToken) {
          return res.sendStatus(401);
        }
  
        const existingRefreshToken = await refreshModel.find({ refreshToken: refreshToken }).exec();
  
        if (!existingRefreshToken) {
          return res.sendStatus(403);
        }
  
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.sendStatus(403);
          }
  
          const user = { email: decoded.email, role: decoded.role };
          const newAccessToken = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
  
          res.json({ newAccessToken });
        });
      } catch (error) {
        res.sendStatus(400);
      }
}

module.exports = { loginController, logoutController, refreshController };
