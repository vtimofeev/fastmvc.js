////<reference path="../../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../../src/ft/d.ts" />


declare var ui:any; // UI компоненты
ft.load(_.values(ui.def).filter((v)=>!!v && v.className));

var expect = chai.expect,
    assert = <chai.Assert> chai.assert;



describe('app', function () {
    var opts = {
            name: 'GuiApplication',
            version: '1.0',
            type: 'gui',
            locale: 'ru',
            theme: 'default',
            i18n: {ru: {one: 'Один', two: 'Два'}, en: {one: 'One', two: 'Two'}}
        },

        data = {
            user: {
                name: 'Vasily',
                age: '33+'
            },
            settings: {
                balance: 100
            },
            messages: [
                {id: 0, text: 'Hello 0'},
                {id: 1, text: 'Hello 1'},
                {id: 2, text: 'Hello 2'},
            ]
        },

        TestViewDef = {
            className: 'app.TestView',
            content: '<div>' +
            '<h1>User:</h1>' +
            '<div>{app.user.data.name} {app.user.data.age}, balance: {app.user.settings.data.balance}</div>' +
            '<h1>Messages:</h1>' +
            '<div>{app.messages.state}</div>' +
            '<div>{app.messages.count}</div>' +
            '</div>',
        },

        app:ft.App = null,
        user:fmvc.Model<any> = null,
        settings:fmvc.Model<any> = null;

    before(function () {
        // Загружаем шаблон отображения
        ft.load(TestViewDef);
    });

    it('Application properties', function () {
        app = new ft.App(opts.name, document.getElementById('root'), opts.type, opts.theme, opts.locale, opts.i18n);

        assert.strictEqual(app.name, opts.name, 'Names must be equal');
        assert.strictEqual(app.type, opts.type, 'Types must be equal');
        assert.strictEqual(app.theme, opts.theme, 'Themes must be equal');
        assert.strictEqual(app.locale, opts.locale, 'Locales must be equal');
        assert.strictEqual(app.i18n, opts.i18n, 'I18n datas must be equal');


    });

    it('Manual compose/decompose models', function() {
        user = new fmvc.Model('user', data.user);
        settings = new fmvc.Model('settings', data.settings);

        user.compose(settings);
        app.compose(user);

        assert(app.user instanceof fmvc.Model, 'App has dynamic model property user');
        assert(app.user.settings instanceof fmvc.Model, 'User model has settings model as property');

        app.user.dispose();
        assert(!app.user.settings, 'User has no model property settings');
    })

});

/*
 describe('app', function () {
 // view
 var TestClassDef = {
 className: 'app.Test',
 content: '<div>' +
 '<h1>User:</h1>' +
 '<div>{app.user.data.name} {app.user.data.age}, balance: {app.user.settings.data.balance}</div>' +
 '<h1>Messages:</h1>' +
 '<div>{app.messages.state}</div>' +
 '<div>{app.messages.count}</div>' +
 '</div>',
 };
 ft.load(TestClassDef);

 // models
 var user = new fmvc.Model<any>('user', {
 name: 'Vasily',
 age: 34,
 email: 'wm-nn@mail.ru'
 });
 var settings = new fmvc.Model<any>('settings', { balance: 10 });
 var messages = new fmvc.ArrayStorageModel<any>('messages', []);

 var mediator = new fmvc.Mediator('default', document.getElementById('container'));

 var viewInstance:ft.TemplateView = ft.createInstance(TestClassDef.className, TestClassDef.className + '1');


 class TestApp extends fmvc.AppFacade {
 public initModels() {
 this.register(user, messages);
 }
 public initMediators() {
 this.register(mediator);
 mediator.addView(viewInstance);
 }
 }

 var app = new TestApp('theApp',  document.getElementById('container') );

 /*

 instance.model = model;
 instance.render(document.getElementById('container'));

 });
 */


