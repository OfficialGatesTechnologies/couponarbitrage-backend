const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackCredits = new Schema({

  revenueCreditUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  revenueCreditType: {
    type: String,
    required: true
  },
  revenueCreditAmount: {
    type: Number,
    default: 0
  },
  revenueCreditStatus:{
    type: Number,
    default: 1
  },
  revenueCreditPaymentType: {
    type: Number,
    default: 0
  },
  revenueCreditPaid: {
    type: Number,
    default: 0
  },
  revenueCreditAdded: {
    type: Date,
    default: Date.now()
  }, revenueCreditDeleted: {
    type: Number,
    default: 0
  },

});


module.exports = mongoose.model('cashback_credits', CashbackCredits);
