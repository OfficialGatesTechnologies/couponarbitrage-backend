const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const BookmakerSchema = new Schema({
  bm_tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bookmaker_tags',
    required: true
  },
  bm_name: {
    type: String,
    required: true
  },
  bm_logo: {
    type: String,
    default: ''
  },
  bm_affiliate_link: {
    type: String,
    default: ''
  },
  bm_id: {
    type: Number,
    default: 0
  },
  bm_sharbs: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('bookmakers', BookmakerSchema, 'bookmakers');
