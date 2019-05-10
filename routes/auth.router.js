const passport = require('passport');
require('../config/passport')(passport);
const express = require('express');
const router = express.Router();
const {
    checkAuthentication,
    createUserAccount,
    userLogin,
    forgotPass,
    resetPass
} = require('../controllers/auth.controller');

router.get('/check-auth', passport.authenticate('jwt', {
    session: false
}), checkAuthentication);

router.post('/register', createUserAccount);
router.post('/login', userLogin);
router.post('/forgot-password', forgotPass);
router.post('/reset-password', resetPass);

module.exports = router;