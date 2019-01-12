const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({ 
    monthId: {
        type: String,
        required: true
    },
    periodId: {
        type: String,
        required: true
    }, 
    brand: {
        type: String,
        required: true
    },
    account: {
        accountId: {
            type: String,
            required: true
        },        
        deposits: {
            type: Number,
            required: true
        },
        transValue: {
            type: Number,
            required: true
        },
        commission: {
            type: Number,
            required: true
        },
        cashback: {
            type: Number,
            required: true
        },
        cashbackRate: {
            type: String,
            required: true
        }
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },    
    paymentEmail: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
        required: false
    }, 
    belongsToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false 
    } 
});

ReportSchema.pre('findOneAndUpdate', function (next) {
    const update = this._update;
    // console.log('update',update) 
    // console.log(Object.keys(update.$set).length)
    // console.log('commission: ',update.$set['account.commission'])
    // console.log('commission is greater than 0: ',  update.$set['account.commission'] > 0)
    if ((Object.keys(update.$set).length) === 1) {
        next();
    } else if((Object.keys(update.$set).length) === 5 && update.$set['account.commission'] > 0) {
        next();
    } else if((Object.keys(update.$set).length) === 6 && update.$set['paymentEmail']) {
        next();
    } else if((Object.keys(update.$set).length) === 6 && update.$set['status'] === 'Confirmed') {
        next();
    } else if((Object.keys(update.$set).length) === 4 && update.$set['status'] === 'Paid') {
        next();
    } else if((Object.keys(update.$set).length) === 4 && update.$set['account.commission'] > 0) {
        next();
    } else {
        next(new Error("Nothing to update on this report"));
    }    
  });

const ReportT = mongoose.model('reports', ReportSchema);

ReportSchema.pre('save', function (next) {
  ReportT.findOne({'account.accountId': this.account.accountId, 'monthId': this.monthId}, function (err, report) {
    //   console.log('here', report)
    if(err) return next(err); 
    else if(!report) {
      next();
    } else {
      next(new Error("Report already exists"));
    }
  })
})




module.exports = mongoose.model('reports', ReportSchema);
