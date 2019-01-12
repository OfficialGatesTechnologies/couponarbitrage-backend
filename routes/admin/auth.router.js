const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    checkAuthentication,
    createNewAdmin,
    adminLogin,
    forgotPass,
    resetPass
} = require('../../controllers/admin/auth.controller');

router.get('/check-auth', passport.authenticate('admin', {
    session: false
}), checkAuthentication);

router.post('/register', createNewAdmin);

router.post('/login', adminLogin);

router.post('/forgot-password', forgotPass);

router.post('/reset-password', resetPass);

module.exports = router;