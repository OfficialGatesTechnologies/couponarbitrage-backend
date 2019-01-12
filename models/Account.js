const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  brand: {
    type: String,
    required: true
  },
  account: {
    accountId: {
      type: String,
      unique: true,
      required: true
    },
    regDate: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: false    
    }    
  },
  accountEmail: {
    type: String,
    required: false
  },
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false
  }
});

const Account = mongoose.model('accounts', AccountSchema);

AccountSchema.pre('save', function (next) {
  Account.findOne({'account.accountId': this.account.accountId}, function (err, account) { 
    if(err) return next(err);      
    if(!account) {
      next();
    } else {
      return next(new Error("Account already exists"));
    }
  })
})



module.exports = mongoose.model('accounts', AccountSchema);
