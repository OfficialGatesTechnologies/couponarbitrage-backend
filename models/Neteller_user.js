const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const NetellerUser = new Schema({

  netellerId: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  pendingAmount: {
    type: Number,
    default: ''
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  makePayout: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('neteller_users', NetellerUser);
