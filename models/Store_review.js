const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const storeReview = new Schema({

  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cashback_stores',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  rating: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ""
  },
  comments: {
    type: String,
    default: ""
  },
  status: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default:Date.now()
  }


});


module.exports = mongoose.model('store_review', storeReview);
