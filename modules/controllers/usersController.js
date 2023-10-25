const connectToDatabase = require('../models/database');

async function getUserController(req, res) {
    try {

        const database = await connectToDatabase();
        const collection = database.collection("users");

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
}

async function postUserController(req, res) {
    try {

        const database = await connectToDatabase();
        const collection = database.collection("users");

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
}

async function putUserController(req, res) {
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

}

module.exports = { getUserController, postUserController, putUserController };
