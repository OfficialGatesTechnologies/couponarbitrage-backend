const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const userPlanSubscription = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jos_user',
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'betting_plan',
  },
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
  plan_duration: {
    type: Number,
    default: 0
  },
  plan_duration_type: {
    type: String,
    default: ''
  },
  subscribed_on: {
    type: Date,
    default: 0
  },
  cancelled_on: {
    type: Date,
    default: 0
  },
  paypal_profile_id: {
    type: String,
    default: ''
  },
  paypal_profile_status: {
    type: String,
    default: ''
  },
  plan_paymentmethod: {
    type: String,
    default: ''
  },
  payment_status: {
    type: Number,
    default: ''
  },
  comment: {
    type: String,
    default: ''
  },
  payment_pending_email: {
    type: String,
    default: ''
  },
  plan_expire_email: {
    type: String,
    default: ''
  },
  expired_on: {
    type: Date,
    default: ''
  },
  plan_deleted: {
    type: Number,
    default: 0
  },
  profile_created: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model('user_plan_subscription', userPlanSubscription, 'user_plan_subscription');
