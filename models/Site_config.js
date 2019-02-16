const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const SiteConfig = new Schema({
  config_module: {
    type: String,
    default: ''
  },
  facebook_url: {
    type: String,
    default: ''
  },
  twitter_url: {
    type: String,
    default: ''
  },
  google_url: {
    type: String,
    default: ''
  },
  instagram_url: {
    type: String,
    default: ''
  },
  adwords_id: {
    type: String,
    default: ''
  },
  adwords_status: {
    type: String,
    default: ''
  },
  sbobet_cashback_fromdate: {
    type: Date,
    default: 0
  },
  sbobet_cashback_todate: {
    type: Date,
    default: 0
  },
  sbobet_cashback: {
    type: Number,
    default: 0
  },
  skrill_cashback_value: {
    type: Number,
    default:0
  },
  sbobet_cashback_value: {
    type: Number,
    default: 0
  },
  neteller_cashback_value: {
    type: Number,
    default: 0
  },
  ecopayz_cashback_value: {
    type: Number,
    default: 0
  },
  app_status: {
    type: String,
    default: ''
  },
  app_link: {
    type: String,
    default: ''
  },
  app_version: {
    type: String,
    default: ''
  }
});


module.exports = mongoose.model('site_config', SiteConfig);
