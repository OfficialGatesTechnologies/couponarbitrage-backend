const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getCashbackCliams,
    getCliamRowById,
    updateClaims,
    getTagsList,
    updateClaimTags
} = require('../../controllers/admin/cashback_claims.controller');

// cashback caregorie
router.get('/list', passport.authenticate('admin', {
    session: false
}), getCashbackCliams);
router.get('/cliam-row', passport.authenticate('admin', {
    session: false
}), getCliamRowById);

router.post('/update-claim', passport.authenticate('admin', {
    session: false
}), updateClaims);

router.get('/tags-list', passport.authenticate('admin', {
    session: false
}), getTagsList);
router.post('/update-cliam-tags', passport.authenticate('admin', {
    session: false
}), updateClaimTags);

module.exports = router;