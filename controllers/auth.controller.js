const Admin = require('../models/Admin');
const User = require('../models/User');
const EmailTemplates = require('../models/Email_template');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
var md5 = require('md5');
var request = require('request');
const RECAPTCHA_SECRET = '6Le1I4gUAAAAAAbcOm7mUo0R16K_zFiz1Ko9yJFU';
const {
    sendCustomMail,
    getToken,
    genRandomPassword,
    getCryptedPassword } = require('../utils/api.helpers');
function createUserAccount(req, res) {

    const { body } = req;
    const { name, last_name, email, username, password, cpassword, accountPhone, googleRecaptcha } = body.userData;
    if (!name) return res.status(400).send({ success: false, msg: 'Please enter your name.' });
    else if (!username) return res.status(400).send({ success: false, msg: 'Please enter your username.' });
    else if (!email) return res.status(400).send({ success: false, msg: 'Please enter your email address.' });
    else if (!password) return res.status(400).send({ success: false, msg: 'Please enter your password.' });
    else if (!cpassword) return res.status(400).send({ success: false, msg: 'Please confirm your password.' });
    else if (!accountPhone) return res.status(400).send({ success: false, msg: 'Please enter the phone number.' });
    var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + googleRecaptcha + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;
    request(recaptcha_url, function (error, resp, resBody) {
        if (error) return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        resBody = JSON.parse(resBody);
        if (resBody.success !== undefined && !resBody.success) {
            return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        }
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
                        newUser.usertype = 'Registered';
                        var passwordSalt = genRandomPassword(32);
                        var userPassword = getCryptedPassword(password, passwordSalt);
                        newUser.password = userPassword + ':' + passwordSalt;
                        newUser.save((err) => {
                            if (err) {
                                return res.status(400).send({ success: true, msg: 'Server error!' });
                            }
                            const token = jwt.sign(newUser.toJSON(), config.secret);
                            return res.json({ success: true, token: 'JWT ' + token, data: newUser });

                        });
                    });


            }).catch(() => {

                return res.status(400).send({ success: false, msg: 'Server error 22' });
            });
        }).catch(() => {

            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    });
}


function userLogin(req, res, next) {
    const { body } = req;
    const {
        username,
        password,

    } = body;
    if (!username) return res.status(401).send({ success: false, msg: 'Please enter your username' });
    else if (!password) return res.status(401).send({ success: false, msg: 'Please enter your password' });
    User.findOne({
        username: username,
        accountDeleted: 0,
        
    }, function (err, user) {
        if (err) return next(err);
        else if (!user) {
            return res.status(401).send({ success: false, msg: ' Invalid username' });
        } else { 
            var userpassword = (user.password).split(':');
            var getPassword = getCryptedPassword(password, userpassword[1]);
            var uPassword = getPassword + ':' + userpassword[1];
            if (md5(uPassword) !== md5(user.password)) {
                return res.status(401).send({ success: false, msg: ' Invalid password' });
            }
            if(user.block !== 0){
                return res.status(401).send({ success: false, msg: ' Your account has been disabled. Please contact admin' });
            }
            const token = jwt.sign(user.toJSON(), config.secret);
            return res.json({ success: true, token: 'JWT ' + token, data: user });
        }
    });



}

function forgotPass(req, res, next) {
    if (!req.body.email) {
        return res.status(401).send({ success: false, msg: 'Please enter your email' });
    }
    else if (!req.body.googleRecaptcha) return res.status(401).send({ success: false, msg: 'Please verify the captcha' });

    var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body.googleRecaptcha + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    request(recaptcha_url, function (error, resp, resBody) {
        if (error) return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        resBody = JSON.parse(resBody);
        if (resBody.success !== undefined && !resBody.success) {
            return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        }

        User.findOne({ email: req.body.email, accountDeleted: 0 ,block:0})
            .then(user => {
                if (!user) throw { status: 404, msg: 'Account not found.' };
                return Promise.all([user, md5(genRandomPassword(32))])
                    .then(([user, buffer]) => {
                        const token = buffer.toString('hex');
                        return Promise.all([user, token])
                    })
                    .then(([user, token]) => {
                        return Promise.all([token, User.findByIdAndUpdate({ _id: user._id }, { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 }, { upsert: true, new: true })])
                    })
                    .then(([token,user]) => {
                        EmailTemplates.findOne({ template_name: 'admin_forgot_password_email' })
                            .then(emailRow => {
                                var subject = emailRow.template_subject;
                                var htmlStr = emailRow.template_content;
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, user.username);
                                resultHtml = resultHtml.replace(/{logo_path}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.site_base_url + 'change-password/' + user.resetPasswordToken);
                                var toEmail = user.email;
                                sendCustomMail(user.username, toEmail, resultHtml, subject);
                                return res.status(201).send({ success: true, msg: 'Kindly check your email for further instructions' });
                            }).catch(err => {
                              console.log(err);
                                return res.json({ success: false, msg: err })
                            })

                    }).catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: 'server error sd' })
                    })
            }).catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg });
                else return next({ status: 500, msg: 'server erro dsds r' });
            })
    });

}

function resetPass(req, res, next) {
    if (!req.body.googleRecaptcha) return res.status(401).send({ success: false, msg: 'Please verify the captcha' });

    var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body.googleRecaptcha + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    request(recaptcha_url, function (error, resp, resBody) {
        if (error) return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        resBody = JSON.parse(resBody);
        if (resBody.success !== undefined && !resBody.success) {
            return res.status(401).send({ success: false, msg: ' Captcha validation failed' });
        }
        var passwordSalt = genRandomPassword(32);

        User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }).then(user => {
            if (!user) throw { status: 400, msg: 'Password reset token is invalid or has expired' };
            var uPassword = getCryptedPassword(req.body.password, passwordSalt);
            var newPassword = uPassword + ':' + passwordSalt;
            User.findByIdAndUpdate({ _id: user._id }, { $set: { password: newPassword, resetPasswordExpires: undefined, resetPasswordToken: undefined } })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Your password was reset successfully. Please login!' });
                })
                .catch((err) => {
                    console.log(err);
                    return  res.status(401).send({ success: false, msg: ' server error 11' });
                })

        })
            .catch(err => {
                console.log(err);
                if (err.status === 400) res.status(400).send({ success: false, msg: err.msg });
                else return next({ status: 500, msg: 'server error 333' });
            })
    });
}


function checkAuthentication(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        return User.findOne({ _id: req.user._id }, { password: 0 })
            .then(accounts => {
                if (accounts.length === 0) throw { status: 404, msg: 'Unauthorised' };
                return res.status(200).send(accounts);
            })
            .catch(err => {
                if (err.status === 404) res.status(404).send({ success: false, msg: err.msg });
                else return next({ status: 500, msg: 'server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    createUserAccount,

    userLogin,
    forgotPass,
    resetPass,
    checkAuthentication
};