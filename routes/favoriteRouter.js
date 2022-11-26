const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { response } = require('../app');
const favoriteRouter = express.Router();

favoriteRouter.route('/favorites')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200)) 
.get(cors.cors, (req, res, next) => {
   Favorite.find({user: req.user._id})
   .populate('user')
   .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if(favorite) {
            req.body.forEach(campsite => {
                if (!favorite.campsites.includes(campsite.id)){
                    favorite.campsites.push(campsite.id)
                }
            })
            favorite.save()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
        } else {
            favorite.create({user: req.user._id, campsites: req.body})
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response)
            })
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOneAndDelete({user: req.user._id})
    res.statusCode = 200;
    if (Favorite) {
        res.setHeader('Content-Type', 'application/json');
        res.json(Favorite);
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete.');
    }
});
favoriteRouter.route('/favorites/:campsiteId')
.options(cors.corsWithOptions, (req, res, next) => res.sendStatus(200))
.get(cors.cors, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites:campsiteId')
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites.campsite.includes(campsiteId)) {
            favorites.campsites.push(req.params.campsiteId)
            favorites.save()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
            res.statusCode = 200;
        } else {
            favorites.create({user: req.user._id, campsites: req.params})
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response)
            })
        } 
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.updateOne({user: req.user._id})
    .then(favorites => {
        if (favorites) {
           if (favorites.campsites.indexOf(req.params.favoriteId) !== -1) {
            favorites.campsites.splice(favorites.campsites.indexOf(req.params.favoriteId), 1)
            .then(favorites => {
                favorites.save()
                .then(response => {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
            })
           }    
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.send('There are no favorites to delete.');
        }
    })
    
})
module.exports = favoriteRouter;