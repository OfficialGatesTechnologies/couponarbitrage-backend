const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackClaims = new Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_stores',
    required: true
  },
  cb_type: {
    type: String,
    required: true
  },
  affil_username: String,
  username: String,
  aff_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affiliate_network',
    required: true
  },
  cb_cashback_id: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },

  timezone: String,
  notes: String,
  reason: String,
  status: {
    type: String,
    default: 'P'
  },
  tags: Array,
  raf_case_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_cliams',
    required: true
  },
  app_balance: Number,
  date_paid: {
    type: Date,
    default: 0
  },
  date_confirmed: {
    type: Date,
    default: 0
  }, date_applied: {
    type: Date,
    default: Date.now()
  }, date_joined: {
    type: Date,
    default: ''
  },

});


module.exports = mongoose.model('cashback_cliams', CashbackClaims);
