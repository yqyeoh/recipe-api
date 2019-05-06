const express = require('express');
const cors = require('cors');

const app = express();
const cookieParser = require('cookie-parser');
const index = require('./routes/index');
const recipes = require('./routes/recipes');
const ingredients = require('./routes/ingredients');
const cuisines = require('./routes/cuisines');

const whitelist = [
  'https://admiring-kalam-aa2409.netlify.com/',
  'https://auto-recipe-api-yq.herokuapp.com/',
  'https://test-recipe-api-yq.herokuapp.com/',
  'https://recipe-api-yq.herokuapp.com/',
];

if (process.env.NODE_ENV !== 'production') {
  whitelist.push('http://localhost:3000');
}

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', index);
app.use('/recipes', recipes.router);
app.use('/recipes', recipes.protectedRouter);
app.use('/ingredients', ingredients.router);
app.use('/ingredients', ingredients.protectedRouter);
app.use('/cuisines', cuisines.router);
app.use('/cuisines', cuisines.protectedRouter);
app.use((err, req, res, next) => {
  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = app;
