///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />

var tm:ft.ITemplateManager = ft.templateManager;
var app = new fmvc.Facade('performanceApp', null, document.body);
var model = new fmvc.Model<IAppData>('scope', []);
var mediator = new fmvc.Mediator('mediator', document.getElementById('container'));

var countElements = 1000;
var interval = 50;

var range = _.range(countElements);

app.register(model, mediator);
model.data =  _.map(range, (v)=>Math.round(Math.random()*10000));


var CreateTemplateP = tm.createTemplate('ft.Paragraph', '<div .stateHandlers="hover" class="container"><div class="block block-{state.hover}">{data}</div></div>');
var CreateTemplate = tm.createTemplate('ft.Performance', '<div children.class="ft.Paragraph" children.data="{app.scope.d}"></div>');

var instance:ft.ITemplateView = CreateTemplate('defaultInstance');
instance.model = model;
mediator.addView(instance);

setInterval(function() {
    model.data =  _.map(range, (v)=>Math.round(Math.random()*10000));
    instance.invalidateApp();
    console.log('Update data');
}, interval);
