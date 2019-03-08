const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const BookmakerTagsSchema = new Schema({

  tagName: {
    type: String,
    required: true
  },
  diabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  }


});


module.exports = mongoose.model('bookmaker_tags', BookmakerTagsSchema);
