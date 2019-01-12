const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    updateAdminAccount,
    getAdminAccounts,
    createAdminAccount,
    updateAdminStatus,
    getAdminRowById
} = require('../../controllers/admin/account.controller');

router.post('/update-myaccount', passport.authenticate('admin', {
    session: false
}), updateAdminAccount);
router.post('/create-admin', passport.authenticate('admin', {
    session: false
}), createAdminAccount);

router.get('/list', passport.authenticate('admin', {
    session: false
}), getAdminAccounts);
router.post('/update-accounts', passport.authenticate('admin', {
    session: false
}), updateAdminStatus);

router.get('/admin-row', passport.authenticate('admin', {
    session: false
}), getAdminRowById);

module.exports = router;