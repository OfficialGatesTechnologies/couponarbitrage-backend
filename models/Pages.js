const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const pageSchema = new Schema({
 
  pageTitle: {
    type: String,
    default: ''
  },
  pageUrl: {
    type: String,
    default: ''
  },
  pageIsStatic: {
    type: String,
    default: ''
  },
  pageContent: {
    type: String,
    default: ''
  },
  pageType: {
    type: Number,
    default: ''
  },
  pageAdded: {
    type: Date,
    default: ''
  },
  pageUpdated: {
    type: Number,
    default: ''
  },
  pageMetaTitle: {
    type: String,
    default: ''
  },
  pageMetaKeywords: {
    type: String,
    default: ''
  },
  pageMetaDescription: {
    type: String,
    default: ''
  },
  pageMetaRobots: {
    type: String,
    default: ''
  },
  pageMetaTags: {
    type: String,
    default: ''
  },
  pageDisabled: {
    type: Number,
    default: ''
  },
  pageDeleted: {
    type: Number,
    default: ''
  }

});
module.exports = mongoose.model('pages', pageSchema,'pages');
