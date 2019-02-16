const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    updateUserAccount,
    getUserAccounts,
    createUserAccount,
    updateUserStatus,
    getUserRowById,
    getUserTrackingList,
    getUserTrackingHistory,
    getUserTurnoverReg,
    updateTurnoverReg,
    getUserInterested,
    updateUserInterested,
    getUserAccountsToExport,
    searchUsers
} = require('../../controllers/admin/user.controller');

router.post('/update-useraccount', passport.authenticate('admin', {
    session: false
}), updateUserAccount);
router.post('/create-user', passport.authenticate('admin', {
    session: false
}), createUserAccount);

router.get('/list', passport.authenticate('admin', {
    session: false
}), getUserAccounts);
router.get('/export-user', passport.authenticate('admin', {
    session: false
}), getUserAccountsToExport);
router.post('/update-accounts', passport.authenticate('admin', {
    session: false
}), updateUserStatus);
router.get('/search-users', passport.authenticate('admin', {
    session: false
}), searchUsers);
router.get('/user-row', passport.authenticate('admin', {
    session: false
}), getUserRowById);
router.get('/user-tracking', passport.authenticate('admin', {
    session: false
}), getUserTrackingList);
router.get('/user-tracking-history', passport.authenticate('admin', {
    session: false
}), getUserTrackingHistory);
router.get('/turnover-registration', passport.authenticate('admin', {
    session: false
}), getUserTurnoverReg);

router.post('/update-turnover-registration', passport.authenticate('admin', {
    session: false
}), updateTurnoverReg)
router.get('/user-intrested', passport.authenticate('admin', {
    session: false
}), getUserInterested)
router.post('/update-user-intrested', passport.authenticate('admin', {
    session: false
}), updateUserInterested)
module.exports = router;