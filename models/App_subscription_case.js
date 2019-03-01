const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const AppSubscriptionCase = new Schema({

  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  refid: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: 0
  },
  paid: {
    type: Date,
    default: 0
  },
  status: {
    type: String,
    default: ''
  },
  added: {
    type: Date,
    default: Date.now()
  },
  disabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  },

});

module.exports = mongoose.model('app_subscription_case', AppSubscriptionCase);
