

var xml = '<f:style src="./userview.styl"/>' +
    '<div className="UserView" extend="fmvc.View" ' +
    ' createStates="hover,selected,disabled" ' +
    ' selected="{selected}" ' +
    ' style="background-color:blue;top:{top}px;"' +
    ' onkeydown="changeName" ' +
    ' class="userview userview-{selected} userview-{disabled} userview-{hover}">' +
    '<div>F: {data.firstname}</div>' +
    '<div>S: {data.secondname}</div>' +
    '<div>A: {data.age}</div>' +
    '<input type="text" value="{data.value}" onkeydown="changeValue" onkeyup="changeValue" />' +
    '<div link="close" class="close" states="hover,touch" style="background-color:red">{closeText}</div>' +
    '<!-- Comment -->' +
    '</div>';

var xml3 = '<div className="Test" extend="fmvc.View" ' +
    ' createStates="hover,selected,dragged" ' +
    ' checked="true" ' +
    ' selected="{selected}" ' +
    ' style="background-color:red;top:{left}px;"' +
    ' class="button button-{selected} {hover} button-{hover} button-red" ' +
    ' action="executeAction,changeState({!selected})">Start xml2js! {pizza} {hut} {pizza}' +

    '<div class="close" link="close"  style="left: {position.left}px; top: {position.top}px;" states="hover">{closeText}</div>' +
    'Medium xml2js!' +
    '<div class="close" link="close2" close-{hover}" states="{hover}">{closeText}</div>' +
    'End xml2js!' +
    '<fmvc.Button onAction="actionHandler">{l18n.delete()}</fmvc.Button>' +
    '<!-- Comment -->' +
    '</div>';

var xml2 = '<div' +
    ' link="element"' +
    ' createStates="hover,selected,dragged" ' +
    ' checked="true" ' +
    ' selected="{selected}" ' +
    ' class="button button-{selected} {hover} button-{hover}" ' +
    ' action="executeAction,changeState({!selected})">Start xml2js! {pizza}' +
    '</div>';


var globalDynamic = {};
var globalHandlers = {};



var domKeys = ['class', 'style', 'checked', 'selected', 'value'];
var allowedKeys = ['class', 'states', 'style', 'checked', 'selected', 'data', 'value'];
var eventKeys = ['onkeydown', 'onkeyup'];

function getDynamicObjectValues(key, value, delimiter) {
    if (!_.isString(value)) return value;
    var values = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
    var dynamic = null;
    var staticValues = null;

    _.each(values, function (v) {
        var matches = v.match(matchRegexp);
        if (matches && matches.length === 2) {
            var matchValue = matches[1];
            if (!dynamic) dynamic = {};
            if (!dynamic[matchValue]) dynamic[matchValue] = [v];
            else dynamic[matchValue].push(v);
        } else {
            if (!staticValues) staticValues = [];
            staticValues.push(v);
        }
    });

    if (dynamic) return {static: staticValues, dynamic: dynamic};
    return value;
}
function replacer(key, value) {
    //console.log(key, _.isString(value));
    if (key === 'raw') {
        return undefined;
    }
    else if (key === 'style') {
        return getDynamicObjectValues(key, value, ';');
    }
    else if (key === 'data') {
        return getDynamicObjectValues(key, value, null);
    }
    else if(key in eventKeys) {
        return { event: key.replace('on', null), value: value };
    }
    else {
        return (_.isString(value) && allowedKeys.indexOf(key) > -1 ) ? getDynamicObjectValues(key, value) : value;
    }
}


// { view data property /* 'data.firstname' */ : { element path /* '0.1.0' */ : text data /* '{data.firstname} super man' */ }
var totalDynamic = {};
var links = [];



var parser = new htmlparser.Parser(handler, {strict: false});
parser.parseComplete(xml);
var resultHtmlJs = JSON.parse(JSON.stringify(handler.dom, replacer, '\t'));
var rootDomNode = null;
var styleNode = null;

_.each(resultHtmlJs, function(value, index) {
    if(value.type === 'tag' && value.name.indexOf('f:') === -1) {
        rootDomNode = value;
    }
    else if(value.name === 'f:style') {
        styleNode = value;
    }
});

console.log(resultHtmlJs);


parseJsNode(rootDomNode, 0);



console.log('Total dynamic ', totalDynamic);

var templates = ['node.ts.dust'];

async.series([function (cb) {
        dir.readFiles(__dirname,
            {
                match: /.ts.dust$/,
                exclude: /^\./,
                recursive: false
            }, function (err, content, filename, next) {
                if (err) throw err;
                var base = path.basename(filename);
                console.log('Compile ', filename, base);
                dust.loadSource(dust.compile(content, base, true));
                next();
            },
            function (err, files) {
                if (err) throw err;
                cb(err, null);
            })
    }, function(cb) {
        if(!styleNode) cb(null, null);
        var stylusSrc = fs.readFileSync(path.normalize(styleNode.attribs.src), 'utf8');
        stylus(stylusSrc, {compress: true})
            .render(function(err, css){
                if (err) throw err;
                styleNode.data = css;
                console.log('Css of stylus : ' + css);
                cb(err, css);
            });
    }
    ],
    function (err, result) {
        if (err) return 'Cant render dust cause errors';
        dust.render('object.ts.dust', {
            data: rootDomNode,
            links: links,
            css: styleNode?styleNode.data:null,
            dynamic: JSON.stringify(totalDynamic),
            dataString: JSON.stringify(rootDomNode)
        }, function (e, result) {
            var reformated = beautify.js_beautify(result, {"max_preserve_newlines": 2});
            //console.log(reformated);
            fs.writeFile(__dirname + '/tmp/result.ts', reformated, function (e, result) {
            });

        });
    }
);
