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
    getCashbackStores
} = require('../../controllers/admin/cashback_store.controller');
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

module.exports = router;