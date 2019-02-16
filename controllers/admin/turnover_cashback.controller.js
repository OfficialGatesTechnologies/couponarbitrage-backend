const SkrillUsers = require('../../models/Skrill_users');
const SkrillCashback = require('../../models/Skrill_cashback');
const ActivityStatement = require('../../models/Activity_statement');
const User = require('../../models/User');
const SiteConfig = require('../../models/Site_config');
const SbobetCashback = require('../../models/Sbobet_cashback');
const SbobetUser = require('../../models/Sbobet_user');
const SbobetPaid = require('../../models/Sbobet_paid');
const NetellerCashback = require('../../models/Neteller_cashback');
const NetellerUser = require('../../models/Neteller_user');
const NetellerPaid = require('../../models/Neteller_paid');
const { getToken, genRandomPassword } = require('../../utils/api.helpers');
const fs = require('fs');
const path = require('path');
const CsvReadableStream = require('csv-reader');
const eachSeries = require('async-each-series');
var md5 = require('md5');


function uploadCashbacks(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        if (!req.files) {
            return res.status(400).send({ success: false, message: 'Please select valid file.' });
        }
        let imageFile = req.files.file;
        let imageName = req.files.file.name;
        let imageExt = imageName.split('.').pop();
        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
        let filename = path.join(__dirname, '../../uploads/csv/' + newFileName);
        imageFile.mv(filename);
        let inputStream = fs.createReadStream(filename, 'utf8');
        let cashbackData = [];
        inputStream.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                cashbackData.push(row);
            }).on('end', function () {
                eachSeries(cashbackData, function (row, callback) {
                    let skrill_id = row[10];
                    let skrillUserData = {};
                    skrillUserData.skrill_id = skrill_id;
                    skrillUserData.make_payout = 1;
                    SkrillUsers.findOne({ skrill_id: skrill_id }).then(existUserRow => {
                        let existAmount = 0;
                        let existSiteCom = 0;
                        if (existUserRow) {
                            existAmount = existUserRow.total_amount;
                            existSiteCom = existUserRow.site_commission;
                        }
                        let totalAmount = Math.round(row[21] + existAmount);

                        skrillUserData.total_amount = totalAmount;
                        // skrillUserData.user_id = '5c39bc90327e543ff8c14516';
                        SiteConfig.findOne({ config_module: 'GeneralSitewide' }).then(configRow => {
                            let skrill_cashback = 50;
                            if (configRow) skrill_cashback = configRow.skrill_cashback_value;
                            let siteCommission = Math.round(row[21] * skrill_cashback) / 100;
                            let totalComission = Math.round(siteCommission + existSiteCom);
                            skrillUserData.site_commission = totalComission;
                            SkrillUsers.update({ skrill_id: skrill_id }, skrillUserData, { upsert: true }, function (err, userDoc) {
                                if (err) return res.status(400).send({ success: true, msg: err });
                                const cashbackData = new SkrillCashback();
                                // cashbackData.user_id = '5c39bc90327e543ff8c14516';
                                cashbackData.rowid = row[0];
                                cashbackData.skrillId = skrill_id;
                                cashbackData.currencySymbol = row[1];
                                cashbackData.currency = row[1];
                                cashbackData.totalRecords = row[2];
                                cashbackData.merchant = row[3];
                                cashbackData.affiliateID = row[4];
                                cashbackData.username = row[5];
                                cashbackData.siteID = row[6];
                                cashbackData.creativeID = row[7];
                                cashbackData.creativeName = row[8];
                                cashbackData.type = row[9];
                                cashbackData.memberID = row[10];
                                cashbackData.registrationDate = row[11];
                                cashbackData.registrationDateTime = row[11];
                                cashbackData.memberName = row[12];
                                cashbackData.membercountry = row[13];
                                cashbackData.ACID = row[14];
                                cashbackData.deposits = row[15];
                                cashbackData.bonus = row[16];
                                cashbackData.netTransToFee = row[16];
                                cashbackData.transValue = row[17];
                                cashbackData.commission = row[18];
                                cashbackData.CPACommission = row[19];
                                cashbackData.CPACount = row[20];
                                cashbackData.amount = row[21];
                                cashbackData.totalCommission = row[21];
                                cashbackData.siteCommission = siteCommission;
                                cashbackData.is_new = row[22];
                                cashbackData.creditDate = Date.now();
                                cashbackData.cashback = skrill_cashback;
                                cashbackData.actionAdd = 1;
                                cashbackData.save((err, doc) => {
                                    let insertedId = doc._id;


                                    User.findOne({ moneyBookerId: skrill_id }).then(userRow => {
                                        if (userRow) {
                                            const activityData = new ActivityStatement();
                                            activityData.activity_userid = userRow._id;
                                            activityData.activity_tableid = insertedId;
                                            activityData.activity_name = 'Trunover Skrill Cashback Credited';
                                            activityData.activity_type = 'TrunoverCashbackCredits';
                                            activityData.activity_status = 'Credited';
                                            activityData.activity_amount = row[21];
                                            activityData.activity_added = Date.now();
                                            activityData.save();
                                        }
                                    });
                                });
                            });
                        });
                    });
                    setTimeout(function () { callback(); }, 300);
                }, () => {
                    return res.send({ success: true, message: 'Uploaded successfully!.' });
                });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getSkrillCashbacks(req, res, next) {

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
        SkrillUsers.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                SkrillUsers.countDocuments(query)
                    .then(totalCounts => {
                        SkrillUsers.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$total_amount" } } }])
                            .then(totalSum => {
                                SkrillUsers.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$site_commission" } } }])
                                    .then(totalComm => {
                                        return res.status(200).send({ success: true, totalSum: totalSum, totalComm: totalComm, results: results, totalCount: totalCounts });
                                    });
                            });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function updateSkrillUser(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        let updateUserData = {};
        updateUserData.user_id = body.user_id;
        let updateSkrillData = {};
        updateSkrillData.user_id = body.user_id;
        SkrillUsers.findOneAndUpdate({ skrill_id: body.skrill_id }, { $set: updateUserData })
            .then(() => {
                return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // SkrillCashback.update({ skrillId: body.skrill_id }, updateSkrillData, { multi: true  }, function (err) {
                //     if(err)return res.status(400).send({ success: false, msg: 'Server error' });
                //     return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getSkrillDetails(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = { skrillId: req.query.skrill_user_id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = req.query.searchKey;
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Paid') ? 1 : 0;
            query['paymentStatus'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = {};
        }
        SkrillCashback.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                SkrillCashback.countDocuments(query)
                    .then(totalCounts => {
                        SkrillUsers.findOne({ skrill_id: req.query.skrill_user_id }).populate('user_id').then(userDetails => {
                            SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                .then(totalSum => {
                                    SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id } }, { $group: { _id: null, sum: { $sum: "$siteCommission" } } }])
                                        .then(totalComm => {
                                            SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id, paymentStatus: 0 } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                                .then(pendingSum => {
                                                    SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id, paymentStatus: 0 } }, { $group: { _id: null, sum: { $sum: "$siteCommission" } } }])
                                                        .then(pendingComm => {
                                                            SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id, paymentStatus: 1 } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
                                                                .then(paidSum => {
                                                                    SkrillCashback.aggregate([{ $match: { skrillId: req.query.skrill_user_id, paymentStatus: 1 } }, { $group: { _id: null, sum: { $sum: "$siteCommission" } } }])
                                                                        .then(paidComm => {
                                                                            return res.status(200).send({
                                                                                success: true,
                                                                                userDetails: userDetails,
                                                                                totalSum: totalSum,
                                                                                totalComm: totalComm,
                                                                                pendingSum: pendingSum,
                                                                                pendingComm: pendingComm,
                                                                                paidSum: paidSum,
                                                                                paidComm: paidComm,
                                                                                results: results,
                                                                                totalCount: totalCounts
                                                                            });
                                                                        });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });

                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function exportSkrillCashbacks(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        SkrillUsers.find().populate('user_id')
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], });
                return res.status(200).send({ success: true, results: results });

            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function updateCashbackStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        SkrillCashback.findById({ _id }).then(cbRow => {
            if (!cbRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};

            updateData.paymentStatus = (action == 'pending') ? 0 : 1;

            SkrillCashback.findByIdAndUpdate({ _id: cbRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Cashback updated successfully!' });
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


function updateUserAward(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, awardAmount, awardTo } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });

        User.findById({ _id }).then(uRow => {
            if (!uRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};

            updateData.moneyBookerBonus = awardAmount;
            updateData.moneyBookerAwardto = awardTo;

            User.findByIdAndUpdate({ _id: uRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Updated successfully!' });
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
/**  SBOBet   */
function uploadSbobetCashbacks(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        if (!req.files) {
            return res.status(400).send({ success: false, message: 'Please select valid file.' });
        }
        let imageFile = req.files.file;
        let imageName = req.files.file.name;
        let imageExt = imageName.split('.').pop();
        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
        let filename = path.join(__dirname, '../../uploads/csv/' + newFileName);
        imageFile.mv(filename);
        let inputStream = fs.createReadStream(filename, 'utf8');
        let cashbackData = [];
        inputStream.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                cashbackData.push(row);
            }).on('end', function () {
                eachSeries(cashbackData, function (row, callback) {
                    let sbobetId = row[1];
                    let sbobetUserData = {};
                    sbobetUserData.sbobetId = sbobetId;

                    SbobetUser.findOne({ sbobetId: sbobetId }).then(existUserRow => {

                        let exPendingAmount = 0;
                        let userId = '';
                        if (existUserRow) {
                            exPendingAmount = existUserRow.pendingAmount;
                            userId = existUserRow.user_id
                        }

                        SiteConfig.findOne({ config_module: 'GeneralSitewide' }).then(configRow => {
                            let sbobet_cashback = 0.25;
                            if (configRow) sbobet_cashback = configRow.sbobet_cashback_value;
                            let newPendingAmount = Math.round(row[10] * sbobet_cashback) / 100;
                            let pendingAmount = Math.round(newPendingAmount + exPendingAmount);
                            sbobetUserData.pendingAmount = pendingAmount;

                            SbobetUser.update({ sbobetId: sbobetId }, sbobetUserData, { upsert: true }, function (err, userDoc) {
                                if (err) return res.status(400).send({ success: true, msg: err });
                                const cashbackData = new SbobetCashback();
                                // cashbackData.user_id = '5c39bc90327e543ff8c14516';
                                console.log('sbobetId', sbobetId);
                                cashbackData.customerReferenceID = row[0];
                                cashbackData.sbobetId = sbobetId;
                                cashbackData.country = row[2];
                                cashbackData.signupDate = row[3];
                                cashbackData.rewardPlan = row[4];
                                cashbackData.marketingSourceName = row[5];
                                cashbackData.refURL = row[6];
                                cashbackData.expiryDate = row[7];
                                cashbackData.customerType = row[8];
                                cashbackData.deposits = row[9];
                                cashbackData.turnover = row[10];
                                cashbackData.totalNetRevenue = row[11];
                                cashbackData.totalNetRevenueMTD = row[12];
                                cashbackData.signupDateTime = row[3];
                                cashbackData.expiryDateTime = row[7];
                                cashbackData.updatedTime = Date.now();

                                cashbackData.save((err, doc) => {
                                    const activityData = new ActivityStatement();
                                    activityData.activity_userid = userId;
                                    activityData.activity_tableid = sbobetId;
                                    activityData.activity_name = 'Trunover Sbobet Cashback Credited';
                                    activityData.activity_type = 'TrunoverCashbackCredits';
                                    activityData.activity_status = 'Credited';
                                    activityData.activity_amount = newPendingAmount;
                                    activityData.activity_added = Date.now();
                                    activityData.save();
                                });
                            });
                        });
                    });
                    setTimeout(function () { callback(); }, 300);
                }, () => {
                    return res.send({ success: true, message: 'Uploaded successfully!.' });
                });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getSbobetCashbacks(req, res, next) {

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
        SbobetUser.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                SbobetUser.countDocuments(query)
                    .then(totalCounts => {
                        SbobetUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$pendingAmount" } } }])
                            .then(pendingAmount => {
                                SbobetUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$paidAmount" } } }])
                                    .then(paidAmount => {
                                        return res.status(200).send({ success: true, pendingAmount: pendingAmount, paidAmount: paidAmount, results: results, totalCount: totalCounts });
                                    });
                            });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateSbobetUser(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        let updateUserData = {};
        updateUserData.user_id = body.user_id;
        let updateSkrillData = {};
        updateSkrillData.user_id = body.user_id;
        SbobetUser.findOneAndUpdate({ sbobetId: body.sbobetId }, { $set: updateUserData })
            .then(() => {
                return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // SkrillCashback.update({ skrillId: body.skrill_id }, updateSkrillData, { multi: true  }, function (err) {
                //     if(err)return res.status(400).send({ success: false, msg: 'Server error' });
                //     return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getSbobetDetails(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = {sbobetId:req.query.sbobet_user_id};
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
        SbobetPaid.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                //if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                SbobetPaid.countDocuments(query)
                    .then(totalCounts => {
                        SbobetUser.findOne(query).populate('user_id')
                            .then(userDetails => {
                                SbobetUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$pendingAmount" } } }])
                                    .then(pendingAmount => {
                                        SbobetUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$paidAmount" } } }])
                                            .then(paidAmount => {
                                                return res.status(200).send({ success: true,userDetails:userDetails, pendingAmount: pendingAmount, paidAmount: paidAmount, results: results, totalCount: totalCounts });
                                            });
                                    });
                            });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

/**  SBOBet   */
function uploadNetellerCashbacks(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        if (!req.files) {
            return res.status(400).send({ success: false, message: 'Please select valid file.' });
        }
        let imageFile = req.files.file;
        let imageName = req.files.file.name;
        let imageExt = imageName.split('.').pop();
        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
        let filename = path.join(__dirname, '../../uploads/csv/' + newFileName);
        imageFile.mv(filename);
        let inputStream = fs.createReadStream(filename, 'utf8');
        let cashbackData = [];
        inputStream.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                cashbackData.push(row);
            }).on('end', function () {
                eachSeries(cashbackData, function (row, callback) {
                    let netellerId = row[1];
                    let sbobetUserData = {};
                    sbobetUserData.netellerId = netellerId;

                    NetellerUser.findOne({ netellerId: netellerId }).then(existUserRow => {

                        let exPendingAmount = 0;
                        let userId = '';
                        if (existUserRow) {
                            exPendingAmount = existUserRow.pendingAmount;
                            userId = existUserRow.user_id
                        }

                        SiteConfig.findOne({ config_module: 'GeneralSitewide' }).then(configRow => {
                            let sbobet_cashback = 0.25;
                            if (configRow) sbobet_cashback = configRow.sbobet_cashback_value;
                            let newPendingAmount = Math.round(row[10] * sbobet_cashback) / 100;
                            let pendingAmount = Math.round(newPendingAmount + exPendingAmount);
                            sbobetUserData.pendingAmount = pendingAmount;

                            NetellerUser.update({ netellerId: netellerId }, sbobetUserData, { upsert: true }, function (err, userDoc) {
                                if (err) return res.status(400).send({ success: true, msg: err });
                                const cashbackData = new NetellerCashback();
                                // cashbackData.user_id = '5c39bc90327e543ff8c14516';
                                console.log('netellerId', netellerId);
                                cashbackData.customerReferenceID = row[0];
                                cashbackData.netellerId = netellerId;
                                cashbackData.country = row[2];
                                cashbackData.signupDate = row[3];
                                cashbackData.rewardPlan = row[4];
                                cashbackData.marketingSourceName = row[5];
                                cashbackData.refURL = row[6];
                                cashbackData.expiryDate = row[7];
                                cashbackData.customerType = row[8];
                                cashbackData.deposits = row[9];
                                cashbackData.turnover = row[10];
                                cashbackData.totalNetRevenue = row[11];
                                cashbackData.totalNetRevenueMTD = row[12];
                                cashbackData.signupDateTime = row[3];
                                cashbackData.expiryDateTime = row[7];
                                cashbackData.updatedTime = Date.now();

                                cashbackData.save((err, doc) => {
                                    const activityData = new ActivityStatement();
                                    activityData.activity_userid = userId;
                                    activityData.activity_tableid = netellerId;
                                    activityData.activity_name = 'Trunover Neteller Cashback Credited';
                                    activityData.activity_type = 'TrunoverCashbackCredits';
                                    activityData.activity_status = 'Credited';
                                    activityData.activity_amount = newPendingAmount;
                                    activityData.activity_added = Date.now();
                                    activityData.save();
                                });
                            });
                        });
                    });
                    setTimeout(function () { callback(); }, 300);
                }, () => {
                    return res.send({ success: true, message: 'Uploaded successfully!.' });
                });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getNetellerCashbacks(req, res, next) {

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
        NetellerUser.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                NetellerUser.countDocuments(query)
                    .then(totalCounts => {
                        NetellerUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$pendingAmount" } } }])
                            .then(pendingAmount => {
                                NetellerUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$paidAmount" } } }])
                                    .then(paidAmount => {
                                        return res.status(200).send({ success: true, pendingAmount: pendingAmount, paidAmount: paidAmount, results: results, totalCount: totalCounts });
                                    });
                            });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateNetellerUser(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        let updateUserData = {};
        updateUserData.user_id = body.user_id;
        let updateSkrillData = {};
        updateSkrillData.user_id = body.user_id;
        NetellerUser.findOneAndUpdate({ netellerId: body.netellerId }, { $set: updateUserData })
            .then(() => {
                return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // SkrillCashback.update({ skrillId: body.skrill_id }, updateSkrillData, { multi: true  }, function (err) {
                //     if(err)return res.status(400).send({ success: false, msg: 'Server error' });
                //     return res.status(201).send({ success: true, msg: 'User assigned successfully!' });
                // });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getNetellerDetails(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);
        let skippage = pageLimit * (req.query.page - 1);
        let query = {netellerId:req.query.neteller_user_id};
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
        NetellerPaid.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                //if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                NetellerPaid.countDocuments(query)
                    .then(totalCounts => {
                        NetellerUser.findOne(query).populate('user_id')
                            .then(userDetails => {
                                NetellerUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$pendingAmount" } } }])
                                    .then(pendingAmount => {
                                        NetellerUser.aggregate([{ $match: {} }, { $group: { _id: null, sum: { $sum: "$paidAmount" } } }])
                                            .then(paidAmount => {
                                                return res.status(200).send({ success: true,userDetails:userDetails, pendingAmount: pendingAmount, paidAmount: paidAmount, results: results, totalCount: totalCounts });
                                            });
                                    });
                            });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
module.exports = {
    uploadCashbacks,
    getSkrillCashbacks,
    updateSkrillUser,
    getSkrillDetails,
    updateCashbackStatus,
    updateUserAward,
    exportSkrillCashbacks,
    uploadSbobetCashbacks,
    getSbobetCashbacks,
    updateSbobetUser,
    getSbobetDetails,
    uploadNetellerCashbacks,
    getNetellerCashbacks,
    updateNetellerUser,
    getNetellerDetails
}

