const express = require('express');
const router = express.Router();
const authRouter = require('./admin/auth.router');
const accountRouter = require('./admin/account.router');
const userRouter = require('./admin/user.router');
const cashbackOfferRouter = require('./admin/cashback_offer.router');
const claimsRouter = require('./admin/cashback_claims.router');
const turnCashbackRouter = require('./admin/turnover_cashback.router');
const cashbackPayoutRouter = require('./admin/cashback_payout.router');
const masterdataRouter = require('./admin/masterdata.router');
const menuRouter = require('./admin/menu.router');
const articleRouter = require('./admin/articles.router');
const bookmakerRouter = require('./admin/bookmaker.router');

// routes
router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/user', userRouter);
router.use('/cashback-offer', cashbackOfferRouter);
router.use('/cashback-claims', claimsRouter);
router.use('/turnover-cashback', turnCashbackRouter);
router.use('/cashback-payouts', cashbackPayoutRouter);
router.use('/masterdata', masterdataRouter);
router.use('/menu', menuRouter);
router.use('/article', articleRouter);
router.use('/bookmaker', bookmakerRouter);
module.exports = router;
