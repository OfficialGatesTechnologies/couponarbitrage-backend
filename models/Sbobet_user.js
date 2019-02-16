const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const SBObetUser = new Schema({

 sbobetId: {
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


module.exports = mongoose.model('Sbobet_users', SBObetUser);
