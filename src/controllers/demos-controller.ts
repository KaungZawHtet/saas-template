import express from 'express';
import { authenticator } from 'middlewares/auth';
export default class DemosController {
  private router: express.Router;
  constructor() {
    this.router = express.Router();
    this.initDemos();
  }

  initDemos() {
    this.router.get('/demos', authenticator, (req, res) => {
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
