const CashbackStores = require('../../models/Cashback_stores');
const CashbackVouchers = require('../../models/Cashback_vouchers');
const { getToken, genRandomPassword } = require('../../utils/api.helpers');
var md5 = require('md5');
const path = require('path');
function createVoucher(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        if (!body.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.voucher_title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!body.voucher_mode) return res.status(400).send({ success: false, message: 'Please select voucher Mode .' });
        else if (!body.voucher_type) return res.status(400).send({ success: false, message: 'Please select voucher type.' });
        else if (!body.voucher_link) return res.status(400).send({ success: false, message: 'Please enter the link.' });

        const newVoucher = new CashbackVouchers();
        let newFileName = '';
        if (req.files) {
            let imageFile = req.files.file;
            let imageName = req.files.file.name;
            let imageExt = imageName.split('.').pop();
            newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
            let filename = path.join(__dirname, '../../uploads/vouchers/' + newFileName);
            imageFile.mv(filename);
            newVoucher.imageFile = newFileName;
        }
        newVoucher.store_id = body.store_id;
        newVoucher.voucher_title = body.voucher_title;
        newVoucher.voucher_mode = body.voucher_mode;
        newVoucher.voucher_type = body.voucher_type;
        newVoucher.vouchers_code = (body.vouchers_code);
        newVoucher.voucher_summary = body.voucher_summary;
        newVoucher.voucher_description = body.voucher_description;
        newVoucher.voucher_link = body.voucher_link;
        newVoucher.image_upload = body.image_upload;
        newVoucher.imageUrl = body.imageUrl;
       

        newVoucher.issue_date = (body.issue_date) ? body.issue_date : Date.now();
        newVoucher.expiry_date = (body.expiry_date) ? body.expiry_date : '';


        newVoucher.save((err) => {
            if (err) {

                return res.status(400).send({ success: true, msg: err });
            }
            return res.status(201).send({ success: true, msg: 'Voucher created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateVoucher(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        if (!body.store_id) return res.status(400).send({ success: false, message: 'Please select store.' });
        else if (!body.voucher_title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!body.voucher_mode) return res.status(400).send({ success: false, message: 'Please select voucher Mode .' });
        else if (!body.voucher_type) return res.status(400).send({ success: false, message: 'Please select voucher type.' });
        else if (!body.voucher_link) return res.status(400).send({ success: false, message: 'Please enter the link.' });

        CashbackVouchers.findById({
            _id: body._id
        }).then(offerRow => {
            if (!offerRow) return res.status(401).send({ success: false, message: 'Invalid request.' });

            let updateData = {};

            let newFileName = '';
            console.log('updateData',req.files);
            if (req.files) {
                let imageFile = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/vouchers/' + newFileName);
                imageFile.mv(filename);
                updateData.imageFile = newFileName;
            }
            updateData.store_id = body.store_id;
            updateData.voucher_title = body.voucher_title;
            updateData.voucher_mode = body.voucher_mode;
            updateData.voucher_type = body.voucher_type;
            updateData.vouchers_code = (body.vouchers_code);
            updateData.voucher_summary = body.voucher_summary;
            updateData.voucher_description = body.voucher_description;
            updateData.voucher_link = body.voucher_link;
            updateData.image_upload = body.image_upload;
            updateData.imageUrl = body.imageUrl;
         
          

            updateData.issue_date = (body.issue_date) ? body.issue_date : Date.now();
            updateData.expiry_date = (body.expiry_date !== 'null') ? body.expiry_date : null;
           
            CashbackVouchers.findByIdAndUpdate({ _id: offerRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Voucher updated successfully' });
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
function getCashbackVouchers(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {voucher_deleted:0};
        let sortQ = {};
        if (req.query.filterByStore && req.query.filterByStore != 'all') {
            query['store_id'] = req.query.filterByStore;
        }
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['voucher_disabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { voucher_title: -1 };
        }
        CashbackVouchers.find(query).populate({ path: 'store_id', populate: { path: 'aid' } }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackVouchers.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function updateVoucherStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackVouchers.findById({ _id }).then(voucherRow => {
            if (!voucherRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.voucher_deleted = 1;
            else
                updateData.voucher_disabled = (action == 'enabled') ? 0 : 1;

                CashbackVouchers.findByIdAndUpdate({ _id: voucherRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Voucher updated successfully!' });
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

function getVoucherRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackVouchers.findById(req.query._id).then(offerRow => {
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
    getCashbackVouchers,
    createVoucher,
    updateVoucherStatus,
    getVoucherRowById,
    updateVoucher,

}

