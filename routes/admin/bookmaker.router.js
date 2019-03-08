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
    getSharbsList
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

module.exports = router;