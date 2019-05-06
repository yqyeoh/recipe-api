const ingredients = require('./ingredients');
const cuisines = require('./cuisines');
const recipes = require('./recipes');
const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const User = require('../../models/user');
const { saveRecipe } = require('../../routes/recipes');

const seedDevelopmentData = async () => {
  await Ingredient.insertMany(ingredients);
  await Cuisine.insertMany(cuisines);
  for (const recipe of recipes) {
    recipe.body = recipe;
    await saveRecipe('post', recipe);
  }
  const user = new User({ email: 'admin@admin.com', password: 'admin' });
  await User.init();
  await user.save();
};

module.exports = seedDevelopmentData;
