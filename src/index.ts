//Importing project dependancies that we installed earlier
import * as dotenv from 'dotenv';
import express from 'express';
import DemosController from './controllers/demos-controller';
import UsersController from 'controllers/users-controller';

class Application {
  app: express.Express;
  demosController: DemosController;
  usersController: UsersController;

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
    this.demosController = new DemosController();
    this.usersController = new UsersController();
    this.app.use('/', this.demosController.assignRoutes());
    this.app.use('/', this.usersController.assignRoutes());
  }

  start() {
    this.app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  }
}

const app = new Application();
app.start();
