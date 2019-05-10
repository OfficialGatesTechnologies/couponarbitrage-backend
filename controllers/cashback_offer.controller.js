const CashbackStores = require('../models/Cashback_stores');
const CashbackOffers = require('../models/Cashback_offers');
const { getToken } = require('../utils/api.helpers');


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
    
    getOfferRowById,
    
    

}

