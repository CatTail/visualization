var io = require('socket.io').listen(8090);

io.sockets.on('connection', function (socket) {
  var chart = require('./assets/data/chart.json');
  var graph = require('./assets/data/graph.json');
  socket.emit('chart', chart);
  socket.on('graph', function (data) {
    console.log(data);
    socket.emit('graph', graph);
  });
});
