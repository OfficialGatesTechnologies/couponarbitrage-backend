const passport = require('passport');
require('../config/passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getCashbackCliams,
    getRevenueCashbackCliams,
    getSkrillCashbacks,
    getSBOBetCashbacks,
    getNetellerCashbacks,
    getAssianConnectCashbacks,
    getEcopayzCashbacks,
    requestPayout,
    requestTurnoverPayout,
    updatePaymentDetails,
    updateUserAccount,
    getUserActivities,
    getAffilatesStats
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
router.get('/sbobet-earnings', passport.authenticate('jwt', {
    session: false
}), getSBOBetCashbacks);
router.get('/neteller-earnings', passport.authenticate('jwt', {
    session: false
}), getNetellerCashbacks);
router.get('/assianconnect-earnings', passport.authenticate('jwt', {
    session: false
}), getAssianConnectCashbacks);
router.get('/ecopayz-earnings', passport.authenticate('jwt', {
    session: false
}), getEcopayzCashbacks);
router.post('/payout-request', passport.authenticate('jwt', {
    session: false
}), requestPayout);
router.post('/turnover-payout-request', passport.authenticate('jwt', {
    session: false
}), requestTurnoverPayout);
router.post('/update-payment-details', passport.authenticate('jwt', {
    session: false
}), updatePaymentDetails);
router.post('/update-account', passport.authenticate('jwt', {
    session: false
}), updateUserAccount);
router.get('/user-activities', passport.authenticate('jwt', {
    session: false
}), getUserActivities);
router.get('/affilates-stats', getAffilatesStats);
module.exports = router;