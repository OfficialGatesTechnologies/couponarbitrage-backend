const Article = require('../../models/Articles');
const Menu = require('../../models/Jos_menu');
const { getToken, genRandomPassword ,convertToSlug} = require('../../utils/api.helpers');
var md5 = require('md5');
const path = require('path');
function createArticle(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { title, title_alias,  category,
             sub_title, short_description, description,  metatitle, metakey, metadesc, metadata
        } = body;
        if (!title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!title_alias) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!category) return res.status(400).send({ success: false, message: 'Please select category .' });
        Article.find({ title: title, deleted: 0 }).then(existArticle => {
            if (existArticle.length > 0) return res.status(400).send({ success: false, msg: 'Article name already exists.' });
            const newArticle = new Article();
            let newFileName = '';
            if (req.files) {
                let imageFile = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
                imageFile.mv(filename);
                newArticle.imageFile = newFileName;
            }
            newArticle.title = title;
            newArticle.title_alias = convertToSlug(title_alias);
            newArticle.category = category;       
            newArticle.sub_title = sub_title;
            newArticle.short_description = short_description;
            newArticle.description = description;
            newArticle.metatitle = metatitle;
            newArticle.metakey = metakey;
            newArticle.metadesc = metadesc;
            newArticle.metadata = metadata;
            newArticle.defaultArticleItem = 0;
            newArticle.save((err) => {
                if (err) {
                    console.log('err 1 ', err);
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Article created successfully!' });
            });

        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateArticle(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, title, title_alias,  category,
             sub_title, short_description, description,  metatitle, metakey, metadesc, metadata
        } = body;
        if (!title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!title_alias) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!category) return res.status(400).send({ success: false, message: 'Please select category .' });
        Article.findById({
            _id: _id
        }).then(dataRow => {
            if (!dataRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Article.find({ title: title, deleted: 0, _id: { $ne: _id } })
                .then(exisUsername => {
                    if (exisUsername.length > 0) return res.status(400).send({ success: false, msg: 'Article name already exists.' });
                    let updateData = {};
                    if (req.files) {
                        let imageFile = req.files.file;
                        let imageName = req.files.file.name;
                        let imageExt = imageName.split('.').pop();
                        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                        let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
                        imageFile.mv(filename, function (err) { });
                        updateData.imageFile = newFileName;
                    }
                    updateData.title = title;
                    updateData.title_alias = convertToSlug(title_alias);       
                    updateData.category = category;    
                    updateData.sub_title = sub_title;
                    updateData.short_description = short_description;
                    updateData.description = description;               
                    updateData.metatitle = metatitle;
                    updateData.metakey = metakey;
                    updateData.metadesc = metadesc;
                    updateData.metadata = metadata;
                    Article.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Article updated successfully' });
                        }).catch((err) => {
                            console.log('err', err);
                            return res.status(500).send({ success: false, msg: 'server error 2' })
                        })
                }).catch(() => {

                    return res.status(500).send({ success: false, msg: 'server error 1 ' })
                })

        })
            .catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
                else return next({ status: 500, msg: 'server error 3' })
            })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getArticles(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['disabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { name: 1 };
        }

        Article.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Article.countDocuments(query)
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

function getAllArticles(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { menuDeleted: 0,parent:'5b7a49f8049ac11419000056' };
        let sortQ = {};
        sortQ = { name: 1 };
        Menu.find(query).sort(sortQ)
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

function updateArticleStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Article.findById({ _id }).then(dataRow => {
            if (!dataRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.deleted = 1;
            else
                updateData.disabled = (action == 'enabled') ? 0 : 1;

            Article.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Article updated successfully!' });
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
function getArticleRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Article.findById(req.query._id, { password: 0 }).then(dataRow => {
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
    updateArticle,
    getArticles,
    createArticle,
    updateArticleStatus,
    getArticleRowById,
    getAllArticles

}

