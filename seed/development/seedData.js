const ingredients = require('./ingredients');
const cuisines = require('./cuisines');
const recipes = require('./recipes');
const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const { saveRecipe } = require('../../routes/recipes');
const Recipe = require('../../models/recipe');

const seedData = async (ingr, cuis, recs) => {
  await Ingredient.insertMany(ingredients);
  await Cuisine.insertMany(cuisines);
  recipes.forEach(async recipe => {
    recipe.body = recipe;
    await saveRecipe('post', recipe);
  });
};

const seedDevelopmentData = async () => {
  await seedData(ingredients, cuisines, recipes);
};

module.exports = seedDevelopmentData;
