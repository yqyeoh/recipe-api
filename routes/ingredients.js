const express = require('express');
const router = express.Router();
const protectedRouter = express.Router();
const Ingredient = require('../models/ingredient');
const boom = require('boom');
const asyncMiddleware = require('../asyncMiddleware');

// router.route('/').get(async (req, res) => {
//   try {
//     return res.json(await Ingredient.find());
//   } catch (error) {
//     next(error);
//   }
// });

router.route('/').get(
  asyncMiddleware(async (req, res) => {
    const { name } = req.query;
    let ingredients;
    if (!name && Object.keys(req.query).length > 0) throw boom.badRequest('invalid query');
    if (name) {
      ingredients = await Ingredient.find({ name: new RegExp(name, 'i') });
    } else {
      ingredients = await Ingredient.find();
    }
    res.status(200).json(ingredients);
  })
);

protectedRouter.route('/').post(
  asyncMiddleware(async (req, res) => {
    const ingredient = new Ingredient(req.body);
    const savedIngredient = await ingredient.save();
    console.log('saved ingredient', savedIngredient);
    res.status(201).json(savedIngredient);
  })
);

// protectedRouter.route('/').post(async (req, res) => {
//   try {
//     const ingredient = new Ingredient(req.body);
//     const savedIngredient = await ingredient.save();
//     res.status(201).json(savedIngredient);
//   } catch (error) {
//     next(error);
//   }
// });

protectedRouter.route('/:id').put(
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      throw boom.badRequest('missing ingredient id');
    }
    const updatedIngredient = await Ingredient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedIngredient) {
      throw boom.notFound('Ingredient not found with id ' + id);
    }
    res.status(202).json(updatedIngredient);
  })
);

// protectedRouter.route('/:id').put(async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!userId) {
//       throw boom.badRequest('missing ingredient id');
//     }
//     const updatedIngredient = await Ingredient.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedIngredient) {
//       throw boom.notFound('Ingredient not found with id ' + id);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = { router, protectedRouter };
