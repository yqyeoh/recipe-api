const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const boom = require('boom');
const User = require('../models/user');
const { asyncMiddleware } = require('../middleware');

router.route('/').get((req, res) => {
  res.send('hello');
});

router.route('/register').post(
  asyncMiddleware(async (req, res) => {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await User.init();
    await user.save();
    res.sendStatus(201);
  })
);

router.route('/authenticate').post(
  asyncMiddleware(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw boom.badRequest('incorrect email or password');
    const match = await user.isCorrectPassword(password);
    if (!match) throw boom.badRequest('incorrect email or password');
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '24hr' });
    res.cookie('token', token, { httpOnly: true }).sendStatus(200);
  })
);

module.exports = router;
