exports.auth = (app) => {

    const jwt = require("jsonwebtoken");
  
    const { authenticateToken, expiredToken } = require("../authentication");
    const authController = require("../controllers/authController");
  
    //risponde con accessToken e refreshToken passando email, password e role nelle headers
    app.get("/login", authController.loginController);
  
    //invalida un determinato refreshToken passando accessToken nelle headers
    app.get("/logout", authenticateToken, authController.logoutController);
  
    //crea nuovo access token passando accessToken nelle headers
    app.get("/refresh", expiredToken, authController.refreshController)
      
  };
  