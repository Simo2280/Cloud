exports.books = (app) => {

    const { authenticateToken } = require("../authentication");
  
    const bookController = require('../controllers/bookController');
  
    app.get("/books", authenticateToken, bookController.getBooksController);

    app.get("/book", authenticateToken, bookController.getBookController);
  
    app.post("/book", authenticateToken, bookController.postBookController);

    app.put("/book", authenticateToken, bookController.putBookController);

    app.delete("/book", authenticateToken, bookController.deleteBookController);

}