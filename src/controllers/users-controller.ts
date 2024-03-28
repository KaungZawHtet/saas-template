import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { confirmEmail } from 'services/user-service';
import crypto from 'crypto';
import UserRepository from 'repositories/user-repository';
import { User } from 'entities/user-entity';

export default class UsersController {
  private router: express.Router;
  private CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
  private CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  private REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  private url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.CLIENT_ID}&redirect_uri=${this.REDIRECT_URI}&response_type=code&scope=profile email`;
  private userRepository: UserRepository;
  constructor() {
    this.router = express.Router();
    this.initUsers();
    this.userRepository = new UserRepository();
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private apiLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const rememberMe = req.body.rememberMe;

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).send('User not found');
      }
      if (user.emailConfirmed === false) {
        return res.status(401).send('Email not confirmed');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid password');
      }

      const token = jwt.sign({ userId: user.id, userEmail: user.email }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? '7d' : '1h',
      }); //stored as userId
      return res.status(200).json({
        token: token,
      });
    } catch (error) {
      return res.status(500).send('An error occurred');
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private apiRegister = async (req, res) => {
    try {
      const { email, passwordConfirmation, password, firstName, lastName } = req.body;

      if (password !== passwordConfirmation) {
        return res.status(500).send('Passwords do not match');
      }
      if (!password) {
        return res.status(500).send('Password is required');
      }

      const user = await this.userRepository.findByEmail(email);
      if (user) {
        return res.status(500).send('User already exists');
      }
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      const confirmationToken = crypto.randomBytes(20).toString('hex');

      const insertableUser: User = new User();
      insertableUser.firstName = firstName;
      insertableUser.lastName = lastName;
      insertableUser.email = email;
      insertableUser.password = hash;
      insertableUser.emailToken = confirmationToken;
      insertableUser.emailConfirmed = false;

      const result = this.userRepository.save(insertableUser);

      confirmEmail(email, confirmationToken);

      res.status(200).send({
        message: 'User created',
        data: result,
      });
    } catch (error) {
      return res.status(500).send('An error occurred');
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private apiGoogleAuth = async (req, res) => {
    try {
      res.redirect(this.url);
    } catch (error) {
      res.status(500).send('An error occurred');
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private apiGoogleAuthCallback = async (req, res) => {
    try {
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

      const user = await this.userRepository.findByEmail(profile.email as string);
      if (!user) {
        const insertableUser: User = new User();

        insertableUser.firstName = profile.firstName;
        insertableUser.lastName = profile.lastName;
        insertableUser.email = profile.email;
        insertableUser.password = '';
        insertableUser.emailToken = '';
        insertableUser.emailConfirmed = true;

        await insertableUser.save();
      }

      const token = jwt.sign({ userId: user.id, userEmail: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      }); //stored as userId

      res.status(200).send({
        data: profile,
        token: token,
      });
    } catch (error) {
      res.status(500).send('An error occurred');
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private apiEmailConfirmation = async (req, res) => {
    try {
      const token = req.query.token as string;
      const user = await this.userRepository.findByEmailToken(token);
      if (!user) {
        return res.status(404).send('Invalid confirmation token');
      }

      user.emailConfirmed = true;
      await user.save();
      res.send('Email confirmed');
    } catch (error) {
      res.status(500).send('An error occurred');
    }
  };

  initUsers() {
    this.router.get('/google/auth', this.apiGoogleAuth);

    this.router.get('/google/auth-callback', this.apiGoogleAuthCallback);

    this.router.post('/login', this.apiLogin);

    this.router.post('/register', this.apiRegister);

    this.router.get('/email-confirm', this.apiEmailConfirmation);
  }

  assignRoutes() {
    return this.router;
  }
}
