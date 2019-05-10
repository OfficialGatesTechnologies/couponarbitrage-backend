const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const ExitClicks = new Schema({

  click_userId: {
    type: String,
    required: true
  },
  click_network_id: {
    type: String,
    default: ''
  },
  click_store_id: {
    type: String,
    default: ''
  },
  click_offer_id: {
    type: String,
    default: ''
  },
  click_date: {
    type: Date,
    default: Date.now()
  }


});


module.exports = mongoose.model('exit_clicks', ExitClicks);
