const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.user._id)
      .populate('user', 'dishes')
      .then((favorites) => {
        if (favorites != null) {
          res.StatusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        } else {
          err = new Error('There are no favorites');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.user._id)
      .then((favorites) => {
        if (favorites != null) {
          favorites.dishes.push(req.body);
          favorites.save()
            .then((favorites) => {
              Favorites.findById(favorites.user._id)
                .populate('user', 'dishes')
                .then((favorites) => {
                  res.StatusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorites);
                })
            }, (err) => next(err));
        } else {
          err = new Error('Favorite ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })


  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.params.dishId)
      .then((favorites) => {
        if (favorites != null) {
          for (var i = (favorites.dishes.length - 1); i >= 0; i--) {
            favorites.dishes.id(favorites.dishes[i]._id).remove();
          }
          favorites.save()
            .then((favorites) => {
              res.StatusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, (err) => next(err));
        } else {
          err = new Error('Favorites ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });


favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Favorites.findById(req.params.dishId)
      .populate('user', 'dishes')
      .then((favorite) => {
        if (favorite != null) {
          res.StatusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite.dishes);
        } else {
          err = new Error('Favorite ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }

      }, (err) => next(err))
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.params.dishId)
      .then((favorite) => {
        if (favorite != null) {
          for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
            if (favorite.dishes._id.equals(req.params.dishId)) {
              console.log('No duplicates!');
            } else {
              favorite.dishes.push(req.body);
            }
          }
          favorite.save()
          .then((favorite) => {
            Favorites.findById(favorite.user._id)
              .populate('user, dishes')
              .then((favorite) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
          }, (err) => next(err));
        } else {
          err = new Error('Favorite ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.params.dishId)
      .then((favorite) => {
        if (favorite != null) {
          for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
            favorite.dishes.id(favorite.dishes[i]._id).remove();
          }
          favorite.save()
            .then((favorite) => {
              res.StatusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, (err) => next(err));
        } else {
          err = new Error('Favorite ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
