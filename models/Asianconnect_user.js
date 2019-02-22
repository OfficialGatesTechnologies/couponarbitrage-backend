const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const AsianconnectUser = new Schema({

  asianconnectId: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  pendingAmount: {
    type: Number,
    default: ''
  },
  paidAmount: {
    type: Number,
    default: 0
  },
});


module.exports = mongoose.model('asianconnect_users', AsianconnectUser);
