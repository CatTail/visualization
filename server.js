var http = require('http');
var io = require('socket.io').listen(8090);

io.sockets.on('connection', function (socket) {
  socket.on('user', function (data) {
    http.get('http://192.168.1.140:8888/user?uid='+data.uid, function(res) {
      console.log("Got response: " + res.statusCode);
      res.setEncoding('utf8')
      data = '';
      res.on('data', function (d) {
        data += d
      });
      res.on('end', function () {
        socket.emit('user', JSON.parse(data));
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });

  socket.on('micro', function (data) {
    http.get('http://192.168.1.140:8888/weibo?uid='+data.uid+'&mid='+data.mid, function(res) {
      console.log("Got response: " + res.statusCode);
      res.setEncoding('utf8')
      data = '';
      res.on('data', function (d) {
        data += d
      });
      res.on('end', function () {
        socket.emit('micro', JSON.parse(data));
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });
});
