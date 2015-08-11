var Handlebars = require('handlebars');

module.exports = function (context) {

    var output = '';
    var types = ['none', 'maxnum', 'maxdays'];
    for (var i = 0; i < types.length; i++) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="archiveType" value="' + types[i] + '"';
        if (types[i] === context.archiveType ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
