const passport = require('passport');
require('../../config/admin-passport')(passport);
const express = require('express');
const router = express.Router();
const {
    getArticles,
    createArticle,
    updateArticleStatus,
    getArticleRowById,
    getAllArticles,
    updateArticle
} = require('../../controllers/admin/article.controller');

const {
    getComments,
    createComment,
    updateCommentStatus,
    getCommentRowById,
    getAllComments,
    updateComment
} = require('../../controllers/admin/article_comments.controller');

router.post('/create-article', passport.authenticate('admin', {
    session: false
}), createArticle);
router.post('/update-article', passport.authenticate('admin', {
    session: false
}), updateArticle);
router.get('/list', passport.authenticate('admin', {
    session: false
}), getArticles);
router.get('/all-list', passport.authenticate('admin', {
    session: false
}), getAllArticles);
router.post('/update-articles-status', passport.authenticate('admin', {
    session: false
}), updateArticleStatus);
router.get('/article-row', passport.authenticate('admin', {
    session: false
}), getArticleRowById);



router.post('/create-comment', passport.authenticate('admin', {
    session: false
}), createComment);
router.post('/update-comment', passport.authenticate('admin', {
    session: false
}), updateComment);
router.get('/comment-list', passport.authenticate('admin', {
    session: false
}), getComments);
router.get('/all-article-list', passport.authenticate('admin', {
    session: false
}), getAllComments);
router.post('/update-comments-status', passport.authenticate('admin', {
    session: false
}), updateCommentStatus);
router.get('/comment-row', passport.authenticate('admin', {
    session: false
}), getCommentRowById);
module.exports = router;