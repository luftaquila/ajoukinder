import dotenv from 'dotenv'
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

import util from '../controllers/util.js';

dotenv.config();

let router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

export default router