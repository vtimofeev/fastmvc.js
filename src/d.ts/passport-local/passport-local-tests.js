/**
 * Created by Maxime LUCE <https://github.com/SomaticIT>.
 */
var express = require("express");
var passport = require('passport');
var local = require('passport-local');
var User = (function () {
    function User() {
    }
    User.findOne = function (user, callback) {
        callback(null, new User());
    };
    User.prototype.verifyPassword = function (password) {
        return true;
    };
    return User;
})();
//#endregion
// Sample from https://github.com/jaredhanson/passport-local#configure-strategy
passport.use(new local.Strategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        if (!user.verifyPassword(password)) {
            return done(null, false);
        }
        return done(null, user);
    });
}));
// Sample from https://github.com/jaredhanson/passport-local#authenticate-requests
var app = express();
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});
//# sourceMappingURL=passport-local-tests.js.map