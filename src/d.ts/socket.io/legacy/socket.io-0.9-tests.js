var io = require('socket.io-0.9');
var socketManager = io.listen(80);
socketManager.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
// Storing data Associated to a client. 
// Server side sample 
io.listen(80).sockets.on('connection', function (socket) {
    socket.on('set nickname', function (name) {
        socket.set('nickname', name, function () { socket.emit('ready'); });
    });
    socket.on('msg', function () {
        socket.get('nickname', function (err, name) {
            console.log('Chat message by ', name);
        });
    });
});
//# sourceMappingURL=socket.io-0.9-tests.js.map