const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bettingCompetitionSchema = new Schema({
  c_id: {
    type: Number,
    default: 0
  },
  c_name: {
    type: String,
    default: ''
  },
  c_sport: {
    type: String,
    default: ''
  },
  c_country: {
    type: String,
    default: ''
  },
  c_league: {
    type: String,
    default: ''
  },
  c_leaguerank: {
    type: Number,
    default: 0
  },
  fetched: {
    type: Number,
    default: 0
  },
  c_active: {
    type: Number,
    default: 0
  },
  last_fetched: {
    type: String,
    default: 0
  },
  c_updated: {
    type: Number,
    default: 0
  },
  
});

module.exports = mongoose.model('betting_competition', bettingCompetitionSchema);