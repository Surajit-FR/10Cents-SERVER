import express, { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller";

const router: Router = express.Router();

router.route('/').get(healthcheck);

export default router