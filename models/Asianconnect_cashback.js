const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const AsianconnectCashback = new Schema({

  asianconnectId: {
    type: String,
    required: true
  },
  asianconnect_turnover: {
    type: Number,
    default: 0
  },
  asianconnect_cashback: {
    type: Number,
    default: 0
  },
  asianconnect_added: {
    type: Date,
    default: Date.now()
  }

});


module.exports = mongoose.model('asianconnect_cashback_credit', AsianconnectCashback);
