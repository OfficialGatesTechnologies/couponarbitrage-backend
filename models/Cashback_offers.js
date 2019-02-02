const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackOffers = new Schema({

  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_stores',
    required: true
  },
  cashback_type: {
    type: String,
    required: true
  },
  network_commission: {
    type: Number,
    default: 0
  },
  newtwork_cashback_url: String,
  cashback: {
    type: Number,
    default: 0
  },
  description: String,
  vip_offer: {
    type: Number,
    default: 0
  },
  exclusive_rate: {
    type: Number,
    default: 0
  }, expiry_date: {
    type: Date,
    default: ''
  }, date_created: {
    type: Date,
    default: Date.now()
  }, date_updated: {
    type: Date,
    default: ''
  },

});


module.exports = mongoose.model('cashback_offers', CashbackOffers);
