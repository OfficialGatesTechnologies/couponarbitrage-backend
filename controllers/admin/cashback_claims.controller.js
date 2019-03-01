const CashbackClaims = require('../../models/cashback_claims');
const CashbackStores = require('../../models/Cashback_stores');
const CashbackTransaction = require('../../models/Cashback_transactions');
const Tags = require('../../models/Tags');
const { getToken } = require('../../utils/api.helpers');


function updateClaims(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id } = body;

        var status = body.status;
        CashbackClaims.findById({
            _id: _id
        }).then(claimRow => {
            if (!claimRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.date_confirmed = body.date_confirmed;
            updateData.username = body.username;
            updateData.date_joined = body.date_joined;
            updateData.notes = body.notes;
            updateData.status = body.status;
            
            CashbackClaims.findByIdAndUpdate({ _id: claimRow._id }, { $set: updateData })
                .then(() => {

                    if (status == 'X') {
                        CashbackTransaction.findOneAndRemove({ user_id: claimRow.user_id, case_id: claimRow._id })
                            .then(() => {
                                return res.status(201).send({ success: true, msg: 'Claim updated successfully' });
                            }).catch((err) => {
                                return res.status(500).send({ success: false, msg: err })
                            });

                    } else if (status == 'c') {
                    } else if (status == 'A') {
                        console.log('status adad ad', status);
                        CashbackTransaction.find({ user_id: claimRow.user_id, case_id: claimRow._id })
                            .then((existCashback) => {
                                if (existCashback.length > 0) {
                                    let upTxnData = {};
                                    upTxnData.value = claimRow.amount;
                                    upTxnData.cb_type = claimRow.cb_type;
                                    CashbackTransaction.deleteMany({ _id: existCashback._id }, { $set: upTxnData })
                                        .then(() => {
                                            return res.status(201).send({ success: true, msg: 'Claim updated successfully' });
                                        });
                                } else {
                                    var newTxnData = new CashbackTransaction();
                                    newTxnData.user_id = claimRow.user_id;
                                    newTxnData.case_id = claimRow._id;
                                    newTxnData.value = claimRow.amount;
                                    newTxnData.cb_type = claimRow.cb_type;
                                    newTxnData.trans_date = body.date_confirmed;
                                    newTxnData.save(() => {
                                        return res.status(201).send({ success: true, msg: 'Claim updated successfully' });
                                    });
                                }

                            })

                    } else {
                        return res.status(201).send({ success: true, msg: 'Claim updated successfully' });
                    }


                }).catch((err) => {
                    console.log('err', err);
                    return res.status(500).send({ success: false, msg: err })
                })

        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err })
            else return next({ status: 500, msg: 'server error 4' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getCashbackCliams(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {cb_type:parseInt(req.query.cb_type)};//
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.filterByStore && req.query.filterByStore != 'all') {
            query['store_id'] = req.query.filterByStore;
        } 
        if(req.query.status && req.query.status == 'unconfirmed')query['status'] = 'P';
        else if(req.query.status && req.query.status == 'unapproved')query['status'] = 'N';
        else if(req.query.status && req.query.status == 'finished')query['status'] = 'C';
        else if(req.query.status && req.query.status == 'payable')query['status'] = 'A';
        else if(req.query.status && req.query.status == 'paid')query['status'] = 'S';
        else if(req.query.status && req.query.status == 'more_info')query['status'] = 'M';
        else if(req.query.status && req.query.status == 'cancelled')query['status'] = 'X';
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { date_applied: -1 };
        }
 
        CashbackClaims.find(query)
            .populate('user_id')
            .populate('store_id').populate('aff_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackClaims.countDocuments(query)
                    .then(totalCounts => {

                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch((err) => res.status(400).send({ success: false, msg: err }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getTagsList(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackClaims.findById(req.query.id).select({ tags: 1 }).then(storeRow => {
            Tags.find({})
                .then(tagsList => {
                    return res.status(200).send({ success: true, storeRow: storeRow, tagsList: tagsList });
                })
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getCliamRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackClaims.findById(req.query._id).populate('user_id')
            .populate('store_id').populate('aff_id').then(claimRow => {
                if (claimRow.length === 0) return res.status(200).send({ success: false });
                return res.status(200).send({ success: true, 'results': claimRow });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getStoresToExport(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { off_deleted: 0 };
        CashbackStores.find(query)
            .populate('aid')
            .populate('cat_id')
            .populate('network_id')
            .select({
                "_id": 1, "title": 1, "details": 1, "details_default": 1, "banner": 1,
                "internal_banner": 1, "link": 1, "value": 1, "comm": 1, "vaild_from": 1,
                "valid_to": 1, "tweet": 1, "send_mail": 1, "merchant_tc": 1,
                "merchant_tc_default": 1, "youtube_video": 1, "meta_title": 1,
                "meta_keywords": 1, "meta_description": 1
            }).then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                return res.status(200).send({ success: true, results: results });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateClaimTags(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id } = body;
        if (!body.tags) return res.status(400).send({ success: false, message: 'Please select atleast one tag.' });


        CashbackClaims.findById({
            _id: _id
        }).then(claimRow => {

            let updateData = {};
            updateData.tags = body.tags;

            CashbackClaims.findByIdAndUpdate({ _id: claimRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Store tags updated successfully' });
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


module.exports = {

    getCashbackCliams,
    updateClaimTags,

    getStoresToExport,
    getTagsList,
    updateClaims,
    getCliamRowById
}

