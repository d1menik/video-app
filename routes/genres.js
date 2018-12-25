const {Genre, validateGenre} = require('../models/genre');
const validate = require('./../middleware/validate');
const {isAdmin} = require('./../middleware/admin');
const auth = require('./../middleware/auth');
const validateObjectId = require('./../middleware/validateObjectId');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if(!genre) return res.status(404).send('The genre with the given id was not found.');

    res.send(genre);
});

router.post('/', [auth, validate(validateGenre)], async (req, res) => {
    const genre = new Genre({
        name: req.body.name
    });
    await genre.save();

    res.send(genre);
});

router.put('/:id', [auth, validate(validateGenre)], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    }, {new: true});
    if(!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
});

router.delete('/:id', [auth, isAdmin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
});

module.exports = router;