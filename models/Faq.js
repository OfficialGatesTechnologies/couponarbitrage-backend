const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const faqSchema = new Schema({

  faqCategory: {
    type: String,
    required: true
  },
  faqQuestion: {
    type: String,
    default: ''
  },
  faqAnswer: {
    type: String,
    default: ''
  },
  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('faq', faqSchema);
