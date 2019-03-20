const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {

    createTag,
    updateTags,
    getTags,
    updateTagStatus,
    getTagRowById,
    getAllTags,
    getBookmakerRowById,
    updateBookmakers,
    createBookmaker,
    getBookmakers,
    updateBookmakerStatus,
    getAllLeagus,
    getAllMatches,
    getMarkets,
    getBookmakerList,
    getBookmakerSelsList,
    createSharbs,
    updateSharbs,
    getSharbsList,
    getSharbsRowById,
    deleteSharb,
    uploadSharbsData,
    getBulkSharbsList,
    updateBulkSharbs,
    updateMarketBulkSharbs,
    getBettingSharbsDocument,
    unloadSharbs,
    getPlansList,
    createPlan,
    getPlanRowById,
    updatePlan,
    updatePlanStatus,
    getPaymentList,
    getUserPlansList,
    getChatList,
    updateChatStatus,
    updateUserPlanStatus,
    getUserPlanRowById,
    getAllPlans,
    updateUserPlan
} = require('../../controllers/admin/bookmaker.controller');
router.get('/all-list', passport.authenticate('admin', {
    session: false
}), getAllTags);
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
router.get('/bookmaker-list', passport.authenticate('admin', {
    session: false
}), getBookmakers);
router.get('/bookmaker-row', passport.authenticate('admin', {
    session: false
}), getBookmakerRowById);
router.post('/update-bookmaker-status', passport.authenticate('admin', {
    session: false
}), updateBookmakerStatus);
router.post('/create-bookmaker', passport.authenticate('admin', {
    session: false
}), createBookmaker);
router.post('/update-bookmaker', passport.authenticate('admin', {
    session: false
}), updateBookmakers);
router.get('/get-league-list', passport.authenticate('admin', {
    session: false
}), getAllLeagus);
router.get('/get-matches-list', passport.authenticate('admin', {
    session: false
}), getAllMatches);
router.get('/get-markets-list', passport.authenticate('admin', {
    session: false
}), getMarkets);
router.get('/get-bookmaker-list', passport.authenticate('admin', {
    session: false
}), getBookmakerList);
router.get('/get-sels-list', passport.authenticate('admin', {
    session: false
}), getBookmakerSelsList);
router.post('/create-sharbs', passport.authenticate('admin', {
    session: false
}), createSharbs);
router.post('/update-sharbs', passport.authenticate('admin', {
    session: false
}), updateSharbs);
router.get('/get-sharbs-list', passport.authenticate('admin', {
    session: false
}), getSharbsList);
router.get('/sharbs-row', passport.authenticate('admin', {
    session: false
}), getSharbsRowById);
router.post('/delete-sharbs', passport.authenticate('admin', {
    session: false
}), deleteSharb);
router.post('/upload-sharbs-data', passport.authenticate('admin', {
    session: false
}), uploadSharbsData);
router.get('/get-bulk-sharbs', passport.authenticate('admin', {
    session: false
}), getBulkSharbsList);
router.post('/update-bulk-sharbs', passport.authenticate('admin', {
    session: false
}), updateBulkSharbs);
router.post('/update-market-bulk-sharbs', passport.authenticate('admin', {
    session: false
}), updateMarketBulkSharbs);

router.get('/get-sharbs-documents', passport.authenticate('admin', {
    session: false
}), getBettingSharbsDocument);
router.post('/unload-sharbs', passport.authenticate('admin', {
    session: false
}), unloadSharbs);


/*** Plans */
router.get('/plan-list', passport.authenticate('admin', {
    session: false
}), getPlansList);
router.post('/create-plan', passport.authenticate('admin', {
    session: false
}), createPlan);
router.get('/plan-row', passport.authenticate('admin', {
    session: false
}), getPlanRowById);

router.post('/update-plan', passport.authenticate('admin', {
    session: false
}), updatePlan);
router.post('/update-plan-status', passport.authenticate('admin', {
    session: false
}), updatePlanStatus);

router.get('/payment-list', passport.authenticate('admin', {
    session: false
}), getPaymentList);
router.get('/user-plan-list', passport.authenticate('admin', {
    session: false
}), getUserPlansList);
router.get('/chat-history', passport.authenticate('admin', {
    session: false
}), getChatList);
router.post('/update-chat-status', passport.authenticate('admin', {
    session: false
}), updateChatStatus);



router.post('/update-userplan-status', passport.authenticate('admin', {
    session: false
}), updateUserPlanStatus);
router.get('/user-plan-row', passport.authenticate('admin', {
    session: false
}), getUserPlanRowById);
router.get('/all-plans', passport.authenticate('admin', {
    session: false
}), getAllPlans);
router.post('/update-user-plan', passport.authenticate('admin', {
    session: false
}), updateUserPlan);


module.exports = router;