var md5 = require('md5');
const nodemailer = require('nodemailer');
const getToken = (headers) => {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const formatInDescDate = (arr) => {
  return arr.sort((a, b) => {
    a = new Date(moment(a.periodId.slice(0, 10).split('/').join('-')).format())
    b = new Date(moment(b.periodId.slice(0, 10).split('/').join('-')).format())
    return b - a;
  })
}


const convertToSlug = (Text) => {

  return Text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    ;
}

const formatBrandName = (str) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}
const genRandomPassword = (length) => {
  var makepass = "";
  var salt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < length; i++)
    makepass += salt.charAt(Math.floor(Math.random() * salt.length));

  return makepass;
}

const sendCustomMail = (toname, to, html, subject) => {
  to = 'manigandan.g@officialgates.com';
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@officialgates.com',
      pass: 'chennai@999333'
    }
  });
  var mailOptions = {
    from: ' "Couponarbitrage" <gunasekar.k@officialgates.com>',
    to: to,
    subject: subject,
    html: html
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return false;
    } else {
      //console.log('Email sent: ' + info.response);
      return true;
    }
  });

}

const getCryptedPassword = (password, salt) => {

  return (salt) ? md5(password + salt) : md5(password);

}

module.exports = {
  getToken,
  formatInDescDate,
  formatBrandName,
  genRandomPassword,
  getCryptedPassword,
  sendCustomMail,
  convertToSlug

}

