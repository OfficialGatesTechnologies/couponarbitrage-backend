const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const TagsSchema = new Schema({

  tagName: {
    type: String,
    required: true
  },
  
  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('tag', TagsSchema);
