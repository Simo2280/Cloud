exports.users = (app, client, database) => {
    
    const { authenticateToken } = require('../authentication');

    const collection = database.collection('users');

    app.get('/login', async (req, res) => {
        try {
            const bcrypt = require('bcrypt');
            const jwt = require('jsonwebtoken');
    
            const result = await collection.find({ email: req.headers['email'], role:req.headers['role'] }).toArray();
    
            if (result.length === 0) {
                return res.sendStatus(401);
            }
    
            const comparePassword = await bcrypt.compare(req.headers['password'], result[0].password);
    
            const updateUsage = await collection.updateOne(
                { email: req.headers['email'] },
                { $set: { usage: { latestRequestDate: new Date().toLocaleDateString(), numberOfRequests: result[0].usage.numberOfRequests + 1 } } }
            );
    
            if (comparePassword === true) {
                const accessToken = jwt.sign({ email: req.headers['email'], password: req.headers['password'], role: req.headers.role }, "secret", { expiresIn: '1h' });
                const refreshToken = jwt.sign({ email: req.headers['email'], password: req.headers['password'] }, "secret", { expiresIn: '1d' });
    
                try {
                    const existingRefreshToken = await database.collection('refresh').findOne({ email: req.headers.email });
    
                    if (existingRefreshToken) {
                        await database.collection('refresh').updateOne(
                            { email: req.headers.email },
                            { $set: { refreshToken } }
                        );
                    } else {
                        await database.collection('refresh').insertOne({ email: req.headers.email, refreshToken });
                    }
                } catch (error) {
                    return res.sendStatus(500);
                }
    
                const response = {
                    accessToken,
                    refreshToken
                };
    
                res.json(response);
            } else {
                return res.sendStatus(401);
            }
        } catch (error) {
            res.sendStatus(400);
        }
    });
    

    //stampa un determinato user passando accessToken nelle headers e email nella
    app.get('/user', authenticateToken, async (req, res) => {

            try {

                const result = await collection.find({ email: req.query.email }).toArray();

                if ( result.length !== 0 ) {

                    res.send(result);

                } else {

                    res.sendStatus(404);

                }

            } catch (error) {

                res.sendStatus(400);

            }

    });

    //aggiunge un utente alla collezione 'users' passando nel body email, password e role
    app.post('/user', async (req, res) => {

        try {

            const checkUser = await collection.find({email: req.body.email}).toArray();

            if ( checkUser.length === 0 ) {

                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                const myPlaintextPassword = req.body.password;

                const hashedPassword = await bcrypt.hash(myPlaintextPassword, saltRounds);

                const userData = {

                    email: req.body.email,
                    password: hashedPassword,
                    role: req.body.role,
                    usage: {
                        latestRequestDate: new Date().toLocaleDateString(),
                        numberOfRequests: 1
                    }

                };

                if ( userData.email && userData.password && userData.role ) {

                    if ( userData.role !== 'admin' && userData.role !== 'user' ) {

                        userData.role = 'user';

                    }

                    const result = await collection.insertOne({ email: userData.email, password: userData.password, role: userData.role, usage: userData.usage });

                    res.sendStatus(200);

                } else {

                    res.sendStatus(400);

                }

            } else {

                res.sendStatus(404);

            } 

        } catch (error) {

            res.sendStatus(400);

        }

    });

};