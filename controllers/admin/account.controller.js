const Admin = require('../../models/Admin');
const { getToken, genRandomPassword, getCryptedPassword } = require('../../utils/api.helpers');


function createAdminAccount(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { firstName, lastName, email, username, password, cpassword, privileges, accessModules, type } = body.userData;
        if (!firstName) return res.status(400).send({ success: false, message: 'Please enter your name.' });
        else if (!username) return res.status(400).send({ success: false, message: 'Please enter your username.' });
        else if (!email) return res.status(400).send({ success: false, message: 'Please enter your email address.' });
        else if (!password) return res.status(400).send({ success: false, message: 'Please enter your password.' });
        else if (!cpassword) return res.status(400).send({ success: false, message: 'Please confirm your password.' });
        else if (!privileges) return res.status(400).send({ success: false, message: 'Please select atleast one privilege.' });
        else if (!accessModules) return res.status(400).send({ success: false, message: 'Please select atleast one module.' });
        else if (!type) return res.status(400).send({ success: false, message: 'Please select the type.' });
        Admin.find({ username: username, isDeleted: false }).then(existAdmin => {
            if (existAdmin.length > 0) return res.status(400).send({ success: false, msg: 'Username already exists.' });
            Admin.find({ email: email, isDeleted: false }).then(existsEmail => {
                if (existsEmail.length > 0) return res.status(400).send({ success: false, msg: 'Email address already exists.' });
                const newAdmin = new Admin();
                newAdmin.firstName = firstName;
                newAdmin.lastName = lastName;
                newAdmin.username = username;
                newAdmin.email = email;
                newAdmin.privileges = privileges;
                newAdmin.accessModules = accessModules;
                newAdmin.type = type;
                var passwordSalt = genRandomPassword(32);
                var adminPassword = getCryptedPassword(password, passwordSalt);
                newAdmin.password = adminPassword + ':' + passwordSalt;
                newAdmin.save((err, doc) => {
                    if (err) {
                        console.log('err ', err);
                        return res.status(400).send({ success: true, msg: 'Server error!' });
                    }
                    return res.status(201).send({ success: true, msg: 'Account created successfully!' });
                });
            }).catch((err) => {
                console.log('err 2 ', err);
                return res.status(400).send({ success: false, msg: 'Server error 22' });
            });
        }).catch((err) => {
            console.log('err 1 ', err);
            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateAdminAccount(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;

        const { _id, firstName, username, email, password, cpassword, privileges, accessModules,type } = body.userData;
        if (!firstName) return res.status(401).send({ success: false, message: 'Please enter your name.' });
        else if (!username) return res.status(401).send({ success: false, message: 'Please enter your username.' });
        else if (!email) return res.status(401).send({ success: false, message: 'Please enter your email address.' });
        else if (req.body.changePass) {
            if (!password) return res.status(401).send({ success: false, message: 'Please enter your password.' });
            else if (!cpassword) return res.status(401).send({ success: false, message: 'Please confirm your password.' });
        }
        if(req.body.updateAdmin  != undefined && req.body.updateAdmin == 1){
            if (!privileges) return res.status(400).send({ success: false, message: 'Please select atleast one privilege.' });
            else if (!accessModules) return res.status(400).send({ success: false, message: 'Please select atleast one module.' });
            else if (!type) return res.status(400).send({ success: false, message: 'Please select the type.' });
        }
        Admin.findById({
            _id: _id
        })
            .then(user => {
                if (!user) return res.status(401).send({ success: false, message: 'Invalid account.' });
                Admin.find({ email: email, isDeleted: false, _id: { $ne: _id } })
                    .then(existEmail => {
                        if (existEmail.length > 0) return res.status(400).send({ success: false, msg: 'Email address  already exists.' });
                        Admin.find({ username: username, isDeleted: false, _id: { $ne: _id } })
                            .then(exisUsername => {
                                if (exisUsername.length > 0) return res.status(400).send({ success: false, msg: 'Username already exists.' });
                                let updateData = {
                                    firstName: firstName,
                                    username: username,
                                    email: email,                
                                };
                                if(req.body.updateAdmin  != undefined && req.body.updateAdmin == 1){
                                    updateData.privileges = privileges;
                                    updateData.accessModules = accessModules;
                                }
                                if (req.body.changePass) {
                                    var passwordSalt = genRandomPassword(32);
                                    var adminPassword = getCryptedPassword(password, passwordSalt);
                                    updateData.password = adminPassword + ':' + passwordSalt;
                                }
                                Admin.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                                    .then(() => {
                                        return res.status(201).send({ success: true, msg: 'Account updated successfully' });
                                    }).catch((err) => {
                                        console.log(err)
                                        return res.status(500).send({ success: false, msg: 'server error11' })
                                    })
                            }).catch((err) => {
                                console.log(err)
                                return res.status(500).send({ success: false, msg: 'server error44' })
                            })
                    }).catch((err) => {
                        console.log(err)
                        return res.status(500).send({ success: false, msg: 'server error22' })
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


function getAdminAccounts(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { isDeleted: false,isSuperAdmin:0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['isDisabled'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { timestamp: -1 };
        }

        Admin.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Admin.countDocuments(query)
                    .then(userCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: userCounts });

                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateAdminStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Admin.findById({ _id }).then(user => {
            if (!user) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.isDeleted = true;
            else
                updateData.isDisabled = (action == 'enabled') ? 0 : 1;

            Admin.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Account updated successfully!' });
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
function getAdminRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        Admin.findById(req.query._id, { password: 0 }).then(adminRow => {
            if (adminRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': adminRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
module.exports = {
    updateAdminAccount,
    getAdminAccounts,
    createAdminAccount,
    updateAdminStatus,
    getAdminRowById
}