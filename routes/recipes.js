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
  } else {
    const updatedRecipe = { ...recipeFieldsWithoutRef, cuisine: cuisine._id, ingredients: mappedIngredientData };
    savedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updatedRecipe, {
      new: true,
      runValidators: true,
    });
    if (!savedRecipe) {
      throw boom.notFound(`Recipe not found with id ${req.params.id}`);
    }
  }
  const populatedRecipe = await Recipe.findOne(savedRecipe)
    .populate('cuisine')
    .populate('ingredients.ingredient');
  return populatedRecipe;
};

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    const keys = Object.keys(req.query);
    const filterExpressions = keys.map(key => ({
      [key]: new RegExp(req.query[key], 'i'),
    }));
    let recipes;
    if (keys.length === 0) {
      recipes = await Recipe.find()
        .populate('cuisine')
        .populate('ingredients.ingredient');
    } else {
      recipes = await Recipe.find().or(filterExpressions);
    }
    res.status(200).json(recipes);
  })
);

protectedRouter.route('/').post(
  asyncMiddleware(async (req, res) => {
    const populatedRecipe = await saveRecipe('post', req);
    res.status(201).json(populatedRecipe);
  })
);

protectedRouter
  .route('/:id')
  .put(
    asyncMiddleware(async (req, res) => {
      const populatedRecipe = await saveRecipe('put', req);
      res.status(202).json(populatedRecipe);
    })
  )
  .delete(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      if (!id) {
        throw boom.badRequest('missing recipe id');
      }
      const deletedRecipe = await Recipe.findByIdAndDelete(id, req.body);
      if (!deletedRecipe) {
        throw boom.notFound(`Recipe not found with id ${id}`);
      }
      res.sendStatus(202);
    })
  );

module.exports = { router, protectedRouter, saveRecipe };
