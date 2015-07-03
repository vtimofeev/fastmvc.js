require([
  /*'../js/require_2_1',*/
    '../src/fmvc/event.js',
    '../src/fmvc/notifier.js',
    '../src/fmvc/facade.js',
    '../src/fmvc/model.js',
    '../src/fmvc/model.list.js',
    '../src/fmvc/logger.js',
    '../src/fmvc/mediator.js',
    '../src/fmvc/view.js',
    '../src/fmvc/view.list.js',
    '../src/contrib/messageformat.js'
], function (r, $, $c, m, p, c, tv) { console.log('fmvc with message format loaded') });
