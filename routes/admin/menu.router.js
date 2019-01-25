const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getMenus,
    createMenu,
    updateUserStatus,
    getUserRowById,
    getAllMenus,
    updateMenu
} = require('../../controllers/admin/menu.controller');

router.post('/create-menu', passport.authenticate('admin', {
    session: false
}), createMenu);
router.post('/update-menu', passport.authenticate('admin', {
    session: false
}), updateMenu);
router.get('/list', passport.authenticate('admin', {
    session: false
}), getMenus);
router.get('/all-list', passport.authenticate('admin', {
    session: false
}), getAllMenus);
router.post('/update-menus-status', passport.authenticate('admin', {
    session: false
}), updateUserStatus);

router.get('/menu-row', passport.authenticate('admin', {
    session: false
}), getUserRowById);
module.exports = router;