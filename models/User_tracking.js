const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const UserTracking = new Schema({
  belongsToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  track_userepicode: {
    type: String,
    required: true
  },
  track_name: {
    type: String,
    required: true
  },
  track_username: {
    type: String,
    required: true
  },
  track_email: {
    type: String,
    required: true
  },
  logincount: {
    type: Number,
    default: 0
  },
  updated: {
    type: Date,
    default: Date.now()
  },

});


module.exports = mongoose.model('user_tracking', UserTracking);
