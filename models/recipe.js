const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuisine',
      required: true
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    timeRequired: {
      type: Number,
      required: true,
    },
    servings: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ingredient',
        },
        extraDescription: {
          type: String,
          trim: true,
        },
        qty: {
          type: String,
          trim: true,
        },
        unit: {
          type: String,
          trim: true,
        },
        isOptional: {
          type: Boolean,
          // required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
