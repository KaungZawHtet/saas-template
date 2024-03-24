//Importing project dependancies that we installed earlier
import * as dotenv from 'dotenv';
import express from 'express';
import BooksController from './controllers/books-controller';
import NamesController from 'controllers/names-controller';

class Application {
  app: express.Express;
  booksController: BooksController;
  namesController: NamesController;

  constructor() {
    this.init();
    this.initDb();
    this.setupControllers();
  }

  init() {
    dotenv.config();
    this.app = express();
    this.app.use(express.json());
  }

  initDb() {}

  setupControllers() {
    this.booksController = new BooksController();
    this.namesController = new NamesController();
    this.app.use('/', this.booksController.assignRoutes());
    this.app.use('/', this.namesController.assignRoutes());
  }

  start() {
    this.app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  }
}

const app = new Application();
app.start();
