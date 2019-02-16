const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const SBObetCashback = new Schema({

  sbobetId: {
    type: String,
    required: true
  },
  customerReferenceID: {
    type: String,
    default:  ''
  },
  country: {
    type: String,
    default: ''
  },
  signupDate: {
    type: String,
    default: 0
  },
  rewardPlan: {
    type: String,
    default: ''
  },
  marketingSourceName: {
    type: String,
    default: ''
  },
  refURL: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: String,
    default: ''
  },
  customerType: {
    type: String,
    default: 0
  },
  deposits: {
    type: Number,
    default: 0
  },
  turnover: {
    type: Number,
    default: 0
  },
  totalNetRevenue: {
    type: Number,
    default: 0
  },
  totalNetRevenueMTD: {
    type: Number,
    default: 0
  },
  signupDateTime: {
    type: String,
    default: 0
  },
  expiryDateTime: {
    type: String,
    default: 0
  },
  updatedTime: {
    type: String,
    default: 0
  },
  status: {
    type: String,
    default: 0
  }

});


module.exports = mongoose.model('Sbobet_cashback_credit', SBObetCashback);
