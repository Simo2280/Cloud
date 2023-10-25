exports.routes = (app) => {

    //includo le routes

    const userRoutes = require('./routes/users');
    const authRoutes = require('./routes/auth');

    //inizializzo le routes

    userRoutes.users(app);
    authRoutes.auth(app);

}