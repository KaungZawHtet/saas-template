import express from 'express';
import { authenticator } from 'middlewares/auth';
export default class BooksController {
  private router: express.Router;
  constructor() {
    this.router = express.Router();
    this.initBooks();
  }

  initBooks() {
    this.router.get('/books', authenticator, (req, res) => {
      res.status(200).send({
        message: 'Books route',
        email: req.userEmail,
      });
    });
  }

  assignRoutes() {
    return this.router;
  }
}
