const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackVouchers = new Schema({

  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_stores',
    required: true
  },
  voucher_title: {
    type: String,
    required: true
  },
  voucher_mode: {
    type: String,
    required: true
  },
  voucher_type: {
    type: String,
    default: 0
  },
  vouchers_code: String,
  voucher_link: String,
  voucher_summary: String,
  voucher_description: String,
  image_upload: {
    type: String,
    default: 0
  },
  imageFile: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  issue_date: {
    type: Date,
    default: Date.now()
  },
  expiry_date: {
    type: Date,
    default: ''
  }, date_created: {
    type: Date,
    default: Date.now()
  }, date_updated: {
    type: Date,
    default: ''
  },
  voucher_disabled: {
    type: Number,
    default: 0
  },
  voucher_deleted: {
    type: Number,
    default: 0
  },
});


module.exports = mongoose.model('cashback_vouchers', CashbackVouchers);
