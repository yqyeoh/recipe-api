const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const Recipe = require('../../models/recipe');

const seedRecipes = async () => {
  // await Ingredient.insertMany([
  //   { name: 'coconut', isExcludedFromMatch: false },
  //   { name: 'chicken', isExcludedFromMatch: false },
  //   { name: 'chicken breast', isExcludedFromMatch: false },
  //   { name: 'salt', isExcludedFromMatch: true },
  // ]);
  // await Cuisine.insertMany([{ name: 'Korean' }, { name: 'Western' }, { name: 'Thai' }, { name: 'Italian' }]);
  const chinese = new Cuisine({ name: 'Chinese' });
  await chinese.save();
  const chicken = new Ingredient({ name: 'chicken', isExcludedFromMatch: false });
  await chicken.save();
  const pepper = new Ingredient({ name: 'pepper', isExcludedFromMatch: false });
  await pepper.save();
  const recipe1 = new Recipe({
    title: 'Chicken Parmesan',
    cuisine: chinese._id,
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: '90',
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
  const western = new Cuisine({ name: 'Western' });
  await western.save();
  const beef = new Ingredient({ name: 'beef', isExcludedFromMatch: false });
  await beef.save();
  const salt = new Ingredient({ name: 'salt', isExcludedFromMatch: false });
  await salt.save();
  const recipe2 = new Recipe({
    title: 'Beef Noodle',
    cuisine: western._id,
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: '45',
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
};

module.exports = seedRecipes;
