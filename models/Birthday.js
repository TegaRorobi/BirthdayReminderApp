
const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Please enter the birthday date.']
    },
    email: {
      type: String,
      required: [true, 'Please enter an email.'],
      unique: true
    },
    username: {
      type: String,
      trim: true,
      required: [true, 'Please enter a username.'],
    },
    lastGreetingSentAt: {
      type: Date
    }
  }, {timestamps: true}
)


module.exports = mongoose.model('Birthday', birthdaySchema);
