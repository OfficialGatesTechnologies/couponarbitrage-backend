const EmailTemplates = require('../../models/Email_template');
const AffiliateNetwork = require('../../models/Affiliate_network');
const Tags = require('../../models/Tags');
const SiteConfig = require('../../models/Site_config');
const {
    getToken,
    sendCustomMail
} = require('../../utils/api.helpers');
const config = require('../../config/config');


function getEmailTemplates(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }

        EmailTemplates.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                EmailTemplates.countDocuments(query)
                    .then(rowCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: rowCounts });

                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getEmailRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        EmailTemplates.findById(req.query._id, { password: 0 }).then(objRow => {
            if (objRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': objRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateEmailTemplates(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;

        const { _id, template_subject, template_content } = body.tempData;


        if (!template_subject) return res.status(401).send({ success: false, message: 'Please enter the  subject.' });
        else if (!template_content) return res.status(401).send({ success: false, message: 'Please enter the mail content.' });


        EmailTemplates.findById({
            _id: _id
        })
            .then(objRow => {
                if (!objRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
                let updateData = {};
                updateData.template_subject = template_subject;
                updateData.template_content = template_content;

                EmailTemplates.findByIdAndUpdate({ _id: objRow._id }, { $set: updateData })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Template updated successfully' });
                    }).catch((err) => {

                        return res.status(500).send({ success: false, msg: 'server error11' })
                    })
            })
            .catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
                else return next({ status: 500, msg: 'server error' })
            })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function createAffiliate(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { title, identifier } = body.catData;
        if (!title) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        AffiliateNetwork.find({ title: title, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Affiliate name already exists.' });
            const newCat = new AffiliateNetwork();
            newCat.title = title;
            newCat.identifier = identifier;

            newCat.save((err, doc) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Affiliate created successfully!' });
            });

        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateAffiliateNetworks(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, title, identifier } = body.catData;
        if (!title) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        AffiliateNetwork.findById({
            _id: _id
        }).then(catRow => {
            if (!catRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            AffiliateNetwork.find({ title: title, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Affiliate name  already exists.' });
                    let updateData = {};
                    updateData.title = title;
                    updateData.identifier = identifier;

                    AffiliateNetwork.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Affiliate updated successfully' });
                        }).catch((err) => {
                            return res.status(500).send({ success: false, msg: 'server error' })
                        })
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: 'server error' })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getAffiliates(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { name: -1 };
        }

        AffiliateNetwork.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                AffiliateNetwork.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function updateAffiliateStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        AffiliateNetwork.findById({ _id }).then(catRow => {
            if (!catRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.deleted = 1;
            else
                updateData.cat_disabled = (action == 'enabled') ? 0 : 1;

            AffiliateNetwork.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Affiliate updated successfully!' });
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
function getAffiliateRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        AffiliateNetwork.findById(req.query._id).then(catRow => {
            if (catRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': catRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function createTag(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { tagName } = body.tagData;
        if (!tagName) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        Tags.find({ tagName: tagName, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Tag name already exists.' });
            const newCat = new Tags();
            newCat.tagName = tagName;


            newCat.save((err, doc) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Tag created successfully!' });
            });

        }).catch((err) => {

            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateTags(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, tagName } = body.tagData;
        if (!tagName) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        Tags.findById({
            _id: _id
        }).then(tagRow => {
            if (!tagRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Tags.find({ tagName: tagName, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Tag name  already exists.' });
                    let updateData = {};
                    updateData.tagName = tagName;
                    Tags.findByIdAndUpdate({ _id: tagRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Tag updated successfully' });
                        }).catch((err) => {
                            return res.status(500).send({ success: false, msg: 'server error' })
                        })
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: 'server error' })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getTags(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { tagName: -1 };
        }

        Tags.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Tags.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function updateTagStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Tags.findById({ _id }).then(tagRow => {
            if (!tagRow) throw { status: 400, msg: 'Invalid request.' };


            Tags.findByIdAndRemove({ _id: tagRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Tag deleted successfully!' });
                }).catch(() => {
                    return res.json({ success: false, msg: 'Server error' });
                });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getTagRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Tags.findById(req.query._id).then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getConfigRow(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        SiteConfig.findOne({ config_module: req.query.module }).then(configRow => {
            if (configRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': configRow });
        }).catch((err) => {
            return res.status(400).send({ success: false, msg: err });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateConfig(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        let updateData = {};
        updateData.config_module = body.config_module;
        updateData.facebook_url = body.facebook_url;
        updateData.twitter_url = body.twitter_url;
        updateData.google_url = body.google_url;
        updateData.instagram_url = body.instagram_url;
        // updateData.adwords_status = body.adwords_status;
        updateData.sbobet_cashback_fromdate = body.sbobet_cashback_fromdate;
        updateData.sbobet_cashback_todate = body.sbobet_cashback_todate;
        updateData.sbobet_cashback = isNaN(parseFloat(body.sbobet_cashback)) ? 0 : parseFloat(body.sbobet_cashback);
        updateData.skrill_cashback_value = isNaN(parseFloat(body.skrill_cashback_value)) ? 0 : parseFloat(body.skrill_cashback_value) ;
        updateData.sbobet_cashback_value = isNaN(parseFloat(body.sbobet_cashback_value)) ? 0 : parseFloat(body.sbobet_cashback_value) ;
        updateData.neteller_cashback_value = isNaN(parseFloat(body.neteller_cashback_value)) ? 0 : parseFloat(body.neteller_cashback_value) ;
        updateData.ecopayz_cashback_value = isNaN(parseFloat(body.ecopayz_cashback_value)) ? 0 : parseFloat(body.ecopayz_cashback_value) ;
        updateData.app_status = body.app_status;
        updateData.app_link = body.app_link;
        updateData.app_version = body.app_version;
        SiteConfig.update({config_module: body.config_module}, updateData, {upsert: true}, function (err) {
            if (err) {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Config updated successfully!' });
        });          
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

module.exports = {
    getEmailTemplates,
    getEmailRowById,
    updateEmailTemplates,
    getAffiliates,
    createAffiliate,
    updateAffiliateStatus,
    updateAffiliateNetworks,
    getAffiliateRowById,
    createTag,
    updateTags,
    getTags,
    updateTagStatus,
    getTagRowById,
    getConfigRow,
    updateConfig

}

