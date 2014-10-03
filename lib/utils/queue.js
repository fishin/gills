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

exports.addJob = function (job_id) {

    var queueTime = new Date().getTime();
    var queue = {
        job_id: job_id,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (job_id) {

    for (var i = 0; i < internals.queue.length; i++) {
         if (internals.queue[i].job_id === job_id) {
             internals.queue.splice(i,1);
         }
    }
    return null;
};

exports.getQueue = function () {

    var queue = [];
    for (var i = 0; i < internals.queue.length; i++) {
        var now = new Date().getTime();
        var shortId = internals.queue[i].job_id.split('-')[0];
        var elapsedTime = now - internals.queue[i].queueTime;
        var job = {
            job_id: internals.queue[i].job_id,
            queueTime: internals.queue[i].queueTime,
            shortId: shortId,
            elapsedTime: elapsedTime
        };
        queue.push(job);
    }
    return queue;
};
