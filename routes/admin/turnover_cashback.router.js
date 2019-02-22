const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    uploadCashbacks, 
    getSkrillCashbacks,
    updateSkrillUser,
    getSkrillDetails,
    updateCashbackStatus,
    updateUserAward,
    exportSkrillCashbacks,
    uploadSbobetCashbacks,
    getSbobetCashbacks,
    updateSbobetUser,
    getSbobetDetails,
    exportSbobetCashbacks,
    updateSbobetAsPending,
    updateSbobetAsPaid,
    uploadNetellerCashbacks,
    getNetellerCashbacks,
    updateNetellerUser,
    getNetellerDetails,
    exportNetellerCashbacks,
    updateNetellerAsPending,
    updateNetellerAsPaid,
    uploadAsianconnectCashbacks,
    getAsianconnectCashbacks,
    updateAsianconnectUser,
    getAsianconnectDetails,
    exportAsianconnectCashbacks,
    updateAsianconnectAsPaid,
    updateAsianconnectAsPending,
    uploadEcopayCashbacks,
    getEcopayCashbacks,
    updateEcopayUser,
    getEcopayDetails,
    exportEcopayCashbacks,
    updateEcopayCashbackStatus
} = require('../../controllers/admin/turnover_cashback.controller');
router.get('/skrill-cashbacks', passport.authenticate('admin', {
    session: false
}), getSkrillCashbacks);
router.post('/upload-data', passport.authenticate('admin', {
    session: false
}), uploadCashbacks);
router.post('/update-skrill-user', passport.authenticate('admin', {
    session: false
}), updateSkrillUser);
router.get('/skrill-cashbacks-details', passport.authenticate('admin', {
    session: false
}), getSkrillDetails);
router.post('/update-skrill-cb-status', passport.authenticate('admin', {
    session: false
}), updateCashbackStatus);
router.post('/update-award', passport.authenticate('admin', {
    session: false
}), updateUserAward);
router.get('/export-skrill-cashbacks', passport.authenticate('admin', {
    session: false
}), exportSkrillCashbacks);

/** SBObet  */
router.post('/upload-sbobet-data', passport.authenticate('admin', {
    session: false
}), uploadSbobetCashbacks);
router.get('/sbobet-cashbacks', passport.authenticate('admin', {
    session: false
}), getSbobetCashbacks);
router.post('/update-sbobet-user', passport.authenticate('admin', {
    session: false
}), updateSbobetUser);
router.get('/sbobet-cashbacks-details', passport.authenticate('admin', {
    session: false
}), getSbobetDetails);
router.get('/export-sbobet-cashbacks', passport.authenticate('admin', {
    session: false
}), exportSbobetCashbacks);
router.post('/update-sbobet-paid', passport.authenticate('admin', {
    session: false
}), updateSbobetAsPaid);
router.post('/update-sbobet-pending', passport.authenticate('admin', {
    session: false
}), updateSbobetAsPending);

/** Neteller  */
router.post('/upload-neteller-data', passport.authenticate('admin', {
    session: false
}), uploadNetellerCashbacks);
router.get('/neteller-cashbacks', passport.authenticate('admin', {
    session: false
}), getNetellerCashbacks);
router.post('/update-neteller-user', passport.authenticate('admin', {
    session: false
}), updateNetellerUser);
router.get('/neteller-cashbacks-details', passport.authenticate('admin', {
    session: false
}), getNetellerDetails);
router.get('/export-neteller-cashbacks', passport.authenticate('admin', {
    session: false
}), exportNetellerCashbacks);
router.post('/update-neteller-paid', passport.authenticate('admin', {
    session: false
}), updateNetellerAsPaid);
router.post('/update-neteller-pending', passport.authenticate('admin', {
    session: false
}), updateNetellerAsPending);

/** Asianconnect  */
router.post('/upload-asianconnect-data', passport.authenticate('admin', {
    session: false
}), uploadAsianconnectCashbacks);
router.get('/asianconnect-cashbacks', passport.authenticate('admin', {
    session: false
}), getAsianconnectCashbacks);
router.post('/update-asianconnect-user', passport.authenticate('admin', {
    session: false
}), updateAsianconnectUser);
router.get('/asianconnect-cashbacks-details', passport.authenticate('admin', {
    session: false
}), getAsianconnectDetails);
router.get('/export-asianconnect-cashbacks', passport.authenticate('admin', {
    session: false
}), exportAsianconnectCashbacks);
router.post('/update-asianconnect-paid', passport.authenticate('admin', {
    session: false
}), updateAsianconnectAsPaid);
router.post('/update-asianconnect-pending', passport.authenticate('admin', {
    session: false
}), updateAsianconnectAsPending);

/** Ecopayz  */
router.get('/ecopay-cashbacks', passport.authenticate('admin', {
    session: false
}), getEcopayCashbacks);
router.post('/upload-ecopay-data', passport.authenticate('admin', {
    session: false
}), uploadEcopayCashbacks);
router.post('/update-ecopay-user', passport.authenticate('admin', {
    session: false
}), updateEcopayUser);
router.get('/ecopay-cashbacks-details', passport.authenticate('admin', {
    session: false
}), getEcopayDetails);
router.post('/update-ecopay-cb-status', passport.authenticate('admin', {
    session: false
}), updateEcopayCashbackStatus);
router.get('/export-ecopay-cashbacks', passport.authenticate('admin', {
    session: false
}), exportEcopayCashbacks);

module.exports = router; 