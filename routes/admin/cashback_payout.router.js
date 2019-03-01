const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getCashbackPauouts,
    getPayoutRowById,
    updatePayouts,
    getPayoutsToExport,
    rejectPayout,
    getTurnoverCashbackPayouts,
    getTurnoverPayoutRowById,
    updateTurnoverPayouts,
    getTurnoverPayoutsToExport,
    rejectTurnoverPayout
} = require('../../controllers/admin/cashback_payout.controller');

// cashback Payouts
router.get('/list', passport.authenticate('admin', {
    session: false
}), getCashbackPauouts);
router.get('/payout-row', passport.authenticate('admin', {
    session: false
}), getPayoutRowById);
router.post('/update-payout', passport.authenticate('admin', {
    session: false
}), updatePayouts);
router.post('/reject-payout', passport.authenticate('admin', {
    session: false
}), rejectPayout);
router.get('/export-payout', passport.authenticate('admin', {
    session: false
}), getPayoutsToExport);


// Turnover cashback Payouts
router.get('/turnover-list', passport.authenticate('admin', {
    session: false
}), getTurnoverCashbackPayouts);
router.get('/turnover-payout-row', passport.authenticate('admin', {
    session: false
}), getTurnoverPayoutRowById);
router.post('/update-turnover-payout', passport.authenticate('admin', {
    session: false
}), updateTurnoverPayouts);
router.get('/export-turnover-payout', passport.authenticate('admin', {
    session: false
}), getTurnoverPayoutsToExport);
router.post('/reject-turnover-payout', passport.authenticate('admin', {
    session: false
}), rejectTurnoverPayout);
module.exports = router;