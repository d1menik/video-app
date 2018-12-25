const request = require('supertest');
const {Genre} = require('./../../models/genre');
const {User} = require('./../../models/user');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('./../../app');
    });
    afterEach(async () => {
        await Genre.remove({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async function () {
            await Genre.collection.insertMany([
                {name: 'genre1'},
                {name: 'genre2'}
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return genre with given id', async function () {
            const genre = new Genre({name: 'genre3'});
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name)
        });
        it('should return 404 if invalid id is passed', async function () {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(404);
        });
        it('should return 404 if no genre with given id exist', async function () {
            const _id = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/${_id}`);
            expect(res.status).toBe(404);
        });
    });
    describe('POST /', () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name});
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1'
        });

        it('should return 401 if client is not logged in', async function () {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 400 if genre is less than 3 characters', async function () {
            name = '12';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if genre is more than 50 characters', async function () {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async function () {
            const res = await exec();

            const genre = await Genre.findOne({name: 'genre1'});
            expect(genre).not.toBeNull();
            expect(res.status).toBe(200);
        });
        it('should return the genre if it is valid', async function () {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
            expect(res.status).toBe(200);
        });

    });
    describe('PUT /', () => {
        let token;

        beforeEach(() => {
            token = new User().generateAuthToken();
        });

        it('should return 400 is body of request is not valid', async function () {
            let genre = new Genre({name: "genre1"});
            genre = await genre.save();

            const res = await request(server)
                .put(`/api/genres/${genre._id}`)
                .set('x-auth-token', token)
                .send({name: '12'});
            expect(res.status).toBe(400);
        });
        it('should return 404 if genre with given id is not found', async function () {
            const _id = mongoose.Types.ObjectId();

            const res = await request(server)
                .put(`/api/genres/${_id}`)
                .set('x-auth-token', token)
                .send({name: 'genre3'});

            expect(res.status).toBe(404);
        });
        it('should return modified genre if it is valid',async function () {
            let genre = new Genre({name: "genre1"});
            genre = await genre.save();

            const res = await request(server)
                .put(`/api/genres/${genre._id}`)
                .set('x-auth-token', token)
                .send({name: 'genre3'});
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name','genre3');
        });
    });
    describe('DELETE /', () => {
        let token;

        beforeEach(() => {
            token = new User({ isAdmin: true }).generateAuthToken();
        });

        it('should return 404 if genre with given id is not found', async function () {
            const _id = mongoose.Types.ObjectId();

            const res = await request(server)
                .delete(`/api/genres/${_id}`)
                .set('x-auth-token', token);

            expect(res.status).toBe(404);
        });
        it('should return deleted genre if it is valid',async function () {
            let genre = new Genre({name: "genre1"});
            genre = await genre.save();

            const res = await request(server)
                .delete(`/api/genres/${genre._id}`)
                .set('x-auth-token', token);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name','genre1');
        });
        it('should delete the genre if input is valid', async () => {
            let genre = new Genre({name: "genre1"});
            genre = await genre.save();

            await request(server)
                .delete(`/api/genres/${genre._id}`)
                .set('x-auth-token', token);

            const genreInDb = await Genre.findById(genre._id);
            expect(genreInDb).toBeNull();
        });
    })
});