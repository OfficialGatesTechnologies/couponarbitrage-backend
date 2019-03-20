const EmailTemplates = require('../../models/Email_template');
const AffiliateNetwork = require('../../models/Affiliate_network');
const Tags = require('../../models/Tags');
const SiteConfig = require('../../models/Site_config');
const Static = require('../../models/Static');
const Pages = require('../../models/Pages');
const Subscribers = require('../../models/Subscribers');
const CashbackStores = require('../../models/Cashback_stores');
const Faqs = require('../../models/Faq');
const CashbackReviews = require('../../models/Store_review');
const Banner = require('../../models/Banner');
var md5 = require('md5');
const path = require('path');
const {
    genRandomPassword,
    getToken,
    convertToSlug
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
                    return res.status(400).send({ success: true, msg: 'Server error!' });
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
        updateData.skrill_cashback_value = isNaN(parseFloat(body.skrill_cashback_value)) ? 0 : parseFloat(body.skrill_cashback_value);
        updateData.sbobet_cashback_value = isNaN(parseFloat(body.sbobet_cashback_value)) ? 0 : parseFloat(body.sbobet_cashback_value);
        updateData.neteller_cashback_value = isNaN(parseFloat(body.neteller_cashback_value)) ? 0 : parseFloat(body.neteller_cashback_value);
        updateData.ecopayz_cashback_value = isNaN(parseFloat(body.ecopayz_cashback_value)) ? 0 : parseFloat(body.ecopayz_cashback_value);
        updateData.app_status = body.app_status;
        updateData.app_link = body.app_link;
        updateData.app_version = body.app_version;
        SiteConfig.update({ config_module: body.config_module }, updateData, { upsert: true }, function (err) {
            if (err) {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Config updated successfully!' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getStaticText(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        var query = { isDeleted: false };
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        Static.find(query).skip(skippage).limit(pageLimit)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0 });
                Static.countDocuments(query).then(staticCounts => {
                    return res.status(200).send({ success: true, 'results': results, totalCount: staticCounts });
                });
            }).catch((err) => {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function createStaticText(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { static_text_for, static_text, static_text_min_val, static_text_max_val } = body.staticData;
        if (!static_text_for) return res.send({ success: false, message: 'Please select text for.' });
        if (!static_text) return res.send({ success: false, message: 'Please enter your staticname.' });

        const newStatic = new Static();
        newStatic.static_text_for = static_text_for;
        newStatic.static_text = static_text;
        newStatic.static_text_min_val = static_text_min_val;
        newStatic.static_text_max_val = static_text_max_val;

        newStatic.save((err, doc) => {
            if (err) {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Text created successfully!' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateStaticText(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, static_text_for, static_text, static_text_min_val, static_text_max_val } = body.staticData;
        if (!static_text_for) return res.send({ success: false, message: 'Please select text for.' });
        if (!static_text) return res.send({ success: false, message: 'Please enter your staticname.' });
        Static.findById({
            _id
        }).then(static => {
            if (!static) throw { status: 400, msg: 'Invalid id.' };
            let updateData = {
                static_text_for: static_text_for,
                static_text: static_text,
                static_text_min_val: static_text_min_val,
                static_text_max_val: static_text_max_val,

            };

            Static.findByIdAndUpdate({ _id: static._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Static text updated successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                });
        }).catch(err => {
            if (err.status === 400) res.status(400).send({ success: false, msg: err.msg });
            else return next({ status: 500, message: 'Server error' });
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getStaticRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Static.findById(req.query._id, { password: 0 }).then(staticRow => {
            if (staticRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': staticRow });
        }).catch(() => {
            return res.status(400).send({ success: true, msg: 'Server error!' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function deleteStaticText(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        Static.findById({ _id }).then(static => {
            if (!static) throw { status: 400, msg: 'Invalid Static.' };
            updateData = { isDeleted: true };
            Static.findByIdAndRemove({ _id: static._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Static text deleted successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                });
        }).catch(() => {
            return res.status(400).send({ success: true, msg: 'Server error!' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getPages(req, res, next) {

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

        Pages.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Pages.countDocuments(query)
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

function getPagesRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Pages.findById(req.query._id, { password: 0 }).then(objRow => {
            if (objRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': objRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updatePages(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;

        const { _id, pageTitle, pageContent, pageMetaTitle, pageMetaKeywords, pageMetaDescription } = body.pageData;


        if (!pageTitle) return res.status(401).send({ success: false, message: 'Please enter the  title.' });
        else if (!pageContent) return res.status(401).send({ success: false, message: 'Please enter the content.' });


        Pages.findById({
            _id: _id
        })
            .then(objRow => {
                if (!objRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
                let updateData = {};
                updateData.pageTitle = pageTitle;
                updateData.pageUrl = convertToSlug(pageTitle);
                updateData.pageContent = pageContent;
                updateData.pageMetaTitle = pageMetaTitle;
                updateData.pageMetaKeywords = pageMetaKeywords;
                updateData.pageMetaDescription = pageMetaDescription;

                Pages.findByIdAndUpdate({ _id: objRow._id }, { $set: updateData })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Page updated successfully' });
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

function createSubscriber(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { subscriberEmail } = body.subscriberData;
        if (!subscriberEmail) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        Subscribers.find({ subscriberEmail: subscriberEmail, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Subscriber name already exists.' });
            const newCat = new Subscribers();
            newCat.subscriberEmail = subscriberEmail;


            newCat.save((err, doc) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Subscriber created successfully!' });
            });

        }).catch((err) => {

            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateSubscribers(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, subscriberEmail } = body.subscriberData;
        if (!subscriberEmail) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        Subscribers.findById({
            _id: _id
        }).then(subscriberRow => {
            if (!subscriberRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Subscribers.find({ subscriberEmail: subscriberEmail, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Subscriber name  already exists.' });
                    let updateData = {};
                    updateData.subscriberEmail = subscriberEmail;
                    Subscribers.findByIdAndUpdate({ _id: subscriberRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Subscriber updated successfully' });
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


function getSubscribers(req, res, next) {

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
            sortQ = { subscriberEmail: -1 };
        }

        Subscribers.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Subscribers.countDocuments(query)
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


function updateSubscriberStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Subscribers.findById({ _id }).then(subscriberRow => {
            if (!subscriberRow) throw { status: 400, msg: 'Invalid request.' };


            Subscribers.findByIdAndRemove({ _id: subscriberRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Subscriber deleted successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getSubscriberRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Subscribers.findById(req.query._id).then(subscriberRow => {
            if (subscriberRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': subscriberRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



function createFaq(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { faqQuestion, faqCategory, faqAnswer } = body.faqData;
        if (!faqQuestion) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        Faqs.find({ faqQuestion: faqQuestion, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Faq name already exists.' });
            const newCat = new Faqs();
            newCat.faqCategory = faqCategory;

            newCat.faqQuestion = faqQuestion;
            newCat.faqAnswer = faqAnswer;
            newCat.save((err, doc) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Faq created successfully!' });
            });

        }).catch((err) => {

            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateFaqs(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, faqQuestion, faqCategory, faqAnswer } = body.faqData;
        if (!faqQuestion) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        Faqs.findById({
            _id: _id
        }).then(faqRow => {
            if (!faqRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Faqs.find({ faqQuestion: faqQuestion, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Faq name  already exists.' });
                    let updateData = {};
                    updateData.faqQuestion = faqQuestion;
                    updateData.faqCategory = faqCategory;
                    updateData.faqAnswer = faqAnswer;
                    Faqs.findByIdAndUpdate({ _id: faqRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Faq updated successfully' });
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


function getFaqs(req, res, next) {

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
            sortQ = { faqQuestion: -1 };
        }

        Faqs.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Faqs.countDocuments(query)
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


function updateFaqStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Faqs.findById({ _id }).then(faqRow => {
            if (!faqRow) throw { status: 400, msg: 'Invalid request.' };


            Faqs.findByIdAndRemove({ _id: faqRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Faq deleted successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getFaqRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Faqs.findById(req.query._id).then(faqRow => {
            if (faqRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': faqRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



function createReview(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        if (!body.reviewData.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.reviewData.user_id) return res.status(400).send({ success: false, message: 'Please select a user.' });
        else if (!body.reviewData.title) return res.status(400).send({ success: false, message: 'Please enter the title.' });


        const newReview = new CashbackReviews();

        newReview.store_id = body.reviewData.store_id;
        newReview.user_id = body.reviewData.user_id;
        newReview.rating = body.reviewData.rating;
        newReview.title = body.reviewData.title;
        newReview.comments = body.reviewData.comments;

        newReview.save((err) => {
            if (err) {

                return res.status(400).send({ success: true, msg: err });
            }
            return res.status(201).send({ success: true, msg: 'Review created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateReview(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        if (!body.reviewData.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.reviewData.user_id) return res.status(400).send({ success: false, message: 'Please select a user.' });
        else if (!body.reviewData.title) return res.status(400).send({ success: false, message: 'Please enter the title.' });

        CashbackReviews.findById({
            _id: body.reviewData._id
        }).then(reviewRow => {
            if (!reviewRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.store_id = body.reviewData.store_id;
            updateData.user_id = body.reviewData.user_id;
            updateData.rating = body.reviewData.rating;
            updateData.title = body.reviewData.title;
            updateData.comments = body.reviewData.comments;
            CashbackReviews.findByIdAndUpdate({ _id: reviewRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Review updated successfully' });
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: err })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error 4' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getCashbackReviews(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.filterByStore && req.query.filterByStore != 'all') {
            query['store_id'] = req.query.filterByStore;
        }
        CashbackReviews.find(query).populate({ path: 'store_id', populate: { path: 'aid' } }).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackReviews.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getAllstoresList(req, res) {
    const token = getToken(req.headers);
    if (token) {
        let query = { off_deleted: 0 };
        CashbackStores.find(query).populate('aid')
            .then(results => {
                return res.status(200).send({ success: true, results: results });
            }).catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



function updateReviewStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackReviews.findById({ _id }).then(reviewRow => {
            if (!reviewRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};

            if (action == 'delete') {
                CashbackReviews.findByIdAndRemove({ _id: reviewRow._id })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Review deleted successfully!' });
                    }).catch(() => {
                        return res.json({ success: false, msg: 'Server error' });
                    });
            } else {
                updateData.status = (action == 'enabled') ? 0 : 1;
                CashbackReviews.findByIdAndUpdate({ _id: reviewRow._id }, { $set: updateData })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Review updated successfully!' });
                    }).catch(() => {
                        return res.status(400).send({ success: false, msg: 'Server error' });
                    });
            }

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getReviewRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackReviews.findById(req.query._id).populate('user_id').then(reviewRow => {
            if (reviewRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': reviewRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function createBanner(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { bannerTitle, bannerSubTitle, bannerFor, bannerUrl
        } = body;
        if (!bannerTitle) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        const newBanner = new Banner();
        let newFileName = '';
        if (req.files) {
            let imageFile = req.files.file;
            let imageName = req.files.file.name;
            let imageExt = imageName.split('.').pop();
            newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
            let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
            imageFile.mv(filename);
            newBanner.bannerImageFile = newFileName;
        }
        newBanner.bannerTitle = bannerTitle;
        newBanner.bannerFor = bannerFor;
        newBanner.bannerSubTitle = bannerSubTitle;
        newBanner.bannerUrl = bannerUrl;
        newBanner.save((err) => {
            if (err) {
                console.log('err 1 ', err);
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Banner created successfully!' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateBanner(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, bannerTitle, bannerSubTitle, bannerFor, bannerUrl
        } = body;
        if (!bannerTitle) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        Banner.findById({
            _id: _id
        }).then(dataRow => {
            if (!dataRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};
            if (req.files) {
                let imageFile = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
                imageFile.mv(filename, function (err) { });
                updateData.bannerImageFile = newFileName;
            }
            updateData.bannerTitle = bannerTitle;
            updateData.bannerFor = bannerFor;
            updateData.bannerSubTitle = bannerSubTitle;
            updateData.bannerUrl = bannerUrl;
            Banner.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Banner updated successfully' });
                }).catch((err) => {
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


function getBanners(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { bannerDeleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['bannerDisabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { name: 1 };
        }

        Banner.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Banner.countDocuments(query)
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


function updateBannerStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Banner.findById({ _id }).then(dataRow => {
            if (!dataRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.bannerDeleted = 1;
            else
                updateData.bannerDisabled = (action == 'enabled') ? 0 : 1;

            Banner.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Banner updated successfully!' });
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
function getBannerRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Banner.findById(req.query._id, { password: 0 }).then(dataRow => {
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
}

