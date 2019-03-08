const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const bettingExoticSchema = new Schema({
  exodds_cid: {
    type: Number,
    default: 0
  },
  exodds_type: {
    type: Number,
    default: 0
  },
  exodds_matchid: {
    type: Number,
    default: 0,
    
  },
  exodds_pn: {
    type: Number,
    default: 0
  },
  exodds_bmid: {
    type: Number,
    default: 0
  },
  exodds_market: {
    type: Number,
    default: 0
  },
  exodds_sel: {
    type: String,
    default: ''
  },
  exodds_ho: {
    type: Number,
    default: 0
  },
  exodds_xo: {
    type: Number,
    default: 0
  },
  exodds_ao: {
    type: Number,
    default: 0
  },
  lastwrite: {
    type: Date,
    default: 0
  },
  hasarb: {
    type: Number,
    default: 0
  }
}, { toJSON: { virtuals: true }});

bettingExoticSchema.virtual('markets', {
  ref: 'betting_markets',  
  localField: 'exodds_market',  
  foreignField: 'market_id',  
  justOne: true,  
});
bettingExoticSchema.virtual('bookmakers', {
  ref: 'bookmakers',  
  localField: 'exodds_bmid',  
  foreignField: 'bm_id',  
  justOne: true,  
});
module.exports = mongoose.model('betting_exotic', bettingExoticSchema, 'betting_exotic');
