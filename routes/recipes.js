const express = require('express');

const router = express.Router();
const protectedRouter = express.Router();
const boom = require('boom');
const Recipe = require('../models/recipe');
const Cuisine = require('../models/cuisine');
const Ingredient = require('../models/ingredient');
const asyncMiddleware = require('../asyncMiddleware');

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    const recipes = await Recipe.find()
      .populate('cuisine')
      .populate('ingredients.ingredient');

    res.status(200).json(recipes);
  })
);

protectedRouter.route('/').post(
  asyncMiddleware(async (req, res) => {
    const { title, imageUrl, timeRequired, servings, ingredients, instructions } = req.body;
    const recipeFieldsWithoutRef = {
      title,
      imageUrl,
      timeRequired,
      servings,
      instructions,
    };
    const cuisine = await Cuisine.findOne({ name: req.body.cuisine });
    if (!cuisine) throw boom.badRequest('missing cuisine');
    const mappedIngredients = ingredients.map(async item => {
      const ingredientDetails = item;
      let foundIngredient = await Ingredient.findOne({ name: ingredientDetails.ingredient });
      if (!foundIngredient) {
        const newIngredient = new Ingredient({ name: ingredientDetails.ingredient, isExcludedFromMatch: false });
        foundIngredient = await newIngredient.save();
      }
      ingredientDetails.ingredient = foundIngredient._id;
      console.log('ingredient details', ingredientDetails);
      return ingredientDetails;
    });
    // console.log('mappedingredient', mappedIngredients);
    const recipe = new Recipe({ ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredients });
    // console.log('recipe ingredients', recipe.ingredients[0]);
    const savedRecipe = await recipe.save();
    const populatedRecipe = await Recipe.findOne({ _id: savedRecipe._id })
      .populate('cuisine')
      .populate('ingredients.ingredient');
    res.status(201).json(populatedRecipe);
    // console.log('savedRecipe', savedRecipe.ingredients[0]);
    // recipe.save(err => {
    //   Recipe.populate(recipe, { path: 'cuisine' }, (err, recipe1) => {
    //     console.log(recipe1);
    //     res.status(201).json(recipe1);
    //   });
    // });

    // const populatedRecipe = await savedRecipe.populate('cuisine').populate('ingredients.ingredient.name');
    // console.log(populatedRecipe);
  })
);

module.exports = { router, protectedRouter };
