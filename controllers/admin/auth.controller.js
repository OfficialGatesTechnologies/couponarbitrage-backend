const Admin = require('../../models/Admin');
const EmailTemplates = require('../../models/Email_template');
const apiHeplers = require('../../utils/api.helpers');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../../config/config');
var md5 = require('md5');
var request = require('request');
const RECAPTCHA_SECRET = '6Le1I4gUAAAAAAbcOm7mUo0R16K_zFiz1Ko9yJFU';
function createNewAdmin(req, res, next) {
    if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
        return res.json({ success: false, msg: 'Please enter username and password.' });
    } else {
        const newAdmin = new Admin({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,     
            type: "System",
            accessModules: "admin",
            privileges:"admin",
            isSuperAdmin:1
        });

        var passwordSalt = apiHeplers.genRandomPassword(32);
        var adminPassword = apiHeplers.getCryptedPassword(req.body.password, passwordSalt);
        newAdmin.password = adminPassword + ':' + passwordSalt;
        // save the user
        newAdmin.save(function (err) {
            if (err) {
                return res.json({ success: false, msg: err });
            }
            Admin.findOne({
                email: req.body.email
            },
                { password: 0 },
                function (err, user) {
                    if (err) return next(err);
                    else {
                        const token = jwt.sign(user.toJSON(), config.secret);
                        return res.json({ success: true, msg: 'Created new user', token: 'JWT ' + token, data: user });
                    }
                });
        });
    }
}


function adminLogin(req, res, next) {
    const { body } = req;
    const {
        username,
        password,
        googleRecaptcha
    } = body;
    if (!username) return res.status(401).send({ success: false, msg: 'Please enter your username' });
    else if (!password) return res.status(401).send({ success: false, msg: 'Please enter your password' });
    else if (!googleRecaptcha) return res.status(401).send({ success: false, msg: 'Please verify the captcha' });

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
        Admin.findOne({
            username: username,
            isDeleted: false
        }, function (err, user) {
            if (err) return next(err);
            else if (!user) {
                return res.status(401).send({ success: false, msg: ' Invalid username' });
            } else {
                var userpassword = (user.password).split(':');
                var getPassword = apiHeplers.getCryptedPassword(password, userpassword[1]);
                var adminPassword = getPassword + ':' + userpassword[1];
                if (md5(adminPassword) !== md5(user.password)) {
                    return res.status(401).send({ success: false, msg: ' Invalid password' });
                }
                const token = jwt.sign(user.toJSON(), config.secret);
                return res.json({ success: true, token: 'JWT ' + token, data: user });
            }
        });

    });

}

function forgotPass(req, res, next) {
    if (!req.body.username) {
        return res.status(401).send({ success: false, message: 'Please enter your username' });
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

        Admin.findOne({ username: req.body.username, isDeleted: false })
            .then(user => {
                if (!user) throw { status: 404, msg: 'Account not found.' };
                return Promise.all([user, md5(apiHeplers.genRandomPassword(32))])
                    .then(([user, buffer]) => {
                        const token = buffer.toString('hex');
                        return Promise.all([user, token])
                    })
                    .then(([user, token]) => {
                        return Promise.all([token, Admin.findByIdAndUpdate({ _id: user._id }, { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 }, { upsert: true, new: true })])
                    })
                    .then(([token, user]) => {
                        EmailTemplates.findOne({ template_name: 'admin_forgot_password_email' })
                            .then(emailRow => {
                                var subject = emailRow.template_subject;
                                var htmlStr = emailRow.template_content;
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, 'Mani');
                                resultHtml = resultHtml.replace(/{logo_path}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'change-password/' + user.resetPasswordToken);
                                // var toEmail = userData.email;
                                var toEmail = 'manigandan.g@officialgates.com';
                                apiHeplers.sendCustomMail(user.username, toEmail, resultHtml, subject);
                                return res.status(201).send({ success: true, msg: 'Kindly check your email for further instructions' });
                            }).catch(err => {
                                console.log('err', err);
                                return res.json({ success: false, msg: 'server error' })
                            })

                    }).catch(() => {
                        return res.json({ success: false, msg: 'server error' })
                    })
            }).catch(err => {
                if (err.status === 404) res.status(400).send({ success: false, msg: err.msg });
                else return next({ status: 500, message: 'server error' });
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
    var passwordSalt = apiHeplers.genRandomPassword(32);

    Admin.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }).then(user => {
        if (!user) throw { status: 400, msg: 'Password reset token is invalid or has expired' };
        var adminPassword = apiHeplers.getCryptedPassword(req.body.password, passwordSalt);
        var newPassword = adminPassword + ':' + passwordSalt;
        Admin.findByIdAndUpdate({ _id: user._id }, { $set: { password: newPassword, resetPasswordExpires: undefined, resetPasswordToken: undefined } })
            .then(() => {
                return res.status(201).send({ success: true, msg: 'Your password was reset successfully. Please login!' });
            })
            .catch((err) => {
                console.log(err);
                return res.json({ success: false, msg: 'server error 11' })
            })

    })
        .catch(err => {
            console.log(err);
            if (err.status === 400) res.status(400).send({ success: false, msg: err.msg });
            else return next({ status: 500, message: 'server error 333' });
        })
    });
}


function checkAuthentication(req, res, next) {
    const token = apiHeplers.getToken(req.headers);
    if (token) {
        return Admin.findOne({ _id: req.user._id }, { password: 0 })
            .then(accounts => {
                if (accounts.length === 0) throw { status: 404, msg: 'Unauthorised' };
                return res.status(200).send(accounts);
            })
            .catch(err => {
                if (err.status === 404) res.status(404).send({ success: false, msg: err.msg });
                else return next({ status: 500, message: 'server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


module.exports = {
    createNewAdmin,
    adminLogin,
    forgotPass,
    resetPass,
    checkAuthentication
};