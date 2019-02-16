const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const NetellerPaid = new Schema({

  netellerId: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  amount: {
    type: Number,
    default: ''
  },
  paidOn: {
    type: Date,
    default: 0
  },


});


module.exports = mongoose.model('neteller_paid', NetellerPaid);
