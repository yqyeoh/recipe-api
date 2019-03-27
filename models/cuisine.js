const mongoose = require('mongoose');

const cuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
});

const Cuisine = mongoose.model('Cuisine', cuisineSchema);
module.exports = Cuisine;
