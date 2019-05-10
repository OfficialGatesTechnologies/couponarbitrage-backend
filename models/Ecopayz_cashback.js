const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const EcopayzCashback = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  ecopayzId: {
    type: String,
    required: true
  },
  tackingCode: {
    type: String,
    default:''
  },
  firstName: {
    type: String,
    default:''
  },
  lastName: {
    type: String,
    default:''
  },
  purchaseVolume: {
    type: String,
    default:''
  },
  revenue: {
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
  creditDate: {
    type: String,
    default: 0
  },
  creditDateStr: {
    type: String,
    default: 0
  },
  cashback: {
    type: String,
    default: 0
  },
  paymentStatus: {
    type: Number,
    default: 0
  }
});
module.exports = mongoose.model('ecopayz_cashback_credit', EcopayzCashback);
