const User = require('../../models/User');
const { getToken, genRandomPassword, getCryptedPassword } = require('../../utils/api.helpers');


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

        const {_id, name, last_name, email, username, password, cpassword, accountPhone,
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
    console.log('getUserAccounts');
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
module.exports = {
    updateUserAccount,
    getUserAccounts,
    createUserAccount,
    updateUserStatus,
    getUserRowById
}