const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const UserIntrested = new Schema({

  user_intrested_name: {
    type: String,
    required: true
  },
  user_intrested_email: {
    type: String,
    required: true
  },
  user_intrested_added: {
    type: Number,
    default: Date.now()
  },
  user_intrested_deleted: {
    type: Number,
    default: 0
  },

});


module.exports = mongoose.model('user_intrested', UserIntrested, 'user_intrested');
