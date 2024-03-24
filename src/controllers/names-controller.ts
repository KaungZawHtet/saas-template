import express from 'express';
export default class NamesController {
  router: express.Router;
  constructor() {
    this.router = express.Router();
    this.initNames();
  }

  initNames() {
    this.router.get('/names', (req, res) => {
      res.status(200).send('Names route');
    });
  }

  assignRoutes() {
    return this.router;
  }
}
