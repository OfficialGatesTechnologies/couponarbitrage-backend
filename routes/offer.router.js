const passport = require('passport');
require('../config/passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getCashbackStores,
    getCashbackCategories,
    getStoreRowByUrl,
    getOfferRowById,
    trackCashback,
    cliamCashback,
    postReview
} = require('../controllers/cashback_store.controller');

router.get('/offer-list', getCashbackStores);
router.get('/cashback-cats', getCashbackCategories);
router.get('/store-row', getStoreRowByUrl);
router.get('/offer-row', getOfferRowById);
router.get('/track-cashback', passport.authenticate('jwt', {
    session: false
}), trackCashback);
router.post('/claim-request', passport.authenticate('jwt', {
    session: false
}), cliamCashback);
router.post('/post-review', passport.authenticate('jwt', {
    session: false
}), postReview);
module.exports = router;