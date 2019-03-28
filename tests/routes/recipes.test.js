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
    await Cuisine.collection.deleteMany({});
    await Ingredient.collection.deleteMany({});
    // await db.dropCollection('ingredients');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  xdescribe('[GET]', () => {
    test('get all recipes', async () => {
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);
      expect(res.body).toHaveLength(2);
    });
  });
  describe('[POST]', () => {
    test('respond with 201 when creating valid new ingredient', async () => {
      const recipe = {
        title: 'Chicken Parmesan',
        cuisine: 'Chinese',
        imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
        timeRequired: '90',
        servings: '5',
        instructions: 'test3',
        ingredients: [
          { ingredient: 'chicken', extraDescription: 'seasoned', qty: '30', unit: '', isOptional: false },
          { ingredient: 'beef', extraDescription: 'jerky', qty: '2', unit: 'slice', isOptional: true },
          { ingredient: 'coriander', extraDescription: 'abit', qty: '', unit: 'stalk', isOptional: true },
        ],
      };
      const res = await request(app)
        .post(route())
        .send(recipe)
        .expect('content-type', /json/)
        .expect(201);
      console.log(res.body);
    });
  });
});
