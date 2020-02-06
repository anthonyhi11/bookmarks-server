const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const bookmarks = require('../store');
const BookmarkService = require('../bookmarkService')

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarkService.getBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks)
      })
      .catch(next);
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
    .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      BookmarkService.getBookmarkById(knexInstance, req.params.id)
        .then(bookmark => {
          if (!bookmark) {
            logger.error(`Bookmark with id ${req.params.id} not ofund`)
            return res.status(404).json({
              error: { message: `Bookmark with id of ${req.params.id} not found`}
            })
          }
          res.json(bookmark);
        })
        .catch(next)
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