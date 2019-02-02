const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackTransactions = new Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  case_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_cliams',
    required: true
  },
  cb_type: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  payment_type: {
    type: Number,
    default: 0
  },
  payment_email: String,
  trans_date: {
    type: Date,
    default: 0
  },
  join_date: {
    type: Date,
    default: 0
  },
  notes: String,
  raf_bonus: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 0
  },
  added: {
    type: Date,
    default: Date.now()
  },
  deletedReason: String,
  deleted: {
    type: Number,
    default: 0
  },

});

module.exports = mongoose.model('cashback_transaction', CashbackTransactions);
