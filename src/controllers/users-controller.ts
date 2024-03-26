import users from 'db/user';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
export default class UsersController {
  router: express.Router;
  CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
  CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.CLIENT_ID}&redirect_uri=${this.REDIRECT_URI}&response_type=code&scope=profile email`;
  constructor() {
    this.router = express.Router();
    this.initUsers();
  }

  initUsers() {
    this.router.get('/google/auth', async (req, res) => {
      res.redirect(this.url);
    });

    this.router.get('/google/auth-callback', async (req, res) => {
      const { code } = req.query;
      // Exchange authorization code for access token
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code,
        redirect_uri: this.REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token, id_token } = data;

      // Use access_token or id_token to fetch user profile
      const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      let user = users.find((user) => user.email === profile.email);
      if (!user) {
        user = {
          id: users.length + 1,
          name: profile.name as string,
          email: profile.email as string,
          password: '',
        };
        users.push(user);
      }
      const token = jwt.sign({ userId: user.id, userEmail: user.email }, 'your-secret-key', {
        expiresIn: '1h',
      }); //stored as userId

      // Code to handle user authentication and retrieval using the profile data

      res.status(200).send({
        data: profile,
        token: token,
      });
    });

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
