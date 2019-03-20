const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const bettingSharbsDocument = new Schema({
  sharbsDocId: {
    type: String,
    default: ""
  },
  sharbsDocName: {
    type: String,
    default: ""
  },
  sharbsDocBmid: {
    type: Number,
    default: 0,    
  },
  sharbsDocCount: {
    type: Number,
    default: 0,    
  },
  sharbsDocType: {
    type: String,
    default: ""
  },
  sharbsDocAdded: {
    type: Date,
    default: Date.now()
  },
  sharbsDocAddedTime: {
    type: Number,
    default: Date.now()
  },
  sharbsDocDeleted: {
    type: Number,
    default: 0
  }
}, { toJSON: { virtuals: true } });

bettingSharbsDocument.virtual('bookmaker', {
  ref: 'bookmakers',
  localField: 'sharbsDocBmid',
  foreignField: 'bm_id',
  justOne: true,
});
bettingSharbsDocument.virtual('pendingCount', {
  ref: 'betting_sharbs_odds',
  localField: '_id',
  foreignField: 'odds_docid',
  justOne: false,
});
bettingSharbsDocument.virtual('completedCount', {
  ref: 'betting_sharbs_odds',
  localField: '_id',
  foreignField: 'odds_docid',
  justOne: false,
});
module.exports = mongoose.model('betting_sharbs_document', bettingSharbsDocument, 'betting_sharbs_document');
