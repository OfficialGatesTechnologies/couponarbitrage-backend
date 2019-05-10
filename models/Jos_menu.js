const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const JosMenu = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  parent: {
    type: String,
    default: ''
  },
  access: {
    type: Number,
    default: 0
  },
  ordering: {
    type: Number,
    default: 0
  },
  imageFile: {
    type: String,
    default: ''
  },
  introtext: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  defaultMenuItem:{
    type: Number,
    default: 0
  },
  showInLandingPageMenu:{
    type: Number,
    default: 0
  },
  showInMenu:{
    type: Number,
    default: 0
  },
  defaultMenuItem:{
    type: Number,
    default: 0
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
  menuDisabled:{
    type: Number,
    default: 0
  },
  menuDeleted:{
    type: Number,
    default: 0
  }

}, { toJSON: { virtuals: true }});
JosMenu.virtual('submenus', {
  ref: 'jos_menu',  
  localField: '_id',  
  foreignField: 'parent',  
});

module.exports = mongoose.model('jos_menu', JosMenu, 'jos_menu');
