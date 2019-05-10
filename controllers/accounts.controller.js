const CashbackClaims = require('../models/cashback_claims');
const CashbackCredits = require('../models/Cashback_credits');
const SkrillCashback = require('../models/Skrill_cashback');
const SbobetUser = require('../models/Sbobet_user');
const SbobetPaid = require('../models/Sbobet_paid');
const NetellerUser = require('../models/Neteller_user');
const AsianconnectUser = require('../models/Asianconnect_user');
const EcopayCashback = require('../models/Ecopayz_cashback');
const EcopayUsers = require('../models/Ecopayz_users');
 
 
const { getToken } = require('../utils/api.helpers');


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
                                                                return res.status(200).send({
                                                                    success: true,
                                                                    results: results,
                                                                    totalCount: totalCounts,
                                                                    totalUnconfirmed: totalUnconfirmed,
                                                                    totalConfirmed: totalConfirmed,
                                                                    totalPayable: totalPayable,
                                                                    totalPaid: totalPaid,
                                                                    totalCancelled: totalCancelled
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
                                                        return res.status(200).send({
                                                            success: true,
                                                            results: results,
                                                            totalCount: totalCounts,
                                                            totalUnconfirmed: totalUnconfirmed,
                                                            totalPaid: totalPaid,
                                                            unconfirmedList: unconfirmedList,
                                                            paidList: paidList
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
        SkrillCashback.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, totalComm: 0, totalSum: 0, 'results': [], totalCount: 0, });
                SkrillCashback.countDocuments(query)
                    .then(totalCounts => {
                        SkrillCashback.aggregate([{ $match: { paymentStatus: 0, skrillId: req.user.moneyBookerId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                            .then(pendingAmount => {
                                SkrillCashback.aggregate([{ $match: { paymentStatus: 1, skrillId: req.user.moneyBookerId, } }, { $group: { _id: null, sum: { $sum: "$userCommission" } } }])
                                    .then(paidAmount => {
                                        return res.status(200).send({
                                            success: true,
                                            pendingAmount: pendingAmount,
                                            paidAmount: paidAmount,
                                            results: results,
                                            totalCount: totalCounts
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
module.exports = {
    getCashbackCliams,
    getRevenueCashbackCliams,
    getDashboardStats,
    getSkrillCashbacks
}

