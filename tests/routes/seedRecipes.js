const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const Recipe = require('../../models/recipe');

const seedRecipes = async () => {
  await Ingredient.insertMany([
    { name: 'beef', isExcludedFromMatch: false },
    { name: 'pepper', isExcludedFromMatch: false },
    { name: 'chicken', isExcludedFromMatch: false },
    { name: 'salt', isExcludedFromMatch: true },
  ]);
  await Cuisine.insertMany([{ name: 'Korean' }, { name: 'Chinese' }, { name: 'Western' }, { name: 'Italian' }]);
  const beef = await Ingredient.findOne({ name: 'beef' });
  const pepper = await Ingredient.findOne({ name: 'pepper' });
  const chicken = await Ingredient.findOne({ name: 'chicken' });
  const salt = await Ingredient.findOne({ name: 'salt' });
  const chinese = await Cuisine.findOne({ name: 'Chinese' });
  const western = await Cuisine.findOne({ name: 'Western' });

  const recipe1 = new Recipe({
    title: 'Chicken Parmesan',
    cuisine: chinese._id,
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 90,
    servings: '5',
    ingredients: [
      {
        ingredient: chicken._id,
        extraDescription: 'skinless, boneless',
        qty: '4',
        unit: '',
        isOptional: false,
      },
      {
        ingredient: pepper._id,
        extraDescription: 'for seasoning',
        qty: '1/4',
        unit: 'tsp',
        isOptional: false,
      },
    ],
    instructions: `test instructions`,
  });
  await recipe1.save();

  const recipe2 = new Recipe({
    title: 'Beef Noodle',
    cuisine: western._id,
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 45,
    servings: '3',
    ingredients: [
      {
        ingredient: beef._id,
        extraDescription: 'big',
        qty: '2',
        unit: 'slice',
        isOptional: false,
      },
      {
        ingredient: salt._id,
        extraDescription: 'for seasoning',
        qty: '1/2',
        unit: 'tsp',
        isOptional: false,
      },
    ],
    instructions: `test instructions2`,
  });
  await recipe2.save();

  const recipe3 = new Recipe({
    title: 'Chick Peas',
    cuisine: western._id,
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 15,
    servings: '1',
    ingredients: [
      {
        ingredient: chicken._id,
        extraDescription: 'big',
        qty: '2',
        unit: 'slice',
        isOptional: false,
      },
      {
        ingredient: salt._id,
        extraDescription: 'for seasoning',
        qty: '1/2',
        unit: 'tsp',
        isOptional: false,
      },
    ],
    instructions: `test instructions2`,
  });
  await recipe3.save();
};

const seedData = [
  {
    title: 'Chicken Parmesan',
    cuisine: 'Chinese',
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 90,
    servings: '5',
    ingredients: [
      {
        ingredient: 'chicken',
        extraDescription: 'skinless, boneless',
        qty: '4',
        unit: '',
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
    instructions: `test instructions`,
  },

  {
    title: 'Beef Noodle',
    cuisine: 'Western',
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 45,
    servings: '3',
    ingredients: [
      {
        ingredient: 'beef',
        extraDescription: 'big',
        qty: '2',
        unit: 'slice',
        isOptional: false,
      },
      {
        ingredient: 'salt',
        extraDescription: 'for seasoning',
        qty: '1/2',
        unit: 'tsp',
        isOptional: false,
      },
    ],
    instructions: `test instructions2`,
  },

  {
    title: 'Chick Peas',
    cuisine: 'western',
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: 15,
    servings: '1',
    ingredients: [
      {
        ingredient: 'chicken',
        extraDescription: 'big',
        qty: '2',
        unit: 'slice',
        isOptional: false,
      },
      {
        ingredient: 'salt',
        extraDescription: 'for seasoning',
        qty: '1/2',
        unit: 'tsp',
        isOptional: false,
      },
    ],
    instructions: `test instructions2`,
  },
];

module.exports = { seedRecipes, seedData };
