///<reference path="d.ts" />


import ModelState = fmvc.ModelState;
declare var ui:any; // UI компоненты
ft.load(_.values(ui.def).filter((v:any)=>!!v && v.className));

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
                age: 33
            },

            changedUser: {
                name: 'VasyaMsk',
                age: 35
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
            '<div class="user">{app.user.data.name},{app.user.data.age}</div>' +
            '<h1>Balance:</h1>' +
            '<div class="balance">{app.user.settings.data.balance}</div>' +
            '<h1>Messages:</h1>' +
            '<div class="messagesState">{app.messages.state}</div>' +
            '<div class="messagesCount">{app.messages.count}</div>' +
            '</div>',
        },

        app:ft.App = null,
        user:fmvc.Model<any> = null,
        settings:fmvc.Model<any> = null,
        view:ft.TemplateView = null,
        messages:fmvc.ArrayModel<any> = null,
        mediator:fmvc.Mediator = null;

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
        console.log('User ', user);
        settings = new fmvc.Model('settings', data.settings);

        messages = new fmvc.ArrayModel<any>('messages', data.messages);
        messages.state = fmvc.ModelState.Synced;

        user.compose(settings);
        app.compose(user);
        app.compose(messages);

        assert(app.user instanceof fmvc.Model, 'App has dynamic model property user');
        assert(app.user.settings instanceof fmvc.Model, 'User model has settings model as property');

        //app.user.dispose();
        //assert(!app.user.settings, 'User has no model property settings');
    });

    it('Create view', function() {
        mediator = new fmvc.Mediator('main', document.getElementById('container'));
        app.register(mediator);

        view = ft.createInstance(TestViewDef.className, 'test');
        mediator.addView(view);

        assert(mediator.facade, 'Facade should exists');
        assert(mediator.getView('test'), 'View should exists');

    });


    it('Check view ', function() {
        view.validate();

        assert.strictEqual(getContentByClassName('user'), data.user.name + ',' + data.user.age, 'User data must be equal');
        assert.strictEqual(getContentByClassName('balance'), data.settings.balance.toString() , 'Balance must be equal');
        assert.strictEqual(getContentByClassName('messagesState'), fmvc.ModelState.Synced , 'Messages state must be equal');
        assert.strictEqual(getContentByClassName('messagesCount'), data.messages.length.toString() , 'Messages count must be equal');
    });

    it('Check view after change', function() {
        user.changes = data.changedUser;
        view.validate();
        assert.strictEqual(getContentByClassName('user'), data.changedUser.name + ',' + data.changedUser.age, 'Changed user data must be equal');
    });

    it('Check dispose composite model', function() {
        user.dispose();
        view.validate();
        assert.strictEqual(getContentByClassName('user'), '{facade.user.data.name},{facade.user.data.age}', 'Changed user data must be equal');

    });

    function getContentByClassName(value):string {
        var els:any[] = document.getElementsByClassName(value);
        return els&&els.length?(els[0].innerHTML):'';
    }


});
