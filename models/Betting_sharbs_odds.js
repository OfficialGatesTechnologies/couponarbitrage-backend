const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bettingSharbsOddSchema = new Schema({
  odds_cid: {
    type: Number,
    default: 0
  },
  odds_matchid: {
    type: Number,
    default: 0
  },
  odds_bmid: {
    type: Number,
    default: 0
  },
  odds_market: {
    type: Number,
    default: 0
  },
  odds_bm_market: {
    type: Number,
    default: 0
  },
  odds_pn: {
    type: Number,
    default: 0
  },
  odds_sel: {
    type: String,
    default: ''
  },
  odds_sel_val: {
    type: String,
    default: ''
  },
  odds_bmid: {
    type: Number,
    default: 0
  },
  odds_ho: {
    type: Number,
    default: 0
  },
  odds_xo: {
    type: Number,
    default: 0
  },
  odds_ao: {
    type: Number,
    default: 0
  },
  odds_events: {
    type: String,
    default: ''
  },
  odds_ho_old: {
    type: Number,
    default: 0
  },
  odds_xo_old: {
    type: Number,
    default: 0
  },
  odds_ao_old: {
    type: Number,
    default: 0
  },
  odds_tag: {
    type: String,
    default: ''
  },
  odds_tag_color: {
    type: String,
    default: ''
  },
  odds_active: {
    type: Number,
    default: 0
  },
  odds_last_updated: {
    type: Date,
    default: ''
  },
  hasarb: {
    type: Number,
    default: 0
  }
}, { toJSON: { virtuals: true } });
bettingSharbsOddSchema.virtual('matches', {
  ref: 'betting_matches',
  localField: 'odds_matchid',
  foreignField: 'match_id',
  justOne: true,
});
bettingSharbsOddSchema.virtual('competition', {
  ref: 'betting_competition',
  localField: 'odds_cid',
  foreignField: 'c_id',
  justOne: true,
});

module.exports = mongoose.model('betting_sharbs_odds', bettingSharbsOddSchema);