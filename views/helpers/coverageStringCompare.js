var Handlebars = require('handlebars');

module.exports = function(context) {

    if (context.miss && context.miss !== 'false') {
        return new Handlebars.SafeString('<tr class="danger"><td>' + context.miss +'</td><td colspan=2>' + context.source + '</td></tr>\n');
    } else {
        return '';
    }
};
