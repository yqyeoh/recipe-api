const { MongoMemoryServer } = require('mongodb-memory-server');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const Recipe = require('../../models/recipe');
const seedRecipes = require('./seedRecipes');

const route = (params = '') => {
  const path = '/recipes';
  return `${path}/${params}`;
};

describe('Recipes', () => {
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
    await seedRecipes();
  });

  afterEach(async () => {
    await Recipe.collection.deleteMany({});
    // await db.dropCollection('ingredients');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  describe('[GET]', () => {
    test('get all recipes', async () => {
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);
      expect(res.body).toHaveLength(2);
    });
  });
  describe('[POST]', () => {
    xtest('respond with 201 when creating valid new ingredient', async () => {
      const cuisine = await Cuisine.findOne({ name: 'Thai' });
    });
  });
});
