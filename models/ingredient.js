const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
    required: true,
    trim: true,
  },
  isExcludedFromMatch: {
    type: Boolean,
    required: true,
  },
});

ingredientSchema.pre('save', async () => {
  await Ingredient.init();
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
module.exports = Ingredient;
