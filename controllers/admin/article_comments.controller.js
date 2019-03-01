const Comment = require('../../models/Articles_comments');
const Article = require('../../models/Articles');
const Menu = require('../../models/Jos_menu');
const { getToken } = require('../../utils/api.helpers');

function createComment(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { articleId, commentName, commentEmail,
            commentDesc
        } = body;
        if (!articleId) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!commentName) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!commentEmail) return res.status(400).send({ success: false, message: 'Please select commentEmail .' });

        const newComment = new Comment();
        newComment.articleId = articleId;
        newComment.commentName = (commentName);
        newComment.commentEmail = commentEmail;
        newComment.commentDesc = commentDesc;

        newComment.save((err) => {
            if (err) {
                console.log('err 1 ', err);
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Comment created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateComment(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, articleId, commentName, commentEmail,
            commentDesc
        } = body;
        if (!articleId) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!commentName) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!commentEmail) return res.status(400).send({ success: false, message: 'Please select commentEmail .' });
        Comment.findById({
            _id: _id
        }).then(dataRow => {
            if (!dataRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};

            updateData.articleId = articleId;
            updateData.commentName = (commentName);
            updateData.commentEmail = commentEmail;
            updateData.commentDesc = commentDesc;

            Comment.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Comment updated successfully' });
                }).catch((err) => {
                    console.log('err', err);
                    return res.status(500).send({ success: false, msg: 'server error 2' })
                })


        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error 3' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getComments(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { commentDeleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['commentDisabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { commentName: 1 };
        }

        Comment.find(query) .populate('articleId').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Comment.countDocuments(query)
                    .then(colCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: colCounts });
                    });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getAllComments(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { deleted: 0 };
        let sortQ = {};
        sortQ = { title: 1 };
        Article.find(query).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [] });
                return res.status(200).send({ success: true, results: results });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateCommentStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Comment.findById({ _id }).then(dataRow => {
            if (!dataRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.commentDeleted = 1;
            else
                updateData.commentDisabled = (action == 'enabled') ? 0 : 1;

            Comment.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Comment updated successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: false, msg: 'Server error' });
                });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getCommentRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Comment.findById(req.query._id, { password: 0 }).then(dataRow => {
            if (dataRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': dataRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    updateComment,
    getComments,
    createComment,
    updateCommentStatus,
    getCommentRowById,
    getAllComments

}

