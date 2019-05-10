const Menu = require('../models/Jos_menu');
const CashbackCat = require('../models/Cashback_caregories');
const Banner = require('../models/Banner');
const Static = require('../models/Static');
const TurnoverRegistration = require('../models/Turnover_registration');
const EmailTemplates = require('../models/Email_template');
const Faqs = require('../models/Faq');
const {
    getToken,
    genRandomPassword,
    getCryptedPassword,
    sendCustomMail
} = require('../utils/api.helpers');
var request = require('request');
const config = require('../config/config');
const RECAPTCHA_SECRET = '6Le1I4gUAAAAAAbcOm7mUo0R16K_zFiz1Ko9yJFU';

function getMenus(req, res) {
    let query = { menuDeleted: 0, menuDisabled: 0 };
    let sortQ = {};
    if (req.query.showInLandingPageMenu) {
        query['showInLandingPageMenu'] = 1;
    }
    if (req.query.showInMenu) {
        query['showInMenu'] = 1;
    }
    sortQ = { ordering: 1 };
    Menu.find(query).populate('submenus').sort(sortQ)
        .then(results => {
            if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
            return res.status(200).send({ success: true, results: results });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
}


function getMenuRowByUrl(req, res) {

    Menu.findOne({ link: req.query.link }).then(dataRow => {
        if (dataRow.length === 0) return res.status(200).send({ success: false });
        return res.status(200).send({ success: true, 'results': dataRow });
    }).catch(() => {
        return res.status(400).send({ success: false, msg: 'Server error' });
    });

}
function getCatRowByUrl(req, res) {

    CashbackCat.findOne({ cat_url: req.query.cat_url, cat_parent: req.query.parentId }).then(dataRow => {
        if (dataRow.length === 0) return res.status(200).send({ success: false });
        return res.status(200).send({ success: true, 'results': dataRow });
    }).catch(() => {
        return res.status(400).send({ success: false, msg: 'Server error' });
    });

}

function getBanners(req, res) {
    let query = { bannerDisabled: 0, bannerDeleted: 0 };
    if (req.query.bannerFor) {
        query['bannerFor'] = req.query.bannerFor;
    }

    Banner.find(query)
        .then(results => {
            if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
            return res.status(200).send({ success: true, results: results });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
}

function getStaticText(req, res, next) {
    var query = { isDeleted: false };
    query['static_text_for'] = req.query.static_text_for;
    Static.find(query)
        .then(results => {
            if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0 });
            return res.status(200).send({ success: true, 'results': results });
        }).catch((err) => {
            return res.status(400).send({ success: true, msg: 'Server error!' });
        });

}
function turnoverReg(req, res, next) {
    const { body } = req;
    const { name, email, customer_type, account_id, network_type, currency, googleRecaptcha } = body.userData;
    if (!email) return res.status(400).send({ success: false, message: 'Please enter your email.' });
     
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
        const newRegistration = new TurnoverRegistration();

        newRegistration.registrationType = network_type;
        newRegistration.registrationAccountName = name;
        newRegistration.registrationAccountEmail = email;
        newRegistration.registrationAccountId = account_id;
        newRegistration.registrationCurrency = currency;
        newRegistration.registrationApproved = 0;
        newRegistration.customer_type = parseInt(customer_type)
        newRegistration.save((err) => {
            if (err) {
                return res.status(400).send({ success: true, msg: err });
            }
            EmailTemplates.findOne({ template_name: 'new_turnover_registration_request' })
                .then(emailRow => {
                    var subject = emailRow.template_subject;
                    var htmlStr = emailRow.template_content;
                    var subjectHtml = subject.replace(/{NETWORK}/g, network_type);
                    var customer_type = customer_type == 1 ? 'New' : 'Existing';
                    var resultHtml = htmlStr.replace(/{USER_NAME}/g, name);
                    resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                    resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                    resultHtml = resultHtml.replace(/{NETWORK}/g, network_type);
                    resultHtml = resultHtml.replace(/{NAME}/g, name);
                    resultHtml = resultHtml.replace(/{CUR}/g, currency);
                    resultHtml = resultHtml.replace(/{ACCOUNT_ID}/g, account_id);
                    resultHtml = resultHtml.replace(/{EMAIL}/g, email);
                    resultHtml = resultHtml.replace(/{CUS_TYPE}/g, customer_type);

                    var toEmail = email;

                    sendCustomMail(name, toEmail, resultHtml, subjectHtml);

                    return res.status(201).send({ success: true, msg: 'Application has been submitted!' });
                }).catch(err => {
                    console.log(err);
                    return res.json({ success: false, msg: 'server error 4' })
                })

        });


    });
}

function getFaqs(req, res, next) {
    let query = {};
    query['faqCategory'] = req.query.faqCategory;
    Faqs.find(query)
        .then(results => {
            if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
            return res.status(200).send({ success: true, results: results });
        })
        .catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
}

module.exports = {
    getMenus,
    getMenuRowByUrl,
    getCatRowByUrl,
    getBanners,
    getStaticText,
    turnoverReg,
    getFaqs
}

