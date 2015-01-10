var Cron = require('node-crontab');
var Job = require('./utils/job');
var Run = require('./utils/run');

var internals = {
    jobs: []
};

module.exports = internals.Scheduler = function(options) {

    internals.Scheduler.settings = options;
    this.initialize = internals.initialize;
};

internals.initialize = function() {

    //console.log('initializing scheduler');
    var job = new Job(internals.Scheduler.settings);
    var jobs = job.getJobsConfig().jobs;
    var run = new Run(internals.Scheduler.settings);
    for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].schedule && jobs[i].schedule.type == 'cron' ) {
            var jobId = jobs[i].id;
            console.log('schedule - adding job: ' + jobs[i].id);
            var scheduleId = Cron.scheduleJob(jobs[i].schedule.pattern, function(){
 
                console.log("Running job:" + this.id);
                run.startRun(this.id);
                //var intId = internals.getScheduleId(this.id);
                //console.log('cancelling scheduleId: ' + intId);
                //Cron.cancelJob(intId);
            }, null, jobs[i]);
            internals.jobs.push({ jobId: jobs[i].id, scheduleId: scheduleId }); 
        }
    }
};

internals.getScheduleId = function(jobId) {

    for (var i = 0; i < internals.jobs.length; i++) {
        if (internals.jobs[i].jobId === jobId) {
            return internals.jobs[i].scheduleId;
        }
    }
    return null;
};

internals.removeSchedule = function(jobId) {



};

internals.addSchedule = function(jobId) {

};
