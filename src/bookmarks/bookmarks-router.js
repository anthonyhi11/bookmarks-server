const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const bookmarks = require('../store');

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
      .status(200)
      .json(bookmarks);
  })
  .post((req, res) => {
    const {  title, url, rating, desc=' ' } = req.body;
    let id = uuid();
    if (!title) {
      logger.error('Title was not entered');
      return res
        .status(401)
        .send('Please enter a title')
    }
    if (!url) {
      logger.error('URL was not entered');
      return res
        .status(401)
        .send('Please enter a URL')
    }
    if (!rating) {
      logger.error('Rating was not entered');
      return res
        .status(401)
        .send('Please enter a Rating')
    }
    let newBookmark = {
      id,
      title,
      url,
      rating,
      desc
    }
    bookmarks.push(newBookmark);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(newBookmark)
  })

  bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
      const { id } = req.params;
      const bookmark = bookmarks.find(bookmark => bookmark.id == id);
      if (!bookmark) {
        logger.error(`Bookmark with id of ${id} not found`)
        return res
          .status(404)
          .send('Bookmark not found')
      }
      res.json(bookmark);
    })
    .delete((req, res) => {
      const { id } = req.params;
      let bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id)
      if (bookmarkIndex === -1) {
        logger.error(`Bookmark with id of ${id} doesn't exist`)
        res
          .status(404)
          .send('Not Found')
      }
      bookmarks.splice(bookmarkIndex, 1)
      logger.info(`Bookmark with id of ${id} was deleted`)
      return res
        .status(204)
        .end();
    })

  module.exports = bookmarksRouter