const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const EcopayzUsers = new Schema({
  ecopayzId: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  updated_date: {
    type: Date,
    default: Date.now()
  },
  make_payout: {
    type: Number,
    default: 0
  },
  total_amount:{
    type: Number,
    default: 0
  },
  site_commission:{
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('ecopayz_users', EcopayzUsers);
