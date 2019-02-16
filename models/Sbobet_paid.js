const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const SBObetPaid = new Schema({

  sbobetId: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  amount: {
    type: Number,
    default: ''
  },
  paidOn: {
    type: Date,
    default: 0
  },


});


module.exports = mongoose.model('Sbobet_paid', SBObetPaid);
