const request = require('supertest');
const {User} = require('./../../models/user');
const {Genre} = require('./../../models/genre');
let server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('./../../app');
        token = new User().generateAuthToken();
    });
    afterEach(async () => {
        await Genre.remove({});
        await server.close();
    });

    let token;

    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    };

    it('should return 401 if not token is provided', async function () {
        token = '';

        const res = await exec();
        expect(res.status).toBe(401);
    });
    it('should return 400 if token is not valid', async function () {
        token = '1234';

        const res = await exec();
        expect(res.status).toBe(400);
    });
    it('should return 200 if token is valid', async function () {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});