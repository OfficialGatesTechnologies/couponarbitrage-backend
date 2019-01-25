const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CashbackSites = new Schema({

  name: {
    type: String,
    required: true
  },
  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('cashback_sites', CashbackSites);
