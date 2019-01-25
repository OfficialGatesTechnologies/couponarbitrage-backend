const Menu = require('../../models/Jos_menu');
const { getToken, genRandomPassword } = require('../../utils/api.helpers');
var md5 = require('md5');
const path = require('path');
function createMenu(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { name, type, link, parent,
            access, ordering, introtext, description, defaultMenuItem, metatitle, metakey, metadesc, metadata
        } = body;
        if (!name) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!type) return res.status(400).send({ success: false, message: 'Please select the menu type.' });
        else if (!link) return res.status(400).send({ success: false, message: 'Please enter the link .' });
        Menu.find({ name: name, menuDeleted: 0 }).then(existMenu => {
            if (existMenu.length > 0) return res.status(400).send({ success: false, msg: 'Menu name already exists.' });
            const newMenu = new Menu();
            let newFileName = '';
            if (req.files) {
                let imageFile = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
                imageFile.mv(filename);
                newMenu.imageFile = newFileName;
            }
            newMenu.name = name;
            newMenu.type = type;
            newMenu.link = link;
            newMenu.parent = parent;
            newMenu.access = parseInt(access);
            newMenu.ordering = ordering;
            newMenu.introtext = introtext;
            newMenu.description = description;
            newMenu.defaultMenuItem = defaultMenuItem;
            newMenu.metatitle = metatitle;
            newMenu.metakey = metakey;
            newMenu.metadesc = metadesc;
            newMenu.metadata = metadata;
            newMenu.defaultMenuItem = 0;
            newMenu.save((err) => {
                if (err) {
                    console.log('err 1 ', err);
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Menu created successfully!' });
            });

        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateMenu(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, name, type, link, parent,
            access, ordering, introtext, description, defaultMenuItem, metatitle, metakey, metadesc, metadata
        } = body;
        if (!name) return res.status(400).send({ success: false, message: 'Please enter the title.' });
        else if (!type) return res.status(400).send({ success: false, message: 'Please select the menu type.' });
        else if (!link) return res.status(400).send({ success: false, message: 'Please enter the link .' });
        Menu.findById({
            _id: _id
        }).then(dataRow => {
            if (!dataRow) return res.status(401).send({ success: false, message: 'Invalid account.' });
            Menu.find({ name: name, menuDeleted: 0, _id: { $ne: _id } })
                .then(exisUsername => {
                    if (exisUsername.length > 0) return res.status(400).send({ success: false, msg: 'Menu name already exists.' });
                    let updateData = {};
                    if (req.files) {
                        let imageFile = req.files.file;
                        let imageName = req.files.file.name;
                        let imageExt = imageName.split('.').pop();
                        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                        let filename = path.join(__dirname, '../../uploads/banner/' + newFileName);
                        imageFile.mv(filename, function (err) { });
                        updateData.imageFile = newFileName;
                    }
                    updateData.name = name;
                    updateData.type = type;
                    updateData.link = link;
                    updateData.parent = parent;
                    updateData.access = parseInt(access);
                    updateData.ordering = (ordering) ? parseInt(ordering) : 0;
                    updateData.introtext = introtext;
                    updateData.description = description;
                    updateData.defaultMenuItem = defaultMenuItem;
                    updateData.metatitle = metatitle;
                    updateData.metakey = metakey;
                    updateData.metadesc = metadesc;
                    updateData.metadata = metadata;
                    Menu.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Menu updated successfully' });
                        }).catch((err) => {
                            console.log('err', err);
                            return res.status(500).send({ success: false, msg: 'server error 2' })
                        })
                }).catch(() => {

                    return res.status(500).send({ success: false, msg: 'server error 1 ' })
                })

        })
            .catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
                else return next({ status: 500, msg: 'server error 3' })
            })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getMenus(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { menuDeleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['menuDisabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { name: 1 };
        }

        Menu.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Menu.countDocuments(query)
                    .then(colCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: colCounts });
                    });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getAllMenus(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { menuDeleted: 0 };
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

function updateUserStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Menu.findById({ _id }).then(dataRow => {
            if (!dataRow) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.menuDeleted = 1;
            else
                updateData.menuDisabled = (action == 'enabled') ? 0 : 1;

            Menu.findByIdAndUpdate({ _id: dataRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Menu updated successfully!' });
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
function getUserRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Menu.findById(req.query._id, { password: 0 }).then(dataRow => {
            if (dataRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': dataRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    updateMenu,
    getMenus,
    createMenu,
    updateUserStatus,
    getUserRowById,
    getAllMenus

}

