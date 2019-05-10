const CashbackStores = require('../models/Cashback_stores');
const CashbackCat = require('../models/Cashback_caregories');
const CashbackOffers = require('../models/Cashback_offers');
const ExitClicks = require('../models/Exit_clicks');
const CashbackClaims = require('../models/cashback_claims');
const EmailTemplates = require('../models/Email_template');
const ActivityStatement = require('../models/Activity_statement');
const CashbackReviews = require('../models/Store_review');
const Tags = require('../models/Tags');
const User = require('../models/User');
const { getToken, sendCustomMail } = require('../utils/api.helpers');
const moment = require('moment');
const config = require('../config/config');
function getCashbackStores(req, res) {
    var todayDate = moment().utcOffset(0);
    todayDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    todayDate.toISOString()
    todayDate.format()
    let pageLimit = parseInt(req.query.pageLimit);
    let skippage = pageLimit * (req.query.page - 1);
    let query = {
        off_deleted: 0,
        off_disabled: 0,
        aid: { $ne: null },
        $or: [
            {
                $and: [
                    { vaild_from: { $lte: new Date(todayDate) } },
                    { valid_to: { $gte: new Date(todayDate) } }
                ]
            },
            {
                $and: [
                    { vaild_from: { $lte: new Date(todayDate) } },
                    { valid_to: null }
                ]
            }
        ]
    };

    let sortQ = {};
    if (req.query.searchKey && req.query.searchBy) {
        query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
    }
    if (req.query.offferFor && req.query.offferFor === 'home') {
        query['home_list'] = 1;
        skippage = Math.floor(Math.random() * 11)
    }
    if (req.query.offferFor && req.query.offferFor === 'nav') {
     
        skippage = Math.floor(Math.random() * 3)
    }
    if (req.query.offferFor && req.query.offferFor === 'top') {
        query['top_list'] = 1;
        // skippage = Math.floor(Math.random() * 11)
    }
    if (req.query.searchKey) {
        query['title'] = new RegExp(req.query.searchKey, 'i');
    }
    if (req.query.parentId) {
        query['parent_id'] = req.query.parentId;
    }
    if (req.query.subcat) {
        query['cat_id'] = req.query.subcat;
    }
    if (req.query.sortOrder && req.query.sortKey) {
        let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
        sortQ[req.query.sortKey] = sortOrder;
    } else {
        sortQ = { value: -1 };
    }
    CashbackStores.find(query)
        .populate('aid')
        .populate({ path: 'cat_id', populate: { path: 'cat_parent' } }).populate('network_id').skip(skippage).limit(pageLimit).sort(sortQ)
        .then(results => {
            if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
            CashbackStores.countDocuments(query)
                .then(totalCounts => {
                    return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                });
        }).catch(() => res.status(400).send({ success: false, msg: 'Server error' }));

}

function getCashbackCategories(req, res) {

    let cquery = { cat_deleted: 0, cat_disabled: 0 };
    if (req.query.parentId) {
        cquery['cat_parent'] = req.query.parentId;
    }
    let sortQ = { cat_title: 1 };
    CashbackCat.find(cquery).sort(sortQ).then(results => {
        return res.status(200).send({ success: true, results: results });
    }).catch(() => res.status(400).send({ success: false, msg: 'Server error' }));

}

function getStoreRowByUrl(req, res) {

    let cquery = { off_disabled: 0, off_deleted: 0, url_key: req.query.url_key };
    // console.log(cquery); 
    var cashbackStores = CashbackStores.findOne(cquery);
    cashbackStores.populate('aid')
    cashbackStores.populate('offers')
    cashbackStores.populate({ path: 'voucherCodes', match: { voucher_disabled: 0, voucher_deleted: 0 } })
    cashbackStores.populate({ path: 'cat_id', populate: { path: 'cat_parent' } })
    
    if ((req.query.ref).match(/^[0-9a-fA-F]{24}$/)) {
        cashbackStores.populate({ path: 'isExistClaim', match: { user_id: req.query.ref } })
        cashbackStores.populate({ path: 'isExistSiteClaim', match: { user_id: req.query.ref } })
    }
    cashbackStores.then(catRow => {
        if (catRow.length === 0) return res.status(200).send({ success: false });
        return res.status(200).send({ success: true, 'results': catRow });
    })
        .catch((err) => {
            return res.status(400).send({ success: false, msg: err });
        });

}
function getOfferRowById(req, res) {

    CashbackOffers.findById(req.query._id).populate(
        {
            path: 'store_id',
            populate: {
                path: 'aid'
            }
        }
    ).then(offerRow => {
        if (offerRow.length === 0) return res.status(200).send({ success: false });
        return res.status(200).send({ success: true, 'results': offerRow });
    }).catch(() => {
        return res.status(400).send({ success: false, msg: 'Server error' });
    });
}

function trackCashback(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        User.findOne({ _id: req.user._id }, { password: 0 })
            .then(userRow => {
                if (userRow.length === 0) throw { status: 404, msg: 'Unauthorised' };
                return Promise.all([userRow,
                    CashbackOffers.findById(req.query._id).populate(
                        {
                            path: 'store_id',
                            populate: {
                                path: 'network_id'
                            }
                        }
                    )]).then(([userRow, offerRow]) => {

                        let newClick = new ExitClicks();
                        newClick.click_userId = userRow._id;
                        newClick.click_network_id = offerRow.store_id.network_id._id;
                        newClick.click_store_id = offerRow.store_id._id;
                        newClick.click_offer_id = offerRow._id;
                        newClick.save((err, doc) => {
                            if (err) {
                                return res.status(400).send({ success: true, msg: 'Server error!' });
                            }
                            return res.status(201).send({ success: true, link: offerRow.store_id.link });
                        });


                    })
                // return res.status(200).send(accounts);
            })
            .catch(err => {
                if (err.status === 404) res.status(404).send({ success: false, msg: err.msg });
                else return next({ status: 500, msg: 'server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function cliamCashback(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { cbname, username } = body.popupData;
        if (!cbname) return res.status(400).send({ success: false, msg: 'Please enter your name.' });
        else if (!username) return res.status(400).send({ success: false, msg: 'Please enter your username.' });
        User.findOne({ _id: req.user._id }, { password: 0 })
            .then(userRow => {
                CashbackStores.findById(body._id).populate('aid')
                    .then(offerRow => {
                        console.log(offerRow.title)
                        if (offerRow.length === 0) return res.status(200).send({ success: false, msg: 'Invalid request' });

                        EmailTemplates.findOne({ template_name: 'new_cashback_claim' })
                            .then(emailRow => {

                                let newClaim = new CashbackClaims();
                                newClaim.user_id = req.user._id;
                                newClaim.store_id = body._id;
                                newClaim.aff_id = offerRow.aid._id;
                                newClaim.cb_type = body.cb_type;
                                newClaim.affil_username = cbname;
                                newClaim.username = username;
                                newClaim.amount = offerRow.value;
                                newClaim.date_joined = Date.now();
                                newClaim.status = 'P';
                                newClaim.date_applied = Date.now();
                                newClaim.save((err, doc) => {
                                    if (err) {
                                        return res.status(400).send({ success: true, msg: 'Server error!' });
                                    }
                                    const activityData = new ActivityStatement();
                                    activityData.activity_userid = req.user._id;
                                    activityData.activity_tableid = doc._id;
                                    activityData.activity_name = (body.cb_type == 2) ? 'RevenueCashbackClaims' : 'CashbackClaims';
                                    activityData.activity_type = (body.cb_type == 2) ? 'Revenue Share Cashback Claim Request' : 'Cashback Claim Request';
                                    activityData.activity_status = 'Pending';
                                    activityData.activity_amount = offerRow.value;
                                    activityData.activity_added = Date.now();
                                    activityData.save();

                                    var claimAmount = (body.cb_type == 3) ? '£' + '' + (offerRow.value) : (offerRow.value) + '%';
                                    var subject = emailRow.template_subject;
                                    var htmlStr = emailRow.template_content;
                                    var subjectHtml = subject.replace(/{AFF_NAME}/g, offerRow.aid ? offerRow.aid.name : '');
                                    subjectHtml = subjectHtml.replace(/{STORE_NAME}/g, offerRow.title);
                                    var resultHtml = htmlStr.replace(/{USER_NAME}/g, userRow.name);
                                    resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                    resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                    resultHtml = resultHtml.replace(/{AMOUNT}/g, claimAmount);
                                    resultHtml = resultHtml.replace(/{DATE_JOINED}/g, (doc.date_joined) ? doc.date_joined : '');
                                    resultHtml = resultHtml.replace(/{CLAIM_SUBMITTED}/g, (doc.date_applied) ? doc.date_applied : '');
                                    resultHtml = resultHtml.replace(/{CLAIM_CONFIRMED}/g, (doc.date_confirmed) ? doc.date_confirmed : '');
                                    resultHtml = resultHtml.replace(/{DATE_CONFIRMED}/g, (doc.date_applied) ? doc.date_applied : '');
                                    resultHtml = resultHtml.replace(/{GAM_SITE}/g, offerRow.aid ? offerRow.aid.name : '');

                                    resultHtml = resultHtml.replace(/{TYPE}/g, offerRow.title);
                                    resultHtml = resultHtml.replace(/{DATE_APPLIED}/g, (doc.date_applied) ? doc.date_applied : '');

                                    var toEmail = userRow.email;
                                    sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                    return res.status(201).send({ success: true, msg: 'Claim has been submitted' });

                                });

                            });

                    }).catch((err) => {

                        return res.status(400).send({ success: false, msg: err });
                    });

            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function postReview(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        const { title, comments,rating } = body.popupData;
        if (!title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!comments) return res.status(400).send({ success: false, msg: 'Please enter your name.' });

        const newReview = new CashbackReviews();

        newReview.store_id = body._id;
        newReview.user_id = req.user._id;
        newReview.rating = rating;
        newReview.title = title;
        newReview.comments = comments;
        newReview.status = 1;
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





module.exports = {
    getCashbackStores,
    getCashbackCategories,
    getStoreRowByUrl,
    getOfferRowById,
    trackCashback,
    cliamCashback,
    postReview
}

