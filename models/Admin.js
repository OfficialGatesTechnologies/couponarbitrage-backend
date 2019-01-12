const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const Admin = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String ,
    required: true
  },
  accessModules: {
    type: Array ,
    required: true
  },
  privileges: {
    type: Array ,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  isDisabled: {
    type: Number,
    default: 0
  },
  isSuperAdmin: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});


module.exports = mongoose.model('admin', Admin);
