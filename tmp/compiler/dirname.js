var path = require('path');
console.log(__dirname, path.resolve(__dirname));
console.log('dir main', path.dirname(require.main.filename));