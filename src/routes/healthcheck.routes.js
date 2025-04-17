import express from'express';
import { healthcheck } from '../controllers/healthcheck.controller.js';

const Router = express.Router; // Extract Router from express


const router = express.Router();

router.route('/').get(healthcheck);

export default router