const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const SkrillCashback = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    
  },
  skrillId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  creditDate: {
    type: Date,
    default: Date.now()
  },
  creditDateStr: {
    type: Number,
    default: 0
  }, currency: {
    type: String,
    default: 0
  },
  cashback: {
    type: Number,
    default: 0
  },
  rowid: {
    type: Number,
    default: 0
  },
  currencySymbol: {
    type: String,
    default: 0
  },
   totalRecords: {
    type: String,
    default: 0
  },
  merchant: {
    type: String,
    default: 0
  },
  affiliateID: {
    type: String,
    default: 0
  },
  username: {
    type: String,
    default: 0
  },
  siteID: {
    type: String,
    default: 0
  },
  creativeID: {
    type: String,
    default: 0
  }, creativeName: {
    type: String,
    default: 0
  },
  type: {
    type: String,
    default: 0
  },
  memberID: {
    type: String,
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
    type: Number,
    default: 0
  },
  transValue: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  CPACommission: {
    type: Number,
    default: 0
  },
  CPACount: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  siteCommission: {
    type: Number,
    default: 0
  },
  userCommission: {
    type: Number,
    default: 0
  },
  is_new: {
    type: String,
    default: 0
  },
  paymentStatus: {
    type: Number,
    default: 0
  },
  updateTime: {
    type: Number,
    default: 0
  },
  actionAdd: {
    type: Number,
    default: 0
  },
  actionUpdate: {
    type: Number,
    default: 0
  },

});


module.exports = mongoose.model('skrill_cashback_credit', SkrillCashback);
