const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackStores = new Schema({

  aid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_sites',
    required: true
  },
  cat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_caregories',
    required: true
  },
  network_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affiliate_network',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url_key: String,
  uploadType: String,
  imageFile: String,
  details: {
    type: String,
    default: ''
  },
  details_default: {
    type: Number,
    default: 0
  },
  banner: String,
  internal_banner: String,
  link: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  comm: Number,
  vaild_from: {
    type: Date,
    default: Date.now()
  },
  valid_to: {
    type: Date,
    default: ''
  },
  tags: Array,
  tweet: String,
  send_mail: {
    type: Number,
    default: 0
  },
  vip_store: {
    type: Number,
    default: 0
  },
  top_list: {
    type: Number,
    default: 0
  },
  home_list: {
    type: Number,
    default: 0
  },
  merchant_tc: String,
  merchant_tc_default: {
    type: Number,
    default: 0
  },
  youtube_video: String,
  youtube_video_id: String,
  satisfied_customers: {
    type: Number,
    default: 0
  },
  avg_payment_speed: String,
  auto_tracking_success: {
    type: Number,
    default: 0
  },
  manual_chase_possible: {
    type: Number,
    default: 0
  },
  manual_chase_required: {
    type: Number,
    default: 0
  },
  manual_chase_success_rate: {
    type: Number,
    default: 0
  },
  payment_performance: String,
  meta_title: String,
  meta_keywords: String,
  meta_description: String,
  off_disabled: {
    type: Number,
    default: 0
  },
  off_deleted: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('cashback_stores', CashbackStores);
