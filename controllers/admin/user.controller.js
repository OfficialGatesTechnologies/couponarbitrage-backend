const User = require('../../models/User');
const UserTracking = require('../../models/User_tracking');
const UserTrackHistory = require('../../models/User_tracking_history');
const TurnoverRegistration = require('../../models/Turnover_registration');
const UserIntrested = require('../../models/User_intrested');
const EmailTemplates = require('../../models/Email_template');
const {
    getToken,
    genRandomPassword,
    getCryptedPassword,
    sendCustomMail
} = require('../../utils/api.helpers');
const config = require('../../config/config');

function createUserAccount(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { name, last_name, email, username, password, cpassword, accountPhone,
            accountCountry, accountReferrence, accountSkrillEmail, accountNetellerEmail
            , accountPaypalEmail, bankAccountName, bankAccountNumber, bankAccountSortCode, paymentStatus
            , uservip, cutodds_auth } = body.userData;
        if (!name) return res.status(400).send({ success: false, message: 'Please enter your name.' });
        else if (!username) return res.status(400).send({ success: false, message: 'Please enter your username.' });
        else if (!email) return res.status(400).send({ success: false, message: 'Please enter your email address.' });
        else if (!password) return res.status(400).send({ success: false, message: 'Please enter your password.' });
        else if (!cpassword) return res.status(400).send({ success: false, message: 'Please confirm your password.' });
        else if (!accountPhone) return res.status(400).send({ success: false, message: 'Please enter the phone number.' });
        User.find({ username: username, accountDeleted: 0 }).then(existUser => {
            if (existUser.length > 0) return res.status(400).send({ success: false, msg: 'Username already exists.' });
            User.find({ email: email, accountDeleted: 0 }).then(existsEmail => {
                if (existsEmail.length > 0) return res.status(400).send({ success: false, msg: 'Email address already exists.' });
                let query = {};
                User.countDocuments(query)
                    .then(userCounts => {
                        const newUser = new User();
                        newUser.epiCode = userCounts + 1;
                        newUser.name = name;
                        newUser.last_name = last_name;
                        newUser.username = username;
                        newUser.email = email;
                        newUser.accountPhone = accountPhone;
                        newUser.accountCountry = accountCountry;
                        newUser.accountReferrence = accountReferrence;
                        newUser.accountSkrillEmail = accountSkrillEmail;
                        newUser.accountNetellerEmail = accountNetellerEmail;
                        newUser.accountPaypalEmail = accountPaypalEmail;
                        newUser.bankAccountName = bankAccountName;
                        newUser.bankAccountNumber = bankAccountNumber;
                        newUser.bankAccountSortCode = bankAccountSortCode;
                        newUser.paymentStatus = paymentStatus;
                        newUser.uservip = uservip;
                        newUser.usertype = 'Registered';
                        newUser.cutodds_auth = cutodds_auth;
                        var passwordSalt = genRandomPassword(32);
                        var userPassword = getCryptedPassword(password, passwordSalt);
                        newUser.password = userPassword + ':' + passwordSalt;
                        newUser.save((err, doc) => {
                            if (err) {
                                return res.status(400).send({ success: true, msg: 'Server error!' });
                            }
                            return res.status(201).send({ success: true, msg: 'Account created successfully!' });
                        });
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

function updateUserAccount(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;

        const { _id, name, last_name, email, username, password, cpassword, accountPhone,
            accountCountry, accountReferrence, accountSkrillEmail, accountNetellerEmail
            , accountPaypalEmail, bankAccountName, bankAccountNumber, bankAccountSortCode, paymentStatus
            , uservip, cutodds_auth } = body.userData;


        if (!name) return res.status(401).send({ success: false, message: 'Please enter your name.' });
        else if (!username) return res.status(401).send({ success: false, message: 'Please enter your username.' });
        else if (!email) return res.status(401).send({ success: false, message: 'Please enter your email address.' });
        else if (!accountPhone) return res.status(400).send({ success: false, message: 'Please enter the phone number.' });
        else if (req.body.changePass) {
            if (!password) return res.status(401).send({ success: false, message: 'Please enter your password.' });
            else if (!cpassword) return res.status(401).send({ success: false, message: 'Please confirm your password.' });
        }

        User.findById({
            _id: _id
        })
            .then(user => {
                if (!user) return res.status(401).send({ success: false, message: 'Invalid account.' });
                User.find({ email: email, accountDeleted: 0, _id: { $ne: _id } })
                    .then(existEmail => {
                        if (existEmail.length > 0) return res.status(400).send({ success: false, msg: 'Email address  already exists.' });
                        User.find({ username: username, accountDeleted: 0, _id: { $ne: _id } })
                            .then(exisUsername => {
                                if (exisUsername.length > 0) return res.status(400).send({ success: false, msg: 'Username already exists.' });
                                let updateData = {};
                                updateData.name = name;
                                updateData.last_name = last_name;
                                updateData.username = username;
                                updateData.email = email;
                                updateData.accountPhone = accountPhone;
                                updateData.accountCountry = accountCountry;
                                updateData.accountReferrence = accountReferrence;
                                updateData.accountSkrillEmail = accountSkrillEmail;
                                updateData.accountNetellerEmail = accountNetellerEmail;
                                updateData.accountPaypalEmail = accountPaypalEmail;
                                updateData.bankAccountName = bankAccountName;
                                updateData.bankAccountNumber = bankAccountNumber;
                                updateData.bankAccountSortCode = bankAccountSortCode;
                                updateData.paymentStatus = paymentStatus;
                                updateData.uservip = uservip;
                                updateData.cutodds_auth = cutodds_auth;

                                if (req.body.changePass) {
                                    var passwordSalt = genRandomPassword(32);
                                    var userPassword = getCryptedPassword(password, passwordSalt);
                                    updateData.password = userPassword + ':' + passwordSalt;
                                }
                                console.log(updateData);
                                User.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
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


function getUserAccounts(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { accountDeleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.searchStatus && req.query.searchStatus != 'all') {
            let searchStatus = (req.query.searchStatus == 'Disabled') ? 1 : 0;
            query['block'] = searchStatus;
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { registerDate: -1 };
        }

        User.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                User.countDocuments(query)
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
function getUserAccountsToExport(req, res, next) {

    const token = getToken(req.headers);
    if (token) {  
        let query = { accountDeleted: 0 };      
        User.find(query).select({ "name": 1,"last_name":1,"username":1,"email":1,"registerDate":1,"moneyBookerId":1,"moneyBookerBonus":1,"accountPhone":1, "_id": 0})
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                return res.status(200).send({ success: true, results: results });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getUserTrackingList(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { updated: -1 };
        }

        UserTracking.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                UserTracking.countDocuments(query)
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

function getUserTrackingHistory(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { belongsTo: req.query.id };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { created: -1 };
        }

        UserTrackHistory.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                UserTrackHistory.countDocuments(query)
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

function updateUserStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        User.findById({ _id }).then(user => {
            if (!user) throw { status: 400, msg: 'Invalid account.' };
            let updateData = {};
            if (action == 'delete')
                updateData.accountDeleted = 1;
            else
                updateData.block = (action == 'enabled') ? 0 : 1;

            User.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
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
function getUserRowById(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        User.findById(req.query._id, { password: 0 }).then(userRow => {
            if (userRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': userRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getUserTurnoverReg(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { registrationAdded: -1 };
        }

        TurnoverRegistration.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                TurnoverRegistration.countDocuments(query)
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

function updateTurnoverReg(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        TurnoverRegistration.findById({ _id }).then(dateRow => {
            if (!dateRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete') {
                TurnoverRegistration.findByIdAndRemove(dateRow._id)
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Request deleted successfully!' });
                    })
                    .catch(() => {
                        return res.json({ success: false, msg: 'server error' })
                    })
            } else {
                updateData.accountDeleted = 1;
                updateData.registrationApproved = (action == 'approve') ? Date.now() : 1;
                let templateName = (action == 'approve') ? 'turnover_application_successful' : 'turnover_application_declined';
                let message = (action == 'approve') ? 'Request approved successfully' : 'Request declined successfully';
                TurnoverRegistration.findByIdAndUpdate({ _id: dateRow._id }, { $set: updateData })
                    .then(() => {
                        EmailTemplates.findOne({ template_name: templateName })
                            .then(emailRow => {
                                var subject = emailRow.template_subject;
                                var htmlStr = emailRow.template_content;
                                var subjectHtml = subject.replace(/{SCHEME}/g, dateRow.registrationType);
                                var customer_type = dateRow.customer_type == 1 ? 'New' : 'Existing';
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, dateRow.registrationAccountName);
                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{SCHEME}/g, dateRow.registrationType);
                                resultHtml = resultHtml.replace(/{NAME}/g, dateRow.registrationAccountName);
                                resultHtml = resultHtml.replace(/{ACCOUNT_ID}/g, dateRow.registrationAccountId);
                                resultHtml = resultHtml.replace(/{EMAIL}/g, dateRow.registrationAccountEmail);
                                resultHtml = resultHtml.replace(/{CUS_TYPE}/g, customer_type);

                                var toEmail = dateRow.registrationAccountEmail;

                                sendCustomMail(dateRow.registrationAccountName, toEmail, resultHtml, subjectHtml);

                                return res.status(201).send({ success: true, msg: message });
                            }).catch(err => {
                                console.log(err);
                                return res.json({ success: false, msg: 'server error 4' })
                            })


                    }).catch(() => {
                        return res.status(400).send({ success: false, msg: 'Server error 2' });
                    });
            }

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error 1 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getUserInterested(req, res, next) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { user_intrested_deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }
        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { user_intrested_added: -1 };
        }

        UserIntrested.find(query, { password: 0 }).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                UserIntrested.countDocuments(query)
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
function updateUserInterested(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        UserIntrested.findById({ _id }).then(dateRow => {
            if (!dateRow) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};

            updateData.user_intrested_deleted = Date.now();

            UserIntrested.findByIdAndUpdate({ _id: dateRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Request deleted successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: false, msg: 'Server error 2' });
                });


        }).catch((err) => {
            console.log(err);
            return res.status(400).send({ success: false, msg: 'Server error 1 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function searchUsers(req, res) {
    const token = getToken(req.headers);
    if (token) {
        let query = { accountDeleted: 0 };
        if (req.query.query) {
            query['username'] = new RegExp(req.query.query, 'i');
        } 
       
        User.find(query).select({ "name": 1,"last_name":1,"username":1,"email":1, "_id": 1,"epiCode":1})
            .then(results => {
                return res.status(200).send({ success: true, results: results });
            }).catch(() => res.status(400).send({ success: false, msg: 'Server error' }));
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

module.exports = {
    updateUserAccount,
    getUserAccounts,
    createUserAccount,
    updateUserStatus,
    getUserRowById,
    getUserTrackingList,
    getUserTrackingHistory,
    getUserTurnoverReg,
    updateTurnoverReg,
    getUserInterested,
    updateUserInterested,
    getUserAccountsToExport,
    searchUsers
}

