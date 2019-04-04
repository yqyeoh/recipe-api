const express = require('express');

const router = express.Router();
const protectedRouter = express.Router();
const boom = require('boom');
const Ingredient = require('../models/ingredient');
const { asyncMiddleware, verifyToken } = require('../middleware');

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

protectedRouter.use(verifyToken);

protectedRouter.route('/').post(
  asyncMiddleware(async (req, res) => {
    const ingredient = new Ingredient(req.body);
    const savedIngredient = await ingredient.save();
    res.status(201).json(savedIngredient);
  })
);

protectedRouter
  .route('/:id')
  .put(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      const updatedIngredient = await Ingredient.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedIngredient) {
        throw boom.notFound(`Ingredient not found with id ${id}`);
      }
      res.status(202).json(updatedIngredient);
    })
  )
  .delete(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      if (!id) {
        throw boom.badRequest('missing ingredient id');
      }
      const deletedIngredient = await Ingredient.findByIdAndDelete(id, req.body);
      if (!deletedIngredient) {
        throw boom.notFound(`Ingredient not found with id ${id}`);
      }
      res.sendStatus(202);
    })
  );

module.exports = { router, protectedRouter };
