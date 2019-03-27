const express = require('express');

const app = express();
const index = require('./routes/index');
const recipes = require('./routes/recipes');
const ingredients = require('./routes/ingredients');
const cuisines = require('./routes/cuisines');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', index);
app.use('/recipes', recipes.router);
app.use('/recipes', recipes.protectedRouter);
app.use('/ingredients', ingredients.router);
app.use('/ingredients', ingredients.protectedRouter);
app.use('/cuisines', cuisines.router);
app.use('/cuisines', cuisines.protectedRouter);
app.use((err, req, res, next) => {
  //   console.log(err.message);
  //   console.log(err.output.payload);
  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = app;
