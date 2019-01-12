const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({ 
    status: {
        type: String,
        required: true
    },
    cashback: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },   
    accountId: {
        type: String,
        required: true
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reports',
        required: false
    }    
});

module.exports = mongoose.model('payments', PaymentSchema);
