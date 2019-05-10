const passport = require('passport');
require('../config/passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getCashbackCliams,
    getRevenueCashbackCliams,
    getSkrillCashbacks
} = require('../controllers/accounts.controller');


// cashback caregorie
router.get('/stats', passport.authenticate('jwt', {
    session: false
}), getDashboardStats);
router.get('/cb-earnings', passport.authenticate('jwt', {
    session: false
}), getCashbackCliams);
router.get('/rcb-earnings', passport.authenticate('jwt', {
    session: false
}), getRevenueCashbackCliams);
router.get('/skrill-earnings', passport.authenticate('jwt', {
    session: false
}), getSkrillCashbacks);



module.exports = router;