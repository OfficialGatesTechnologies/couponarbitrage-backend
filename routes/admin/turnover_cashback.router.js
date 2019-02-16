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
    
    uploadNetellerCashbacks,
    getNetellerCashbacks,
    updateNetellerUser,
    getNetellerDetails

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
module.exports = router;