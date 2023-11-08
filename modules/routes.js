exports.routes = (app) => {

    //includo le routes

    const userRoutes = require('./routes/users');
    const authRoutes = require('./routes/auth');
    const bookRoutes = require('./routes/books');

    //inizializzo le routes

    userRoutes.users(app);
    authRoutes.auth(app);
    bookRoutes.books(app);

}