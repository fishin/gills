//var Common = require('./common');
var Hoek = require('hoek');
var Wreck = require('wreck');

var internals = {};

module.exports = internals.User = function (options) {

    this.settings = options;
    internals.User.settings = options;
//    var common = new Common(options);
//    internals.User.getCommonConfig = common.getCommonConfig;
    this.createUser = exports.createUser;
    this.updateUser = exports.updateUser;
    this.deleteUser = exports.deleteUser;
    this.getUserConfig = exports.getUserConfig;
    this.getUsersConfig = exports.getUsersConfig;
    this.getUserCreateConfig = exports.getUserCreateConfig;
};

exports.getUsersConfig = function (cb) {

    internals.User.settings.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.User.settings.api.url + '/users', { json: true }, function (err, resp, pl) {

            var users = pl;
            var config = {
                viewUsers: true,
                users: users
            };
            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

exports.getUserCreateConfig = function (cb) {

    internals.User.settings.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        var config = {};
        config.url = internals.User.settings.viewPath + '/user';
        config.method = 'post';
        config.viewUser = true;
        // default to local
        config.type = 'local';
        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getUserConfig = function (userId, cb) {

    internals.User.settings.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.User.settings.api.url + '/user/' + userId, { json: true }, function (err, resp, pl) {

            var config = {};
            var user = pl;
            config = {
                url: internals.User.settings.viewPath + '/user/' + user.id,
                method: 'post',
                id: user.id,
                type: user.type,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                password: user.password
            };
            config.viewUser = true;
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
    Wreck.post(internals.User.settings.api.url + '/user', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config), json: true }, function (err, resp, pl) {

        var createConfig = pl;
        return cb(createConfig);
    });
};

exports.deleteUser = function (userId, cb) {

    Wreck.delete(internals.User.settings.api.url + '/user/' + userId, function (err, resp, pl) {

        return cb();
    });
};

exports.updateUser = function (userId, payload, cb) {

    Wreck.get(internals.User.settings.api.url + '/user/' + userId, { json: true }, function (err, resp, pl) {

        var originalUser = pl;
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
        Wreck.put(internals.User.settings.api.url + '/user/' + userId, { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config), json: true }, function (err2, resp2, pl2) {

            var updateConfig = pl2;
            return cb(updateConfig);
        });
    });
};
