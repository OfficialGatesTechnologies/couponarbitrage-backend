const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const Articles = new Schema({
  title: {
    type: String,
    required: true
  },
  title_alias: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  sub_title: {
    type: String,
    default: ''
  },
  short_description: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  imageFile: {
    type: String,
    default: ''
  },
  metatitle: {
    type: String,
    default: ''
  },
  metakey: {
    type: String,
    default: ''
  },
  metadesc: {
    type: String,
    default: ''
  },
  metadata: {
    type: String,
    default: ''
  },
  added: {
    type: Date,
    default: Date.now()
  },
  disabled:{
    type: Number,
    default: 0
  },
  deleted:{
    type: Number,
    default: 0
  }

}, { toJSON: { virtuals: true } });
Articles.virtual('parentRow', {
  ref: 'jos_menu',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
});
module.exports = mongoose.model('articles', Articles, 'articles');
