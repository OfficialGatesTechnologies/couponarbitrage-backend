const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const subscriberSchema = new Schema({

  subscriberEmail: {
    type: String,
    required: true
  },

  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('subscriber', subscriberSchema);
