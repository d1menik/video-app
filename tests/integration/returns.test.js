const {Rental} = require('./../../models/rental');
const {User} = require('./../../models/user');
const {Movie} = require('./../../models/movie');
const mongoose = require('mongoose');
const request = require('supertest');
const moment  = require('moment');

describe('/api/returns', () => {
    let server;
    let rental;
    let token;
    let customerId;
    let movieId;
    let movie;

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({customerId, movieId});
    };

    beforeEach(async () => {
        server = require('./../../app');

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: {name: '12345'},
            numberInStock: 10
        });

        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '123',
                dailyRentalRate: 2
            }
        });

        await rental.save();
    });
    afterEach(async () => {
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });
    it('should return 401 if client is not logged in', async function () {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });
    it('should return 400 if customerId is not provided', async function () {
        customerId = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });
    it('should return 400 if movieId is not provided', async function () {
        movieId = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for this customer/movie', async function () {
        await Rental.remove();
        const res = await exec();

        expect(res.status).toBe(404);
    });
    it('should return 400 if rental already processed', async function () {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });
    it('should return 200 if we have a valid request',async function () {
        const res = await exec();

        expect(res.status).toBe(200);
    });
    it('should return date if input is valid',async function () {
        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });
    it('should set the rental fee',async function () {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();
        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });
    it('should increase the stock by one',async function () {
        await exec();

        const movieInDB = await Movie.findById(movieId);
        expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
    });
    it('should return the rental',async function () {
        const res = await exec();

        // expect(res.body).toHaveProperty('dateOut');
        // expect(res.body).toHaveProperty('dateReturned');
        // expect(res.body).toHaveProperty('rentalFee');
        // expect(res.body).toHaveProperty('customer');
        // expect(res.body).toHaveProperty('movie');

        expect(Object.keys(res.body))
            .toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
    });
});