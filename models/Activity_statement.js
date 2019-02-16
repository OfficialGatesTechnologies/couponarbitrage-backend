const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const ActivityStatement = new Schema({

  activity_userid: {
    type: String,
    default: ''
  },
  activity_tableid: {
    type: String,
    default: ''
  },
  activity_name: {
    type: String,
    default: ''
  },
  activity_amount: {
    type: Number,
    default:0
  },
  activity_type: {
    type: String,  
    default: ''
  },
  activity_url: {
    type: String,
    default: ''
  },
  activity_refurl: {
    type: String,
    default:  ''
  }, activity_ip: {
    type: String,
    default: ''
  },
  activity_useragent: {
    type: String,
    default: 0
  },
  activity_status: {
    type: String,
    default: Date.now()
  },
  activity_view: {
    type: String,
    default: 0
  },
  activity_read: {
    type: Number,
    default: 0
  },
  activity_added: {
    type: Date,
    default: Date.now()
  },
  activity_disabled: {
    type: Number,
    default: 0
  },
  activity_deleted: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('activity_statement', ActivityStatement);
