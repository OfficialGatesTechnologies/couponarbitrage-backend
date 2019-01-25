const CashbackCat = require('../../models/Cashback_caregories');
const Menu = require('../../models/Jos_menu');
const {
    getToken,
    convertToSlug
} = require('../../utils/api.helpers');

function createCategory(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { cat_parent, cat_title, cat_desc } = body.catData;
        if (!cat_parent) return res.status(400).send({ success: false, message: 'Please select parent.' });
        else if (!cat_title) return res.status(400).send({ success: false, message: 'Please enter the title.' });


        CashbackCat.find({ cat_title: cat_title, cat_parent: cat_parent, cat_deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Category name already exists.' });

            const newCat = new CashbackCat();

            newCat.cat_parent = cat_parent;
            newCat.cat_title = cat_title;
            newCat.cat_url = convertToSlug(cat_title);
            newCat.cat_desc = cat_desc;
            newCat.save((err) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Category created successfully!' });
            });

        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateCashbackCategory(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id,cat_parent, cat_title, cat_desc } = body.catData;
        if (!cat_parent) return res.status(400).send({ success: false, message: 'Please select parent.' });
        else if (!cat_title) return res.status(400).send({ success: false, message: 'Please enter the title.' });

        CashbackCat.findById({
            _id: _id
        }).then(catRow => {
                if (!catRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
                CashbackCat.find({ cat_title: cat_title, cat_parent: cat_parent, cat_deleted: 0, _id: { $ne: _id } })
                    .then(existCat => {
                        if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Category name  already exists.' });
                        let updateData = {};
                        updateData.cat_parent = cat_parent;
                        updateData.cat_title = cat_title;
                        updateData.cat_url = convertToSlug(cat_title);
                        updateData.cat_desc = cat_desc;
                        CashbackCat.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                            .then(() => {
                                return res.status(201).send({ success: true, msg: 'Category updated successfully' });
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


function getCashbackCategories(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { cat_deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['cat_disabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { cat_title: -1 };
        }

        CashbackCat.find(query).populate('cat_parent').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackCat.countDocuments(query)
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


function updateCatStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackCat.findById({ _id }).then(catRow => {
            if (!catRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.cat_deleted = 1;
            else
                updateData.cat_disabled = (action == 'enabled') ? 0 : 1;

            CashbackCat.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Category updated successfully!' });
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
function getCatRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackCat.findById(req.query._id).then(catRow => {
            if (catRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': catRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getCashbackMenus(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { menuDeleted: 0 };
        if (req.query.type) {
            query['type'] = req.query.type;
        }
        let sortQ = {};
        sortQ = { name: 1 };
        Menu.find(query).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [] });
                return res.status(200).send({ success: true, results: results });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

module.exports = {
    getCashbackCategories,
    getCashbackMenus,
    createCategory,
    updateCatStatus,
    updateCashbackCategory,
    getCatRowById

}

