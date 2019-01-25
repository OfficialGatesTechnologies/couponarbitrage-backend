const express = require('express');
const router = express.Router();
const authRouter = require('./admin/auth.router');
const accountRouter = require('./admin/account.router');
const userRouter = require('./admin/user.router');
const cashbackOfferRouter = require('./admin/cashback_offer.router');
const masterdataRouter = require('./admin/masterdata.router');
const menuRouter = require('./admin/menu.router');

// routes
router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/user', userRouter);
router.use('/cashback-offer', cashbackOfferRouter);
router.use('/masterdata', masterdataRouter);
router.use('/menu', menuRouter);

module.exports = router;
