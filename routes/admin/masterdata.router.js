const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {

    getEmailTemplates,
    getEmailRowById,
    updateEmailTemplates,
    getAffiliates,
    createAffiliate,
    updateAffiliateNetworks,
    updateAffiliateStatus,
    getAffiliateRowById,
    createTag,
    updateTags,
    getTags,
    updateTagStatus,
    getTagRowById,
    getConfigRow,
    updateConfig
} = require('../../controllers/admin/masterdata.controller');


router.get('/email-temp-list', passport.authenticate('admin', {
    session: false
}), getEmailTemplates);
router.get('/email-temp-row', passport.authenticate('admin', {
    session: false
}), getEmailRowById);
router.post('/update-email-temp', passport.authenticate('admin', {
    session: false
}), updateEmailTemplates);

// Affiliate
router.get('/affiliate-list', passport.authenticate('admin', {
    session: false
}), getAffiliates);
router.post('/create-affiliate', passport.authenticate('admin', {
    session: false
}), createAffiliate);
router.post('/update-affiliate', passport.authenticate('admin', {
    session: false
}), updateAffiliateNetworks);
router.post('/update-affiliate-status', passport.authenticate('admin', {
    session: false
}), updateAffiliateStatus);
router.get('/affiliate-row', passport.authenticate('admin', {
    session: false
}), getAffiliateRowById);

// Tags

router.get('/tag-list', passport.authenticate('admin', {
    session: false
}), getTags);
router.post('/create-tag', passport.authenticate('admin', {
    session: false
}), createTag);
router.post('/update-tag', passport.authenticate('admin', {
    session: false
}), updateTags);
router.post('/update-tag-status', passport.authenticate('admin', {
    session: false
}), updateTagStatus);
router.get('/tag-row', passport.authenticate('admin', {
    session: false
}), getTagRowById);

// Others
router.get('/config-row', passport.authenticate('admin', {
    session: false
}), getConfigRow);

router.post('/update-config', passport.authenticate('admin', {
    session: false
}), updateConfig);
module.exports = router;