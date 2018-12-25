const auth = require('./../middleware/auth');
const {Movie, validateMovie}= require('../models/movie');
const {Genre} = require('../models/genre');
const {isAdmin} = require('./../middleware/admin');
const validate = require('./../middleware/validate');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name');

    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if(!movie) return res.status(404).send('The movie with the given id was not found.');

    res.send(movie);
});

router.post('/', [auth, isAdmin, validate(validateMovie)], async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send('Invalid genre.');

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    await movie.save();

    res.send(movie);
});

router.put('/:id', [auth, isAdmin, validate(validateMovie)], async (req, res) => {
    let movie = await Movie.findById(req.params.id);
    if(!movie) return res.status(404).send('The movie with the given ID was not found.');

    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send('The genre with the given ID was not found.');

    movie = await Movie.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, {new: true});

    if(!movie) return res.status(404).send('The genre with the given ID was not found.');

    res.send(movie);
});

router.delete('/:id', [auth, isAdmin], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if(!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

module.exports = router;