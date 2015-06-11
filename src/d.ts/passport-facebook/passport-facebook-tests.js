/**
 * Created by jcabresos on 4/19/2014.
 */
var passport = require('passport');
var facebook = require('passport-facebook');
// just some test model
var User = {
    findOrCreate: function (id, provider, callback) {
        callback(null, { username: 'james' });
    }
};
passport.use(new facebook.Strategy({
    clientID: process.env.PASSPORT_FACEBOOK_CLIENT_ID,
    clientSecret: process.env.PASSPORT_FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.PASSPORT_FACEBOOK_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile.id, profile.provider, function (err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
}));
//# sourceMappingURL=passport-facebook-tests.js.map