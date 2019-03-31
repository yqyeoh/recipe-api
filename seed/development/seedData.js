const ingredients = require('./ingredients');
const cuisines = require('./cuisines');
const recipes = require('./recipes');
const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const { saveRecipe } = require('../../routes/recipes');

const seedDevelopmentData = async () => {
  await Ingredient.insertMany(ingredients);
  await Cuisine.insertMany(cuisines);
  for (const recipe of recipes) {
    recipe.body = recipe;
    await saveRecipe('post', recipe);
  }
  // recipes.forEach(async recipe => {
  //   recipe.body = recipe;
  //   await saveRecipe('post', recipe);
  // });
};

module.exports = seedDevelopmentData;
