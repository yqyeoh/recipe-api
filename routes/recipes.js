const express = require('express');

const router = express.Router();
const protectedRouter = express.Router();
const boom = require('boom');
const Recipe = require('../models/recipe');
const Cuisine = require('../models/cuisine');
const Ingredient = require('../models/ingredient');
const asyncMiddleware = require('../asyncMiddleware');

const saveRecipe = async (route, req) => {
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
  if (!title) throw boom.badRequest('missing title');
  const mappedIngredientsPromises = ingredients.map(async item => {
    let foundIngredient = await Ingredient.findOne({ name: item.ingredient });
    if (!foundIngredient) {
      const newIngredient = new Ingredient({ name: item.ingredient, isExcludedFromMatch: false });
      foundIngredient = await newIngredient.save();
    }
    item.ingredient = foundIngredient._id;
    return item;
  });
  const mappedIngredientData = await Promise.all(mappedIngredientsPromises);
  let savedRecipe;

  if (route === 'post') {
    const recipe = new Recipe({ ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredientData });
    savedRecipe = await recipe.save();
    console.log('savedRecipe', savedRecipe);
  } else {
    const updatedRecipe = { ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredientData };
    savedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updatedRecipe, {
      new: true,
      runValidators: true,
    });
  }
  const populatedRecipe = await Recipe.findOne(savedRecipe)
    .populate('cuisine')
    .populate('ingredients.ingredient');
  console.log('populated recipe', populatedRecipe);
  return populatedRecipe;
};

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
    // const { title, imageUrl, timeRequired, servings, ingredients, instructions } = req.body;
    // const recipeFieldsWithoutRef = {
    //   title,
    //   imageUrl,
    //   timeRequired,
    //   servings,
    //   instructions,
    // };
    // const cuisine = await Cuisine.findOne({ name: req.body.cuisine });
    // if (!cuisine) throw boom.badRequest('missing cuisine');
    // if (!title) throw boom.badRequest('missing title');
    // const mappedIngredientsPromises = ingredients.map(async item => {
    //   let foundIngredient = await Ingredient.findOne({ name: item.ingredient });
    //   if (!foundIngredient) {
    //     const newIngredient = new Ingredient({ name: item.ingredient, isExcludedFromMatch: false });
    //     foundIngredient = await newIngredient.save();
    //   }
    //   item.ingredient = foundIngredient._id;
    //   return item;
    // });
    // const mappedIngredientData = await Promise.all(mappedIngredientsPromises);
    // const recipe = new Recipe({ ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredientData });
    // const savedRecipe = await recipe.save();
    // const populatedRecipe = await Recipe.findOne(savedRecipe)
    //   .populate('cuisine')
    //   .populate('ingredients.ingredient');
    const populatedRecipe = await saveRecipe('post', req);
    console.log('populatedRecipe', populatedRecipe);
    res.status(201).json(populatedRecipe);
  })
);

protectedRouter.route('/:id').put(
  asyncMiddleware(async (req, res) => {
    // const { title, imageUrl, timeRequired, servings, ingredients, instructions } = req.body;
    // const recipeFieldsWithoutRef = {
    //   title,
    //   imageUrl,
    //   timeRequired,
    //   servings,
    //   instructions,
    // };
    // const cuisine = await Cuisine.findOne({ name: req.body.cuisine });
    // if (!cuisine) throw boom.badRequest('missing cuisine');
    // if (!title) throw boom.badRequest('missing title');
    // const mappedIngredientsPromises = ingredients.map(async item => {
    //   let foundIngredient = await Ingredient.findOne({ name: item.ingredient });
    //   if (!foundIngredient) {
    //     const newIngredient = new Ingredient({ name: item.ingredient, isExcludedFromMatch: false });
    //     foundIngredient = await newIngredient.save();
    //   }
    //   item.ingredient = foundIngredient._id;
    //   return item;
    // });
    // const mappedIngredientData = await Promise.all(mappedIngredientsPromises);
    // const updatedRecipe = { ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredientData };
    // const savedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updatedRecipe, {
    //   new: true,
    //   runValidators: true,
    // });
    // const populatedRecipe = await Recipe.findOne(savedRecipe)
    //   .populate('cuisine')
    //   .populate('ingredients.ingredient');
    const populatedRecipe = await saveRecipe('put', req);
    res.status(202).json(populatedRecipe);
  })
);

module.exports = { router, protectedRouter };
