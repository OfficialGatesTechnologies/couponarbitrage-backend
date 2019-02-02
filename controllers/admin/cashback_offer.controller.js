const CashbackStores = require('../../models/Cashback_stores');
const CashbackOffers = require('../../models/Cashback_offers');
const { getToken } = require('../../utils/api.helpers');

function createOffer(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        if (!body.offerData.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.offerData.cashback_type) return res.status(400).send({ success: false, message: 'Please select type.' });
        else if (!body.offerData.network_commission) return res.status(400).send({ success: false, message: 'Please enter the network commission.' });
        else if (!body.offerData.cashback) return res.status(400).send({ success: false, message: 'Please enter the cashback value.' });


        const newOffer = new CashbackOffers();

        newOffer.store_id = body.offerData.store_id;
        newOffer.cashback_type = body.offerData.cashback_type;
        newOffer.network_commission = body.offerData.network_commission;
        newOffer.cashback = body.offerData.cashback;
        newOffer.newtwork_cashback_url = (body.offerData.newtwork_cashback_url);
        newOffer.description = body.offerData.description;
        newOffer.expiry_date = (body.offerData.expiry_date) ? body.offerData.expiry_date :'';
        newOffer.vip_offer = isNaN(parseInt(body.offerData.vip_offer)) ? 0 : parseInt(body.offerData.vip_offer);
        newOffer.exclusive_rate = isNaN(parseInt(body.offerData.exclusive_rate)) ? 0 : parseInt(body.offerData.exclusive_rate);


        newOffer.save((err) => {
            if (err) {

                return res.status(400).send({ success: true, msg: err });
            }
            return res.status(201).send({ success: true, msg: 'Offer created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateOffer(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        if (!body.offerData.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.offerData.cashback_type) return res.status(400).send({ success: false, message: 'Please select type.' });
        else if (!body.offerData.network_commission) return res.status(400).send({ success: false, message: 'Please enter the network commission.' });
        else if (!body.offerData.cashback) return res.status(400).send({ success: false, message: 'Please enter the cashback value.' });
        CashbackOffers.findById({
            _id: body.offerData._id
        }).then(offerRow => {
            if (!offerRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            updateData.store_id = body.offerData.store_id;
            updateData.cashback_type = body.offerData.cashback_type;
            updateData.network_commission = body.offerData.network_commission;
            updateData.cashback = body.offerData.cashback;
            updateData.newtwork_cashback_url = (body.offerData.newtwork_cashback_url);
            updateData.description = body.offerData.description;
            updateData.expiry_date = (body.offerData.expiry_date) ? body.offerData.expiry_date : '';
            updateData.vip_offer = isNaN(parseInt(body.offerData.vip_offer)) ? 0 : parseInt(body.offerData.vip_offer);
            updateData.exclusive_rate = isNaN(parseInt(body.offerData.exclusive_rate)) ? 0 : parseInt(body.offerData.exclusive_rate);

            CashbackOffers.findByIdAndUpdate({ _id: offerRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Offer updated successfully' });
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
function getCashbackOffers(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.filterByStore && req.query.filterByStore != 'all') {
            query['store_id'] = req.query.filterByStore;
        } 
        CashbackOffers.find(query).populate({ path: 'store_id', populate: { path: 'aid' }}).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackOffers.countDocuments(query)
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



function updateOfferStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackOffers.findById({ _id }).then(offerRow => {
            if (!offerRow) throw { status: 400, msg: 'Invalid request.' };

            CashbackOffers.findByIdAndRemove({ _id: offerRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Offer deleted successfully!' });
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

function getOfferRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackOffers.findById(req.query._id).then(offerRow => {
            if (offerRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': offerRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



module.exports = {
    getAllstoresList,
    getCashbackOffers,
    createOffer,

    updateOfferStatus,
    getOfferRowById,
    updateOffer,

}

