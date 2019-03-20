const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const bannerSchema = new Schema({

  bannerFor: {
    type: String,
    default: ''
  },
  bannerTitle: {
    type: String,
    default: ''
  },
  bannerSubTitle: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  bannerImageFile: {
    type: String,
    default: ''
  },
  bannerAdded: {
    type: Date,
    default: Date.now()
  },
  bannerDisabled: {
    type: Number,
    default: 0
  },
  bannerDeleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('banner', bannerSchema);
