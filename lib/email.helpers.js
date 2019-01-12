const {User} = require('../models/index');
const nodemailer = require('nodemailer');
const {nodeMailerPass, nodeMailerUser} = require('../config/config');
const pug = require('pug');
const moment = require('moment');   
const fs = require('fs');
const path = require('path');
function sendApplicationResult(userId, accountBrand, brandId, accountEmail) {  
    User.findOne({_id: userId}, { password: 0 })
    .then(user => {

        const name = user.firstName + ' ' + user.lastName;
        const email = user.email;
        const brand = accountBrand;
        const accountId = brandId;
        const paymentEmail = accountEmail; 
        const date = moment().format('MMM Do YYYY');
        
        const mailOptions = {
            from: nodeMailerUser, 
            to: email, 
            subject: `Your application for ${brand} account ${accountId} has been approved`, 
            replyTo: nodeMailerUser,
            html: applicationConfirm({name: name, brand: brand, accountId: accountId, paymentEmail: paymentEmail, date: date})
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: nodeMailerUser,
                pass: nodeMailerPass
            }
        })

        transporter.sendMail(mailOptions)
        .then((res) => {                    
            if (res.rejected.length > 0) throw {status: 404, message: 'Rejected'};         
            return res.status(201).send({success: true, msg: 'Email sent'});      
        })
        .catch((err) => {
            fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
        })

    })
    .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
    })   
}

function sendApplicationSubmit (userId, brand, accountId, paymentEmail, currency) {
    User.findOne({_id: userId}, { password: 0 })
    .then(user => {

        const name = user.firstName + ' ' + user.lastName;
        const email = user.email;
        const date = moment().format('MMM Do YYYY');

        const mailOptions = {
            from: nodeMailerUser, 
            to: email, 
            subject: `Your application for ${brand} account ${accountId} has been submitted`, 
            replyTo: nodeMailerUser,
            html: applicationSubmit({name: name, brand: brand, accountId: accountId, paymentEmail: paymentEmail, date: date, currency: currency})
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: nodeMailerUser,
                pass: nodeMailerPass
            }
        })

        transporter.sendMail(mailOptions)
        .then((res) => {                    
            if (res.rejected.length > 0) throw {status: 404, message: 'Rejected'};         
            return res.status(201).send({success: true, msg: 'Email sent'});        
        })
        .catch((err) => {
            fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
        })
    })
    .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
    })   
    
}

function sendMonthStatsOnFriday(report) {  
    
    User.findOne({_id: report.belongsToUser}, { password: 0 })
    .then(user => {
        
        const name = user.firstName + ' ' + user.lastName;
        const email = user.email;
        const brand = report.brand;
        const accountId = report.account.accountId;
        const transfers = report.account.transValue;        
        const cashback = report.account.cashback;
        const rate = report.account.cashbackRate;
        const month = report.monthId;
        const period = report.periodId; 
        const date = moment().format('MMM Do YYYY');

        const mailOptions = {
            from: nodeMailerUser, 
            to: email, 
            subject: `Your monthly stats for ${month} for account ${accountId}`, 
            replyTo: nodeMailerUser,
            html: weeklyStatsUpdate({name: name, brand: brand, accountId: accountId, transfers: transfers, cashback: cashback, rate: rate, date: date, month: month, period: period})
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: nodeMailerUser,
                pass: nodeMailerPass
            }
        })

        transporter.sendMail(mailOptions)
        .then((res) => {                    
            if (res.rejected.length > 0) throw {status: 404, message: 'Rejected'};         
            return res.status(201).send({success: true, msg: 'Email sent'});           
        })
        .catch((err) => {
            fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
        })

    })
    .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
    })   
}

function sendFinalMonthlyStats (report) {
    User.findOne({_id: report.belongsToUser}, { password: 0 })
    .then(user => {
        
        const name = user.firstName + ' ' + user.lastName;
        const email = user.email;
        const brand = report.brand;
        const accountId = report.account.accountId;
        const transfers = report.account.transValue;        
        const cashback = report.account.cashback;
        const rate = report.account.cashbackRate;
        const month = report.monthId;
        const period = report.periodId; 
        const date = moment().format('MMM Do YYYY');

        const mailOptions = {
            from: nodeMailerUser, 
            to: email, 
            subject: `Your confirmed monthly stats for ${month} for account ${accountId}`, 
            replyTo: nodeMailerUser,
            html: finalMonthlyStats({name: name, brand: brand, accountId: accountId, transfers: transfers, cashback: cashback, rate: rate, date: date, month: month, period: period})
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: nodeMailerUser,
                pass: nodeMailerPass
            }
        })

        transporter.sendMail(mailOptions)
        .then((res) => {                    
            if (res.rejected.length > 0) throw {status: 404, message: 'Rejected'};         
            return res.status(201).send({success: true, msg: 'Email sent'});             
        })
        .catch((err) => {
            fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
        })

    })
    .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
    })   
}

function sendPaymentRequest (payment, firstName, lastName, email) {
    
    const name = firstName + ' ' + lastName;
    const accountId = payment.accountId;            
    const cashback = payment.cashback;  
    const status = payment.status;  
    const month = payment.month;     
    const date = moment().format('MMM Do YYYY');

    const mailOptions = {
        from: nodeMailerUser, 
        to: email, 
        subject: `We have received your payment request for account ${accountId}`, 
        replyTo: nodeMailerUser,
        html: paymentRequest({name: name, accountId: accountId, cashback: cashback, status: status, date: date, month: month})
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: nodeMailerUser,
            pass: nodeMailerPass
        }
    })

    transporter.sendMail(mailOptions)
    .then((res) => { 
        if (res.rejected.length > 0) throw {status: 404, message: 'Rejected'};         
        return res;     
    })
    .catch((err) => {
        console.log(err);
        fs.appendFileSync(path.join(__dirname, '../logs/error_logs.txt'), `\n ${err} || ${new Date()}`);
    })

   
}

module.exports = {
    sendApplicationResult,
    sendApplicationSubmit,
    sendMonthStatsOnFriday,
    sendFinalMonthlyStats,
    sendPaymentRequest
}