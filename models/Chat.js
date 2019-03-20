const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const chatSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  message: {
    type: String,
    default: ''
  },
  user_agent: {
    type: String,
    default: ''
  },
  ip: {
    type: Number,
    default: ''
  },
  created_on: {
    type: Date,
    default: ''
  },
  deleted_on: {
    type: Number,
    default: ''
  }
});
module.exports = mongoose.model('chat', chatSchema,'chat');
