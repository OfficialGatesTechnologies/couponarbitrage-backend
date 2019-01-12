const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    updateUserAccount,
    getUserAccounts,
    createUserAccount,
    updateUserStatus,
    getUserRowById
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
router.post('/update-accounts', passport.authenticate('admin', {
    session: false
}), updateUserStatus);

router.get('/user-row', passport.authenticate('admin', {
    session: false
}), getUserRowById);

module.exports = router;