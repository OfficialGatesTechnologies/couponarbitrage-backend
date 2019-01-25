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
    ref: 'affiliate_networks',
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
    required: true
  },
  details_default: Number,
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
  vaild_from: Number,
  valid_to: Number,
  tags: String,
  tweet: String,
  send_mail: Number,
  vip_store: Number,
  top_list: Number,
  home_list: Number,
  merchant_tc: String,
  merchant_tc_default: Number,
  youtube_video: String,
  youtube_video_id: String,
  satisfied_customers: Number,
  avg_payment_speed: String,
  auto_tracking_success: Number,
  manual_chase_possible: Number,
  manual_chase_required: Number,
  manual_chase_success_rate: Number,
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
