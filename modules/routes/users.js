exports.users = (app) => {

  const { authenticateToken } = require("../authentication");

  const usersController = require('../controllers/usersController');

  //stampa un determinato user passando accessToken nelle headers e email nella query
  app.get("/user", authenticateToken, usersController.getUserController);

  //(solo admin) aggiunge un utente alla collezione 'users' passando accessToken nelle headers, nel body email, password, role, name, surname
  app.post("/user", authenticateToken, usersController.postUserController);

  //modifica nome e cognome dell'utente specificato in query passando nelle headers accessToken e nel body name e surname
  app.put("/user", authenticateToken, usersController.putUserController);

};
