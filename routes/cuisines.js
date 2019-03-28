const mongoose = require('mongoose');
const express = require('express');
const boom = require('boom');

const router = express.Router();
const protectedRouter = express.Router();
const asyncMiddleware = require('../asyncMiddleware');

const Cuisine = require('../models/cuisine');

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    const { name } = req.query;
    let cuisines;
    if (!name && Object.keys(req.query).length > 0) throw boom.badRequest('invalid query');
    if (name) {
      cuisines = await Cuisine.find({ name: new RegExp(name, 'i') });
    } else {
      cuisines = await Cuisine.find();
    }
    res.status(200).json(cuisines);
  })
);

protectedRouter.route('/').post(
  asyncMiddleware(async (req, res) => {
    const cuisine = new Cuisine(req.body);
    const createdCuisine = await cuisine.save();
    res.status(201).json(createdCuisine);
  })
);

protectedRouter
  .route('/:id')
  .put(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      const updatedCuisine = await Cuisine.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedCuisine) {
        throw boom.notFound(`Cuisine not found with id ${id}`);
      }
      res.status(202).json(updatedCuisine);
    })
  )
  .delete(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      if (!id) {
        throw boom.badRequest('missing ingredient id');
      }
      const deletedIngredient = await Cuisine.findByIdAndDelete(id, req.body);
      if (!deletedIngredient) {
        throw boom.notFound(`Ingredient not found with id ${id}`);
      }
      res.sendStatus(202);
    })
  );

module.exports = { router, protectedRouter };
