var Handlebars = require('handlebars');

module.exports = function (context) {

   console.log(context);
    var output = '';
    if (context.type === 'github') {
        output = '<a class="btn btn-info" href="/view/job/pr/' + context.number + '/merge">Merge</a>';
    }
    return new Handlebars.SafeString(output);
};
