const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const turnoverRegistration = new Schema({
 
  registrationType: {
    type: String,
    required: true
  },
  
  registrationAccountName: {
    type: String,
    required: true
  },
  registrationAccountEmail: {
    type: String,
    required: true
  },
  registrationAccountId: {
    type: String,
    default: 0
  },
  
  registrationCurrency: {
    type: String,
    required: true
  },
  customer_type: {
    type: Number,
    required: true
  },
  registrationApproved: {
    type: Number,
    required: true
  },
  registrationAdded: {
    type: Date,
    default: Date.now()
  },
  
});
module.exports = mongoose.model('turnover_registration', turnoverRegistration,'turnover_registration');
