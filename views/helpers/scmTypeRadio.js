var Handlebars = require('handlebars');

module.exports = function (context) {

    var output = '';
    var types = ['none', 'git'];
    for (var i = 0; i < types.length; i++) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="scmType" value="' + types[i] + '"';
        if (types[i] === context.scmType ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
