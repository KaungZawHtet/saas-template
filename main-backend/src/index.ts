//Importing project dependancies that we installed earlier
import * as dotenv from 'dotenv';
import express from 'express';
import DemosController from './controllers/demos-controller';
import UsersController from 'controllers/users-controller';
import 'reflect-metadata';
import { AppDataSource } from 'data-source';
import RootController from 'controllers/root-controller';

class Application {
  app: express.Express;
  demosController: DemosController;
  usersController: UsersController;
  rootController: RootController;

  constructor() {
    this.init();

    this.setupControllers();
  }

  init() {
    dotenv.config();
    this.app = express();
    this.app.use(express.json());
  }

  setupControllers() {
    this.demosController = new DemosController();
    this.usersController = new UsersController();
    this.rootController = new RootController();
    this.app.use('/', this.demosController.assignRoutes());
    this.app.use('/', this.usersController.assignRoutes());
    this.app.use('/', this.rootController.assignRoutes());
  }

  start() {
    AppDataSource.initialize()
      .then(() => {
        this.app.listen(process.env.PORT, () => {
          console.log('Server is running on port 3000');
        });
      })
      .catch((error) => console.log(error));
  }
}

const app = new Application();
app.start();
