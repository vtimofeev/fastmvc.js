var parseString = require('xml2js').parseString;
var xml = '<div class="button button-{selected}">Hello xml2js!' +
        '<div class="close" states="hover">{closeText}</div>' +
        '<div class="close" states="hover">{closeText}</div>' +
        '</div>';
parseString(xml, function (err, result) {
    console.dir(JSON.stringify(result));
});