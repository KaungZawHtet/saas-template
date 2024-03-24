import express from 'express';
export default class BooksController {
  private router: express.Router;
  constructor() {
    this.router = express.Router();
    this.initBooks();
  }

  initBooks() {
    this.router.get('/books', (req, res) => {
      res.status(200).send('Books route');
    });
  }

  assignRoutes() {
    return this.router;
  }
}
