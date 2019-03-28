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

  describe('[GET]', () => {
    test('get all recipes', async () => {
      const res = await request(app)
        .get(route())
        .expect('content-type', /json/)
        .expect(200);
      expect(res.body).toHaveLength(2);
      expect(res.body).toContainObject({
        title: 'Chicken Parmesan',
        timeRequired: 90,
        servings: '5',
        cuisine: expect.objectContaining({ _id: expect.any(String), name: 'Chinese' }),
        ingredients: expect.arrayContaining([
          expect.objectContaining({
            ingredient: expect.objectContaining({
              name: 'chicken',
              isExcludedFromMatch: false,
              _id: expect.any(String),
            }),
            extraDescription: 'skinless, boneless',
            qty: '4',
            unit: '',
            isOptional: false,
          }),
          expect.objectContaining({
            ingredient: expect.objectContaining({
              name: 'pepper',
              isExcludedFromMatch: false,
              _id: expect.any(String),
            }),
            extraDescription: 'for seasoning',
            qty: '1/4',
            unit: 'tsp',
            isOptional: false,
          }),
        ]),
      });
      expect(res.body).toContainObject({
        title: 'Beef Noodle',
        timeRequired: 45,
        servings: '3',
        cuisine: expect.objectContaining({ _id: expect.any(String), name: 'Western' }),
        ingredients: expect.arrayContaining([
          expect.objectContaining({
            ingredient: expect.objectContaining({
              name: 'beef',
              isExcludedFromMatch: false,
              _id: expect.any(String),
            }),
            extraDescription: 'big',
            qty: '2',
            unit: 'slice',
            isOptional: false,
          }),
          expect.objectContaining({
            ingredient: expect.objectContaining({
              name: 'salt',
              isExcludedFromMatch: true,
              _id: expect.any(String),
            }),
            extraDescription: 'for seasoning',
            qty: '1/2',
            unit: 'tsp',
            isOptional: false,
          }),
        ]),
      });
    });
  });
  describe('[POST]', () => {
    test('respond with 201 when creating valid new recipe with new ingredient', async () => {
      const recipe = {
        title: 'Chicken Parmesan',
        cuisine: 'Chinese',
        imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
        timeRequired: 90,
        servings: '5',
        instructions: 'test3',
        ingredients: [
          { ingredient: 'chicken', extraDescription: 'seasoned', qty: '30', unit: '', isOptional: false },
          { ingredient: 'beef', extraDescription: 'jerky', qty: '2', unit: 'slice', isOptional: true },
          { ingredient: 'coriander', extraDescription: 'abit', qty: '', unit: 'stalk', isOptional: true },
        ],
      };
      const { title, imageUrl, timeRequired, servings, instructions } = recipe;
      const res = await request(app)
        .post(route())
        .send(recipe)
        .expect('content-type', /json/)
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          title,
          imageUrl,
          timeRequired,
          servings,
          instructions,
          cuisine: expect.objectContaining({ _id: expect.any(String), name: recipe.cuisine }),
          ingredients: expect.arrayContaining(
            recipe.ingredients.map(item => {
              const { extraDescription, qty, unit, isOptional } = item;
              return expect.objectContaining({
                ingredient: expect.objectContaining({
                  name: item.ingredient,
                  _id: expect.any(String),
                }),
                extraDescription,
                qty,
                unit,
                isOptional,
              });
            })
          ),
        })
      );
      const newIngredient = await Ingredient.findOne({ name: 'coriander' });
      expect(newIngredient).toEqual(
        expect.objectContaining({ _id: expect.any(Object), name: 'coriander', isExcludedFromMatch: false })
      );
    });
    test('respond with 400 when creating recipe without title or cuisine', async () => {
      const recipe1 = {
        title: '',
        cuisine: 'Chinese',
      };
      const res1 = await request(app)
        .post(route())
        .send(recipe1)
        .expect('content-type', /json/)
        .expect(400);
      expect(res1.body.message).toEqual('missing title');

      const recipe2 = {
        title: 'mee mamak',
        cuisine: '',
      };
      const res2 = await request(app)
        .post(route())
        .send(recipe2)
        .expect('content-type', /json/)
        .expect(400);
      expect(res2.body.message).toEqual('missing cuisine');
    });
  });
  describe('[PUT]', () => {
    test('respond with 202 when doing a valid update on an existing recipe', async () => {
      const recipe = await Recipe.findOne({ title: 'Chicken Parmesan' });
      const updatedRecipe = {
        title: 'Chicken Parmesan2',
        cuisine: 'Korean',
        imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
        timeRequired: 30,
        servings: '2',
        ingredients: [
          {
            ingredient: 'cheese',
            extraDescription: 'cheddar',
            qty: '1',
            unit: 'block',
            isOptional: false,
          },
          {
            ingredient: 'pepper',
            extraDescription: 'for seasoning',
            qty: '1/4',
            unit: 'tsp',
            isOptional: false,
          },
        ],
        instructions: `updated test instructions`,
      };
      const { title, imageUrl, timeRequired, servings, instructions } = updatedRecipe;
      const res = await request(app)
        .put(route(recipe._id))
        .send(updatedRecipe)
        .expect('content-type', /json/)
        .expect(202);
      expect(res.body).toEqual(
        expect.objectContaining({
          title,
          imageUrl,
          timeRequired,
          servings,
          instructions,
          cuisine: expect.objectContaining({ _id: expect.any(String), name: updatedRecipe.cuisine }),
          ingredients: expect.arrayContaining(
            updatedRecipe.ingredients.map(item => {
              const { extraDescription, qty, unit, isOptional } = item;
              return expect.objectContaining({
                ingredient: expect.objectContaining({
                  name: item.ingredient,
                  _id: expect.any(String),
                }),
                extraDescription,
                qty,
                unit,
                isOptional,
              });
            })
          ),
        })
      );
    });
  });
});
