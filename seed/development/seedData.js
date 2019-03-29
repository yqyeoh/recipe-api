const ingredients = require('./ingredients');
const cuisines = require('./cuisines');
const recipes = require('./recipes');
const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const Recipe = require('../../models/recipe');

const seedData = async (ingredients, cuisines, recipes) => {
  await Ingredient.insertMany(ingredients);
  await Cuisine.insertMany(cuisines);
};
