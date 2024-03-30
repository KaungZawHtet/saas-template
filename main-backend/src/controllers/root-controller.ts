import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { confirmEmail } from 'services/user-service';
import crypto from 'crypto';
import UserRepository from 'repositories/user-repository';
import { User } from 'entities/user-entity';

export default class RootController {
    private router: express.Router;
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private apiIndex = async (req, res) => {
        try {

            return res.status(200).send('Welcome to the API');
        } catch (error) {
            return res.status(500).send('An error occurred');
        }
    };


    setupRoutes() {
        this.router.get('/', this.apiIndex);


    }

    assignRoutes() {
        return this.router;
    }
}
