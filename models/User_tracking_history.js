const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const UserTrackingHistory = new Schema({
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_tracking',
    required: true
  },
  login_type: {
    type: String,
    required: true
  },
  blocked: {
    type: Number,
    required: true
  },
  lastlogin_time: {
    type: Date,

    default: Date.now()
  },
  lastlogin_ip: {
    type: String,
    required: true
  },
  lastlogin_agent: {
    type: String,
    required: true
  },
  lastlogin_sessionid: {
    type: String,
    required: true
  },
  
  referer_url: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  lastlogout_time: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  deleted: {
    type: Number,
    default: 0
  },

});


module.exports = mongoose.model('user_tracking_history', UserTrackingHistory);
