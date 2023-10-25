const userModel = require('../models/userModel');
const refreshModel = require('../models/refreshModel');

async function getUserController(req, res) {
    try {

        const result = await userModel.findOne({ email: req.query.email })

        console.log(result)
  
        if (result.length !== 0) {
          res.send(result);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        console.log(error)
        res.sendStatus(400);
      }
}

async function postUserController(req, res) {
    try {

        if (req.user.role == "admin") {
        const checkUser =  await userModel.findOne({ email: req.query.email });

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
            };

            if (userData.email && userData.password && userData.role) {
            if (userData.role !== "admin" && userData.role !== "user") {
                userData.role = "user";
            }

            const doc = new userModel({ 
                email: userData.email,
                password: userData.password,
                role: userData.role,
                name: userData.name,
                surname: userData.surname });
            await doc.save();

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
        console.log(error)
        res.sendStatus(400);
    }
}

async function putUserController(req, res) {
    try {
        if (req.body.name && req.body.surname) {
        const checkUser = await userModel.findOne(req.query.email);

        if (checkUser.length != 0) {
            await refreshModel.updateOne({ email: req.user.email },
                { name: req.body.name, surname: req.body.surname });

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
