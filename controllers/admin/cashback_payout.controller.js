const CashbackClaims = require('../../models/cashback_claims');
const CashbackTransaction = require('../../models/Cashback_transactions');
const TurnoverTransaction = require('../../models/Turnover_transactions');
const EmailTemplates = require('../../models/Email_template');
const User = require('../../models/User');
const CashbackCredits = require('../../models/Cashback_credits');
const SkrillUsers = require('../../models/Skrill_users');
const SkrillCashback = require('../../models/Skrill_cashback');
const EcopayCashback = require('../../models/Ecopayz_cashback');
const EcopayUsers = require('../../models/Ecopayz_users');
const SbobetUser = require('../../models/Sbobet_user');
const SbobetPaid = require('../../models/Sbobet_paid');
const NetellerUser = require('../../models/Neteller_user');
const NetellerPaid = require('../../models/Neteller_paid');
const AsianconnectUser = require('../../models/Asianconnect_user');
const AsianconnectPaid = require('../../models/Asianconnect_paid');
const AppSubscriptionCase = require('../../models/App_subscription_case');
const { getToken, sendCustomMail } = require('../../utils/api.helpers');
const config = require('../../config/config');
function updatePayouts(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id } = body;
        let payment_type = '';
        let payment_email = '';
        if (body.payment_type == 1) {
            payment_type = 'PayPal';
        } else if (body.payment_type == 2) {
            payment_type = 'Skrill';
        } else if (body.payment_type == 3) {
            payment_type = 'Bank Transfer';
        } else if (body.payment_type == 4) {
            payment_type = 'Neteller';
        }
        if (body.payment_type != 3) {
            payment_email = ' to ' + body.payment_email;
        }
        CashbackTransaction.findById({
            _id: _id
        }).then(payoutRow => {
            if (!payoutRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};
            updateData.value = body.value;
            updateData.payment_type = body.payment_type;
            updateData.payment_email = body.payment_email;
            updateData.notes = body.notes;
            updateData.trans_date = body.trans_date;
            updateData.status = 2;
            CashbackTransaction.findByIdAndUpdate({ _id: payoutRow._id }, { $set: updateData })
                .then(() => {
                    User.findById({
                        _id: payoutRow.user_id
                    }).then(userRow => {
                        EmailTemplates.findOne({ template_name: 'new_payout_mail_to_user' })
                            .then(emailRow => {
                                var subject = emailRow.template_subject;
                                var htmlStr = emailRow.template_content;
                                var subjectHtml = subject.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, userRow.name);
                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                                resultHtml = resultHtml.replace(/{TRANS_DATE}/g, (body.trans_date) ? body.trans_date : '');
                                resultHtml = resultHtml.replace(/{PAYMENT_TYPE}/g, payment_type);
                                resultHtml = resultHtml.replace(/{PAYMENT_EMAIL}/g, payment_email);
                                var toEmail = userRow.email;
                                if (payoutRow.cb_type == 3) {
                                    let updateTxnData = {};
                                    updateTxnData.status = 'S';
                                    updateTxnData.date_paid = body.trans_date;
                                    CashbackClaims.update({ status: 'A', raf_case_id: 0, cb_type: payoutRow.cb_type, user_id: payoutRow.user_id }, updateTxnData, { multi: true }, function (err) {
                                        if (err) return res.status(400).send({ success: true, msg: err });
                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                    });
                                } else if (payoutRow.cb_type == 2) {
                                    let updateTxnData = {};
                                    updateTxnData.revenueCreditStatus = 2;
                                    updateTxnData.revenueCreditPaid = body.trans_date;
                                    updateTxnData.revenueCreditPaymentType = body.payment_type;
                                    CashbackCredits.update({
                                        revenueCreditStatus: 1,
                                        revenueRafBonus: 0,
                                        revenueCreditDeleted: 0,
                                        revenueCreditUserId: payoutRow.user_id
                                    }, updateTxnData, { upsert: false }, function (err) {
                                        if (err) return res.status(400).send({ success: true, msg: err });
                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                    });
                                } else if (payoutRow.cb_type == 4) {
                                    let updateTxnData = {};
                                    updateTxnData.status = 'S';
                                    updateTxnData.date_paid = body.trans_date;
                                    CashbackClaims.update({ status: 'A', raf_case_id: { $ne: 0 }, cb_type: payoutRow.cb_type, user_id: payoutRow.user_id }, updateTxnData, { multi: true }, function (err) {
                                        if (err) return res.status(400).send({ success: true, msg: err });
                                        let updateTxnData = {};
                                        updateTxnData.revenueCreditStatus = 2;
                                        updateTxnData.revenueCreditPaid = body.trans_date;
                                        updateTxnData.revenueCreditPaymentType = body.payment_type;
                                        CashbackCredits.update({
                                            revenueCreditStatus: 1,
                                            revenueRafBonus: 1,
                                            revenueCreditDeleted: 0,
                                            revenueCreditUserId: payoutRow.user_id
                                        }, updateTxnData, { upsert: false }, function (err) {
                                            if (err) return res.status(400).send({ success: true, msg: err });
                                            let updateTxnData = {};
                                            updateTxnData.status = 'Paid';
                                            updateTxnData.paid = Date.now();

                                            AppSubscriptionCase.update({
                                                status: 'Confirm',
                                                paid: 0,
                                                refid: payoutRow.user_id
                                            }, updateTxnData, { upsert: false }, function (err) {
                                                if (err) return res.status(400).send({ success: true, msg: err });
                                                sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                                return res.status(201).send({ success: true, msg: 'Payout updated successfully' });

                                            });

                                        });
                                    });
                                }
                            }).catch(err => {
                                return res.json({ success: false, msg: 'server error' })
                            })
                    });
                }).catch((err) => {

                    return res.status(500).send({ success: false, msg: err })
                })

        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function rejectPayout(req, res) {

    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id } = body;
        CashbackTransaction.findById({
            _id: _id
        }).then(payoutRow => {
            if (!payoutRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.deleted = 1;
            updateData.deletedReason = body.reason;
            CashbackTransaction.findByIdAndUpdate({ _id: payoutRow._id }, { $set: updateData }).then(() => {
                User.findById({
                    _id: payoutRow.user_id
                }).then(userRow => {
                    EmailTemplates.findOne({ template_name: 'rejected_payout_mail_to_user' })
                        .then(emailRow => {
                            var subject = emailRow.template_subject;
                            var htmlStr = emailRow.template_content;
                            var subjectHtml = subject.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                            var resultHtml = htmlStr.replace(/{USER_NAME}/g, userRow.name);
                            resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                            resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                            resultHtml = resultHtml.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                            resultHtml = resultHtml.replace(/{TRANS_DATE}/g, payoutRow.added);
                            resultHtml = resultHtml.replace(/{REASON}/g, body.reason);
                            var toEmail = userRow.email;
                            sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                            return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                        }).catch(err => {
                            return res.status(500).send({ success: false, msg: 'server error' })

                        })
                });
            });
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err })
            else return next({ status: 500, msg: 'server error' })
        })

    }
}

function getCashbackPauouts(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted: 0, cb_type: parseInt(req.query.cb_type),status: { $ne: 0 } }; 
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.filterByType && req.query.filterByType != 'all') {
            query['payment_type'] = req.query.filterByType;
        }
        if (req.query.filterByStatus && req.query.filterByStatus != 'all') {
            query['status'] = req.query.filterByStatus;
        }
        sortQ = { status: 1 };
        CashbackTransaction.find(query)
            .populate('user_id')
            .skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackTransaction.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            }).catch((err) => res.status(400).send({ success: false, msg: err }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



function getPayoutRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackTransaction.findById(req.query._id).populate('user_id')
            .then(payoutRow => {
                if (payoutRow.length === 0) return res.status(200).send({ success: false });
                return res.status(200).send({ success: true, 'results': payoutRow });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getPayoutsToExport(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { cb_type: parseInt(req.query.cb_type) };
        CashbackTransaction.find(query).
            populate('user_id')
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                return res.status(200).send({ success: true, results: results });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getTurnoverCashbackPayouts(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted: 0 };//
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.filterByType && req.query.filterByType != 'all') {
            query['payment_type'] = req.query.filterByType;
        }
        if (req.query.filterByStatus && req.query.filterByStatus != 'all') {
            query['status'] = req.query.filterByStatus;
        }
        sortQ = { status: -1 };
        console.log(query);
        TurnoverTransaction.find(query)
            .populate('user_id')
            .populate('tb_type')
            .skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                TurnoverTransaction.countDocuments(query)
                    .then(totalCounts => {

                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch((err) => res.status(400).send({ success: false, msg: err }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getTurnoverPayoutRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        TurnoverTransaction.findById(req.query._id).populate('user_id').populate('tb_type')
            .then(payoutRow => {
                if (payoutRow.length === 0) return res.status(200).send({ success: false });
                return res.status(200).send({ success: true, 'results': payoutRow });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateTurnoverPayouts(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id } = body;
        let payment_type = '';
        let payment_email = '';
        if (body.payment_type == 1) {
            payment_type = 'PayPal';
        } else if (body.payment_type == 2) {
            payment_type = 'Skrill';
        } else if (body.payment_type == 3) {
            payment_type = 'Bank Transfer';
        } else if (body.payment_type == 4) {
            payment_type = 'Neteller';
        }
        if (body.payment_type != 3) {
            payment_email = ' to ' + body.payment_email;
        }
        TurnoverTransaction.findById({
            _id: _id
        }).then(payoutRow => {
            if (!payoutRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};
            updateData.payment_type = body.payment_type;
            updateData.payment_email = body.payment_email;
            updateData.notes = body.notes;
            updateData.trans_date = body.trans_date;
            updateData.status = 2;
            TurnoverTransaction.findByIdAndUpdate({ _id: payoutRow._id }, { $set: updateData })
                .then(() => {
                    User.findById({
                        _id: payoutRow.user_id
                    }).then(userRow => {

                        EmailTemplates.findOne({ template_name: 'new_payout_mail_to_user' })
                            .then(emailRow => {
                                var currency = '&euro;';
                                var subject = emailRow.template_subject;
                                var htmlStr = emailRow.template_content;
                                var subjectHtml = subject.replace(/{AMOUNT}/g, '€' + payoutRow.value);
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, userRow.name);
                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{AMOUNT}/g, currency + payoutRow.value);
                                resultHtml = resultHtml.replace(/{TRANS_DATE}/g, (body.trans_date) ? body.trans_date : '');
                                resultHtml = resultHtml.replace(/{PAYMENT_TYPE}/g, payment_type);
                                resultHtml = resultHtml.replace(/{PAYMENT_EMAIL}/g, payment_email);
                                var toEmail = userRow.email;

                                if (payoutRow.scheme == 1) {
                                    let updateTxnData = {};
                                    updateTxnData.paymentStatus = 1;
                                    let updateUserData = {};
                                    updateUserData.moneyBookerAwardto = 1;
                                    SkrillCashback.update({ paymentStatus: 0, skrillId: payoutRow.cashback_user_id }, updateTxnData, { multi: true }, function (err) {
                                        User.update({ moneyBookerAwardto: 0, moneyBookerId: payoutRow.cashback_user_id }, updateUserData, { upsert: false }, function (err) {
                                            sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                            return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                        });
                                    });
                                } else if (payoutRow.scheme == 5) {
                                    let updateTxnData = {};
                                    updateTxnData.paymentStatus = 1;
                                    EcopayCashback.update({ paymentStatus: 0, ecopayzId: payoutRow.cashback_user_id }, updateTxnData, { multi: true }, function (err) {
                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                    });
                                } else if (payoutRow.scheme == 2) {
                                    SbobetUser.findOne({ sbobetId: payoutRow.cashback_user_id })
                                        .then(results => {
                                            let paidAmount = (results.paidAmount) ? results.paidAmount : 0;
                                            let pendingAmount = (results.pendingAmount) ? results.pendingAmount : 0;
                                            let totalPaidAmount = Math.round(paidAmount + pendingAmount);
                                            let updateData = {};
                                            updateData.paidAmount = totalPaidAmount;
                                            updateData.pendingAmount = 0;
                                            SbobetUser.findByIdAndUpdate({ _id: results._id }, { $set: updateData })
                                                .then(() => {
                                                    const paidData = new SbobetPaid();
                                                    paidData.userId = results.user_id;
                                                    paidData.sbobetId = results.sbobetId;
                                                    paidData.amount = Math.round(pendingAmount);
                                                    paidData.paidOn = Date.now();
                                                    paidData.save((err, doc) => {
                                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                                    });
                                                }).catch(() => {
                                                    return res.status(400).send({ success: false, msg: 'Server error t' });
                                                });

                                        }).catch((err) => {
                                            console.log(err);
                                            return res.status(400).send({ success: false, msg: 'Server error s' });
                                        });
                                } else if (payoutRow.scheme == 3) {

                                    NetellerUser.findOne({ netellerId: payoutRow.cashback_user_id })
                                        .then(results => {
                                            let paidAmount = results.paidAmount;
                                            let pendingAmount = results.pendingAmount;
                                            let totalPaidAmount = Math.round(paidAmount + pendingAmount);
                                            let updateData = {};
                                            updateData.paidAmount = totalPaidAmount;
                                            updateData.pendingAmount = 0;
                                            NetellerUser.findByIdAndUpdate({ _id: results._id }, { $set: updateData })
                                                .then(() => {
                                                    const paidData = new NetellerPaid();
                                                    paidData.userId = results.user_id;
                                                    paidData.netellerId = results.netellerId;
                                                    paidData.amount = Math.round(pendingAmount);
                                                    paidData.paidOn = Date.now();
                                                    paidData.save((err, doc) => {
                                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                                    });
                                                }).catch(() => {
                                                    return res.status(400).send({ success: false, msg: 'Server error' });
                                                });

                                        }).catch(() => {
                                            return res.status(400).send({ success: false, msg: 'Server error' });
                                        });

                                } else if (payoutRow.scheme == 4) {
                                    AsianconnectUser.findOne({ asianconnectId: payoutRow.cashback_user_id })
                                        .then(results => {
                                            let paidAmount = results.paidAmount;
                                            let pendingAmount = results.pendingAmount;
                                            let totalPaidAmount = Math.round(paidAmount + pendingAmount);
                                            let updateData = {};
                                            updateData.paidAmount = totalPaidAmount;
                                            updateData.pendingAmount = 0;
                                            AsianconnectUser.findByIdAndUpdate({ _id: results._id }, { $set: updateData })
                                                .then(() => {
                                                    const paidData = new AsianconnectPaid();
                                                    paidData.userId = results.user_id;
                                                    paidData.asianconnectId = results.asianconnectId;
                                                    paidData.amount = Math.round(pendingAmount);
                                                    paidData.paidOn = Date.now();
                                                    paidData.save((err, doc) => {
                                                        sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                                        return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                                    });
                                                }).catch(() => {
                                                    return res.status(400).send({ success: false, msg: 'Server error' });
                                                });
                                        }).catch(() => {
                                            return res.status(400).send({ success: false, msg: 'Server error' });
                                        });
                                }
                            }).catch(err => {
                                return res.json({ success: false, msg: 'server error' })
                            })
                    });
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: err })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getTurnoverPayoutsToExport(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = {};
        TurnoverTransaction.find(query).
            populate('user_id')
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                return res.status(200).send({ success: true, results: results });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function rejectTurnoverPayout(req, res) {

    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id } = body;
        TurnoverTransaction.findById({
            _id: _id
        }).then(payoutRow => {
            if (!payoutRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.deleted = 1;
            updateData.deletedReason = body.reason;
            TurnoverTransaction.findByIdAndUpdate({ _id: payoutRow._id }, { $set: updateData }).then(() => {
                User.findById({
                    _id: payoutRow.user_id
                }).then(userRow => {

                    EmailTemplates.findOne({ template_name: 'rejected_payout_mail_to_user' })
                        .then(emailRow => {
                            var subject = emailRow.template_subject;
                            var htmlStr = emailRow.template_content;
                            var subjectHtml = subject.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                            var resultHtml = htmlStr.replace(/{USER_NAME}/g, userRow.name);
                            resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                            resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                            resultHtml = resultHtml.replace(/{AMOUNT}/g, '£' + payoutRow.value);
                            resultHtml = resultHtml.replace(/{TRANS_DATE}/g, payoutRow.added);
                            resultHtml = resultHtml.replace(/{REASON}/g, body.reason);
                            var toEmail = userRow.email;
                            if (payoutRow.scheme == 1) {
                                /* Skrill */
                                let updateData = {};
                                updateData.make_payout = 1;
                                SkrillUsers.findOneAndUpdate({ skrill_id: payoutRow.cashback_user_id }, { $set: updateData }).then(() => {
                                    sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                    return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                }).catch(() => {
                                    return res.status(400).send({ success: false, msg: 'Server error b' });
                                });
                            } else if (payoutRow.scheme == 2) {
                                /* Sbobet */
                                sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                            } else if (payoutRow.scheme == 3) {
                                /* Neteller */
                                let updateData = {};
                                updateData.make_payout = 1;
                                NetellerUser.findOneAndUpdate({ netellerId: payoutRow.cashback_user_id }, { $set: updateData }).then(() => {
                                    sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                    return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                }).catch(() => {
                                    return res.status(400).send({ success: false, msg: 'Server error f' });
                                });
                            } else if (payoutRow.scheme == 4) {
                                /* Asianconnect */
                                sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                            } else if (payoutRow.scheme == 5) {
                                /* Ecopay */
                                let updateData = {};
                                updateData.make_payout = 1;
                                EcopayUsers.findOneAndUpdate({ ecopayzId: payoutRow.cashback_user_id }, { $set: updateData }).then(() => {
                                    sendCustomMail(toEmail, toEmail, resultHtml, subjectHtml);
                                    return res.status(201).send({ success: true, msg: 'Payout updated successfully' });
                                }).catch(() => {
                                    return res.status(400).send({ success: false, msg: 'Server error a' });
                                });
                            }
                        }).catch(err => {
                            return res.status(500).send({ success: false, msg: 'server error s' })
                        })
                });
            });
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err })
            else return next({ status: 500, msg: 'server error' })
        })

    }
}
module.exports = {
    getCashbackPauouts,
    getPayoutsToExport,
    updatePayouts,
    getPayoutRowById,
    rejectPayout,
    getTurnoverCashbackPayouts,
    getTurnoverPayoutRowById,
    updateTurnoverPayouts,
    getTurnoverPayoutsToExport,
    rejectTurnoverPayout
}

