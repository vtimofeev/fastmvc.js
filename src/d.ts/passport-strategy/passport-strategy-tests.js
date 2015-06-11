var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var passport = require('passport-strategy');
var Strategy = (function (_super) {
    __extends(Strategy, _super);
    function Strategy(options, verify) {
        if (typeof options == 'function') {
            verify = options;
            options = {};
        }
        if (!verify) {
            throw new TypeError('DummyStrategy requires a verify callback');
        }
        _super.call(this);
        this.name = 'dummy';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;
    }
    Strategy.prototype.authenticate = function (req, options) {
        options = options || {};
        // Test fail method.
        this.fail({ message: options.missingTokenMessage || 'Missing token' }, 400);
        var self = this;
        function verified(err, user, info) {
            if (err) {
                return self.error(err);
            }
            if (!user) {
                return self.fail(info);
            }
            self.success(user, info);
        }
        verified(null, {}, {});
    };
    return Strategy;
})(passport.Strategy);
exports.Strategy = Strategy;
//# sourceMappingURL=passport-strategy-tests.js.map