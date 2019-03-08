const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const bettingLayunovoddsSchema = new Schema({
  layunov_cid: {
    type: Number,
    default: 0
  },
  layunov_matchid: {
    type: Number,
    default: 0
  },
  layunov_bmid: {
    type: Number,
    default: 0
  },
  layunov_uos: {
    type: Number,
    default: 0
  },
  layunov_uo: {
    type: Number,
    default: 0
  },
  layunov_oo: {
    type: Number,
    default: 0
  },
  layunov_lastwrite: {
    type: Date,
    default: 0
  },
  layunov_lasttimeplayed: {
    type: Number,
    default: 0
  }
}, { toJSON: { virtuals: true }});
bettingLayunovoddsSchema.virtual('bookmakers', {
  ref: 'bookmakers',  
  localField: 'layunov_bmid',  
  foreignField: 'bm_id',  
  justOne: true,  
});
module.exports = mongoose.model('betting_layunovodds', bettingLayunovoddsSchema, 'betting_layunovodds');
