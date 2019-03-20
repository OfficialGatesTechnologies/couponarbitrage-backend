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
    updateConfig,
    getStaticText,
    createStaticText,
    updateStaticText,
    getStaticRowById,
    deleteStaticText,
    getPages,
    getPagesRowById,
    updatePages,
    getSubscribers,
    createSubscriber,
    updateSubscribers,
    updateSubscriberStatus,
    getSubscriberRowById,
    createFaq,
    updateFaqs,
    getFaqs,
    updateFaqStatus,
    getFaqRowById,
    getAllstoresList,
    getCashbackReviews,
    createReview,
    updateReviewStatus,
    getReviewRowById,
    updateReview,
    updateBanner,
    getBanners,
    createBanner,
    updateBannerStatus,
    getBannerRowById,
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

/** Static Text */

router.get('/static-list', passport.authenticate('admin', {
    session: false
}), getStaticText);

router.post('/create', passport.authenticate('admin', {
    session: false
}), createStaticText);

router.get('/static-row', passport.authenticate('admin', {
    session: false
}), getStaticRowById);

router.post('/update-static', passport.authenticate('admin', {
    session: false
}), updateStaticText);

router.post('/delete-static', passport.authenticate('admin', {
    session: false
}), deleteStaticText);


/*** Pages */

router.get('/pages-list', passport.authenticate('admin', {
    session: false
}), getPages);
router.get('/pages-row', passport.authenticate('admin', {
    session: false
}), getPagesRowById);
router.post('/update-page', passport.authenticate('admin', {
    session: false
}), updatePages);

// Subscribers

router.get('/subscriber-list', passport.authenticate('admin', {
    session: false
}), getSubscribers);
router.post('/create-subscriber', passport.authenticate('admin', {
    session: false
}), createSubscriber);
router.post('/update-subscriber', passport.authenticate('admin', {
    session: false
}), updateSubscribers);
router.post('/update-subscriber-status', passport.authenticate('admin', {
    session: false
}), updateSubscriberStatus);
router.get('/subscriber-row', passport.authenticate('admin', {
    session: false
}), getSubscriberRowById);
    // Faqs
router.get('/faq-list', passport.authenticate('admin', {
    session: false
}), getFaqs);
router.post('/create-faq', passport.authenticate('admin', {
    session: false
}), createFaq);
router.post('/update-faq', passport.authenticate('admin', {
    session: false
}), updateFaqs);
router.post('/update-faq-status', passport.authenticate('admin', {
    session: false
}), updateFaqStatus);
router.get('/faq-row', passport.authenticate('admin', {
    session: false
}), getFaqRowById);

/*** Reviews */

router.get('/get-all-stores', passport.authenticate('admin', {
    session: false
}), getAllstoresList);
router.get('/review-list', passport.authenticate('admin', {
    session: false
}), getCashbackReviews);
router.post('/create-review', passport.authenticate('admin', {
    session: false
}), createReview);
router.post('/update-review', passport.authenticate('admin', {
    session: false
}), updateReview);
router.post('/update-review-status', passport.authenticate('admin', {
    session: false
}), updateReviewStatus);
router.get('/review-row', passport.authenticate('admin', {
    session: false
}), getReviewRowById);


router.post('/create-banner', passport.authenticate('admin', {
    session: false
}), createBanner);
router.post('/update-banner', passport.authenticate('admin', {
    session: false
}), updateBanner);
router.get('/banner-list', passport.authenticate('admin', {
    session: false
}), getBanners);
router.post('/update-banners-status', passport.authenticate('admin', {
    session: false
}), updateBannerStatus);
router.get('/banner-row', passport.authenticate('admin', {
    session: false
}), getBannerRowById);
// Others
router.get('/config-row', passport.authenticate('admin', {
    session: false
}), getConfigRow);

router.post('/update-config', passport.authenticate('admin', {
    session: false
}), updateConfig);


module.exports = router;