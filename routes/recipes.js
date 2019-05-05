const express = require('express');

const router = express.Router();
const protectedRouter = express.Router();
const boom = require('boom');
const Recipe = require('../models/recipe');
const { asyncMiddleware, verifyToken } = require('../middleware');
const saveRecipe = require('../services/recipeService');

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

protectedRouter.use(verifyToken);

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
