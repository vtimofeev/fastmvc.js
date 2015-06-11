/// <reference path="redis.d.ts" />
var redis = require('redis');
var value;
var valueArr;
var num;
var str;
var bool;
var err;
var args;
var options;
var client;
var info;
var resCallback;
var numCallback;
var strCallback;
var messageHandler;
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
bool = redis.debug_mode;
redis.print(err, value);
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
client = redis.createClient(num, str, options);
bool = client.connected;
num = client.retry_delay;
num = client.retry_backoff;
valueArr = client.command_queue;
valueArr = client.offline_queue;
info = client.server_info;
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
client.end();
// Connection (http://redis.io/commands#connection)
client.auth(str, resCallback);
client.ping(numCallback);
// Strings (http://redis.io/commands#strings)
client.append(str, str, numCallback);
client.bitcount(str, numCallback);
client.bitcount(str, num, num, numCallback);
client.set(str, str, strCallback);
client.get(str, strCallback);
client.exists(str, numCallback);
client.publish(str, value);
client.subscribe(str);
client.on(str, messageHandler);
client.once(str, messageHandler);
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// some of the bulk methods
client.get(args);
client.get(args, resCallback);
client.set(args);
client.set(args, resCallback);
client.incr(str, resCallback);
//# sourceMappingURL=redis-tests.js.map