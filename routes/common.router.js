const passport = require('passport');
require('../config/passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getMenus,
    getMenuRowByUrl,
    getCatRowByUrl,
    getBanners,
    getStaticText,
    turnoverReg,
    getFaqs,
    getArticleRowByURL,
    createComment
} = require('../controllers/common.controller');

router.get('/menus', getMenus);
router.get('/menu-row', getMenuRowByUrl);
router.get('/cat-row', getCatRowByUrl);
router.get('/banner-list', getBanners);
router.get('/static-text', getStaticText);
router.post('/turnover-registration', turnoverReg);
router.get('/faqs', getFaqs);
router.get('/article-row', getArticleRowByURL);
router.post('/post-comment', createComment);
module.exports = router;