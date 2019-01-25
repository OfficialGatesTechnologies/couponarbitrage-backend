const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const AffiliateNetwork = new Schema({

  title: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    default: ''
  },
  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('affiliate_network', AffiliateNetwork);
