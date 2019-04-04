const { MongoMemoryServer } = require('mongodb-memory-server');

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');

const Cuisine = require('../../models/cuisine');

jest.mock('jsonwebtoken');

const route = (params = '') => {
  const path = '/cuisines';
  return `${path}/${params}`;
};

const mapResponseCuisines = cuisines => {
  return cuisines.map(cuisine => ({
    name: cuisine.name,
  }));
};

jwt.verify.mockImplementation(async (token, secret) => {
  if (token === 'SUPER SECRET') return Promise.resolve({ email: 'abc@hotmail.com' });
  throw new Error('invalid token');
});

describe('Cuisines', () => {
  let mongod;
  let db;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const mongodbUri = await mongod.getConnectionString();
    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    db = mongoose.connection;
  });

  beforeEach(async () => {
    await Cuisine.insertMany([{ name: 'Chinese' }, { name: 'Western' }, { name: 'Thai' }, { name: 'Italian' }]);
  });

  afterEach(async () => {
    await Cuisine.collection.deleteMany({});
    // await db.dropCollection('cuisines');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  describe('[GET]', () => {
    test('get all cuisines', async () => {
      const expected = [{ name: 'Chinese' }, { name: 'Western' }, { name: 'Thai' }, { name: 'Italian' }];
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);
      const cuisines = mapResponseCuisines(res.body);
      expect(cuisines).toHaveLength(4);
      expect(cuisines).toEqual(expect.arrayContaining(expected));
    });
    test('get cuisines by valid query', async () => {
      const expected = [{ name: 'Chinese' }, { name: 'Western' }];
      const res = await request(app)
        .get(route())
        .query({ name: 'e' })
        .expect('content-type', /json/)
        .expect(200);

      const cuisines = res.body;
      expect(cuisines).toHaveLength(2);
      expect(cuisines).toContainObject({ name: 'Chinese' }, { name: 'Western' });
    });
    test('return empty array when invalid cuisine name is queried', async () => {
      const res = await request(app)
        .get(route())
        .query({ name: 'asfdf' })
        .expect('content-type', /json/)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
    test('return with 400 bad request when getting cuisines by invalid query key', async () => {
      await request(app)
        .get(route())
        .query({ type: 'hawker' })
        .expect(400);
    });
  });
  describe('[POST]', () => {
    test('should respond with 201 when creating a new cuisine', async () => {
      const cuisine = { name: 'Japanese' };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(cuisine)
        .expect('content-type', /json/)
        .expect(201);
      expect(res.body).toEqual(expect.objectContaining({ name: 'Japanese' }));
    });
    test('should respond with 400 when creating a new cuisine with invalid token', async () => {
      const cuisine = { name: 'Japanese' };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer invalid token')
        .send(cuisine)
        .expect('content-type', /json/)
        .expect(400);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/invalid token/i));
    });
    test('should respond with 400 when creating a new cuisine without name', async () => {
      const cuisine = { name: '' };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(cuisine)
        .expect(400);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/`name` is required/i));
    });
    test('should respond with 400 when creating a new cuisine that already exist', async () => {
      const cuisine = { name: 'Chinese' };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(cuisine)
        .expect(409);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/duplicate key error/i));
    });
  });
  describe('[PUT]', () => {
    test('should respond with 202 for a valid update', async () => {
      const cuisine = await Cuisine.findOne({ name: 'Chinese' });
      const res = await request(app)
        .put(route(cuisine._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ name: 'Korean' })
        .expect('content-type', /json/)
        .expect(202);
      expect(res.body.name).toBe('Korean');
    });
    test('should respond with 404 when updating of objectId that does not exist but of correct format', async () => {
      await request(app)
        .put(route('5c9a1dc854951c967995ee32'))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ isExcludedFromMatch: true })
        .expect('content-type', /json/)
        .expect(404);
    });
    test('should respond with 400 when updating on invalid objectId', async () => {
      await request(app)
        .put(route('invalidId'))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ isExcludedFromMatch: true })
        .expect('content-type', /json/)
        .expect(400);
    });
    test('should respond with 400 when updating with invalid values', async () => {
      const cuisine = await Cuisine.findOne({ name: 'Chinese' });
      const res = await request(app)
        .put(route(cuisine._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ name: '' })
        .expect('content-type', /json/)
        .expect(400);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/`name` is required/i));
    });
  });
  describe('[DELETE]', () => {
    test('should respond with 200 on delete of existing cuisine', async () => {
      const cuisine = await Cuisine.findOne({ name: 'Chinese' });
      await request(app)
        .delete(route(cuisine._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .expect(202);
    });
    test('should respond with 404 on delete of objectId that does not exist but of correct format', async () => {
      await request(app)
        .delete(route('5c9a1dc854951c967995ee35'))
        .set('authorization', 'Bearer SUPER SECRET')
        .expect(404);
    });
    test('should respond with 400 when deleting invalid objectId', async () => {
      await request(app)
        .delete(route('invalidId'))
        .set('authorization', 'Bearer SUPER SECRET')
        .expect(400);
    });
  });
});
