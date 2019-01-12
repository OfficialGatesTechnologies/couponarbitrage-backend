const aJwtStrategy = require('passport-jwt').Strategy,
aExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/Admin');
const {secret} = require('./config');

module.exports = function(apassport) {
    const opts = {};
    opts.jwtFromRequest = aExtractJwt.fromAuthHeaderWithScheme('jwt');   
    opts.secretOrKey = 'XX4478HDNDnsndHHGK238ma';
    apassport.use('admin',new aJwtStrategy(opts, function (jwt_payload, done) {
        Admin.findById(jwt_payload._id, function (err, user) {            
            if (err) {                
                return done(err, false);
            } else if (user) {    
                done(null, user);
            } else {
                done(null, false);
            }
         });
    }));
};