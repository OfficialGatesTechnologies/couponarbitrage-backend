const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const {secret} = require('./config');

module.exports = function(passport) {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');   
    opts.secretOrKey = 'XX4478HDNDnsndHHGK238ma';
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.findById(jwt_payload._id, function (err, user) {            
            if (err) {                
                return done(err, false);
            } else if (user) {  
                // when we return done(null, user) this adds the user details to the req object and we can access it in the controller in req.user          
                done(null, user);
            } else {
                done(null, false);
            }
         });
    }));
};
