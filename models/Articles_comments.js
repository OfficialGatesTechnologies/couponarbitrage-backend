const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const ArticleComments = new Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'articles',
    required: true
  },
  commentParentId: {
    type: String,
    default: ''
  },
  commentName: {
    type: String,
    required: true
  },
  commentEmail: {
    type: String,
    default: ''
  },
  commentWebsite: {
    type: String,
    default: ''
  },
  commentDesc: {
    type: String,
    default: ''
  },
  commentFollowNotify: {
    type: String,
    default: ''
  },
  commentNewNotify: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  commentApproved: {
    type: Number,
    default: 0
  },
  commentAdded: {
    type: Date,
    default: Date.now()
  },
  commentDisabled:{
    type: Number,
    default: 0
  },
  commentDeleted:{
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model('comments', ArticleComments, 'comments');
