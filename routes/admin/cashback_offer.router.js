const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getCashbackCategories,
    getCashbackMenus,
    createCategory,
    updateCatStatus,
    updateCashbackCategory,
    getCatRowById
} = require('../../controllers/admin/cashback_caregories.controller');
const {
    getCashbackSites,
    createSite,
    updateSiteStatus,
    updateCashbackSite,
    getSiteRowById
} = require('../../controllers/admin/cashback_site.controller');

const {
    getDropDownData,
    getCashbackStores,
    createStore,
    getStoresToExport,
    uploadStore,
    updateStoreStatus,
    getStoreRowById,
    updateStore,
    getTagsList,
    updateStoreTags
} = require('../../controllers/admin/cashback_store.controller');
const {
    getAllstoresList,
    getCashbackOffers,
    createOffer,
    updateOfferStatus,
    getOfferRowById,
    updateOffer,
} = require('../../controllers/admin/cashback_offer.controller');
const {
    getCashbackVouchers,
    createVoucher,
    updateVoucherStatus,
    getVoucherRowById,
    updateVoucher,
} = require('../../controllers/admin/cashback_voucher.controller');
// cashback caregorie
router.get('/list', passport.authenticate('admin', {
    session: false
}), getCashbackCategories);
router.get('/parent-menu', passport.authenticate('admin', {
    session: false
}), getCashbackMenus);
router.post('/create-cat', passport.authenticate('admin', {
    session: false
}), createCategory);
router.post('/update-cat', passport.authenticate('admin', {
    session: false
}), updateCashbackCategory);
router.post('/update-cat-status', passport.authenticate('admin', {
    session: false
}), updateCatStatus);
router.get('/cat-row', passport.authenticate('admin', {
    session: false
}), getCatRowById);

// cashback site
router.get('/site-list', passport.authenticate('admin', {
    session: false
}), getCashbackSites);
router.post('/create-site', passport.authenticate('admin', {
    session: false
}), createSite);
router.post('/update-site', passport.authenticate('admin', {
    session: false
}), updateCashbackSite);
router.post('/update-site-status', passport.authenticate('admin', {
    session: false
}), updateSiteStatus);
router.get('/site-row', passport.authenticate('admin', {
    session: false
}), getSiteRowById);

// cashback Stores
router.get('/get-drop-down-data', passport.authenticate('admin', {
    session: false
}), getDropDownData);

router.get('/store-list', passport.authenticate('admin', {
    session: false
}), getCashbackStores);
router.post('/create-store', passport.authenticate('admin', {
    session: false
}), createStore);
router.post('/update-store', passport.authenticate('admin', {
    session: false
}), updateStore);
router.get('/export-stores', passport.authenticate('admin', {
    session: false
}), getStoresToExport);
router.post('/upload-stores', passport.authenticate('admin', {
    session: false
}), uploadStore);
router.post('/update-store-status', passport.authenticate('admin', {
    session: false
}), updateStoreStatus);
router.get('/store-row', passport.authenticate('admin', {
    session: false
}), getStoreRowById);

router.get('/tags-list', passport.authenticate('admin', {
    session: false
}), getTagsList);
router.post('/update-store-tags', passport.authenticate('admin', {
    session: false
}), updateStoreTags);

// cashback offers
router.get('/get-all-stores', passport.authenticate('admin', {
    session: false
}), getAllstoresList);
router.get('/offer-list', passport.authenticate('admin', {
    session: false
}), getCashbackOffers);
router.post('/create-offer', passport.authenticate('admin', {
    session: false
}), createOffer);
router.post('/update-offer', passport.authenticate('admin', {
    session: false
}), updateOffer);
router.post('/update-offer-status', passport.authenticate('admin', {
    session: false
}), updateOfferStatus);
router.get('/offer-row', passport.authenticate('admin', {
    session: false
}), getOfferRowById);

// cashback voucher
router.get('/voucher-list', passport.authenticate('admin', {
    session: false
}), getCashbackVouchers);
router.post('/create-voucher', passport.authenticate('admin', {
    session: false
}), createVoucher);
router.post('/update-voucher', passport.authenticate('admin', {
    session: false
}), updateVoucher);
router.post('/update-voucher-status', passport.authenticate('admin', {
    session: false
}), updateVoucherStatus);
router.get('/voucher-row', passport.authenticate('admin', {
    session: false
}), getVoucherRowById);


module.exports = router;