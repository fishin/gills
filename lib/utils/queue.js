var internals = {
    queue: []
};

module.exports = internals.Queue = function(options) {

   this.settings = options;
   internals.Queue.settings = options;
   this.addJob = exports.addJob;
   this.removeJob = exports.removeJob;
   this.getQueue = exports.getQueue;
};

exports.addJob = function (jobId) {

    var queueTime = new Date().getTime();
    var queue = {
        jobId: jobId,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (jobId) {

    for (var i = 0; i < internals.queue.length; i++) {
         if (internals.queue[i].jobId === jobId) {
             internals.queue.splice(i,1);
         }
    }
    return null;
};

exports.getQueue = function () {

    var queue = [];
    for (var i = 0; i < internals.queue.length; i++) {
        var now = new Date().getTime();
        var shortId = internals.queue[i].jobId.split('-')[0];
        var elapsedTime = now - internals.queue[i].queueTime;
        var job = {
            jobId: internals.queue[i].jobId,
            queueTime: internals.queue[i].queueTime,
            shortId: shortId,
            elapsedTime: elapsedTime
        };
        queue.push(job);
    }
    return queue;
};
