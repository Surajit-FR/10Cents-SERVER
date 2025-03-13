const express = require('express');
const { healthcheck } = require('../controllers/healthcheck.controller');

const Router = express.Router; // Extract Router from express


const router = express.Router();

router.route('/').get(healthcheck);

module.exports =  router 