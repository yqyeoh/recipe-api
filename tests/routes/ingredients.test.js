const { MongoMemoryServer } = require('mongodb-memory-server');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const Ingredient = require('../../models/ingredient');

const route = (params = '') => {
  const path = '/ingredients';
  return `${path}/${params}`;
};

const mapResponseIngredients = ingredients => {
  return ingredients.map(ingredient => ({
    name: ingredient.name,
    isExcludedFromMatch: ingredient.isExcludedFromMatch,
  }));
};

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
    console.log('beforeEach');
    await Ingredient.insertMany([
      { name: 'coconut', isExcludedFromMatch: false },
      { name: 'chicken', isExcludedFromMatch: false },
      { name: 'chicken breast', isExcludedFromMatch: false },
      { name: 'salt', isExcludedFromMatch: true },
    ]);
  });

  afterEach(async () => {
    await db.dropCollection('ingredients');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  describe('[GET]', () => {
    test('returns all ingredients', async () => {
      console.log(1);
      const expected = [
        { name: 'coconut', isExcludedFromMatch: false },
        { name: 'chicken', isExcludedFromMatch: false },
        { name: 'chicken breast', isExcludedFromMatch: false },
        { name: 'salt', isExcludedFromMatch: true },
      ];
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      expect(ingredients).toHaveLength(4);
      const result = mapResponseIngredients(ingredients);
      expect(result).toEqual(expect.arrayContaining(expected));
    });
    test('get ingredients by valid query', async () => {
      const expected = [
        { name: 'chicken', isExcludedFromMatch: false },
        { name: 'chicken breast', isExcludedFromMatch: false },
      ];
      const res = await request(app)
        .get(route())
        .query({ name: 'chicken' })
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      expect(ingredients).toHaveLength(2);
      const result = mapResponseIngredients(ingredients);
      expect(result).toEqual(expect.arrayContaining(expected));
    });
    test('return empty array when invalid ingredient name is queried', async () => {
      const expected = [];
      const res = await request(app)
        .get(route())
        .query({ name: 'oil' })
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      expect(ingredients).toHaveLength(0);
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
      const newIngredient = new Ingredient({ name: 'beef', isExcludedFromMatch: false });
      const res = await request(app)
        .post(route())
        .send(newIngredient)
        .expect('content-type', /json/)
        .expect(201);
      const ingredient = res.body;
      expect(ingredient.name).toEqual('beef');
      expect(ingredient.isExcludedFromMatch).toEqual(false);
    });

    test('should respond with 409 when creating ingredient that already exist', async () => {
      console.log(2);
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);

      const ingredients = res.body;
      console.log('ingredients before adding chicken', ingredients);
      const ingredient = new Ingredient({ name: 'chicken', isExcludedFromMatch: false });
      Ingredient.once('index', async error => {
        await request(app)
          .post(route())
          .send(ingredient)
          .expect(409);
      });
    });
    test('should respond with 400 when creating ingredient with missing required property', async () => {
      const ingredient = new Ingredient({ name: 'lamb' });
      await request(app)
        .post(route())
        .send(ingredient)
        .expect(400);
    });
  });

  describe('[PUT]', () => {
    test('should respond with 202 for a valid update', async () => {
      console.log(3);
      const ingredient = await Ingredient.findOne({ name: 'coconut' });
      const res = await request(app)
        .put(route(ingredient._id))
        .send({ isExcludedFromMatch: true })
        .expect('content-type', /json/)
        .expect(202);
      expect(res.body.name).toBe('coconut');
      expect(res.body.isExcludedFromMatch).toBe(true);
    });
  });
});
