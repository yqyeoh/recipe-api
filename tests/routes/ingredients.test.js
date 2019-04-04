const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const Ingredient = require('../../models/ingredient');

jest.mock('jsonwebtoken');

const route = (params = '') => {
  const path = '/ingredients';
  return `${path}/${params}`;
};

jwt.verify.mockImplementation(async (token, secret) => {
  if (token === 'SUPER SECRET') return Promise.resolve({ email: 'abc@hotmail.com' });
  throw new Error('invalid token');
});

describe('Ingredients', () => {
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
    await Ingredient.insertMany([
      { name: 'coconut', isExcludedFromMatch: false },
      { name: 'chicken', isExcludedFromMatch: false },
      { name: 'chicken breast', isExcludedFromMatch: false },
      { name: 'salt', isExcludedFromMatch: true },
    ]);
  });

  afterEach(async () => {
    await Ingredient.collection.deleteMany({});
    // await db.dropCollection('ingredients');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  describe('[GET]', () => {
    test('returns all ingredients', async () => {
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      expect(ingredients).toHaveLength(4);
      expect(ingredients).toContainObject(
        { name: 'coconut', isExcludedFromMatch: false },
        { name: 'chicken', isExcludedFromMatch: false },
        { name: 'chicken breast', isExcludedFromMatch: false },
        { name: 'salt', isExcludedFromMatch: true }
      );
    });
    test('get ingredients by valid query', async () => {
      const res = await request(app)
        .get(route())
        .query({ name: 'chicken' })
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      expect(ingredients).toHaveLength(2);
      expect(ingredients).toContainObject(
        { name: 'chicken', isExcludedFromMatch: false },
        { name: 'chicken breast', isExcludedFromMatch: false }
      );
    });
    test('return empty array when invalid ingredient name is queried', async () => {
      const res = await request(app)
        .get(route())
        .query({ name: 'oil' })
        .expect('content-type', /json/)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
    test('return with 400 bad request when getting ingredients by invalid query key', async () => {
      await request(app)
        .get(route())
        .query({ type: 'spice' })
        .expect(400);
    });
  });

  describe('[POST]', () => {
    test('should respond with 201 when creating new ingredient', async () => {
      const newIngredient = { name: 'beef', isExcludedFromMatch: false };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(newIngredient)
        .expect('content-type', /json/)
        .expect(201);
      const ingredient = res.body;
      expect(ingredient.name).toEqual('beef');
      expect(ingredient.isExcludedFromMatch).toEqual(false);
    });

    test('should respond with 400 when creating new ingredient with invalid token', async () => {
      const newIngredient = { name: 'beef', isExcludedFromMatch: false };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer invalid token')
        .send(newIngredient)
        .expect('content-type', /json/)
        .expect(400);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/invalid token/i));
    });

    test('should respond with 400 when creating ingredient that already exist', async () => {
      const ingredient = { name: 'chicken', isExcludedFromMatch: false };
      const res = await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(ingredient)
        .expect(409);
      expect(JSON.parse(res.error.text).message).toEqual(expect.stringMatching(/duplicate key error/i));
    });
    test('should respond with 400 when creating ingredient with missing required property', async () => {
      const ingredient = { name: 'lamb' };
      await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(ingredient)
        .expect(400);
    });
    test('should respond with 400 when creating new ingredient with invalid value', async () => {
      const newIngredient = { name: '', isExcludedFromMatch: false };
      await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(newIngredient)
        .expect('content-type', /json/)
        .expect(400);

      const newIngredient2 = { name: 'pepper', isExcludedFromMatch: 'booo' };
      await request(app)
        .post(route())
        .set('authorization', 'Bearer SUPER SECRET')
        .send(newIngredient2)
        .expect('content-type', /json/)
        .expect(400);
    });
  });

  describe('[PUT]', () => {
    test('should respond with 202 for a valid update', async () => {
      const ingredient = await Ingredient.findOne({ name: 'coconut' });
      const res = await request(app)
        .put(route(ingredient._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ name: 'prawn' })
        .send({ isExcludedFromMatch: true })
        .expect('content-type', /json/)
        .expect(202);
      expect(res.body.name).toBe('prawn');
      expect(res.body.isExcludedFromMatch).toBe(true);
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
      const ingredient = await Ingredient.findOne({ name: 'coconut' });
      const res1 = await request(app)
        .put(route(ingredient._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ isExcludedFromMatch: 'booo' })
        .expect('content-type', /json/)
        .expect(400);
      expect(JSON.parse(res1.error.text).message).toEqual(expect.stringMatching(/Cast to Boolean failed/i));

      const res2 = await request(app)
        .put(route(ingredient._id))
        .set('authorization', 'Bearer SUPER SECRET')
        .send({ name: '' })
        .expect('content-type', /json/)
        .expect(400);
      expect(JSON.parse(res2.error.text).message).toEqual(expect.stringMatching(/`name` is required/i));
    });
  });

  describe('[DELETE]', () => {
    test('should respond with 200 on delete of existing ingredient', async () => {
      const ingredient = await Ingredient.findOne({ name: 'coconut' });
      await request(app)
        .delete(route(ingredient._id))
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
