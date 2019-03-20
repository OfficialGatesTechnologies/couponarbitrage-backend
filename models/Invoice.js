const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const InvoiceSchema = new Schema({
  invoice_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  invoice_for_id: {
    type: String,
    default: ''
  },
  invoice_for: {
    type: String,
    default: ''
  },
  invoice_amount: {
    type: Number,
    default: ''
  },
  invoice_from_date: {
    type: Date,
    default: ''
  },
  invoice_to_date: {
    type: Date,
    default: ''
  },
  invoice_num_term: {
    type: Number,
    default: ''
  },
  invoice_created: {
    type: Date,
    default: 0
  },
  invoice_status: {
    type: Number,
    default: ''
  }
});
module.exports = mongoose.model('invoice', InvoiceSchema);
