const userModel = require('../models/userModel');

const bcrypt = require("bcrypt");

async function getUserController(req, res) {
    try {

        const result = await userModel.findOne({ email: req.query.email }).select('-password');
  
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
        const checkUser =  await userModel.findOne({ email: req.body.email });

        if (checkUser == null) {
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
        if(req.user.role == "admin") {

            const updateData = {};

            if (req.body.email) {
              updateData.email = req.body.email;
            }
      
            if (req.body.password) {
              const saltRounds = 10;
              const myPlaintextPassword = req.body.password;
              const hashedPassword = await bcrypt.hash(myPlaintextPassword, saltRounds);
              updateData.password = hashedPassword;
            }
      
            if (req.body.role) {
              updateData.role = req.body.role;
            }
      
            if (req.body.name) {
              updateData.name = req.body.name;
            }
      
            if (req.body.surname) {
              updateData.surname = req.body.surname;
            }
      
            await userModel.updateOne({ email: req.user.email }, updateData);
            res.sendStatus(200);

        } else {

            if (req.body.password) {

                const saltRounds = 10;
                const myPlaintextPassword = req.body.password;

                const hashedPassword = await bcrypt.hash(
                myPlaintextPassword,
                saltRounds
                );
        
                    await userModel.updateOne({ email: req.user.email },
                        { password: hashedPassword });
        
                    res.sendStatus(200);
                } else {
                    res.sendStatus(400);
                }

        }

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

}

module.exports = { getUserController, postUserController, putUserController };
