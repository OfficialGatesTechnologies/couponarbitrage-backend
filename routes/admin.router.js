const express = require('express');
const router = express.Router();
const authRouter = require('./admin/auth.router');
const accountRouter = require('./admin/account.router');
const userRouter = require('./admin/user.router');

// routes
router.use('/auth', authRouter);

router.use('/account', accountRouter);
router.use('/user', userRouter);
 

module.exports = router;
