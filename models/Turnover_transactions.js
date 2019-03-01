const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const TurnoverTransactions = new Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
    required: true
  },
  tb_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_menu',
    required: true
  },
  cashback_user_id: {
    type: Number,
    required: true
  },
  scheme: {
    type: Number,
    default: 0
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
  notes: String,
  status: {
    type: Number,
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

module.exports = mongoose.model('turnover_transaction', TurnoverTransactions);
