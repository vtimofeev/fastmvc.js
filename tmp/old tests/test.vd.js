/*
<script src="../src/ft/template.state.js"></script>
    <script src="../src/ft/expression.js"></script>
    <script src="../src/ft/events/pointer.model.js"></script>
    <script src="../src/ft/events/event.dispatcher.js"></script>
    <script src="../src/ft/template.i.js"></script>
    <script src="../src/ft/template.js"></script>
    <script src="../src/ft/template.parser.js"></script>
    <script src="../src/ft/template.view.helper.js"></script>
    <script src="../src/ft/template.manager.js"></script>
    <script src="../src/ft/template.view.js"></script>
    <script src="../src/ft/template.view.children.js"></script>

*/
var mds = require('../build/ft.dev.js');
var ft = mds.ft;
var fmvc = mds.fmvc;
var document = mds.document;

var obj = {
    className: "ft.Button",
    content: '<div id="abcd" data-name="name-is-button" .base="button" .stateHandlers="hover,selected" onaction="buttonClick"  class="{state.base} {state.base}-{state.life} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{data&&(typeof data === "object")&&("title" in data)?data.title:(data?data:"")}</div>'
};

var tm = ft.templateManager;
var Class = tm.createClass(obj.className, obj.content);
var instance = tm.createInstance(obj.className, 'view-' + obj.className, { setStates: {base: 'btn', hover: true} });
//instance.data = "The button ";

var container = document.createElement('div');
instance.render(container);
var t = new Date().getTime();
for(var i = 0; i < 50000; i++) {
    instance.data = "The button " + i;
    instance.validate();
    var z = container.outerHtml;
    //console.log(container.outerHtml);
}
var te = new Date().getTime();
console.log(te - t, container.outerHtml);


