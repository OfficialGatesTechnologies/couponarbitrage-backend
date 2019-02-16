const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const NetellerCashback = new Schema({

  netellerId: {
    type: String,
    required: true
  },
  rowid: {
    type: String,
    default:  ''
  },
  currencySymbol: {
    type: String,
    default: ''
  },
  totalRecords: {
    type: String,
    default: 0
  },
  merchant: {
    type: String,
    default: ''
  },
  affiliateID: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  siteID: {
    type: String,
    default: ''
  },
  creativeID: {
    type: String,
    default: ""
  },
  creativeName: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: 0
  },
  memberID: {
    type: Number,
    default: 0
  },
  registrationDate: {
    type: String,
    default: 0
  },
  registrationDateTime: {
    type: String,
    default: 0
  },
  memberName: {
    type: String,
    default: 0
  },
  membercountry: {
    type: String,
    default: 0
  },
  ACID: {
    type: String,
    default: 0
  },
  deposits: {
    type: String,
    default: 0
  },
  bonus: {
    type: String,
    default: 0
  },
  netTransToFee: {
    type: String,
    default: 0
  },
  transValue: {
    type: String,
    default: 0
  },
  commission: {
    type: String,
    default: 0
  },
  CPACommission: {
    type: String,
    default: 0
  },
  CPACount: {
    type: String,
    default: 0
  },
  totalCommission: {
    type: String,
    default: 0
  },
  is_new: {
    type: String,
    default: 0
  },
  createdTime: {
    type: String,
    default: 0
  },
  paymentStatus: {
    type: Number,
    default: 0
  }

});


module.exports = mongoose.model('neteller_cashback_credit', NetellerCashback);
