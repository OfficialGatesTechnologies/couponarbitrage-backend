const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bettingMarketsSchema = new Schema({
 market_id: {
    type: Number,
    default: 0
  },
  market_name: {
    type: String,
    default: ''
  },
  
});

module.exports = mongoose.model('betting_markets', bettingMarketsSchema);