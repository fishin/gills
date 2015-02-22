var Hapi = require('hapi');
var Tacklebox = require('tacklebox');
var Lout = require('lout');
var Gills = require('./index');

var server = new Hapi.Server();
server.connection({
    port: 8080,
    routes: {
        auth: 'session'
    }
});

var options = {
    prs: {
        autoStart: true
    },
    session: {
        cookie: {
            name: 'ficion',
            password: 'secret'
        },
        bell: {
            github: {
                password: 'secret',
                clientId: 'clientId',
                clientSecret: 'clientSecret'
            }
        }
    }
};

server.register({ register: Gills, options: options }, function(err) {
   if (err) {
       console.log('gills did not load');
   }
});

server.register({ register: Lout, options: {} }, function(err) {
   if (err) {
       console.log('lout did not load');
   }
});

server.on('log', function (event) {

    console.log(JSON.stringify(event));
});

server.on('internalError', function (request, error) {

    console.error(JSON.stringify(error));
});

server.start(function () {

    console.log('started server: ' + server.info.uri);
    //console.log(server.connections);
    //console.log(server.connections[0]._load.settings);
});
