'use strict';

const Hapi = require('hapi');
const Lout = require('lout');
const Gills = require('./lib');

const server = new Hapi.Server();
server.connection({
    port: 8080,
    routes: {
        auth: 'session'
    }
});

const options = {
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

server.register({ register: Gills, options: options }, (err) => {

    if (err) {
        console.log('gills did not load');
    }
});

server.register({ register: Lout, options: {} }, (err) => {

    if (err) {
        console.log('lout did not load');
    }
});

server.on('log', (event) => {

    console.log(JSON.stringify(event));
});

server.on('internalError', (request, error) => {

    console.error(JSON.stringify(error));
});

server.start(() => {

    console.log('started server: ' + server.info.uri);
    //console.log(server.connections);
    //console.log(server.connections[0]._load.settings);
});
