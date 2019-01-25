const CashbackSites = require('../../models/Cashback_sites');
const CashbackCat = require('../../models/Cashback_caregories');
const AffiliateNetwork = require('../../models/Affiliate_network');
const CashbackStores = require('../../models/Cashback_stores');
const { getToken } = require('../../utils/api.helpers');
const fs = require('fs');
const path = require('path');

function getCashbackStores(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { off_deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
   
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { title: -1 };
        }

        CashbackStores.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackStores.countDocuments(query)
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
function getDropDownData(req, res) {
    const token = getToken(req.headers);
    if (token) {
        let query = { deleted: 0 };
        let cquery = { cat_deleted: 0 };
        let affquery = { deleted: 0 };
        let bannerFileList = [];
        const bannerFolder = path.join(__dirname, '../../uploads/cashbackbanners/');;

        fs.readdirSync(bannerFolder).forEach(file => {
            bannerFileList.push(file);
        })
        CashbackSites.find(query)
            .then(results => {
                CashbackCat.find(cquery).populate('cat_parent')
                    .then(catRes => {
                        AffiliateNetwork.find(affquery)
                            .then(affRes => {
                                return res.status(200).send({ success: true, results: results, affRes: affRes, catRes: catRes, bannerFileList: bannerFileList });
                            })
                    })
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    getDropDownData,
    getCashbackStores

}

