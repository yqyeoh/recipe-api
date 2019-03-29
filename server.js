const mongoose = require('mongoose');
const app = require('./app');
const seedDevelopmentData = require('./seed/development/seedData');

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
  db.dropDatabase(() => {
    console.log('database dropped');
  });
});

db.once('connected', () => {
  app.listen(port, async () => {
    if (process.env.NODE_ENV === 'production') {
      return console.log(`server is running on heroku with port number ${port}`);
    }
    await seedDevelopmentData();
    console.log(`server is running on port ${port}`);
  });
});
