exports.routes = (app, client, database) => {

    //includo le routes

    const userRoutes = require('./routes/users');

    //inizializzo le routes

    userRoutes.users(app, client, database);

}