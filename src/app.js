require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger.js');
const bookmarksRouter = require('./bookmarks/bookmarks-router')

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

  app.use(morgan(morganOption));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  

  app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
      response = { error: { message: 'Server Error' } }
    } else {
      console.error(error)
      response = { message: error.message, error }
    }
    res.status(500).json(response)
  })

  app.use(function validateBearerToken(req, res, next) {
    const apiKey = process.env.API_TOKEN
    const authToken = req.get('Authorization');
    if (!authToken || authToken.split(' ')[1] !== apiKey) {
      logger.error(`Unauthorized request to path ${req.path}`)
      return res
        .status(401)
        .json({error: 'Unauthorized request'})
    }
    next();
  })

  app.get('/', (req, res) => {
    res.send('A GET request')
  })
  app.use(bookmarksRouter)

  module.exports = app;