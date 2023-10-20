exports.users = (app, client, database) => {
  const jwt = require("jsonwebtoken");

  const { authenticateToken, expiredToken } = require("../authentication");

  const collection = database.collection("users");

  //risponde con accessToken e refreshToken passando email, password e role nelle headers
  app.get("/login", async (req, res) => {
    try {
      const bcrypt = require("bcrypt");
      const jwt = require("jsonwebtoken");

      const result = await collection
        .find({ email: req.headers["email"], role: req.headers["role"] })
        .toArray();

      if (result.length === 0) {
        return res.sendStatus(401);
      }

      const comparePassword = await bcrypt.compare(
        req.headers["password"],
        result[0].password
      );

      const updateUsage = await collection.updateOne(
        { email: req.headers["email"] },
        {
          $set: {
            usage: {
              latestRequestDate: new Date().toLocaleDateString(),
              numberOfRequests: result[0].usage.numberOfRequests + 1,
            },
          },
        }
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
          const existingRefreshToken = await database
            .collection("refresh")
            .findOne({ email: req.headers.email });

          if (existingRefreshToken) {
            await database
              .collection("refresh")
              .updateOne(
                { email: req.headers.email },
                { $set: { refreshToken } }
              );
          } else {
            await database
              .collection("refresh")
              .insertOne({ email: req.headers.email, refreshToken });
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
      res.sendStatus(400);
    }
  });

  //stampa un determinato user passando accessToken nelle headers e email nella query
  app.get("/user", authenticateToken, async (req, res) => {
    try {
      const result = await collection
        .find({ email: req.query.email })
        .toArray();

      if (result.length !== 0) {
        res.send(result);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      res.sendStatus(400);
    }
  });

  //(solo admin) aggiunge un utente alla collezione 'users' passando accessToken nelle headers, nel body email, password, role, name, surname
  app.post("/user", authenticateToken, async (req, res) => {
    try {
      if (req.user.role == "admin") {
        const checkUser = await collection
          .find({ email: req.body.email })
          .toArray();

        if (checkUser.length === 0) {
          const bcrypt = require("bcrypt");
          const saltRounds = 10;
          const myPlaintextPassword = req.body.password;

          const hashedPassword = await bcrypt.hash(
            myPlaintextPassword,
            saltRounds
          );

          const userData = {
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
            name: req.body.name,
            surname: req.body.surname,
            usage: {
              latestRequestDate: new Date().toLocaleDateString(),
              numberOfRequests: 1,
            },
          };

          if (userData.email && userData.password && userData.role) {
            if (userData.role !== "admin" && userData.role !== "user") {
              userData.role = "user";
            }

            const result = await collection.insertOne({
              email: userData.email,
              password: userData.password,
              role: userData.role,
              name: userData.name,
              surname: userData.surname,
              usage: userData.usage,
            });

            res.sendStatus(200);
          } else {
            res.sendStatus(400);
          }
        } else {
          res.sendStatus(404);
        }
      } else {
        res.sendStatus(401);
      }
    } catch (error) {
      res.sendStatus(400);
    }
  });

  //modifica email dell'utente passando nelle headers accessToken e nel body name e surname
  app.put("/user", authenticateToken, async (req, res) => {
    try {
      if (req.body.name && req.body.surname) {
        const checkUser = await collection
          .find({ email: req.user.email })
          .toArray();

        if (checkUser.length != 0) {
          const result = await collection.updateOne(
            { email: req.user.email },
            { $set: { name: req.body.name, surname: req.body.surname } }
          );

          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  });

  //invalida un determinato refreshToken passando accessToken nelle headers
  app.get("/logout", authenticateToken, async (req, res) => {
    try {
      const result = await database
        .collection("refresh")
        .deleteOne({ email: req.user.email });

      if (result.deletedCount === 1) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      res.sendStatus(400);
    }
  });

  //crea nuovo access token passando accessToken nelle headers
  app.get("/refresh", expiredToken, async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.sendStatus(401);
      }

      const existingRefreshToken = await database
        .collection("refresh")
        .findOne({ refreshToken: refreshToken });

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
  });
};
