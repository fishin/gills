var Handlebars = require('handlebars');

module.exports = function(type) {

    var output = '';
    var types = [ 'local', 'github' ];
    for (var i = 0; i < types.length; i++) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="type" value="' + types[i] + '"';
        if (types[i] === type ) {
            output += ' checked';
        }
        output +='> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
