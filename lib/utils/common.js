var Wreck = require('wreck');

var internals = {};

module.exports = internals.Common = function (options) {

    this.settings = options;
    internals.Common.settings = options;
    this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', { json: 'force' }, function (err, resp, pl) {

        var reels = [];
        if (pl !== null && !pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'force' }, function (err, resp, pl) {

            //console.log(pl);
            var queue = [];
            if (pl !== null && !pl.statusCode) {
                queue = pl;
            }
            Wreck.get(internals.Common.settings.api.url + '/jobs/active', { json: 'force' }, function (err, resp, pl) {

                var activeJobs = {};
                if (pl !== null && !pl.statusCode) {
                    activeJobs = pl;
                }
                for (var key in activeJobs) {
                    activeJobs[key].shortJobId = key.split('-')[0];
                    activeJobs[key].shortRunId = activeJobs[key].runId.split('-')[0];
                    var percent = 0;
                    var now = new Date().getTime();
                    var run = {
                        startTime: now
                    };
                    var elapsedTime = now - run.startTime;
                    //percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                    activeJobs[key].elapsedTime = Math.round(elapsedTime / 1000);
                    activeJobs[key].percent = percent;
                    //var command = internals.getActiveCommand(runs[0].commands);
                    var command = 'activeCommand';
                    activeJobs[key].processes = [];
                    for (var j = 0; j < activeJobs[key].pids.length; j++) {
                        var process = {
                            jobId: key,
                            runId: activeJobs[key].runId,
                            pid: activeJobs[key].pids[j],
                            command: command
                        };
                        activeJobs[key].processes.push(process);
                    }
                }
                Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'force' }, function (err, resp, pl) {

                    var activePullRequests = {};
                    if (pl !== null && !pl.statusCode) {
                        activePullRequests = pl;
                    }
                    var config = {
                        reels: reels,
                        queue: queue,
                        activeJobs: activeJobs,
                        activePullRequests: activePullRequests
                    };
                    return cb(config);
                });
            });
        });
    });
};
