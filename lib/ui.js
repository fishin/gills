var Fs = require('fs');

exports.redirectHome = function (request, reply) {

    reply.redirect('/ui');
};

exports.getHome = function (request, reply) {

    var config = {
        name: 'guest'
    }; 
    reply.view('home.html', config);   
};
