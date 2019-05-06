const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
});

userSchema.methods.isCorrectPassword = async function(password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const user = this;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  user.password = hashedPassword;
});

module.exports = mongoose.model('User', userSchema);
