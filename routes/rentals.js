const auth = require('./../middleware/auth');
const mongoose = require('mongoose');
const {Rental, validateRental} = require('./../models/rental');
const validate = require('./../middleware/validate');
const {Movie} = require('./../models/movie');
const {Customer} = require('./../models/customer');
const {isAdmin} = require('./../middleware/admin');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');

    res.send(rentals);
});

router.post('/', [auth, validate(validateRental)], async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid Customer');

    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid Movie');

    if(movie.numberInStock === 0) return res.status(400).send('Movie is not available');

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        }
    });
    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', {_id: movie._id}, {
                $inc: {numberInStock: -1}
            })
            .run();

        res.send(rental);
    } catch (e) {
        res.status(500).send('Something failed.');
    }

});

module.exports = router;