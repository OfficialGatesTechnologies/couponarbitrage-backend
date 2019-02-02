const CashbackSites = require('../../models/Cashback_sites');
const CashbackCat = require('../../models/Cashback_caregories');
const AffiliateNetwork = require('../../models/Affiliate_network');
const CashbackStores = require('../../models/Cashback_stores');
const Tags = require('../../models/Tags');
const { getToken, YouTubeGetID, convertToSlug, genRandomPassword } = require('../../utils/api.helpers');
const fs = require('fs');
const path = require('path');
const CsvReadableStream = require('csv-reader');
const eachSeries = require('async-each-series');
var md5 = require('md5');
function createStore(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;

        if (!body.aid) return res.status(400).send({ success: false, message: 'Please select site.' });
        else if (!body.cat_id) return res.status(400).send({ success: false, message: 'Please select category.' });
        else if (!body.network_id) return res.status(400).send({ success: false, message: 'Please select a network.' });
        else if (!body.title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!body.uploadType) return res.status(400).send({ success: false, message: 'Please select upload type.' });
        else if (!body.link) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!body.value) return res.status(400).send({ success: false, message: 'Please enter the value.' });
        else if (!body.details_default && !body.details) return res.status(400).send({ success: false, message: 'Please enter description.' });
        CashbackStores.find({ title: body.title, off_deleted: 0 }).then(existStore => {
            if (existStore.length > 0) return res.status(400).send({ success: false, msg: 'Store name already exists.' });
            const newStore = new CashbackStores();
            let newFileName = '';
            if (req.files) {
                let imageFile = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = body.aidname + ' ' + body.title + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/cashbackbanners/' + newFileName);
                imageFile.mv(filename);
                newStore.imageFile = newFileName;
            }
            newStore.aid = body.aid;
            newStore.cat_id = body.cat_id;
            newStore.network_id = body.network_id;
            newStore.title = body.title;
            newStore.url_key = convertToSlug(body.aidname + ' ' + body.title + '-cashback');
            newStore.uploadType = (body.uploadType);
            newStore.link = body.link;
            newStore.value = body.value;
            newStore.details_default = parseInt(body.details_default);
            newStore.details = body.details;
            newStore.banner = body.banner;
            newStore.internal_banner = body.internal_banner;
            newStore.comm = body.comm;
            newStore.vaild_from = (body.vaild_from) ? body.vaild_from : Date.now();
            newStore.valid_to = body.valid_to;
            newStore.tweet = body.tweet;
            newStore.merchant_tc = body.merchant_tc;
            newStore.merchant_tc_default = body.merchant_tc_default;
            newStore.youtube_video = body.youtube_video;
            newStore.youtube_video_id = YouTubeGetID(body.youtube_video);
            newStore.satisfied_customers = body.satisfied_customers;
            newStore.avg_payment_speed = body.avg_payment_speed;
            newStore.auto_tracking_success = body.auto_tracking_success;
            newStore.manual_chase_possible = body.manual_chase_possible;
            newStore.manual_chase_required = body.manual_chase_required;
            newStore.manual_chase_success_rate = body.manual_chase_success_rate;
            newStore.payment_performance = body.payment_performance;
            newStore.meta_title = body.meta_title;
            newStore.meta_keywords = body.meta_keywords;
            newStore.meta_description = body.meta_description;
            newStore.send_mail = isNaN(parseInt(body.send_mail)) ? 0 : parseInt(body.send_mail);
            newStore.vip_store = isNaN(parseInt(body.vip_store)) ? 0 : parseInt(body.vip_store);
            newStore.top_list = isNaN(parseInt(body.top_list)) ? 0 : parseInt(body.top_list);
            newStore.home_list = isNaN(parseInt(body.home_list)) ? 0 : parseInt(body.home_list);

            newStore.save((err) => {
                if (err) {

                    return res.status(400).send({ success: true, msg: err });
                }
                return res.status(201).send({ success: true, msg: 'Menu created successfully!' });
            });

        }).catch(() => res.status(400).send({ success: false, msg: 'Server error 11 ' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateStore(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id } = body;
        if (!body.aid) return res.status(400).send({ success: false, message: 'Please select site.' });
        else if (!body.cat_id) return res.status(400).send({ success: false, message: 'Please select category.' });
        else if (!body.network_id) return res.status(400).send({ success: false, message: 'Please select a network.' });
        else if (!body.title) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!body.uploadType) return res.status(400).send({ success: false, message: 'Please select upload type.' });
        else if (!body.link) return res.status(400).send({ success: false, message: 'Please enter the link.' });
        else if (!body.value) return res.status(400).send({ success: false, message: 'Please enter the value.' });
        else if (!body.details_default && !body.details) return res.status(400).send({ success: false, message: 'Please enter description.' });

        CashbackStores.findById({
            _id: _id
        }).then(catRow => {
            if (!catRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            CashbackSites.find({ title: body.title, off_deleted: 0, _id: { $ne: _id } })
                .then(existStore => {
                    if (existStore.length > 0) return res.status(400).send({ success: false, msg: 'Store name  already exists.' });
                    let updateData = {};
                    let newFileName = '';
                    if (req.files) {
                        let imageFile = req.files.file;
                        let imageName = req.files.file.name;
                        let imageExt = imageName.split('.').pop();
                        newFileName = body.aidname + ' ' + body.title + '.' + imageExt;
                        let filename = path.join(__dirname, '../../uploads/cashbackbanners/' + newFileName);
                        imageFile.mv(filename);
                        updateData.imageFile = newFileName;
                    }
                    updateData.aid = body.aid;
                    updateData.cat_id = body.cat_id;
                    updateData.network_id = body.network_id;
                    updateData.title = body.title;
                    updateData.url_key = convertToSlug(body.aidname + ' ' + body.title + '-cashback');
                    updateData.uploadType = (body.uploadType);
                    updateData.link = body.link;
                    updateData.value = body.value;
                    updateData.details_default = isNaN(parseInt(body.details_default)) ? 0 : parseInt(body.details_default);
                    updateData.details = body.details;
                    updateData.banner = body.banner;
                    updateData.internal_banner = body.internal_banner;
                    updateData.comm = body.comm;
                    updateData.vaild_from = (body.vaild_from) ? body.vaild_from : Date.now();
                    updateData.valid_to = (body.valid_to !== 'null') ? body.valid_to : null;
                    updateData.tweet = body.tweet;
                    updateData.merchant_tc = body.merchant_tc;
                    updateData.merchant_tc_default = isNaN(parseInt(body.merchant_tc_default)) ? 0 : parseInt(body.merchant_tc_default);
                    updateData.youtube_video = body.youtube_video;
                    updateData.youtube_video_id = YouTubeGetID(body.youtube_video);
                    updateData.satisfied_customers = isNaN(parseInt(body.satisfied_customers)) ? 0 : parseInt(body.satisfied_customers);
                    updateData.avg_payment_speed = isNaN(parseInt(body.avg_payment_speed)) ? 0 : parseInt(body.avg_payment_speed);
                    updateData.auto_tracking_success = isNaN(parseInt(body.auto_tracking_success)) ? 0 : parseInt(body.auto_tracking_success);
                    updateData.manual_chase_possible = isNaN(parseInt(body.manual_chase_possible)) ? 0 : parseInt(body.manual_chase_possible);
                    updateData.manual_chase_required = isNaN(parseInt(body.manual_chase_required)) ? 0 : parseInt(body.manual_chase_required);
                    updateData.manual_chase_success_rate = isNaN(parseInt(body.manual_chase_success_rate)) ? 0 : parseInt(body.manual_chase_success_rate);
                    updateData.payment_performance = body.payment_performance;
                    updateData.meta_title = body.meta_title;
                    updateData.meta_keywords = body.meta_keywords;
                    updateData.meta_description = body.meta_description;
                    updateData.send_mail = isNaN(parseInt(body.send_mail)) ? 0 : parseInt(body.send_mail);
                    updateData.vip_store = isNaN(parseInt(body.vip_store)) ? 0 : parseInt(body.vip_store);
                    updateData.top_list = isNaN(parseInt(body.top_list)) ? 0 : parseInt(body.top_list);
                    updateData.home_list = isNaN(parseInt(body.home_list)) ? 0 : parseInt(body.home_list);

                    CashbackStores.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Store updated successfully' });
                        }).catch((err) => {
                            return res.status(500).send({ success: false, msg: err })
                        })
                }).catch(() => {
                    return res.status(500).send({ success: false, msg: 'server error 1' })
                })
        })
            .catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
                else return next({ status: 500, msg: 'server error 4' })
            })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getCashbackStores(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { off_deleted: 0 ,aid: { $ne: null }};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['off_disabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { title: -1 };
        }
      
        CashbackStores.find(query)
            .populate('aid')
            .populate('cat_id').populate('network_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                CashbackStores.countDocuments(query)
                    .then(totalCounts => {
                       
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
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
        const bannerFolder = path.join(__dirname, '../../uploads/cashbackbanners/');

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
            }).catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getTagsList(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackStores.findById(req.query.id).select({ tags: 1 }).then(storeRow => {
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

function updateStoreStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        CashbackStores.findById({ _id }).then(catRow => {
            if (!catRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.off_deleted = 1;
            else
                updateData.off_disabled = (action == 'enabled') ? 0 : 1;

            CashbackStores.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Store updated successfully!' });
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

function getStoreRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        CashbackStores.findById(req.query._id).then(catRow => {
            if (catRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': catRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getStoresToExport(req, res, next) {

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

function uploadStore(req, res, next) {

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
        let storeData = [];
        inputStream.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                storeData.push(row);
            }).on('end', function () {
                eachSeries(storeData, function (row, callback) {
                    const _id = row[0];
                    CashbackStores.findById({ _id: _id }).then(storeRow => {
                        if (storeRow) {
                            let updateData = {};
                            updateData.aid = row[1];
                            updateData.cat_id = row[3];
                            updateData.title = row[5];
                            updateData.details = row[6];
                            updateData.details_default = isNaN(parseInt(row[7])) ? 0 : parseInt(row[7]);
                            updateData.banner = row[8];
                            updateData.internal_banner = row[9];
                            updateData.link = row[10];
                            updateData.value = row[11];
                            updateData.comm = row[12];
                            updateData.vaild_from = (row[13]) ? row[13] : Date.now();
                            updateData.valid_to = (row[14] !== 'null') ? row[14] : null;
                            updateData.tweet = row[15];
                            updateData.send_mail = isNaN(parseInt(row[16])) ? 0 : parseInt(row[16]);
                            updateData.merchant_tc = row[17];
                            updateData.merchant_tc_default = isNaN(parseInt(row[18])) ? 0 : parseInt(row[18]);
                            updateData.youtube_video = row[19];
                            updateData.youtube_video_id = YouTubeGetID(row[19]);
                            updateData.meta_title = row[20];
                            updateData.meta_keywords = row[21];
                            updateData.meta_description = row[22];
                            CashbackStores.findByIdAndUpdate({ _id: storeRow._id }, { $set: updateData }).then(() => {

                            }).catch((err) => {
                                console.log('err', err);
                            })
                        }
                    })
                    setTimeout(function () { callback(); }, 300);

                }, () => {
                    return res.send({ success: true, message: 'Uploaded successfully!.' });
                });
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateStoreTags(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id } = body;
        if (!body.tags) return res.status(400).send({ success: false, message: 'Please select atleast one tag.' });


        CashbackStores.findById({
            _id: _id
        }).then(catRow => {

            let updateData = {};
            updateData.tags = body.tags;

            CashbackStores.findByIdAndUpdate({ _id: catRow._id }, { $set: updateData })
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
    getDropDownData,
    getCashbackStores,
    createStore,
    getStoresToExport,
    uploadStore,
    updateStoreStatus,
    getStoreRowById,
    updateStore,
    getTagsList,
    updateStoreTags
}

