var Hapi = require('hapi');
var Purdy = require('purdy');
var Tacklebox = require('tacklebox');
var Lout = require('lout');
var Gills = require('./index');

var server = new Hapi.Server(8080);
var options = {};

server.pack.register({ plugin: Gills, options: options }, function(err) {
   if (err) {
       console.log('gills did not load');
   }
});

server.pack.register({ plugin: Lout, options: options }, function(err) {
   if (err) {
       console.log('lout did not load');
   }
});

server.pack.register({ plugin: Tacklebox , options: options }, function(err) {
   if (err) {
       console.log('tacklebox did not load');
   }
});

server.on('log', function (event) {

    console.log(JSON.stringify(event));
});

server.on('internalError', function (request, error) {

    console.error(JSON.stringify(error));
});
/*
server.on('request', function (request, event, tags) {

    if (!tags.response) {
        return;
    }

    var reqToRender = {
        time: new Date(),
        requestId: request.id,
        headers: request.headers,
        method: request.method,
        path: request.path,
        query: request.query,
        payload: request.payload,
        tags: tags ? Object.keys(tags) : ''
    };

    console.log('------ REQUEST RECEIVED -------');
    Purdy(reqToRender);
    console.log('-------------------------------');
});

server.on('response', function (request) {

    var reqToRender = {
        headers: request.response.headers,
        payload: request.response.source
    };

    console.log('------- RESPONSE SENT ---------');
    Purdy(reqToRender);
    console.log('-------------------------------');
});

*/

server.start(function () {

    console.log('started server: ' + server.info.uri);
});
