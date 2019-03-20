const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const bettingPlan = new Schema({
  plan_duration_upto: {
    type: Number,
    default: 0
  },
  plan_duration_type_upto: {
    type: String,
    default: ''
  },
  plan_name: {
    type: String,
    required: true
  },
  plan_description: {
    type: String,
    default: ''
  },
  plan_price: {
    type: String,
    default: ''
  },
  plan_discount: {
    type: Number,
    default: 0
  },
  plan_duration: {
    type: Number,
    default: 0
  },
  plan_duration_type: {
    type: String,
    default: ''
  },
  plan_features: {
    type: Array,
    default: ''
  },
  plan_status: {
    type: Number,
    default: 0
  },
  plan_updated: {
    type: String,
    default: ''
  },
  plan_deleted: {
    type: Number,
    default: 0
  },
  

});

module.exports = mongoose.model('betting_plan', bettingPlan, 'betting_plan');
