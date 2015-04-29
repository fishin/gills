var Handlebars = require('handlebars');

module.exports = function (context) {

    //console.log(context);
    var output = '<a class="btn ' + context.buttonColor + '" href="/view/job/' + context.jobId + '/pr/' + context.number + '/merge">Merge</a>';
    return new Handlebars.SafeString(output);
};
