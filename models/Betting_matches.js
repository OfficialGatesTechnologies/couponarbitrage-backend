const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bettingMatchesSchema = new Schema({
  match_cid: {
    type: Number,
    default: 0
  },
  match_id: {
    type: Number,
    default: 0
  },
  match_hometeam: {
    type: String,
    default: ''
  },
  match_awayteam: {
    type: String,
    default: ''
  },
  match_timeplayed: {
    type: String,
    default: ''
  },
  match_time: {
    type: String,
    default: ''
  },
  match_deleted: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('betting_matches', bettingMatchesSchema);