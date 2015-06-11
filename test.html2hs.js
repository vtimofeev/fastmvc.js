var parser = require('html2hscript');
parser('<h1 {selected} cheked class="test test-{selected}">Hello World</h1>', function(err, hscript) {
    console.log(hscript);
});