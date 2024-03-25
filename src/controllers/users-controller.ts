import users from 'db/user';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default class UsersController {
  router: express.Router;
  constructor() {
    this.router = express.Router();
    this.initUsers();
  }

  initUsers() {
    this.router.post('/login', async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;

      const user = users.find((user) => user.email === email);
      if (!user) {
        return res.status(404).send('User not found');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid password');
      }

      const token = jwt.sign({ userId: user.id, userEmail: user.email }, 'your-secret-key', {
        expiresIn: '1h',
      }); //stored as userId
      return res.status(200).json({
        token: token,
      });
    });

    this.router.post('/register', async (req, res) => {
      const email = req.body.email;
      const passwordConfirmation = req.body.passwordConfirmation;
      const password = req.body.password;
      const name = req.body.name;

      if (password !== passwordConfirmation) {
        return res.status(500).send('Passwords do not match');
      }
      if (!password) {
        return res.status(500).send('Password is required');
      }

      const user = users.find((user) => user.email === email);
      if (user) {
        return res.status(500).send('User already exists');
      }
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      const data = {
        id: users.length + 1,
        name: name,
        email: email,
        password: hash,
      };

      users.push(data);

      //TODO: add email confimration

      res.status(200).send({
        message: 'User created',
        data: data,
      });
    });
  }

  assignRoutes() {
    return this.router;
  }
}
