const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackCategories = new Schema({

  cat_parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_menu',
    required: true
  },
  cat_title: {
    type: String,
    required: true
  },
  cat_url: String,
  cat_desc: String,
  cat_disabled: {
    type: Number,
    default: 0
  },
  cat_deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('cashback_caregories', CashbackCategories);
