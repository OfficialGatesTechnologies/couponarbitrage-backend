const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  name: {
      type: String,
      default: ''
  },
  last_name: {
      type: String,
      default: ''
  },
  username: {
      type: String,
      default: ''
  },
  email: {
      type: String,
      default: ''
  },
  password: {
      type: String,
      default: ''
  },
  usertype: {
      type: String,
      default: ''
  },
  block: {
      type: Number,
      default: 0
  },
  sendEmail: {
      type: Number,
      default: 0
  },
  gid: {
      type: Number,
      default: 1
  },
  gcmId: {
      type: String,
      default: ''
  },
  iosGcmId: {
      type: String,
      default: ''
  },
  registerDate: {
      type: Date,
      default: Date.now()
  },
  lastvisitDate: {
      type: Date,
      default: Date.now()
  },
  activation: {
      type: String,
      default: ''
  },
  ecopayzAccountId: {
      type: String,
      default: ''
  },
  moneyBookerId: {
      type: String,
      default: ''
  },
  moneyBookerBonus: {
      type: Number,
      default: 0
  },
  moneyBookerIdAdded: {
      type: Date,
      default: Date.now()
  },
  moneyBookerAwardto: {
      type: Number,
      default: 0
  },
  accountCountry: {
      type: String,
      default: ''
  },
  accountPhone: {
      type: String,
      default: ''
  },
  accountAddress: {
      type: String,
      default: ''
  },
  accountGender: {
      type: String,
      default: ''
  },
  accountDob: {
      type: Date,
      default: ''
  },
  bankAccountName: {
      type: String,
      default: ''
  },
  bankAccountSortCode: {
      type: String,
      default: ''
  },
  bankAccountNumber: {
      type: String,
      default: ''
  },
  accountPaypalEmail: {
      type: String,
      default: ''
  },
  accountSkrillEmail: {
      type: String,
      default: ''
  },
  accountNetellerEmail: {
      type: String,
      default: ''
  },
  accountReferrence: {
      type: String,
      default: ''
  },
  referred_by: {
      type: String,
      default: ''
  },
  referrdapp_by: {
      type: String,
      default: ''
  },

  accessPrivilege: {
      type: String,
      default: ''
  },
  accessModule: {
      type: String,
      default: ''
  },
  accountLastUpdateTime: {
      type: Date,
      default: Date.now()
  },
  accountSharbsLastUpdateTime: {
      type: Date,
      default: Date.now()
  },
  accountLatestLoginTime: {
      type: Date,
      default: Date.now()
  },
  accountLatestLoginIP: {
      type: String,
      default: ''
  },
  accountLatestLoginUA: {
      type: String,
      default: ''
  },
  accountLoginCount: {
      type: Number,
      default: 0
  },
  accountDeleted: {
      type: Number,
      default: 0
  },
  accountLoginState: {
      type: String,
      default: ''
  },
  offerSentDate: {
      type: Date,
      default: Date.now()
  },
  unsubscribe: {
      type: Number,
      default: 0
  },
  planId: {
      type: Number,
      default: 0
  },
  paymentStatus: {
      type: Number,
      default: 0
  },
  vipmail: {
      type: Number,
      default: 0
  },
  uservip: {
      type: Number,
      default: 0
  },
  cutodds_auth: {
      type: Number,
      default: 0
  },
  user_oauth_provider: {
      type: String,
      default: ''
  },
  epiCode:{
    type: String,
    default: ''
  },
  user_oauth_id: {
      type: String,
      default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('jos_user', UserSchema);
