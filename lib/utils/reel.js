'use strict';

const Hoek = require('hoek');
const Wreck = require('wreck');

const internals = {};

module.exports = internals.Reel = function (options) {

    this.settings = options;
    internals.Reel.settings = options;
    this.createReel = exports.createReel;
    this.updateReel = exports.updateReel;
    this.deleteReel = exports.deleteReel;
    this.getReelConfig = exports.getReelConfig;
    this.getReelCreateConfig = exports.getReelCreateConfig;
};

exports.getReelCreateConfig = function (cb) {

    const config = {};
    Wreck.get(internals.Reel.settings.api.url + '/reels', { json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const reels = pl;
        config.url = internals.Reel.settings.viewPath + '/reel';
        config.method = 'post';
        config.viewReel = true;
        config.reels = reels;
        return cb(config);
    });
};

exports.getReelConfig = function (reelId, cb) {

    Wreck.get(internals.Reel.settings.api.url + '/reel/' + reelId, { json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const reel = pl;
        Wreck.get(internals.Reel.settings.api.url + '/reels', { json: true }, (err2, resp2, pl2) => {

            Hoek.assert(!err2, err2);
            const reels = pl2;
            const config = {
                url: internals.Reel.settings.viewPath + '/reel/' + reel.id,
                method: 'post',
                id: reel.id,
                name: reel.name,
                description: reel.description,
                host: reel.host,
                directory: reel.directory,
                port: reel.port,
                size: reel.size
            };
            config.viewReel = true;
            config.reels = reels;
            return cb(config);
        });
    });
};

exports.createReel = function (payload, cb) {

    const config = {
        name: payload.name,
        host: payload.host,
        size: parseInt(payload.size),
        description: payload.description,
        directory: payload.directory,
        port: parseInt(payload.port)
    };
    Wreck.post(internals.Reel.settings.api.url + '/reel', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config), json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const createConfig = pl;
        return cb(createConfig);
    });
};

exports.deleteReel = function (reelId, cb) {

    Wreck.delete(internals.Reel.settings.api.url + '/reel/' + reelId, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.updateReel = function (reelId, payload, cb) {

    const config = {
        name: payload.name,
        host: payload.host,
        size: parseInt(payload.size),
        description: payload.description,
        directory: payload.directory,
        port: parseInt(payload.port)
    };
    Wreck.put(internals.Reel.settings.api.url + '/reel/' + reelId, { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config), json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const updateConfig = pl;
        return cb(updateConfig);
    });
};
