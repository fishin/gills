var Common = require('./common');
var Hoek = require('hoek');

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

exports.getUsersConfig = function () {

    var commonConfig = internals.User.getCommonConfig();
    //console.log(commonConfig);   
    var users = internals.User.settings.plugins.tacklebox.getUsers();
    var config = {
        view_users: true,
        users: users
    };
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getUserCreateConfig = function () {

    var commonConfig = internals.User.getCommonConfig();
    //console.log(commonConfig);   
    var config = {};
    config.post_url = internals.User.settings.viewPath + '/user';
    config.view_user = true;
    // default to local
    config.type = 'local';
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getUserConfig = function (userId) {

    var commonConfig = internals.User.getCommonConfig();
    //console.log(commonConfig);   
    var config = {};
    var user = internals.User.settings.plugins.tacklebox.getUser(userId);
    config = {
        post_url: internals.User.settings.viewPath + '/user/'+user.id,
        id: user.id,
        type: user.type,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        password: user.password
    };
    config.view_user = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.createUser = function (payload) {

    var config = {
        name: payload.name,
        type: payload.type,
        displayName: payload.displayName,
        email: payload.email
    };
    if (payload.type === 'local') {
        config.password = payload.password;
    }
    var createConfig = internals.User.settings.plugins.tacklebox.createUser(config);
    return createConfig;
};

exports.deleteUser = function (userId) {

    internals.User.settings.plugins.tacklebox.deleteUser(userId);
};

exports.updateUser = function (userId, payload) {

    var originalUser = internals.User.settings.plugins.tacklebox.getUser(userId);
    var config = {
        id: userId,
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
    var updateConfig = internals.User.settings.plugins.tacklebox.updateUser(config.id, config);
    return updateConfig;
};
