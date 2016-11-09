///<reference path="./d.ts" />
namespace ft {

    class PopupManager extends fmvc.Model<any> {
    }

    class PopupView extends fmvc.View {
    }

}

/*

    <input onkeydown='localkeydown'>
    </input>

    keydown()=> {

        var showP = target.value.length;

        showP => PopManager=>get('ui.List', link=>value->target.value, keyboard=>taget+popup ,
        { position: bottom,left, items: 10, model: app.dictionary.cities, function()=>model.filter(value); );

    }


 */

