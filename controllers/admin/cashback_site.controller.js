const CashbackSites = require('../../models/Cashback_sites');
const CashbackStores = require('../../models/Cashback_stores');
const {
    getToken } = require('../../utils/api.helpers');

function createSite(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { name } = body.catData;
        if (!name) return res.status(400).send({ success: false, message: 'Please enter the name.' });



        CashbackSites.find({ name: name, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Site name already exists.' });

            const newCat = new CashbackSites();

            newCat.name = name;

            newCat.save((err) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Site created successfully!' });
            });

        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateCashbackSite(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, name } = body.catData;
        if (!name) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        CashbackSites.findById({
            _id: _id
        }).then(catRow => {
            if (!catRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            CashbackSites.find({ name: name, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Site name  already exists.' });
                    let updateData = {};
                    updateData.name = name;

                    CashbackSites.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Site updated successfully' });
                        }).catch(() => {
                            return res.status(500).send({ success: false, msg: 'server error' })
                        })
                }).catch(() => {
                    return res.status(500).send({ success: false, msg: 'server error' })
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


function getCashbackSites(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { name: -1 };
        }

        CashbackSites.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackSites.countDocuments(query)
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


function updateSiteStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackSites.findById({ _id }).then(catRow => {
            if (!catRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.deleted = 1;
            else
                updateData.cat_disabled = (action == 'enabled') ? 0 : 1;

            CashbackSites.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                .then(() => {
                    CashbackStores.update({ aid: catRow._id }, { $set: { off_deleted: 1 } }, { multi: true })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Site updated successfully!' });
                        }).catch((err) => {
                            return res.status(400).send({ success: false, msg: err });
                        });
                }).catch((err) => {
                    return res.status(400).send({ success: false, msg: err });
                });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error 33' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getSiteRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackSites.findById(req.query._id).then(catRow => {
            if (catRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': catRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    getCashbackSites,
    createSite,
    updateSiteStatus,
    updateCashbackSite,
    getSiteRowById

}

