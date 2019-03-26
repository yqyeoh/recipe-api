const app = require('./app');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.on('error', error => {
  console.error('unable to connect to database', error);
});

db.on('connected', error => {
  console.log('Successfully connected to the database');
});

db.once('connected', () => {
  app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
      return console.log(`server is running on heroku with port number ${port}`);
    }
    console.log(`server is running on port ${port}`);
  });
});
