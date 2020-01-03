const CashbackCredits = require('../../models/Cashback_credits');
const { getToken } = require('../../utils/api.helpers');

function createCredits(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        if (!body.creditData.revenueCreditUserId) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.creditData.revenueCreditType) return res.status(400).send({ success: false, message: 'Please select type.' });
        else if (!body.creditData.revenueCreditAmount) return res.status(400).send({ success: false, message: 'Please enter the network commission.' });
     
        const newCredits = new CashbackCredits();
        newCredits.revenueCreditUserId = body.creditData.revenueCreditUserId;
        newCredits.revenueCreditType = body.creditData.revenueCreditType;
        newCredits.revenueCreditAmount = body.creditData.revenueCreditAmount;
        newCredits.save((err) => {
            if (err) {
                return res.status(400).send({ success: true, msg: err });
            }
            return res.status(201).send({ success: true, msg: 'Credit added successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateCredits(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        if (!body.creditData.revenueCreditUserId) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.creditData.revenueCreditType) return res.status(400).send({ success: false, message: 'Please select type.' });
        else if (!body.creditData.revenueCreditAmount) return res.status(400).send({ success: false, message: 'Please enter the network commission.' });
      
        CashbackCredits.findById({
            _id: body.creditData._id
        }).then(creditRow => {
            if (!creditRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.revenueCreditUserId = body.creditData.revenueCreditUserId;
            updateData.revenueCreditType = body.creditData.revenueCreditType;
            updateData.revenueCreditAmount = body.creditData.revenueCreditAmount;

            CashbackCredits.findByIdAndUpdate({ _id: creditRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Credit updated successfully' });
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
function getCashbackCredits(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Pending') ? 1 : 2;
            query['revenueCreditStatus'] = searchStatus;
        }
        CashbackCredits.find(query).populate({ path: 'revenueCreditUserId'}).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackCredits.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}




function updateCreditsStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackCredits.findById({ _id }).then(creditRow => {
            if (!creditRow) throw { status: 400, msg: 'Invalid request.' };

            CashbackCredits.findByIdAndRemove({ _id: creditRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Credit deleted successfully!' });
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

function getcreditRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackCredits.findById(req.query._id).populate({ path: 'revenueCreditUserId'}).then(creditRow => {
            if (creditRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': creditRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



module.exports = {
    
    getCashbackCredits,
    createCredits,
    updateCreditsStatus,
    getcreditRowById,
    updateCredits,
    

}

