const Ingredient = require('../../models/ingredient');
const Cuisine = require('../../models/cuisine');
const Recipe = require('../../models/recipe');

const seedRecipes = async () => {
  const cuisine1 = new Cuisine({ name: 'Chinese' });
  console.log('cuisine 1 id', cuisine1._id);
  const savedCuisine = await cuisine1.save();
  const recipe1 = new Recipe({
    title: 'Chicken Parmesan',
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: '90',
    servings: '5',
    instructions: `test instructions`,
    cuisine: savedCuisine._id,
  });
  await recipe1.save();

  const sameCuisine = await Cuisine.findOne({ name: 'Chinese' });
  console.log('sameCuisineid', sameCuisine._id);

  const recipe2 = new Recipe({
    title: 'Black Pepper Chicken Parmesan',
    imageUrl: 'https://foolproofliving.com/wp-content/uploads/2013/09/Lighter-Chicken-Parmesan-9688-FL.jpg',
    timeRequired: '90',
    servings: '5',
    instructions: `test instructions`,
    cuisine: savedCuisine._id,
  });
  await recipe2.save();

  // recipe1.save((error, savedRecipe) => {
  //   const cuisine1 = new Cuisine({ name: 'Chinese' });
  //   cuisine1.save((error, savedCuisine) => {
  //     savedRecipe.cuisine = savedCuisine._id;
  //     savedRecipe.save();
  //   });
  // });
};

module.exports = seedRecipes;
