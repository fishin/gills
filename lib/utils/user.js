var Common = require('./common');
var Hoek = require('hoek');
var Wreck = require('wreck');

var internals = {};

module.exports = internals.User = function(options) {

   this.settings = options;
   internals.User.settings = options;
   var common = new Common(options);
   internals.User.getCommonConfig = common.getCommonConfig;
   this.createUser = exports.createUser;
   this.updateUser = exports.updateUser;
   this.deleteUser = exports.deleteUser;
   this.getUserConfig = exports.getUserConfig;
   this.getUsersConfig = exports.getUsersConfig;
   this.getUserCreateConfig = exports.getUserCreateConfig;
};

exports.getUsersConfig = function (cb) {

    internals.User.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get('http://localhost:8081/api/users', function (err, resp, pl) {

            var users = JSON.parse(pl);
            var config = {
                view_users: true,
                users: users
            };
            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

exports.getUserCreateConfig = function (cb) {

    internals.User.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        var config = {};
        config.post_url = internals.User.settings.viewPath + '/user';
        config.view_user = true;
        // default to local
        config.type = 'local';
        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getUserConfig = function (userId, cb) {

    internals.User.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get('http://localhost:8081/api/user/' + userId, function (err, resp, pl) {

            var config = {};
            var user = JSON.parse(pl);
            config = {
                post_url: internals.User.settings.viewPath + '/user/' + user.id,
                id: user.id,
                type: user.type,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                password: user.password
            };
            config.view_user = true;
            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

exports.createUser = function (payload, cb) {

    var config = {
        name: payload.name,
        type: payload.type,
        displayName: payload.displayName,
        email: payload.email
    };
    if (payload.type === 'local') {
        config.password = payload.password;
    }
    Wreck.post('http://localhost:8081/api/user', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config) }, function (err, resp, pl) {

        var createConfig = JSON.parse(pl);
        return cb(createConfig);
    });
};

exports.deleteUser = function (userId, cb) {

    Wreck.delete('http://localhost:8081/api/user/' + userId, function (err, resp, pl) {

        return cb();
    });
};

exports.updateUser = function (userId, payload, cb) {

    Wreck.get('http://localhost:8081/api/user/' + userId, function (err, resp, pl) {

        var originalUser = JSON.parse(pl);
        var config = {
            type: payload.type,
            name: payload.name,
            displayName: payload.displayName,
            email: payload.email
        };
        // we dont want to pass password again if password didnt change or it will encrypt the encrypt
        // we only care about password if its local
        if (originalUser.password !== payload.password && payload.type === 'local') {
            config.password = payload.password;
        }
        Wreck.post('http://localhost:8081/api/user/' + userId, { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config) }, function (err, resp, pl) {

            var updateConfig = JSON.parse(pl);
            return cb(updateConfig);
        });
    });
};
