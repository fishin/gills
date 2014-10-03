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
/*
       var user = {
           id: 1,
           name: 'lloyd',
           displayName: 'Lloyd Benson',
           email: 'lloyd.benson@gmail.com',
           apiKey: 'apikey',
           sshKey: 'sshkey'
       };
*/                    
    config.post_url = '/gills/user';
    config.view_user = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getUserConfig = function (user_id) {

    var commonConfig = internals.User.getCommonConfig();
    //console.log(commonConfig);   
    var config = {};
    var user = internals.User.settings.plugins.tacklebox.getUser(user_id);
    config = {
        post_url: '/gills/user/'+user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName
    };
    config.view_user = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.createUser = function (payload) {

    var config = {
        name: payload.name,
        displayName: payload.displayName,
        email: payload.email
    };
    var createConfig = internals.User.settings.plugins.tacklebox.createUser(config);
    return createConfig;
};

exports.deleteUser = function (user_id) {

    internals.User.settings.plugins.tacklebox.deleteUser(user_id);
};

exports.updateUser = function (user_id, payload) {

    var config = {
        id: user_id,
        name: payload.name,
        displayName: payload.displayName,
        email: payload.email
    };
    var updateConfig = internals.User.settings.plugins.tacklebox.updateUser(config.id, config);
    return updateConfig;
};
