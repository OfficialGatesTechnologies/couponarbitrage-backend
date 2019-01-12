const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
 

const EmailTemplate = new Schema({
  template_name: {
        type: String,
        required: true
    },
    template_subject: {
      type: String,
      required: true
    },
    template_content: {
      type: String,
      
      required: true      
    },
   
});


module.exports = mongoose.model('email_template', EmailTemplate);
  