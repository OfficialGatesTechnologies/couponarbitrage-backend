const CashbackClaims = require('../models/cashback_claims');
const CashbackCredits = require('../models/Cashback_credits');
const SkrillCashback = require('../models/Skrill_cashback');
const SkrillUsers = require('../models/Skrill_users');
const SbobetUser = require('../models/Sbobet_user');
const SbobetPaid = require('../models/Sbobet_paid');
const NetellerUser = require('../models/Neteller_user');
const NetellerPaid = require('../models/Neteller_paid');
const AsianconnectUser = require('../models/Asianconnect_user');
const AsianconnectPaid = require('../models/Asianconnect_paid');
const EcopayCashback = require('../models/Ecopayz_cashback');
const EcopayUsers = require('../models/Ecopayz_users');
const CashbackTransaction = require('../models/Cashback_transactions');
const TurnoverTransaction = require('../models/Turnover_transactions');
const ActivityStatement = require('../models/Activity_statement');
const EmailTemplates = require('../models/Email_template');
const User = require('../models/User');
const {
    getToken,
    sendCustomMail,
    genRandomPassword,
    getCryptedPassword
} = require('../utils/api.helpers');
const config = require('../config/config');
const moment = require('moment');
var async = require('async');
function getCashbackCliams(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { cb_type: parseInt(req.query.cb_type), user_id: req.user._id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.filterByStore && req.query.filterByStore != 'all') {
            query['store_id'] = req.query.filterByStore;
        }
        if (req.query.status && req.query.status == 'unconfirmed') query['status'] = 'P';
        else if (req.query.status && req.query.status == 'unapproved') query['status'] = 'N';
        else if (req.query.status && req.query.status == 'finished') query['status'] = 'C';
        else if (req.query.status && req.query.status == 'payable') query['status'] = 'A';
        else if (req.query.status && req.query.status == 'paid') query['status'] = 'S';
        else if (req.query.status && req.query.status == 'more_info') query['status'] = 'M';
        else if (req.query.status && req.query.status == 'cancelled') query['status'] = 'X';
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { date_applied: -1 };
        }

        CashbackClaims.aggregate([{ $match: { status: 'P', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
            .then(totalUnconfirmed => {
                CashbackClaims.aggregate([{ $match: { status: 'C', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                    .then(totalConfirmed => {
                        CashbackClaims.aggregate([{ $match: { status: 'A', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                            .then(totalPayable => {
                                CashbackClaims.aggregate([{ $match: { status: 'S', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                    .then(totalPaid => {
                                        CashbackClaims.aggregate([{ $match: { status: 'X', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                            .then(totalCancelled => {
                                                CashbackClaims.find(query).populate({ path: 'store_id', populate: { path: 'network_id', model: 'affiliate_network' } }).populate('aff_id').skip(skippage).limit(pageLimit).sort(sortQ)
                                                    .then(results => {
                                                        CashbackClaims.countDocuments(query)
                                                            .then(totalCounts => {
                                                                CashbackTransaction.find({ user_id: req.user._id, status: 1, deleted: 0, cb_type: 3 }).then(checkPayout => {
                                                                    return res.status(200).send({
                                                                        success: true,
                                                                        results: results,
                                                                        totalCount: totalCounts,
                                                                        totalUnconfirmed: totalUnconfirmed,
                                                                        totalConfirmed: totalConfirmed,
                                                                        totalPayable: totalPayable,
                                                                        totalPaid: totalPaid,
                                                                        totalCancelled: totalCancelled,
                                                                        checkPayout: checkPayout
                                                                    });
                                                                });
                                                            });
                                                    })
                                            });
                                    });
                            });
                    });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getRevenueCashbackCliams(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { cb_type: parseInt(req.query.cb_type), user_id: req.user._id };

        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        CashbackCredits.aggregate([{ $match: { revenueCreditStatus: 1, revenueCreditUserId: req.user._id, } }, { $group: { _id: null, sum: { $sum: "$revenueCreditAmount" } } }])
            .then(totalUnconfirmed => {
                CashbackCredits.aggregate([{ $match: { revenueCreditStatus: 2, revenueCreditUserId: req.user._id, } }, { $group: { _id: null, sum: { $sum: "$revenueCreditAmount" } } }])
                    .then(totalPaid => {
                        CashbackCredits.find({ revenueCreditUserId: req.user._id, revenueCreditStatus: 1 })
                            .then(unconfirmedList => {
                                CashbackCredits.find({ revenueCreditUserId: req.user._id, revenueCreditStatus: 2 })
                                    .then(paidList => {
                                        CashbackClaims.find(query).populate({ path: 'store_id', populate: { path: 'network_id', model: 'affiliate_network' } }).populate('aff_id').populate('user_id')
                                            .then(results => {
                                                CashbackClaims.countDocuments(query)
                                                    .then(totalCounts => {
                                                        CashbackTransaction.find({ user_id: req.user._id, status: 1, deleted: 0, cb_type: 2 }).then(checkPayout => {
                                                            return res.status(200).send({
                                                                success: true,
                                                                results: results,
                                                                totalCount: totalCounts,
                                                                totalUnconfirmed: totalUnconfirmed,
                                                                totalPaid: totalPaid,
                                                                unconfirmedList: unconfirmedList,
                                                                paidList: paidList,
                                                                checkPayout: checkPayout
                                                            });
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getSkrillCashbacks(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        if (req.user.moneyBookerId == '0' || req.user.moneyBookerId == '') {
            return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, isIdUpdated: false });
        }
        SkrillCashback.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, isIdUpdated: true });
                SkrillCashback.countDocuments(query)
                    .then(totalCounts => {
                        SkrillCashback.aggregate([{ $match: { paymentStatus: 0, skrillId: req.user.moneyBookerId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                            .then(pendingAmount => {
                                SkrillCashback.aggregate([{ $match: { paymentStatus: 1, skrillId: req.user.moneyBookerId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                    .then(paidAmount => {
                                        TurnoverTransaction.find({ user_id: req.user._id, status: 1, tb_type: req.query.tb_type, deleted: 0 })
                                            .then(checkPayout => {
                                                SkrillUsers.find({ user_id: req.user._id, make_payout: 1 })
                                                    .then(makePayout => {
                                                        return res.status(200).send({
                                                            success: true,
                                                            pendingAmount: pendingAmount,
                                                            paidAmount: paidAmount,
                                                            results: results,
                                                            totalCount: totalCounts,
                                                            checkPayout: checkPayout,
                                                            makePayout: makePayout,
                                                            isIdUpdated: true
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getSBOBetCashbacks(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = { user_id: req.user._id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        SbobetUser.findOne({ user_id: req.user._id })
            .then(userBalance => {
                if (!userBalance) return res.status(200).send({ success: false, userBalance: 0, 'results': [], totalCount: 0, });
                SbobetPaid.find({ sbobetId: userBalance.sbobetId }).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
                    .then(results => {
                        SbobetPaid.countDocuments({ sbobetId: userBalance.sbobetId })
                            .then(totalCounts => {
                                TurnoverTransaction.find({ user_id: req.user._id, status: 1, tb_type: req.query.tb_type, deleted: 0 })
                                    .then(checkPayout => {
                                        return res.status(200).send({
                                            success: true,
                                            userBalance: userBalance,
                                            results: results,
                                            checkPayout: checkPayout,
                                            totalCount: totalCounts
                                        });
                                    });
                            }).catch(() => {
                                return res.status(400).send({ success: false, msg: 'Server error' });
                            });
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
function getNetellerCashbacks(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = { user_id: req.user._id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        NetellerUser.findOne({ user_id: req.user._id })
            .then(userBalance => {
                if (!userBalance) return res.status(200).send({ success: false, userBalance: 0, 'results': [], totalCount: 0, });
                NetellerPaid.find({ netellerId: userBalance.netellerId }).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
                    .then(results => {
                        NetellerPaid.countDocuments({ netellerId: userBalance.netellerId })
                            .then(totalCounts => {
                                TurnoverTransaction.find({ user_id: req.user._id, status: 1, tb_type: req.query.tb_type, deleted: 0 })
                                    .then(checkPayout => {
                                        return res.status(200).send({
                                            success: true,
                                            userBalance: userBalance,
                                            results: results,
                                            totalCount: totalCounts,
                                            checkPayout: checkPayout
                                        });
                                    });
                            }).catch(() => {
                                return res.status(400).send({ success: false, msg: 'Server error' });
                            });
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
function getAssianConnectCashbacks(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = { user_id: req.user._id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        AsianconnectUser.findOne({ user_id: req.user._id })
            .then(userBalance => {
                if (!userBalance) return res.status(200).send({ success: false, userBalance: 0, 'results': [], totalCount: 0, });
                AsianconnectPaid.find({ asianconnectId: userBalance.asianconnectId }).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
                    .then(results => {
                        AsianconnectPaid.countDocuments({ asianconnectId: userBalance.asianconnectId })
                            .then(totalCounts => {
                                TurnoverTransaction.find({ user_id: req.user._id, status: 1, tb_type: req.query.tb_type, deleted: 0 })
                                    .then(checkPayout => {
                                        return res.status(200).send({
                                            success: true,
                                            userBalance: userBalance,
                                            results: results,
                                            totalCount: totalCounts,
                                            checkPayout: checkPayout
                                        });
                                    });
                            }).catch(() => {
                                return res.status(400).send({ success: false, msg: 'Server error 1' });
                            });
                    }).catch(() => {
                        return res.status(400).send({ success: false, msg: 'Server error 2' });
                    });
            }).catch((err) => {
                console.log(err);
                return res.status(400).send({ success: false, msg: err });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getEcopayzCashbacks(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        EcopayUsers.findOne({ user_id: req.user._id })
            .then(userBalance => {
                if (!userBalance) return res.status(200).send({ success: false, totalComm: 0, userBalance: 0, totalSum: 0, 'results': [], totalCount: 0, });
                EcopayCashback.find({ ecopayzId: userBalance.ecopayzId }).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
                    .then(results => {
                        EcopayCashback.countDocuments({ ecopayzId: userBalance.ecopayzId })
                            .then(totalCounts => {
                                EcopayCashback.aggregate([{ $match: { paymentStatus: 0, ecopayzId: userBalance.ecopayzId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                    .then(pendingAmount => {
                                        EcopayCashback.aggregate([{ $match: { paymentStatus: 1, ecopayzId: userBalance.ecopayzId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                            .then(paidAmount => {
                                                TurnoverTransaction.find({ user_id: req.user._id, status: 1, tb_type: req.query.tb_type, deleted: 0 })
                                                    .then(checkPayout => {
                                                        return res.status(200).send({
                                                            success: true,
                                                            userBalance: userBalance,
                                                            pendingAmount: pendingAmount,
                                                            paidAmount: paidAmount,
                                                            results: results,
                                                            totalCount: totalCounts,
                                                            checkPayout: checkPayout
                                                        });
                                                    });
                                            });
                                    });
                            });
                    }).catch(() => {
                        return res.status(400).send({ success: false, msg: 'Server error' });
                    });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function requestPayout(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { cb_type, value } = body;
        let activityname = '';
        let activitytype = '';
        if (cb_type == 2) {
            activityname = "Revenue Share Cashback Payout Request";
            activitytype = "RevenuePayout";
        } else if (cb_type == 3) {
            activityname = "Cashback Payout Request";
            activitytype = "CashbackPayout";
        } else if (cb_type == 4) {
            activityname = "Affiliate Payout Request";
            activitytype = "AffiliatePayout";
        }
        CashbackTransaction.find({ user_id: req.user._id, status: 1, deleted: 0, cb_type: cb_type }).then(checkPayout => {

            if (checkPayout.length > 0) return res.status(401).send({ success: false, msg: 'Sorry! You cannot make payout request.' });
            const newPayout = new CashbackTransaction();
            newPayout.user_id = req.user._id;
            newPayout.cb_type = cb_type;
            newPayout.value = value;
            newPayout.status = 1;
            newPayout.save((err, doc) => {
                // console.log('err',err);
                if (err) {
                    return res.status(401).send({ success: true, msg: 'Server error!' });
                }
                // console.log('doc',doc);
                let insertedId = doc._id;
                EmailTemplates.findOne({ template_name: 'withdrawal_request' })
                    .then(emailRow => {
                        var subject = emailRow.template_subject;
                        var htmlStr = emailRow.template_content;
                        var subjectHtml = subject.replace(/{AMOUNT}/g, '£' + value);
                        var resultHtml = htmlStr.replace(/{USER_NAME}/g, req.user.name);
                        resultHtml = resultHtml.replace(/{ID}/g, req.user.epiCode);
                        resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                        resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                        resultHtml = resultHtml.replace(/{AMOUNT}/g, '£' + value);
                        var toEmail = req.user.email;
                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                        const activityData = new ActivityStatement();
                        activityData.activity_userid = req.user._id;
                        activityData.activity_tableid = insertedId;
                        activityData.activity_name = activityname;
                        activityData.activity_type = activitytype;
                        activityData.activity_status = 'Pending';
                        activityData.activity_amount = value;
                        activityData.activity_added = Date.now();
                        activityData.save();
                        return res.status(201).send({ success: true, msg: 'Your payout request has been sent !' });
                    });

            });
        });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function requestTurnoverPayout(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { tb_type, value, scheme, cashback_user_id } = body;
        let activityname = '';
        let activitytype = 'TurnoverPayout';
        if (scheme == 1) {
            activityname = "Turnover Cashback Skrill Payout Request";
        } else if (scheme == 2) {
            activityname = "Turnover Cashback Neteller Payout Request";
        } else if (scheme == 3) {
            activityname = "Turnover Cashback Ecopayz Payout  Request";
        } else if (scheme == 4) {
            activityname = "Turnover Cashback SBOBet Payout  Request";
        } else if (scheme == 5) {
            activityname = "Turnover Cashback AsianConnect88 Payout Request";
        }
        TurnoverTransaction.find({ user_id: req.user._id, status: 1, deleted: 0, tb_type: tb_type }).then(checkPayout => {

            if (checkPayout.length > 0) return res.status(401).send({ success: false, msg: 'Sorry! You cannot make payout request.' });
            const newPayout = new TurnoverTransaction();
            newPayout.cashback_user_id = cashback_user_id;
            newPayout.user_id = req.user._id;
            newPayout.tb_type = tb_type;
            newPayout.scheme = scheme;
            newPayout.value = value;
            newPayout.status = 1;
            newPayout.save((err, doc) => {
                // console.log('err',err);
                if (err) {
                    return res.status(401).send({ success: true, msg: 'Server error!' });
                }
                // console.log('doc',doc);
                let insertedId = doc._id;
                EmailTemplates.findOne({ template_name: 'withdrawal_request' })
                    .then(emailRow => {
                        var subject = emailRow.template_subject;
                        var htmlStr = emailRow.template_content;
                        var subjectHtml = subject.replace(/{AMOUNT}/g, '£' + value);
                        var resultHtml = htmlStr.replace(/{USER_NAME}/g, req.user.name);
                        resultHtml = resultHtml.replace(/{ID}/g, req.user.epiCode);
                        resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                        resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                        resultHtml = resultHtml.replace(/{AMOUNT}/g, '£' + value);
                        var toEmail = req.user.email;
                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                        const activityData = new ActivityStatement();
                        activityData.activity_userid = req.user._id;
                        activityData.activity_tableid = insertedId;
                        activityData.activity_name = activityname;
                        activityData.activity_type = activitytype;
                        activityData.activity_status = 'Pending';
                        activityData.activity_amount = value;
                        activityData.activity_added = Date.now();
                        activityData.save();
                        if (scheme == 1) {
                            let updateData = {};
                            updateData.make_payout = 0;
                            SkrillUsers.findOneAndUpdate({ skrill_id: cashback_user_id }, { $set: updateData }).then(() => {
                                return res.status(201).send({ success: true, msg: 'Your payout request has been sent !' });
                            }).catch(() => {
                                return res.status(400).send({ success: false, msg: 'Server error' });
                            });
                        } else if (scheme == 3) {
                            let updateData = {};
                            updateData.make_payout = 0;
                            NetellerUser.findOneAndUpdate({ netellerId: cashback_user_id }, { $set: updateData }).then(() => {

                                return res.status(201).send({ success: true, msg: 'Your payout request has been sent !' });
                            }).catch(() => {
                                return res.status(400).send({ success: false, msg: 'Server error f' });
                            });
                        }
                        return res.status(201).send({ success: true, msg: 'Your payout request has been sent !' });
                    });

            });
        });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function updatePaymentDetails(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, accountSkrillEmail, accountNetellerEmail
            , accountPaypalEmail, bankAccountName, bankAccountNumber, bankAccountSortCode } = body.userData;
        User.findById({
            _id: _id
        }).then(user => {
            if (!user) return res.status(401).send({ success: false, message: 'Invalid account.' });
            let updateData = {};
            if (body.type == 1) updateData.accountSkrillEmail = accountSkrillEmail;
            if (body.type == 2) updateData.accountNetellerEmail = accountNetellerEmail;
            if (body.type == 3) updateData.accountPaypalEmail = accountPaypalEmail;
            if (body.type == 4) {
                updateData.bankAccountName = bankAccountName;
                updateData.bankAccountNumber = bankAccountNumber;
                updateData.bankAccountSortCode = bankAccountSortCode;
            }
            User.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                .then(() => {
                    EmailTemplates.findOne({ template_name: 'payment_change' })
                        .then(emailRow => {
                            var subject = emailRow.template_subject;
                            var htmlStr = emailRow.template_content;
                            var subjectHtml = subject;
                            var resultHtml = htmlStr.replace(/{USER_NAME}/g, req.user.name);
                            resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                            resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                            var toEmail = req.user.email;
                            sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                            return res.status(201).send({ success: true, msg: 'Payment details updated successfully' });
                        });
                }).catch(() => {

                    return res.status(500).send({ success: false, msg: 'server error11' })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateUserAccount(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;

        const { _id, name, last_name, email, username, upassword, cpassword, accountPhone,
            accountCountry, accountAddress, accountDob } = body.userData;
        if (!name) return res.status(401).send({ success: false, message: 'Please enter your name.' });
        else if (!username) return res.status(401).send({ success: false, message: 'Please enter your username.' });
        else if (!email) return res.status(401).send({ success: false, message: 'Please enter your email address.' });
        else if (!accountPhone) return res.status(400).send({ success: false, message: 'Please enter the phone number.' });
        else if (upassword) {
            if (!cpassword) return res.status(401).send({ success: false, message: 'Please confirm your password.' });
        }

        User.findById({
            _id: _id
        })
            .then(user => {
                if (!user) return res.status(401).send({ success: false, message: 'Invalid account.' });
                User.find({ email: email, accountDeleted: 0, _id: { $ne: _id } })
                    .then(existEmail => {
                        if (existEmail.length > 0) return res.status(400).send({ success: false, msg: 'Email address  already exists.' });
                        User.find({ username: username, accountDeleted: 0, _id: { $ne: _id } })
                            .then(exisUsername => {
                                if (exisUsername.length > 0) return res.status(400).send({ success: false, msg: 'Username already exists.' });
                                let updateData = {};
                                updateData.name = name;
                                updateData.last_name = last_name;
                                updateData.username = username;
                                updateData.email = email;
                                updateData.accountPhone = accountPhone;
                                updateData.accountAddress = accountAddress;
                                updateData.accountDob = accountDob;
                                updateData.accountCountry = accountCountry;
                                if (upassword) {
                                    var passwordSalt = genRandomPassword(32);
                                    var userPassword = getCryptedPassword(upassword, passwordSalt);
                                    updateData.password = userPassword + ':' + passwordSalt;
                                }

                                User.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                                    .then(() => {
                                        return res.status(201).send({ success: true, msg: 'Account updated successfully' });
                                    }).catch((err) => {
                                        console.log(err)
                                        return res.status(500).send({ success: false, msg: 'server error11' })
                                    })
                            }).catch((err) => {
                                console.log(err)
                                return res.status(500).send({ success: false, msg: 'server error44' })
                            })
                    }).catch((err) => {
                        console.log(err)
                        return res.status(500).send({ success: false, msg: 'server error22' })
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
function getUserActivities(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { activity_deleted: 0, activity_disabled: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { activity_added: 1 };
        }

        ActivityStatement.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                ActivityStatement.countDocuments(query)
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
function getDashboardStats(req, res) {
    const token = getToken(req.headers);
    if (token) {
        // console.log('req.user', req.user);
        CashbackClaims.aggregate([{ $match: { status: 'P', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
            .then(totalUnconfirmCB => {
                CashbackClaims.aggregate([{ $match: { status: 'C', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                    .then(totalConfirmedCB => {
                        CashbackClaims.aggregate([{ $match: { status: 'A', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                            .then(totalPayableCB => {
                                CashbackClaims.aggregate([{ $match: { status: 'S', user_id: req.user._id, cb_type: '3' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                    .then(totalPaidCB => {
                                        CashbackCredits.aggregate([{ $match: { revenueCreditStatus: '1', revenueCreditUserId: req.user._id, revenueRafBonus: 0 } }, { $group: { _id: null, sum: { $sum: "$revenueCreditAmount" } } }])
                                            .then(totalPendingRB => {
                                                CashbackCredits.aggregate([{ $match: { revenueCreditStatus: '2', revenueCreditUserId: req.user._id, revenueRafBonus: 0 } }, { $group: { _id: null, sum: { $sum: "$revenueCreditAmount" } } }])
                                                    .then(totalPaidRB => {
                                                        SbobetUser.findOne({ user_id: req.user._id }).then((sbobetRes) => {
                                                            NetellerUser.findOne({ user_id: req.user._id }).then((netellerRes) => {
                                                                AsianconnectUser.findOne({ user_id: req.user._id }).then((assianConnectRes) => {
                                                                    SkrillCashback.aggregate([{ $match: { paymentStatus: 0, skrillId: req.user.moneyBookerId } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                                                        .then(totalSkrillPending => {
                                                                            SkrillCashback.aggregate([{ $match: { paymentStatus: 1, skrillId: req.user.moneyBookerId } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                                                                .then(totalSkrillPaid => {
                                                                                    EcopayUsers.findOne({ user_id: req.user._id }).then((ecoPayUser) => {
                                                                                        let ecopayzId = (ecoPayUser) ? ecoPayUser.ecopayzId : null;
                                                                                        EcopayCashback.aggregate([{ $match: { paymentStatus: 0, ecopayzId: ecopayzId } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                                                                            .then(totalEcopayPending => {
                                                                                                EcopayCashback.aggregate([{ $match: { paymentStatus: 1, ecopayzId: ecopayzId } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                                                                                    .then(totalEcopayPaid => {
                                                                                                        return res.status(200).send({
                                                                                                            success: true,
                                                                                                            totalUnconfirmCB: totalUnconfirmCB,
                                                                                                            totalConfirmedCB: totalConfirmedCB,
                                                                                                            totalPayableCB: totalPayableCB,
                                                                                                            totalPaidCB: totalPaidCB,
                                                                                                            totalPendingRB: totalPendingRB,
                                                                                                            totalPaidRB: totalPaidRB,
                                                                                                            sbobetRes: sbobetRes,
                                                                                                            netellerRes: netellerRes,
                                                                                                            assianConnectRes: assianConnectRes,
                                                                                                            totalSkrillPending: totalSkrillPending,
                                                                                                            totalSkrillPaid: totalSkrillPaid,
                                                                                                            totalEcopayPending: totalEcopayPending,
                                                                                                            totalEcopayPaid: totalEcopayPaid,
                                                                                                        });
                                                                                                    });
                                                                                            });
                                                                                    });
                                                                                });
                                                                        });
                                                                });
                                                            });
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }

}
function getAffilatesStats(req, res) {
    var currentDate = moment();
    var month = currentDate.format('M');
    var day = currentDate.format('D');
    var year = currentDate.format('YYYY');
    var arrMonthOfYears = [];
    var arrDaysOfMonth = [];
    for (var cM = 1; cM <= month; cM++) { // '2016-03-12 13:00:00'
        arrMonthOfYears.push(moment(year + '-' + cM + '-01'));
    }
    for (var cD = 1; cD <= day; cD++) { // '2016-03-12 13:00:00'
        arrDaysOfMonth.push(moment(year + '-' + month + '-'+cD));
    }
    var arrResults = [];
    async.forEach(arrMonthOfYears,function getStats(obj,callback){
        console.log('obj',obj);
      
        ActivityStatement.countDocuments({ activity_deleted: 0, activity_disabled: 0 })
        .then(colCounts => {console.log('colCounts',colCounts);
            arrResults.push(colCounts);
        });
    },function completed(err){

    });
    console.log('arrResults', arrResults);
    // console.log('arrMonthOfYears', arrMonthOfYears);
    // console.log('arrDaysOfMonth', arrDaysOfMonth);
    // console.log(currentDate);
    console.log('month', month);
    console.log('day', day);
    console.log('year', year);

    return res.status(403).send({ success: false, msg: 'Unauthorised' });
}
module.exports = {
    getCashbackCliams,
    getRevenueCashbackCliams,
    getDashboardStats,
    getSkrillCashbacks,
    getSBOBetCashbacks,
    getNetellerCashbacks,
    getAssianConnectCashbacks,
    getEcopayzCashbacks,
    requestPayout,
    requestTurnoverPayout,
    updatePaymentDetails,
    updateUserAccount,
    getUserActivities,
    getAffilatesStats
}

