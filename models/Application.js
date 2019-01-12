const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({ 

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        require: true
    },    
    accountEmailAddress: {
        type: String,
        required: true
    },   
    accountId: {
        type: String,
        required: true
    },    
    accountCurrency: {
        type: String,        
        required: false
    },
    brand: {
        type: String,
        required: true
    },
    linked: {
        type: Boolean,
        required: false,
        default: false
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    typeOfAccount: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },   
});


// ApplicationSchema.pre('findOneAndUpdate', function (next) {
//     const update = this._update;
//     console.log('update', Object.keys(update.$set).length) 
//     // console.log('commission: ',update.$set['account.commission'])
//     // console.log('commission is greater than 0: ',  update.$set['account.commission'] > 0)
//     // if ((Object.keys(update.$set).length) === 1) {
//     //     next();
//     // } else if((Object.keys(update.$set).length) === 5 && update.$set['account.commission'] > 0) {
//     //     next();
//     // } else {
//     //     next(new Error("Nothing to update"));
//     // }    
//     console.log('>>>>>', update)
//   });

const ApplicationSchemaT = mongoose.model('applications', ApplicationSchema);

ApplicationSchema.pre('save', function (next) {
    ApplicationSchemaT.findOne({accountId: this.accountId}, function (err, application) {
      if(err) return next(err); 
      else if(!application) {
        next();
      } else {
        next(new Error("Application already exists"));
      }
    })
  })
  

module.exports = mongoose.model('applications', ApplicationSchema);
